<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Lấy dữ liệu liên quan
        $teacher = User::where('username', 'giangvien')->first();
        $monLapTrinhC = Subject::where('subject_name', 'Lập trình C')->first();
        $monCTDL = Subject::where('subject_name', 'Cấu trúc dữ liệu và giải thuật')->first();

        $cauHois = [


            // ===== MÔN 1: LẬP TRÌNH C (25 câu) =====
            ['question_content' => 'Kiểu dữ liệu int trong C dùng để làm gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'int dùng để lưu số nguyên.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Hàm main() trong C có vai trò gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Là điểm bắt đầu chương trình.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Toán tử ++ trong C có ý nghĩa gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Tăng giá trị biến lên 1.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Toán tử -- trong C có ý nghĩa gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Giảm giá trị biến đi 1.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Câu lệnh if dùng để làm gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Rẽ nhánh theo điều kiện.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Câu lệnh switch-case dùng khi nào?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Khi có nhiều lựa chọn theo giá trị.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Vòng lặp for dùng khi nào?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Khi biết trước số lần lặp.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Vòng lặp while khác gì do-while?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'do-while chạy ít nhất 1 lần.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Mảng là gì trong C?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Tập hợp phần tử cùng kiểu.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Chỉ số mảng bắt đầu từ đâu?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Bắt đầu từ 0.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Con trỏ là gì?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Biến lưu địa chỉ.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Toán tử & dùng làm gì?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Lấy địa chỉ biến.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Toán tử * trong con trỏ có ý nghĩa gì?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Truy cập giá trị tại địa chỉ.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'malloc dùng để làm gì?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Cấp phát bộ nhớ động.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'free() dùng để làm gì?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Giải phóng bộ nhớ.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Hàm printf dùng để làm gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'In ra màn hình.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Hàm scanf dùng để làm gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Nhập dữ liệu.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Biến toàn cục là gì?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Khai báo ngoài hàm.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Biến cục bộ là gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Khai báo trong hàm.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Hàm có giá trị trả về là gì?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Trả về kết quả qua return.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Kiểu char dùng để làm gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Lưu ký tự.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Kiểu float dùng để làm gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Lưu số thực.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Kiểu double khác float ở điểm nào?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Độ chính xác cao hơn.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'sizeof dùng để làm gì?', 'subject_id' => 1, 'chapter_id' => 2, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Lấy kích thước dữ liệu.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Hằng số là gì?', 'subject_id' => 1, 'chapter_id' => 1, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Giá trị không thay đổi.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],

            // ===== MÔN 2: CTDL & GT (25 câu + 1 câu bí mật) =====
            ['question_content' => 'Stack là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Cấu trúc LIFO.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Queue là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Cấu trúc FIFO.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Danh sách liên kết là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Các node liên kết.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Linked list khác mảng thế nào?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Không liên tục bộ nhớ.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Binary Search là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Tìm kiếm chia đôi.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Độ phức tạp O(n) là gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Tăng tuyến tính.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Bubble Sort là gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Sắp xếp nổi bọt.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Selection Sort là gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Chọn phần tử nhỏ nhất.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Insertion Sort là gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Chèn phần tử vào đúng vị trí.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Quick Sort trung bình là bao nhiêu?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'O(n log n).', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Merge Sort là gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Chia để trị.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Heap là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Cây nhị phân đặc biệt.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Cây nhị phân là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Mỗi node tối đa 2 con.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'DFS là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Duyệt sâu.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'BFS là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Duyệt rộng.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Đồ thị là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Tập đỉnh và cạnh.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Đồ thị có hướng là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Cạnh có hướng.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Đồ thị vô hướng là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 1, 'image_url' => null, 'answer_explanation' => 'Cạnh không hướng.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Thuật toán Dijkstra dùng để làm gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Tìm đường ngắn nhất.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Đệ quy là gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 2, 'image_url' => null, 'answer_explanation' => 'Hàm gọi lại chính nó.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Backtracking là gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Quay lui thử nghiệm.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Greedy là gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Chọn tối ưu cục bộ.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Dynamic Programming là gì?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 4, 'image_url' => null, 'answer_explanation' => 'Tối ưu bằng ghi nhớ.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Hash table là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Lưu dữ liệu bằng hash.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],
            ['question_content' => 'Collision trong hash là gì?', 'subject_id' => 2, 'chapter_id' => 3, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Trùng giá trị hash.', 'default_score' => 1, 'creator_id' => 2, 'usage_count' => 0, 'status' => 'public', 'is_deleted' => false],

            ['question_content' => 'Câu hỏi bí mật của Admin?', 'subject_id' => 2, 'chapter_id' => 4, 'difficulty_id' => 3, 'image_url' => null, 'answer_explanation' => 'Trùng giá trị hash.', 'default_score' => 1, 'creator_id' => 1, 'usage_count' => 0, 'status' => 'private', 'is_deleted' => false],


        ];

        Question::upsert(
            $cauHois,
            ['id'] // hoặc khóa duy nhất phù hợp (ví dụ: nội dung câu hỏi nếu có unique)
        );
    }
}
