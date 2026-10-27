<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamAttemptAnswerRequest;
use App\Http\Requests\UpdateExamAttemptAnswerRequest;
use App\Models\ExamAttemptAnswer;
use App\Services\ExamAttemptAnswerService;
use App\Traits\ApiResponseTrait;

class ExamAttemptAnswerController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private ExamAttemptAnswerService $examAttemptAnswerService)
    {
    }

    public function index()
    {
        return $this->success($this->examAttemptAnswerService->getAll());
    }

    public function store(StoreExamAttemptAnswerRequest $request)
    {
        return $this->success($this->examAttemptAnswerService->add($request->validated()), 201);
    }

    public function show(ExamAttemptAnswer $examAttemptAnswer)
    {
        return $this->success($this->examAttemptAnswerService->getOne($examAttemptAnswer));
    }

    public function update(
        UpdateExamAttemptAnswerRequest $request,
        ExamAttemptAnswer $examAttemptAnswer
    ) {
        return $this->success($this->examAttemptAnswerService->update(
            $request->validated(),
            $examAttemptAnswer
        ));
    }

    public function destroy(ExamAttemptAnswer $examAttemptAnswer)
    {
        return $this->success($this->examAttemptAnswerService->delete($examAttemptAnswer));
    }
}
