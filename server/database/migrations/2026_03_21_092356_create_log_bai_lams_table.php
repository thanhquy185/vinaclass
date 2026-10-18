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
        Schema::create('exam_attempt_logs', function (Blueprint $table) {
            $table->id();
            $table->integer('tab_switch_count')->default(0);
            $table->timestamps();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('exam_attempt_logs');
    }
};
