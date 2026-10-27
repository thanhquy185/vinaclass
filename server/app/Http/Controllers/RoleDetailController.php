<?php

namespace App\Http\Controllers;

use App\Models\RoleDetail;
use App\Policies\RolePolicy;
use App\Traits\ApiResponseTrait;

class RoleDetailController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private RolePolicy $rolePolicy)
    {
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        abort_unless($this->rolePolicy->viewAny(request()->user()), 403);

        $data = RoleDetail::all();
        return $this->success($data);
    }

}
