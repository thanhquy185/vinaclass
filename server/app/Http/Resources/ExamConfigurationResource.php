<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExamConfigurationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'exam_configuration_id' => $this->exam_configuration_id,
            'has_monitoring' => $this->has_monitoring,
            'allow_copy' => $this->allow_copy,
            'allow_print' => $this->allow_print,
            'is_enable_resume' => $this->is_enable_resume,
            'shuffle_questions' => $this->shuffle_questions,
            'shuffle_answers' => $this->shuffle_answers,
            'show_score' => $this->show_score,
            'show_detail_results' => $this->show_detail_results,
            'is_limit_switch_tab' => $this->is_limit_switch_tab,
            'tab_switch_limit' => $this->tab_switch_limit,
            'message_on_warning' => $this->message_on_warning,
            'exam_id' => $this->exam_id,
            'exam' => new ExamResource($this->whenLoaded('exam')),
        ];
    }
}
