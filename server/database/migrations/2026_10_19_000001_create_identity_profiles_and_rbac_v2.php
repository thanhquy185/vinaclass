<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table): void {
            $table->string('code', 32)->nullable()->unique()->after('role_name');
        });

        Schema::table('functions', function (Blueprint $table): void {
            $table->string('code', 64)->nullable()->unique()->after('function_name');
            $table->string('name_vi')->nullable()->after('code');
            $table->string('name_en')->nullable()->after('name_vi');
            $table->string('route_key', 100)->nullable()->unique()->after('name_en');
            $table->string('icon_key', 64)->nullable()->after('route_key');
            $table->unsignedInteger('sort_order')->default(0)->after('icon_key');
            $table->foreignId('parent_function_id')->nullable()->after('sort_order')
                ->constrained('functions')->nullOnDelete();
            $table->boolean('status')->default(true)->after('is_deleted');
        });

        Schema::create('permissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('function_id')->constrained('functions')->cascadeOnDelete();
            $table->string('code', 100)->unique();
            $table->string('action_code', 32);
            $table->string('name_vi');
            $table->string('name_en');
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->unique(['function_id', 'action_code']);
        });

        Schema::create('role_permissions', function (Blueprint $table): void {
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['role_id', 'permission_id']);
        });

        Schema::create('permission_details', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->enum('effect', ['GRANT', 'DENY']);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'permission_id']);
        });

        Schema::create('user_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('phone', 20)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->boolean('is_female')->nullable();
            $table->text('avatar_url')->nullable();
            $table->timestamps();
        });

        Schema::create('teacher_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('teacher_code')->nullable();
            $table->string('department_name')->nullable();
            $table->string('academic_title')->nullable();
            $table->timestamps();
        });

        Schema::create('student_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('student_code')->nullable();
            $table->string('program_name')->nullable();
            $table->string('cohort')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        if (DB::table('roles')->whereNotNull('code')->exists()) {
            throw new RuntimeException(
                'Refusing to drop roles.code while role codes are populated; export or migrate the role metadata before rolling this migration back.'
            );
        }

        $hasFunctionMetadata = DB::table('functions')
            ->where(function ($query): void {
                $query->whereNotNull('code')
                    ->orWhereNotNull('name_vi')
                    ->orWhereNotNull('name_en')
                    ->orWhereNotNull('route_key')
                    ->orWhereNotNull('icon_key')
                    ->orWhere('sort_order', '>', 0)
                    ->orWhereNotNull('parent_function_id')
                    ->orWhere('status', false);
            })
            ->exists();

        if ($hasFunctionMetadata) {
            throw new RuntimeException(
                'Refusing to drop populated function metadata; export or migrate the function catalog before rolling this migration back.'
            );
        }

        foreach ([
            'permission_details',
            'role_permissions',
            'permissions',
            'teacher_profiles',
            'student_profiles',
            'user_profiles',
        ] as $tableName) {
            if (Schema::hasTable($tableName) && DB::table($tableName)->exists()) {
                throw new RuntimeException(
                    "Refusing to drop non-empty {$tableName}; export its records before rolling this migration back."
                );
            }
        }

        Schema::dropIfExists('permission_details');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('teacher_profiles');
        Schema::dropIfExists('student_profiles');
        Schema::dropIfExists('user_profiles');

        Schema::table('functions', function (Blueprint $table): void {
            $table->dropForeign(['parent_function_id']);
            $table->dropUnique('functions_route_key_unique');
            $table->dropColumn(['route_key', 'icon_key', 'sort_order', 'parent_function_id']);
            $table->dropUnique('functions_code_unique');
            $table->dropColumn(['code', 'name_vi', 'name_en', 'status']);
        });

        Schema::table('roles', function (Blueprint $table): void {
            $table->dropUnique('roles_code_unique');
            $table->dropColumn('code');
        });
    }
};
