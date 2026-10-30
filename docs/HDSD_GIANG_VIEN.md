# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG - DÀNH CHO GIẢNG VIÊN / GIÁO VIÊN
## HỆ THỐNG QUẢN LÝ KHẢO THÍ & THI TRẮC NGHIỆM TRỰC TUYẾN VINACLASS

---

> **Phiên bản tài liệu:** 2.0  
> **Áp dụng cho:** Giảng viên, Giáo viên bộ môn, Cán bộ phụ trách khảo thí lớp học  
> **Mã nguồn giao diện liên quan:** `client/src/features/classrooms/`, `client/src/features/question-bank/`, `client/src/features/assessments/`  
> **Backend Controllers:** `CourseGroupController.php`, `CourseGroupMaterialController.php`, `QuestionController.php`, `ExamController.php`, `ExamConfigurationController.php`, `ExamAttemptController.php`, `ExamAttemptLogController.php`  

---

## MỤC LỤC TỔNG QUAN

1. [Không gian Làm việc & Đăng nhập Giảng viên](#1-không-gian-làm-việc--đăng-nhập-giảng-viên)
2. [Quản lý Lớp học phần (Course Groups)](#2-quản-lý-lớp-học-phần-course-groups)
   - 2.1. Khởi tạo lớp học phần mới
   - 2.2. Quản lý Mã mời vào lớp (Invite Code)
   - 2.3. Bảng tin lớp học & Đăng thông báo (Stream Tab)
   - 2.4. Quản lý Học liệu & Tài liệu môn học (Materials Tab)
3. [Quản lý Danh sách Học viên trong lớp (Class Roster)](#3-quản-lý-danh-sách-học-viên-trong-lớp-class-roster)
   - 3.1. Thêm lẻ sinh viên vào lớp
   - 3.2. Import danh sách sinh viên hàng loạt từ tệp Excel chuẩn
   - 3.3. Quản lý và Xuất danh sách lớp ra Excel
4. [Quản lý Ngân hàng Câu hỏi Trắc nghiệm (Question Bank)](#4-quản-lý-ngân-hàng-câu-hỏi-trắc-nghiệm-question-bank)
   - 4.1. Cấu trúc và bộ lọc ngân hàng câu hỏi
   - 4.2. Soạn tạo câu hỏi mới với công thức Toán KaTeX & Hình ảnh
   - 4.3. Quản lý 4 đáp án A/B/C/D và lời giải thích
   - 4.4. Phân loại Kho riêng (Private) & Kho chia sẻ (Public)
   - 4.5. Tính năng Sao chép (Clone) câu hỏi
5. [Soạn & Cấu hình Đề thi Trắc nghiệm (Exams & Assessments)](#5-soạn--cấu-hình-đề-thi-trắc-nghiệm-exams--assessments)
   - 5.1. Tạo đề thi Thủ công (Chọn từng câu hỏi)
   - 5.2. Tạo đề thi Tự động theo Ma trận Cấu trúc tỷ lệ (Auto Matrix Generator)
   - 5.3. Thiết lập các thông số đề thi & Quy chế thi
   - 5.4. Kích hoạt tính năng Giám sát Chống gian lận (Tab Blur Detection)
   - 5.5. Giao đề thi cho Lớp học phần
6. [Giám sát Thi, Chấm điểm & Báo cáo Thống kê Điểm số](#6-giám-sát-thi-chấm-điểm--báo-cáo-thống-kê-điểm-số)
   - 6.1. Giám sát quá trình làm bài của sinh viên theo thời gian thực
   - 6.2. Kiểm tra Nhật ký Vi phạm đổi tab (Cheat Logs)
   - 6.3. Rà soát chi tiết bài thi của từng học viên
   - 6.4. Phân tích phổ điểm lớp học phần
   - 6.5. Xuất Sổ điểm lớp học ra tệp Excel
7. [Bảng tóm tắt các lưu ý quan trọng dành cho Giảng viên](#7-bảng-tóm-tắt-các-lưu-ý-quan-trọng-dành-cho-giảng-viên)

---

## 1. KHÔNG GIAN LÀM VIỆC & ĐĂNG NHẬP GIẢNG VIÊN

### 1.1. Đăng nhập hệ thống
- Truy cập địa chỉ web của VinaClass tại đường dẫn: `/auth/login`.
- Đăng nhập bằng tài khoản Giảng viên do Quản trị viên cấp hoặc sử dụng nút **Đăng nhập bằng Google** (nếu email trường học đã liên kết).
- Sau khi đăng nhập thành công, hệ thống chuyển hướng đến trang chủ Giảng viên, hiển thị danh mục các lớp học phần và các môn học được phân công giảng dạy.

```
+-----------------------------------------------------------------------------------+
| VINACLASS - CỔNG THÔNG TIN GIẢNG VIÊN                                 [Giảng viên] |
+-----------------------------------------------------------------------------------+
| [Lớp học phần]      [Ngân hàng câu hỏi]      [Quản lý Đề thi]      [Sổ điểm]      |
+-----------------------------------------------------------------------------------+
```

---

## 2. QUẢN LÝ LỚP HỌC PHẦN (COURSE GROUPS)

- **Mã nguồn:** `client/src/features/classrooms/`
- **Giao diện trang:** `/courses` và `/course-group/:id`
- **Controller:** `CourseGroupController.php`

### 2.1. Khởi tạo lớp học phần mới
1. Tại màn hình danh sách lớp học, nhấn nút **+ Tạo lớp học mới**.
2. Điền các trường thông tin trong hộp thoại (`CourseGroupForm.tsx`):
   - **Tên lớp học phần:** Ví dụ: *Lập trình Web - K64 - Nhóm 02*.
   - **Môn học phụ trách:** Chọn môn học từ danh sách môn mà bạn đã được phân công.
   - **Học kỳ & Năm học:** Ví dụ: *Học kỳ 1 - Năm học 2026-2027*.
   - **Mô tả / Lời nhắn đầu kỳ:** Thông tin giới thiệu môn học, mục tiêu và yêu cầu đối với sinh viên.
3. Nhấn **Xác nhận tạo lớp**. Hệ thống tự động tạo lớp và sinh một **Mã mời (Invite Code)** ngẫu nhiên gồm 8 ký tự duy nhất.

### 2.2. Quản lý Mã mời vào lớp (Invite Code)
Mã mời giúp sinh viên tự ghi danh vào lớp mà giảng viên không cần thêm từng sinh viên thủ công:
- **Xem mã mời:** Mã mời được hiển thị nổi bật tại góc trên bên trái bảng tin lớp học (`CourseGroupInviteCodePanel.tsx`).
- **Sao chép mã mời:** Nhấn nút biểu tượng **Copy** để sao chép mã và gửi cho sinh viên qua nhóm Zalo, Teams hoặc Email.
- **Tạo lại mã mời mới (Reset Code):** Nếu mã mời bị rò rỉ ra ngoài lớp, nhấn nút **Đặt lại mã mời**. Mã cũ sẽ lập tức hết hiệu lực và hệ thống sinh một mã mới an toàn.

### 2.3. Bảng tin lớp học & Đăng thông báo (Stream Tab)
- Tab **Bảng tin (Stream)** hoạt động tương tự như luồng tin tức của Google Classroom:
  - Giảng viên có thể soạn thông báo dặn dò lịch học, dặn dò chuẩn bị trước kỳ thi.
  - Cho phép đính kèm tệp tin tài liệu hoặc liên kết ngoài.
  - Sinh viên trong lớp có thể đọc và bình luận phản hồi dưới mỗi bài đăng.

### 2.4. Quản lý Học liệu & Tài liệu môn học (Materials Tab)
- Tab **Tài liệu học tập (Materials)**:
  - Nhấn nút **+ Đăng tải tài liệu**.
  - Nhập tiêu đề tài liệu, chọn chương bài học liên quan.
  - Tải lên tệp tin: Hỗ trợ tệp định dạng PDF, PowerPoint (.pptx, .ppt), Word (.docx, .doc), hoặc file nén (.zip).
  - Tệp tin sau khi tải lên được lưu trữ trên máy chủ an toàn và sinh liên kết tải về cho học viên trong lớp.

---

## 3. QUẢN LÝ DANH SÁCH HỌC VIÊN TRONG LỚP (CLASS ROSTER)

- **Giao diện tab:** Tab **Mọi người (People)** tại chi tiết lớp học.
- **Controller:** `CourseGroupStudentController.php`

```
+-----------------------------------------------------------------------------------+
| TAB: MỌI NGƯỜI (PEOPLE) - LỚP: LẬP TRÌNH WEB (K64-N02)                            |
+-----------------------------------------------------------------------------------+
| Giảng viên phụ trách: TS. Nguyễn Văn A                                            |
+-----------------------------------------------------------------------------------+
| Sinh viên lớp (45 sinh viên)             [+ Thêm SV]  [Import Excel]  [Xuất Excel]|
|                                                                                   |
| STT | Mã SV      | Họ và tên            | Email                 | Thao tác        |
| 1   | 2020601234 | Trần Văn Bình        | binh.tv@school.edu.vn | [Chi tiết] [Xóa]|
| 2   | 2020605678 | Lê Thị Cẩm           | cam.lt@school.edu.vn  | [Chi tiết] [Xóa]|
+-----------------------------------------------------------------------------------+
```

### 3.1. Thêm lẻ sinh viên vào lớp
- Nhấn **+ Thêm sinh viên** (`ManualStudentEnrollmentForm.tsx`).
- Nhập địa chỉ Email hoặc Mã sinh viên (MSSV) của sinh viên cần thêm.
- Nhấn **Thêm vào lớp**. Nếu tài khoản sinh viên đã có trong hệ thống, sinh viên sẽ được ghi danh ngay vào lớp học phần.

### 3.2. Import danh sách sinh viên hàng loạt từ tệp Excel chuẩn
Để tiết kiệm thời gian khi lớp học có từ 40 đến 100 sinh viên:
1. Nhấn nút **Import Excel** (`StudentRosterImportForm.tsx`).
2. Nhấn nút **Tải file mẫu (.xlsx)** để tải về mẫu bảng tính chuẩn do hệ thống cung cấp.
3. Điền thông tin sinh viên vào tệp mẫu gồm các cột:
   - Cột A: `STT` (Số thứ tự)
   - Cột B: `student_code` (Mã số sinh viên)
   - Cột C: `full_name` (Họ và tên sinh viên)
   - Cột D: `email` (Địa chỉ email sinh viên)
4. Nhấn **Chọn tệp** và tải tệp Excel vừa chuẩn bị lên hệ thống.
5. Hệ thống hiển thị bảng xem trước (Preview):
   - Đánh dấu màu xanh cho các dòng dữ liệu hợp lệ.
   - Đánh dấu màu đỏ và thông báo lý do cho các dòng bị lỗi (ví dụ: email sai định dạng, MSSV đã tồn tại trong lớp).
6. Nhấn **Xác nhận Import** để hoàn tất ghi danh toàn bộ danh sách hợp lệ.

### 3.3. Xuất danh sách sinh viên ra Excel
- Nhấn nút **Xuất danh sách Excel**.
- Hệ thống lập tức xuất ra tệp Excel đầy đủ thông tin: STT, Mã sinh viên, Họ và tên, Email, Ngày tham gia lớp để giảng viên phục vụ công tác điểm danh truyền thống.

---

## 4. QUẢN LÝ NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM (QUESTION BANK)

- **Đường dẫn truy cập:** `/question`
- **Mã nguồn:** `client/src/features/question-bank/pages/QuestionBankPage.tsx`
- **Controller:** `QuestionController.php`, `AnswerOptionController.php`

### 4.1. Cấu trúc và bộ lọc ngân hàng câu hỏi
Ngân hàng câu hỏi được tổ chức phân cấp khoa học:
- **Theo Môn học:** Giảng viên chỉ xem và tạo câu hỏi cho các môn học mình được phân công.
- **Theo Chương bài:** Phân loại theo từng bài học cụ thể trong giáo trình.
- **Theo Mức độ khó:** Dễ (Nhận biết), Trung bình (Thông hiểu), Khó (Vận dụng), Cực khó (Vận dụng cao).
- **Theo Trạng thái kho:** Kho riêng cá nhân (Private) hoặc Kho dùng chung của bộ môn (Public).

### 4.2. Soạn tạo câu hỏi mới với công thức Toán KaTeX & Hình ảnh
1. Tại trang Ngân hàng câu hỏi, nhấn nút **+ Soạn câu hỏi mới** (`QuestionEditorForm.tsx`).
2. Chọn **Môn học**, **Chương bài**, và **Mức độ khó**.
3. **Soạn thảo Nội dung câu hỏi:**
   - Trình soạn thảo văn bản phong phú (`RichTextEditor.tsx`) hỗ trợ định dạng chữ đậm, nghiêng, màu sắc, thụt lề, danh sách gạch đầu dòng.
   - **Soạn công thức Toán học / Vật lý / Hóa học với KaTeX:**
     - Đặt công thức toán trong cặp dấu `$` cho công thức inline: ví dụ `$x^2 + 2x + 1 = 0$` hoặc `$\frac{-b \pm \sqrt{\Delta}}{2a}$`.
     - Đặt trong cặp dấu `$$` cho công thức khối hiển thị riêng một dòng: ví dụ `$$\int_{0}^{1} x^3 dx$$`.
     - Hệ thống có khung **Xem trước trực tiếp (Live Preview)** ngay bên dưới để giảng viên kiểm tra công thức hiển thị chính xác trước khi lưu.
   - **Chèn hình ảnh minh họa:**
     - Nhấn nút biểu tượng **Hình ảnh** trên thanh công cụ để tải lên sơ đồ mạch điện, biểu đồ, hình vẽ kỹ thuật (.png, .jpg, .webp).

### 4.3. Quản lý 4 đáp án A/B/C/D và lời giải thích
- Bên dưới phần nội dung câu hỏi là khu vực biên soạn 4 phương án lựa chọn (`AnswerOptionsEditor.tsx`):
  - Phương án A, B, C, D: Nhập nội dung từng đáp án (hỗ trợ cả công thức toán KaTeX).
  - Tích chọn nút tròn (Radio button) tại phương án là **Đáp án chính xác**.
  - **Lời giải thích chi tiết (Explanation):** Nhập lời giải chi tiết giải thích tại sao đáp án đó đúng, phương pháp giải nhanh. Lời giải này sẽ hiển thị cho sinh viên khi giảng viên công bố lời giải sau kỳ thi.

### 4.4. Phân loại Kho riêng (Private) & Kho chia sẻ (Public)
- **Chế độ Riêng tư (Private):** Câu hỏi chỉ hiển thị trong tài khoản của bạn, chỉ bạn mới có quyền chỉnh sửa, đưa vào đề thi và xem thống kê.
- **Chế độ Công khai (Public):** Câu hỏi được chia sẻ lên kho chung của toàn bộ môn học để các giảng viên khác cùng bộ môn có thể tham khảo.

### 4.5. Tính năng Sao chép (Clone) câu hỏi
- Khi xem các câu hỏi hay trong kho Public do đồng nghiệp đóng góp:
  - Nhấn nút biểu tượng **Sao chép (Clone)** trên thẻ câu hỏi.
  - Hệ thống tự động nhân bản một bản sao hoàn chỉnh về Kho riêng (Private) của bạn.
  - Bạn có thể tùy biến số liệu, sửa đổi câu từ để tạo thành câu hỏi mới mà không làm ảnh hưởng đến câu hỏi gốc của đồng nghiệp.

---

## 5. SOẠN & CẤU HÌNH ĐỀ THI TRẮC NGHIỆM (EXAMS & ASSESSMENTS)

- **Đường dẫn truy cập:** `/exams`
- **Mã nguồn:** `client/src/features/assessments/pages/ExamPage.tsx`, `TestFormPage.tsx`
- **Controller:** `ExamController.php`, `ExamConfigurationController.php`

Hệ thống VinaClass cung cấp **2 phương thức ra đề thi chuyên nghiệp**:

```
                              SOẠN ĐỀ THI TRẮC NGHIỆM
                                         |
            +----------------------------+----------------------------+
            |                                                         |
            v                                                         v
   [TẠO ĐỀ THỦ CÔNG]                                     [TẠO ĐỀ TỰ ĐỘNG MA TRẬN]
   - Chọn trực tiếp từng câu hỏi                          - Thiết lập tổng số câu (vd: 40)
   - Chủ động kiểm soát 100% nội dung                    - Phân bổ % theo từng Chương
   - Phù hợp bài kiểm tra ngắn 15p                        - Phân bổ % theo từng Độ khó
                                                          - Hệ thống sinh ngẫu nhiên đề thi
```

### 5.1. Phương thức 1: Tạo đề thi Thủ công (Manual Selection)
1. Nhấn nút **+ Tạo đề thi mới** -> Chọn **Tạo thủ công**.
2. Nhập Tiêu đề đề thi (ví dụ: *Kiểm tra 1 tiết - Chương 2: Mạng máy tính*), chọn Môn học.
3. Chuyển sang màn hình chọn câu hỏi (`AddQuestionTestPage.tsx`):
   - Danh sách câu hỏi trong ngân hàng hiển thị kèm bộ lọc.
   - Tích chọn từng câu hỏi mong muốn đưa vào đề thi.
   - Cột bên phải hiển thị danh sách các câu đã chọn cùng tổng điểm tạm tính.
4. Nhấn **Hoàn tất chọn câu hỏi**.

### 5.2. Phương thức 2: Tạo đề thi Tự động theo Ma trận Cấu trúc tỷ lệ (Auto Matrix Generator)
Đây là tính năng ưu việt giúp đảm bảo tính khách quan và chuẩn hóa khảo thí:
1. Nhấn nút **+ Tạo đề thi mới** -> Chọn **Tạo đề theo ma trận**.
2. Thiết lập thông số ma trận đề thi:
   - **Tổng số câu hỏi:** Ví dụ `40` câu.
   - **Phân bổ theo Chương (tổng các chương = 100%):**
     * Chương 1 (Tổng quan): `20%` (tương ứng 8 câu).
     * Chương 2 (Kiến trúc phân tầng): `40%` (tương ứng 16 câu).
     * Chương 3 (Giao thức mạng): `40%` (tương ứng 16 câu).
   - **Phân bổ theo Mức độ khó (tổng các mức độ = 100%):**
     * Mức Nhận biết (Dễ): `30%` (12 câu).
     * Mức Thông hiểu (Trung bình): `40%` (16 câu).
     * Mức Vận dụng (Khó): `20%` (8 câu).
     * Mức Vận dụng cao (Cực khó): `10%` (4 câu).
3. Nhấn nút **Tạo ma trận đề thi**:
   - Thuật toán tại Backend sẽ quét ngân hàng câu hỏi hợp lệ, bốc ngẫu nhiên câu hỏi thỏa mãn đồng thời cả 2 điều kiện (Chương x Mức độ khó).
   - Nếu ngân hàng câu hỏi thiếu số lượng câu theo tỷ lệ đã đặt, hệ thống sẽ cảnh báo chi tiết: *"Chương 2 mức độ Khó hiện chỉ có 5 câu, thiếu 3 câu để tạo ma trận."*

### 5.3. Thiết lập các thông số đề thi & Quy chế thi
Tại tab **Cấu hình đề thi (Settings)**, giảng viên thiết lập các tham số:
| Tham số cấu hình | Giá trị khuyến nghị | Ý nghĩa nghiệp vụ |
| :--- | :---: | :--- |
| **Thời lượng làm bài** | 45 / 60 / 90 phút | Thời gian tối đa sinh viên được phép làm bài |
| **Thời gian mở đề** | Ngày giờ cụ thể | Thời điểm sớm nhất sinh viên được phép vào phòng thi |
| **Thời gian đóng đề** | Ngày giờ cụ thể | Sau thời điểm này, đề thi sẽ tự động khóa |
| **Số lần thi tối đa** | 1 lần (hoặc 2 lần) | Giới hạn số lượt làm bài của mỗi học viên |
| **Xáo trộn thứ tự câu hỏi** | BẬT (ON) | Mỗi sinh viên sẽ nhận được thứ tự câu hỏi khác nhau |
| **Xáo trộn thứ tự đáp án** | BẬT (ON) | Các phương án A, B, C, D của từng câu được đảo ngẫu nhiên |
| **Công bố điểm ngay** | BẬT/TẮT | Tùy chọn cho sinh viên biết điểm ngay khi nộp bài |
| **Xem lại bài làm & giải thích** | TẮT (trong khi thi) | Chỉ nên bật sau khi toàn bộ lớp đã hoàn thành kỳ thi |

### 5.4. Kích hoạt tính năng Giám sát Chống gian lận (Tab Blur Detection)
- Để hạn chế việc sinh viên mở Google tra tài liệu hoặc trao đổi bài trên ứng dụng nhắn tin:
  - Bật tùy chọn: **Giám sát vi phạm đổi màn hình (Anti-cheating Monitoring)**.
  - Khi sinh viên rời khỏi cửa sổ phòng thi (chuyển tab trình duyệt, thu nhỏ cửa sổ, mở phần mềm khác), hệ thống lập tức hiển thị cảnh báo vi phạm trên màn hình sinh viên và ghi lại một bản ghi vi phạm (`TAB_BLUR`) kèm mốc thời gian chính xác vào cơ sở dữ liệu máy chủ.

### 5.5. Giao đề thi cho Lớp học phần
- Tại mục **Phân phối đề thi (Class Assignment)**:
  - Tích chọn một hoặc nhiều lớp học phần mà bạn muốn giao đề thi này.
  - Nhấn **Phát hành đề thi (Publish Exam)**. Đề thi sẽ xuất hiện trên bảng làm bài của các sinh viên thuộc lớp được chọn.

---

## 6. GIÁM SÁT THI, CHẤM ĐIỂM & BÁO CÁO THỐNG KÊ ĐIỂM SỐ

- **Đường dẫn truy cập:** `/tests/:id/result/:courseGroupId`
- **Mã nguồn:** `client/src/features/assessments/pages/ResultPage.tsx`, `TestDetailPage.tsx`
- **Controller:** `ExamAttemptController.php`, `ExamAttemptLogController.php`

### 6.1. Giám sát quá trình làm bài của sinh viên theo thời gian thực
Khi kỳ thi đang diễn ra, giảng viên truy cập trang chi tiết kỳ thi để quan sát bảng theo dõi trực tiếp:
- **Số sinh viên đang làm bài:** Đang kết nối và làm bài trong phòng thi.
- **Số sinh viên đã nộp bài:** Đã hoàn tất nộp bài thi lên hệ thống.
- **Số sinh viên chưa vào thi:** Chưa nhấn bắt đầu làm bài.

### 6.2. Kiểm tra Nhật ký Vi phạm đổi tab (Cheat Logs)
- Tại bảng danh sách bài thi, cột **Số lần vi phạm (Violations)** hiển thị số lần học viên chuyển tab:
  - **0 lần (Xanh lá):** Nghiêm túc làm bài, không rời màn hình thi.
  - **1 - 2 lần (Vàng):** Cần nhắc nhở (có thể do bấm nhầm thông báo máy tính).
  - **Từ 3 lần trở lên (Đỏ):** Nghi vấn gian lận nghiêm trọng.
- Nhấn vào biểu tượng **Chi tiết vi phạm** để xem danh sách các mốc thời gian:
  * *14:15:22 - Rời cửa sổ phòng thi (Tab Blur)*
  * *14:15:35 - Quay lại phòng thi (Focus)*
  * *Thời gian ra ngoài: 13 giây.*

### 6.3. Rà soát chi tiết bài thi của từng học viên
- Nhấn nút **Xem bài thi** tại dòng sinh viên cần kiểm tra:
  - Xem toàn bộ câu hỏi sinh viên đã làm.
  - Nhận biết rõ phương án sinh viên chọn, đáp án chính xác của hệ thống, số điểm đạt được cho từng câu.
  - Xem mốc thời gian nộp bài: Nộp bài chủ động hay hệ thống tự thu bài do hết giờ.

### 6.4. Phân tích phổ điểm lớp học phần
Hệ thống tự động vẽ biểu đồ phân phối điểm số của lớp (`ExamScoreDistributionChart.tsx`):
- Điểm trung bình cả lớp (Mean score).
- Điểm cao nhất (Max) và điểm thấp nhất (Min).
- Tỷ lệ sinh viên đạt loại Giỏi (8.5 - 10), Khá (7.0 - 8.4), Trung bình (5.0 - 6.9), và Yếu (< 5.0).

### 6.5. Xuất Sổ điểm lớp học ra tệp Excel
- Nhấn nút **Xuất bảng điểm Excel (Export Gradebook)**.
- Hệ thống tải xuống tệp Excel tiêu chuẩn chứa: STT, Mã sinh viên, Họ và tên, Điểm số (thang 10), Số câu đúng/sai, Thời gian làm bài, Số lần vi phạm đổi tab, Phân loại học lực. Bảng điểm này sẵn sàng để giảng viên nộp về Phòng Khảo thí & Đảm bảo chất lượng.

---

## 7. BẢNG TÓM TẮT CÁC LƯU Ý QUAN TRỌNG DÀNH CHO GIẢNG VIÊN

| Tình huống | Hướng xử lý khuyến nghị |
| :--- | :--- |
| **Không tìm thấy môn học khi tạo câu hỏi** | Liên hệ Quản trị viên để kiểm tra lại việc phân công môn học cho tài khoản của bạn tại `/assignments`. |
| **Sinh viên bị mất điện hoặc tắt máy tính khi đang thi** | Không cần lo lắng. Toàn bộ đáp án sinh viên đã bấm chọn đều được lưu ngầm tự động (Auto-save) trên máy chủ. Sinh viên bật lại máy, đăng nhập và nhấn **Tiếp tục làm bài**, đồng hồ sẽ tiếp tục đếm theo thời gian thực của máy chủ. |
| **Cần cho sinh viên làm lại bài do sự cố mạng** | Vào chi tiết bài thi của sinh viên đó, nhấn nút **Cho phép thi lại (Allow Retake)** để cấp thêm 1 lượt làm bài mới. |
| **Muốn giữ bí mật đáp án sau kỳ thi** | Đảm bảo tùy chọn *Cho phép xem lại đáp án và giải thích* đang ở trạng thái **TẮT**. Sau khi toàn bộ các lớp hoàn thành kỳ thi mới bật lại tính năng này. |

---
*Tài liệu được biên soạn và chuẩn hóa bởi Nhóm 18 - Dự án Khảo thí Trực tuyến VinaClass.*

