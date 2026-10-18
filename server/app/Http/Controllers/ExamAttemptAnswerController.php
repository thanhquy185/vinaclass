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

    protected ExamAttemptAnswerService $examAttemptAnswerService;

    public function __construct(
        ExamAttemptAnswerService $examAttemptAnswerService
    ) {
        $this->examAttemptAnswerService = $examAttemptAnswerService;
    }

    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        $data = $this->examAttemptAnswerService->getAll();

        return $this->success($data);
    }

    public function store(StoreExamAttemptAnswerRequest $request)
    {
        $data = $this->examAttemptAnswerService->add($request->validated());

        return $this->success($data, 201);
    }

    public function show(ExamAttemptAnswer $examAttemptAnswer)
    {
        $data = $this->examAttemptAnswerService->getOne($examAttemptAnswer);

        return $this->success($data);
    }

    public function update(
        UpdateExamAttemptAnswerRequest $request,
        ExamAttemptAnswer $examAttemptAnswer
    ) {
        $data = $this->examAttemptAnswerService->update(
            $request->validated(),
            $examAttemptAnswer
        );

        return $this->success($data);
    }

    public function destroy(ExamAttemptAnswer $examAttemptAnswer)
    {
        $data = $this->examAttemptAnswerService->delete($examAttemptAnswer);

        return $this->success($data);
    }
}
