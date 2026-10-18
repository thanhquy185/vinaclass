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
        Schema::create('course_group_notifications', function (Blueprint $table) {
            $table->foreignId('course_group_id')->constrained('course_groups');
            $table->foreignId('notification_id')->constrained('notifications');
            $table->primary(['course_group_id', 'notification_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('course_group_notifications');
    }
};
