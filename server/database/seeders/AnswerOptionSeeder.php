<?php

namespace Database\Seeders;

use App\Models\AnswerOption;
use Illuminate\Database\Seeder;

class AnswerOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $answers = [

            // 1 → 25
            ['question_id' => 1, 'option_content' => 'Lưu số nguyên', 'is_correct_answer' => true],
            ['question_id' => 1, 'option_content' => 'Lưu số thực', 'is_correct_answer' => false],
            ['question_id' => 1, 'option_content' => 'Lưu ký tự', 'is_correct_answer' => false],
            ['question_id' => 1, 'option_content' => 'Lưu chuỗi', 'is_correct_answer' => false],

            ['question_id' => 2, 'option_content' => 'Điểm bắt đầu chương trình', 'is_correct_answer' => true],
            ['question_id' => 2, 'option_content' => 'Kết thúc chương trình', 'is_correct_answer' => false],
            ['question_id' => 2, 'option_content' => 'In dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 2, 'option_content' => 'Nhập dữ liệu', 'is_correct_answer' => false],

            ['question_id' => 3, 'option_content' => 'Tăng giá trị biến lên 1', 'is_correct_answer' => true],
            ['question_id' => 3, 'option_content' => 'Giảm giá trị biến đi 1', 'is_correct_answer' => false],
            ['question_id' => 3, 'option_content' => 'Nhân đôi giá trị', 'is_correct_answer' => false],
            ['question_id' => 3, 'option_content' => 'Chia đôi giá trị', 'is_correct_answer' => false],

            ['question_id' => 4, 'option_content' => 'Giảm giá trị biến đi 1', 'is_correct_answer' => true],
            ['question_id' => 4, 'option_content' => 'Tăng giá trị biến lên 1', 'is_correct_answer' => false],
            ['question_id' => 4, 'option_content' => 'Nhân giá trị', 'is_correct_answer' => false],
            ['question_id' => 4, 'option_content' => 'Gán giá trị', 'is_correct_answer' => false],

            ['question_id' => 5, 'option_content' => 'Rẽ nhánh theo điều kiện', 'is_correct_answer' => true],
            ['question_id' => 5, 'option_content' => 'Lặp vô hạn', 'is_correct_answer' => false],
            ['question_id' => 5, 'option_content' => 'Khai báo biến', 'is_correct_answer' => false],
            ['question_id' => 5, 'option_content' => 'In dữ liệu', 'is_correct_answer' => false],

            ['question_id' => 6, 'option_content' => 'Khi có nhiều lựa chọn theo giá trị', 'is_correct_answer' => true],
            ['question_id' => 6, 'option_content' => 'Khi lặp vô hạn', 'is_correct_answer' => false],
            ['question_id' => 6, 'option_content' => 'Khi nhập dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 6, 'option_content' => 'Khi in dữ liệu', 'is_correct_answer' => false],

            ['question_id' => 7, 'option_content' => 'Khi biết trước số lần lặp', 'is_correct_answer' => true],
            ['question_id' => 7, 'option_content' => 'Khi không biết số lần lặp', 'is_correct_answer' => false],
            ['question_id' => 7, 'option_content' => 'Khi khai báo biến', 'is_correct_answer' => false],
            ['question_id' => 7, 'option_content' => 'Khi so sánh', 'is_correct_answer' => false],

            ['question_id' => 8, 'option_content' => 'do-while chạy ít nhất 1 lần', 'is_correct_answer' => true],
            ['question_id' => 8, 'option_content' => 'while chạy ít nhất 1 lần', 'is_correct_answer' => false],
            ['question_id' => 8, 'option_content' => 'Không có khác biệt', 'is_correct_answer' => false],
            ['question_id' => 8, 'option_content' => 'while nhanh hơn', 'is_correct_answer' => false],

            ['question_id' => 9, 'option_content' => 'Tập hợp phần tử cùng kiểu', 'is_correct_answer' => true],
            ['question_id' => 9, 'option_content' => 'Một biến đơn', 'is_correct_answer' => false],
            ['question_id' => 9, 'option_content' => 'Hàm xử lý dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 9, 'option_content' => 'Kiểu dữ liệu đặc biệt', 'is_correct_answer' => false],

            ['question_id' => 10, 'option_content' => 'Bắt đầu từ 0', 'is_correct_answer' => true],
            ['question_id' => 10, 'option_content' => 'Bắt đầu từ 1', 'is_correct_answer' => false],
            ['question_id' => 10, 'option_content' => 'Bắt đầu từ -1', 'is_correct_answer' => false],
            ['question_id' => 10, 'option_content' => 'Không cố định', 'is_correct_answer' => false],

            // 👉 11 → 25
            ['question_id' => 11, 'option_content' => 'Biến lưu địa chỉ', 'is_correct_answer' => true],
            ['question_id' => 11, 'option_content' => 'Biến lưu giá trị', 'is_correct_answer' => false],
            ['question_id' => 11, 'option_content' => 'Hàm xử lý', 'is_correct_answer' => false],
            ['question_id' => 11, 'option_content' => 'Kiểu dữ liệu số', 'is_correct_answer' => false],

            ['question_id' => 12, 'option_content' => 'Lấy địa chỉ biến', 'is_correct_answer' => true],
            ['question_id' => 12, 'option_content' => 'Lấy giá trị biến', 'is_correct_answer' => false],
            ['question_id' => 12, 'option_content' => 'Tăng giá trị', 'is_correct_answer' => false],
            ['question_id' => 12, 'option_content' => 'Giảm giá trị', 'is_correct_answer' => false],

            ['question_id' => 13, 'option_content' => 'Truy cập giá trị tại địa chỉ', 'is_correct_answer' => true],
            ['question_id' => 13, 'option_content' => 'Lấy địa chỉ biến', 'is_correct_answer' => false],
            ['question_id' => 13, 'option_content' => 'Gán giá trị', 'is_correct_answer' => false],
            ['question_id' => 13, 'option_content' => 'So sánh', 'is_correct_answer' => false],

            ['question_id' => 14, 'option_content' => 'Cấp phát bộ nhớ động', 'is_correct_answer' => true],
            ['question_id' => 14, 'option_content' => 'Giải phóng bộ nhớ', 'is_correct_answer' => false],
            ['question_id' => 14, 'option_content' => 'In dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 14, 'option_content' => 'Nhập dữ liệu', 'is_correct_answer' => false],

            ['question_id' => 15, 'option_content' => 'Giải phóng bộ nhớ', 'is_correct_answer' => true],
            ['question_id' => 15, 'option_content' => 'Cấp phát bộ nhớ', 'is_correct_answer' => false],
            ['question_id' => 15, 'option_content' => 'Tăng bộ nhớ', 'is_correct_answer' => false],
            ['question_id' => 15, 'option_content' => 'Sao chép dữ liệu', 'is_correct_answer' => false],

            ['question_id' => 16, 'option_content' => 'In ra màn hình', 'is_correct_answer' => true],
            ['question_id' => 16, 'option_content' => 'Nhập dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 16, 'option_content' => 'Xóa dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 16, 'option_content' => 'Tính toán', 'is_correct_answer' => false],

            ['question_id' => 17, 'option_content' => 'Nhập dữ liệu', 'is_correct_answer' => true],
            ['question_id' => 17, 'option_content' => 'In dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 17, 'option_content' => 'Xóa dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 17, 'option_content' => 'So sánh', 'is_correct_answer' => false],

            ['question_id' => 18, 'option_content' => 'Khai báo ngoài hàm', 'is_correct_answer' => true],
            ['question_id' => 18, 'option_content' => 'Khai báo trong hàm', 'is_correct_answer' => false],
            ['question_id' => 18, 'option_content' => 'Chỉ dùng trong vòng lặp', 'is_correct_answer' => false],
            ['question_id' => 18, 'option_content' => 'Không cần khai báo', 'is_correct_answer' => false],

            ['question_id' => 19, 'option_content' => 'Khai báo trong hàm', 'is_correct_answer' => true],
            ['question_id' => 19, 'option_content' => 'Khai báo ngoài hàm', 'is_correct_answer' => false],
            ['question_id' => 19, 'option_content' => 'Dùng toàn cục', 'is_correct_answer' => false],
            ['question_id' => 19, 'option_content' => 'Không cần khai báo', 'is_correct_answer' => false],

            ['question_id' => 20, 'option_content' => 'Trả về kết quả qua return', 'is_correct_answer' => true],
            ['question_id' => 20, 'option_content' => 'Không trả về gì', 'is_correct_answer' => false],
            ['question_id' => 20, 'option_content' => 'Chỉ in dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 20, 'option_content' => 'Chỉ nhập dữ liệu', 'is_correct_answer' => false],

            ['question_id' => 21, 'option_content' => 'Lưu ký tự', 'is_correct_answer' => true],
            ['question_id' => 21, 'option_content' => 'Lưu số nguyên', 'is_correct_answer' => false],
            ['question_id' => 21, 'option_content' => 'Lưu số thực', 'is_correct_answer' => false],
            ['question_id' => 21, 'option_content' => 'Lưu mảng', 'is_correct_answer' => false],

            ['question_id' => 22, 'option_content' => 'Lưu số thực', 'is_correct_answer' => true],
            ['question_id' => 22, 'option_content' => 'Lưu số nguyên', 'is_correct_answer' => false],
            ['question_id' => 22, 'option_content' => 'Lưu ký tự', 'is_correct_answer' => false],
            ['question_id' => 22, 'option_content' => 'Lưu chuỗi', 'is_correct_answer' => false],

            ['question_id' => 23, 'option_content' => 'Độ chính xác cao hơn', 'is_correct_answer' => true],
            ['question_id' => 23, 'option_content' => 'Dung lượng nhỏ hơn', 'is_correct_answer' => false],
            ['question_id' => 23, 'option_content' => 'Nhanh hơn', 'is_correct_answer' => false],
            ['question_id' => 23, 'option_content' => 'Ít bộ nhớ hơn', 'is_correct_answer' => false],

            ['question_id' => 24, 'option_content' => 'Lấy kích thước dữ liệu', 'is_correct_answer' => true],
            ['question_id' => 24, 'option_content' => 'Lấy giá trị dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 24, 'option_content' => 'Gán dữ liệu', 'is_correct_answer' => false],
            ['question_id' => 24, 'option_content' => 'So sánh dữ liệu', 'is_correct_answer' => false],

            ['question_id' => 25, 'option_content' => 'Giá trị không thay đổi', 'is_correct_answer' => true],
            ['question_id' => 25, 'option_content' => 'Giá trị thay đổi liên tục', 'is_correct_answer' => false],
            ['question_id' => 25, 'option_content' => 'Biến toàn cục', 'is_correct_answer' => false],
            ['question_id' => 25, 'option_content' => 'Biến cục bộ', 'is_correct_answer' => false],


            ['option_content' => 'Cấu trúc LIFO', 'is_correct_answer' => true, 'question_id' => 26],
            ['option_content' => 'Cấu trúc FIFO', 'is_correct_answer' => false, 'question_id' => 26],
            ['option_content' => 'Cấu trúc cây', 'is_correct_answer' => false, 'question_id' => 26],
            ['option_content' => 'Cấu trúc đồ thị', 'is_correct_answer' => false, 'question_id' => 26],

            ['option_content' => 'Cấu trúc FIFO', 'is_correct_answer' => true, 'question_id' => 27],
            ['option_content' => 'Cấu trúc LIFO', 'is_correct_answer' => false, 'question_id' => 27],
            ['option_content' => 'Cấu trúc ngăn xếp', 'is_correct_answer' => false, 'question_id' => 27],
            ['option_content' => 'Cấu trúc cây', 'is_correct_answer' => false, 'question_id' => 27],

            ['option_content' => 'Các node liên kết', 'is_correct_answer' => true, 'question_id' => 28],
            ['option_content' => 'Mảng liên tục', 'is_correct_answer' => false, 'question_id' => 28],
            ['option_content' => 'Cấu trúc stack', 'is_correct_answer' => false, 'question_id' => 28],
            ['option_content' => 'Cấu trúc queue', 'is_correct_answer' => false, 'question_id' => 28],

            ['option_content' => 'Không liên tục bộ nhớ', 'is_correct_answer' => true, 'question_id' => 29],
            ['option_content' => 'Luôn liên tục bộ nhớ', 'is_correct_answer' => false, 'question_id' => 29],
            ['option_content' => 'Nhanh hơn mọi trường hợp', 'is_correct_answer' => false, 'question_id' => 29],
            ['option_content' => 'Không lưu được dữ liệu', 'is_correct_answer' => false, 'question_id' => 29],

            ['option_content' => 'Tìm kiếm chia đôi', 'is_correct_answer' => true, 'question_id' => 30],
            ['option_content' => 'Tìm kiếm tuần tự', 'is_correct_answer' => false, 'question_id' => 30],
            ['option_content' => 'Sắp xếp dữ liệu', 'is_correct_answer' => false, 'question_id' => 30],
            ['option_content' => 'Xóa dữ liệu', 'is_correct_answer' => false, 'question_id' => 30],

            ['option_content' => 'Tăng tuyến tính', 'is_correct_answer' => true, 'question_id' => 31],
            ['option_content' => 'Tăng logarit', 'is_correct_answer' => false, 'question_id' => 31],
            ['option_content' => 'Không tăng', 'is_correct_answer' => false, 'question_id' => 31],
            ['option_content' => 'Giảm dần', 'is_correct_answer' => false, 'question_id' => 31],

            ['option_content' => 'Sắp xếp nổi bọt', 'is_correct_answer' => true, 'question_id' => 32],
            ['option_content' => 'Sắp xếp nhanh', 'is_correct_answer' => false, 'question_id' => 32],
            ['option_content' => 'Sắp xếp chèn', 'is_correct_answer' => false, 'question_id' => 32],
            ['option_content' => 'Sắp xếp trộn', 'is_correct_answer' => false, 'question_id' => 32],

            ['option_content' => 'Chọn phần tử nhỏ nhất', 'is_correct_answer' => true, 'question_id' => 33],
            ['option_content' => 'Chèn phần tử', 'is_correct_answer' => false, 'question_id' => 33],
            ['option_content' => 'Đổi chỗ ngẫu nhiên', 'is_correct_answer' => false, 'question_id' => 33],
            ['option_content' => 'Chia mảng', 'is_correct_answer' => false, 'question_id' => 33],

            ['option_content' => 'Chèn phần tử vào đúng vị trí', 'is_correct_answer' => true, 'question_id' => 34],
            ['option_content' => 'Đổi chỗ phần tử', 'is_correct_answer' => false, 'question_id' => 34],
            ['option_content' => 'Chia mảng', 'is_correct_answer' => false, 'question_id' => 34],
            ['option_content' => 'Chọn max', 'is_correct_answer' => false, 'question_id' => 34],

            ['option_content' => 'O(n log n)', 'is_correct_answer' => true, 'question_id' => 35],
            ['option_content' => 'O(n^2)', 'is_correct_answer' => false, 'question_id' => 35],
            ['option_content' => 'O(n)', 'is_correct_answer' => false, 'question_id' => 35],
            ['option_content' => 'O(log n)', 'is_correct_answer' => false, 'question_id' => 35],

            ['option_content' => 'Chia để trị', 'is_correct_answer' => true, 'question_id' => 36],
            ['option_content' => 'Sắp xếp nổi bọt', 'is_correct_answer' => false, 'question_id' => 36],
            ['option_content' => 'Duyệt tuyến tính', 'is_correct_answer' => false, 'question_id' => 36],
            ['option_content' => 'Tìm kiếm tuần tự', 'is_correct_answer' => false, 'question_id' => 36],

            ['option_content' => 'Cây nhị phân đặc biệt', 'is_correct_answer' => true, 'question_id' => 37],
            ['option_content' => 'Danh sách liên kết', 'is_correct_answer' => false, 'question_id' => 37],
            ['option_content' => 'Mảng', 'is_correct_answer' => false, 'question_id' => 37],
            ['option_content' => 'Đồ thị', 'is_correct_answer' => false, 'question_id' => 37],

            ['option_content' => 'Mỗi node tối đa 2 con', 'is_correct_answer' => true, 'question_id' => 38],
            ['option_content' => 'Mỗi node vô hạn con', 'is_correct_answer' => false, 'question_id' => 38],
            ['option_content' => 'Không có node', 'is_correct_answer' => false, 'question_id' => 38],
            ['option_content' => 'Chỉ có 1 node', 'is_correct_answer' => false, 'question_id' => 38],

            ['option_content' => 'Duyệt sâu', 'is_correct_answer' => true, 'question_id' => 39],
            ['option_content' => 'Duyệt rộng', 'is_correct_answer' => false, 'question_id' => 39],
            ['option_content' => 'Sắp xếp', 'is_correct_answer' => false, 'question_id' => 39],
            ['option_content' => 'Tìm kiếm nhị phân', 'is_correct_answer' => false, 'question_id' => 39],

            ['option_content' => 'Duyệt rộng', 'is_correct_answer' => true, 'question_id' => 40],
            ['option_content' => 'Duyệt sâu', 'is_correct_answer' => false, 'question_id' => 40],
            ['option_content' => 'Sắp xếp', 'is_correct_answer' => false, 'question_id' => 40],
            ['option_content' => 'Đệ quy', 'is_correct_answer' => false, 'question_id' => 40],

            ['option_content' => 'Tập đỉnh và cạnh', 'is_correct_answer' => true, 'question_id' => 41],
            ['option_content' => 'Danh sách số', 'is_correct_answer' => false, 'question_id' => 41],
            ['option_content' => 'Mảng 2 chiều', 'is_correct_answer' => false, 'question_id' => 41],
            ['option_content' => 'Cây', 'is_correct_answer' => false, 'question_id' => 41],

            ['option_content' => 'Cạnh có hướng', 'is_correct_answer' => true, 'question_id' => 42],
            ['option_content' => 'Không có cạnh', 'is_correct_answer' => false, 'question_id' => 42],
            ['option_content' => 'Cạnh vô hướng', 'is_correct_answer' => false, 'question_id' => 42],
            ['option_content' => 'Chỉ có node', 'is_correct_answer' => false, 'question_id' => 42],

            ['option_content' => 'Cạnh không hướng', 'is_correct_answer' => true, 'question_id' => 43],
            ['option_content' => 'Cạnh có hướng', 'is_correct_answer' => false, 'question_id' => 43],
            ['option_content' => 'Không có cạnh', 'is_correct_answer' => false, 'question_id' => 43],
            ['option_content' => 'Chỉ có node', 'is_correct_answer' => false, 'question_id' => 43],

            ['option_content' => 'Tìm đường ngắn nhất', 'is_correct_answer' => true, 'question_id' => 44],
            ['option_content' => 'Sắp xếp mảng', 'is_correct_answer' => false, 'question_id' => 44],
            ['option_content' => 'Duyệt cây', 'is_correct_answer' => false, 'question_id' => 44],
            ['option_content' => 'Tìm max', 'is_correct_answer' => false, 'question_id' => 44],

            ['option_content' => 'Hàm gọi lại chính nó', 'is_correct_answer' => true, 'question_id' => 45],
            ['option_content' => 'Hàm không trả về', 'is_correct_answer' => false, 'question_id' => 45],
            ['option_content' => 'Hàm chỉ chạy 1 lần', 'is_correct_answer' => false, 'question_id' => 45],
            ['option_content' => 'Hàm nhập dữ liệu', 'is_correct_answer' => false, 'question_id' => 45],

            ['option_content' => 'Quay lui thử nghiệm', 'is_correct_answer' => true, 'question_id' => 46],
            ['option_content' => 'Duyệt tuyến tính', 'is_correct_answer' => false, 'question_id' => 46],
            ['option_content' => 'Sắp xếp nhanh', 'is_correct_answer' => false, 'question_id' => 46],
            ['option_content' => 'Tìm kiếm nhị phân', 'is_correct_answer' => false, 'question_id' => 46],

            ['option_content' => 'Chọn tối ưu cục bộ', 'is_correct_answer' => true, 'question_id' => 47],
            ['option_content' => 'Thử tất cả', 'is_correct_answer' => false, 'question_id' => 47],
            ['option_content' => 'Gọi đệ quy', 'is_correct_answer' => false, 'question_id' => 47],
            ['option_content' => 'Lưu mảng', 'is_correct_answer' => false, 'question_id' => 47],

            ['option_content' => 'Tối ưu bằng ghi nhớ', 'is_correct_answer' => true, 'question_id' => 48],
            ['option_content' => 'Chạy ngẫu nhiên', 'is_correct_answer' => false, 'question_id' => 48],
            ['option_content' => 'Không tối ưu', 'is_correct_answer' => false, 'question_id' => 48],
            ['option_content' => 'Chỉ lặp', 'is_correct_answer' => false, 'question_id' => 48],

            ['option_content' => 'Lưu dữ liệu bằng hash', 'is_correct_answer' => true, 'question_id' => 49],
            ['option_content' => 'Lưu theo thứ tự', 'is_correct_answer' => false, 'question_id' => 49],
            ['option_content' => 'Lưu dạng cây', 'is_correct_answer' => false, 'question_id' => 49],
            ['option_content' => 'Lưu dạng mảng 2D', 'is_correct_answer' => false, 'question_id' => 49],

            ['option_content' => 'Trùng giá trị hash', 'is_correct_answer' => true, 'question_id' => 50],
            ['option_content' => 'Không có giá trị', 'is_correct_answer' => false, 'question_id' => 50],
            ['option_content' => 'Sai kiểu dữ liệu', 'is_correct_answer' => false, 'question_id' => 50],
            ['option_content' => 'Lỗi bộ nhớ', 'is_correct_answer' => false, 'question_id' => 50],

        ];


        AnswerOption::upsert(
            $answers,
            ['id'] // hoặc key unique phù hợp
        );
    }
}
