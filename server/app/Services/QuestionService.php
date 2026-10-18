<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Chapter;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class QuestionService
{
    public function getAll(array $filters = [])
    {
        $query = Question::query()
            ->with(['subject', 'chapter', 'difficulty', 'creator', 'answerOptions'])
            ->withCount('exams')
            ->where('is_deleted', false)
            ->where('status', 'public');

        $this->applyFilters($query, $filters);

        return $query
            ->orderByDesc('created_at')
            ->get();
    }

    public function getWithPrivate(int $userId)
    {
        return Question::query()
            ->with(['subject', 'chapter', 'difficulty', 'creator', 'answerOptions'])
            ->withCount('exams')
            ->where('is_deleted', false)
            ->where('status', 'private')
            ->where('creator_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getOne(Question $question)
    {
        return $question
            ->load(['answerOptions', 'subject', 'chapter', 'difficulty', 'creator'])
            ->loadCount('exams');
    }

    public function add(array $data)
    {
        return DB::transaction(function () use ($data) {
            $answerOptions = Arr::pull($data, 'answerOptions', []);

            $this->validateReferenceConsistency($data);

            $question = Question::create($data);

            $question->answerOptions()->createMany($answerOptions);

            return $this->getOne($question);
        });
    }

    public function update(array $data, Question $question)
    {
        return DB::transaction(function () use ($data, $question) {
            $answerOptions = Arr::pull($data, 'answerOptions', null);

            $mergedData = array_merge($question->only(['subject_id', 'chapter_id']), $data);
            $this->validateReferenceConsistency($mergedData);

            if (!empty($data)) {
                $question->update($data);
            }

            if (is_array($answerOptions)) {
                $this->syncAnswers($question, $answerOptions);
            }

            return $this->getOne($question->refresh());
        });
    }

    public function delete(Question $question)
    {
        $question->update(['is_deleted' => true]);
        return true;
    }

    public function changeStatus(Question $question, string $status)
    {
        $question->update(['status' => $status]);
        return $this->getOne($question->refresh());
    }

    public function copyFromPublic(Question $source, int $creatorId)
    {
        if ($source->status !== 'public') {
            throw new BusinessException('Can only copy from public questions', 422);
        }

        return DB::transaction(function () use ($source, $creatorId) {
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
                'creator_id'         => $creatorId,
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

            return $this->getOne($newQuestion);
        });
    }

    public function getById(int $id)
    {
        $question = Question::findOrFail($id);
        return $question;
    }

    public function getAnswers(int $id)
    {
        $question = Question::findOrFail($id);
        $question->load('answerOptions');
        return $question->answerOptions;
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (!empty($filters['difficulty_id'])) {
            $query->where('difficulty_id', $filters['difficulty_id']);
        }

        if (!empty($filters['chapter_id'])) {
            $query->where('chapter_id', $filters['chapter_id']);
        }

        if (!empty($filters['creator_id'])) {
            $query->where('creator_id', $filters['creator_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['keyword'])) {
            $keyword = trim((string) $filters['keyword']);
            $query->where(function (Builder $inner) use ($keyword) {
                $inner->where('question_content', 'like', "%{$keyword}%")
                    ->orWhere('answer_explanation', 'like', "%{$keyword}%")
                    ->orWhereHas('answerOptions', function (Builder $answerQuery) use ($keyword) {
                        $answerQuery->where('option_content', 'like', "%{$keyword}%");
                    });
            });
        }

        if (!empty($filters['bank'])) {
            if ($filters['bank'] === 'public') {
                $query->where('status', 'public');
            }

            if ($filters['bank'] === 'personal' && !empty($filters['creator_id'])) {
                $query->where('creator_id', $filters['creator_id']);
            }
        }
    }

    private function syncAnswers(Question $question, array $answerOptions): void
    {
        $answerIds = [];

        foreach ($answerOptions as $answer) {
            if (!empty($answer['id'])) {
                $answerModel = $question->answerOptions()->where('id', $answer['id'])->first();
                if ($answerModel) {
                    $answerModel->update([
                        'option_content'    => $answer['option_content'],
                        'is_correct_answer' => $answer['is_correct_answer'],
                    ]);
                    $answerIds[] = $answerModel->id;
                    continue;
                }
            }

            $newAnswer = $question->answerOptions()->create([
                'option_content'    => $answer['option_content'],
                'is_correct_answer' => $answer['is_correct_answer'],
            ]);
            $answerIds[] = $newAnswer->id;
        }

        $question->answerOptions()->whereNotIn('id', $answerIds)->delete();
    }

    private function validateReferenceConsistency(array $data): void
    {
        if (empty($data['chapter_id']) || empty($data['subject_id'])) {
            return;
        }

        $belongsToSubject = Chapter::query()
            ->where('id', $data['chapter_id'])
            ->where('subject_id', $data['subject_id'])
            ->exists();

        if (!$belongsToSubject) {
            throw new \InvalidArgumentException('Chapter does not belong to the selected subject');
        }
    }

    public function getAllPublic()
    {
        return Question::where('status', 'public')->get()->load(
            [
                "subject",
                "chapter",
                "difficulty",
                "creator",
                "answerOptions"
            ]
        );
    }

    public function getAllOfUser(User $user)
    {
        return Question::where('creator_id', $user->id)->get()->load(
            [
                "subject",
                "chapter",
                "difficulty",
                "creator",
                "answerOptions"
            ]
        );
    }
}
