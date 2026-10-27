<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherProfile extends Model
{
    protected $fillable = [
        'user_id',
        'teacher_code',
        'department_name',
        'academic_title',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
