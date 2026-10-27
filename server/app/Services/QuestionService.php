<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Chapter;
use App\Models\ExamAttemptAnswer;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use App\Policies\QuestionPolicy;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class QuestionService
{
    public function __construct(
        private QuestionPolicy $questionPolicy,
        private QuestionQueryService $questionQueryService,
        private QuestionAnswerSynchronizer $questionAnswerSynchronizer
    ) {
    }

    public function add(array $data, User $actor)
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId) {
            $actor = $this->lockActor($actorId);
            $answerOptions = Arr::pull($data, 'answer_options', []);

            abort_unless($this->questionPolicy->create($actor), 403);
            abort_unless(
                $this->questionPolicy->manageSubject($actor, (int) $data['subject_id']),
                403
            );
            $this->questionAnswerSynchronizer->validateOptions($answerOptions);
            $this->validateReferenceConsistency($data);
            $data['creator_id'] = $actor->id;
            $data['status'] = 'private';
            $data['is_deleted'] = false;

            $question = Question::create($data);

            $question->answerOptions()->createMany($answerOptions);

            return $this->questionQueryService->loadQuestionDetails($question);
        });
    }

    public function update(array $data, Question $question, User $actor)
    {
        $questionId = (int) $question->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $questionId, $actorId) {
            $actor = $this->lockActor($actorId);
            // Attempt creation locks the same question rows before recording its snapshot references.
            $question = Question::query()->lockForUpdate()->findOrFail($questionId);
            abort_unless(
                $this->questionPolicy->manage($actor, $question, 'update'),
                403
            );
            if (array_key_exists('status', $data)) {
                throw new BusinessException('Hãy dùng thao tác trạng thái riêng để chuyển nơi chứa câu hỏi.', 422);
            }

            $subjectId = (int) ($data['subject_id'] ?? $question->subject_id);
            abort_unless($this->questionPolicy->manageSubject($actor, $subjectId), 403);

            if (ExamAttemptAnswer::query()->where('question_id', $question->id)->exists()) {
                throw new BusinessException('Không thể sửa câu hỏi đã được sử dụng trong lượt thi', 409);
            }

            $answerOptions = Arr::pull($data, 'answer_options', null);

            $mergedData = array_merge($question->only(['subject_id', 'chapter_id']), $data);
            $this->validateReferenceConsistency($mergedData);

            if (!empty($data)) {
                $question->update($data);
            }

            if (is_array($answerOptions)) {
                $this->questionAnswerSynchronizer->sync($question, $answerOptions);
            }

            return $this->questionQueryService->loadQuestionDetails($question->refresh());
        });
    }

    public function delete(Question $question, User $actor)
    {
        $questionId = (int) $question->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($questionId, $actorId): bool {
            $actor = $this->lockActor($actorId);
            $question = Question::query()->lockForUpdate()->findOrFail($questionId);
            abort_unless(
                $this->questionPolicy->manage($actor, $question, 'delete'),
                403
            );

            if ($question->status !== 'archive') {
                throw new BusinessException('Chỉ có thể xoá câu hỏi sau khi đã lưu trữ.', 409);
            }

            return (bool) $question->update(['is_deleted' => true]);
        });
    }

    public function changeStatus(Question $question, string $status, User $actor)
    {
        $questionId = (int) $question->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($questionId, $status, $actorId) {
            $actor = $this->lockActor($actorId);
            $question = Question::query()->lockForUpdate()->findOrFail($questionId);
            abort_unless($this->questionPolicy->changeStatus($actor, $question, $status), 403);

            $allowedTransitions = [
                'private' => ['public', 'archive'],
                'archive' => ['private'],
                'public' => ['private'],
            ];
            if (
                $question->status !== $status
                && !in_array($status, $allowedTransitions[$question->status] ?? [], true)
            ) {
                throw new BusinessException('Không thể chuyển câu hỏi từ trạng thái hiện tại sang trạng thái đã chọn.', 409);
            }

            $question->update(['status' => $status]);

            return $this->questionQueryService->loadQuestionDetails($question->refresh());
        });
    }

    public function copyFromPublic(Question $source, User $actor)
    {
        $sourceId = (int) $source->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($sourceId, $actorId) {
            $actor = $this->lockActor($actorId);
            $source = Question::query()->lockForUpdate()->findOrFail($sourceId);
            abort_unless($this->questionPolicy->create($actor), 403);
            abort_unless(
                $this->questionPolicy->manageSubject($actor, (int) $source->subject_id),
                403
            );
            abort_unless(
                $this->questionPolicy->view($actor, $source),
                403
            );
            if ($source->is_deleted || $source->status !== 'public') {
                throw new BusinessException('Can only copy from public questions', 422);
            }

            $source->load('answerOptions');
            $source->increment('usage_count');

            $newQuestionData = [
                'subject_id'         => $source->subject_id,
                'chapter_id'         => $source->chapter_id,
                'question_content'   => $source->question_content,
                'difficulty_id'      => $source->difficulty_id,
                'image_url'          => $source->image_url,
                'answer_explanation' => $source->answer_explanation,
                'default_score'      => $source->default_score,
                'creator_id'         => $actor->id,
                'usage_count'        => 0,
                'status'             => 'private',
                'is_deleted'         => false,
            ];

            $newQuestion = Question::create($newQuestionData);

            $answerOptions = $source->answerOptions->map(function ($answer) {
                return [
                    'option_content'    => $answer->option_content,
                    'is_correct_answer' => $answer->is_correct_answer,
                ];
            })->values()->all();

            $newQuestion->answerOptions()->createMany($answerOptions);

            return $this->questionQueryService->loadQuestionDetails($newQuestion);
        });
    }

    private function validateReferenceConsistency(array $data): void
    {
        if (!empty($data['subject_id']) && !Subject::query()
            ->whereKey($data['subject_id'])->where('is_deleted', false)->exists()) {
            throw new BusinessException('Học phần không tồn tại hoặc đã ngừng hoạt động', 422);
        }

        if (empty($data['chapter_id']) || empty($data['subject_id'])) return;

        $belongsToSubject = Chapter::query()
            ->where('id', $data['chapter_id'])
            ->where('subject_id', $data['subject_id'])
            ->where('is_deleted', false)
            ->exists();

        if (!$belongsToSubject) {
            throw new BusinessException('Chương không thuộc học phần đã chọn', 422);
        }
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with(['role', 'assignedSubjects'])
            ->lockForUpdate()
            ->findOrFail($actorId);
    }

}
