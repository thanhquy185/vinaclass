<?php

namespace App\Http\Controllers;

use App\Exceptions\BusinessException;
use App\Helpers\XlsxExportHelper;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exceptions\NotFoundException;
use App\Http\Requests\JoinGroupRequest;
use App\Http\Requests\StoreCourseGroupRequest;
use App\Http\Requests\UpdateCourseGroupRequest;
use App\Models\CourseGroup;
use App\Models\User;
use App\Services\CourseGroupService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CourseGroupController extends Controller
{
    use ApiResponseTrait;

    private CourseGroupService $courseGroupService;
    private XlsxExportHelper $xlsxExportHelper;

    public function __construct(CourseGroupService $courseGroupService, XlsxExportHelper $xlsxExportHelper)
    {
        $this->courseGroupService = $courseGroupService;
        $this->xlsxExportHelper = $xlsxExportHelper;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->courseGroupService->getAll();
        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseGroupRequest $request)
    {
        $data = $this->courseGroupService->add($request->validated());
        return $this->created($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupService->getOne($courseGroup);
        // $data = $courseGroup;
        return $this->success($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseGroupRequest $request, CourseGroup $courseGroup)
    {
        $data = $this->courseGroupService->update($request->validated(), $courseGroup);
        return $this->success($data);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupService->delete($courseGroup);
        return $this->success($data);
    }

    public function hide(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupService->hide($courseGroup);
        return $this->success($data);
    }

    public function getWithTeacherAndSubject(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupService->getWithTeacherAndSubject($courseGroup);
        return $this->success($data);
    }

    public function getWithExams(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupService->getWithExams($courseGroup);
        return $this->success($data);
    }

    public function joinGroup(JoinGroupRequest $request)
    {
        $data = $this->courseGroupService->joinGroup($request->validated());
        return $this->success($data, 201);
    }

    public function getOfStudent(User $user)
    {
        $data = $this->courseGroupService->getOfStudent($user);
        return $this->success($data);
    }

    public function getStudentList(CourseGroup $courseGroup, Request $request)
    {
        $keyword = $request->query('keyword');
        $data = $this->courseGroupService->getStudentList($courseGroup, $keyword);
        return $this->success($data);
    }

    public function addStudentToGroup(Request $request, CourseGroup $courseGroup)
    {
        $username = $request->input('username');
        if (empty($username)) {
            throw new BusinessException('Mã sinh viên không hợp lệ');
        }
        $data = $this->courseGroupService->addStudentToGroup($username, $courseGroup);
        return $this->success($data, 201);
    }

    public function resetInviteCode(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupService->resetInviteCode($courseGroup);
        return $this->success($data);
    }

    /**
     * Hiển thị danh sách học phần / nhóm lớp được phân công giảng dạy của một giảng viên.
     *
     * Query params:
     *   - includeHidden (bool, default false): có lấy cả nhóm đang ẩn không
     */
    public function getAssignedTeaching(User $user, Request $request)
    {
        $includeHidden = filter_var($request->query('includeHidden', false), FILTER_VALIDATE_BOOLEAN);
        $data = $this->courseGroupService->getAssignedTeachingByTeacherId($user->id, $includeHidden);
        return $this->success($data);
    }

    public function exportStudents(CourseGroup $courseGroup, Request $request): BinaryFileResponse
    {
        $keyword = $request->query('keyword');
        $export = $this->courseGroupService->getStudentsExport($courseGroup, $keyword);

        return $this->xlsxExportHelper->download(
            $export['fileNameAttributes'],
            $export['headerTitles'],
            $export['data']
        );
    }

    public function importStudents(CourseGroup $courseGroup, Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);
        $file = $request->file('file');

        $sheets = Excel::toArray(null, $file);
        if (empty($sheets) || empty($sheets[0])) {
            throw new NotFoundException('Import file is empty');
        }

        $rows = $sheets[0];

        $firstRow = $rows[0] ?? null;
        if ($firstRow && count($firstRow) >= 2 && in_array(trim((string)$firstRow[1]), ['MSSV', 'mssv', 'Mã sinh viên'])) {
            array_shift($rows);
        }

        $result = $this->courseGroupService->importStudentsToGroup($courseGroup, $rows);
        return $this->success($result);
    }

    public function removeStudentFromGroup(CourseGroup $courseGroup, Request $request)
    {
        $studentId = $request->input('student_id');
        if (!is_numeric($studentId)) {
            throw new BusinessException('ID sinh viên không hợp lệ');
        }

        $data = $this->courseGroupService->removeStudentFromGroup((int)$studentId, $courseGroup);
        return $this->success($data);
    }

    public function getWithNotifications(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupService->getWithNotifications($courseGroup);
        return $this->success($data);
    }

    public function getForStudentDetail(CourseGroup $courseGroup)
    {
        $data = $this->courseGroupService->getForStudentDetail($courseGroup);
        return $this->success($data);
    }

    public function getOfTeacher(User $user)
    {
        $data = $this->courseGroupService->getOfTeacher($user);
        return $this->success($data);
    }
}
