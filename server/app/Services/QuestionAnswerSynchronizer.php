<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\ExamAttemptAnswer;
use App\Models\Question;

class QuestionAnswerSynchronizer
{
    public function validateOptions(array $answerOptions): void
    {
        if (count($answerOptions) < 2) {
            throw new BusinessException('Câu hỏi phải có ít nhất hai đáp án.', 422);
        }

        $existingIds = collect($answerOptions)
            ->filter(fn ($answer) => is_array($answer) && !empty($answer['id']))
            ->map(fn (array $answer) => (int) $answer['id'])
            ->values();

        if ($existingIds->count() !== $existingIds->unique()->count()) {
            throw new BusinessException('Mỗi đáp án chỉ được chọn một lần.', 422);
        }

        $correctAnswerCount = collect($answerOptions)->filter(
            fn ($answer) => is_array($answer)
                && filter_var($answer['is_correct_answer'] ?? false, FILTER_VALIDATE_BOOLEAN)
        )->count();

        if ($correctAnswerCount !== 1) {
            throw new BusinessException('Câu hỏi phải có chính xác một đáp án đúng.', 422);
        }
    }

    public function sync(Question $question, array $answerOptions): void
    {
        $this->validateOptions($answerOptions);

        $answerIds = [];

        foreach ($answerOptions as $answer) {
            if (!empty($answer['id'])) {
                $answerModel = $question->answerOptions()->where('id', $answer['id'])->first();
                if (!$answerModel) {
                    throw new BusinessException('Đáp án không thuộc câu hỏi này', 422);
                }

                $answerChanged = $answerModel->option_content !== $answer['option_content']
                    || (bool) $answerModel->is_correct_answer
                    !== (bool) $answer['is_correct_answer'];
                $answerWasUsed = ExamAttemptAnswer::query()
                    ->where('answer_option_id', $answerModel->id)
                    ->exists();

                if ($answerWasUsed && $answerChanged) {
                    throw new BusinessException(
                        'Không thể sửa đáp án đã được sử dụng trong lượt thi',
                        409
                    );
                }

                $answerModel->update([
                    'option_content' => $answer['option_content'],
                    'is_correct_answer' => $answer['is_correct_answer'],
                ]);
                $answerIds[] = $answerModel->id;
                continue;
            }

            $newAnswer = $question->answerOptions()->create([
                'option_content' => $answer['option_content'],
                'is_correct_answer' => $answer['is_correct_answer'],
            ]);
            $answerIds[] = $newAnswer->id;
        }

        $removedIds = $question->answerOptions()
            ->whereNotIn('id', $answerIds)
            ->pluck('id');

        if (
            $removedIds->isNotEmpty()
            && ExamAttemptAnswer::query()->whereIn('answer_option_id', $removedIds)->exists()
        ) {
            throw new BusinessException('Không thể xóa đáp án đã được sử dụng trong bài thi', 409);
        }

        if ($removedIds->isNotEmpty()) {
            $question->answerOptions()->whereIn('id', $removedIds)->delete();
        }
    }
}
