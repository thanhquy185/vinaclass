<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateExamByFilterRequest;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Models\CourseGroup;
use App\Models\Exam;
use App\Models\User;
use App\Services\ExamQueryService;
use App\Services\ExamService;
use App\Services\ExamUpdateService;
use App\Traits\ApiResponseTrait;
use Illuminate\Support\Facades\Auth;

class ExamController extends Controller
{
    use ApiResponseTrait;

    private ExamService $examService;
    private ExamQueryService $examQueryService;
    private ExamUpdateService $examUpdateService;

    public function __construct(
        ExamService $examService,
        ExamQueryService $examQueryService,
        ExamUpdateService $examUpdateService
    ) {
        $this->examService = $examService;
        $this->examQueryService = $examQueryService;
        $this->examUpdateService = $examUpdateService;
    }

    public function index()
    {
        $data = $this->examQueryService->getAll(Auth::user());

        return $this->success($data);
    }

    public function store(StoreExamRequest $request)
    {
        $payload = $request->validated();
        $data = $this->examService->add($payload, $request->user());

        return $this->created($data);
    }

    public function generateExamsByFilter(GenerateExamByFilterRequest $request)
    {
        $payload = $request->validated();
        $data = $this->examService->generateByFilter($payload, $request->user());

        return $this->created($data);
    }

    public function show(Exam $exam)
    {
        $data = $this->examQueryService->getExamDetails($exam, Auth::user());

        return $this->success($data);
    }

    public function update(UpdateExamRequest $request, Exam $exam)
    {
        $actor = $request->user();
        $this->examUpdateService->assertCanManage($exam, $actor, 'update');
        $data = $this->examUpdateService->update($request->validated(), $exam, $actor);

        return $this->success($data);
    }

    public function destroy(Exam $exam)
    {
        $actor = request()->user();
        $this->examService->assertCanManage($exam, $actor, 'delete');
        $data = $this->examService->delete($exam, $actor);

        return $this->success($data);
    }

    public function getExamsByStudent(User $user)
    {
        $this->examQueryService->assertCanViewStudentExams(Auth::user(), $user);
        $data = $this->examQueryService->getOfStudent($user);

        return $this->success($data);
    }

    public function getExamDetails(Exam $exam)
    {
        $data = $this->examQueryService->getExamDetails($exam, request()->user());

        return $this->success($data);
    }

    public function getByCourseGroupAndStudent(CourseGroup $courseGroup, User $user)
    {
        $viewer = Auth::user();
        $this->examQueryService->assertCanViewStudentProgress($viewer, $courseGroup, $user);
        $data = $this->examQueryService->getByCourseGroupAndStudent($courseGroup, $user, $viewer);
        if ($viewer->hasRoleCode('STUDENT')) $data->makeHidden('join_code');

        return $this->success($data);
    }
}
