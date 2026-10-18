<?php

namespace Database\Seeders;

use App\Models\ChiTietThongBao;
use App\Models\CourseGroupNotification;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseGroupNotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $chiTietThongBaos = [
            ['course_group_id' => 1, 'notification_id' => 1],
            ['course_group_id' => 1, 'notification_id' => 2],
            ['course_group_id' => 1, 'notification_id' => 3],
            ['course_group_id' => 1, 'notification_id' => 4],
            ['course_group_id' => 1, 'notification_id' => 5],

            ['course_group_id' => 2, 'notification_id' => 6],
            ['course_group_id' => 2, 'notification_id' => 7],
            ['course_group_id' => 2, 'notification_id' => 8],
            ['course_group_id' => 2, 'notification_id' => 9],
            ['course_group_id' => 2, 'notification_id' => 10],

            ['course_group_id' => 3, 'notification_id' => 11],
            ['course_group_id' => 3, 'notification_id' => 12],
            ['course_group_id' => 3, 'notification_id' => 13],
            ['course_group_id' => 3, 'notification_id' => 14],
            ['course_group_id' => 3, 'notification_id' => 15],

            ['course_group_id' => 4, 'notification_id' => 16],
            ['course_group_id' => 4, 'notification_id' => 17],
            ['course_group_id' => 4, 'notification_id' => 18],
            ['course_group_id' => 4, 'notification_id' => 19],
            ['course_group_id' => 4, 'notification_id' => 20],

            ['course_group_id' => 5, 'notification_id' => 1],
            ['course_group_id' => 5, 'notification_id' => 2],
            ['course_group_id' => 5, 'notification_id' => 3],
            ['course_group_id' => 5, 'notification_id' => 4],
            ['course_group_id' => 5, 'notification_id' => 5],

            ['course_group_id' => 6, 'notification_id' => 6],
            ['course_group_id' => 6, 'notification_id' => 7],
            ['course_group_id' => 6, 'notification_id' => 8],
            ['course_group_id' => 6, 'notification_id' => 9],
            ['course_group_id' => 6, 'notification_id' => 10],

            ['course_group_id' => 7, 'notification_id' => 11],
            ['course_group_id' => 7, 'notification_id' => 12],
            ['course_group_id' => 7, 'notification_id' => 13],
            ['course_group_id' => 7, 'notification_id' => 14],
            ['course_group_id' => 7, 'notification_id' => 15],

            ['course_group_id' => 8, 'notification_id' => 16],
            ['course_group_id' => 8, 'notification_id' => 17],
            ['course_group_id' => 8, 'notification_id' => 18],
            ['course_group_id' => 8, 'notification_id' => 19],
            ['course_group_id' => 8, 'notification_id' => 20],

            ['course_group_id' => 9, 'notification_id' => 1],
            ['course_group_id' => 9, 'notification_id' => 2],
            ['course_group_id' => 9, 'notification_id' => 3],
            ['course_group_id' => 9, 'notification_id' => 4],
            ['course_group_id' => 9, 'notification_id' => 5],

            ['course_group_id' => 10, 'notification_id' => 6],
            ['course_group_id' => 10, 'notification_id' => 7],
            ['course_group_id' => 10, 'notification_id' => 8],
            ['course_group_id' => 10, 'notification_id' => 9],
            ['course_group_id' => 10, 'notification_id' => 10],
        ];

        CourseGroupNotification::upsert(
            $chiTietThongBaos,
            ['course_group_id', 'notification_id'], // khóa xác định trùng
            [] // không update gì khi trùng
        );
    }
}
