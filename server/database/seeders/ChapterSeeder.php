<?php

namespace Database\Seeders;

use App\Models\Chapter;
use Illuminate\Database\Seeder;

class ChapterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $chuongs = [
            ['chapter_name' => 'Cú pháp cơ bản và kiểu dữ liệu trong C', 'subject_id' => 1, 'is_deleted' => false],
            ['chapter_name' => 'Con trỏ và quản lý bộ nhớ trong C', 'subject_id' => 1, 'is_deleted' => false],

            ['chapter_name' => 'Danh sách, ngăn xếp và hàng đợi', 'subject_id' => 2, 'is_deleted' => false],
            ['chapter_name' => 'Thuật toán sắp xếp và tìm kiếm', 'subject_id' => 2, 'is_deleted' => false],

            ['chapter_name' => 'Nguyên lý lập trình hướng đối tượng', 'subject_id' => 3, 'is_deleted' => false],
            ['chapter_name' => 'Kế thừa, đa hình và đóng gói', 'subject_id' => 3, 'is_deleted' => false],

            ['chapter_name' => 'Mô hình dữ liệu và thiết kế CSDL', 'subject_id' => 4, 'is_deleted' => false],
            ['chapter_name' => 'Ngôn ngữ SQL và truy vấn dữ liệu', 'subject_id' => 4, 'is_deleted' => false],

            ['chapter_name' => 'Quản lý tiến trình và luồng', 'subject_id' => 5, 'is_deleted' => false],
            ['chapter_name' => 'Quản lý bộ nhớ và hệ thống tập tin', 'subject_id' => 5, 'is_deleted' => false],

            ['chapter_name' => 'Mô hình OSI và TCP/IP', 'subject_id' => 6, 'is_deleted' => false],
            ['chapter_name' => 'Giao thức mạng và định tuyến', 'subject_id' => 6, 'is_deleted' => false],

            ['chapter_name' => 'Thu thập và phân tích yêu cầu', 'subject_id' => 7, 'is_deleted' => false],
            ['chapter_name' => 'Thiết kế hệ thống và UML', 'subject_id' => 7, 'is_deleted' => false],

            ['chapter_name' => 'Cú pháp và cấu trúc chương trình Java', 'subject_id' => 8, 'is_deleted' => false],
            ['chapter_name' => 'Xử lý ngoại lệ và làm việc với file', 'subject_id' => 8, 'is_deleted' => false],

            ['chapter_name' => 'HTML, CSS và JavaScript cơ bản', 'subject_id' => 9, 'is_deleted' => false],
            ['chapter_name' => 'DOM, sự kiện và gọi API', 'subject_id' => 9, 'is_deleted' => false],

            ['chapter_name' => 'Kiến trúc ứng dụng Web (MVC)', 'subject_id' => 10, 'is_deleted' => false],
            ['chapter_name' => 'Xây dựng RESTful API', 'subject_id' => 10, 'is_deleted' => false],

            ['chapter_name' => 'Quy trình phát triển phần mềm', 'subject_id' => 11, 'is_deleted' => false],
            ['chapter_name' => 'Mô hình Agile và Scrum', 'subject_id' => 11, 'is_deleted' => false],

            ['chapter_name' => 'Giới thiệu kiểm thử phần mềm', 'subject_id' => 12, 'is_deleted' => false],
            ['chapter_name' => 'Kiểm thử tự động và test case', 'subject_id' => 12, 'is_deleted' => false],

            ['chapter_name' => 'Các nguyên lý an toàn thông tin', 'subject_id' => 13, 'is_deleted' => false],
            ['chapter_name' => 'Mã hóa và bảo mật hệ thống', 'subject_id' => 13, 'is_deleted' => false],

            ['chapter_name' => 'Tìm kiếm và suy luận trong AI', 'subject_id' => 14, 'is_deleted' => false],
            ['chapter_name' => 'Học có giám sát và không giám sát', 'subject_id' => 14, 'is_deleted' => false],

            ['chapter_name' => 'Thuật toán học máy cơ bản', 'subject_id' => 15, 'is_deleted' => false],
            ['chapter_name' => 'Đánh giá mô hình và tối ưu', 'subject_id' => 15, 'is_deleted' => false],

            ['chapter_name' => 'Tiền xử lý dữ liệu', 'subject_id' => 16, 'is_deleted' => false],
            ['chapter_name' => 'Khai phá luật kết hợp và phân cụm', 'subject_id' => 16, 'is_deleted' => false],

            ['chapter_name' => 'Biểu diễn và xử lý ảnh số', 'subject_id' => 17, 'is_deleted' => false],
            ['chapter_name' => 'Phát hiện biên và nhận dạng ảnh', 'subject_id' => 17, 'is_deleted' => false],

            ['chapter_name' => 'Giới thiệu lập trình Android', 'subject_id' => 18, 'is_deleted' => false],
            ['chapter_name' => 'Xây dựng giao diện và xử lý sự kiện', 'subject_id' => 18, 'is_deleted' => false],

            ['chapter_name' => 'Kiến trúc ứng dụng Android', 'subject_id' => 19, 'is_deleted' => false],
            ['chapter_name' => 'Kết nối API và lưu trữ dữ liệu', 'subject_id' => 19, 'is_deleted' => false],

            ['chapter_name' => 'Tổng quan điện toán đám mây', 'subject_id' => 20, 'is_deleted' => false],
            ['chapter_name' => 'Triển khai ứng dụng trên Cloud', 'subject_id' => 20, 'is_deleted' => false],
        ];

        Chapter::upsert(
            $chuongs,
            ['chapter_name', 'subject_id'], // khóa xác định trùng
            [] // không update gì khi trùng
        );
    }
}
