<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        "student_id",
        "exam_id",
        "start_time",
        "deadline_at",
        "submission_time",
        "total_score",
        "correct_answer_count",
        "status",
    ];

    protected $hidden = [];

    protected $casts = [
        "start_time" => "datetime",
        "deadline_at" => "datetime",
        "submission_time" => "datetime",
        "total_score" => "decimal:2",
    ];

    public function examAttemptAnswers()
    {
        return $this->hasMany(ExamAttemptAnswer::class, 'exam_attempt_id');
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    public function examAttemptLogs()
    {
        return $this->hasMany(ExamAttemptLog::class, 'exam_attempt_id');
    }

    public function examAttemptLog()
    {
        return $this->hasOne(ExamAttemptLog::class, 'exam_attempt_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
