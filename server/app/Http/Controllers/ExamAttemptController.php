<?php

namespace App\Http\Controllers;

use App\Http\Requests\StartTestRequest;
use App\Http\Requests\StoreExamAttemptRequest;
use App\Http\Requests\SubmitTestRequest;
use App\Http\Requests\UpdateExamAttemptRequest;
use App\Http\Requests\UpdateStudentTestRequest;
use App\Models\ExamAttempt;
use App\Models\CourseGroup;
use App\Models\Exam;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use App\Services\ExamAttemptService;

class ExamAttemptController extends Controller
{
    use ApiResponseTrait;

    protected ExamAttemptService $examAttemptService;

    public function __construct(ExamAttemptService $examAttemptService)
    {
        $this->examAttemptService = $examAttemptService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->success($this->examAttemptService->getAll());
    }

    public function store(StoreExamAttemptRequest $request)
    {
        return $this->success(
            $this->examAttemptService->add($request->validated())
        );
    }

    public function show(ExamAttempt $examAttempt)
    {
        return $this->success(
            $this->examAttemptService->getOne($examAttempt)
        );
    }

    public function update(
        UpdateExamAttemptRequest $request,
        ExamAttempt $examAttempt
    ) {
        return $this->examAttemptService->update(
            $request->validated(),
            $examAttempt
        );
    }

    public function destroy(ExamAttempt $examAttempt)
    {
        return $this->examAttemptService->delete($examAttempt);
    }

    public function startTest(StartTestRequest $request)
    {
        try {
            return $this->success(
                $this->examAttemptService->startTest($request->validated())
            );
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateStudentTest(
        UpdateStudentTestRequest $request,
        ExamAttempt $examAttempt
    ) {
        return $this->success(
            $this->examAttemptService->updateStudentTest(
                $request->validated(),
                $examAttempt
            )
        );
    }

    public function submitTest(
        SubmitTestRequest $request,
        ExamAttempt $examAttempt
    ) {
        return $this->success(
            $this->examAttemptService->submitTest(
                $request->validated(),
                $examAttempt->id
            )
        );
    }

    public function reviewResult(ExamAttempt $examAttempt)
    {
        return $this->success(
            $this->examAttemptService->reviewResult($examAttempt)
        );
    }

    public function getOfStudent(User $user)
    {
        return $this->success(
            $this->examAttemptService->getOfStudent($user)
        );
    }

    public function getByCourseGroupAndStudent(
        CourseGroup $courseGroup,
        User $user
    ) {
        return $this->success(
            $this->examAttemptService->getByCourseGroupAndStudent(
                $courseGroup,
                $user
            )
        );
    }

    public function getOfCourseGroupAndExam(
        CourseGroup $courseGroup,
        Exam $exam
    ) {
        return $this->success(
            $this->examAttemptService->getOfCourseGroupAndExam(
                $courseGroup,
                $exam
            )
        );
    }
}