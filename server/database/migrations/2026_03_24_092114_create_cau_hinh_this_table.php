<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('exam_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->unique()->constrained('exams');
            $table->boolean('has_monitoring')->default(false);
            $table->integer('limit_questions_per_page')->default(-1);
            $table->boolean('allow_back_last_question')->default(true);
            $table->boolean('allow_copy')->default(false);
            $table->boolean('allow_print')->default(false);
            $table->boolean('is_enable_resume')->default(false);
            $table->boolean('shuffle_questions')->default(true);
            $table->boolean('shuffle_answers')->default(true);
            $table->boolean('show_score')->default(true);
            $table->boolean('show_detail_results')->default(true);
            $table->boolean('is_limit_switch_tab')->default(false);
            $table->integer('tab_switch_limit')->default(999);
            $table->text('message_on_warning')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('exam_configurations');
    }
};
