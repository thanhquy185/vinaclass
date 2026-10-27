<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FunctionModel extends Model
{
    use HasFactory;

    protected $table = 'functions';

    protected $fillable = [
        "function_name",
        "code",
        "name_vi",
        "name_en",
        "route_key",
        "icon_key",
        "sort_order",
        "parent_function_id",
        "status",
        "icon_url"
    ];

    protected $hidden = [];

    protected $casts = [
        'status' => 'boolean',
        'sort_order' => 'integer',
        'parent_function_id' => 'integer',
    ];

    public function roleDetails()
    {
        return $this->hasMany(RoleDetail::class, 'function_id');
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class, 'function_id');
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_function_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_function_id')->orderBy('sort_order');
    }
}
