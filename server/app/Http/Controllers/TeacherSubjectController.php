<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherSubjectRequest;
use App\Http\Requests\StoreTeacherSubjectsRequest;
use App\Models\User;
use App\Services\TeacherSubjectService;
use App\Traits\ApiResponseTrait;

class TeacherSubjectController extends Controller
{
    use ApiResponseTrait;

    private TeacherSubjectService $teacherSubjectService;

    public function __construct(TeacherSubjectService $teacherSubjectService)
    {
        $this->teacherSubjectService = $teacherSubjectService;
    }

    public function index()
    {
        $data = $this->teacherSubjectService->getAll();
        return $this->success($data);
    }

    public function store(StoreTeacherSubjectRequest $request)
    {
        $data = $this->teacherSubjectService->add($request->validated());
        return $this->success($data, 201);
    }

    public function destroy(int $teacherId, int $subjectId){
        $data = $this->teacherSubjectService->delete($teacherId, $subjectId);
        return $this->success($data);
    }

    public function getOfTeacher(User $user){
        $data = $this->teacherSubjectService->getOfTeacher($user);
        return $this->success($data);
    }

    public function syncAssignments(StoreTeacherSubjectsRequest $request){
        $data = $this->teacherSubjectService->syncAssignments($request->validated());
        return $this->success($data);
    }

}
