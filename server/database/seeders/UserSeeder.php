<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Services\IdentityV2\IdentityV2Definitions;
use App\Services\UserProfileService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(UserProfileService $userProfileService)
    {
        if (app()->environment('production')) {
            throw new \RuntimeException('Demo user accounts must not be seeded in production.');
        }

        if (
            !$userProfileService->hasPersonalProfileTable()
            && !$userProfileService->hasLegacyPersonalColumn('full_name')
        ) {
            throw new \RuntimeException('No database schema is available for personal profiles.');
        }

        $roles = Role::query()->orderBy('id')->get();
        $systemRoles = IdentityV2Definitions::activeSystemRoleTargets($roles);
        $adminRole = $systemRoles['ADMIN'] ?? null;
        $teacherRole = $systemRoles['TEACHER'] ?? null;
        $studentRole = $systemRoles['STUDENT'] ?? null;

        if (!$adminRole || !$teacherRole || !$studentRole) {
            throw new \RuntimeException('Seed the ADMIN, TEACHER, and STUDENT roles before demo users.');
        }

        $users = [
            [
                'full_name' => 'Admin',
                'email' => 'admin',
                'password' => 'admin',
                'role_id' => $adminRole->id,
                'phone' => "0999999999",
                'username' => 'Admin',
                'date_of_birth' => now(),
                'is_female' => true,
                'ggid' => 'idexample',
                'avatar_url' => 'example.icon',
            ],
            [
                'full_name' => 'Ân Giảng Viên',
                'email' => 'gianvien@gmail.com',
                'password' => '123456',
                'role_id' => $teacherRole->id,
                'phone' => "0988888889",
                'username' => 'giangvien',
                'date_of_birth' => '2004-05-10',
                'is_female' => false,
                'ggid' => null,
                'avatar_url' => null,
            ],
            [
                'full_name' => 'Nguyễn Ngọc Thiên Ân',
                'email' => 'sinhvien@gmail.com',
                'password' => '123456',
                'role_id' => $studentRole->id,
                'phone' => "0988888888",
                'username' => 'sinhvien',
                'date_of_birth' => '2004-05-10',
                'is_female' => false,
                'ggid' => null,
                'avatar_url' => null,
            ],

            [
                'full_name' => 'Nguyễn Văn Hùng',
                'email' => 'hung.nguyen@university.edu.vn',
                'password' => '123456',
                'role_id' => $teacherRole->id,
                'phone' => '0901000001',
                'username' => '8392017465',
                'date_of_birth' => '1982-03-12',
                'is_female' => false,
                'ggid' => null,
                'avatar_url' => null,
            ],
            [
                'full_name' => 'Trần Thị Mai',
                'email' => 'mai.tran@university.edu.vn',
                'password' => '123456',
                'role_id' => $teacherRole->id,
                'phone' => '0901000002',
                'username' => '4729105836',
                'date_of_birth' => '1987-07-25',
                'is_female' => true,
                'ggid' => null,
                'avatar_url' => null,
            ],
            [
                'full_name' => 'Lê Minh Tuấn',
                'email' => 'tuan.le@university.edu.vn',
                'password' => '123456',
                'role_id' => $teacherRole->id,
                'phone' => '0901000003',
                'username' => '6152849371',
                'date_of_birth' => '1985-11-09',
                'is_female' => false,
                'ggid' => null,
                'avatar_url' => null,
            ],
            [
                'full_name' => 'Phạm Thị Hồng',
                'email' => 'hong.pham@university.edu.vn',
                'password' => '123456',
                'role_id' => $teacherRole->id,
                'phone' => '0901000004',
                'username' => '9021746385',
                'date_of_birth' => '1990-01-18',
                'is_female' => true,
                'ggid' => null,
                'avatar_url' => null,
            ],
            [
                'full_name' => 'Hoàng Quốc Bảo',
                'email' => 'bao.hoang@university.edu.vn',
                'password' => '123456',
                'role_id' => $teacherRole->id,
                'phone' => '0901000005',
                'username' => '7483951026',
                'date_of_birth' => '1983-06-30',
                'is_female' => false,
                'ggid' => null,
                'avatar_url' => null,
            ],
            [
                'full_name' => 'Võ Thị Thu Hà',
                'email' => 'ha.vo@university.edu.vn',
                'password' => '123456',
                'role_id' => $teacherRole->id,
                'phone' => '0901000006',
                'username' => '5839201746',
                'date_of_birth' => '1988-09-14',
                'is_female' => true,
                'ggid' => null,
                'avatar_url' => null,
            ],
            [
                'full_name' => 'Đặng Anh Dũng',
                'email' => 'dung.dang@university.edu.vn',
                'password' => '123456',
                'role_id' => $teacherRole->id,
                'phone' => '0901000007',
                'username' => '3194758206',
                'date_of_birth' => '1981-12-05',
                'is_female' => false,
                'ggid' => null,
                'avatar_url' => null,
            ],


            ['full_name' => 'Nguyễn Văn An', 'email' => 'nguyenvanan01@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000001', 'username' => '3123560101', 'date_of_birth' => '2005-01-12', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Trần Thị Bích', 'email' => 'tranbich02@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000002', 'username' => '3123560102', 'date_of_birth' => '2005-02-20', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Lê Minh Cường', 'email' => 'lecuong03@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000003', 'username' => '3123560103', 'date_of_birth' => '2005-03-05', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Phạm Thị Duyên', 'email' => 'phamduyen04@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000004', 'username' => '3123560104', 'date_of_birth' => '2005-04-18', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Hoàng Gia Huy', 'email' => 'hoanghuy05@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000005', 'username' => '3123560105', 'date_of_birth' => '2005-05-09', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Võ Thị Hạnh', 'email' => 'vohanh06@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000006', 'username' => '3123560106', 'date_of_birth' => '2005-06-22', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Đặng Minh Hoàng', 'email' => 'danghoang07@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000007', 'username' => '3123560107', 'date_of_birth' => '2005-07-14', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Bùi Thị Lan', 'email' => 'builan08@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000008', 'username' => '3123560108', 'date_of_birth' => '2005-08-03', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Ngô Quang Minh', 'email' => 'ngominh09@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000009', 'username' => '3123560109', 'date_of_birth' => '2005-09-27', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Phan Thị Ngọc', 'email' => 'phanngoc10@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000010', 'username' => '3123560110', 'date_of_birth' => '2005-10-11', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],

            ['full_name' => 'Trịnh Công Phúc', 'email' => 'phuc11@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000011', 'username' => '3123560111', 'date_of_birth' => '2005-11-02', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Mai Thị Quỳnh', 'email' => 'quynh12@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000012', 'username' => '3123560112', 'date_of_birth' => '2005-12-19', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Đỗ Anh Tuấn', 'email' => 'tuan13@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000013', 'username' => '3123560113', 'date_of_birth' => '2005-01-25', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Lý Thị Uyên', 'email' => 'uyen14@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000014', 'username' => '3123560114', 'date_of_birth' => '2005-02-08', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Hồ Minh Vũ', 'email' => 'vu15@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000015', 'username' => '3123560115', 'date_of_birth' => '2005-03-30', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Nguyễn Thị Yến', 'email' => 'yen16@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000016', 'username' => '3123560116', 'date_of_birth' => '2005-04-07', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Trần Quốc Bảo', 'email' => 'bao17@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000017', 'username' => '3123560117', 'date_of_birth' => '2005-05-16', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Phạm Thị Chi', 'email' => 'chi18@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000018', 'username' => '3123560118', 'date_of_birth' => '2005-06-28', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Lê Văn Dũng', 'email' => 'dung19@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000019', 'username' => '3123560119', 'date_of_birth' => '2005-07-21', 'is_female' => false, 'ggid' => null, 'avatar_url' => null],
            ['full_name' => 'Nguyễn Thị Hương', 'email' => 'huong20@gmail.com', 'password' => '123456', 'role_id' => $studentRole->id, 'phone' => '0977000020', 'username' => '3123560120', 'date_of_birth' => '2005-08-13', 'is_female' => true, 'ggid' => null, 'avatar_url' => null],

        ];


        $seedPersonalData = collect($users)->mapWithKeys(fn (array $user): array => [
            $user['email'] => Arr::only($user, [
                'full_name',
                'phone',
                'date_of_birth',
                'is_female',
                'avatar_url',
            ]),
        ]);
        $emailAddresses = array_column($users, 'email');
        $records = array_map(function (array $user) use ($studentRole, $userProfileService): array {
            $isStudent = (int) $user['role_id'] === (int) $studentRole->id;

            $personalData = Arr::only($user, [
                'full_name',
                'phone',
                'date_of_birth',
                'is_female',
                'avatar_url',
            ]);
            $accountData = Arr::except($user, array_keys($personalData));
            $accountData = array_merge(
                $accountData,
                $userProfileService->legacyIdentityAttributesForCreate($personalData),
                $userProfileService->legacyStudentFlagAttributesForCreate($isStudent)
            );
            $accountData['password'] = Hash::make($user['password']);

            return $accountData;
        }, $users);

        DB::transaction(function () use (
            $records,
            $emailAddresses,
            $seedPersonalData,
            $userProfileService
        ): void {
            $existingEmails = User::query()
                ->whereIn('email', $emailAddresses)
                ->pluck('email')
                ->flip();

            User::upsert($records, ['email'], []);

            User::query()
                ->whereIn('email', $emailAddresses)
                ->with('role')
                ->get()
                ->reject(fn (User $user): bool => isset($existingEmails[$user->email]))
                ->each(function (User $user) use ($seedPersonalData, $userProfileService): void {
                    $userProfileService->sync(
                        $user,
                        $seedPersonalData->get($user->email, [])
                    );
                });
        });
    }
}
