<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseGroupStudentRequest;
use App\Http\Requests\UpdateCourseGroupStudentRequest;
use App\Models\CourseGroupStudent;
use App\Services\CourseGroupStudentService;
use App\Traits\ApiResponseTrait;

class CourseGroupStudentController extends Controller
{
    use ApiResponseTrait;

    private CourseGroupStudentService $courseGroupStudentService;

    public function __construct(
        CourseGroupStudentService $courseGroupStudentService
    ) {
        $this->courseGroupStudentService = $courseGroupStudentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->courseGroupStudentService->getAll();
        return $this->success($data);
    }

    public function store(StoreCourseGroupStudentRequest $request)
    {
        $data = $this->courseGroupStudentService->add($request->validated());
        return $this->created($data);
    }

    public function show(CourseGroupStudent $courseGroupStudent)
    {
        $data = $this->courseGroupStudentService->getOne($courseGroupStudent);
        return $this->success($data);
    }

    public function update(
        UpdateCourseGroupStudentRequest $request,
        CourseGroupStudent $courseGroupStudent
    ) {
        $data = $this->courseGroupStudentService->update(
            $request->validated(),
            $courseGroupStudent
        );
        return $this->success($data);
    }

    public function destroy(CourseGroupStudent $courseGroupStudent)
    {
        $data = $this->courseGroupStudentService->delete($courseGroupStudent);
        return $this->success($data);
    }
}