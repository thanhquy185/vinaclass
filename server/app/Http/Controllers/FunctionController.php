<?php

namespace App\Http\Controllers;

use App\Models\FunctionModel;
use App\Policies\RolePolicy;
use App\Services\IdentityV2\IdentityV2Definitions;
use App\Traits\ApiResponseTrait;
use Illuminate\Support\Facades\Schema;

class FunctionController extends Controller
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

        $query = FunctionModel::query()->where('is_deleted', false);

        if (Schema::hasColumn('functions', 'status')) {
            $query->where('status', true);
        }

        if (Schema::hasTable('permissions')) {
            $query->whereHas('permissions', function ($permissionQuery): void {
                if (Schema::hasColumn('permissions', 'status')) {
                    $permissionQuery->where('status', true);
                }
            });
        }

        if (Schema::hasColumn('functions', 'sort_order')) {
            $query->orderBy('sort_order');
        }

        $data = $query->orderBy('id')->get()->each(function (FunctionModel $function): void {
            $function->setAttribute(
                'action_codes',
                IdentityV2Definitions::FUNCTION_ACTIONS[$function->function_name] ?? []
            );
        });

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
