<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeQuestionStatusRequest;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Models\Question;
use App\Models\User;
use App\Services\QuestionService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    use ApiResponseTrait;

    protected QuestionService $questionService;

    public function __construct(QuestionService $questionService)
    {
        $this->questionService = $questionService;
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

        $data = $this->questionService->getAll($filters);
        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionRequest $request)
    {
        $data = $this->questionService->add($request->validated());
        return $this->success($data, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        $cauHoi = $this->questionService->getOne($question);
        return $this->success($cauHoi);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuestionRequest $request, Question $question)
    {
        $data = $this->questionService->update($request->validated(), $question);
        return $this->success($data);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        $result = $this->questionService->delete($question);
        return $this->success($result);
    }

    public function changeStatus(ChangeQuestionStatusRequest $request, Question $question)
    {
        $data = $this->questionService->changeStatus($question, $request->validated()['status']);
        return $this->success($data);
    }

    public function copyFromPublic(Request $request, Question $question)
    {
        $validated = $request->validate([
            'creatorId' => ['required', 'integer', 'exists:users,id'],
        ]);

        $data = $this->questionService->copyFromPublic($question, (int) $validated['creatorId']);
        return $this->success($data, 201);
    }

    public function getWithPrivate(User $user){
        $data = $this->questionService->getWithPrivate($user->id);
        return $this->success($data);
    }

    public function getAllPublic(){
        $data = $this->questionService->getAllPublic();
        return $this->success($data);
    }

    public function getAllOfUser(User $user){
        $data = $this->questionService->getAllOfUser($user);
        return $this->success($data);
    }
}
