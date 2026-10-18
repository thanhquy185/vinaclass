<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\Subject;
use App\Models\User;
use App\Services\SubjectService;
use App\Traits\ApiResponseTrait;

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
        $data = $this->subjectService->getAll();
        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubjectRequest $request)
    {
        $data = $this->subjectService->add($request->validated());
        return $this->success($data, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        $data = $this->subjectService->getOne($subject);
        return $this->success($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubjectRequest $request, Subject $subject)
    {
        $data = $this->subjectService->update($request->validated(), $subject);
        return $this->success($data);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        $data = $this->subjectService->delete($subject);
        return $this->success($data);
    }

    public function getWithCourseGroups(){
        $data = $this->subjectService->getWithCourseGroups();
        return $this->success($data);
    }

    public function getWithChapters(){
        $data = $this->subjectService->getWithChapters();
        return $this->success($data);
    }

    public function getOfTeacher(User $user){
        $data = $this->subjectService->getOfTeacher($user);
        return $this->success($data);
    }
}
