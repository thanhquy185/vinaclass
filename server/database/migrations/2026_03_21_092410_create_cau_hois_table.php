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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->text('question_content');
            $table->text('image_url')->nullable();
            $table->text('answer_explanation')->nullable();
            $table->decimal('default_score', 5, 2)->default(1.00);
            $table->integer('usage_count')->default(0);
            $table->enum('status', ['public', 'private', 'archive'])->default('private');
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
            $table->unsignedBigInteger('difficulty_id')->nullable();
            $table->foreignId('subject_id')->constrained('subjects');
            $table->foreignId('creator_id')->constrained('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('questions');
    }
};
