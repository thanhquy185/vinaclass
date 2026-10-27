<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseGroupNotificationRequest;
use App\Http\Requests\UpdateCourseGroupNotificationRequest;
use App\Models\CourseGroupNotification;
use App\Services\CourseGroupNotificationService;
use App\Traits\ApiResponseTrait;

class CourseGroupNotificationController extends Controller
{
    use ApiResponseTrait;

    private CourseGroupNotificationService $courseGroupNotificationService;

    public function __construct(
        CourseGroupNotificationService $courseGroupNotificationService
    ) {
        $this->courseGroupNotificationService = $courseGroupNotificationService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->courseGroupNotificationService->getAll();
        return $this->success($data);
    }

    public function store(StoreCourseGroupNotificationRequest $request)
    {
        $data = $this->courseGroupNotificationService->add($request->validated());
        return $this->created($data);
    }

    public function show(CourseGroupNotification $courseGroupNotification)
    {
        $data = $this->courseGroupNotificationService->getOne($courseGroupNotification);
        return $this->success($data);
    }

    public function update(
        UpdateCourseGroupNotificationRequest $request,
        CourseGroupNotification $courseGroupNotification
    ) {
        $data = $this->courseGroupNotificationService->update(
            $request->validated(),
            $courseGroupNotification
        );
        return $this->success($data);
    }

    public function destroy(CourseGroupNotification $courseGroupNotification)
    {
        $data = $this->courseGroupNotificationService->delete($courseGroupNotification);
        return $this->success($data);
    }
}