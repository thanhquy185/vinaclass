<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeQuestionStatusRequest;
use App\Http\Requests\QuestionBankRequest;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Models\Question;
use App\Models\User;
use App\Services\QuestionQueryService;
use App\Services\QuestionService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    use ApiResponseTrait;

    protected QuestionService $questionService;
    protected QuestionQueryService $questionQueryService;

    public function __construct(QuestionService $questionService, QuestionQueryService $questionQueryService)
    {
        $this->questionService = $questionService;
        $this->questionQueryService = $questionQueryService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = [
            'subject_id' => $request->query('subject_id'),
            'chapter_id' => $request->query('chapter_id'),
            'difficulty_id' => $request->query('difficulty_id'),
            'creator_id' => $request->query('creator_id'),
            'status' => $request->query('status'),
            'keyword' => $request->query('keyword'),
            'bank' => $request->query('bank'),
        ];

        $data = $this->questionQueryService->getAll($filters, $request->user());
        return $this->success($data);
    }

    public function bank(QuestionBankRequest $request)
    {
        $data = $this->questionQueryService->getBank(
            $request->validated(),
            $request->user()
        );

        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionRequest $request)
    {
        $data = $this->questionService->add(
            $request->validated(),
            $request->user()
        );

        return $this->created($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Question $question)
    {
        $question = $this->questionQueryService->getOne($question, $request->user());
        return $this->success($question);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuestionRequest $request, Question $question)
    {
        $data = $this->questionService->update(
            $request->validated(),
            $question,
            $request->user()
        );

        return $this->success($data);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        $result = $this->questionService->delete($question, Auth::user());

        return $this->success($result);
    }

    public function changeStatus(ChangeQuestionStatusRequest $request, Question $question)
    {
        $status = $request->validated()['status'];

        $data = $this->questionService->changeStatus($question, $status, Auth::user());

        return $this->success($data);
    }

    public function copyFromPublic(Question $question)
    {
        $actor = Auth::user();
        abort_unless(!$question->is_deleted && $question->status === 'public', 404);

        $data = $this->questionService->copyFromPublic($question, $actor);

        return $this->created($data);
    }

    public function getWithPrivate(User $user)
    {
        $data = $this->questionQueryService->getWithPrivate($user->id, Auth::user());

        return $this->success($data);
    }

    public function getAllPublic()
    {
        $data = $this->questionQueryService->getAllPublic(Auth::user());

        return $this->success($data);
    }

    public function getAllOfUser(User $user)
    {
        $data = $this->questionQueryService->getAllOfUser($user, Auth::user());

        return $this->success($data);
    }
}
