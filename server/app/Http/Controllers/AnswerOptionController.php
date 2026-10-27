<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnswerOptionRequest;
use App\Http\Requests\UpdateAnswerOptionRequest;
use App\Models\AnswerOption;
use App\Services\AnswerOptionService;
use App\Services\QuestionQueryService;
use App\Traits\ApiResponseTrait;

class AnswerOptionController extends Controller
{
    use ApiResponseTrait;

    protected AnswerOptionService $answerOptionService;
    protected QuestionQueryService $questionQueryService;

    public function __construct(
        AnswerOptionService $answerOptionService,
        QuestionQueryService $questionQueryService
    ) {
        $this->answerOptionService = $answerOptionService;
        $this->questionQueryService = $questionQueryService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->questionQueryService->getAllAnswerOptions(request()->user());
        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAnswerOptionRequest $request)
    {
        $data = $this->answerOptionService->add($request->validated(), $request->user());
        return $this->created($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(AnswerOption $answerOption)
    {
        $data = $this->questionQueryService->getAnswerOption($answerOption, request()->user());
        return $this->success($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAnswerOptionRequest $request, AnswerOption $answerOption)
    {
        $data = $this->answerOptionService->update(
            $request->validated(),
            $answerOption,
            $request->user()
        );
        return $this->success($data);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AnswerOption $answerOption)
    {
        $result = $this->answerOptionService->delete($answerOption, request()->user());
        return $this->success($result);
    }
}
