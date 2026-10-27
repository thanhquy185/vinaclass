<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDifficultyRequest;
use App\Http\Requests\UpdateDifficultyRequest;
use App\Http\Resources\DifficultyResource;
use App\Models\Difficulty;
use App\Services\DifficultyService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class DifficultyController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private DifficultyService $difficultyService) {}
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $data = $this->difficultyService->getAll($request->user());

        return $this->success(DifficultyResource::collection($data));
    }

    public function store(StoreDifficultyRequest $request)
    {
        $difficulty = $this->difficultyService->create($request->validated(), $request->user());

        return $this->created(new DifficultyResource($difficulty));
    }

    public function show(Difficulty $difficulty, Request $request)
    {
        $data = $this->difficultyService->getOne($difficulty, $request->user());

        return $this->success(new DifficultyResource($data));
    }

    public function update(
        UpdateDifficultyRequest $request,
        Difficulty $difficulty
    ) {
        $difficulty = $this->difficultyService->update(
            $difficulty,
            $request->validated(),
            $request->user()
        );

        return $this->updated(new DifficultyResource($difficulty));
    }

    public function destroy(Difficulty $difficulty, Request $request)
    {
        $data = $this->difficultyService->delete($difficulty, $request->user());

        return $this->success($data);
    }
}
