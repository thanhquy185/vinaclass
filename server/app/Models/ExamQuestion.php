<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamQuestion extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        "question_id",
        "exam_id",
        "question_order",
        "score",
    ];

    protected $hidden = [];

    protected $casts = [
        "score" => "decimal:2",
    ];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }
}
