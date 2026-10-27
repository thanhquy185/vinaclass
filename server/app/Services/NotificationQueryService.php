<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Policies\NotificationPolicy;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class NotificationQueryService
{
    public function __construct(
        private NotificationPolicy $notificationPolicy,
        private UserProfileService $userProfileService
    ) {
    }

    public function getAll(?User $viewer = null): EloquentCollection
    {
        if (!$viewer || !$this->notificationPolicy->viewCatalog($viewer)) {
            return Notification::query()->whereRaw('1 = 0')->get();
        }

        $groups = fn ($query) => $query
            ->where('course_groups.is_deleted', false)
            ->with('subject');
        $query = Notification::query()->with(['sender', 'courseGroups' => $groups]);

        if ($viewer->hasRoleCode('ADMIN') || $viewer->isCustomRole()) {
            return $this->loadSenderProfiles($query->get());
        }

        if ($viewer->hasRoleCode('TEACHER')) {
            $query->where(function ($visible) use ($viewer) {
                $visible->where('sender_id', $viewer->id)
                    ->orWhereHas('courseGroups', fn ($groups) => $groups
                        ->where('course_groups.teacher_id', $viewer->id)
                        ->where('course_groups.is_deleted', false));
            });
            $query->with(['courseGroups' => fn ($groups) => $groups
                ->where('course_groups.teacher_id', $viewer->id)
                ->where('course_groups.is_deleted', false)
                ->with('subject')]);

            return $this->loadSenderProfiles($query->get());
        }

        $groupIds = $viewer->courseGroups()
            ->where('course_groups.is_deleted', false)
            ->pluck('course_groups.id');
        $query->where('status', true)
            ->whereHas('courseGroups', fn ($groups) => $groups
                ->whereIn('course_groups.id', $groupIds)
                ->where('course_groups.is_deleted', false))
            ->with(['courseGroups' => fn ($groups) => $groups
                ->whereIn('course_groups.id', $groupIds)
                ->where('course_groups.is_deleted', false)
                ->with('subject')]);

        return $this->loadSenderProfiles($query->get());
    }

    public function getOne(Notification $notification, User $viewer): Notification
    {
        $this->assertCanView($notification, $viewer);

        $groups = $notification->courseGroups()->where('course_groups.is_deleted', false);
        if ($viewer->hasRoleCode('TEACHER')) {
            $groups->where('course_groups.teacher_id', $viewer->id);
        } elseif ($viewer->hasRoleCode('STUDENT')) {
            $groupIds = $viewer->courseGroups()
                ->where('course_groups.is_deleted', false)
                ->pluck('course_groups.id');
            $groups->whereIn('course_groups.id', $groupIds);
        }

        $notification->load('sender')->setRelation(
            'courseGroups',
            $groups->with('subject')->get()
        );
        $this->loadSenderProfiles(new EloquentCollection([$notification]));

        return $notification;
    }

    public function assertCanView(Notification $notification, User $viewer): void
    {
        abort_unless($this->notificationPolicy->view($viewer, $notification), 403);
    }

    private function loadSenderProfiles(EloquentCollection $notifications): EloquentCollection
    {
        $senders = collect($notifications)
            ->map(fn (Notification $notification) => $notification->sender)
            ->filter(fn ($sender) => $sender instanceof User)
            ->unique('id')
            ->values();

        if ($senders->isNotEmpty()) {
            $this->userProfileService->loadPersonalProfiles(
                new EloquentCollection($senders->all())
            );
        }

        return $notifications;
    }
}
