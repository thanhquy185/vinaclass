<?php

namespace App\Http\Controllers;

use App\Models\RoleDetail;
use App\Traits\ApiResponseTrait;

class RoleDetailController extends Controller
{
    use ApiResponseTrait;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $data = RoleDetail::all();
        return $this->success($data);
    }

}
