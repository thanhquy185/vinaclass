# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG - DÀNH CHO HỌC SINH / SINH VIÊN
## HỆ THỐNG QUẢN LÝ KHẢO THÍ & THI TRẮC NGHIỆM TRỰC TUYẾN VINACLASS

---

> **Phiên bản tài liệu:** 2.0  
> **Áp dụng cho:** Học sinh, Sinh viên tham gia học tập và khảo thí trực tuyến  
> **Giao diện liên quan:** `client/src/features/auth/`, `client/src/features/classrooms/`, `client/src/features/assessments/pages/DoTestPage.tsx`, `ResultDoTestPage.tsx`  
> **API dịch vụ:** `AuthOtpService.php`, `ExamAttemptStartService.php`, `ExamAttemptAnswerController.php`, `ExamAttemptController.php`  

---

## MỤC LỤC TỔNG QUAN

1. [Đăng ký Tài khoản Mới & Xác thực OTP Email](#1-đăng-ký-tài-khoản-mới--xác-thực-otp-email)
2. [Đăng nhập & Khôi phục Mật khẩu](#2-đăng-nhập--khôi-phục-mật-khẩu)
   - 2.1. Đăng nhập bằng Email và Mật khẩu
   - 2.2. Đăng nhập nhanh bằng tài khoản Google (OAuth)
   - 2.3. Khôi phục mật khẩu khi quên bằng mã OTP
3. [Quản lý Hồ sơ Cá nhân & Bảo mật Tài khoản](#3-quản-lý-hồ-sơ-cá-nhân--bảo-mật-tài-khoản)
4. [Tham gia Lớp học phần & Khai thác Học liệu](#4-tham-gia-lớp-học-phần--khai-thác-học-liệu)
   - 4.1. Nhập Mã mời vào lớp (Invite Code)
   - 4.2. Xem Bảng tin và Thông báo từ Giảng viên
   - 4.3. Tải về Giáo trình và Tài liệu bài giảng
5. [Quy trình Tham gia Thi Trắc nghiệm Trực tuyến](#5-quy-trình-tham-gia-thi-trắc-nghiệm-trực-tuyến)
   - 5.1. Chuẩn bị trước giờ thi (Thiết bị, Mạng, Trình duyệt)
   - 5.2. Vào phòng thi và Bắt đầu làm bài
   - 5.3. Hướng dẫn sử dụng Giao diện Phòng thi (`DoTestPage`)
   - 5.4. Cơ chế Tự động lưu đáp án ngầm (Auto-Save)
   - 5.5. Quy định Chống gian lận & Cảnh báo Chuyển màn hình thi (Tab Blur)
   - 5.6. Nộp bài thi chủ động & Tự động thu bài khi hết giờ
6. [Xem Kết quả Thi & Lời giải Thích chi tiết](#6-xem-kết-quả-thi--lời-giải-thích-chi-tiết)
7. [Bảng câu hỏi thường gặp (FAQ) & Xử lý sự cố khi làm bài](#7-bảng-câu-hỏi-thường-gặp-faq--xử-lý-sự-cố-khi-làm-bài)

---

## 1. ĐĂNG KÝ TÀI KHOẢN MỚI & XÁC THỰC OTP EMAIL

- **Đường dẫn truy cập:** `/auth/register`
- **Mã nguồn:** `client/src/features/auth/pages/RegisterPage.tsx`
- **Dịch vụ Backend:** `server/app/Services/AuthOtpService.php`

Hệ thống VinaClass áp dụng cơ chế xác thực danh tính 2 bước qua mã OTP gửi về hộp thư điện tử nhằm đảm bảo chỉ có chủ sở hữu email hợp lệ mới được kích hoạt tài khoản:

```
  +--------------------+        +---------------------+        +--------------------+
  | 1. Điền thông tin  | -----> | 2. Nhận mã OTP 6 số | -----> | 3. Nhập mã OTP     |
  |    Họ tên, Email   |        |    trong Hộp thư    |        |    (Hiệu lực 60s)  |
  +--------------------+        +---------------------+        +--------------------+
                                                                         |
                                                                         v
                                                               +--------------------+
                                                               | Kích hoạt tài khoản|
                                                               |   Thành công!      |
                                                               +--------------------+
```

### Các bước thực hiện chi tiết:
1. Truy cập trang đăng ký tài khoản tại đường dẫn `/auth/register`.
2. Điền chính xác các thông tin cá nhân:
   - **Họ và tên:** Nhập đầy đủ họ và tên thật có dấu (ví dụ: *Nguyễn Văn An*).
   - **Địa chỉ Email:** Khuyến nghị sử dụng Email sinh viên do nhà trường cấp (ví dụ: *annv.20@school.edu.vn*).
   - **Mật khẩu:** Tối thiểu 6 ký tự.
   - **Xác nhận mật khẩu:** Nhập lại chính xác mật khẩu ở trên.
3. Nhấn nút **Gửi mã xác thực OTP**.
4. Mở hộp thư email vừa đăng ký:
   - Tìm kiếm thư có tiêu đề: `[VinaClass] Mã xác thực đăng ký tài khoản`.
   - Nếu không thấy trong Hộp thư đến (Inbox), hãy kiểm tra kỹ mục **Thư rác (Spam / Junk)**.
   - Lấy mã xác thực gồm **6 chữ số** (ví dụ: `482910`).
5. Quay lại trang đăng ký VinaClass, nhập mã OTP vào 6 ô xác thực.
   > [!WARNING]
   > Mã OTP có thời gian hiệu lực là **60 giây**. Nếu đồng hồ đếm ngược về 00:00 mà bạn chưa kịp nhập mã, hãy nhấn nút **Gửi lại mã OTP** để nhận mã mới.
6. Nhấn nút **Hoàn tất đăng ký**. Hệ thống tạo tài khoản và chuyển bạn sang màn hình Đăng nhập.

---

## 2. ĐĂNG NHẬP & KHÔI PHỤC MẬT KHẨU

### 2.1. Đăng nhập bằng Email và Mật khẩu
- Truy cập `/auth/login`.
- Nhập **Email** và **Mật khẩu** đã tạo.
- Tích chọn **Ghi nhớ đăng nhập** nếu đang sử dụng máy tính cá nhân.
- Nhấn **Đăng nhập**.

### 2.2. Đăng nhập nhanh bằng tài khoản Google (OAuth)
- Tại trang đăng nhập, nhấn nút **Đăng nhập với Google**.
- Chọn tài khoản Google (Gmail trường học) của bạn trên màn hình xác thực của Google.
- Sau khi được cấp phép, hệ thống tự động đăng nhập vào VinaClass mà không cần nhập mật khẩu.

### 2.3. Khôi phục mật khẩu khi quên bằng mã OTP
- Nếu quên mật khẩu, tại trang đăng nhập hãy nhấn liên kết **Quên mật khẩu?** (`/auth/forgot-password`).
- Nhập địa chỉ Email đã đăng ký và nhấn **Gửi mã OTP khôi phục**.
- Kiểm tra email, lấy mã OTP 6 số và nhập vào màn hình xác thực.
- Thiết lập mật khẩu mới và xác nhận mật khẩu. Nhấn **Cập nhật mật khẩu** để hoàn tất.

---

## 3. QUẢN LÝ HỒ SƠ CÁ NHÂN & BẢO MẬT TÀI KHOẢN

- **Đường dẫn truy cập:** `/profile`
- **Mã nguồn:** `client/src/features/identity/pages/ProfilePage.tsx`

Tại màn hình Hồ sơ cá nhân, bạn có thể:
1. **Cập nhật thông tin:** Cập nhật số điện thoại liên lạc, kiểm tra Mã định danh sinh viên.
2. **Đổi mật khẩu định kỳ:**
   - Nhập Mật khẩu hiện tại.
   - Nhập Mật khẩu mới và Xác nhận mật khẩu mới.
   - Nhấn **Lưu thay đổi**.
3. **Quản lý thiết bị đăng nhập:**
   - Xem danh sách các thiết bị (Laptop, Điện thoại, Trình duyệt) đang duy trì phiên làm việc của bạn.
   - Nếu phát hiện thiết bị lạ hoặc đã từng đăng nhập trên máy tính quán net, hãy nhấn nút **Đăng xuất khỏi các thiết bị khác** để bảo vệ an toàn tài khoản.

---

## 4. THAM GIA LỚP HỌC PHẦN & KHAI THÁC HỌC LIỆU

- **Đường dẫn truy cập:** `/courses`
- **Mã nguồn:** `client/src/features/classrooms/`

### 4.1. Nhập Mã mời vào lớp (Invite Code)
Mỗi lớp học phần do Giảng viên quản lý sẽ có một Mã mời gồm 8 ký tự duy nhất (ví dụ: `ABC12XYZ`). Để tham gia vào lớp:
1. Tại trang chủ danh sách lớp học, nhấn nút **+ Tham gia lớp học**.
2. Hộp thoại `JoinClassForm.tsx` xuất hiện.
3. Nhập chính xác Mã mời 8 ký tự do Giảng viên cung cấp.
4. Nhấn **Tham gia**. Hệ thống xác thực mã và đưa lớp học phần đó vào danh sách lớp của bạn.

```
+-----------------------------------------------------------------------------------+
| DANH SÁCH LỚP HỌC PHẦN ĐÃ THAM GIA                    [+ Tham gia lớp học bằng mã]|
+-----------------------------------------------------------------------------------+
|  +--------------------------------+   +--------------------------------+          |
|  | LẬP TRÌNH WEB (K64-N02)        |   | CƠ SỞ DỮ LIỆU (K64-N01)        |          |
|  | Giảng viên: TS. Nguyễn Văn A   |   | Giảng viên: ThS. Trần Thị B    |          |
|  | 45 Sinh viên | 3 Bài thi       |   | 50 Sinh viên | 2 Bài thi       |          |
|  | [Truy cập vào lớp học]         |   | [Truy cập vào lớp học]         |          |
|  +--------------------------------+   +--------------------------------+          |
+-----------------------------------------------------------------------------------+
```

### 4.2. Xem Bảng tin và Thông báo từ Giảng viên
- Nhấp chọn lớp học phần cần xem.
- Tại tab **Bảng tin (Stream)**:
  - Xem các thông báo nhắc nhở lịch học, dặn dò nội dung ôn tập trước kỳ thi.
  - Bình luận đặt câu hỏi thảo luận với giảng viên và các bạn cùng lớp.

### 4.3. Tải về Giáo trình và Tài liệu bài giảng
- Chuyển sang tab **Tài liệu (Materials)**:
  - Danh sách các tệp tài liệu do Giảng viên chia sẻ được sắp xếp theo từng chương bài học.
  - Nhấn vào biểu tượng **Tải về (Download)** bên cạnh tài liệu (PDF, Slide PowerPoint, Word) để tải về máy tính phục vụ học tập.

---

## 5. QUY TRÌNH THAM GIA THI TRẮC NGHIỆM TRỰC TUYẾN

- **Mã nguồn giao diện làm bài:** `client/src/features/assessments/pages/DoTestPage.tsx`
- **API điều khiển Backend:** `ExamAttemptStartService.php`, `ExamAttemptAnswerController.php`, `ExamAttemptController.php`

### 5.1. Chuẩn bị trước giờ thi
Để buổi thi diễn ra thuận lợi, sinh viên cần chuẩn bị:
1. **Thiết bị:** Nên sử dụng Máy tính để bàn (PC) hoặc Laptop có bàn phím và chuột thao tác thuận tiện. Không khuyến nghị làm bài trên điện thoại di động màn hình nhỏ.
2. **Trình duyệt Web:** Sử dụng **Google Chrome** hoặc **Microsoft Edge** phiên bản mới nhất.
3. **Kết nối Mạng:** Đảm bảo đường truyền Wi-Fi hoặc mạng dây ổn định, không tải video hoặc chơi game trong khi thi.
4. **Tắt ứng dụng gây xao nhãng:** Đóng toàn bộ các tab trình duyệt khác, tắt ứng dụng chat (Zalo, Messenger, Discord, Telegram) để tránh bị nhảy thông báo gây mất tập trung hoặc bị tính là rời phòng thi.

### 5.2. Vào phòng thi và Bắt đầu làm bài
1. Truy cập vào lớp học phần -> Chọn tab **Bài kiểm tra / Đề thi**.
2. Tìm bài thi đến giờ làm (bài thi có trạng thái *Đang diễn ra*).
3. Nhấn nút **Bắt đầu làm bài**.
4. Màn hình xác nhận hiển thị tóm tắt thông tin:
   - **Tên đề thi:** Ví dụ *Kiểm tra Giữa kỳ - Lập trình Web*.
   - **Thời gian làm bài:** Ví dụ *45 phút*.
   - **Số lượng câu hỏi:** Ví dụ *40 câu*.
   - **Quy chế thi:** Lưu ý về việc chuyển tab và quy định thời gian.
5. Nhấn **Xác nhận vào thi** để mở giao diện làm bài chính thức.

---

### 5.3. Hướng dẫn sử dụng Giao diện Phòng thi (`DoTestPage`)

```
+---------------------------------------------------------------------------------------------+
| BÀI THI: GIỮA KỲ LẬP TRÌNH WEB (40 CÂU)               [ĐỒNG HỒ CÒN LẠI: 41:25]  [NỘP BÀI]   |
+-------------------------------------------------------+-------------------------------------+
| CÂU HỎI SỐ 12/40:                                     | BẢNG ĐIỀU HƯỚNG CÂU HỎI             |
|                                                       |                                     |
| Trong kiến trúc Laravel MVC, thành phần nào chịu      | [01] [02] [03] [04] [05] [06] [07]  |
| trách nhiệm tiếp nhận HTTP Request từ Route và tương  | [08] [09] [10] [11] <12> [13] [14]  |
| tác với Model để lấy dữ liệu?                         | [15] [16] [17] [18] [19] [20] [21]  |
|                                                       | [22] [23] [24] [25] [26] [27] [28]  |
| ( ) A. View Template (Blade)                          | [29] [30] [31] [32] [33] [34] [35]  |
| (*) B. Controller                                     | [36] [37] [38] [39] [40]            |
| ( ) C. Migration                                      |                                     |
| ( ) D. Middleware                                     | Chú giải:                           |
|                                                       | [ ] Xám: Chưa làm (15 câu)          |
| [ ] Đánh dấu xem lại (Bookmark)                       | [ ] Xanh: Đã chọn (25 câu)          |
|                                                       | [>] Viền vàng: Đang làm (<12>)      |
| [< Câu trước]                          [Câu sau >]    | [!] Cờ đỏ: Đánh dấu phân vân        |
+-------------------------------------------------------+-------------------------------------+
```

Các thành phần giao diện trọng tâm:
1. **Đồng hồ đếm ngược (Countdown Timer):**
   - Đặt nổi bật tại góc trên màn hình, đếm lùi thời gian từng giây.
   - Thời gian này được **đồng bộ tuyệt đối với máy chủ (Server Deadline)**, bạn chỉnh đồng hồ máy tính cũng không thay đổi được thời gian của hệ thống.
   - Khi thời gian còn dưới 5 phút, đồng hồ sẽ chuyển sang màu đỏ nhấp nháy để nhắc nhở.
2. **Khu vực hiển thị Câu hỏi:**
   - Hiển thị thứ tự câu hỏi và nội dung văn bản rõ ràng.
   - Hỗ trợ công thức Toán học KaTeX sắc nét (ví dụ: căn bậc hai, phân số, tích phân...).
   - Hiển thị hình ảnh minh họa nếu câu hỏi có đính kèm.
3. **Lựa chọn phương án trả lời:**
   - Nhấp chuột vào nút tròn hoặc nhấp trực tiếp vào dòng chữ của đáp án A, B, C hoặc D.
   - Bạn có thể đổi lựa chọn đáp án bất cứ lúc nào trước khi nộp bài.
4. **Nút Đánh dấu xem lại (Bookmark / Flag):**
   - Nếu gặp câu hỏi khó, phân vân giữa 2 đáp án, bạn hãy tích chọn **Đánh dấu xem lại**. Ô số câu hỏi trên bảng điều hướng sẽ hiển thị biểu tượng cờ đỏ nhỏ để bạn dễ dàng tìm lại sau khi đã làm xong các câu khác.
5. **Bảng điều hướng danh sách câu hỏi (Question Navigation Palette):**
   - Đặt ở cột bên phải, hiển thị trực quan toàn bộ các câu hỏi trong đề:
     * **Màu xám:** Câu chưa làm.
     * **Màu xanh dương:** Câu đã chọn xong đáp án.
     * **Viền vàng:** Câu hỏi hiện tại đang hiển thị trên màn hình.
     * **Cờ đỏ:** Câu bạn đã đánh dấu xem lại.
   - Nhấp vào bất kỳ ô số nào để nhảy ngay đến câu hỏi đó mà không cần nhấn "Câu sau" nhiều lần.

---

### 5.4. Cơ chế Tự động lưu đáp án ngầm (Auto-Save)
> [!IMPORTANT]
> **Bạn không cần tìm nút "Lưu đáp án"!**  
> Mỗi khi bạn nhấp chọn một đáp án A, B, C hay D, hệ thống VinaClass sẽ lập tức kích hoạt một lệnh gửi ngầm (Background HTTP Post) lên máy chủ thông qua `ExamAttemptAnswerController.php` để lưu trực tiếp đáp án vào cơ sở dữ liệu.
> 
> **Ý nghĩa thực tế:** Nếu máy tính của bạn bị sập nguồn, mất điện, hoặc kết nối mạng bị gián đoạn đột ngột:
> 1. Toàn bộ các đáp án bạn đã bấm chọn từ trước thời điểm đó đều được **bảo toàn 100% trên máy chủ**.
> 2. Hãy bật lại máy tính, đăng nhập lại hệ thống và nhấn **Tiếp tục làm bài**, bạn sẽ tiếp tục từ câu hỏi đang dang dở mà không hề bị mất dữ liệu.

---

### 5.5. Quy định Chống gian lận & Cảnh báo Chuyển màn hình thi (Tab Blur)
Để bảo đảm tính công bằng tuyệt đối cho mọi sinh viên trong kỳ thi, hệ thống VinaClass tích hợp cơ chế giám sát chuyển màn hình:
- **Hành vi bị hệ thống phát hiện:**
  - Nhấn mở tab mới trên trình duyệt.
  - Chuyển sang tab khác đang mở sẵn.
  - Thu nhỏ cửa sổ trình duyệt hoặc nhấn phím tắt `Alt + Tab` / `Command + Tab` để mở ứng dụng khác (Word, Zalo, Google...).
  - Nhấp chuột ra ngoài phạm vi cửa sổ làm bài.
- **Xử lý vi phạm:**
  1. Ngay khi bạn rời khỏi màn hình thi, một hộp thoại cảnh báo màu đỏ sẽ bật lên:  
     *"CẢNH BÁO: BẠN ĐÃ RỜI KHỎI PHÒNG THI! Hành vi này đã được ghi nhận vào nhật ký khảo thí và báo cáo cho Giảng viên."*
  2. Hệ thống tự động ghi nhận 1 lượt vi phạm mã lỗi `TAB_BLUR` kèm mốc thời gian chính xác (giờ:phút:giây) vào bảng `exam_attempt_logs`.
  3. Giảng viên có quyền trừ điểm hoặc hủy bỏ kết quả thi nếu phát hiện số lần vi phạm bất thường (từ 3 lần trở lên).

---

### 5.6. Nộp bài thi chủ động & Tự động thu bài khi hết giờ

#### A. Nộp bài thi chủ động:
1. Khi đã làm xong toàn bộ câu hỏi và kiểm tra kỹ lưỡng, nhấn nút **Nộp bài** ở góc trên bên phải.
2. Hộp thoại xác nhận nộp bài hiển thị:
   - *"Bạn đã hoàn thành: 40/40 câu hỏi."* (hoặc cảnh báo: *"Chú ý: Bạn còn 3 câu hỏi chưa chọn đáp án!"*).
3. Nếu chắc chắn muốn nộp, nhấn nút **Xác nhận nộp bài**.
4. Hệ thống khóa bài làm, tính điểm tự động và đóng phiên thi.

#### B. Cơ chế Tự động thu bài khi hết giờ (Auto-Submit):
- Khi đồng hồ đếm ngược về đúng `00:00`:
  - Trình duyệt sẽ tự động vô hiệu hóa toàn bộ các ô chọn đáp án.
  - Một thông báo xuất hiện: *"Đã hết thời gian làm bài thi! Hệ thống đang tự động thu bài của bạn..."*
  - Toàn bộ các đáp án bạn đã chọn được tự động gửi lên máy chủ và hoàn tất lượt nộp bài. Bạn hoàn toàn không cần lo lắng bị mất bài nếu hết giờ mà chưa kịp bấm nút nộp.

---

## 6. XEM KẾT QUẢ THI & LỜI GIẢI THÍCH CHI TIẾT

- **Mã nguồn:** `client/src/features/assessments/pages/ResultDoTestPage.tsx`
- **Đường dẫn:** `/tests/:id/take/result/:attemptId`

Ngay sau khi nộp bài thành công:
1. **Xem điểm số:**
   - Nếu Giảng viên cài đặt chế độ công bố điểm ngay, màn hình sẽ hiển thị:
     * **Điểm số đạt được:** (thang điểm 10, ví dụ: `8.50 / 10.00`).
     * **Số câu đúng:** Ví dụ `34/40 câu`.
     * **Số câu sai:** `5 câu`.
     * **Số câu chưa làm:** `1 câu`.
     * **Tổng thời gian làm bài thực tế:** Ví dụ `32 phút 15 giây`.
2. **Xem lại bài làm & Lời giải thích:**
   - Nếu Giảng viên cho phép xem lại bài:
     * Bạn có thể cuộn xuống xem lại từng câu hỏi.
     * Đáp án bạn chọn được đánh dấu.
     * Đáp án đúng hiển thị màu xanh lá cây kèm dấu tích `✔`.
     * Lời giải thích chi tiết của Giảng viên hiển thị bên dưới mỗi câu để bạn rút kinh nghiệm ôn tập.

---

## 7. BẢNG CÂU HỎI THƯỜNG GẶP (FAQ) & XỬ LÝ SỰ CỐ KHI LÀM BÀI

| Câu hỏi / Sự cố | Nguyên nhân & Hướng dẫn xử lý |
| :--- | :--- |
| **Em không thấy bài thi hiển thị trong lớp học?** | 1. Kiểm tra bạn đã vào đúng lớp học phần hay chưa.<br>2. Kiểm tra giờ mở đề thi. Nếu chưa đến giờ mở, đề thi sẽ chưa xuất hiện. |
| **Đang làm bài thì bị mất mạng Internet hoặc mất điện?** | Bình tĩnh cắm lại sạc, kết nối lại mạng (hoặc phát 4G từ điện thoại cho máy tính). Mở lại trình duyệt, đăng nhập vào VinaClass và bấm **Tiếp tục làm bài**. Các câu đã chọn trước đó vẫn còn nguyên vẹn. |
| **Đồng hồ đếm ngược trên máy em có bị chạy nhanh hơn không?** | Không. Hệ thống tính thời gian kết thúc dựa trên đồng hồ của máy chủ trung tâm (Server Time) nên đảm bảo chính xác tuyệt đối và đồng nhất cho mọi sinh viên. |
| **Em vô tình bấm vào thông báo Zalo có bị tính là vi phạm không?** | Có, hệ thống sẽ ghi nhận 1 lần rời màn hình (`TAB_BLUR`). Hãy tắt ngay toàn bộ thông báo ứng dụng trước khi bấm Bắt đầu làm bài thi. |
| **Em nộp bài rồi nhưng không thấy điểm hiện lên?** | Giảng viên đang cấu hình chế độ ẩn điểm để chấm phúc khảo hoặc chờ các ca thi khác thi xong mới công bố. Hãy liên hệ Giảng viên sau khi kết thúc buổi thi. |

---
*Tài liệu được biên soạn và chuẩn hóa bởi Nhóm 18 - Dự án Khảo thí Trực tuyến VinaClass.*

