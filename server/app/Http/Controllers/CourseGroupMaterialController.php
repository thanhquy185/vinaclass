<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseGroupMaterialRequest;
use App\Http\Requests\UpdateCourseGroupMaterialRequest;
use App\Http\Resources\CourseGroupMaterialResource;
use App\Models\CourseGroup;
use App\Models\CourseGroupMaterial;
use App\Models\User;
use App\Services\CourseGroupMaterialService;
use App\Services\CourseGroupMaterialFileService;
use App\Services\CourseGroupMaterialQueryService;
use App\Traits\ApiResponseTrait;

class CourseGroupMaterialController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private CourseGroupMaterialService $service,
        private CourseGroupMaterialQueryService $queryService,
        private CourseGroupMaterialFileService $fileService
    ) {
    }

    public function index(CourseGroup $courseGroup)
    {
        $this->authorize('viewAny', [CourseGroupMaterial::class, $courseGroup]);
        $actor = request()->user();
        abort_unless($actor instanceof User, 401);

        return $this->success(
            CourseGroupMaterialResource::collection(
                $this->queryService->getForCourseGroup($courseGroup, $actor)
            )
                ->resolve(request())
        );
    }

    public function store(StoreCourseGroupMaterialRequest $request, CourseGroup $courseGroup)
    {
        $this->authorize('create', [CourseGroupMaterial::class, $courseGroup]);
        $material = $this->service->create($courseGroup, $request->user(), $request->validated());

        return $this->created(CourseGroupMaterialResource::make($material)->resolve($request));
    }

    public function update(
        UpdateCourseGroupMaterialRequest $request,
        CourseGroup $courseGroup,
        CourseGroupMaterial $material
    ) {
        $this->assertMaterialBelongsToCourseGroup($courseGroup, $material);
        $this->authorize('update', $material);
        $material = $this->service->update($material, $request->validated(), $request->user());

        return $this->success(CourseGroupMaterialResource::make($material)->resolve($request));
    }

    public function destroy(CourseGroup $courseGroup, CourseGroupMaterial $material)
    {
        $this->assertMaterialBelongsToCourseGroup($courseGroup, $material);
        $this->authorize('delete', $material);
        $this->service->delete($material, request()->user());

        return $this->success(null);
    }

    public function download(CourseGroup $courseGroup, CourseGroupMaterial $material)
    {
        $this->assertMaterialBelongsToCourseGroup($courseGroup, $material);
        $this->authorize('view', $material);

        return $this->fileService->download($material);
    }

    private function assertMaterialBelongsToCourseGroup(
        CourseGroup $courseGroup,
        CourseGroupMaterial $material
    ): void {
        abort_unless((int) $material->course_group_id === (int) $courseGroup->id, 404);
    }
}
