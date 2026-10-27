<?php

namespace App\Services;

use App\Models\CourseGroup;
use App\Models\CourseGroupMaterial;
use App\Models\User;
use App\Policies\CourseGroupMaterialPolicy;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class CourseGroupMaterialService
{
    public function __construct(
        private CourseGroupMaterialPolicy $policy,
        private UserProfileService $userProfileService,
        private CourseGroupMaterialFileService $fileService
    ) {
    }

    public function create(CourseGroup $courseGroup, User $creator, array $data): CourseGroupMaterial
    {
        $courseGroupId = (int) $courseGroup->id;
        /** @var UploadedFile $file */
        $file = $data['file'];
        $path = $this->fileService->storePrivate(
            $file,
            'course-materials/' . $courseGroupId,
            'Unable to store the uploaded course material.'
        );

        try {
            $material = DB::transaction(function () use ($courseGroupId, $creator, $data, $file, $path): CourseGroupMaterial {
                $lockedCreator = $this->lockActor($creator);
                $lockedCourseGroup = CourseGroup::query()
                    ->lockForUpdate()
                    ->findOrFail($courseGroupId);
                abort_unless($this->policy->create($lockedCreator, $lockedCourseGroup), 403);

                return CourseGroupMaterial::query()->create([
                    'course_group_id' => $lockedCourseGroup->id,
                    'creator_id' => $lockedCreator->id,
                    'title' => trim($data['title']),
                    'description' => $this->normalizeDescription($data['description'] ?? null),
                    'storage_disk' => 'private',
                    'storage_path' => $path,
                    'original_file_name' => $this->safeOriginalName($file),
                    'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                    'file_size' => (int) $file->getSize(),
                ]);
            });
        } catch (Throwable $exception) {
            $this->fileService->delete('private', $path);
            throw $exception;
        }

        $material->load('creator');
        $this->loadCreatorProfile($material);

        return $material;
    }

    public function update(CourseGroupMaterial $material, array $data, User $actor): CourseGroupMaterial
    {
        $materialId = (int) $material->id;
        $courseGroupId = (int) $material->course_group_id;
        $file = $data['file'] ?? null;
        $newPath = $file instanceof UploadedFile
            ? $this->fileService->storePrivate(
                $file,
                'course-materials/' . $courseGroupId,
                'Unable to store the replacement course material.'
            )
            : null;
        try {
            [$material, $previousFile] = DB::transaction(function () use ($materialId, $courseGroupId, $actor, $data, $file, $newPath): array {
                $lockedActor = $this->lockActor($actor);
                $lockedCourseGroup = CourseGroup::query()
                    ->lockForUpdate()
                    ->findOrFail($courseGroupId);
                $lockedMaterial = CourseGroupMaterial::query()
                    ->where('course_group_id', $lockedCourseGroup->id)
                    ->lockForUpdate()
                    ->findOrFail($materialId);

                if ($lockedMaterial->is_deleted) {
                    throw (new ModelNotFoundException())->setModel(CourseGroupMaterial::class, [$materialId]);
                }

                $lockedMaterial->setRelation('courseGroup', $lockedCourseGroup);
                abort_unless($this->policy->update($lockedActor, $lockedMaterial), 403);

                $previousFile = null;
                if (array_key_exists('title', $data)) {
                    $lockedMaterial->title = trim($data['title']);
                }

                if (array_key_exists('description', $data)) {
                    $lockedMaterial->description = $this->normalizeDescription($data['description']);
                }

                if ($file instanceof UploadedFile && $newPath !== null) {
                    $previousFile = [$lockedMaterial->storage_disk, $lockedMaterial->storage_path];
                    $lockedMaterial->storage_disk = 'private';
                    $lockedMaterial->storage_path = $newPath;
                    $lockedMaterial->original_file_name = $this->safeOriginalName($file);
                    $lockedMaterial->mime_type = $file->getMimeType() ?: 'application/octet-stream';
                    $lockedMaterial->file_size = (int) $file->getSize();
                }

                $lockedMaterial->save();

                return [$lockedMaterial, $previousFile];
            });
        } catch (Throwable $exception) {
            if ($newPath !== null) {
                $this->fileService->delete('private', $newPath);
            }
            throw $exception;
        }

        if ($previousFile !== null) {
            $this->fileService->delete($previousFile[0], $previousFile[1]);
        }

        $material->refresh()->load('creator');
        $this->loadCreatorProfile($material);

        return $material;
    }

    public function delete(CourseGroupMaterial $material, User $actor): void
    {
        $materialId = (int) $material->id;
        $courseGroupId = (int) $material->course_group_id;

        [$disk, $path] = DB::transaction(function () use ($materialId, $courseGroupId, $actor): array {
            $lockedActor = $this->lockActor($actor);
            $lockedCourseGroup = CourseGroup::query()
                ->lockForUpdate()
                ->findOrFail($courseGroupId);
            $lockedMaterial = CourseGroupMaterial::query()
                ->where('course_group_id', $lockedCourseGroup->id)
                ->lockForUpdate()
                ->findOrFail($materialId);

            if ($lockedMaterial->is_deleted) {
                throw (new ModelNotFoundException())->setModel(CourseGroupMaterial::class, [$materialId]);
            }

            $lockedMaterial->setRelation('courseGroup', $lockedCourseGroup);
            abort_unless($this->policy->delete($lockedActor, $lockedMaterial), 403);

            $lockedMaterial->is_deleted = true;
            $lockedMaterial->save();

            return [$lockedMaterial->storage_disk, $lockedMaterial->storage_path];
        });

        $this->fileService->delete($disk, $path);
    }

    private function normalizeDescription(?string $description): ?string
    {
        $description = $description === null ? null : trim($description);

        return $description === '' ? null : $description;
    }

    private function lockActor(User $actor): User
    {
        return User::query()
            ->with('role')
            ->lockForUpdate()
            ->findOrFail($actor->id);
    }

    private function loadCreatorProfile(CourseGroupMaterial $material): void
    {
        $creator = $material->creator;

        if ($creator) {
            $this->userProfileService->loadPersonalProfiles($creator);
        }
    }

    private function safeOriginalName(UploadedFile $file): string
    {
        $name = basename(str_replace('\\', '/', $file->getClientOriginalName()));
        $name = preg_replace('/[\x00-\x1F\x7F]/u', '', $name) ?: 'material';

        return Str::limit($name, 255, '');
    }
}
