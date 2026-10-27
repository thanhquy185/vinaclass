<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeacherSubjectRequest;
use App\Http\Requests\StoreTeacherSubjectsRequest;
use App\Http\Requests\TeacherAssignmentOverviewRequest;
use App\Http\Resources\TeacherAssignmentGroupResource;
use App\Http\Resources\TeacherSubjectResource;
use App\Models\User;
use App\Services\TeacherSubjectService;
use App\Services\TeacherSubjectQueryService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class TeacherSubjectController extends Controller
{
    use ApiResponseTrait;

    private TeacherSubjectService $teacherSubjectService;
    private TeacherSubjectQueryService $teacherSubjectQueryService;

    public function __construct(
        TeacherSubjectService $teacherSubjectService,
        TeacherSubjectQueryService $teacherSubjectQueryService
    ) {
        $this->teacherSubjectService = $teacherSubjectService;
        $this->teacherSubjectQueryService = $teacherSubjectQueryService;
    }

    public function index(Request $request)
    {
        $data = $this->teacherSubjectQueryService->getAll($request->user());
        return $this->success(TeacherSubjectResource::collection($data)->resolve($request));
    }

    public function overview(TeacherAssignmentOverviewRequest $request)
    {
        $overview = $this->teacherSubjectQueryService->getOverview(
            $request->user(),
            $request->validated()
        );

        return $this->success([
            'groups' => TeacherAssignmentGroupResource::collection($overview['groups'])
                ->resolve($request),
            'stats' => $overview['stats'],
            'pagination' => $overview['pagination'],
        ]);
    }

    public function store(StoreTeacherSubjectRequest $request)
    {
        $data = $this->teacherSubjectService->add($request->validated(), $request->user());
        return $this->created(TeacherSubjectResource::make($data)->resolve($request));
    }

    public function destroy(int $teacherId, int $subjectId, Request $request)
    {
        $data = $this->teacherSubjectService->delete($teacherId, $subjectId, $request->user());
        return $this->success($data);
    }

    public function getOfTeacher(User $user, Request $request)
    {
        $data = $this->teacherSubjectQueryService->getOfTeacher($user, $request->user());
        return $this->success($data);
    }

    public function syncAssignments(StoreTeacherSubjectsRequest $request)
    {
        $data = $this->teacherSubjectService->syncAssignments(
            $request->validated(),
            $request->user()
        );
        return $this->success($data);
    }
}
