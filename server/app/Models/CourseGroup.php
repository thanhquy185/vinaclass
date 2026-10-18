<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseGroup extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        "subject_id",
        "group_name",
        "join_code",
        "notes",
        "semester",
        "academic_year",
        "teacher_id",
        "is_hidden",
        "is_deleted"
    ];

    protected $withCount = [
        'courseGroupStudents as student_count'
    ];

    protected $hidden = [];

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_assignments', 'course_group_id', 'exam_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'course_group_students', 'course_group_id', 'student_id');
    }

    public function courseGroupStudents()
    {
        return $this->hasMany(CourseGroupStudent::class, 'course_group_id');
    }

    public function notifications()
    {
        return $this->belongsToMany(Notification::class, 'course_group_notifications', 'course_group_id', 'notification_id');
    }
}
