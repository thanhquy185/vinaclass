<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnswerOption extends Model
{
    use HasFactory;

    protected $fillable = [
        "option_content",
        "is_correct_answer",
        "question_id",
    ];

    protected $hidden = [];

    protected $casts = [
        "is_correct_answer" => "boolean",
    ];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public $timestamps = false;
}
