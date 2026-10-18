<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChapterRequest;
use App\Http\Requests\UpdateChapterRequest;
use App\Http\Resources\ChapterResource;
use App\Models\Chapter;
use App\Models\Subject;
use App\Services\ChapterService;
use App\Traits\ApiResponseTrait;

class ChapterController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private ChapterService $chapterService) {}
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $data = Chapter::with('subject')->get();
        return $this->success(ChapterResource::collection($data));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  StoreChapterRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreChapterRequest $request)
    {
        $chapter = $this->chapterService->create($request->validated());
        return $this->created(new ChapterResource($chapter->load('subject')));
    }

    /**
     * Display the specified resource.
     *
     * @param  Chapter  $chapter
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Chapter $chapter)
    {
        return $this->success(new ChapterResource($chapter->load('subject')));
    }

    // update chương cho môn học
    public function update(UpdateChapterRequest $request, Subject $subject)
    {
        $updatedChapter = $this->chapterService->update($subject, $request->validated());
        return $this->success($updatedChapter);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Chapter  $chapter
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Chapter $chapter)
    {
        $chapter->deleteOrFail();
        return $this->deleted();
    }

    public function getBySubject(Subject $subject)
    {
        $data = $this->chapterService->getBySubject($subject);
        return $this->success($data);
    }
}
