<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePassWordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateOwnProfileRequest;
use App\Http\Requests\UpdateUserLockRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use App\Services\UserQueryService;
use App\Traits\ApiResponseTrait;

class UserController extends Controller
{
    use ApiResponseTrait;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    private UserService $userService;
    private UserQueryService $userQueryService;

    public function __construct(UserService $userService, UserQueryService $userQueryService)
    {
        $this->userService = $userService;
        $this->userQueryService = $userQueryService;
    }

    public function index()
    {
        $data = $this->userQueryService->getAll(request()->user());
        return $this->success(UserResource::collection($data));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    // public function create()
    // {
    //     //
    // }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreUserRequest $request)
    {
        $data = $this->userService->add($request->validated(), $request->user());
        return $this->success(new UserResource($data), code: 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        $data = $this->userQueryService->getOne($user, request()->user());
        return $this->success(new UserResource($data));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    // public function edit(UpdateUserRequest $user)
    // {

    // }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $this->userService->update($request->validated(), $user, $request->user());
        return $this->success(new UserResource($data));
    }

    public function updateLockStatus(UpdateUserLockRequest $request, User $user)
    {
        $data = $request->validated();
        $updated = $this->userService->updateLockStatus(
            $user,
            (bool) $data['is_locked'],
            $request->user()
        );

        return $this->success($updated);
    }

    public function updateOwnProfile(UpdateOwnProfileRequest $request)
    {
        $user = $this->userService->updateOwnProfile($request->validated(), $request->user());

        return $this->success(new UserResource($user));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        $data = $this->userService->delete($user, request()->user());
        return $this->success($data);
    }

    public function changePassword(ChangePassWordRequest $request, User $user)
    {
        $data = $this->userService->changePassword($request->validated(), $user, $request->user());
        return $this->success($data);
    }

    public function resetPassword(ResetPasswordRequest $request, User $user)
    {
        $data = $this->userService->resetPassword($request->validated(), $user, $request->user());
        return $this->success($data);
    }

    public function getTeachers()
    {
        $data = $this->userQueryService->getTeachers(request()->user());
        return $this->success(UserResource::collection($data));
    }

    public function getAssignableRoles()
    {
        $data = $this->userQueryService->getAssignableRoles(request()->user());
        return $this->success(\App\Http\Resources\RoleResource::collection($data));
    }
}
