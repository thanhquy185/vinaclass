<?php

namespace App\Services;

use App\Jobs\SubmitTestJob;
use App\Models\CourseGroup;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\User;
use DateTime;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ExamAttemptService
{
    private ExamAttemptLogService $examAttemptLogService;
    private ExamAttemptAnswerService $examAttemptAnswerService;
    private ExamService $examService;
    private QuestionService $questionService;
    private ExamQuestionService $examQuestionService;

    public function __construct(
        ExamAttemptLogService $examAttemptLogService,
        ExamAttemptAnswerService $examAttemptAnswerService,
        ExamService $examService,
        QuestionService $questionService,
        ExamQuestionService $examQuestionService
    ) {
        $this->examAttemptLogService = $examAttemptLogService;
        $this->examAttemptAnswerService = $examAttemptAnswerService;
        $this->examService = $examService;
        $this->questionService = $questionService;
        $this->examQuestionService = $examQuestionService;
    }

    public function getAll()
    {
        return ExamAttempt::all();
    }

    public function getOne(ExamAttempt $examAttempt)
    {
        return $this->reviewResultById($examAttempt->id);
    }

    public function add(array $data)
    {
        return ExamAttempt::create($data);
    }

    public function update(array $data, ExamAttempt $examAttempt)
    {
        $examAttempt->update($data);
        return $examAttempt;
    }

    public function updateById(array $data, int $examAttemptId)
    {
        $examAttempt = ExamAttempt::findOrFail($examAttemptId);
        return $examAttempt->update($data);
    }

    public function delete(ExamAttempt $examAttempt)
    {
        return $examAttempt->delete();
    }

    public function startTest(array $data)
    {
        $studentId = $data["student_id"];
        $examId = $data["exam_id"];

        $exam = $this->examService->getById($examId);

        // Create ExamAttempt
        $examAttemptData = [
            "student_id" => $studentId,
            "exam_id"    => $examId,
            "start_time" => Date::now(),
        ];

        $examAttempt = ExamAttempt::create($examAttemptData);

        // Create ExamAttemptLog
        $examAttemptLogs = [
            "exam_attempt_id"  => $examAttempt->id,
            "tab_switch_count" => 0,
        ];
        $this->examAttemptLogService->add($examAttemptLogs);

        // Create examAttemptAnswers
        $questions = $this->examService->getQuestions($examId);

        $examAttemptAnswers = $questions->map(function ($item) use ($examAttempt) {
            return [
                "exam_attempt_id" => $examAttempt->id,
                "question_id"     => $item->id
            ];
        });

        $startTime = Date::now();
        $doTestTime = $exam->duration_minutes;
        $endTime = $exam->end_time;

        $duration = $this->calculateDuration($startTime, $endTime, $doTestTime) * 60;

        Log::info("Duration: $duration");
        Log::info("Start time: $startTime");
        Log::info("End time: $endTime");

        $this->setAutoSubmit($examAttempt->id, $duration);

        return DB::transaction(function () use ($examAttemptAnswers, $examAttempt) {
            $this->examAttemptAnswerService->addManyNonTrans($examAttemptAnswers);
            return $examAttempt;
        });
    }

    public function calculateDuration(DateTime $startTime, DateTime $endTime, int $doTestTime): float
    {
        $expectedEnd = clone $startTime;
        $expectedEnd->modify("+{$doTestTime} minutes");

        if ($expectedEnd <= $endTime) {
            return $doTestTime;
        }

        return ($endTime->getTimestamp() - $startTime->getTimestamp()) / 60;
    }

    //trường hợp front-end mất mạng không gửi request submit => backend tự động submit, chặn submit lại
    public function setAutoSubmit(int $examAttemptId, int $sec)
    {
        $sec += 10; // đợi 10s nếu frontend không gửi thì submit tự động
        SubmitTestJob::dispatch($examAttemptId)->delay(now()->addSecond($sec));
    }

    public function updateStudentTest(array $data, ExamAttempt $examAttempt)
    {
        $answers = $data['answers'];

        $examAttemptAnswers = collect($answers)->map(function ($item) use ($examAttempt) {
            $questionId = $item['question_id']; // Rule: cauHoiId -> question_id
            $question = $this->questionService->getById($questionId);
            return $this->getAnswer($item, $examAttempt, $question);
        });

        DB::transaction(function () use ($examAttemptAnswers) {
            $this->examAttemptAnswerService->updateBatch($examAttemptAnswers->toArray());
        });
    }

    public function getAnswer(array $data, ExamAttempt $examAttempt, Question $question)
    {
        $answerId = $data['answer_id'];

        // Verify answer belongs to question and is correct
        $answers = $this->questionService->getAnswers($question->id);

        $isSelectedCorrect = $answers->contains(function ($item) use ($answerId) {
            return ($answerId == $item->id && $item->is_correct_answer);
        });

        $score = 0;
        if ($isSelectedCorrect) {
            $examQuestion = $this->examQuestionService->getByExamAndQuestion($examAttempt->exam_id, $question->id);
            $score = $examQuestion->score;
        }

        $examAttemptDetail = [
            "exam_attempt_id"    => $examAttempt->id,
            "question_id"        => $question->id,
            "answer_id"          => $answerId,
            "is_selected_correct" => $isSelectedCorrect,
            "score"              => $score,
        ];

        return $examAttemptDetail;
    }

    public function submitTest(array $data, int $examAttemptId)
    {
        return DB::transaction(function () use ($data, $examAttemptId) {
            $examAttempt = ExamAttempt::findOrFail($examAttemptId);

            // Prevent duplicate submissions
            if ($examAttempt->status == "SUBMITTED") {
                throw new HttpException(500, "Test has already been submitted!");
            }

            $this->updateStudentTest($data, $examAttempt); // Final update

            // Calculate score
            $examAttempt->load('examAttemptAnswers');

            $correctAnswerCount = $examAttempt->examAttemptAnswers->reduce(function ($carry, $item) {
                if ($item->is_selected_correct) {
                    return $carry + 1;
                }
                return $carry;
            }, 0);

            $totalScore = $examAttempt->examAttemptAnswers->reduce(function ($carry, $item) {
                return $carry + ($item->score ?? 0);
            }, 0);

            // Update status
            $dataUpdate = [
                "submission_time"      => Date::now(),
                "total_score"          => $totalScore,
                "correct_answer_count" => $correctAnswerCount,
                "status"               => "SUBMITTED"
            ];

            $this->updateById($dataUpdate, $examAttempt->id);
            return $this->reviewResultById($examAttempt->id);
        });
    }

    public function reviewResult(ExamAttempt $examAttempt)
    {
        if ($examAttempt->status != "SUBMITTED") {
            throw new HttpException(500, "Test has not been submitted yet");
        }
        $examAttempt->load("examAttemptLogs");

        // Check configuration
        $exam = $examAttempt->exam;
        $exam->loadCount([
            'questions as total_questions'
        ]);

        $examConfiguration = $exam->examConfiguration;
        $questions = $exam->questions;

        $questions->load('answers');

        $examAttemptAnswers = $examAttempt->examAttemptAnswers;

        $examAttempt->makeHidden('exam');
        $examAttempt->makeHidden('examAttemptAnswers');
        $exam->makeHidden('examConfiguration');
        $exam->makeHidden('questions');

        $detailMap = $examAttemptAnswers->keyBy('question_id');

        $questions->transform(function ($question) use ($detailMap) {
            $detail = $detailMap->get($question->id);
            if (!$detail) {
                throw new HttpException(500, "Question data is invalid or student has not attempted this question");
            }
            $question->selected_answer = $detail->answer_id;

            return $question;
        });

        $data = [
            "examAttempt" => $examAttempt,
            "exam"        => $exam,
            "questions"   => $questions,
        ];

        return $data;
    }

    public function reviewResultById(int $examAttemptId)
    {
        try {
            $examAttempt = ExamAttempt::findOrFail($examAttemptId);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Exam attempt not found'
            ], 404);
        }

        if ($examAttempt->status != "SUBMITTED") {
            throw new HttpException(500, "Test has not been submitted yet");
        }

        $examAttempt->load("examAttemptLogs");

        // Check configuration
        $exam = $examAttempt->exam;
        $exam->loadCount([
            'questions as total_questions'
        ]);

        $examConfiguration = $exam->examConfiguration;
        $questions = $exam->questions;

        $questions->load('answers');

        $examAttemptAnswers = $examAttempt->examAttemptAnswers;

        $examAttempt->makeHidden('exam');
        $examAttempt->makeHidden('examAttemptAnswers');
        $exam->makeHidden('examConfiguration');
        $exam->makeHidden('questions');

        $detailMap = $examAttemptAnswers->keyBy('question_id');

        $questions->transform(function ($question) use ($detailMap) {
            $detail = $detailMap->get($question->id);
            if (!$detail) {
                throw new HttpException(500, "Question data is invalid or student has not attempted this question");
            }
            $question->selected_answer = $detail->answer_id;

            return $question;
        });

        $data = [
            "examAttempt" => $examAttempt,
            "exam"        => $exam,
            "questions"   => $questions,
        ];

        return $data;
    }

    public function reviewResultByIdNonCheckStatus(int $examAttemptId)
    {
        try {
            $examAttempt = ExamAttempt::findOrFail($examAttemptId);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Exam attempt not found'
            ], 404);
        }

        $examAttempt->load("examAttemptLogs");

        $exam = $examAttempt->exam;
        $exam->loadCount([
            'questions as total_questions'
        ]);

        $questions = $exam->questions;

        $questions->load('answers');
        $examAttemptAnswers = $examAttempt->examAttemptAnswers;

        $examAttempt->makeHidden('exam');
        $examAttempt->makeHidden('examAttemptAnswers');
        $exam->makeHidden('examConfiguration');
        $exam->makeHidden('questions');

        $detailMap = $examAttemptAnswers->keyBy('question_id');

        $questions->transform(function ($question) use ($detailMap) {
            $detail = $detailMap->get($question->id);
            if (!$detail) {
                $question->selected_answer = null;
            } else {
                $question->selected_answer = $detail->answer_id;
            }

            return $question;
        });

        $data = [
            "examAttempt" => $examAttempt,
            "exam"        => $exam,
            "questions"   => $questions,
        ];

        return $data;
    }

    public function getOfStudent(User $user)
    {
        // Get all exam attempts for the student
        $data = $user->load('examAttempts.exam'); // NOTE: baiLams.deThi -> examAttempts.exam
        return $data;
    }
    //bài làm theo nhóm học phần, theo user 
    public function getByCourseGroupAndStudent(CourseGroup $courseGroup, User $user)
    {
        $courseGroup->load([
            'exams.attempts' => function ($query) use ($user) {
                $query->where('student_id', $user->id)
                    ->orderByDesc('created_at');
            }
        ]);

        $courseGroup->exams->each(function ($exam) {
            // Get the latest attempt
            $exam->attempt = $exam->attempts->first() ?? null;

            $exam->makeHidden("attempts");
        });

        return $courseGroup;
    }

    public function getOfCourseGroupAndExam(CourseGroup $courseGroup, Exam $exam)
    {
        $examAttempts = ExamAttempt::where('exam_id', $exam->id)
            ->whereHas('user.courseGroups', function ($query) use ($courseGroup) { // NOTE: Relation courseGroups() trên User
                $query->where('course_groups.id', $courseGroup->id);
            })
            ->get();

        $examAttempts->load(["examAttemptLogs", "examAttemptAnswers"]);
        $exam->loadCount([
            'questions as total_questions'
        ]);

        $exam->load([
            'questions.answers'
        ]);
        $questions = $exam->questions;

        $result = $examAttempts->map(function ($examAttempt) use ($questions) {
            $examAttemptAnswers = $examAttempt->examAttemptAnswers;

            $answerMap = $examAttemptAnswers->keyBy('question_id');

            $questionsClone = $questions->map(function ($question) use ($answerMap) {
                $questionClone = clone $question;
                $answer = $answerMap->get($questionClone->id);

                $questionClone->selected_answer = $answer ? $answer->answer_option_id : null;

                return $questionClone;
            });

            $examAttempt->makeHidden('examAttemptAnswers');

            return [
                "examAttempt" => $examAttempt,
                "questions"   => $questionsClone
            ];
        });

        $exam->makeHidden('examConfiguration');
        $exam->makeHidden('questions');

        return [
            "exam"         => $exam,
            "examAttempts" => $result
        ];
    }
}
