<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNotificationRequest;
use App\Http\Requests\UpdateNotificationRequest;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Models\CourseGroup;
use App\Services\NotificationService;
use App\Services\NotificationQueryService;
use App\Traits\ApiResponseTrait;

class NotificationController extends Controller
{
    use ApiResponseTrait;

    private NotificationService $notificationService;
    private NotificationQueryService $notificationQueryService;

    public function __construct(
        NotificationService $notificationService,
        NotificationQueryService $notificationQueryService
    ) {
        $this->notificationService = $notificationService;
        $this->notificationQueryService = $notificationQueryService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->notificationQueryService->getAll(request()->user());
        if (request()->user()->hasRoleCode('STUDENT')) {
            $data->each(function ($notification) {
                $notification->courseGroups->each(fn ($group) => $group->makeHidden('join_code'));
            });
        }
        return $this->success(NotificationResource::collection($data)->resolve(request()));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreNotificationRequest $request)
    {
        $payload = $request->validated();
        $data = $this->notificationService->add($payload, $request->user());
        return $this->created($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(Notification $notification)
    {
        $data = $this->notificationQueryService->getOne($notification, request()->user());
        if (request()->user()->hasRoleCode('STUDENT')) {
            $data->courseGroups->each(fn ($group) => $group->makeHidden('join_code'));
        }
        return $this->success(NotificationResource::make($data)->resolve(request()));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNotificationRequest $request, Notification $notification)
    {
        $data = $this->notificationService->update(
            $request->validated(),
            $notification,
            $request->user()
        );
        return $this->success($data);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Notification $notification)
    {
        $data = $this->notificationService->delete($notification, request()->user());
        return $this->success($data);
    }

    public function removeFromCourseGroup(Notification $notification, CourseGroup $courseGroup)
    {
        return $this->success(
            $this->notificationService->removeFromCourseGroup(
                $notification,
                $courseGroup->id,
                request()->user()
            )
        );
    }
}
