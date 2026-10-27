<?php

namespace App\Http\Controllers;

use App\Helpers\XlsxExportHelper;
use App\Http\Requests\AddCourseGroupStudentRequest;
use App\Http\Requests\ImportCourseGroupRosterRequest;
use App\Http\Requests\JoinGroupRequest;
use App\Http\Requests\RemoveCourseGroupStudentRequest;
use App\Http\Requests\StoreCourseGroupRequest;
use App\Http\Requests\UpdateCourseGroupRequest;
use App\Http\Resources\CourseGroupResource;
use App\Http\Resources\UserResource;
use App\Models\CourseGroup;
use App\Models\User;
use App\Services\CourseGroupInvitationService;
use App\Services\CourseGroupMembershipService;
use App\Services\CourseGroupQueryService;
use App\Services\CourseGroupRosterQueryService;
use App\Services\CourseGroupRosterService;
use App\Services\CourseGroupService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CourseGroupController extends Controller
{
    use ApiResponseTrait;

    private CourseGroupService $courseGroupService;
    private CourseGroupQueryService $courseGroupQueryService;
    private CourseGroupRosterService $courseGroupRosterService;
    private CourseGroupRosterQueryService $courseGroupRosterQueryService;
    private CourseGroupMembershipService $courseGroupMembershipService;
    private CourseGroupInvitationService $courseGroupInvitationService;
    private XlsxExportHelper $xlsxExportHelper;

    public function __construct(
        CourseGroupService $courseGroupService,
        CourseGroupQueryService $courseGroupQueryService,
        CourseGroupRosterService $courseGroupRosterService,
        CourseGroupRosterQueryService $courseGroupRosterQueryService,
        CourseGroupMembershipService $courseGroupMembershipService,
        CourseGroupInvitationService $courseGroupInvitationService,
        XlsxExportHelper $xlsxExportHelper
    ) {
        $this->courseGroupService = $courseGroupService;
        $this->courseGroupQueryService = $courseGroupQueryService;
        $this->courseGroupRosterService = $courseGroupRosterService;
        $this->courseGroupRosterQueryService = $courseGroupRosterQueryService;
        $this->courseGroupMembershipService = $courseGroupMembershipService;
        $this->courseGroupInvitationService = $courseGroupInvitationService;
        $this->xlsxExportHelper = $xlsxExportHelper;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->courseGroupQueryService->getAll(request()->user());
        if (request()->user()->hasRoleCode('STUDENT')) {
            $data->each(fn ($group) => $group->makeHidden('join_code'));
        }
        return $this->success(CourseGroupResource::collection($data)->resolve(request()));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseGroupRequest $request)
    {
        $payload = $request->validated();
        $data = $this->courseGroupService->add($payload, $request->user());
        return $this->created($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupQueryService->getOne($courseGroup, request()->user());
        if (request()->user()->hasRoleCode('STUDENT')) $data->makeHidden('join_code');
        return $this->success($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseGroupRequest $request, CourseGroup $courseGroup)
    {
        $actor = $request->user();
        $this->courseGroupService->assertCanManage($courseGroup, $actor, 'update');
        $data = $this->courseGroupService->update($request->validated(), $courseGroup, $actor);
        return $this->success($data);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CourseGroup $courseGroup)
    {
        $actor = request()->user();
        $this->courseGroupService->assertCanManage($courseGroup, $actor, 'delete');
        $data = $this->courseGroupService->delete($courseGroup, $actor);
        return $this->success($data);
    }

    public function hide(CourseGroup $courseGroup)
    {
        $actor = request()->user();
        $this->courseGroupService->assertCanManage($courseGroup, $actor, 'update');
        $data = $this->courseGroupService->hide($courseGroup, $actor);
        return $this->success($data);
    }

    public function getWithTeacherAndSubject(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupQueryService->getWithTeacherAndSubject(
            $courseGroup,
            request()->user()
        );
        if (request()->user()->hasRoleCode('STUDENT')) {
            $data->makeHidden('join_code');
        }
        return $this->success(CourseGroupResource::make($data)->resolve(request()));
    }

    public function getWithExams(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupQueryService->getWithExams($courseGroup, request()->user());
        if (request()->user()->hasRoleCode('STUDENT')) $data->makeHidden('join_code');
        return $this->success($data);
    }

    public function joinGroup(JoinGroupRequest $request)
    {
        $data = $this->courseGroupInvitationService->joinGroup(
            $request->validated(),
            $request->user()
        );
        return $this->created($data);
    }

    public function getOfStudent(User $user)
    {
        $actor = request()->user();
        $data = $this->courseGroupQueryService->getOfStudent($user, $actor);
        return $this->success(UserResource::make($data)->resolve(request()));
    }

    public function getStudentList(CourseGroup $courseGroup, Request $request)
    {
        $actor = $request->user();
        $keyword = $request->query('keyword');
        $data = $this->courseGroupRosterQueryService->getStudentList(
            $courseGroup,
            $keyword,
            $actor
        );
        $data['students'] = UserResource::collection($data['students'])->resolve($request);
        return $this->success($data);
    }

    public function addStudentToGroup(
        AddCourseGroupStudentRequest $request,
        CourseGroup $courseGroup
    )
    {
        $actor = $request->user();
        $data = $this->courseGroupMembershipService->addStudentToGroup(
            $request->validated('username'),
            $courseGroup,
            $actor
        );
        return $this->created($data);
    }

    public function resetInviteCode(CourseGroup $courseGroup)
    {
        $actor = request()->user();
        $this->courseGroupService->assertCanManage($courseGroup, $actor, 'update');
        $data = $this->courseGroupInvitationService->resetInviteCode($courseGroup, $actor);
        return $this->success($data);
    }

    /**
     * List course groups assigned to a teacher.
     *
     * Query parameters:
     * - includeHidden (bool, default false): include hidden groups.
     */
    public function getAssignedTeaching(User $user, Request $request)
    {
        $includeHidden = filter_var($request->query('includeHidden', false), FILTER_VALIDATE_BOOLEAN);
        $data = $this->courseGroupQueryService->getAssignedTeachingByTeacherId(
            $user->id,
            $request->user(),
            $includeHidden
        );
        return $this->success($data);
    }

    public function exportStudents(CourseGroup $courseGroup, Request $request): BinaryFileResponse
    {
        $actor = $request->user();
        $keyword = $request->query('keyword');
        $export = $this->courseGroupRosterQueryService->getStudentsExport(
            $courseGroup,
            $keyword,
            $actor
        );

        return $this->xlsxExportHelper->download(
            $export['fileNameAttributes'],
            $export['headerTitles'],
            $export['data']
        );
    }

    public function importStudents(
        ImportCourseGroupRosterRequest $request,
        CourseGroup $courseGroup
    )
    {
        $actor = $request->user();
        $result = $this->courseGroupRosterService->importStudentsFromFile(
            $courseGroup,
            $request->validated('file'),
            $actor
        );
        return $this->success($result);
    }

    public function removeStudentFromGroup(
        RemoveCourseGroupStudentRequest $request,
        CourseGroup $courseGroup
    )
    {
        $actor = $request->user();
        $data = $this->courseGroupMembershipService->removeStudentFromGroup(
            (int) $request->validated('student_id'),
            $courseGroup,
            $actor
        );
        return $this->success($data);
    }

    public function getWithNotifications(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupQueryService->getWithNotifications(
            $courseGroup,
            request()->user()
        );
        if (request()->user()->hasRoleCode('STUDENT')) {
            $data->makeHidden('join_code');
        }
        return $this->success(CourseGroupResource::make($data)->resolve(request()));
    }

    public function getForStudentDetail(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupQueryService->getForStudentDetail(
            $courseGroup,
            request()->user()
        );
        if (request()->user()->hasRoleCode('STUDENT')) {
            $data->makeHidden('join_code');
        }
        return $this->success(CourseGroupResource::make($data)->resolve(request()));
    }

    public function getOfTeacher(User $user)
    {
        $data = $this->courseGroupQueryService->getOfTeacher($user, request()->user());
        return $this->success($data);
    }
}
