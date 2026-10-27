<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'is_student')) {
            return;
        }

        if (
            !Schema::hasColumn('roles', 'code')
            || !Schema::hasTable('user_profiles')
            || !Schema::hasTable('teacher_profiles')
            || !Schema::hasTable('student_profiles')
        ) {
            throw new RuntimeException('Identity v2 schema must be installed before removing users.is_student.');
        }

        $this->assertNoUsers(
            DB::table('users')
                ->leftJoin('roles', 'roles.id', '=', 'users.role_id')
                ->where(function (Builder $query): void {
                    $query->whereNull('roles.id')
                        ->orWhere('roles.is_deleted', true)
                        ->orWhereNull('roles.code')
                        ->orWhereNotIn('roles.code', ['ADMIN', 'TEACHER', 'STUDENT']);
                }),
            'Accounts without an active ADMIN, TEACHER, or STUDENT role remain.'
        );

        $this->assertNoUsers(
            DB::table('users')
                ->join('roles', 'roles.id', '=', 'users.role_id')
                ->where(function (Builder $query): void {
                    $query->where(function (Builder $student): void {
                        $student->where('users.is_student', true)
                            ->where('roles.code', '!=', 'STUDENT');
                    })->orWhere(function (Builder $staff): void {
                        $staff->where('users.is_student', false)
                            ->where('roles.code', 'STUDENT');
                    });
                }),
            'Accounts with conflicting legacy student flags remain.'
        );

        $this->assertNoUsers(
            DB::table('users')
                ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
                ->whereNull('user_profiles.id'),
            'Accounts without shared profiles remain.'
        );

        foreach (['TEACHER' => 'teacher_profiles', 'STUDENT' => 'student_profiles'] as $roleCode => $table) {
            $this->assertNoUsers(
                DB::table('users')
                    ->join('roles', 'roles.id', '=', 'users.role_id')
                    ->leftJoin($table, "{$table}.user_id", '=', 'users.id')
                    ->where('roles.code', $roleCode)
                    ->whereNull("{$table}.id"),
                "{$roleCode} accounts without role profiles remain."
            );
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('is_student');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'is_student')) {
            return;
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('is_student')->default(false);
        });

        $studentRoleIds = DB::table('roles')->where('code', 'STUDENT')->pluck('id');
        DB::table('users')
            ->whereIn('role_id', $studentRoleIds)
            ->update(['is_student' => true]);
    }

    private function assertNoUsers(Builder $query, string $message): void
    {
        $userIds = $query->orderBy('users.id')->limit(10)->pluck('users.id')->all();
        if ($userIds !== []) {
            throw new RuntimeException($message . ' User IDs: ' . implode(', ', $userIds));
        }
    }
};
