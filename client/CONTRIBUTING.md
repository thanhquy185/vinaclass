# Contributing Guidelines

Tài liệu này quy định **cách làm việc, quy ước Git và quy trình đóng góp code** cho dự án. Mục tiêu là giúp nhóm 4 người làm việc **đồng bộ – rõ ràng – tránh xung đột**.

---

## 1. Tổng quan nhánh (Branch Strategy)

### 🔹 `main`

- Nhánh **production**
- Chỉ dùng để **release sản phẩm hoàn chỉnh**
- Được bảo vệ (protected branch)
- **Chỉ Owner được thao tác**

### 🔹 `develop`

- Nhánh **trung tâm làm việc**
- Chứa code mới nhất, ổn định
- Tất cả thay đổi đều phải thông qua **Pull Request**
- Không được commit trực tiếp

### 🔹 Các nhánh làm việc

- Tạo từ `develop`
- Mỗi nhánh **chỉ làm một chức năng hoặc một lỗi**
- Quy ước đặt tên:
  - `feature/ten-chuc-nang`
  - `fix/ten-loi`

---

## 2. Quy trình làm việc chuẩn

> ⚠️ **Lưu ý quan trọng:** Dự án bao gồm **Frontend và Backend trong cùng repository**.
>
> - Pull Request **Backend** sẽ do người phụ trách Backend review & merge
> - Pull Request **Frontend** sẽ do người phụ trách Frontend review & merge
>
> Vì vậy, **Pull Request title bắt buộc phải thể hiện rõ phạm vi FE hoặc BE**

### 2.1. Bắt đầu một chức năng mới

```bash
git checkout develop
git pull origin develop
git checkout -b feature/ten-chuc-nang
```

⛔ Không làm việc trực tiếp trên `develop`

---

### 2.2. Trong quá trình làm việc

- Xóa các console.log, commend không cần thiết trước khi commit
- Commit nhỏ, rõ ràng
- Không gộp nhiều chức năng trong một commit

Ví dụ commit message:

```
feat: add course list UI
fix: fix login validation
refactor: split course service
```

---

### 2.3. Đồng bộ với `develop` trước khi tạo Pull Request (BẮT BUỘC)

```bash
git fetch origin
git rebase origin/develop
```

- Nếu có conflict → tự resolve
- Sau khi rebase phải **test lại toàn bộ chức năng**

---

### 2.4. Push code & tạo Pull Request

```bash
git push origin feature/ten-chuc-nang
```

Khi tạo Pull Request:

- Base branch: `develop`
- Title: mô tả ngắn gọn chức năng
- Description phải có:
  - Chức năng đã làm
  - Ảnh / video demo (nếu có)

---

### 2.5. Review & Merge

- Pull Request cần:
  - Code chạy ổn định
  - Không conflict
  - Ít nhất **1 người trong nhóm review**

- Sau khi merge thành công:

```bash
git branch -d feature/ten-chuc-nang
```

---

## 3. Quy tắc Pull Request (BẮT BUỘC)

### 3.1. Quy tắc đặt Title cho Pull Request

Pull Request **bắt buộc** phải có tiền tố để phân biệt phạm vi:

```
[FE] <mô tả ngắn gọn>
[BE] <mô tả ngắn gọn>
```

Ví dụ:

```
[FE] Build course list page
[BE] Add authentication API
```

⛔ Pull Request **không đúng format title sẽ không được merge**.

---

### 3.2. Nội dung Pull Request

Không cần mô tả, chỉ cần đặt title đúng chuẩn là được

---

## 4. Quy tắc commit message

### Format

```
<type>: <message>
```

### Type được sử dụng

- `feat`: thêm chức năng mới
- `fix`: sửa lỗi
- `refactor`: chỉnh cấu trúc code, không đổi chức năng
- `chore`: việc lặt vặt (config, build, docs)

---

## 5. Quy tắc code chung

- Không commit code lỗi, code chưa chạy
- Không commit file thừa (`node_modules`, `.env`, build local)
- Tuân thủ cấu trúc thư mục đã thống nhất
- Frontend và Backend **giao tiếp qua API**, không trộn code

---

## 6. Trách nhiệm thành viên (nhóm 4 người)

- Mỗi người chịu trách nhiệm phần mình làm
- Chủ động pull code hằng ngày
- Báo nhóm khi:
  - Chuẩn bị merge
  - Có conflict lớn
  - Thay đổi cấu trúc chung

---

## 7. Nguyên tắc chung

- Không push thẳng lên `main` hoặc `develop`
- Mọi thay đổi đều thông qua Pull Request
- Code rõ ràng, dễ đọc, dễ review

---

📌 **Tài liệu này là bắt buộc cho tất cả thành viên trong nhóm.**
