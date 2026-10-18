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
        Schema::create('exam_attempt_answers', function (Blueprint $table) {
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts');
            $table->foreignId('question_id')->constrained('questions');
            $table->primary(['exam_attempt_id', 'question_id']);
            $table->boolean('is_selected_correct')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->timestamps();
            $table->foreignId('answer_option_id')->nullable()->constrained('answer_options');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('exam_attempt_answers');
    }
};
