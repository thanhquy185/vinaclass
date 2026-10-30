<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'email_verified_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('email_verified_at')->nullable()->after('email');
            });
        }

        Schema::create('auth_otps', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('email', 254);
            $table->char('email_hash', 64);
            $table->string('purpose', 24);
            $table->char('code_hash', 64);
            $table->char('verification_token_hash', 64)->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('resend_available_at');
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();

            $table->index(['email_hash', 'purpose', 'consumed_at'], 'auth_otps_email_purpose_open_idx');
            $table->index(['user_id', 'purpose', 'consumed_at'], 'auth_otps_user_purpose_open_idx');
        });

        Schema::create('auth_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->char('refresh_token_hash', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->unsignedBigInteger('replaced_by_id')->nullable();
            $table->string('device_name', 120)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['session_id', 'revoked_at', 'expires_at'], 'auth_sessions_family_active_idx');
            $table->index(['user_id', 'revoked_at'], 'auth_sessions_user_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_sessions');
        Schema::dropIfExists('auth_otps');
    }
};
