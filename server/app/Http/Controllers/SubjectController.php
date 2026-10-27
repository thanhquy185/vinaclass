<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\Subject;
use App\Models\User;
use App\Services\SubjectService;
use App\Traits\ApiResponseTrait;
use Illuminate\Support\Facades\Auth;

class SubjectController extends Controller
{
    use ApiResponseTrait;

    private SubjectService $subjectService;

    public function __construct(SubjectService $subjectService)
    {
        $this->subjectService = $subjectService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->subjectService->getAll(Auth::user());
        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubjectRequest $request)
    {
        $data = $this->subjectService->add($request->validated(), $request->user());
        return $this->created($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        $data = $this->subjectService->getOne($subject, Auth::user());
        return $this->success($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubjectRequest $request, Subject $subject)
    {
        $data = $this->subjectService->update($request->validated(), $subject, $request->user());
        return $this->success($data);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        $data = $this->subjectService->delete($subject, Auth::user());
        return $this->success($data);
    }

    public function getWithCourseGroups()
    {
        $data = $this->subjectService->getWithCourseGroups(Auth::user());
        return $this->success($data);
    }

    public function getCourseGroupsForExam(Subject $subject)
    {
        $data = $this->subjectService->getCourseGroupsForExam($subject, Auth::user());
        return $this->success($data);
    }

    public function getWithChapters()
    {
        $data = $this->subjectService->getWithChapters(Auth::user());
        return $this->success($data);
    }

    public function getOfTeacher(User $user)
    {
        $data = $this->subjectService->getOfTeacher($user, Auth::user());
        return $this->success($data);
    }
}
