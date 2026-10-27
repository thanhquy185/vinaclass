<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_group_materials', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('course_group_id')->constrained('course_groups')->cascadeOnDelete();
            $table->foreignId('creator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title', 180);
            $table->text('description')->nullable();
            $table->string('storage_disk', 32)->default('private');
            $table->string('storage_path', 512);
            $table->string('original_file_name', 255);
            $table->string('mime_type', 127)->nullable();
            $table->unsignedBigInteger('file_size');
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();

            $table->index(['course_group_id', 'is_deleted', 'created_at'], 'course_materials_group_active_created_idx');
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('course_group_materials') && DB::table('course_group_materials')->exists()) {
            throw new RuntimeException(
                'Refusing to drop non-empty course_group_materials; export its records before rolling this migration back.'
            );
        }

        Schema::dropIfExists('course_group_materials');
    }
};
