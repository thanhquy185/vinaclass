<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChapterRequest;
use App\Http\Requests\UpdateChapterRequest;
use App\Http\Resources\ChapterResource;
use App\Models\Chapter;
use App\Models\Subject;
use App\Services\ChapterService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class ChapterController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private ChapterService $chapterService) {}
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $data = $this->chapterService->getAll($request->user());
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
        $chapter = $this->chapterService->create($request->validated(), $request->user());
        return $this->created(new ChapterResource($chapter->load('subject')));
    }

    /**
     * Display the specified resource.
     *
     * @param  Chapter  $chapter
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Chapter $chapter, Request $request)
    {
        $chapter = $this->chapterService->getOne($chapter, $request->user());
        return $this->success(new ChapterResource($chapter));
    }

    public function update(UpdateChapterRequest $request, Subject $subject)
    {
        $updatedChapter = $this->chapterService->update(
            $subject,
            $request->validated(),
            $request->user()
        );
        return $this->success($updatedChapter);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Chapter  $chapter
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Chapter $chapter, Request $request)
    {
        $this->chapterService->delete($chapter, $request->user());
        return $this->deleted();
    }

    public function getBySubject(Subject $subject, Request $request)
    {
        $data = $this->chapterService->getBySubject($subject, $request->user());
        return $this->success($data);
    }
}
