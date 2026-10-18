<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        "subject_id",
        "creator_id",
        "exam_name",
        "start_time",
        "end_time",
        "duration_minutes",
        "is_deleted",
        "created_at"
    ];

    protected $hidden = [];

    protected $casts = [
        "start_time" => "datetime",
        "end_time" => "datetime",
        "created_at" => "datetime",
        "is_deleted" => "boolean"
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function courseGroups()
    {
        return $this->belongsToMany(CourseGroup::class, 'exam_assignments', 'exam_id', 'course_group_id');
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'exam_questions', 'exam_id', 'question_id');
    }

    public function examConfiguration()
    {
        return $this->hasOne(ExamConfiguration::class, 'exam_id');
    }

    public function examAttempts()
    {
        return $this->hasMany(ExamAttempt::class, 'exam_id');
    }
}
