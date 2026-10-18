<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $monHocs = [
            [
                'subject_name' => 'Lập trình C',
                'subject_code' => '841255',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Cấu trúc dữ liệu và giải thuật',
                'subject_code' => '841244',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Lập trình hướng đối tượng',
                'subject_code' => '841301',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Cơ sở dữ liệu',
                'subject_code' => '841312',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Hệ điều hành',
                'subject_code' => '841333',
                'credit_count' => 4,
                'theory_hours' => 45,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Mạng máy tính',
                'subject_code' => '841347',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Phân tích thiết kế hệ thống',
                'subject_code' => '841358',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Lập trình Java',
                'subject_code' => '841369',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Lập trình Web',
                'subject_code' => '841371',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Phát triển ứng dụng Web',
                'subject_code' => '841382',
                'credit_count' => 4,
                'theory_hours' => 45,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Công nghệ phần mềm',
                'subject_code' => '841393',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Kiểm thử phần mềm',
                'subject_code' => '841404',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'An toàn thông tin',
                'subject_code' => '841415',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Trí tuệ nhân tạo',
                'subject_code' => '841426',
                'credit_count' => 4,
                'theory_hours' => 45,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Học máy',
                'subject_code' => '841437',
                'credit_count' => 4,
                'theory_hours' => 45,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Khai phá dữ liệu',
                'subject_code' => '841448',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Xử lý ảnh',
                'subject_code' => '841459',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Lập trình di động',
                'subject_code' => '841460',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Phát triển ứng dụng Android',
                'subject_code' => '841471',
                'credit_count' => 4,
                'theory_hours' => 45,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
            [
                'subject_name' => 'Điện toán đám mây',
                'subject_code' => '841482',
                'credit_count' => 3,
                'theory_hours' => 30,
                'practice_hours' => 30,
                'is_deleted' => false
            ],
        ];

        Subject::upsert(
            $monHocs,
            ['subject_code'], // khóa xác định trùng
            [] // không update gì khi trùng
        );
    }
}
