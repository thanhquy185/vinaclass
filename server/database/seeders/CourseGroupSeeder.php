<?php

namespace Database\Seeders;

use App\Models\CourseGroup;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $monLapTrinhC = Subject::where('subject_name', 'Lập trình C')->first();
        $monCauTrucDuLieu = Subject::where('subject_name', 'Cấu trúc dữ liệu và giải thuật')->first();
        $giangvien = User::where('username', 'giangvien')->first();

        $nhomHocPhans = [
            [
                'subject_id' => 1,
                'group_name' => 'Lập trình C - N1',
                'join_code' => 'abcdef01',
                'notes' => 'Nhóm học phần môn Lập trình C',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 1,
                'group_name' => 'Lập trình C - N2',
                'join_code' => 'abcdef02',
                'notes' => 'Nhóm học phần môn Lập trình C',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 2,
                'group_name' => 'Cấu trúc dữ liệu và giải thuật - N1',
                'join_code' => 'abcdef03',
                'notes' => 'Nhóm học phần môn Cấu trúc dữ liệu và giải thuật',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 2,
                'group_name' => 'Cấu trúc dữ liệu và giải thuật - N2',
                'join_code' => 'abcdef04',
                'notes' => 'Nhóm học phần môn Cấu trúc dữ liệu và giải thuật',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 3,
                'group_name' => 'Lập trình hướng đối tượng - N1',
                'join_code' => 'abcdef05',
                'notes' => 'Nhóm học phần môn Lập trình hướng đối tượng',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 3,
                'group_name' => 'Lập trình hướng đối tượng - N2',
                'join_code' => 'abcdef06',
                'notes' => 'Nhóm học phần môn Lập trình hướng đối tượng',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 4,
                'group_name' => 'Cơ sở dữ liệu - N1',
                'join_code' => 'abcdef07',
                'notes' => 'Nhóm học phần môn Cơ sở dữ liệu',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 4,
                'group_name' => 'Cơ sở dữ liệu - N2',
                'join_code' => 'abcdef08',
                'notes' => 'Nhóm học phần môn Cơ sở dữ liệu',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 5,
                'group_name' => 'Hệ điều hành - N1',
                'join_code' => 'abcdef09',
                'notes' => 'Nhóm học phần môn Hệ điều hành',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 5,
                'group_name' => 'Hệ điều hành - N2',
                'join_code' => 'abcdef10',
                'notes' => 'Nhóm học phần môn Hệ điều hành',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 6,
                'group_name' => 'Mạng máy tính - N1',
                'join_code' => 'abcdef11',
                'notes' => 'Nhóm học phần môn Mạng máy tính',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 6,
                'group_name' => 'Mạng máy tính - N2',
                'join_code' => 'abcdef12',
                'notes' => 'Nhóm học phần môn Mạng máy tính',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 7,
                'group_name' => 'Phân tích thiết kế hệ thống - N1',
                'join_code' => 'abcdef13',
                'notes' => 'Nhóm học phần môn Phân tích thiết kế hệ thống',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 7,
                'group_name' => 'Phân tích thiết kế hệ thống - N2',
                'join_code' => 'abcdef14',
                'notes' => 'Nhóm học phần môn Phân tích thiết kế hệ thống',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 8,
                'group_name' => 'Lập trình Java - N1',
                'join_code' => 'abcdef15',
                'notes' => 'Nhóm học phần môn Lập trình Java',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 8,
                'group_name' => 'Lập trình Java - N2',
                'join_code' => 'abcdef16',
                'notes' => 'Nhóm học phần môn Lập trình Java',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 9,
                'group_name' => 'Lập trình Web - N1',
                'join_code' => 'abcdef17',
                'notes' => 'Nhóm học phần môn Lập trình Web',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 9,
                'group_name' => 'Lập trình Web - N2',
                'join_code' => 'abcdef18',
                'notes' => 'Nhóm học phần môn Lập trình Web',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],

            [
                'subject_id' => 10,
                'group_name' => 'Phát triển ứng dụng Web - N1',
                'join_code' => 'abcdef19',
                'notes' => 'Nhóm học phần môn Phát triển ứng dụng Web',
                'semester' => 1,
                'academic_year' => 2025,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
            [
                'subject_id' => 10,
                'group_name' => 'Phát triển ứng dụng Web - N2',
                'join_code' => 'abcdef20',
                'notes' => 'Nhóm học phần môn Phát triển ứng dụng Web',
                'semester' => 2,
                'academic_year' => 2026,
                'teacher_id' => 2,
                'is_hidden' => false,
                'is_deleted' => false,
            ],
        ];

        CourseGroup::upsert(
            $nhomHocPhans,
            ['join_code'], // khóa xác định trùng
            [] // không update gì khi trùng
        );
    }
}
