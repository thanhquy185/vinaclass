<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamQuestionRequest;
use App\Http\Requests\UpdateExamQuestionRequest;
use App\Models\ExamQuestion;
use App\Services\ExamQuestionService;
use App\Traits\ApiResponseTrait;

class ExamQuestionController extends Controller
{
    use ApiResponseTrait;

    protected ExamQuestionService $examQuestionService;

    public function __construct(ExamQuestionService $examQuestionService)
    {
        $this->examQuestionService = $examQuestionService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->examQuestionService->getAll();
        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreExamQuestionRequest $request)
    {
        $chiTiet = $this->examQuestionService->add($request->validated());
        return $this->success($chiTiet, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ExamQuestion $examQuestion)
    {
        $data = $this->examQuestionService->getOne($examQuestion);
        return $this->success($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateExamQuestionRequest $request, ExamQuestion $examQuestion)
    {
        $chiTiet = $this->examQuestionService->update($request->validated(), $examQuestion);
        return $this->success($chiTiet);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExamQuestion $examQuestion)
    {
        $result = $this->examQuestionService->delete($examQuestion);
        return $this->success($result);
    }
}
