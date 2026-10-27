<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamAssignmentRequest;
use App\Http\Requests\UpdateExamAssignmentRequest;
use App\Models\ExamAssignment;
use App\Services\ExamAssignmentService;
use App\Traits\ApiResponseTrait;

class ExamAssignmentController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private ExamAssignmentService $examAssignmentService)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->success($this->examAssignmentService->getAll());
    }

    public function store(StoreExamAssignmentRequest $request)
    {
        return $this->success($this->examAssignmentService->add($request->validated()), 201);
    }

    public function show(ExamAssignment $examAssignment)
    {
        return $this->success($this->examAssignmentService->getOne($examAssignment));
    }

    public function update(
        UpdateExamAssignmentRequest $request,
        ExamAssignment $examAssignment
    ) {
        return $this->success($this->examAssignmentService->update(
            $request->validated(),
            $examAssignment
        ));
    }

    public function destroy(ExamAssignment $examAssignment)
    {
        return $this->success($this->examAssignmentService->delete($examAssignment));
    }
}
