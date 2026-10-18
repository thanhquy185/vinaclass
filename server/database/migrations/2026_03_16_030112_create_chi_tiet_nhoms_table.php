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
        Schema::create('course_group_students', function (Blueprint $table) {
            $table->foreignId('student_id')->constrained('users');
            $table->foreignId('course_group_id')->constrained('course_groups');
            $table->primary(['student_id', 'course_group_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('course_group_students');
    }
};
