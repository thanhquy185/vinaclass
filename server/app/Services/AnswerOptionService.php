<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\AnswerOption;
use App\Models\ExamAttemptAnswer;
use App\Models\Question;
use App\Models\User;
use App\Policies\QuestionPolicy;
use Illuminate\Support\Facades\DB;

class AnswerOptionService
{
    public function __construct(private QuestionPolicy $questionPolicy)
    {
    }

    public function add(array $data, User $actor)
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId) {
            $actor = $this->lockActor($actorId);
            $question = Question::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($data['question_id']);

            $this->assertCanManageQuestion($question, $actor, 'create');
            $this->assertQuestionNotUsedInAttempt($question);

            $isCorrect = (bool) $data['is_correct_answer'];
            $correctOptions = $question->answerOptions()->where('is_correct_answer', true);
            if ($isCorrect) {
                $correctOptions->update(['is_correct_answer' => false]);
            } elseif ($correctOptions->count() !== 1) {
                throw new BusinessException('Câu hỏi phải có chính xác một đáp án đúng.', 422);
            }

            return $question->answerOptions()->create([
                'option_content' => $data['option_content'],
                'is_correct_answer' => $isCorrect,
            ]);
        });
    }

    public function update(array $data, AnswerOption $answerOption, User $actor)
    {
        $answerOptionId = (int) $answerOption->id;
        $questionId = (int) $answerOption->question_id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $answerOptionId, $questionId, $actorId) {
            $actor = $this->lockActor($actorId);
            $question = Question::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($questionId);

            $option = $question->answerOptions()
                ->whereKey($answerOptionId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertCanManageQuestion($question, $actor, 'update');

            if (isset($data['question_id']) && (int) $data['question_id'] !== (int) $question->id) {
                throw new BusinessException('Không thể chuyển đáp án sang câu hỏi khác.', 422);
            }

            unset($data['question_id']);
            $this->assertQuestionNotUsedInAttempt($question);

            $willBeCorrect = array_key_exists('is_correct_answer', $data)
                ? (bool) $data['is_correct_answer']
                : (bool) $option->is_correct_answer;

            if ($willBeCorrect) {
                $question->answerOptions()
                    ->whereKeyNot($option->id)
                    ->where('is_correct_answer', true)
                    ->update(['is_correct_answer' => false]);
                $data['is_correct_answer'] = true;
            } elseif ($question->answerOptions()
                ->whereKeyNot($option->id)
                ->where('is_correct_answer', true)
                ->count() !== 1) {
                throw new BusinessException('Câu hỏi phải có chính xác một đáp án đúng.', 422);
            }

            $option->update(array_intersect_key($data, array_flip([
                'option_content',
                'is_correct_answer',
            ])));

            return $option->refresh();
        });
    }

    public function delete(AnswerOption $answerOption, User $actor)
    {
        $answerOptionId = (int) $answerOption->id;
        $questionId = (int) $answerOption->question_id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($answerOptionId, $questionId, $actorId) {
            $actor = $this->lockActor($actorId);
            $question = Question::query()
                ->where('is_deleted', false)
                ->lockForUpdate()
                ->findOrFail($questionId);

            $option = $question->answerOptions()
                ->whereKey($answerOptionId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertCanManageQuestion($question, $actor, 'delete');
            $this->assertQuestionNotUsedInAttempt($question);

            if ($question->answerOptions()->count() <= 2) {
                throw new BusinessException('Mỗi câu hỏi phải có ít nhất hai đáp án.', 422);
            }

            if ($question->answerOptions()
                ->whereKeyNot($option->id)
                ->where('is_correct_answer', true)
                ->count() !== 1) {
                throw new BusinessException('Câu hỏi phải có chính xác một đáp án đúng.', 422);
            }

            return (bool) $option->delete();
        });
    }

    private function assertQuestionNotUsedInAttempt(Question $question): void
    {
        if (ExamAttemptAnswer::query()->where('question_id', $question->id)->exists()) {
            throw new BusinessException('Không thể sửa đáp án của câu hỏi đã được sử dụng trong lượt thi.', 409);
        }
    }

    private function assertCanManageQuestion(Question $question, User $actor, string $action): void
    {
        abort_unless(
            $this->questionPolicy->manage($actor, $question, $action),
            403
        );
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with(['role', 'assignedSubjects'])
            ->lockForUpdate()
            ->findOrFail($actorId);
    }
}
