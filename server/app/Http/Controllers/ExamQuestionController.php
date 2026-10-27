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

    public function __construct(private ExamQuestionService $examQuestionService)
    {
    }

    public function index()
    {
        return $this->success($this->examQuestionService->getAll());
    }

    public function store(StoreExamQuestionRequest $request)
    {
        return $this->success($this->examQuestionService->add($request->validated()), 201);
    }

    public function show(ExamQuestion $examQuestion)
    {
        return $this->success($this->examQuestionService->getOne($examQuestion));
    }

    public function update(UpdateExamQuestionRequest $request, ExamQuestion $examQuestion)
    {
        return $this->success($this->examQuestionService->update(
            $request->validated(),
            $examQuestion
        ));
    }

    public function destroy(ExamQuestion $examQuestion)
    {
        return $this->success($this->examQuestionService->delete($examQuestion));
    }
}
