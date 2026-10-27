<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table): void {
            $table->dateTime('deadline_at')->nullable();
        });
    }

    public function down(): void
    {
        if (
            Schema::hasColumn('exam_attempts', 'deadline_at')
            && DB::table('exam_attempts')->whereNotNull('deadline_at')->exists()
        ) {
            throw new RuntimeException(
                'Refusing to drop non-empty exam attempt deadlines; preserve the column before rolling this migration back.'
            );
        }

        Schema::table('exam_attempts', function (Blueprint $table): void {
            $table->dropColumn('deadline_at');
        });
    }
};
