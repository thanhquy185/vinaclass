<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\Question;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ExamAttemptAnswerProcessor
{
    public function __construct(
        private ExamAttemptAnswerService $examAttemptAnswerService,
        private ExamQuestionService $examQuestionService,
        private QuestionQueryService $questionQueryService
    ) {
    }

    public function updateAnswers(array $answers, ExamAttempt $examAttempt): void
    {
        $this->assertUniqueQuestionAnswers($answers);

        $answerRows = collect($answers)->map(function ($answer) use ($examAttempt) {
            $questionId = $answer['question_id'];
            abort_unless(
                $examAttempt->examAttemptAnswers()->where('question_id', $questionId)->exists(),
                422,
                'Câu hỏi không thuộc lượt thi này'
            );

            $question = $this->questionQueryService->getById($questionId);

            return $this->buildAnswerRecord($answer, $examAttempt, $question);
        });

        if ($answerRows->isNotEmpty()) {
            $this->examAttemptAnswerService->updateBatch($answerRows->all());
        }
    }

    private function assertUniqueQuestionAnswers(array $answers): void
    {
        $questionIds = collect($answers)
            ->pluck('question_id')
            ->map(fn ($questionId) => (int) $questionId);

        if ($questionIds->count() !== $questionIds->unique()->count()) {
            throw new HttpException(422, 'Mỗi câu hỏi chỉ được gửi một câu trả lời.');
        }
    }

    private function buildAnswerRecord(array $data, ExamAttempt $examAttempt, Question $question): array
    {
        $answerId = $data['answer_id'] ?? null;
        $answerOptions = $this->questionQueryService->getAnswers($question->id);

        if ($answerId !== null && !$answerOptions->contains('id', (int) $answerId)) {
            throw new HttpException(422, 'Đáp án không thuộc câu hỏi đã chọn');
        }

        $isSelectedCorrect = $answerId !== null && $answerOptions->contains(function ($answerOption) use ($answerId) {
            return $answerId == $answerOption->id && $answerOption->is_correct_answer;
        });

        $score = 0;
        if ($isSelectedCorrect) {
            $examQuestion = $this->examQuestionService->getByExamAndQuestion(
                $examAttempt->exam_id,
                $question->id
            );
            $score = $examQuestion->score;
        }

        return [
            'exam_attempt_id' => $examAttempt->id,
            'question_id' => $question->id,
            'answer_option_id' => $answerId,
            'is_selected_correct' => $isSelectedCorrect,
            'score' => $score,
        ];
    }
}
