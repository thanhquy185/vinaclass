<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Chapter;
use App\Models\Difficulty;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ExamQuestionSelectionService
{
    public function selectByFilters(
        int $subjectId,
        array $chapterIds,
        array $difficultyFilters,
        User $creator,
        bool $isAdmin
    ): Collection {
        $chapterIds = array_values(array_unique(array_map('intval', $chapterIds)));
        $this->validateChapters($chapterIds, $subjectId);

        $questionCountsByDifficulty = collect($difficultyFilters)
            ->groupBy('difficulty_id')
            ->map(fn ($items) => (int) collect($items)->sum('question_count'))
            ->filter(fn (int $count) => $count > 0);

        $this->validateQuestionCounts($questionCountsByDifficulty);
        $this->lockDifficulties($questionCountsByDifficulty->keys()->map(fn ($id) => (int) $id)->all());

        $selectedQuestions = collect();

        foreach ($questionCountsByDifficulty as $difficultyId => $questionCount) {
            $query = Question::query()
                ->where('is_deleted', false)
                ->where('status', '!=', 'archive')
                ->where('subject_id', $subjectId)
                ->where('difficulty_id', (int) $difficultyId);

            if ($chapterIds !== []) {
                $query->whereIn('chapter_id', $chapterIds);
            }

            if (!$isAdmin) {
                $query->where(function (Builder $visible) use ($creator) {
                    $visible->where('status', 'public')
                        ->orWhere('creator_id', $creator->id);
                });
            }

            $questionsByDifficulty = $query
                ->inRandomOrder()
                ->limit($questionCount)
                ->lockForUpdate()
                ->get();

            if ($questionsByDifficulty->count() < $questionCount) {
                $difficulty = Difficulty::query()->find($difficultyId);
                $difficultyName = $difficulty?->difficulty_name ?? ('ID ' . $difficultyId);
                throw new BusinessException(
                    'Not enough questions for difficulty level: ' . $difficultyName,
                    422
                );
            }

            $selectedQuestions = $selectedQuestions->concat($questionsByDifficulty);
        }

        $selectedQuestions = $selectedQuestions->shuffle()->values();
        if ($selectedQuestions->isEmpty()) {
            throw new BusinessException('No questions matched the selected filters', 422);
        }

        return $selectedQuestions;
    }

    private function validateChapters(array $chapterIds, int $subjectId): void
    {
        if ($chapterIds === []) {
            return;
        }

        $validChapterCount = Chapter::query()
            ->whereIn('id', $chapterIds)
            ->where('subject_id', $subjectId)
            ->where('is_deleted', false)
            ->orderBy('id')
            ->lockForUpdate()
            ->pluck('id')
            ->count();

        if ($validChapterCount !== count($chapterIds)) {
            throw new BusinessException(
                'Selected chapters are invalid for the chosen subject',
                422
            );
        }
    }

    private function lockDifficulties(array $difficultyIds): void
    {
        $difficultyIds = array_values(array_unique(array_map('intval', $difficultyIds)));
        sort($difficultyIds);

        $lockedDifficultyCount = Difficulty::query()
            ->whereIn('id', $difficultyIds)
            ->orderBy('id')
            ->lockForUpdate()
            ->pluck('id')
            ->count();

        if ($lockedDifficultyCount !== count($difficultyIds)) {
            throw new BusinessException('Selected difficulty levels are invalid', 422);
        }
    }

    private function validateQuestionCounts(Collection $questionCountsByDifficulty): void
    {
        if ($questionCountsByDifficulty->isEmpty()) {
            throw new BusinessException(
                'Invalid difficulty configuration, each level must have a question count greater than 0',
                422
            );
        }

        if ($questionCountsByDifficulty->sum() > 1000) {
            throw new BusinessException('Một đề thi không được vượt quá 1000 câu hỏi', 422);
        }
    }
}
