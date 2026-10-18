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
        Schema::create('exam_assignments', function (Blueprint $table) {
            $table->foreignId('exam_id')->constrained('exams');
            $table->foreignId('course_group_id')->constrained('course_groups');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->primary(['exam_id', 'course_group_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('exam_assignments');
    }
};
