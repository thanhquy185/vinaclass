<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $table = 'questions';

    protected $fillable = [
        "subject_id",
        "chapter_id",
        "question_content",
        "difficulty_id",
        "image_url",
        "answer_explanation",
        "default_score",
        "creator_id",
        "usage_count",
        "status",
        "is_deleted",
    ];

    protected $hidden = [];

    protected $casts = [
        "default_score" => "decimal:2",
        "is_deleted" => "boolean",
        "created_at" => "datetime",
        "updated_at" => "datetime",
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class, 'chapter_id');
    }

    public function difficulty()
    {
        return $this->belongsTo(Difficulty::class, 'difficulty_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_questions', 'question_id', 'exam_id');
    }

    public function answerOptions()
    {
        return $this->hasMany(AnswerOption::class, 'question_id');
    }

    public function answers()
    {
        return $this->answerOptions();
    }
}
