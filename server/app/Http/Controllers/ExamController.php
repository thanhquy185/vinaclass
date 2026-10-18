<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateExamByFilterRequest;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Models\CourseGroup;
use App\Models\Exam;
use App\Models\User;
use App\Services\ExamService;
use App\Traits\ApiResponseTrait;

class ExamController extends Controller
{
    use ApiResponseTrait;

    private ExamService $examService;

    public function __construct(ExamService $examService)
    {
        $this->examService = $examService;
    }

    public function index()
    {
        $data = $this->examService->getAll();

        return $this->success($data);
    }

    public function store(StoreExamRequest $request)
    {
        $data = $this->examService->add($request->validated());

        return $this->success($data, 201);
    }

    public function generateExamsByFilter(GenerateExamByFilterRequest $request)
    {
        $data = $this->examService->generateByFilter($request->validated());

        return $this->success($data, 201);
    }

    public function show(Exam $exam)
    {
        $data = $this->examService->getOne($exam);

        return $this->success($data);
    }

    public function update(UpdateExamRequest $request, Exam $exam)
    {
        $data = $this->examService->update($request->validated(), $exam);

        return $this->success($data);
    }

    public function destroy(Exam $exam)
    {
        $data = $this->examService->delete($exam->id);

        return $this->success($data);
    }

    public function getExamsByStudent(User $user)
    {
        $data = $this->examService->getOfStudent($user);

        return $this->success($data);
    }

    public function getExamDetails(Exam $exam)
    {
        $data = $this->examService->getExamDetails($exam);

        return $this->success($data);
    }

    public function getByCourseGroupAndStudent(CourseGroup $courseGroup, User $user)
    {
        $data = $this->examService->getByCourseGroupAndStudent($courseGroup, $user);

        return $this->success($data);
    }
}
