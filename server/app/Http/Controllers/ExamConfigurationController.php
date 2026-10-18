<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamConfigurationRequest;
use App\Http\Requests\UpdateExamConfigurationRequest;
use App\Http\Resources\ExamConfigurationResource;
use App\Models\ExamConfiguration;
use App\Services\ExamConfigurationService;
use App\Traits\ApiResponseTrait;

class ExamConfigurationController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private ExamConfigurationService $examConfigurationService
    ) {}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $data = $this->examConfigurationService->getAll();

        return $this->success(
            ExamConfigurationResource::collection($data)
        );
    }

    public function store(StoreExamConfigurationRequest $request)
    {
        $data = $this->examConfigurationService->create(
            $request->validated()
        );

        return $this->created(
            new ExamConfigurationResource($data)
        );
    }

    public function show(ExamConfiguration $examConfiguration)
    {
        $data = $this->examConfigurationService->getOne(
            $examConfiguration
        );

        return $this->success(
            new ExamConfigurationResource($data)
        );
    }

    public function update(
        UpdateExamConfigurationRequest $request,
        ExamConfiguration $examConfiguration
    ) {
        $data = $this->examConfigurationService->update(
            $examConfiguration,
            $request->validated()
        );

        return $this->updated(
            new ExamConfigurationResource($data)
        );
    }

    public function destroy(ExamConfiguration $examConfiguration)
    {
        $this->examConfigurationService->delete($examConfiguration);

        return $this->deleted();
    }
}
