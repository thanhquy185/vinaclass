<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Policies\UserPolicy;
use App\Services\UserProfileService;
use DateTimeInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        $profileService = app(UserProfileService::class);
        $profile = [
            'full_name' => $profileService->personalValue($this->resource, 'full_name'),
            'phone' => $profileService->personalValue($this->resource, 'phone'),
            'date_of_birth' => $this->formatDate(
                $profileService->personalValue($this->resource, 'date_of_birth')
            ),
            'is_female' => $profileService->personalValue($this->resource, 'is_female'),
            'avatar_url' => $profileService->personalValue($this->resource, 'avatar_url'),
        ];

        $data = [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'role_id' => $this->role_id,
            'role_code' => $this->resource->relationLoaded('role')
                ? $this->resource->roleCode()
                : null,
            'profile' => $profile,
            'teacher_profile' => $this->when(
                $this->resource->hasRoleCode('TEACHER')
                    && $this->canViewRoleProfile($request)
                    && $this->resource->relationLoaded('teacherProfile'),
                function (): ?array {
                    $teacherProfile = $this->resource->getRelation('teacherProfile');

                    return $teacherProfile?->only([
                        'teacher_code',
                        'department_name',
                        'academic_title',
                    ]);
                }
            ),
            'student_profile' => $this->when(
                $this->resource->hasRoleCode('STUDENT')
                    && $this->canViewRoleProfile($request)
                    && $this->resource->relationLoaded('studentProfile'),
                function (): ?array {
                    $studentProfile = $this->resource->getRelation('studentProfile');

                    return $studentProfile?->only([
                        'student_code',
                        'program_name',
                        'cohort',
                    ]);
                }
            ),
            'ggid' => $this->ggid,
            'is_locked' => $this->is_locked,
            'is_deleted' => $this->is_deleted,
            'last_login' => $this->last_login,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'role' => $this->whenLoaded('role', function () {
                return $this->role
                    ? (new RoleResource($this->role))->resolve()
                    : null;
            }),
            'course_groups' => $this->whenLoaded('courseGroups', function () use ($request) {
                $courseGroups = $this->courseGroups;
                $teachers = $courseGroups->pluck('teacher')
                    ->filter(fn ($teacher) => $teacher instanceof User)
                    ->values();

                if ($teachers->isNotEmpty()) {
                    app(UserProfileService::class)->loadPersonalProfiles(
                        new \Illuminate\Database\Eloquent\Collection($teachers->all())
                    );
                }

                return CourseGroupResource::collection($courseGroups)->resolve($request);
            }),
        ];

        $viewer = $request->user();
        if ($viewer?->hasRoleCode('STUDENT') && !$viewer->is($this->resource)) {
            return self::hidePrivateFieldsFromStudent($data);
        }

        return $data;
    }

    public static function serializeForViewer(User $user, Request $request): array
    {
        $data = static::make($user)->resolve($request);

        return $request->user()?->hasRoleCode('STUDENT')
            ? self::hidePrivateFieldsFromStudent($data)
            : $data;
    }

    private static function hidePrivateFieldsFromStudent(array $data): array
    {
        if (isset($data['profile']) && is_array($data['profile'])) {
            $data['profile'] = array_intersect_key(
                $data['profile'],
                array_flip(['full_name', 'avatar_url'])
            );
        }

        unset(
            $data['username'],
            $data['email'],
            $data['ggid'],
            $data['last_login'],
            $data['role_id'],
            $data['role'],
            $data['is_locked'],
            $data['is_deleted'],
            $data['created_at'],
            $data['updated_at']
        );

        return $data;
    }

    private function formatDate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return $value instanceof DateTimeInterface
            ? $value->format('Y-m-d')
            : substr((string) $value, 0, 10);
    }

    private function canViewRoleProfile(Request $request): bool
    {
        $viewer = $request->user();

        return $viewer !== null
            && ($viewer->is($this->resource)
                || app(UserPolicy::class)->viewAny($viewer));
    }
}
