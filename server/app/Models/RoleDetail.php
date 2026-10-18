<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoleDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        "role_id",
        "function_id",
        "action"
    ];

    protected $hidden = [];

    protected $casts = [];

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function function()
    {
        return $this->belongsTo(FunctionModel::class, 'function_id');
    }
}
