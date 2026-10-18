<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamAttemptLogRequest;
use App\Http\Requests\UpdateExamAttemptLogRequest;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptLog;
use App\Services\ExamAttemptLogService;
use App\Traits\ApiResponseTrait;

class ExamAttemptLogController extends Controller
{
    use ApiResponseTrait;

    protected ExamAttemptLogService $examAttemptLogService;

    public function __construct(ExamAttemptLogService $examAttemptLogService)
    {
        $this->examAttemptLogService = $examAttemptLogService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->examAttemptLogService->getAll();

        return $this->success($data);
    }

    public function store(StoreExamAttemptLogRequest $request)
    {
        $data = $this->examAttemptLogService->add($request->validated());

        return $this->success($data, 201);
    }

    public function show(ExamAttemptLog $examAttemptLog)
    {
        $data = $this->examAttemptLogService->getOne($examAttemptLog);

        return $this->success($data);
    }

    public function update(
        UpdateExamAttemptLogRequest $request,
        ExamAttempt $examAttempt
    ) {
        $data = $this->examAttemptLogService->update(
            $request->validated(),
            $examAttempt
        );

        return $this->success($data);
    }

    public function destroy(ExamAttemptLog $examAttemptLog)
    {
        $data = $this->examAttemptLogService->delete($examAttemptLog);

        return $this->success($data);
    }
}
