# TÀI LIỆU ĐẶC TẢ SƠ ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS)
## HỆ THỐNG QUẢN LÝ THI TRẮC NGHIỆM TRỰC TUYẾN VINACLASS

---

> **Dự án:** Hệ thống Khảo thí và Quản lý Thi trắc nghiệm Trực tuyến VinaClass  
> **Phiên bản tài liệu:** v2.4.0 (Đồng bộ theo mã nguồn thực tế Laravel 10 + React 18)  
> **Ngày phát hành:** 30/10/2026  
> **Thực hiện:** Nhóm 18 - Quản lý Dự án Công nghệ Thông tin  
> **Tài liệu liên quan cùng bộ:**
> - [Tài liệu Đặc tả Use Case Toàn diện](file:///Users/macbook/Desktop/projects-src/vinaclass/docs/SODO_USECASE.md)
> - [Tài liệu Đặc tả Sơ đồ Hoạt động (Activity Diagrams)](file:///Users/macbook/Desktop/projects-src/vinaclass/docs/SODO_ACTIVITY.md)
> - [Sổ tay Phân tích Nghiệp vụ & Đối chiếu Toàn bộ Mã nguồn](file:///Users/macbook/Desktop/projects-src/vinaclass/outputs/Phan_Tich_Nghiep_Vu_He_Thong_Thi_Trac_Nghiem_VinaClass.md)

---

## MỤC LỤC SƠ ĐỒ TUẦN TỰ

1. [Kiến trúc Tương tác Đa tầng (Clean Service-Oriented Architecture)](#kiến-trúc-tương-tác-đa-tầng-clean-service-oriented-architecture)
2. [SD-01: Xác thực OTP Đăng ký tài khoản Sinh viên](#41-sd-01-xác-thực-otp-đăng-ký-tài-khoản-sinh-viên)
3. [SD-02: Đăng nhập xác thực JWT & Khởi tạo phiên làm việc](#42-sd-02-đăng-nhập-xác-thực-jwt--khởi-tạo-phiên-làm-việc)
4. [SD-03: Cập nhật ma trận phân quyền động RBAC v2](#43-sd-03-cập-nhật-ma-trận-phân-quyền-động-rbac-v2)
5. [SD-04: Import danh sách sinh viên vào lớp học phần từ tệp Excel](#44-sd-04-import-danh-sách-sinh-viên-vào-lớp-học-phần-từ-tệp-excel)
6. [SD-05: Soạn thảo và lưu câu hỏi trắc nghiệm KaTeX](#45-sd-05-soạn-thảo-và-lưu-câu-hỏi-trắc-nghiệm-katex)
7. [SD-06: Sinh đề thi tự động theo bộ lọc ma trận kiến thức](#46-sd-06-sinh-đề-thi-tự-động-theo-bộ-lọc-ma-trận-kiến-thức)
8. [SD-07: Bắt đầu làm bài thi với khóa bi quan chống gian lận đa luồng (`lockForUpdate`)](#47-sd-07-bắt-đầu-làm-bài-thi-với-khóa-bi-quan-chống-gian-lận-đa-luồng)
9. [SD-08: Live Auto-save tự động lưu bài thi ngầm (Debounce 500ms)](#48-sd-08-live-auto-save-tự-động-lưu-bài-thi-ngầm-debounce-500ms)
10. [SD-09: Giám sát vi phạm rời màn hình (Tab Blur) & Cưỡng chế nộp bài](#49-sd-09-giám-sát-vi-phạm-rời-màn-hình-tab-blur--cưỡng-chế-nộp-bài)
11. [SD-10: Nộp bài, Chấm điểm tức thì & Xem kết quả phân tích](#410-sd-10-nộp-bài-chấm-điểm-tức-thì--xem-kết-quả-phân-tích)
12. [Bảng Phân tích Giao thức & Mã trạng thái HTTP (API Protocols)](#bảng-phân-tích-giao-thức--mã-trạng-thái-http-api-protocols)

---

## KIẾN TRÚC TƯƠNG TÁC ĐA TẦNG (CLEAN SERVICE-ORIENTED ARCHITECTURE)

Mọi sơ đồ tuần tự (Sequence Diagram) trong hệ thống VinaClass thể hiện sự phối hợp tuần tự giữa 5 tầng kiến trúc phần mềm:
1. **Client Tier (React 18 SPA):** Tiếp nhận tương tác người dùng, quản lý state cục bộ (Zustand/React Query), bắt sự kiện DOM và gửi HTTP Request.
2. **Routing & Middleware Tier (Laravel HTTP):** Xác thực mã thông báo `auth:api`, kiểm tra phiên `auth.session`, kiểm tra trạng thái kích hoạt tài khoản `account.active`, và kiểm tra quyền nguyên tử `permission:{module}:{action}`.
3. **Controller Tier (Laravel Controllers):** Tiếp nhận dữ liệu, validate schema thông qua FormRequest, điều phối và gọi Service xử lý.
4. **Service Tier (Domain Business Logic):** Nơi thực thi logic nghiệp vụ, quản lý giao dịch CSDL `DB::beginTransaction()`, khóa dòng bi quan `lockForUpdate()`, tính toán thuật toán và gửi mail/ghi log.
5. **Persistence Tier (MySQL Database & Eloquent Models):** Lưu trữ dữ liệu quan hệ, đảm bảo toàn vẹn khóa ngoại (Foreign Keys) và ACID transactions.

---

# PHẦN 4: SƠ ĐỒ TUẦN TỰ KỸ THUẬT (SEQUENCE DIAGRAMS)

## 4.1. SD-01: Xác thực OTP Đăng ký tài khoản Sinh viên

```mermaid
sequenceDiagram
    autonumber
    actor SinhVien as Sinh viên
    participant UI as RegisterPage (React)
    participant AuthCtrl as AuthController
    participant OtpSvc as AuthOtpService
    participant RegSvc as StudentRegistrationService
    participant Mailer as SMTP Mailer
    participant DB as MySQL Database

    SinhVien->>UI: Nhập Email, MSSV, Họ tên, Mật khẩu
    SinhVien->>UI: Bấm "Gửi mã xác thực"
    UI->>AuthCtrl: POST /api/auth/otp/register { email }
    AuthCtrl->>OtpSvc: requestRegistrationCode(email)
    OtpSvc->>DB: Kiểm tra User::where('email', email)->exists()
    DB-->>OtpSvc: Không tồn tại (Hợp lệ)
    OtpSvc->>OtpSvc: Sinh OTP ngẫu nhiên 6 số, Hash SHA-256
    OtpSvc->>DB: INSERT INTO auth_otps (email, code_hash, expires_at)
    OtpSvc->>Mailer: Gửi email OTP tới sinh viên
    OtpSvc-->>AuthCtrl: Trả về { public_id, expires_in: 300, resend_after: 60 }
    AuthCtrl-->>UI: HTTP 200 { public_id, resend_after: 60 }
    UI-->>SinhVien: Hiển thị đồng hồ đếm ngược 60s & Ô nhập OTP

    SinhVien->>UI: Nhập mã OTP 6 số & Bấm "Đăng ký"
    UI->>AuthCtrl: POST /api/register { public_id, otp_code, student_data }
    AuthCtrl->>RegSvc: registerStudent(data)
    RegSvc->>OtpSvc: verifyRegistrationCode(public_id, otp_code)
    OtpSvc->>DB: SELECT * FROM auth_otps WHERE public_id = ?
    DB-->>OtpSvc: Bản ghi OTP
    OtpSvc->>OtpSvc: Hash::check(otp_code, code_hash) & Check TTL
    OtpSvc-->>RegSvc: Xác thực thành công
    RegSvc->>DB: DB::transaction -> INSERT INTO users, identity_profiles
    RegSvc->>DB: UPDATE auth_otps SET is_used = 1
    RegSvc-->>AuthCtrl: Trả về User mới
    AuthCtrl->>AuthCtrl: Tạo JWT Access Token & Session
    AuthCtrl-->>UI: HTTP 201 { token, user }
    UI-->>SinhVien: Đăng ký thành công & Chuyển hướng Dashboard
```

---

## 4.2. SD-02: Đăng nhập xác thực JWT & Khởi tạo phiên làm việc

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as LoginPage (React)
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant SessSvc as AuthSessionService
    participant DB as MySQL Database

    User->>UI: Nhập Email & Mật khẩu -> Bấm "Đăng nhập"
    UI->>AuthCtrl: POST /api/login { email, password }
    AuthCtrl->>AuthSvc: authenticate(email, password, ip, userAgent)
    AuthSvc->>DB: SELECT * FROM users WHERE email = ?
    DB-->>AuthSvc: User model
    AuthSvc->>AuthSvc: Hash::check(password, user->password)
    AuthSvc->>AuthSvc: Kiểm tra !user->is_locked && !user->is_deleted
    AuthSvc->>SessSvc: createSession(user, ip, userAgent)
    SessSvc->>DB: INSERT INTO auth_sessions (user_id, token, ip_address, user_agent)
    DB-->>SessSvc: Session record
    AuthSvc->>AuthSvc: Sinh Access Token (JWT) & Refresh Token
    AuthSvc->>DB: Lấy Permissions theo Role qua RBAC v2
    DB-->>AuthSvc: Danh sách quyền hạn
    AuthSvc-->>AuthCtrl: { user, token, permissions, menu }
    AuthCtrl-->>UI: HTTP 200 { access_token, user, permissions }
    UI->>UI: Lưu Token vào memory, cấu hình Axios Interceptors
    UI-->>User: Đăng nhập thành công -> Điều hướng theo vai trò
```

---

## 4.3. SD-03: Cập nhật ma trận phân quyền động RBAC v2

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên
    participant UI as PermissionMatrixV2Page (React)
    participant PermCtrl as PermissionAdministrationController
    participant SyncSvc as RolePermissionSyncService
    participant RuleSvc as PermissionAdministrationRules
    participant Cache as Redis Cache
    participant DB as MySQL Database

    Admin->>UI: Bật/Tắt checkbox quyền trên ma trận -> Bấm "Lưu Ma trận"
    UI->>PermCtrl: PUT /api/roles/{roleId}/permissions { permission_ids: [1, 5, 8...] }
    PermCtrl->>SyncSvc: sync(role, permissionIds, currentAdmin)
    SyncSvc->>DB: DB::transaction -> User::lockForUpdate(adminId)
    SyncSvc->>DB: Role::lockForUpdate(roleId)
    SyncSvc->>RuleSvc: assertNotAdministratorRole(role)
    RuleSvc-->>SyncSvc: Hợp lệ (Không phải sửa role ADMIN)
    SyncSvc->>RuleSvc: assertActivePermissionIds(permissionIds)
    SyncSvc->>DB: role->permissions()->sync(permissionIds)
    SyncSvc->>DB: Đồng bộ sang role_details (tương thích ngược)
    SyncSvc->>Cache: Xóa cache quyền: Redis::del("role_permissions_{roleId}")
    SyncSvc-->>PermCtrl: Role model đã đồng bộ quyền mới
    PermCtrl-->>UI: HTTP 200 { message: "Cập nhật quyền thành công", role }
    UI-->>Admin: Hiển thị Toast thông báo thành công
```

---

## 4.4. SD-04: Import danh sách sinh viên vào lớp học phần từ tệp Excel

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Giảng viên
    participant UI as StudentRosterImportForm (React)
    participant GroupCtrl as CourseGroupController
    participant RosterSvc as CourseGroupRosterService
    participant ExcelPkg as Maatwebsite/Excel
    participant DB as MySQL Database

    Teacher->>UI: Chọn tệp Excel (.xlsx) -> Bấm "Tải lên & Import"
    UI->>GroupCtrl: POST /api/course-groups/{groupId}/students/import (multipart/form-data)
    GroupCtrl->>RosterSvc: importStudentsFromFile(courseGroup, uploadedFile, teacher)
    RosterSvc->>ExcelPkg: Excel::toArray(file)
    ExcelPkg-->>RosterSvc: Mảng dữ liệu các dòng sheet 1
    RosterSvc->>RosterSvc: Validate cấu trúc tiêu đề (MSSV, Họ tên, Email)
    loop Từng dòng sinh viên
        RosterSvc->>DB: Tìm User theo MSSV / Email
        alt Chưa có tài khoản
            RosterSvc->>DB: Tạo User mới (vai trò STUDENT, pass mặc định)
        end
        RosterSvc->>DB: Kiểm tra trong chi_tiet_nhoms
        alt Chưa thuộc lớp
            RosterSvc->>DB: INSERT INTO chi_tiet_nhoms (nhom_hoc_phan_id, user_id)
        end
    end
    RosterSvc-->>GroupCtrl: Kết quả { total, imported, skipped, errors }
    GroupCtrl-->>UI: HTTP 200 { summary: { total: 45, imported: 42, skipped: 3 } }
    UI-->>Teacher: Hiển thị Modal tóm tắt kết quả import thành công
```

---

## 4.5. SD-05: Soạn thảo và lưu câu hỏi trắc nghiệm KaTeX

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Giảng viên
    participant UI as QuestionEditorForm (React)
    participant QCtrl as QuestionController
    participant QSvc as QuestionService
    participant SyncSvc as QuestionAnswerSynchronizer
    participant DB as MySQL Database

    Teacher->>UI: Nhập nội dung câu hỏi KaTeX $\sqrt{x}$, nhập 4 đáp án, chọn 1 đáp án đúng
    Teacher->>UI: Bấm "Lưu câu hỏi"
    UI->>QCtrl: POST /api/questions { question_data, answers: [A, B, C, D] }
    QCtrl->>QSvc: add(questionData, answers, currentTeacher)
    QSvc->>DB: DB::transaction
    QSvc->>DB: INSERT INTO cau_hois (noi_dung, mon_hoc_id, chuong_id, do_kho_id, creator_id)
    DB-->>QSvc: Question ID
    QSvc->>SyncSvc: syncAnswers(questionId, answers)
    SyncSvc->>SyncSvc: Validate: Đúng 4 phương án & duy nhất 1 đáp án correct
    loop 4 phương án
        SyncSvc->>DB: INSERT INTO cau_tra_lois (cau_hoi_id, noi_dung, is_correct)
    end
    QSvc-->>QCtrl: Question model đầy đủ kèm answers
    QCtrl-->>UI: HTTP 201 { data: Question }
    UI-->>Teacher: Thông báo lưu thành công & Cập nhật danh sách câu hỏi
```

---

## 4.6. SD-06: Sinh đề thi tự động theo bộ lọc ma trận kiến thức

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Giảng viên
    participant UI as TestFormPage (React)
    participant ExamCtrl as ExamController
    participant CreateSvc as ExamCreationService
    participant SelectSvc as ExamQuestionSelectionService
    participant DB as MySQL Database

    Teacher->>UI: Chọn Môn, cấu hình ma trận Chương x Độ khó, thời gian, gán lớp -> Bấm "Sinh đề"
    UI->>ExamCtrl: POST /api/exams/generate-exams-by-filter { filter_data }
    ExamCtrl->>CreateSvc: generateByFilter(filterData, teacher)
    CreateSvc->>SelectSvc: selectByFilters(subjectId, chapterIds, difficultyFilters, teacher)
    SelectSvc->>DB: Khóa bảng độ khó: Difficulty::lockForUpdate()
    loop Từng ô ma trận
        SelectSvc->>DB: SELECT * FROM cau_hois WHERE subject_id = ? AND difficulty_id = ? ORDER BY RAND() LIMIT N lockForUpdate
        DB-->>SelectSvc: Danh sách câu hỏi ngẫu nhiên
        SelectSvc->>SelectSvc: Kiểm tra đủ số lượng N câu yêu cầu
    end
    SelectSvc-->>CreateSvc: Tập hợp Question IDs đã chọn
    CreateSvc->>DB: DB::transaction
    CreateSvc->>DB: INSERT INTO de_this (ten_de, mon_hoc_id, creator_id)
    CreateSvc->>DB: INSERT INTO cau_hinh_this (thoi_gian_lam_bai, is_limit_switch_tab...)
    CreateSvc->>DB: INSERT INTO chi_tiet_de_this (de_thi_id, cau_hoi_id)
    CreateSvc->>DB: INSERT INTO giao_bai_this (de_thi_id, nhom_hoc_phan_id)
    CreateSvc-->>ExamCtrl: Exam model hoàn chỉnh
    ExamCtrl-->>UI: HTTP 201 { exam_id, message: "Sinh đề thi thành công" }
    UI-->>Teacher: Chuyển hướng tới danh sách đề thi đã hoàn tất
```

---

## 4.7. SD-07: Bắt đầu làm bài thi với khóa bi quan chống gian lận đa luồng

```mermaid
sequenceDiagram
    autonumber
    actor Student as Thí sinh
    participant UI as ExamInstruction / DoTestPage (React)
    participant AttemptCtrl as ExamAttemptController
    participant StartSvc as ExamAttemptStartService
    participant TimingSvc as ExamAttemptTimingService
    participant DB as MySQL Database

    Student->>UI: Xem quy chế -> Nhập mật khẩu (nếu có) -> Bấm "Bắt đầu làm bài"
    UI->>AttemptCtrl: POST /api/exam-attempts/start-test { student_id, exam_id, password }
    AttemptCtrl->>StartSvc: startTest(data, currentStudent)
    StartSvc->>DB: DB::transaction
    StartSvc->>DB: User::lockForUpdate(studentId)
    StartSvc->>DB: Exam::lockForUpdate(examId)
    StartSvc->>StartSvc: Kiểm tra điều kiện dự thi & giờ mở đề
    StartSvc->>DB: Kiểm tra ExamAttempt hiện tại của sinh viên
    alt Đã có bài thi SUBMITTED
        StartSvc-->>AttemptCtrl: Ném ngoại lệ HTTP 422: Bạn đã nộp bài thi này
    else Đang IN_PROGRESS (Khôi phục bài làm cũ)
        StartSvc->>TimingSvc: Tính thời gian còn lại theo deadline_at
        StartSvc-->>AttemptCtrl: Trả về bài làm cũ kèm thời gian còn lại
    else Bắt đầu mới hoàn toàn
        StartSvc->>TimingSvc: calculateDeadline(duration, exam_end_time)
        TimingSvc-->>StartSvc: deadline_at chính xác của server
        StartSvc->>StartSvc: Fisher-Yates xáo trộn câu hỏi & phương án
        StartSvc->>DB: INSERT INTO bai_lams (de_thi_id, user_id, start_time, deadline_at, status='IN_PROGRESS')
        StartSvc->>DB: INSERT INTO log_bai_lams (attempt_id, event_type='START_EXAM')
        StartSvc-->>AttemptCtrl: { attempt, shuffled_questions, deadline_at }
    end
    AttemptCtrl-->>UI: HTTP 200 { attempt_id, questions, deadline_at }
    UI->>UI: Bật chế độ Fullscreen, khởi động bộ đếm countdown theo deadline_at
    UI-->>Student: Hiển thị giao diện làm bài ExamDoing.tsx
```

---

## 4.8. SD-08: Live Auto-save tự động lưu bài thi ngầm (Debounce 500ms)

```mermaid
sequenceDiagram
    autonumber
    actor Student as Thí sinh
    participant UI as ExamDoing (React)
    participant AttemptCtrl as ExamAttemptController
    participant SubSvc as ExamAttemptSubmissionService
    participant AnsProc as ExamAttemptAnswerProcessor
    participant DB as MySQL Database

    Student->>UI: Click chọn đáp án B cho câu hỏi số 15
    UI->>UI: Cập nhật giao diện ngay lập tức (đổi màu nút sang xanh)
    UI->>UI: Kích hoạt hook useAutoSave (Debounce 500ms)
    Note over UI: Thí sinh click tiếp câu 16 trong vòng 500ms -> Reset timer debounce
    Note over UI: Hết 500ms không có thao tác click mới -> Kích hoạt gửi request ngầm
    UI->>AttemptCtrl: PUT /api/exam-attempts/update-student-test/{attemptId} { question_id: 15, answer_id: 42 }
    AttemptCtrl->>SubSvc: updateStudentTest(data, examAttempt, currentStudent)
    SubSvc->>DB: DB::transaction -> ExamAttempt::lockForUpdate(attemptId)
    SubSvc->>SubSvc: assertOwnAttempt & assertBeforeDeadline(deadline_at)
    SubSvc->>AnsProc: processSingleAnswer(attempt, questionId, answerId)
    AnsProc->>DB: UPSERT INTO chi_tiet_bai_lams (bai_lam_id, cau_hoi_id, cau_tra_loi_id)
    SubSvc-->>AttemptCtrl: Lưu thành công
    AttemptCtrl-->>UI: HTTP 200 { status: "saved" }
    UI->>UI: Hiển thị icon mây xanh "Đã lưu lúc 10:24:15"
```

---

## 4.9. SD-09: Giám sát vi phạm rời màn hình (Tab Blur) & Cưỡng chế nộp bài

```mermaid
sequenceDiagram
    autonumber
    actor Student as Thí sinh
    participant UI as ExamDoing / ExamViolationModal (React)
    participant LogCtrl as ExamAttemptLogController
    participant LogSvc as ExamAttemptLogService
    participant AttemptSvc as ExamAttemptService
    participant DB as MySQL Database

    Student->>UI: Rời tab làm bài / Thu nhỏ cửa sổ browser
    UI->>UI: Lắng nghe sự kiện document.visibilitychange / window.blur
    UI->>UI: Phát hiện document.hidden === true
    UI->>LogCtrl: PUT /api/exam-attempt-logs/{attemptId} { event_type: "TAB_BLUR" }
    LogCtrl->>DB: DB::transaction
    LogCtrl->>DB: User::lockForUpdate() & ExamAttempt::lockForUpdate()
    LogCtrl->>LogSvc: update(data, attempt, actor)
    LogSvc->>DB: INSERT INTO log_bai_lams (attempt_id, event_type='TAB_BLUR')
    LogSvc->>DB: SELECT COUNT(*) FROM log_bai_lams WHERE attempt_id = ? AND event_type = 'TAB_BLUR'
    DB-->>LogSvc: count = 3
    LogCtrl->>DB: Kiểm tra cấu hình thi: limit_switch_tab = true, tab_switch_limit = 3
    alt Số lần vi phạm < tab_switch_limit
        LogCtrl-->>UI: HTTP 200 { tab_switch_count: 2 }
        UI-->>Student: Hiển thị ExamViolationModal cảnh báo vi phạm lần 2/3
    else Số lần vi phạm >= tab_switch_limit (Đạt ngưỡng vi phạm)
        LogCtrl->>AttemptSvc: submitAfterTabSwitchLimit(attemptId, actor)
        AttemptSvc->>DB: UPDATE bai_lams SET status = 'SUBMITTED', submission_reason = 'TAB_SWITCH_LIMIT'
        AttemptSvc->>AttemptSvc: Tự động chấm điểm các câu đã làm
        LogCtrl-->>UI: HTTP 200 { tab_switch_count: 3, forced_submit: true }
        UI->>UI: Khóa toàn bộ form thi & Hủy timer countdown
        UI-->>Student: Thông báo bài thi bị đình chỉ & cưỡng chế nộp do vi phạm đổi tab
    end
```

---

## 4.10. SD-10: Nộp bài, Chấm điểm tức thì & Xem kết quả phân tích

```mermaid
sequenceDiagram
    autonumber
    actor Student as Thí sinh
    participant UI as ExamDoing / ExamResultModal (React)
    participant AttemptCtrl as ExamAttemptController
    participant SubSvc as ExamAttemptSubmissionService
    participant ReviewSvc as ExamAttemptReviewService
    participant DB as MySQL Database

    Student->>UI: Bấm "Nộp bài thi" -> Xác nhận trên Dialog nộp bài
    UI->>AttemptCtrl: PUT /api/exam-attempts/submit-test/{attemptId}
    AttemptCtrl->>SubSvc: submitTest(data, attemptId, currentStudent)
    SubSvc->>DB: DB::transaction -> ExamAttempt::lockForUpdate(attemptId)
    SubSvc->>SubSvc: Kiểm tra status === 'IN_PROGRESS'
    SubSvc->>DB: Lấy toàn bộ đáp án thí sinh đã chọn trong chi_tiet_bai_lams
    SubSvc->>DB: Lấy danh sách đáp án đúng từ cau_tra_lois WHERE is_correct = 1
    SubSvc->>SubSvc: So khớp từng câu, tính tổng câu đúng / tổng số câu
    SubSvc->>SubSvc: Quy đổi sang thang điểm 10 (ví dụ: 36/40 câu = 9.0 điểm)
    SubSvc->>DB: UPDATE bai_lams SET score = 9.0, status = 'SUBMITTED', finish_time = NOW()
    SubSvc->>DB: INSERT INTO log_bai_lams (attempt_id, event_type = 'SUBMIT_MANUAL')
    SubSvc-->>AttemptCtrl: Kết quả bài làm đã chấm điểm
    AttemptCtrl->>ReviewSvc: getReviewResult(attemptId, currentStudent)
    ReviewSvc->>DB: Kiểm tra cấu hình có cho phép xem lại đáp án hay không
    ReviewSvc-->>AttemptCtrl: Dữ liệu phân tích bài làm
    AttemptCtrl-->>UI: HTTP 200 { score: 9.0, correct_count: 36, total: 40, duration_spent: "42:15" }
    UI-->>Student: Hiển thị ExamResultModal chúc mừng và phân tích chi tiết phổ điểm
```

---


---

## BẢNG PHÂN TÍCH GIAO THỨC & MÃ TRẠNG THÁI HTTP (API PROTOCOLS)

| Mã SD | Tên Luồng Tuần tự | Endpoint API | HTTP Method | Mã HTTP thành công | Mã HTTP lỗi thường gặp | Cơ chế An toàn CSDL |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **SD-01** | Xác thực OTP Đăng ký | `/api/auth/otp/register`<br>`/api/register` | POST | 200, 201 | 422 (Email trùng), 400 (Sai OTP) | Transaction + SHA-256 Hash |
| **SD-02** | Đăng nhập JWT & Phiên | `/api/auth/login`<br>`/api/auth/me` | POST<br>GET | 200 | 401 (Sai MK), 403 (Bị khóa), 429 (Rate limit) | Lưu vết IP & User Agent `auth_sessions` |
| **SD-03** | Cập nhật RBAC v2 | `/api/roles/{id}/permissions` | PUT | 200 | 403 (Không có quyền MANAGE) | `DB::transaction()` đồng bộ `role_details` |
| **SD-04** | Import Roster Excel | `/api/course-groups/{id}/students/import` | POST | 200 | 422 (File sai định dạng/trùng MSSV) | Rollback toàn bộ nếu có lỗi nghiêm trọng |
| **SD-05** | Soạn câu hỏi KaTeX | `/api/questions` | POST | 201 | 422 (Thiếu đáp án đúng/sai cú pháp KaTeX) | Transaction lưu câu hỏi + 4 đáp án |
| **SD-06** | Sinh đề thi tự động | `/api/exams/generate-matrix` | POST | 201 | 400 (Ngân hàng thiếu câu theo tỷ lệ) | Thuật toán Fisher-Yates Shuffling |
| **SD-07** | Bắt đầu thi trực tuyến | `/api/exam-attempts/start-test` | POST | 200 | 403 (Ngoài giờ thi/hết lượt thi) | `lockForUpdate()` trên User và Exam |
| **SD-08** | Live Auto-save ngầm | `/api/test-answers/save` | POST | 200 | 408 (Quá hạn deadline), 403 (Đã nộp bài) | Optimistic save + Debounce 500ms |
| **SD-09** | Bắt vi phạm Tab Blur | `/api/exam-attempt-logs/{id}` | PUT | 200 | 400 (Dữ liệu log không hợp lệ) | Auto-submit nếu vi phạm $\ge$ limit |
| **SD-10** | Nộp bài & Chấm điểm | `/api/exam-attempts/{id}/submit` | POST | 200 | 409 (Bài thi đã được nộp trước đó) | `lockForUpdate()` + Tự động chấm điểm tức thì |

---
*Tài liệu được biên soạn và chuẩn hóa bởi Nhóm 18 - Dự án Khảo thí Trực tuyến VinaClass.*