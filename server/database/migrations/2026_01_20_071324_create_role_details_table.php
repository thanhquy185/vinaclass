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
        Schema::create('role_details', function (Blueprint $table) {
            $table->id(); 
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('function_id')->constrained('functions')->onDelete('cascade');
            $table->string('action');
            $table->unique(['role_id', 'function_id', 'action']);
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
        Schema::dropIfExists('role_details');
    }
};
