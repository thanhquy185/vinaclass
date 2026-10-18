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
        "icon_url"
    ];

    protected $hidden = [];

    protected $casts = [];

    public function roleDetails()
    {
        return $this->hasMany(RoleDetail::class, 'function_id');
    }
}
