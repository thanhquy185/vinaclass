# Cấu trúc Client Vinaclass sau tái cấu trúc

> Tài liệu này đề xuất cấu trúc đích cho client Vinaclass, dựa trên cách phân lớp trong tài liệu cấu trúc VinaSocial. Đây là hướng tổ chức để thực hiện tái cấu trúc, không phải bản kiểm kê cây thư mục hiện tại.

## 1. Tổng quan

Client Vinaclass được tổ chức thành ứng dụng React SPA. Stack mục tiêu tiếp tục dùng React, TypeScript strict, Vite, React Router, TanStack Query, Zustand, Axios, Ant Design và Tailwind CSS. SCSS/design token được duy trì ở lớp style nếu feature còn sử dụng.

Route và layout nằm ở `app/`; giao diện được nhóm theo miền trong `components/`; hook, API service, state, kiểu dữ liệu và tiện ích có lớp riêng. Nghiệp vụ chính gồm xác thực, tài khoản, phân quyền, danh mục, phân công giảng viên, lớp học, ngân hàng câu hỏi và kiểm tra. Các vai trò ADMIN, TEACHER và STUDENT có trải nghiệm/guard tương ứng nhưng chia sẻ những miền nghiệp vụ chung.

Tài liệu VinaSocial mô tả một dự án Next.js. Vinaclass không chuyển sang Next.js: `app/` trong thiết kế này chỉ là lớp route/composition của React Router. Cách phân trách nhiệm được kế thừa, còn các cấu hình và thư viện được chọn theo stack Vinaclass.

## 2. Cây thư mục kiến trúc mục tiêu

```text
client/
├── public/                              # Tệp được phục vụ bằng URL tĩnh nếu cần
├── docs/                                # Tài liệu client
└── src/
    ├── app/                             # Route, page, layout và trạng thái lỗi
    │   ├── router.tsx
    │   ├── routes/                      # Route khai báo theo miền/khu vực
    │   ├── pages/                       # Page composition theo miền
    │   ├── layouts/                     # Public, admin, teacher, student
    │   ├── guards/                      # Auth, role, permission
    │   └── routing/                     # Lazy loading và fallback khi chuyển trang
    ├── assets/                          # Ảnh, icon, font và tệp import trong source
    ├── components/                      # UI được nhóm theo miền nghiệp vụ
    │   ├── auth/
    │   ├── admin/
    │   ├── teacher/
    │   ├── student/
    │   ├── identity/
    │   ├── authorization/
    │   ├── teacher-assignments/
    │   ├── catalogs/
    │   ├── classrooms/
    │   ├── question-bank/
    │   ├── assessments/
    │   ├── shared/                      # Component dùng ở nhiều miền
    │   └── ui/                          # Primitive giao diện
    ├── hooks/                           # Hook theo miền và hook dùng chung
    │   ├── auth/
    │   ├── identity/
    │   ├── classrooms/
    │   ├── assessments/
    │   └── shared/
    ├── lib/                             # Helper nền tảng cho UI/thư viện
    ├── providers/                       # Query, theme, auth session, error boundary
    ├── services/                        # Giao tiếp backend và dịch vụ ngoài
    │   ├── api/
    │   │   ├── client.ts                # Axios instance duy nhất
    │   │   ├── auth/
    │   │   ├── identity/
    │   │   ├── authorization/
    │   │   ├── catalogs/
    │   │   ├── teacher-assignments/
    │   │   ├── classrooms/
    │   │   ├── question-bank/
    │   │   └── assessments/
    │   └── external/                    # Google login, upload và tích hợp ngoài
    ├── shared/                          # Hợp đồng và giá trị xuyên miền
    │   ├── types/
    │   ├── enums/
    │   ├── values/
    │   ├── rules/
    │   └── props/
    ├── store/                           # Zustand store toàn cục
    ├── styles/                          # Global CSS, theme và design tokens
    └── utils/                           # Hàm thuần dùng chung
```

Các thư mục con chỉ được tạo khi có mã thuộc trách nhiệm đó. Nếu một miền có nhiều component hoặc hook, tiếp tục chia sâu theo tác vụ, chẳng hạn `components/classrooms/materials/` hoặc `components/assessments/exam/`. Không tạo thư mục rỗng để dự phòng.

### Cấu hình quan trọng

- `package.json`: các lệnh Vite như `dev`, `build`, `preview`, `lint` và các dependency của client.
- `vite.config.ts`: plugin React/SVG, alias `@` trỏ tới `src/`, cấu hình dev server và build output.
- `tsconfig*.json`: bật TypeScript strict và khai báo cùng alias `@/*` để IDE/compiler phân giải import thống nhất.
- `tailwind.config.*`, `postcss.config.*` và `src/styles/`: cấu hình utility CSS, token/theme và global stylesheet.
- `.env`: dùng biến có prefix `VITE_` cho giá trị được phép đưa vào bundle client, ví dụ `VITE_API_URL`; không đặt secret backend trong biến client.

## 3. Routing và layout

React Router khai báo URL tập trung tại `app/router.tsx`; các route con được chia theo khu vực hoặc miền trong `app/routes/`. Tên file route không quyết định URL như Next.js, mà route object trong React Router quyết định URL. Page là component composition đặt ở `app/pages/<domain>/`; UI nghiệp vụ mà page ghép nằm ở `components/<domain>/`.

| URL hiện hành cần giữ trong đợt di chuyển | Route/page đích | Chức năng |
|---|---|---|
| `/` | `app/routes/app.routes.tsx` → `app/pages/HomePage.tsx` | Trang vào ứng dụng, điều hướng theo phiên và vai trò. |
| `/login`, `/register`, `/auth/callback` | `app/routes/auth.routes.tsx` → `app/pages/auth/` | Đăng nhập, đăng ký và callback Google. |
| `/dashboard` | `app/routes/admin.routes.tsx` → `app/pages/admin/DashboardPage.tsx` | Tổng quan quản trị. |
| `/profile`, `/users` | `app/routes/identity.routes.tsx` → `app/pages/identity/` | Hồ sơ cá nhân và quản lý tài khoản theo quyền. |
| `/permission-groups` | `app/routes/authorization.routes.tsx` → `app/pages/authorization/` | Quản lý nhóm quyền/ma trận quyền. |
| `/assignments` | `app/routes/teacher-assignments.routes.tsx` → `app/pages/teacher-assignments/AssignmentsPage.tsx` | Quản lý hoặc xem phân công giảng viên-môn học theo quyền. |
| `/subjects`, `/difficulty-level` | `app/routes/catalogs.routes.tsx` → `app/pages/catalogs/` | Danh mục môn học và độ khó. |
| `/courses`, `/courses/:id` | `app/routes/classrooms.routes.tsx` → `app/pages/classrooms/` | Danh sách lớp/môn học và nội dung lớp. |
| `/course-group`, `/course-group/:courseId/groups/:groupId/students` | `app/routes/classrooms.routes.tsx` → `app/pages/classrooms/` | Quản lý lớp học và thành viên. |
| `/notifications` | `app/routes/classrooms.routes.tsx` → `app/pages/classrooms/NotificationsPage.tsx` | Thông báo lớp học. |
| `/question` | `app/routes/question-bank.routes.tsx` → `app/pages/question-bank/` | Ngân hàng và biên soạn câu hỏi. |
| `/exams`, `/tests/*` | `app/routes/assessments.routes.tsx` → `app/pages/assessments/` | Đề, giao đề, làm bài và kết quả. |

Các URL trên được giữ để việc chuyển cấu trúc không đồng thời làm thay đổi bookmark hoặc liên kết đang dùng. Có thể chuẩn hóa prefix `/admin`, `/teacher`, `/student` trong thay đổi routing riêng, kèm redirect và kiểm tra liên kết.

### Layout và quyền truy cập

- `app/layouts/PublicLayout` trình bày trang đăng nhập/đăng ký và callback không cần khung ứng dụng đã đăng nhập.
- `app/layouts/AdminLayout` dựng điều hướng và vùng nội dung quản trị.
- `app/layouts/TeacherLayout` trình bày dashboard, môn được phân công và lớp teacher quản lý.
- `app/layouts/StudentLayout` trình bày lớp đã tham gia, nội dung được giao và bài làm.
- `app/guards/AuthenticatedGuard`, `RoleGuard` và `PermissionGuard` bảo vệ route theo phiên, vai trò và quyền cần thiết.
- Trang dùng chung như profile có thể dùng layout đã đăng nhập chung nếu UI không cần phân biệt role.

Menu được dựng từ route đã đăng ký và quyền hiệu lực. Giá trị `route_key` từ API chỉ tham chiếu route trong ứng dụng; không dùng chuỗi tùy ý từ backend làm URL điều hướng. Guard client không thay cho authorization tại API.

## 4. Trách nhiệm từng lớp

### `app/`: URL và composition

`router.tsx` ghép các route khu vực, layout, error boundary và trang not found. `routes/` sở hữu cấu hình route; `pages/` nhận dữ liệu cần thiết và ghép component nghiệp vụ. Khi page chứa nhiều query, mutation hoặc quy tắc, chuyển phần đó sang hook/domain service để page còn tập trung vào composition.

### `components/`: giao diện theo miền

- `components/auth/`: form và trạng thái đăng nhập, đăng ký, callback và khôi phục phiên.
- `components/admin/`, `components/teacher/`, `components/student/`: dashboard và UI chỉ phục vụ trải nghiệm riêng từng vai trò.
- `components/identity/`, `authorization/`, `teacher-assignments/`, `catalogs/`: giao diện hồ sơ, quyền, phân công và danh mục.
- `components/classrooms/`: thẻ lớp, thành viên, bảng tin, tài liệu và thông báo.
- `components/question-bank/`, `components/assessments/`: biên soạn câu hỏi, cấu hình đề, làm bài và kết quả.
- `components/shared/`: UI có ngữ nghĩa dùng ở nhiều miền như avatar, bộ lọc hoặc bảng nghiệp vụ chung.
- `components/ui/`: primitive như Button, Input, Dialog, Select, Tooltip. Dùng Ant Design cho control phổ biến; giữ component riêng cho tương tác đặc thù khi cần.

Component dùng PascalCase và tên mô tả chức năng. Tránh hậu tố chung chung nếu ngữ cảnh thư mục đã nêu miền; ví dụ `components/classrooms/ClassroomCard.tsx`.

### `services/`: giao tiếp API

- `services/api/client.ts` tạo Axios instance với `VITE_API_URL`, `withCredentials` và interceptor dùng chung.
- Request interceptor gắn token/session theo quy tắc xác thực; endpoint công khai được khai báo rõ, không suy luận bằng so sánh chuỗi tùy tiện.
- Response interceptor chuẩn hóa envelope và lỗi API theo hợp đồng backend hiện hành.
- Module service được nhóm theo Auth, Identity, Authorization, Catalogs, Teacher Assignments, Classrooms, Question Bank và Assessments.
- Service khai báo hàm gọi endpoint; query cache, loading UI và toast thuộc hook/page phù hợp, không đặt trong Axios module.
- `services/external/` cô lập OAuth, upload và dịch vụ ngoài API chính.

### `shared/`: hợp đồng và giá trị dùng chung

- `types/`: kiểu request/response chung như response envelope, pagination, API error và kiểu được nhiều miền sử dụng.
- `enums/`: mã vai trò, trạng thái tài khoản/lớp/bài thi và các tập giá trị ổn định.
- `values/`: hằng số cấu hình UI và giá trị mặc định không chứa bí mật.
- `rules/`: quy tắc validation dùng lặp lại như email, mật khẩu và trường bắt buộc.
- `props/`: kiểu options/props dùng chung khi cần.

Kiểu chỉ dùng trong một domain nên đặt cạnh API hoặc component domain đó. Không gom mọi type vào một file tổng hợp.

### `hooks/`, `store/`, `providers/`

- `hooks/<domain>/` chứa query/mutation và hành vi có thể tái sử dụng trong domain; `hooks/shared/` chỉ dành cho hook dùng ở nhiều domain.
- TanStack Query quản lý dữ liệu server, cache và mutation. Hook chịu trách nhiệm invalidate query liên quan sau khi ghi dữ liệu.
- Zustand quản lý client state toàn cục như phiên/theme/overlay. State form hoặc dialog chỉ dùng tại một màn hình giữ cục bộ.
- `store/` cấu hình store và các slice/store module; không lưu bản sao danh sách API đã được TanStack Query quản lý.
- `providers/` khởi tạo QueryClientProvider, theme/i18n, auth session, error boundary và overlay toàn cục một lần.

### `assets/`, `styles/`, `lib/`, `utils/`

- `assets/` chứa ảnh, icon, font và tệp được import từ TypeScript/CSS. Tệp cần URL tĩnh trực tiếp đặt trong `public/`.
- `styles/` chứa global stylesheet, SCSS nguồn, theme và design tokens. Phân biệt tệp nguồn với CSS được sinh ra để tránh sửa đầu ra rồi bị ghi đè.
- `lib/` chứa helper nền tảng cho UI/thư viện, ví dụ ghép class hoặc cấu hình adapter.
- `utils/` chỉ chứa hàm thuần dùng chung. Helper mang quy tắc nghiệp vụ riêng đặt gần domain sở hữu.

## 5. Luồng dữ liệu điển hình

```text
React Router URL
  → app/pages/<domain>/...Page
  → components/<domain>/...Component
  → hooks/<domain>/use...Query hoặc use...Mutation
  → services/api/<domain>/*.service.ts
  → services/api/client.ts
  → Laravel API
```

Kiểu request/response thống nhất ở `shared/types/` khi dùng chung. TanStack Query giữ cache dữ liệu server; Zustand giữ state client toàn cục; component giữ state giao diện cục bộ. Quyền trên menu và route giúp điều hướng phù hợp, còn backend kiểm tra quyền và phạm vi lớp/môn/tài khoản trên từng API.

## 6. Điểm cần tuân thủ khi tái cấu trúc

1. Chuyển theo từng domain: page → component → hook → service → type; giữ URL và API contract trong đợt di chuyển thư mục.
2. Mỗi domain sở hữu UI riêng; chỉ chuyển sang `shared/` sau khi có nhiều nơi dùng thực tế.
3. Dùng một Axios client và một chuẩn xử lý lỗi/response để tránh các luồng auth khác nhau.
4. Không lưu trùng server state trong React Query và Zustand.
5. Không đặt logic truy vấn dài hoặc mutation trực tiếp trong route config.
6. Kiểm tra quyền ở backend, kể cả khi route/menu đã ẩn theo role hoặc permission.
7. Trước khi xóa module cũ, tìm và chuyển toàn bộ imports; không đổi URL chỉ để đồng bộ tên thư mục.
8. Dọn thư mục rỗng và thành phần trùng sau khi domain tương ứng đã chuyển xong.

## 7. Thứ tự triển khai đề xuất

1. Chốt bảng route → layout → page → domain, giữ nguyên các URL được liệt kê ở trên.
2. Chuẩn hóa `app/router.tsx`, route modules, lazy loading, layout và guard.
3. Chuẩn hóa provider, Axios client và kiểu response/error dùng chung.
4. Chọn một domain làm mẫu, chuyển trọn luồng UI → hook → service → type theo cấu trúc đích.
5. Chuyển các domain còn lại theo nhóm: auth/identity/authorization; catalogs/teacher-assignments; classrooms; question-bank/assessments; role dashboards.
6. Rà lại state, component shared, style và assets; loại phần cũ khi không còn import.
7. Khi tổ chức lại thư mục đã ổn định, mới cân nhắc đổi URL hoặc API contract trong một thay đổi riêng.

## 8. Quan hệ với kế hoạch dự án

Tài liệu này xác định cách tổ chức client sau tái cấu trúc. Yêu cầu nghiệp vụ, ma trận quyền ADMIN/TEACHER/STUDENT, phạm vi lớp học và các giai đoạn backend/client được theo dõi trong [Kế hoạch tái cấu trúc Vinaclass](PROJECT_REDESIGN.md).
