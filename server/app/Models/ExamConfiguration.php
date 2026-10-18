<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamConfiguration extends Model
{
    use HasFactory;

    protected $table = 'exam_configurations';

    protected $fillable = [
        'exam_id',
        'has_monitoring',
        'limit_questions_per_page',
        'allow_back_last_question',
        'allow_copy',
        'allow_print',
        'is_enable_resume',
        'shuffle_questions',
        'shuffle_answers',
        'show_score',
        'show_detail_results',
        'is_limit_switch_tab',
        'tab_switch_limit',
        'message_on_warning',
    ];

    protected $casts = [
        'has_monitoring' => 'boolean',
        'allow_copy' => 'boolean',
        'allow_print' => 'boolean',
        'is_enable_resume' => 'boolean',
        'shuffle_questions' => 'boolean',
        'shuffle_answers' => 'boolean',
        'show_score' => 'boolean',
        'show_detail_results' => 'boolean',
        'is_limit_switch_tab' => 'boolean',
        'tab_switch_limit' => 'integer',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }
}
