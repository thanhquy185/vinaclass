<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAttemptLog extends Model
{
    use HasFactory;

    protected $fillable = [
        "exam_attempt_id",
        "tab_switch_count",
    ];

    protected $hidden = [];

    public function examAttempt()
    {
        return $this->belongsTo(ExamAttempt::class, 'exam_attempt_id');
    }
}
