<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Exam;
use App\Models\Subject;
use App\Models\User;
use App\Policies\ExamPolicy;
use Illuminate\Support\Facades\DB;

class ExamCreationService
{
    public function __construct(
        private ExamAssignmentService $examAssignmentService,
        private ExamQuestionSelectionService $examQuestionSelectionService,
        private ExamMutationValidator $examMutationValidator,
        private ExamQuestionService $examQuestionService,
        private ExamConfigurationService $examConfigurationService,
        private ExamPolicy $examPolicy
    ) {
    }

    public function add(array $data, User $creator)
    {
        $creatorId = (int) $creator->id;

        return DB::transaction(function () use ($data, $creatorId) {
            $creator = $this->lockCreator($creatorId);

            if (!$this->examPolicy->create($creator)) {
                throw new BusinessException('Bạn không có quyền tạo đề thi.', 403);
            }

            $subjectId = (int) $data['subject_id'];
            $this->lockActiveSubject($subjectId);
            $data['creator_id'] = $creator->id;
            $isAdmin = $creator->hasRoleCode('ADMIN') || $creator->isCustomRole();

            if (!empty($data['course_group_ids'])) {
                $this->examMutationValidator->assertCanAssignCourseGroups($creator);
            }

            if (!$isAdmin && !$creator->assignedSubjects->contains('id', $subjectId)) {
                throw new BusinessException('Giảng viên chưa được phân công học phần này', 403);
            }

            $questionIds = collect($data['questions'])
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->unique();
            $this->examMutationValidator->validateExamQuestions(
                $questionIds,
                $subjectId,
                $creator,
                $isAdmin
            );

            if (!empty($data['course_group_ids'])) {
                $this->examMutationValidator->validateCourseGroups(
                    $data['course_group_ids'],
                    $subjectId,
                    $creator->id,
                    $isAdmin
                );
            }

            $exam = Exam::create([
                'exam_name' => $data['exam_name'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'duration_minutes' => $data['duration_minutes'],
                'creator_id' => $data['creator_id'],
                'subject_id' => $subjectId,
            ]);

            $examAssignments = collect($data['course_group_ids'])->map(fn ($courseGroupId) => [
                'exam_id' => $exam->id,
                'course_group_id' => $courseGroupId,
                'start_time' => $exam->start_time,
                'end_time' => $exam->end_time,
            ]);

            $examQuestions = collect($data['questions'])->map(fn ($question) => [
                'exam_id' => $exam->id,
                'question_id' => $question['id'],
                'question_order' => $question['order'],
                'score' => $question['score'],
            ]);

            $this->examAssignmentService->addArr($examAssignments->toArray());
            $this->examQuestionService->addArr($examQuestions->toArray());

            $configuration = $data['configuration'];
            $configuration['exam_id'] = $exam->id;
            $this->examConfigurationService->create($configuration, $creator);

            return $this->loadExamDetails($exam);
        });
    }

    public function generateByFilter(array $data, User $creator)
    {
        $creatorId = (int) $creator->id;

        return DB::transaction(function () use ($data, $creatorId) {
            $creator = $this->lockCreator($creatorId);
            $courseGroupIds = array_values(array_unique($data['course_group_ids'] ?? []));

            if (!$this->examPolicy->create($creator)) {
                throw new BusinessException('Bạn không có quyền tạo đề thi.', 403);
            }

            $subjectId = (int) $data['subject_id'];
            $this->lockActiveSubject($subjectId);
            $data['creator_id'] = $creator->id;
            $isAdmin = $creator->hasRoleCode('ADMIN') || $creator->isCustomRole();
            $allowedSubjectIds = $this->examMutationValidator->getAllowedSubjectIds($creator, $isAdmin);

            if (!in_array($subjectId, $allowedSubjectIds, true)) {
                throw new BusinessException('You do not have permission to create exams for this subject', 403);
            }

            if ($courseGroupIds !== []) {
                $this->examMutationValidator->assertCanAssignCourseGroups($creator);
                $this->examMutationValidator->validateCourseGroups(
                    $courseGroupIds,
                    $subjectId,
                    $creator->id,
                    $isAdmin
                );
            }

            $selectedQuestions = $this->examQuestionSelectionService->selectByFilters(
                $subjectId,
                $data['chapter_ids'] ?? [],
                $data['difficulty_filters'],
                $creator,
                $isAdmin
            );

            // Keep source questions stable between final validation and exam-question linking.
            $this->examMutationValidator->validateExamQuestions(
                $selectedQuestions->pluck('id'),
                $subjectId,
                $creator,
                $isAdmin
            );

            $questionCount = $selectedQuestions->count();
            $baseScoreCents = intdiv(1000, $questionCount);
            $remainingScoreCents = 1000 % $questionCount;

            $exam = Exam::create([
                'exam_name' => $data['exam_name'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'duration_minutes' => $data['duration_minutes'],
                'creator_id' => $data['creator_id'],
                'subject_id' => $subjectId,
            ]);

            $examAssignments = collect($courseGroupIds)->map(fn ($courseGroupId) => [
                'exam_id' => $exam->id,
                'course_group_id' => $courseGroupId,
                'start_time' => $exam->start_time,
                'end_time' => $exam->end_time,
            ]);

            $examQuestions = $selectedQuestions->values()->map(
                function ($question, $index) use ($exam, $baseScoreCents, $remainingScoreCents) {
                    $scoreCents = $baseScoreCents + ($index < $remainingScoreCents ? 1 : 0);

                    return [
                        'exam_id' => $exam->id,
                        'question_id' => $question->id,
                        'question_order' => $index + 1,
                        'score' => $scoreCents / 100,
                    ];
                }
            );

            if ($examAssignments->isNotEmpty()) {
                $this->examAssignmentService->addArr($examAssignments->toArray());
            }
            $this->examQuestionService->addArr($examQuestions->toArray());

            $configuration = $data['configuration'];
            $configuration['exam_id'] = $exam->id;
            $this->examConfigurationService->create($configuration, $creator);

            return $this->loadExamDetails($exam);
        });
    }

    private function loadExamDetails(Exam $exam): Exam
    {
        $exam->load(['questions', 'subject', 'courseGroups', 'examConfiguration']);
        $exam->questions->load('answerOptions');

        return $exam;
    }

    private function lockCreator(int $creatorId): User
    {
        return User::query()
            ->with(['role', 'assignedSubjects'])
            ->lockForUpdate()
            ->findOrFail($creatorId);
    }

    private function lockActiveSubject(int $subjectId): Subject
    {
        return Subject::query()
            ->where('is_deleted', false)
            ->lockForUpdate()
            ->findOrFail($subjectId);
    }
}
