<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionDetail extends Model
{
    protected $fillable = [
        'user_id',
        'permission_id',
        'effect',
        'changed_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permission_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
