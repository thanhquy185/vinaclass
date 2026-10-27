<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = [
        'function_id',
        'code',
        'action_code',
        'name_vi',
        'name_en',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function function()
    {
        return $this->belongsTo(FunctionModel::class, 'function_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
            ->withTimestamps();
    }

    public function permissionDetails()
    {
        return $this->hasMany(PermissionDetail::class, 'permission_id');
    }
}
