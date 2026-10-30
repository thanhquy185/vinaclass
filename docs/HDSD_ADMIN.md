# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG - DÀNH CHO QUẢN TRỊ VIÊN (ADMINISTRATOR)
## HỆ THỐNG QUẢN LÝ KHẢO THÍ & THI TRẮC NGHIỆM TRỰC TUYẾN VINACLASS

---

> **Phiên bản tài liệu:** 2.0  
> **Áp dụng cho:** Quản trị viên hệ thống (Super Admin / School Admin / Academic Manager)  
> **Mã nguồn liên quan:** `client/src/features/admin/`, `client/src/features/identity/`, `client/src/features/authorization/`, `client/src/features/catalogs/`, `client/src/features/teacher-assignments/`  
> **Backend API:** `server/app/Http/Controllers/` (`UserController`, `PermissionAdministrationController`, `RoleController`, `SubjectController`, `ChapterController`, `DifficultyController`, `TeacherSubjectController`, `DashboardController`)  

---

## MỤC LỤC TỔNG QUAN

1. [Tổng quan Vai trò & Phân cấp Quyền Quản trị](#1-tổng-quan-vai-trò--phân-cấp-quyền-quản-trị)
2. [Đăng nhập & Quản lý Phiên làm việc Quản trị](#2-đăng-nhập--quản-lý-phiên-làm-việc-quản-trị)
3. [Bảng điều khiển Giám sát Hệ thống (Admin Dashboard & Statistics)](#3-bảng-điều-khiển-giám-sát-hệ-thống-admin-dashboard--statistics)
4. [Quản trị Người dùng (User Management)](#4-quản-trị-người-dùng-user-management)
   - 4.1. Tra cứu và lọc danh sách người dùng
   - 4.2. Thêm mới tài khoản người dùng
   - 4.3. Cập nhật thông tin & Thay đổi trạng thái tài khoản (Khóa/Mở khóa)
   - 4.4. Đặt lại mật khẩu (Reset Password)
5. [Phân quyền Quản trị Nâng cao RBAC v2 (Role-Based Access Control)](#5-phân-quyền-quản-trị-nâng-cao-rbac-v2-role-based-access-control)
   - 5.1. Quản lý Vai trò / Nhóm quyền (Roles & Permission Groups)
   - 5.2. Ma trận Phân quyền 2 chiều (Action Matrix)
   - 5.3. Gán và ghi đè quyền cá nhân (Personal Permission Override)
6. [Quản lý Danh mục Đào tạo Học thuật (Catalogs)](#6-quản-lý-danh-mục-đào-tạo-học-thuật-catalogs)
   - 6.1. Quản lý Môn học (Subjects)
   - 6.2. Quản lý Chương bài học (Chapters)
   - 6.3. Quản lý Mức độ khó (Difficulty Levels)
7. [Phân công Giảng dạy Môn học (Teacher Subject Assignments)](#7-phân-công-giảng-dạy-môn-học-teacher-subject-assignments)
8. [Quy trình Xử lý Sự cố & Khuyến nghị Bảo mật](#8-quy-trình-xử-lý-sự-cố--khuyến-nghị-bảo-mật)

---

## 1. TỔNG QUAN VAI TRÒ & PHÂN CẤP QUYỀN QUẢN TRỊ

Hệ thống VinaClass phân định rõ ràng 3 cấp độ quản trị:
- **Super Administrator (Quản trị tối cao):** Có toàn quyền trên tất cả các phân hệ, bao gồm phân quyền RBAC v2, khởi tạo vai trò mới, quản lý toàn bộ cơ sở dữ liệu và cấu hình hệ thống.
- **Academic Administrator (Quản trị học vụ):** Quản lý danh mục đào tạo (môn học, chương, mức độ khó), phân công môn học cho giảng viên và theo dõi thống kê học tập.
- **User Administrator (Quản trị tài khoản):** Quản lý danh sách người dùng, kích hoạt/khóa tài khoản, cấp lại mật khẩu và hỗ trợ người dùng.

```
       +-------------------------------------------------------+
       |             HỆ THỐNG PHÂN QUYỀN RBAC v2               |
       +-------------------------------------------------------+
                                  |
         +------------------------+------------------------+
         |                                                 |
         v                                                 v
+-------------------------------+               +-------------------------------+
|  Quyền hạn theo Vai trò       |               |  Ghi đè quyền Cá nhân         |
|  (Role-based Permissions)     |               |  (Personal Permission Grants) |
+-------------------------------+               +-------------------------------+
         |                                                 |
         +------------------------+------------------------+
                                  |
                                  v
                +------------------------------------+
                |  TỔNG HỢP QUYỀN THỰC THI HIỆU LỰC  |
                |  (Effective User Permissions)      |
                +------------------------------------+
```

---

## 2. ĐĂNG NHẬP & QUẢN LÝ PHIÊN LÀM VIỆC QUẢN TRỊ

### 2.1. Đăng nhập hệ thống
- **Đường dẫn truy cập:** `/auth/login`
- **Các bước thực hiện:**
  1. Mở trình duyệt (khuyến nghị Google Chrome hoặc Microsoft Edge phiên bản mới nhất).
  2. Nhập URL hệ thống VinaClass (ví dụ: `https://vinaclass.edu.vn/auth/login`).
  3. Nhập **Email quản trị** và **Mật khẩu**.
  4. Nhấn nút **Đăng nhập**. Hệ thống kiểm tra thông tin qua `AuthController@login` và cấp `auth_token` cùng thông tin quyền hạn.

> [!IMPORTANT]
> Tài khoản có vai trò Quản trị viên bắt buộc phải kích hoạt mật khẩu có độ phức tạp cao (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt). Không chia sẻ thông tin đăng nhập cho người khác.

### 2.2. Quản lý phiên làm việc đa thiết bị
- **Đường dẫn truy cập:** `/profile` (tab *Phiên đăng nhập*)
- **Chức năng:**
  - Theo dõi danh sách các thiết bị, trình duyệt, địa chỉ IP và thời điểm đăng nhập gần nhất thông qua bảng `auth_sessions`.
  - Nhấn nút **Đăng xuất khỏi tất cả các thiết bị khác** để thu hồi các token đã cấp nếu nghi ngờ phiên làm việc bị lộ.

---

## 3. BẢNG ĐIỀU KHIỂN GIÁM SÁT HỆ THỐNG (ADMIN DASHBOARD & STATISTICS)

### 3.1. Tổng quan số liệu toàn hệ thống (Admin Dashboard)
- **Đường dẫn truy cập:** `/admin/dashboard`
- **Mã nguồn:** `client/src/features/admin/pages/AdminDashboardPage.tsx`
- **API điều khiển:** `server/app/Http/Controllers/DashboardController.php`

Giao diện cung cấp các thẻ chỉ số đo lường hiệu suất (KPI Cards):
1. **Tổng người dùng (Total Users):** Phân chia rõ ràng:
   - Học sinh / Sinh viên (Students)
   - Giảng viên (Teachers)
   - Quản trị viên (Admins)
2. **Tổng số Môn học (Total Subjects):** Số lượng môn học đã được khởi tạo và đang hoạt động.
3. **Lớp học phần đang hoạt động (Active Course Groups):** Các lớp đang trong học kỳ hiện hành.
4. **Tổng số Đề thi & Lượt nộp bài (Exams & Attempts):** Thống kê số lượng đề thi đã phát hành và tổng số lượt sinh viên đã tham gia làm bài khảo thí.

### 3.2. Báo cáo phân tích chuyên sâu (Admin Statistics)
- **Đường dẫn truy cập:** `/admin/statistics`
- **Mã nguồn:** `client/src/features/admin/pages/AdminStatisticsPage.tsx`
- **Tính năng:**
  - **Lọc theo kỳ:** Lựa chọn mốc thời gian (Tuần này, Tháng này, Học kỳ I, Học kỳ II, Năm học).
  - **Biểu đồ tăng trưởng người dùng:** Theo dõi lượng sinh viên và giảng viên mới tham gia hệ thống theo dòng thời gian.
  - **Biểu đồ phân bố lượt thi:** Tần suất sinh viên làm bài theo từng khung giờ và từng ngày trong tuần.
  - **Biểu đồ hiệu suất điểm số:** Phổ điểm trung bình toàn trường theo các môn học cốt lõi.

---

## 4. QUẢN TRỊ NGƯỜI DÙNG (USER MANAGEMENT)

- **Đường dẫn truy cập:** `/users`
- **Mã nguồn:** `client/src/features/identity/pages/UserPage.tsx`
- **API điều khiển:** `server/app/Http/Controllers/UserController.php`

### 4.1. Tra cứu và lọc danh sách người dùng
Giao diện quản lý người dùng trang bị thanh công cụ lọc mạnh mẽ (`UserFiltersPanel.tsx`):
- **Tìm kiếm theo từ khóa:** Nhập Họ tên, Địa chỉ Email hoặc Mã định danh (MSSV / Mã GV).
- **Lọc theo Vai trò (Role Filter):** Lựa chọn *Tất cả*, *Quản trị viên (Admin)*, *Giảng viên (Teacher)*, hoặc *Sinh viên (Student)*.
- **Lọc theo Trạng thái (Status Filter):** Lựa chọn *Đang hoạt động (Active)* hoặc *Đã bị khóa (Blocked)*.

### 4.2. Thêm mới tài khoản người dùng thủ công
- Nhấn nút **+ Thêm người dùng** ở góc trên bên phải màn hình.
- Điền đầy đủ các trường thông tin trong hộp thoại (`UserDialog.tsx`):
  | Trường dữ liệu | Bắt buộc | Ghi chú & Ràng buộc |
  | :--- | :---: | :--- |
  | **Họ và tên** | Có | Chuỗi từ 2 đến 100 ký tự |
  | **Địa chỉ Email** | Có | Định dạng email hợp lệ, duy nhất trên toàn hệ thống |
  | **Mật khẩu khởi tạo** | Có | Tối thiểu 6 ký tự |
  | **Xác nhận mật khẩu** | Có | Phải trùng khớp hoàn toàn với mật khẩu |
  | **Vai trò (Role)** | Có | Chọn 1 trong các vai trò: Admin, Teacher, Student |
  | **Số điện thoại** | Không | Chuỗi số từ 10 đến 11 chữ số |
- Nhấn **Lưu thông tin** để hệ thống tạo tài khoản và ghi nhận vào cơ sở dữ liệu.

### 4.3. Cập nhật thông tin & Khóa / Mở khóa tài khoản
- **Cập nhật thông tin:** Nhấn nút biểu tượng **Chỉnh sửa** (bút chì) trên dòng người dùng tương ứng để cập nhật họ tên, số điện thoại hoặc vai trò.
- **Khóa / Mở khóa tài khoản:**
  - Nhấn nút **Khóa tài khoản** (ổ khóa đỏ).
  - Hệ thống hiển thị hộp thoại xác nhận (`UserStatusDialog.tsx`): *"Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập hoặc thực hiện bất kỳ thao tác nào."*
  - Nhấn **Xác nhận**. Hệ thống cập nhật trường `status = 0` và tự động hủy bỏ mọi phiên đăng nhập đang hoạt động của người dùng đó.
  - Khi cần kích hoạt lại, nhấn **Mở khóa**, trạng thái tài khoản chuyển về `status = 1`.

### 4.4. Đặt lại mật khẩu (Reset Password)
- Khi người dùng quên mật khẩu và không thể nhận mã OTP qua email, Quản trị viên có thể can thiệp:
  1. Nhấn nút biểu tượng **Đổi mật khẩu** (chìa khóa vàng) tại dòng người dùng.
  2. Hộp thoại `UserPasswordChangeDialog.tsx` xuất hiện.
  3. Nhập mật khẩu tạm thời mới và xác nhận mật khẩu.
  4. Nhấn **Xác nhận đổi mật khẩu**. Bàn giao mật khẩu tạm thời này cho người dùng và yêu cầu họ đổi lại mật khẩu ngay trong lần đăng nhập đầu tiên.

---

## 5. PHÂN QUYỀN QUẢN TRỊ NÂNG CAO RBAC v2 (ROLE-BASED ACCESS CONTROL)

- **Đường dẫn truy cập:** `/permission-matrix` & `/permission-groups`
- **Mã nguồn:** `client/src/features/authorization/pages/PermissionMatrixV2Page.tsx`, `PermissionGroupPage.tsx`
- **API điều khiển:** `server/app/Http/Controllers/PermissionAdministrationController.php`, `RoleController.php`

### 5.1. Quản lý Vai trò / Nhóm quyền (Roles)
- Hệ thống hỗ trợ tạo lập các vai trò quản trị linh hoạt tùy theo quy mô tổ chức giáo dục.
- Tại trang `/permission-groups`, nhấn **+ Tạo nhóm quyền mới**:
  - Nhập **Tên vai trò** (ví dụ: *Trưởng khoa / Giám đốc học vụ*).
  - Nhập **Mô tả vai trò** (phạm vi trách nhiệm).
  - Nhấn **Lưu vai trò**.

### 5.2. Ma trận Phân quyền 2 chiều (Atomic Action Matrix)
Hệ thống sử dụng cơ chế ma trận quyền nguyên tử:
- **Chiều dọc (Rows):** Danh mục các Nhóm chức năng hệ thống (Users, Roles, Subjects, Chapters, Question Bank, Exams, Classrooms, Reports...).
- **Chiều ngang (Columns):** Các hành động nguyên tử được chuẩn hóa:
  - `VIEW`: Xem danh sách và chi tiết đối tượng.
  - `CREATE`: Tạo mới đối tượng.
  - `UPDATE`: Chỉnh sửa dữ liệu đối tượng.
  - `DELETE`: Xóa đối tượng khỏi hệ thống.
  - `EXPORT`: Xuất báo cáo, dữ liệu ra file Excel/PDF.
  - `MANAGE`: Quyền quản trị đặc thù (Reset pass, Phê duyệt, Đổi trạng thái...).

```
+---------------------+--------+----------+----------+----------+----------+
| Chức năng \ Quyền   |  VIEW  |  CREATE  |  UPDATE  |  DELETE  |  EXPORT  |
+---------------------+--------+----------+----------+----------+----------+
| Người dùng (Users)  |  [x]   |   [x]    |   [x]    |   [x]    |   [x]    |
| Phân quyền (Roles)  |  [x]   |   [x]    |   [x]    |   [ ]    |   [ ]    |
| Môn học (Subjects)  |  [x]   |   [x]    |   [x]    |   [ ]    |   [x]    |
| Lớp học (Classes)   |  [x]   |   [x]    |   [x]    |   [ ]    |   [x]    |
| Ngân hàng câu hỏi   |  [x]   |   [ ]    |   [ ]    |   [ ]    |   [ ]    |
+---------------------+--------+----------+----------+----------+----------+
```

- **Thao tác lưu ma trận:**
  - Tích chọn hoặc bỏ tích các ô vuông tương ứng.
  - Nhấn nút **Lưu cấu hình phân quyền**. Hệ thống sẽ đồng bộ xuống bảng `role_details` và có hiệu lực ngay lập tức cho toàn bộ người dùng thuộc vai trò đó.

### 5.3. Gán và ghi đè quyền cá nhân (Personal Permission Override)
- Trong trường hợp một Giảng viên cần quyền đặc cách để quản trị môn học hoặc một Nhân viên cần hỗ trợ xuất báo cáo mà không cần nâng cấp toàn bộ vai trò:
  - Truy cập tab **Quyền cá nhân** tại trang quản trị quyền.
  - Chọn tài khoản người dùng đích.
  - Tích chọn bổ sung các quyền nguyên tử cụ thể. Quyền này sẽ được kết hợp (Union) với quyền của vai trò hiện tại.

---

## 6. QUẢN LÝ DANH MỤC ĐÀO TẠO HỌC THUẬT (CATALOGS)

- **Mã nguồn:** `client/src/features/catalogs/`
- **API điều khiển:** `SubjectController.php`, `ChapterController.php`, `DifficultyController.php`

### 6.1. Quản lý Môn học (Subjects)
- **Đường dẫn truy cập:** `/subjects`
- **Thao tác thêm môn học mới:**
  1. Nhấn nút **+ Thêm môn học**.
  2. Điền thông tin:
     - **Mã môn học:** Ví dụ `INT1001`, `CS101` (duy nhất, viết hoa không dấu).
     - **Tên môn học:** Ví dụ *Lập trình hướng đối tượng*, *Cơ sở dữ liệu*.
     - **Số tín chỉ:** Ví dụ `3` hoặc `4`.
     - **Mô tả:** Giới thiệu tóm tắt mục tiêu môn học.
  3. Nhấn **Xác nhận thêm môn học**.

### 6.2. Quản lý Chương bài học (Chapters)
- **Đường dẫn truy cập:** Chọn một môn học cụ thể trên bảng danh sách môn học -> Nhấn vào biểu tượng **Danh sách chương**.
- **Thao tác thêm chương mới:**
  1. Nhấn nút **+ Thêm chương**.
  2. Điền thông tin:
     - **Tên chương bài:** Ví dụ *Chương 1: Tổng quan về ngôn ngữ lập trình PHP*.
     - **Thứ tự hiển thị (Order Index):** Ví dụ `1`, `2`, `3`...
     - **Mục tiêu học tập & Nội dung tóm lược**.
  3. Nhấn **Lưu chương**.
  > [!TIP]
  > Cây cấu trúc môn học và chương là nền tảng cốt lõi để Giảng viên phân loại ngân hàng câu hỏi và tạo ma trận đề thi tự động. Do đó, cần chuẩn hóa danh mục chương trước khi giảng viên bắt đầu nhập liệu.

### 6.3. Quản lý Mức độ khó câu hỏi (Difficulty Levels)
- **Đường dẫn truy cập:** `/difficulty-level`
- Hệ thống mặc định phân cấp 4 mức độ nhận thức theo chuẩn thang đo Bloom:
  1. **Nhận biết (Easy / Dễ):** Câu hỏi nhớ lại kiến thức, định nghĩa.
  2. **Thông hiểu (Medium / Trung bình):** Hiểu ý nghĩa, so sánh, phân loại.
  3. **Vận dụng (Hard / Khó):** Áp dụng kiến thức giải quyết vấn đề mới.
  4. **Vận dụng cao (Very Hard / Cực khó):** Phân tích, đánh giá, tổng hợp bài toán phức hợp.
- Quản trị viên có thể điều chỉnh trọng số điểm hoặc màu sắc nhãn hiển thị trực quan cho từng mức độ.

---

## 7. PHÂN CÔNG GIẢNG DẠY MÔN HỌC (TEACHER SUBJECT ASSIGNMENTS)

- **Đường dẫn truy cập:** `/assignments`
- **Mã nguồn:** `client/src/features/teacher-assignments/pages/AssignmentPage.tsx`
- **API điều khiển:** `server/app/Http/Controllers/TeacherSubjectController.php`

### 7.1. Ý nghĩa nghiệp vụ
Để đảm bảo tính bảo mật và toàn vẹn dữ liệu, hệ thống VinaClass áp dụng nguyên tắc kiểm soát phân quyền chặt chẽ:
> **Chỉ Giảng viên đã được Quản trị viên phân công phụ trách môn học mới có quyền:**
> - Tạo và quản lý ngân hàng câu hỏi thuộc môn học đó.
> - Tạo cấu hình đề thi và ma trận đề thi cho môn học đó.
> - Mở lớp học phần cho môn học đó.

### 7.2. Các bước thực hiện phân công giảng dạy
1. Tại trang `/assignments`, danh sách hiển thị các giảng viên cùng các môn học đang được phân công.
2. Nhấn nút **+ Phân công giảng dạy**.
3. Trong hộp thoại phân công (`AssignmentForm.tsx`):
   - **Chọn Giảng viên:** Chọn từ danh sách giảng viên trong hệ thống.
   - **Chọn Môn học:** Tích chọn một hoặc nhiều môn học mà giảng viên sẽ phụ trách.
   - **Học kỳ & Năm học áp dụng:** Ví dụ *Học kỳ 1 - 2026-2027*.
4. Nhấn **Xác nhận phân công**.
5. Giảng viên khi đăng nhập vào hệ thống sẽ lập tức nhìn thấy các môn học được giao trong không gian làm việc của mình.

---

## 8. QUY TRÌNH XỬ LÝ SỰ CỐ & KHUYẾN NGHỊ BẢO MẬT

### 8.1. Khuyến nghị bảo mật định kỳ
- **Rà soát tài khoản:** Hàng tháng thực hiện lọc các tài khoản đã lâu không hoạt động hoặc sinh viên đã tốt nghiệp để tiến hành khóa hoặc chuyển vào chế độ lưu trữ.
- **Sao lưu cơ sở dữ liệu:** Thực hiện sao lưu CSDL MySQL định kỳ hàng ngày, đặc biệt là các bảng nhạy cảm: `users`, `exams`, `exam_attempts`, `questions`, `answer_options`.
- **Giám sát tải hệ thống:** Trước các kỳ thi trắc nghiệm tập trung có số lượng hàng nghìn sinh viên truy cập cùng lúc, kiểm tra tài nguyên máy chủ Web và Database Server, đảm bảo Redis Cache và Connection Pool hoạt động ổn định.

### 8.2. Xử lý các tình huống sự cố thường gặp
| Sự cố phát sinh | Nguyên nhân khả dĩ | Hướng dẫn khắc phục cho Admin |
| :--- | :--- | :--- |
| **Giảng viên không tạo được đề thi cho môn học** | Giảng viên chưa được gán môn học trong phân công giảng dạy. | Truy cập `/assignments`, tìm tài khoản giảng viên và thêm môn học tương ứng. |
| **Người dùng bị khóa tài khoản không rõ lý do** | Nhập sai mật khẩu quá 5 lần hoặc Admin khác đã khóa. | Truy cập `/users`, tìm người dùng, kiểm tra trạng thái và nhấn nút **Mở khóa**. |
| **Sinh viên báo điểm thi không được hiển thị** | Cấu hình đề thi đang để tùy chọn ẩn điểm bài làm. | Nhắc giảng viên phụ trách kiểm tra cấu hình đề thi tại phân hệ Đề thi (`is_published_score`). |
| **Nghi ngờ tài khoản bị chiếm đoạt quyền** | Lộ mật khẩu hoặc đăng nhập trên máy tính lạ. | Đặt lại mật khẩu mới cho tài khoản tại `/users`, sau đó thu hồi toàn bộ token phiên làm việc. |

---
*Tài liệu được biên soạn và chuẩn hóa bởi Nhóm 18 - Dự án Khảo thí Trực tuyến VinaClass.*

