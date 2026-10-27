<?php

namespace App\Services;

use App\Models\CourseGroup;
use App\Models\CourseGroupMaterial;
use App\Models\User;
use App\Policies\CourseGroupMaterialPolicy;
use Illuminate\Database\Eloquent\Collection;

class CourseGroupMaterialQueryService
{
    public function __construct(
        private CourseGroupMaterialPolicy $policy,
        private UserProfileService $userProfileService
    ) {
    }

    public function getForCourseGroup(CourseGroup $courseGroup, User $actor)
    {
        $currentCourseGroup = CourseGroup::query()->findOrFail($courseGroup->id);
        $currentActor = User::query()->with('role')->findOrFail($actor->id);
        abort_unless($this->policy->viewAny($currentActor, $currentCourseGroup), 403);

        $materials = CourseGroupMaterial::query()
            ->with('creator')
            ->where('course_group_id', $currentCourseGroup->id)
            ->where('is_deleted', false)
            ->latest('created_at')
            ->get();

        $creators = $materials->pluck('creator')->filter();
        if ($creators->isNotEmpty()) {
            $this->userProfileService->loadPersonalProfiles(
                new Collection($creators->all())
            );
        }

        return $materials;
    }
}
