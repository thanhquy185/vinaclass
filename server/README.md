# Laravel Project Guide

## 1. Cài đặt project

Sau khi clone project về:

```bash
composer install
```

---

# 2. Chạy project

Chạy server Laravel:

```bash
php artisan serve
```

---

# 3. Migration Database

Chạy migration để tạo bảng:

```bash
php artisan migrate
```

Refresh lại toàn bộ migration (xóa bảng và tạo lại):

```bash
php artisan migrate:refresh
```

Refresh migration và chạy seed:

```bash
php artisan migrate:refresh --seed
```

Rollback migration gần nhất:

```bash
php artisan migrate:rollback
```

---

# 4. Chạy Seeder

Chạy toàn bộ seed:

```bash
php artisan db:seed
```

Chạy một seeder cụ thể:

```bash
php artisan db:seed --class=UserSeeder
```

---

# 5. Các lệnh Artisan cơ bản

Hiển thị danh sách các lệnh artisan:

```bash
php artisan list
```

Xem help của một lệnh:

```bash
php artisan help migrate
```

---

# 6. Các lệnh Dev thường dùng

## Tạo Model

```bash
php artisan make:model User
```

---

## Tạo Model + Migration

```bash
php artisan make:model User -m
```

---

## Tạo Model + Migration + Controller

```bash
php artisan make:model User -mc
```

---

## Tạo Model + Migration + Controller + Factory + Seeder

```bash
php artisan make:model User -mfsc
```

Các option phổ biến:

| Option | Ý nghĩa                  |
| ------ | ------------------------ |
| `-m`   | Tạo migration            |
| `-c`   | Tạo controller           |
| `-f`   | Tạo factory              |
| `-s`   | Tạo seeder               |
| `-r`   | Controller dạng resource |

Ví dụ:

```bash
php artisan make:model Product -mcr
```

Lệnh này sẽ tạo:

* Model `Product`
* Migration
* Resource Controller

---

# 7. Tạo Controller

Controller thường:

```bash
php artisan make:controller UserController
```

Resource Controller:

```bash
php artisan make:controller UserController --resource
```

---

# 8. Tạo Migration

```bash
php artisan make:migration create_users_table
```

Tạo migration cho bảng có sẵn:

```bash
php artisan make:migration add_phone_to_users_table
```

---

# 9. Tạo Seeder

```bash
php artisan make:seeder UserSeeder
```

---

# 10. Tạo Factory

```bash
php artisan make:factory UserFactory
```

---

# 11. Clear Cache

Clear config cache:

```bash
php artisan config:clear
```

Clear route cache:

```bash
php artisan route:clear
```

Clear toàn bộ cache:

```bash
php artisan optimize:clear
```

---

# 12. Kiểm tra Route

Hiển thị tất cả routes:

```bash
php artisan route:list
```
