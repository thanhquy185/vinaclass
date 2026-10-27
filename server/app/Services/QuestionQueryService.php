<?php

namespace App\Services;

use App\Models\AnswerOption;
use App\Models\Question;
use App\Models\User;
use App\Policies\QuestionPolicy;
use Illuminate\Database\Eloquent\Builder;

class QuestionQueryService
{
    public function __construct(private QuestionPolicy $questionPolicy)
    {
    }

    public function getAll(array $filters, User $viewer)
    {
        abort_unless($this->questionPolicy->accessBank($viewer), 403);

        $query = Question::query()
            ->with(['subject', 'chapter', 'difficulty', 'creator', 'answerOptions'])
            ->withCount('exams')
            ->where('is_deleted', false)
            ->where('status', 'public');

        $this->applyFilters($query, $filters);

        return $query->orderByDesc('created_at')->get();
    }

    public function getBank(array $filters, User $viewer): array
    {
        abort_unless($this->questionPolicy->accessBank($viewer), 403);

        $visibleQuestions = Question::query()->where('is_deleted', false);
        if ($viewer->hasRoleCode('TEACHER')) {
            $visibleQuestions->where(function (Builder $query) use ($viewer): void {
                $query->where('status', 'public')
                    ->orWhere('creator_id', $viewer->id);
            });
        }

        $stats = [
            'total' => (clone $visibleQuestions)->count(),
            'public' => (clone $visibleQuestions)->where('status', 'public')->count(),
            'private' => (clone $visibleQuestions)->where('status', 'private')->count(),
            'archive' => (clone $visibleQuestions)->where('status', 'archive')->count(),
        ];

        $query = (clone $visibleQuestions)
            ->with(['subject', 'chapter', 'difficulty', 'creator', 'answerOptions'])
            ->withCount('exams')
            ->where('status', $filters['status']);

        if (!empty($filters['subject_id'])) {
            $query->where('subject_id', (int) $filters['subject_id']);
        }

        if (!empty($filters['chapter_id'])) {
            $query->where('chapter_id', (int) $filters['chapter_id']);
        }

        if (!empty($filters['difficulty_id'])) {
            $query->where('difficulty_id', (int) $filters['difficulty_id']);
        }

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $searchBy = $filters['search_by'] ?? 'content';
            if ($searchBy === 'answer') {
                $query->whereHas('answerOptions', fn (Builder $answers) =>
                    $answers->where('option_content', 'like', '%' . $keyword . '%'));
            } else {
                $query->where('question_content', 'like', '%' . $keyword . '%');
            }
        }

        $sortOrder = $filters['sort_order'] ?? 'none';
        if ($sortOrder === 'asc' || $sortOrder === 'desc') {
            $query->orderBy('usage_count', $sortOrder)->orderByDesc('id');
        } else {
            $query->orderByDesc('created_at')->orderByDesc('id');
        }

        $page = $query->paginate(
            (int) ($filters['per_page'] ?? 10),
            ['*'],
            'page',
            (int) ($filters['page'] ?? 1)
        );

        return [
            'questions' => $page->items(),
            'pagination' => [
                'current_page' => $page->currentPage(),
                'page_size' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
            'stats' => $stats,
        ];
    }

    public function getWithPrivate(int $userId, User $viewer)
    {
        $teacher = User::query()->with('role')->findOrFail($userId);
        abort_unless($this->questionPolicy->viewTeacherQuestions($viewer, $teacher), 403);

        return Question::query()
            ->with(['subject', 'chapter', 'difficulty', 'creator', 'answerOptions'])
            ->withCount('exams')
            ->where('is_deleted', false)
            ->where('status', 'private')
            ->where('creator_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getOne(Question $question, User $viewer): Question
    {
        abort_unless($this->questionPolicy->view($viewer, $question), 404);

        return $this->loadQuestionDetails($question);
    }

    public function getById(int $id): Question
    {
        return Question::findOrFail($id);
    }

    public function getAnswers(int $id)
    {
        $question = Question::findOrFail($id);
        $question->load('answerOptions');

        return $question->answerOptions;
    }

    public function getAllAnswerOptions(User $viewer)
    {
        if (!$this->questionPolicy->accessBank($viewer)) {
            return AnswerOption::query()->whereRaw('1 = 0')->get();
        }

        return AnswerOption::query()
            ->whereHas('question', function ($questions) use ($viewer) {
                $questions->where('is_deleted', false);

                if (!$viewer->hasRoleCode('ADMIN') && !$viewer->isCustomRole()) {
                    $questions->where(function ($visibleQuestions) use ($viewer) {
                        $visibleQuestions
                            ->where('status', 'public')
                            ->orWhere('creator_id', $viewer->id);
                    });
                }
            })
            ->get();
    }

    public function getAnswerOption(AnswerOption $answerOption, User $viewer): AnswerOption
    {
        abort_unless(
            $answerOption->question && $this->questionPolicy->view($viewer, $answerOption->question),
            404
        );

        return $answerOption;
    }

    public function loadQuestionDetails(Question $question): Question
    {
        return $question
            ->load(['answerOptions', 'subject', 'chapter', 'difficulty', 'creator'])
            ->loadCount('exams');
    }

    public function getAllPublic(User $viewer)
    {
        abort_unless($this->questionPolicy->accessBank($viewer), 403);

        return Question::query()
            ->with(['subject', 'chapter', 'difficulty', 'creator', 'answerOptions'])
            ->where('is_deleted', false)
            ->where('status', 'public')
            ->get();
    }

    public function getAllOfUser(User $user, User $viewer)
    {
        abort_unless($this->questionPolicy->viewTeacherQuestions($viewer, $user), 403);

        return Question::query()
            ->with(['subject', 'chapter', 'difficulty', 'creator', 'answerOptions'])
            ->where('is_deleted', false)
            ->where('creator_id', $user->id)
            ->get();
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
}
