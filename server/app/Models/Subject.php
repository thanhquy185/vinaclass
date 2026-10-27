<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        "subject_code",
        "subject_name",
        "credit_count",
        "theory_hours",
        "practice_hours",
        "is_deleted"
    ];

    protected $hidden = [];

    protected $casts = [
        "is_deleted" => "boolean"
    ];

    public function courseGroups()
    {
        return $this->hasMany(CourseGroup::class, 'subject_id');
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class, 'subject_id');
    }
}
