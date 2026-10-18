<?php

namespace Database\Seeders;

use App\Models\CauHinhThi;
use App\Models\ExamConfiguration;
use Illuminate\Database\Seeder;

class ExamConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = [
            ['exam_id' => 1,  'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 2,  'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 3,  'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 4,  'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 5,  'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 6,  'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 7,  'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 8,  'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 9,  'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 10, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],

            ['exam_id' => 11, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 12, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 13, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 14, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 15, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 16, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 17, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 18, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 19, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => true,  'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
            ['exam_id' => 20, 'has_monitoring' => false, 'allow_copy' => false, 'allow_print' => false, 'is_enable_resume' => true, 'shuffle_questions' => true, 'shuffle_answers' => true, 'show_score' => true, 'show_detail_results' => false, 'is_limit_switch_tab' => false, 'tab_switch_limit' => 999, 'message_on_warning' => null],
        ];

        ExamConfiguration::upsert(
            $data,
            ['exam_id'], // khóa xác định trùng
            array_keys($data[0]) // các cột sẽ update khi trùng
        );
    }
}
