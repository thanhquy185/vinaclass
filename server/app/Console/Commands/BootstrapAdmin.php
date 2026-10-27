<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use App\Services\UserProfileService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class BootstrapAdmin extends Command
{
    protected $signature = 'app:bootstrap-admin';

    protected $description = 'Create the first administrator account when none exists';

    public function handle(UserProfileService $userProfileService): int
    {
        $role = Role::query()
            ->where('is_deleted', false)
            ->get()
            ->first(fn (Role $candidate): bool => $candidate->canonicalCode() === 'ADMIN');
        if (!$role) {
            $this->error('Không tìm thấy vai trò admin. Hãy chạy migrate và seed dữ liệu nền trước.');
            return self::FAILURE;
        }

        if (
            !$userProfileService->hasPersonalProfileTable()
            && !$userProfileService->hasLegacyPersonalColumn('full_name')
        ) {
            $this->error('Không tìm thấy schema để lưu hồ sơ cá nhân. Hãy chạy migrate trước.');
            return self::FAILURE;
        }

        if (User::query()->where('role_id', $role->id)->where('is_deleted', false)->exists()) {
            $this->error('Đã có tài khoản admin đang hoạt động; không thể tạo admin bootstrap mới.');
            return self::FAILURE;
        }

        $input = [
            'full_name' => trim((string) $this->ask('Họ và tên')),
            'username' => trim((string) $this->ask('Tên đăng nhập')),
            'email' => trim((string) $this->ask('Email')),
            'password' => $this->secret('Mật khẩu (ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số)'),
            'password_confirmation' => $this->secret('Nhập lại mật khẩu'),
        ];

        $validator = Validator::make($input, [
            'full_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()->mixedCase()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }
            return self::FAILURE;
        }

        $created = DB::transaction(function () use ($role, $input, $userProfileService): bool {
            Role::query()->whereKey($role->id)->lockForUpdate()->firstOrFail();
            if (User::query()->where('role_id', $role->id)->where('is_deleted', false)->exists()) {
                return false;
            }

            $personalData = $userProfileService->personalDataForCreate([
                'full_name' => $input['full_name'],
                'is_female' => false,
            ]);
            $accountData = array_merge(
                [
                    'username' => $input['username'],
                    'email' => $input['email'],
                    'password' => $input['password'],
                    'role_id' => $role->id,
                    'is_locked' => false,
                    'is_deleted' => false,
                ],
                $userProfileService->legacyIdentityAttributesForCreate($personalData),
                $userProfileService->legacyStudentFlagAttributesForCreate(false)
            );

            $user = User::query()->forceCreate($accountData);
            $userProfileService->sync($user, $personalData);

            return true;
        });

        if (!$created) {
            $this->error('Đã có tài khoản admin đang hoạt động; không thể tạo admin bootstrap mới.');
            return self::FAILURE;
        }

        $this->info('Đã tạo tài khoản admin. Mật khẩu không được ghi ra màn hình.');
        return self::SUCCESS;
    }
}
