<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamAssignment;
use App\Models\User;

class ExamUpdateRelationsSynchronizer
{
    public function __construct(
        private ExamAssignmentService $examAssignmentService,
        private ExamQuestionService $examQuestionService,
        private ExamConfigurationService $examConfigurationService
    ) {
    }

    public function sync(array $data, Exam $exam, ExamUpdatePlan $updatePlan, User $actor): void
    {
        $this->syncCourseGroupAssignments(
            $data,
            $exam,
            $updatePlan->courseGroupAssignmentsChanged,
            $updatePlan->scheduleChanged
        );
        $this->syncExamQuestions($data, $exam);
        $this->syncExamConfiguration($data, $exam, $actor);
    }

    private function syncCourseGroupAssignments(
        array $data,
        Exam $exam,
        bool $assignmentsChanged,
        bool $scheduleChanged
    ): void {
        if (array_key_exists('course_group_ids', $data) && $assignmentsChanged) {
            $this->examAssignmentService->deleteByExamId($exam->id);
            $assignments = collect($data['course_group_ids'])->map(function ($courseGroupId) use ($exam) {
                return [
                    'exam_id' => $exam->id,
                    'course_group_id' => $courseGroupId,
                    'start_time' => $exam->start_time,
                    'end_time' => $exam->end_time,
                ];
            });

            $this->examAssignmentService->addArr($assignments->toArray());

            return;
        }

        if ($scheduleChanged) {
            ExamAssignment::query()
                ->where('exam_id', $exam->id)
                ->update([
                    'start_time' => $exam->start_time,
                    'end_time' => $exam->end_time,
                ]);
        }
    }

    private function syncExamQuestions(array $data, Exam $exam): void
    {
        if (!isset($data['questions'])) {
            return;
        }

        $questions = collect($data['questions'])->map(function ($question) use ($exam) {
            return [
                'exam_id' => $exam->id,
                'question_id' => $question['id'],
                'question_order' => $question['order'],
                'score' => $question['score'],
            ];
        });

        $this->examQuestionService->syncForExam($exam->id, $questions->toArray());
    }

    private function syncExamConfiguration(array $data, Exam $exam, User $actor): void
    {
        if (!isset($data['configuration'])) {
            return;
        }

        $configurationData = $data['configuration'];
        $configurationData['exam_id'] = $exam->id;
        $configuration = $this->examConfigurationService->findByExamId($exam->id);

        if ($configuration) {
            $this->examConfigurationService->update($configuration, $configurationData, $actor);
            return;
        }

        $this->examConfigurationService->create($configurationData, $actor, 'update');
    }
}
