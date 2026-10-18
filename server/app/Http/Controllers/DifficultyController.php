<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDifficultyRequest;
use App\Http\Requests\UpdateDifficultyRequest;
use App\Http\Resources\DifficultyResource;
use App\Models\Difficulty;
use App\Services\DifficultyService;
use App\Traits\ApiResponseTrait;

class DifficultyController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private DifficultyService $difficultyService) {}
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $data = $this->difficultyService->getAll();

        return $this->success(DifficultyResource::collection($data));
    }

    public function store(StoreDifficultyRequest $request)
    {
        $difficulty = $this->difficultyService->create($request->validated());

        return $this->created(new DifficultyResource($difficulty));
    }

    public function show(Difficulty $difficulty)
    {
        $data = $this->difficultyService->getOne($difficulty);

        return $this->success(new DifficultyResource($data));
    }

    public function update(
        UpdateDifficultyRequest $request,
        Difficulty $difficulty
    ) {
        $difficulty = $this->difficultyService->update(
            $difficulty,
            $request->validated()
        );

        return $this->updated(new DifficultyResource($difficulty));
    }

    public function destroy(Difficulty $difficulty)
    {
        $data = $this->difficultyService->delete($difficulty);

        return $this->success($data);
    }
}
