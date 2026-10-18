<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAttemptAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        "exam_attempt_id",
        "question_id",
        "answer_option_id"
    ];

    protected $hidden = [];

    protected $casts = [
        "is_selected_correct" => "boolean",
        "score" => "decimal:2",
    ];

    public $timestamps = false;
}
