<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnswerOptionRequest;
use App\Http\Requests\UpdateAnswerOptionRequest;
use App\Models\AnswerOption;
use App\Services\AnswerOptionService;
use App\Traits\ApiResponseTrait;

class AnswerOptionController extends Controller
{
    use ApiResponseTrait;

    protected AnswerOptionService $answerOptionService;

    public function __construct(AnswerOptionService $answerOptionService)
    {
        $this->answerOptionService = $answerOptionService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->answerOptionService->getAll();
        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAnswerOptionRequest $request)
    {
        $data = $this->answerOptionService->add($request->validated());
        return $this->success($data, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(AnswerOption $answerOption)
    {
        $data = $this->answerOptionService->getOne($answerOption);
        return $this->success($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAnswerOptionRequest $request, AnswerOption $answerOption)
    {
        $data = $this->answerOptionService->update($request->validated(), $answerOption);
        return $this->success($data);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AnswerOption $answerOption)
    {
        $result = $this->answerOptionService->delete($answerOption);
        return $this->success($result);
    }
}
