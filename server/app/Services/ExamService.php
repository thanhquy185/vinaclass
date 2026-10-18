<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\CourseGroup;
use App\Models\Difficulty;
use App\Models\Exam;
use App\Models\ExamAssignment;
use App\Models\ExamAttempt;
use App\Models\ExamConfiguration;
use App\Models\ExamQuestion;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class ExamService
{
    protected ExamAssignmentService $examAssignmentService;
    protected ExamQuestionService $examQuestionService;
    protected ExamConfigurationService $examConfigurationService;

    public function __construct(
        ExamAssignmentService $examAssignmentService,
        ExamQuestionService $examQuestionService,
        ExamConfigurationService $examConfigurationService
    ) {
        $this->examAssignmentService = $examAssignmentService;
        $this->examQuestionService = $examQuestionService;
        $this->examConfigurationService = $examConfigurationService;
    }

    public function getAll()
    {
        return Exam::all()->load(['subject', 'courseGroups']);
    }

    public function getOne(Exam $exam)
    {
        $exam->load('questions');
        $exam->questions->load('answers');
        return $exam;
    }

    public function getById(int $id)
    {
        return Exam::findOrFail($id);
    }

    public function add(array $data)
    {
        return DB::transaction(function () use ($data) {
            $examData = [
                "exam_name"        => $data["exam_name"],
                "start_time"       => $data["start_time"],
                "end_time"         => $data["end_time"],
                "duration_minutes" => $data["duration_minutes"],
                "creator_id"       => $data["creator_id"],
                "subject_id"       => $data["subject_id"],
            ];

            $exam = Exam::create($examData);

            $courseGroupIds = $data["course_group_ids"];
            $questions = $data["questions"];

            $examAssignments = collect($courseGroupIds)->map(function ($item) use ($exam) {
                return [
                    "exam_id"         => $exam->id,
                    "course_group_id" => $item,
                    "start_time"      => $exam->start_time,
                    "end_time"        => $exam->end_time,
                ];
            });

            $examQuestions = collect($questions)->map(function ($item) use ($exam) {
                return [
                    "exam_id"        => $exam->id,
                    "question_id"    => $item["id"],
                    "question_order" => $item["order"],
                    "score"          => $item["score"]
                ];
            });

            $this->examAssignmentService->addArr($examAssignments->toArray());
            $this->examQuestionService->addArr($examQuestions->toArray());

            $configuration = $data["configuration"];
            $configuration["exam_id"] = $exam->id;

            $this->examConfigurationService->create($configuration);

            $exam->load(['questions', 'subject', 'courseGroups', 'configuration']);
            $exam->questions->load('answers');

            return $exam;
        });
    }

    public function generateByFilter(array $data)
    {
        return DB::transaction(function () use ($data) {
            $courseGroupIds = array_values(array_unique($data['course_group_ids'] ?? []));

            $creator = User::query()
                ->with(['role', 'subjects'])
                ->findOrFail($data['creator_id']);

            $roleName = strtolower((string) optional($creator->role)->role_name);
            $isAdmin = $roleName === 'admin';
            $isTeacher = $roleName === 'teacher';

            if (!$isAdmin && !$isTeacher) {
                throw new BusinessException('Only administrators or teachers can generate random exams', 403);
            }

            $allowedSubjectIds = $this->getAllowedSubjectIds($creator, $isAdmin);
            if (!in_array((int) $data['subject_id'], $allowedSubjectIds, true)) {
                throw new BusinessException('You do not have permission to create exams for this subject', 403);
            }

            if (!empty($courseGroupIds)) {
                $this->validateCourseGroups($courseGroupIds, (int) $data['subject_id'], $creator->id, $isAdmin);
            }

            $chapterIds = array_values(array_unique($data['chapter_ids'] ?? []));
            if (!empty($chapterIds)) {
                $validChapterCount = DB::table('chapters')
                    ->whereIn('id', $chapterIds)
                    ->where('subject_id', $data['subject_id'])
                    ->where('is_deleted', false)
                    ->count();

                if ($validChapterCount !== count($chapterIds)) {
                    throw new BusinessException('Selected chapters are invalid for the chosen subject', 422);
                }
            }

            $difficultyFilters = collect($data['difficulty_filters'])
                ->groupBy('difficulty_id')
                ->map(function ($items) {
                    return (int) collect($items)->sum('question_count');
                })
                ->filter(function ($count) {
                    return $count > 0;
                });

            if ($difficultyFilters->isEmpty()) {
                throw new BusinessException('Invalid difficulty configuration, each level must have a question count greater than 0', 422);
            }

            $selectedQuestions = collect();

            foreach ($difficultyFilters as $difficultyId => $questionCount) {
                $query = Question::query()
                    ->where('is_deleted', false)
                    ->where('status', '!=', 'archive')
                    ->where('subject_id', $data['subject_id'])
                    ->where('difficulty_id', (int) $difficultyId);

                if (!empty($chapterIds)) {
                    $query->whereIn('chapter_id', $chapterIds);
                }

                if (!$isAdmin) {
                    $query->where(function (Builder $inner) use ($creator) {
                        $inner->where('status', 'public')
                            ->orWhere('creator_id', $creator->id);
                    });
                }

                $questionsByDifficulty = $query
                    ->inRandomOrder()
                    ->limit($questionCount)
                    ->get();

                if ($questionsByDifficulty->count() < $questionCount) {
                    $difficulty = Difficulty::query()->find($difficultyId);
                    $difficultyName = $difficulty?->difficulty_name ?? ('ID ' . $difficultyId);
                    throw new BusinessException('Not enough questions for difficulty level: ' . $difficultyName, 422);
                }

                $selectedQuestions = $selectedQuestions->concat($questionsByDifficulty);
            }

            $selectedQuestions = $selectedQuestions
                ->shuffle()
                ->values();

            if ($selectedQuestions->isEmpty()) {
                throw new BusinessException('No questions matched the selected filters', 422);
            }

            $exam = Exam::create([
                'exam_name'        => $data['exam_name'],
                'start_time'       => $data['start_time'],
                'end_time'         => $data['end_time'],
                'duration_minutes' => $data['duration_minutes'],
                'creator_id'       => $data['creator_id'],
                'subject_id'       => $data['subject_id'],
            ]);

            $examAssignments = collect($courseGroupIds)->map(function ($courseGroupId) use ($exam) {
                return [
                    'exam_id'         => $exam->id,
                    'course_group_id' => $courseGroupId,
                    'start_time'      => $exam->start_time,
                    'end_time'        => $exam->end_time,
                ];
            });

            $examQuestions = $selectedQuestions->values()->map(function ($question, $index) use ($exam) {
                return [
                    'exam_id'        => $exam->id,
                    'question_id'    => $question->id,
                    'question_order' => $index + 1,
                    'score'          => $question->default_score ?? 1,
                ];
            });

            if ($examAssignments->isNotEmpty()) {
                $this->examAssignmentService->addArr($examAssignments->toArray());
            }
            $this->examQuestionService->addArr($examQuestions->toArray());

            $configuration = $data['configuration'];
            $configuration['exam_id'] = $exam->id;
            $this->examConfigurationService->create($configuration);

            $exam->load(['questions', 'subject', 'courseGroups', 'configuration']);
            $exam->questions->load('answers');

            return $exam;
        });
    }

    public function update(array $data, Exam $exam)
    {
        return DB::transaction(function () use ($data, $exam) {
            // 1. Update Exam
            $exam->update($data);

            /*
        =========================
        2. Xử lý nhóm học phần
        =========================
        */
            if (isset($data['course_group_ids'])) {
                // Delete old records
                $this->examAssignmentService->deleteByExamId($exam->id);

                // Create new records
                $examAssignments = collect($data['course_group_ids'])->map(function ($item) use ($exam) {
                    return [
                        "exam_id"         => $exam->id,
                        "course_group_id" => $item,
                        "start_time"      => $exam->start_time,
                        "end_time"        => $exam->end_time,
                    ];
                });

                $this->examAssignmentService->addArr($examAssignments->toArray());
            }

            /*
        =========================
        3. Xử lý câu hỏi
        =========================
        */
            if (isset($data['questions'])) {
                // Delete old records
                $this->examQuestionService->deleteByExamId($exam->id);

                // Create new records
                $examQuestions = collect($data['questions'])->map(function ($item) use ($exam) {
                    return [
                        "exam_id"        => $exam->id,
                        "question_id"    => $item["id"],
                        "question_order" => $item["order"],
                        "score"          => $item["score"]
                    ];
                });

                $this->examQuestionService->addArr($examQuestions->toArray());
            }

            /*
        =========================
        4. Xử lý cấu hình
        =========================
        */
            if (isset($data['configuration'])) {
                $configurationData = $data['configuration'];
                $configurationData['exam_id'] = $exam->id;

                $configuration = $this->examConfigurationService->findByExamId($exam->id);

                if ($configuration) {
                    $this->examConfigurationService->update($configuration, $configurationData);
                } else {
                    $this->examConfigurationService->create($configurationData);
                }
            }

            /*
        =========================
        5. Load lại dữ liệu
        =========================
        */
            $exam->load(['questions', 'subject', 'courseGroups', 'configuration']);
            $exam->questions->load('answers');

            return $exam;
        });
    }

    public function delete(int $examId)
    {
        return DB::transaction(function () use ($examId) {

            $exam = Exam::findOrFail($examId);

            $hasAttempt = ExamAttempt::where('exam_id', $examId)->exists();

            // Soft delete
            if ($hasAttempt) {
                $exam->update([
                    'is_deleted' => true
                ]);

                return true;
            }

            // Hard delete
            // 1. Delete configuration
            ExamConfiguration::where('exam_id', $examId)->delete();

            // 2. Delete exam details (questions)
            ExamQuestion::where('exam_id', $examId)->delete();

            // 3. Delete exam assignments
            ExamAssignment::where('exam_id', $examId)->delete();

            // 4. Delete exam
            $exam->delete();

            return true;
        });
    }

    public function getOfStudent(User $user)
    {
        // Get all exams assigned to the student
        $user->load('courseGroups.exams');

        // Map and extract nested exams into a single collection
        $exams = $user->courseGroups->flatMap(
            function ($courseGroup) {
                return $courseGroup->exams->load('subject');
            }
        )->unique('id')->values(); // Prevent duplicate exams assigned to multiple groups

        return $exams;
    }

    public function getQuestions(int $examId)
    {
        $exam = Exam::findOrFail($examId);
        $exam->load('questions');
        return $exam->questions;
    }

    public function getExamDetails(Exam $exam)
    {
        $exam->load(['questions', 'subject', 'courseGroups', 'configuration']);
        $exam->questions->load('answers');
        return $exam;
    }

    private function getAllowedSubjectIds(User $creator, bool $isAdmin): array
    {
        if ($isAdmin) {
            return Subject::query()
                ->where('is_deleted', false)
                ->pluck('id')
                ->map(function ($id) {
                    return (int) $id;
                })
                ->all();
        }

        return $creator->subjects
            ->pluck('id')
            ->map(function ($id) {
                return (int) $id;
            })
            ->all();
    }

    private function validateCourseGroups(array $courseGroupIds, int $subjectId, int $creatorId, bool $isAdmin): void
    {
        $query = CourseGroup::query()
            ->whereIn('id', $courseGroupIds)
            ->where('subject_id', $subjectId)
            ->where('is_deleted', false);

        if (!$isAdmin) {
            $query->where('teacher_id', $creatorId);
        }

        $validCount = $query->count();
        if ($validCount !== count(array_unique($courseGroupIds))) {
            throw new BusinessException('Course groups list is invalid or not under your management', 422);
        }
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
            // Get the most recent attempt
            $exam->attempt = $exam->attempts->first() ?? null;

            $exam->makeHidden("examAttempts");
        });

        return $courseGroup;
    }
}
