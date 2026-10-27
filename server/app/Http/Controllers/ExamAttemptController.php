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
use App\Services\ExamAttemptQueryService;
use App\Services\ExamAttemptService;
use App\Traits\ApiResponseTrait;

class ExamAttemptController extends Controller
{
    use ApiResponseTrait;

    protected ExamAttemptService $examAttemptService;
    protected ExamAttemptQueryService $examAttemptQueryService;

    public function __construct(
        ExamAttemptService $examAttemptService,
        ExamAttemptQueryService $examAttemptQueryService
    ) {
        $this->examAttemptService = $examAttemptService;
        $this->examAttemptQueryService = $examAttemptQueryService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->success($this->examAttemptQueryService->getAll(request()->user()));
    }

    public function store(StoreExamAttemptRequest $request)
    {
        return $this->success(
            $this->examAttemptService->add($request->validated(), $request->user())
        );
    }

    public function show(ExamAttempt $examAttempt)
    {
        return $this->success(
            $this->examAttemptQueryService->getOne($examAttempt, request()->user())
        );
    }

    public function update(
        UpdateExamAttemptRequest $request,
        ExamAttempt $examAttempt
    ) {
        return $this->examAttemptService->update(
            $request->validated(),
            $examAttempt,
            $request->user()
        );
    }

    public function destroy(ExamAttempt $examAttempt)
    {
        return $this->examAttemptService->delete($examAttempt, request()->user());
    }

    public function startTest(StartTestRequest $request)
    {
        $data = $request->validated();
        $data['student_id'] = (int) $request->user()->id;
        return $this->success($this->examAttemptService->startTest($data, $request->user()));
    }

    public function updateStudentTest(
        UpdateStudentTestRequest $request,
        ExamAttempt $examAttempt
    ) {
        return $this->success(
            $this->examAttemptService->updateStudentTest(
                $request->validated(),
                $examAttempt,
                $request->user()
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
                $examAttempt->id,
                $request->user()
            )
        );
    }

    public function reviewResult(ExamAttempt $examAttempt)
    {
        return $this->success(
            $this->examAttemptQueryService->reviewResult($examAttempt, request()->user())
        );
    }

    public function getOfStudent(User $user)
    {
        return $this->success(
            $this->examAttemptQueryService->getOfStudent($user, request()->user())
        );
    }

    public function getByCourseGroupAndStudent(
        CourseGroup $courseGroup,
        User $user
    ) {
        $viewer = request()->user();
        return $this->success(
            $this->examAttemptQueryService->getByCourseGroupAndStudent(
                $courseGroup,
                $user,
                $viewer
            )
        );
    }

    public function getOfCourseGroupAndExam(
        CourseGroup $courseGroup,
        Exam $exam
    ) {
        $viewer = request()->user();
        return $this->success(
            $this->examAttemptQueryService->getOfCourseGroupAndExam(
                $courseGroup,
                $exam,
                $viewer
            )
        );
    }
}
