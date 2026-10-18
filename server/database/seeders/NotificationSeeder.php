<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\ThongBao;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $giangvien = User::where("username", "giangvien")->first();

        $thongBaos = [
            [
                'title' => '📚 Tài liệu chuyên sâu: Next.js 15 & App Router',
                'content' => 'Thầy đã cập nhật tài liệu cho chương Web hiện đại, bao gồm ebook, video hướng dẫn và source code mẫu. Các bạn cần đọc trước phần Server Components và chuẩn bị môi trường Node.js 20.',
                'sender_id' => 2,
                'sent_at' => '2025-01-15 08:30:00',
                'priority' => 3,
                'status' => true
            ],
            [
                'title' => '🧪 Thông báo Lab 02: RESTful API với Laravel',
                'content' => 'Sinh viên cần hoàn thành API CRUD sản phẩm và nộp trước deadline. Lưu ý validate dữ liệu và xử lý lỗi đúng chuẩn HTTP status.',
                'sender_id' => 2,
                'sent_at' => '2025-02-10 10:00:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '📢 Cập nhật nội dung môn Công nghệ Web',
                'content' => 'Đã bổ sung nội dung về JWT Authentication và Refresh Token. Sinh viên cần đọc trước để chuẩn bị cho buổi học tới.',
                'sender_id' => 2,
                'sent_at' => '2025-03-05 09:15:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '💻 Hướng dẫn cài đặt môi trường React',
                'content' => 'Sinh viên cần cài Node.js >= 18, VSCode và các extension cần thiết để phục vụ cho phần frontend.',
                'sender_id' => 2,
                'sent_at' => '2025-04-01 14:20:00',
                'priority' => 1,
                'status' => true
            ],
            [
                'title' => '📊 Thông báo kiểm tra 15 phút',
                'content' => 'Bài kiểm tra sẽ diễn ra đầu giờ học, nội dung xoay quanh REST API và HTTP methods.',
                'sender_id' => 2,
                'sent_at' => '2025-05-12 07:45:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '📦 Tài liệu Docker cơ bản',
                'content' => 'Đã upload tài liệu hướng dẫn sử dụng Docker để deploy ứng dụng web. Sinh viên đọc trước phần container và image.',
                'sender_id' => 2,
                'sent_at' => '2025-06-20 11:00:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '🚀 Thông báo đồ án giữa kỳ',
                'content' => 'Sinh viên cần nộp proposal đồ án gồm: mô tả hệ thống, database design và công nghệ sử dụng.',
                'sender_id' => 2,
                'sent_at' => '2025-07-10 16:30:00',
                'priority' => 3,
                'status' => true
            ],
            [
                'title' => '🔐 Học về Authentication & Authorization',
                'content' => 'Buổi tới sẽ học về phân quyền RBAC và JWT. Sinh viên cần ôn lại session và cookie.',
                'sender_id' => 2,
                'sent_at' => '2025-08-03 13:00:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '📁 Upload tài liệu Git nâng cao',
                'content' => 'Đã bổ sung tài liệu về Git rebase, merge conflict và workflow làm việc nhóm.',
                'sender_id' => 2,
                'sent_at' => '2025-09-18 09:40:00',
                'priority' => 1,
                'status' => true
            ],
            [
                'title' => '📝 Nhắc nhở nộp bài tập tuần',
                'content' => 'Sinh viên cần nộp bài đúng hạn trên hệ thống LMS. Bài nộp trễ sẽ bị trừ điểm.',
                'sender_id' => 2,
                'sent_at' => '2025-10-02 18:00:00',
                'priority' => 2,
                'status' => true
            ],

            [
                'title' => '⚙️ Tài liệu NestJS cơ bản',
                'content' => 'Đã cập nhật tài liệu về Controller, Service và Module trong NestJS.',
                'sender_id' => 2,
                'sent_at' => '2025-11-11 08:10:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '📌 Thông báo lịch demo đồ án',
                'content' => 'Sinh viên chuẩn bị slide và demo sản phẩm trong vòng 10 phút.',
                'sender_id' => 2,
                'sent_at' => '2025-12-05 15:00:00',
                'priority' => 3,
                'status' => true
            ],
            [
                'title' => '🧠 Ôn tập cuối kỳ',
                'content' => 'Các bạn ôn tập lại toàn bộ kiến thức về API, Database và Authentication.',
                'sender_id' => 2,
                'sent_at' => '2026-01-10 20:00:00',
                'priority' => 3,
                'status' => true
            ],
            [
                'title' => '📘 Tài liệu Clean Architecture',
                'content' => 'Đã upload tài liệu về Clean Architecture áp dụng trong dự án thực tế.',
                'sender_id' => 2,
                'sent_at' => '2026-01-25 09:00:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '🔄 Cập nhật bài tập nhóm',
                'content' => 'Sinh viên cần cập nhật tiến độ project lên GitHub và gửi link cho giảng viên.',
                'sender_id' => 2,
                'sent_at' => '2026-02-14 17:20:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '📡 Giới thiệu WebSocket',
                'content' => 'Buổi học tới sẽ tìm hiểu WebSocket và real-time communication.',
                'sender_id' => 2,
                'sent_at' => '2026-02-28 10:10:00',
                'priority' => 1,
                'status' => true
            ],
            [
                'title' => '🧾 Thông báo điểm giữa kỳ',
                'content' => 'Điểm đã được cập nhật trên hệ thống. Sinh viên kiểm tra và phản hồi nếu có sai sót.',
                'sender_id' => 2,
                'sent_at' => '2026-03-05 12:00:00',
                'priority' => 3,
                'status' => true
            ],
            [
                'title' => '📂 Tài liệu Microservices',
                'content' => 'Đã cập nhật tài liệu về kiến trúc Microservices và giao tiếp giữa các service.',
                'sender_id' => 2,
                'sent_at' => '2026-03-15 08:50:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '⚡ Tối ưu hiệu suất API',
                'content' => 'Sinh viên cần tìm hiểu caching và tối ưu query database.',
                'sender_id' => 2,
                'sent_at' => '2026-03-25 14:00:00',
                'priority' => 2,
                'status' => true
            ],
            [
                'title' => '🎯 Tổng kết học phần',
                'content' => 'Buổi cuối sẽ tổng kết và giải đáp thắc mắc. Sinh viên chuẩn bị câu hỏi.',
                'sender_id' => 2,
                'sent_at' => '2026-04-01 09:30:00',
                'priority' => 3,
                'status' => true
            ],
        ];

        Notification::upsert(
            $thongBaos,
            ['title'], // khóa xác định trùng
            [] // không update gì khi trùng
        );
    }
}
