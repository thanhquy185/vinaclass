<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAssignment extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        "exam_id",
        "course_group_id",
        "start_time",
        "end_time"
    ];

    protected $hidden = [];

    protected $casts = [
        "start_time" => "datetime",
        "end_time" => "datetime"
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    public function courseGroup()
    {
        return $this->belongsTo(CourseGroup::class, 'course_group_id');
    }
}
