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
        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->dateTime('start_time');
            $table->dateTime('submission_time')->nullable();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->integer('correct_answer_count')->nullable();
            $table->enum('status', ['IN_PROGRESS', 'SAVED', 'SUBMITTED', 'CANCELLED'])->default('IN_PROGRESS');
            $table->timestamps();
            $table->foreignId('student_id')->constrained('users');
            $table->foreignId('exam_id')->constrained('exams');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('exam_attempts');
    }
};
