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
        if (Schema::hasColumn('users', 'is_student')) {
            throw new RuntimeException('Remove users.is_student after identity backfill before requiring a role.');
        }

        $invalidUserIds = DB::table('users')
            ->leftJoin('roles', 'roles.id', '=', 'users.role_id')
            ->where(function (Builder $query): void {
                $query->whereNull('roles.id')
                    ->orWhere('roles.is_deleted', true)
                    ->orWhereNull('roles.code')
                    ->orWhereNotIn('roles.code', ['ADMIN', 'TEACHER', 'STUDENT']);
            })
            ->orderBy('users.id')
            ->limit(10)
            ->pluck('users.id')
            ->all();

        if ($invalidUserIds !== []) {
            throw new RuntimeException(
                'Accounts without an active system role remain. User IDs: ' . implode(', ', $invalidUserIds)
            );
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->unsignedBigInteger('role_id')->nullable(false)->change();
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->foreign('role_id')->references('id')->on('roles')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        $unrepresentableUserIds = DB::table('users')
            ->where('role_id', '>', 2147483647)
            ->orderBy('id')
            ->limit(10)
            ->pluck('id')
            ->all();

        if ($unrepresentableUserIds !== []) {
            throw new RuntimeException(
                'Cannot restore the original signed integer role_id type. User IDs: '
                . implode(', ', $unrepresentableUserIds)
            );
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['role_id']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->integer('role_id')->nullable()->change();
        });
    }
};
