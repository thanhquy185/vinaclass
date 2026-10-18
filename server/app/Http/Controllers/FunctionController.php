<?php

namespace App\Http\Controllers;

use App\Models\FunctionModel;
use App\Traits\ApiResponseTrait;

class FunctionController extends Controller
{
    use ApiResponseTrait;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $data = FunctionModel::all();
        return $this->success($data);
    }

    // /**
    //  * Store a newly created resource in storage.
    //  *
    //  * @param  \App\Http\Requests\StoreActionRequest  $request
    //  * @return \Illuminate\Http\Response
    //  */
    // public function store(StoreActionRequest $request)
    // {
    //     //
    // }

    // /**
    //  * Display the specified resource.
    //  *
    //  * @param  \App\Models\Action  $action
    //  * @return \Illuminate\Http\Response
    //  */
    // public function show(FunctionModel $action)
    // {
        
    // }

    // /**
    //  * Update the specified resource in storage.
    //  *
    //  * @param  \App\Http\Requests\UpdateActionRequest  $request
    //  * @param  \App\Models\Action  $action
    //  * @return \Illuminate\Http\Response
    //  */
    // public function update(UpdateActionRequest $request, FunctionModel $action)
    // {
    //     //
    // }

    // /**
    //  * Remove the specified resource from storage.
    //  *
    //  * @param  \App\Models\Action  $action
    //  * @return \Illuminate\Http\Response
    //  */
    // public function destroy(FunctionModel $action)
    // {
    //     //
    // }
}
