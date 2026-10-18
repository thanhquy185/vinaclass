<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('username');
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('password');

            $table->integer('role_id')->nullable();
            $table->string('phone', 20)->nullable();

            $table->date('date_of_birth')->nullable();

            $table->boolean('is_female');

            $table->text('ggid')->nullable();
            $table->text('avatar_url')->nullable();

            $table->boolean('is_student');
            $table->boolean('is_locked')->default(false);
            $table->boolean('is_deleted')->default(false);

            $table->dateTime('last_login')->useCurrent();

            $table->timestamps();

            // Set charset và collation để hỗ trợ Unicode
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
