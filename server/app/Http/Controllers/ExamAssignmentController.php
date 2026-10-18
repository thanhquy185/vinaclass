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

    private ExamAssignmentService $examAssignmentService;

    public function __construct(ExamAssignmentService $examAssignmentService)
    {
        $this->examAssignmentService = $examAssignmentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->examAssignmentService->getAll();

        return $this->success($data);
    }

    public function store(StoreExamAssignmentRequest $request)
    {
        $data = $this->examAssignmentService->add($request->validated());

        return $this->success($data, 201);
    }

    public function show(ExamAssignment $examAssignment)
    {
        $data = $this->examAssignmentService->getOne($examAssignment);

        return $this->success($data);
    }

    public function update(
        UpdateExamAssignmentRequest $request,
        ExamAssignment $examAssignment
    ) {
        $data = $this->examAssignmentService->update(
            $request->validated(),
            $examAssignment
        );

        return $this->success($data);
    }

    public function destroy(ExamAssignment $examAssignment)
    {
        $data = $this->examAssignmentService->delete($examAssignment);

        return $this->success($data);
    }
}
