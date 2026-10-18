# GIẢI THÍCH CHI TIẾT LUỒNG HOẠT ĐỘNG CỦA PROJECT

## Mục lục

1. [PHẦN 1: Từ `pnpm run dev` đến khi trình duyệt hiển thị](#phần-1-từ-pnpm-run-dev-đến-khi-trình-duyệt-hiển-thị)
2. [PHẦN 2: Tailwind CSS hoạt động như thế nào](#phần-2-tailwind-css-hoạt-động-như-thế-nào)
3. [PHẦN 3: Design Token là gì và cách áp dụng với Tailwind](#phần-3-design-token-là-gì-và-cách-áp-dụng-với-tailwind)
4. [PHẦN 4: Cách thay đổi chủ đề (Theme Switching) hoạt động](#phần-4-cách-thay-đổi-chủ-đề-theme-switching-hoạt-động)
5. [PHẦN 5: Luồng hoạt động tổng thể của Project](#phần-5-luồng-hoạt-động-tổng-thể-của-project)

---

## PHẦN 1: Từ `pnpm run dev` đến khi trình duyệt hiển thị

### Bước 1: Lệnh `pnpm run dev` làm gì?

Khi bạn chạy `pnpm run dev`, pnpm sẽ tìm trong `package.json` mục `scripts` và chạy lệnh tương ứng:

```json
// package.json
"scripts": {
  "dev": "vite",
  ...
}
```

**Giải thích:** `pnpm run dev` = chạy lệnh `vite`. Vite là một **build tool / dev server** cho frontend.

### Bước 2: Vite khởi động Dev Server

Khi lệnh `vite` chạy, Vite sẽ:

1. **Đọc file `vite.config.ts`** để biết cấu hình:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],       // Plugin hỗ trợ React (JSX, Fast Refresh)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),  // Cho phép import bằng @/...
    },
  },
});
```

**Giải thích từng phần:**

- `plugins: [react()]` → Vite tự nó không hiểu JSX/TSX. Plugin `@vitejs/plugin-react` giúp Vite:
  - Chuyển đổi (transform) JSX thành JavaScript thuần
  - Hỗ trợ **Hot Module Replacement (HMR)** — khi bạn sửa code, trình duyệt cập nhật mà KHÔNG cần reload toàn trang
- `resolve.alias` → Khi bạn viết `import something from "@/stores/theme.store"`, Vite hiểu `@` = thư mục `src`. Thay vì viết đường dẫn tương đối dài `../../stores/theme.store`, bạn viết gọn `@/stores/theme.store`.

2. **Alias `@` cũng phải cấu hình cho TypeScript**, vì TypeScript cần biết `@` trỏ đến đâu để kiểm tra type:

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]   // TypeScript hiểu @/ = ./src/
    },
    ...
  }
}
```

> **Lưu ý quan trọng:** Alias phải cấu hình ở **HAI NƠI** — Vite (để runtime resolve) và TypeScript (để IDE kiểm tra type). Nếu chỉ cấu hình một nơi, sẽ lỗi.

3. **Khởi động HTTP server** tại `http://localhost:5173` (port mặc định).

4. **Đọc biến môi trường** từ file `.env`:

```
VITE_API_URL=http://localhost:8080
```

Chỉ biến có prefix `VITE_` mới được Vite expose ra cho client-side code (lý do bảo mật — không muốn lộ biến server).

### Bước 3: Trình duyệt nhận file HTML

Khi bạn truy cập `http://localhost:5173`, Vite phục vụ file `index.html`:

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>frontend</title>
  </head>
  <body>
    <div id="root"></div>                                    <!-- ← ĐIỂM GẮN KẾT React -->
    <script type="module" src="/src/main.tsx"></script>      <!-- ← ĐIỂM KHỞI CHẠY -->
  </body>
</html>
```

**Giải thích:**

- `<div id="root"></div>` — Đây là **container rỗng**. React sẽ render toàn bộ UI vào trong div này.
- `<script type="module" src="/src/main.tsx">` — Trình duyệt tải file `main.tsx`. Vite **KHÔNG** bundle sẵn (khác webpack). Vite dùng **ES Modules gốc** của trình duyệt:
  - Trình duyệt yêu cầu `main.tsx`
  - Vite transform (chuyển TSX → JS) và gửi về
  - Trong `main.tsx` có `import`, trình duyệt tiếp tục yêu cầu từng module
  - Vite transform và gửi từng module riêng biệt (không bundle thành 1 file)

> **Đây là lý do Vite nhanh hơn Webpack**: Webpack phải bundle tất cả trước khi serve. Vite chỉ transform từng file khi cần.

### Bước 4: `main.tsx` — Entry Point của React App

```typescript
// src/main.tsx
import "@/styles/global.css";                              // ← BƯỚC 4a: Import CSS (Tailwind)
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";                         // ← BƯỚC 4c: Hệ thống routing
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./i18n";                                           // ← BƯỚC 4d: Đa ngôn ngữ

createRoot(document.getElementById("root")!).render(       // ← BƯỚC 4b: Mount React
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
```

**Giải thích từng dòng theo thứ tự thực thi:**

**4a.** `import "@/styles/global.css"` — Đây là dòng **QUAN TRỌNG NHẤT** cho Tailwind. Dòng này làm gì:
- Vite thấy import CSS → chuyển cho **PostCSS** xử lý (xem `postcss.config.js`)
- PostCSS gọi **Tailwind CSS plugin** → Tailwind scan toàn bộ source code, tìm class names (`bg-white`, `text-lg`, v.v.) → sinh ra CSS tương ứng
- CSS được inject vào `<head>` của trang web dưới dạng `<style>` tag
- **Chi tiết cách Tailwind hoạt động sẽ ở Phần 2**

**4b.** `createRoot(document.getElementById("root")!).render(...)`:
- `document.getElementById("root")` → Lấy `<div id="root">` từ `index.html`
- `createRoot(...)` → Tạo React root (React 18+ API)
- `.render(...)` → Render component tree vào DOM

**4c.** `<RouterProvider router={router} />` → Cung cấp hệ thống routing cho toàn app.

**4d.** `import "./i18n"` → Khởi tạo hệ thống đa ngôn ngữ (i18next).

### Bước 5: PostCSS Pipeline (phần "ẩn" - không có trong source code bạn viết)

Khi Vite gặp `import "@/styles/global.css"`, nó kích hoạt **PostCSS pipeline**:

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},     // ← Plugin 1: Tailwind CSS xử lý
    autoprefixer: {},    // ← Plugin 2: Tự động thêm vendor prefix (-webkit-, -moz-)
  },
};
```

**Pipeline xử lý (KHÔNG có trong source code, diễn ra bên trong):**

```
global.css
    │
    ▼
[PostCSS đọc file]
    │
    ▼
[Plugin 1: Tailwind CSS]
    ├── Đọc tailwind.config.js để biết cấu hình
    ├── Scan tất cả file trong content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
    ├── Tìm tất cả class names được sử dụng (bg-white, text-lg, flex, ...)
    ├── Thay thế @tailwind base → CSS reset + CSS variables từ :root{}
    ├── Thay thế @tailwind components → CSS cho các component classes
    └── Thay thế @tailwind utilities → CSS cho mỗi utility class tìm được
    │
    ▼
[Plugin 2: Autoprefixer]
    └── Thêm -webkit-, -moz- cho CSS cần thiết
    │
    ▼
[CSS cuối cùng] → Inject vào <head> của trang
```

---

## PHẦN 2: Tailwind CSS hoạt động như thế nào

### 2.1. Kiến trúc tổng quan của Tailwind

Tailwind CSS là một **utility-first CSS framework**. Thay vì viết CSS truyền thống:

```css
/* CSS truyền thống */
.card {
  display: flex;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

Bạn viết trực tiếp trong HTML/JSX:

```jsx
<div className="flex p-4 bg-white rounded-lg shadow-sm">...</div>
```

### 2.2. Ba Directive cốt lõi

Trong `src/styles/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Mỗi directive là gì:**

#### `@tailwind base`

Tailwind thay thế dòng này bằng **Preflight** — một bộ CSS reset dựa trên `modern-normalize`. Nó:
- Reset margin/padding về 0
- Đặt `box-sizing: border-box` cho tất cả element
- Reset heading (h1-h6) về font-size bình thường
- Remove bullet/number của list
- Set default font-family

Ngoài ra, CSS custom mà bạn viết trong `@layer base { ... }` cũng được inject ở đây:

```css
/* src/styles/global.css */
@layer base {
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  /* CSS Variables cho Light Mode */
  :root {
    --color-text-primary: #4c4e64de;
    --color-bg-body: #f7f7f9;
    /* ... rất nhiều biến khác ... */
  }

  /* CSS Variables cho Dark Mode */
  .dark {
    --color-text-primary: #eaeaffde;
    --color-bg-body: #282a42;
    /* ... đổi giá trị cho dark mode ... */
  }

  body {
    @apply bg-body font-inter text-text-primary antialiased transition-colors duration-200;
  }
}
```

**Giải thích chi tiết `@layer base`:**

1. **`:root { ... }`** — Định nghĩa CSS Variables cho **Light Mode** (mặc định). `:root` tương đương `<html>`, nên biến này áp dụng cho toàn trang.

2. **`.dark { ... }`** — Khi `<html>` có class `dark`, các biến CSS sẽ bị **ghi đè** bằng giá trị dark mode. **Đây là cơ chế cốt lõi của theme switching**. (Chi tiết ở Phần 4)

3. **`body { @apply ... }`** — Dòng này dùng `@apply` để áp dụng các Tailwind utilities cho `<body>`:
   - `bg-body` → `background-color: var(--color-bg-body)` (màu nền thay đổi theo theme)
   - `font-inter` → `font-family: Inter, system-ui, ...`
   - `text-text-primary` → `color: var(--color-text-primary)` (màu chữ thay đổi theo theme)
   - `antialiased` → Font rendering mượt hơn
   - `transition-colors duration-200` → Khi đổi theme, màu chuyển mượt trong 200ms

#### `@tailwind components`

Inject CSS cho component-level classes (ví dụ: `.container`). Trong project này chưa define custom component classes.

#### `@tailwind utilities`

Đây là phần **CHÍNH** và **LỚN NHẤT**. Tailwind scan source code, tìm tất cả class names và chỉ sinh CSS cho các class **thực sự được dùng**. Ví dụ:

Trong `src/components/atomic/templates/AuthTemplate/AuthTemplate.tsx`:
```jsx
<div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4">
```

Tailwind sẽ sinh CSS cho: `flex`, `min-h-screen`, `items-center`, `justify-center`, `bg-[#f8f9fa]`, `px-4`.

**Nếu một class KHÔNG xuất hiện trong source code, Tailwind KHÔNG sinh CSS cho nó** → File CSS output rất nhỏ.

### 2.3. Tailwind Config — Bộ não của Tailwind

File `tailwind.config.js` quyết định **mọi thứ** Tailwind có thể làm:

```javascript
// tailwind.config.js
import { colors } from "./src/styles/tokens/colors.ts";
import { fontSize } from "./src/styles/tokens/typography.ts";

export default {
  // ① CONTENT: Tailwind scan những file nào để tìm class names
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  // ② DARK MODE: Dùng strategy nào để đổi theme
  darkMode: "class",
  
  // ③ THEME: Mở rộng/ghi đè default theme
  theme: {
    extend: {
      colors: { ... },      // Thêm màu custom
      boxShadow: { ... },   // Thêm shadow custom
      fontSize,              // Thêm font size custom
      fontFamily: { ... },   // Thêm font custom
      gridTemplateColumns: { ... },
      gap: { ... },
    },
  },
  
  plugins: [],
};
```

**Giải thích từng phần:**

#### ① `content` — Quan trọng nhất

```javascript
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
```

Tailwind **PHẢI biết scan file nào**. Nó dùng regex để tìm pattern giống class name trong các file này. Nếu bạn quên thêm một đường dẫn, class trong file đó sẽ **không có CSS**.

Ví dụ: `"./src/**/*.{js,ts,jsx,tsx}"` có nghĩa: "Tất cả file `.js`, `.ts`, `.jsx`, `.tsx` trong mọi thư mục con của `src`".

#### ② `darkMode: "class"`

Có 2 strategy:
- `"media"` — Dựa trên `prefers-color-scheme` của hệ điều hành (tự động)
- `"class"` — Dựa trên class `dark` trên `<html>` (manual control) ← **Project này dùng cách này**

Khi `darkMode: "class"`, Tailwind sẽ sinh CSS dạng:

```css
/* Utility bình thường */
.bg-body { background-color: var(--color-bg-body); }

/* Utility có prefix dark: */
.dark .dark\:bg-paper { background-color: var(--color-bg-paper); }
```

#### ③ `theme.extend` — Mở rộng theme mặc định

`extend` có nghĩa: **THÊM VÀO** chứ không **THAY THẾ** theme mặc định. Nếu bạn viết ngoài `extend`, nó sẽ xóa hết default và chỉ giữ phần bạn viết.

---

## PHẦN 3: Design Token là gì và cách áp dụng với Tailwind

### 3.1. Design Token là gì?

**Design Token** = các giá trị thiết kế cơ bản nhất (màu sắc, font size, spacing, shadow, ...) được lưu trữ dưới dạng **dữ liệu có cấu trúc**, thay vì hard-code trong CSS.

**Tại sao cần Design Token?**
- **Nhất quán**: Mọi component dùng cùng bộ giá trị → UI đồng nhất
- **Dễ thay đổi**: Đổi một giá trị ở token → tất cả component tự cập nhật
- **Cầu nối Designer ↔ Developer**: Designer xuất token từ Figma → Developer dùng ngay

### 3.2. Kiến trúc Design Token trong Project

```
src/styles/
├── design-tokens/               ← RAW tokens (từ Figma export)
│   ├── color.styles.tokens.json
│   ├── effect.styles.tokens.json
│   ├── grid.styles.tokens.json
│   ├── text.styles.tokens.json
│   └── manifest.json
├── tokens/                      ← PROCESSED tokens (TypeScript, dùng trong code)
│   ├── colors.ts
│   ├── typography.ts
│   ├── shadows.ts
│   ├── spacing.ts
│   ├── fonts.ts
│   ├── radius.ts
│   └── index.ts
└── global.css                   ← CSS Variables + Tailwind directives
```

**Luồng chuyển đổi:**

```
Figma Design System
       │
       ▼
[Export JSON Token]
       │
       ▼
design-tokens/*.json          ← Dữ liệu thô (JSON format chuẩn W3C)
       │
       ▼
[Chuyển đổi thủ công/script]
       │
       ▼
tokens/*.ts                   ← TypeScript objects (Tailwind-compatible)
       │
       ▼
tailwind.config.js            ← Import tokens và extend theme
       │
       ▼
Tailwind CSS Engine           ← Sinh utility classes từ tokens
       │
       ▼
CSS Classes sẵn sàng dùng    ← bg-primary, text-h1, shadow-md, ...
```

### 3.3. Phân tích chi tiết từng loại Token

#### 3.3.1. Color Tokens

**Bước 1: Raw Token (JSON từ Figma)**

```json
// src/styles/design-tokens/color.styles.tokens.json
{
  "Light": {
    "Primary": {
      "Main": {
        "$type": "color",
        "$description": "Main color used by most components",
        "$value": "#666cff"
      },
      "Dark": {
        "$type": "color",
        "$value": "#5a5fe0"
      },
      "Light": {
        "$type": "color",
        "$value": "#787eff"
      },
      "Contrast": {
        "$type": "color",
        "$value": "#ffffff"
      }
    },
    "Text": {
      "Primary": {
        "$type": "color",
        "$value": "#4c4e64de"
      }
    }
    // ... rất nhiều token khác
  }
}
```

**Bước 2: Processed Token (TypeScript)**

```typescript
// src/styles/tokens/colors.ts
export const colors = {
  // BRAND COLORS (không đổi theo theme)
  primary: {
    DEFAULT: "#666cff",      // ← Từ JSON: Light.Primary.Main.$value
    dark: "#5a5fe0",         // ← Từ JSON: Light.Primary.Dark.$value
    light: "#787eff",
    contrast: "#ffffff",
  },
  secondary: {
    DEFAULT: "#6d788d",
    dark: "#606a7c",
    light: "#7f889b",
    contrast: "#ffffff",
  },
  error: {
    DEFAULT: "#ff4d49",
    dark: "#e04440",
    light: "#ff625f",
    contrast: "#ffffff",
  },
  // Warning, Info, Success tương tự...
  
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
    // ... scale từ 50 đến 900 + A100 đến A700
  },
  
  common: {
    white: "#ffffff",
    black: "#000000",
  },
  
  states: {
    activeMenu: "#666cff",
    // ...
  },
  
  alert: {
    errorContent: "#ff4d49",
    errorBackground: "#ff4d4914",    // ← Màu error nhạt (14 = 8% opacity)
    // ...
  },
};
```

**Bước 3: Đăng ký vào Tailwind**

```javascript
// tailwind.config.js
import { colors } from "./src/styles/tokens/colors.ts";

export default {
  theme: {
    extend: {
      colors: {
        // ── BRAND COLORS (import trực tiếp từ token) ──
        primary: colors.primary,
        secondary: colors.secondary,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,
        success: colors.success,
        grey: colors.grey,
        common: colors.common,
        states: colors.states,
        alert: colors.alert,

        // ── SEMANTIC COLORS (dùng CSS Variables) ──
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        body: "var(--color-bg-body)",
        paper: "var(--color-bg-paper)",
        // ... nhiều semantic color khác
      },
    },
  },
};
```

**Bước 4: Sử dụng trong Component**

```jsx
// Sử dụng Brand Color (giá trị cứng, KHÔNG đổi theo theme)
<button className="bg-primary text-primary-contrast">
  Click me
</button>
// → background-color: #666cff; color: #ffffff;

// Sử dụng Semantic Color (CSS Variable, TỰ ĐỘNG đổi theo theme)
<body className="bg-body text-text-primary">
  ...
</body>
// Light mode → background-color: #f7f7f9; color: #4c4e64de;
// Dark mode  → background-color: #282a42; color: #eaeaffde;
```

**Tại sao có 2 loại màu (Brand vs Semantic)?**

| | Brand Colors | Semantic Colors |
|---|---|---|
| Ví dụ | `primary`, `error`, `success` | `text-primary`, `bg-body`, `paper` |
| Giá trị | Cố định: `#666cff` | CSS Variable: `var(--color-bg-body)` |
| Đổi theo theme? | ❌ KHÔNG | ✅ CÓ |
| Dùng khi nào | Giao diện cần nổi bật (button, badge, link) | Giao diện nền (background, text, border) |

#### 3.3.2. Typography Tokens

**Raw Token:**

```json
// src/styles/design-tokens/text.styles.tokens.json
// (Chứa thông số font từ Figma)
```

**Processed Token:**

```typescript
// src/styles/tokens/typography.ts

// ── Object gốc (cho reference) ──
export const typography = {
  h1: {
    fontSize: "96px",
    fontWeight: 500,
    letterSpacing: "-1.5px",
    lineHeight: "112.03px",
  },
  body1: {
    fontSize: "16px",
    fontWeight: 400,
    letterSpacing: "0.15px",
    lineHeight: "24px",
  },
  // ... h2-h6, body2, subtitle1-2, caption, overline
};

// ── Tailwind-compatible format ──
export const fontSize = {
  h1: ["96px", { lineHeight: "112px", letterSpacing: "-1.5px", fontWeight: "500" }],
  h2: ["60px", { lineHeight: "72px", letterSpacing: "-0.5px", fontWeight: "500" }],
  // ...
  body1: ["16px", { lineHeight: "24px", letterSpacing: "0.15px" }],
  body2: ["14px", { lineHeight: "20px", letterSpacing: "0.15px" }],
  // ...
  "btn-lg": ["15px", { lineHeight: "26px", letterSpacing: "0.46px", fontWeight: "500" }],
  "btn-md": ["14px", { lineHeight: "24px", letterSpacing: "0.4px", fontWeight: "500" }],
  "input-label": ["12px", { lineHeight: "12px", letterSpacing: "0.15px" }],
  chip: ["13px", { lineHeight: "18px", letterSpacing: "0.16px" }],
  tooltip: ["11px", { lineHeight: "16px", letterSpacing: "0px", fontWeight: "500" }],
  // ...
} as const;
```

**Đăng ký vào Tailwind:**

```javascript
// tailwind.config.js
import { fontSize } from "./src/styles/tokens/typography.ts";

export default {
  theme: {
    extend: {
      fontSize,    // ← Truyền trực tiếp object vào
      fontFamily: {
        inter: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
};
```

**Sử dụng:**

```jsx
<h1 className="text-h1">Tiêu đề lớn</h1>
// → font-size: 96px; line-height: 112px; letter-spacing: -1.5px; font-weight: 500;

<p className="text-body1">Đoạn văn</p>
// → font-size: 16px; line-height: 24px; letter-spacing: 0.15px;

<span className="text-btn-md">BUTTON TEXT</span>
// → font-size: 14px; line-height: 24px; letter-spacing: 0.4px; font-weight: 500;

<span className="font-inter">Font Inter</span>
// → font-family: Inter, system-ui, -apple-system, sans-serif;
```

**Tailwind format đặc biệt cho fontSize:**

Tailwind yêu cầu `fontSize` phải có dạng:
```
"tên": ["giá-trị-font-size", { lineHeight, letterSpacing, fontWeight }]
```
- Phần tử đầu tiên: font-size value
- Phần tử thứ hai: object chứa các thuộc tính đi kèm

Khi bạn dùng `text-h1`, Tailwind tự động áp dụng **tất cả** thuộc tính (font-size + line-height + letter-spacing + font-weight), không chỉ mỗi font-size.

#### 3.3.3. Shadow Tokens

**Processed Token:**

```typescript
// src/styles/tokens/shadows.ts
export const shadows = {
  light: {
    elevation1: "0px 1px 3px 0px #4c4e641f, 0px 1px 1px 0px #4c4e6424, ...",
    elevation2: "...",
    // ... elevation3 đến elevation10
  },
  dark: {
    elevation1: "0px 1px 3px 0px #1011211f, ...",  // Màu shadow khác cho dark mode
    // ...
  },
};
```

**Đăng ký vào Tailwind (dùng CSS Variables):**

```javascript
// tailwind.config.js
boxShadow: {
  sm: "var(--shadow-sm)",         // ← CSS Variable, đổi theo theme
  DEFAULT: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
  "2xl": "var(--shadow-2xl)",
},
```

**CSS Variables được định nghĩa trong global.css:**

```css
/* Light mode */
:root {
  --shadow-sm: 0px 1px 3px 0px #4c4e641f, ...;    /* Shadow nhạt */
  --shadow-md: 0px 4px 8px -4px #4c4e646b;
}

/* Dark mode */
.dark {
  --shadow-sm: 0px 1px 3px 0px #1011211f, ...;    /* Shadow đậm hơn */
  --shadow-md: 0px 4px 8px -4px #1011216b;
}
```

**Sử dụng:**

```jsx
<div className="shadow-md">Card</div>
// Light mode → box-shadow: 0px 4px 8px -4px #4c4e646b
// Dark mode  → box-shadow: 0px 4px 8px -4px #1011216b
```

#### 3.3.4. Grid & Spacing Tokens

```typescript
// src/styles/tokens/spacing.ts
export const grid = {
  columns: 12,
  gutter: "24px",
  offset: "24px",
};

export const spacing = {
  1: "4px",      // 1 unit = 4px
  2: "8px",
  4: "16px",
  8: "32px",
  // ... scale lên đến 96 (384px)
};
```

**Đăng ký vào Tailwind:**

```javascript
// tailwind.config.js
gridTemplateColumns: {
  layout: "repeat(12, minmax(0, 1fr))",   // Grid 12 cột
},
gap: {
  gutter: "24px",  // Khoảng cách giữa các cột
},
```

**Sử dụng:**

```jsx
<div className="grid grid-cols-layout gap-gutter">
  <div className="col-span-4">1/3 width</div>
  <div className="col-span-8">2/3 width</div>
</div>
```

### 3.4. Tóm tắt: Luồng Design Token → Tailwind Class

```
┌──────────────────────────────────────────────────────────────┐
│  Figma Design System                                         │
│  (Designer tạo các giá trị thiết kế)                        │
└──────────────────┬───────────────────────────────────────────┘
                   │ Export
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  design-tokens/*.json                                        │
│  (Raw JSON, chuẩn W3C Design Token Format)                  │
│  Ví dụ: { "Primary": { "Main": { "$value": "#666cff" } } }  │
└──────────────────┬───────────────────────────────────────────┘
                   │ Chuyển đổi
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  tokens/*.ts                                                 │
│  (TypeScript objects, Tailwind-compatible format)            │
│  Ví dụ: primary: { DEFAULT: "#666cff", dark: "#5a5fe0" }   │
└──────────────────┬───────────────────────────────────────────┘
                   │ Import
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  tailwind.config.js                                          │
│  theme.extend.colors = { primary: colors.primary, ... }     │
│  theme.extend.fontSize = fontSize                            │
└──────────────────┬───────────────────────────────────────────┘
                   │ Tailwind Engine đọc config
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  Tailwind sinh utility classes                               │
│  bg-primary → background-color: #666cff                     │
│  text-h1 → font-size: 96px; line-height: 112px; ...        │
│  shadow-md → box-shadow: var(--shadow-md)                   │
└──────────────────┬───────────────────────────────────────────┘
                   │ Dev sử dụng trong JSX
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  <button className="bg-primary text-btn-md shadow-md">     │
│    Submit                                                    │
│  </button>                                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## PHẦN 4: Cách thay đổi chủ đề (Theme Switching) hoạt động

### 4.1. Tổng quan cơ chế

Cơ chế đổi theme dựa trên **3 trụ cột** phối hợp với nhau:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Zustand Store  │    │   CSS Variables  │    │ Tailwind Config  │
│   (Quản lý      │    │   (Giá trị thay  │    │ (darkMode:       │
│    state)        │◄──►│    đổi theo      │◄──►│  "class")        │
│                  │    │    theme)         │    │                  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 4.2. Trụ cột 1: Tailwind Config — `darkMode: "class"`

```javascript
// tailwind.config.js
export default {
  darkMode: "class",   // ← Quan trọng!
  // ...
};
```

Khi set `darkMode: "class"`, Tailwind sẽ:
- Sinh CSS cho class có prefix `dark:` **dựa trên** class `dark` trên element cha (thường là `<html>`)
- Ví dụ: `dark:bg-paper` → `.dark .dark\:bg-paper { background-color: ... }`

### 4.3. Trụ cột 2: CSS Variables trong `global.css`

```css
/* src/styles/global.css */

/* ── LIGHT MODE (mặc định) ── */
:root {
  --color-text-primary: #4c4e64de;      /* Chữ: màu tối trên nền sáng */
  --color-text-secondary: #4c4e64ad;
  --color-text-disabled: #4c4e6461;
  
  --color-bg-body: #f7f7f9;             /* Nền: màu sáng */
  --color-bg-paper: #ffffff;             /* Card/Paper: trắng */
  --color-bg-page-header: #f5f5f7;
  
  --color-action-hover: #4c4e640d;       /* Hover: nhạt */
  
  --color-divider: #4c4e641f;            /* Đường kẻ: nhạt */
  
  --shadow-sm: 0px 1px 3px 0px #4c4e641f, ...;   /* Shadow: nhẹ */
  --shadow-md: 0px 4px 8px -4px #4c4e646b;
}

/* ── DARK MODE ── */
.dark {
  --color-text-primary: #eaeaffde;      /* Chữ: màu sáng trên nền tối */
  --color-text-secondary: #e7e3fcad;
  --color-text-disabled: #e7e3fc61;
  
  --color-bg-body: #282a42;             /* Nền: màu tối */
  --color-bg-paper: #30334e;             /* Card/Paper: tối */
  --color-bg-page-header: #3a3e5b;
  
  --color-action-hover: #eaeaff0d;       /* Hover: nhạt trên nền tối */
  
  --color-divider: #eaeaff1f;
  
  --shadow-sm: 0px 1px 3px 0px #1011211f, ...;   /* Shadow: tối hơn */
  --shadow-md: 0px 4px 8px -4px #1011216b;
}
```

**Cơ chế hoạt động:**

Giả sử ta có Tailwind class `bg-body` được đăng ký trong config:

```javascript
// tailwind.config.js
colors: {
  body: "var(--color-bg-body)",   // ← Trỏ đến CSS Variable
}
```

Tailwind sinh CSS:
```css
.bg-body {
  background-color: var(--color-bg-body);
}
```

- **Light mode**: `<html>` KHÔNG có class `dark` → `:root` áp dụng → `var(--color-bg-body)` = `#f7f7f9` (sáng)
- **Dark mode**: `<html>` CÓ class `dark` → `.dark` áp dụng → `var(--color-bg-body)` = `#282a42` (tối)

**KHÔNG CẦN đổi class trên component!** Chỉ cần thêm/xóa class `dark` trên `<html>`, tất cả component tự đổi màu vì CSS Variable thay đổi giá trị.

### 4.4. Trụ cột 3: Zustand Store — Quản lý State

```typescript
// src/stores/theme.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(                          // ← persist: lưu state vào localStorage
    (set) => ({
      isDarkMode: false,            // ← Mặc định: Light mode
      
      toggleTheme: () =>
        set((state) => {
          const newMode = !state.isDarkMode;
          // ★ BƯỚC QUAN TRỌNG: Thêm/xóa class "dark" trên <html>
          document.documentElement.classList.toggle("dark", newMode);
          return { isDarkMode: newMode };
        }),
      
      setTheme: (isDark) => {
        document.documentElement.classList.toggle("dark", isDark);
        set({ isDarkMode: isDark });
      },
    }),
    {
      name: "theme-storage",       // ← Key trong localStorage
    }
  )
);
```

**Giải thích chi tiết:**

1. **`create<ThemeState>()`** — Tạo Zustand store. Zustand là state management library, đơn giản hơn Redux.

2. **`persist(..., { name: "theme-storage" })`** — Middleware `persist` tự động:
   - **Lưu** state vào `localStorage` với key `"theme-storage"` mỗi khi state thay đổi
   - **Đọc** state từ `localStorage` khi app khởi động
   - → User chọn Dark mode, đóng tab, mở lại → vẫn Dark mode

3. **`isDarkMode: false`** — State boolean, `false` = Light, `true` = Dark.

4. **`toggleTheme()`** — Hàm đổi theme:
   - `!state.isDarkMode` → Đảo ngược: Light → Dark, Dark → Light
   - `document.documentElement.classList.toggle("dark", newMode)`:
     - `document.documentElement` = `<html>` element
     - `.classList.toggle("dark", true)` → Thêm class `dark`
     - `.classList.toggle("dark", false)` → Xóa class `dark`
   - `return { isDarkMode: newMode }` → Cập nhật state

5. **`setTheme(isDark)`** — Set trực tiếp (dùng khi muốn set cụ thể, không phải toggle).

### 4.5. UI Component — Nút bấm đổi Theme

```tsx
// src/components/atomic/molecules/ToggleTheme/ToggleTheme.tsx
import { useThemeStore } from "@/stores/theme.store";
import { Button } from "../../atoms";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore();   // ← Lấy state + action từ store

  return (
    <Button className="hover:bg-action-hover" onClick={toggleTheme}>
      {isDarkMode ? "🌙 Dark" : "☀️ Light"}               {/* Hiện icon + text theo state */}
    </Button>
  );
}
```

**Giải thích:**
- `useThemeStore()` — Hook lấy state từ Zustand store
- `isDarkMode` — Boolean hiện tại
- `toggleTheme` — Function gọi khi click button
- `hover:bg-action-hover` — Class Tailwind: khi hover, background = `var(--color-action-hover)` (tự đổi theo theme!)

### 4.6. Luồng hoạt động khi User click đổi Theme

```
User click "☀️ Light"
       │
       ▼
[1] ThemeToggle.onClick → toggleTheme()        (ToggleTheme.tsx)
       │
       ▼
[2] Zustand Store:                              (theme.store.ts)
    isDarkMode = !false = true
       │
       ├──► [3a] document.documentElement.classList.toggle("dark", true)
       │         → <html class="dark">
       │
       └──► [3b] persist middleware → localStorage.setItem("theme-storage", 
       │         '{"state":{"isDarkMode":true},"version":0}')
       │
       ▼
[4] CSS Variables thay đổi giá trị:            (global.css)
    .dark { 
      --color-bg-body: #282a42;       ← Giá trị mới!
      --color-text-primary: #eaeaffde; ← Giá trị mới!
      --shadow-md: ...;               ← Giá trị mới!
    }
       │
       ▼
[5] TẤT CẢ elements sử dụng CSS Variables tự cập nhật:
    body { background-color: var(--color-bg-body) }
         → #f7f7f9 (sáng) ──thành──► #282a42 (tối)
    
    body { color: var(--color-text-primary) }
         → #4c4e64de ──thành──► #eaeaffde
    
    .shadow-md { box-shadow: var(--shadow-md) }
         → shadow sáng ──thành──► shadow tối
       │
       ▼
[6] transition-colors duration-200 (trên body)
    → Tất cả màu chuyển đổi MỊN trong 200ms
       │
       ▼
[7] React re-render ThemeToggle:
    isDarkMode = true → hiện "🌙 Dark"
```

### 4.7. Luồng khi App Khởi động lại (Restore Theme)

```
User mở lại trang web
       │
       ▼
[1] Zustand persist middleware đọc localStorage:
    localStorage.getItem("theme-storage")
    → { "state": { "isDarkMode": true }, "version": 0 }
       │
       ▼
[2] Store khôi phục: isDarkMode = true
       │
       ▼
[3] ⚠️ VẤN ĐỀ: persist middleware không tự gọi document.documentElement.classList
    → <html> chưa có class "dark"
    → Cần component nào đó gọi setTheme() hoặc kiểm tra khi mount
       │
       ▼
[4] ThemeToggle render → isDarkMode = true → hiện "🌙 Dark"
    NHƯNG UI vẫn light mode vì <html> chưa có class "dark"
```

> **Lưu ý:** Trong project hiện tại, bạn có thể cần thêm một `useEffect` ở root level để sync class `dark` khi app mount. Ví dụ:
> ```tsx
> useEffect(() => {
>   const isDark = useThemeStore.getState().isDarkMode;
>   document.documentElement.classList.toggle("dark", isDark);
> }, []);
> ```

---

## PHẦN 5: Luồng hoạt động tổng thể của Project

### 5.1. Kiến trúc Component — Atomic Design

Project sử dụng **Atomic Design** methodology:

```
components/atomic/
├── atoms/          ← Nhỏ nhất, không phụ thuộc component khác
│   ├── Button/
│   └── Input/
├── molecules/      ← Kết hợp 2+ atoms
│   ├── FormField/
│   ├── Header/
│   ├── SidebarItem/
│   └── ToggleTheme/
├── organisms/      ← Kết hợp molecules + atoms, có logic riêng
│   ├── Header/
│   ├── LoginForm/
│   ├── RegisterForm/
│   └── Sidebar/
└── templates/      ← Layout wrapper, chứa organisms
    ├── AuthTemplate/
    └── MainLayout/
```

**Ví dụ cụ thể trong code:**

**Atom — Button (đơn vị nhỏ nhất):**
```tsx
// src/components/atomic/atoms/Button/Button.tsx
export default function Button({ children, onClick, type = "button", className = "" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded px-4 py-2 font-medium transition-all ${className}`}
    >
      {children}
    </button>
  );
}
```
→ Button có style cơ bản từ design token (`rounded`, `px-4`, `py-2`), nhận thêm `className` để tùy chỉnh.

**Molecule — ToggleTheme (kết hợp Button atom + logic):**
```tsx
// src/components/atomic/molecules/ToggleTheme/ToggleTheme.tsx
export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  return (
    <Button className="hover:bg-action-hover" onClick={toggleTheme}>
      {isDarkMode ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}
```
→ Sử dụng atom `Button` + thêm logic từ `useThemeStore`.

**Organism — Header (kết hợp molecules + atoms):**
```tsx
// src/components/atomic/organisms/Header/Header.tsx
export const Header = () => {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-8">
      <div className="flex w-96 items-center gap-3">
        <img src={searchIcon} alt="search" className="h-10 w-10 opacity-50" />
        <input type="text" placeholder="Tìm kiếm..." className="..." />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />          {/* ← Molecule */}
        <button className="...">
          <img src={avtIcon} />   {/* Avatar */}
        </button>
      </div>
    </header>
  );
};
```

**Template — MainLayout (layout wrapper):**
```tsx
// src/components/atomic/templates/MainLayout/MainLayout.tsx
export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex min-h-screen bg-white transition-all duration-300">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />  {/* Organism */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />                                                      {/* Organism */}
        <main className="flex-1 overflow-auto bg-white p-8">
          <Outlet />                                                    {/* Nội dung page */}
        </main>
      </div>
    </div>
  );
};
```

### 5.2. Routing — Hệ thống điều hướng

```tsx
// src/routes/index.tsx
export const router = createBrowserRouter([
  // ── Group 1: App layout (Header + content) ──
  {
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/test-error-boundary", element: <ErrorBoundaryTestPage /> },
    ],
  },
  
  // ── Group 2: Auth pages (không có layout chung) ──
  { path: "/login", element: <LoginPage />, errorElement: <ErrorPage /> },
  { path: "/register", element: <RegisterPage />, errorElement: <ErrorPage /> },
  
  // ── Group 3: Dashboard layout (Sidebar + Header + content) ──
  {
    path: "/",
    element: <MainLayout />,    // ← Template với Sidebar + Header
    children: [
      { path: "dashboard", element: <DashboardPage /> },
    ],
  },
  
  // ── Catch-all: 404 ──
  { path: "*", element: <NotFoundPage /> },
]);
```

**Giải thích:**

- `element: <App />` — Component cha. `<Outlet />` trong App render component con tương ứng route.
- `errorElement: <ErrorPage />` — Nếu component con throw error, hiển thị ErrorPage thay vì crash.
- `createBrowserRouter` — Dùng History API của trình duyệt (URL đẹp, không có `#`).

### 5.3. State Management — Zustand

Project dùng 2 store:

```typescript
// src/stores/auth.store.ts — Quản lý authentication
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}));

// src/stores/theme.store.ts — Quản lý theme (đã phân tích ở Phần 4)
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => { ... }),
      setTheme: (isDark) => { ... },
    }),
    { name: "theme-storage" }
  )
);
```

### 5.4. Sơ đồ luồng hoạt động toàn bộ

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         pnpm run dev                                    │
│                              │                                          │
│                              ▼                                          │
│                     Vite Dev Server                                     │
│                    (vite.config.ts)                                      │
│                     port: 5173                                          │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ serve
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       index.html                                        │
│              <div id="root"></div>                                       │
│              <script src="/src/main.tsx">                               │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ load
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        main.tsx                                         │
│                                                                         │
│   ┌──────────────────────────────────────────────────────┐              │
│   │ import "@/styles/global.css"                          │              │
│   │        │                                              │              │
│   │        ▼                                              │              │
│   │ PostCSS Pipeline:                                     │              │
│   │   postcss.config.js                                   │              │
│   │     → tailwindcss plugin                              │              │
│   │       → đọc tailwind.config.js                        │              │
│   │         → import tokens/colors.ts                     │              │
│   │         → import tokens/typography.ts                 │              │
│   │       → scan src/**/*.{ts,tsx}                        │              │
│   │       → sinh CSS cho class được dùng                  │              │
│   │       → inject :root{} và .dark{}                     │              │
│   │     → autoprefixer                                    │              │
│   │        │                                              │              │
│   │        ▼                                              │              │
│   │   CSS inject vào <head> dưới dạng <style>            │              │
│   └──────────────────────────────────────────────────────┘              │
│                                                                         │
│   createRoot(document.getElementById("root")!).render(                  │
│     <ErrorBoundary>                                                     │
│       <RouterProvider router={router} />                                │
│     </ErrorBoundary>                                                    │
│   )                                                                     │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ render
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     React Component Tree                                │
│                                                                         │
│   ErrorBoundary                                                         │
│   └── RouterProvider                                                    │
│       ├── "/" → App                                                     │
│       │       ├── Header (molecule)                                     │
│       │       └── Outlet                                                │
│       │           ├── "/" → HomePage                                    │
│       │           └── "/test-error-boundary" → ErrorBoundaryTestPage   │
│       ├── "/login" → LoginPage                                          │
│       │               └── AuthTemplate                                  │
│       │                   └── LoginForm                                 │
│       ├── "/register" → RegisterPage                                    │
│       │                  └── AuthTemplate                               │
│       │                      └── RegisterForm                           │
│       ├── "/" → MainLayout                                              │
│       │       ├── Sidebar (organism)                                    │
│       │       ├── Header (organism, có ThemeToggle)                     │
│       │       └── Outlet                                                │
│       │           └── "/dashboard" → DashboardPage                     │
│       └── "*" → NotFoundPage                                           │
│                                                                         │
│   ┌─────────────────────────────────────────┐                          │
│   │ Zustand Stores (global state)           │                          │
│   │ ├── useThemeStore → isDarkMode, toggle  │                          │
│   │ └── useAuthStore  → token               │                          │
│   └─────────────────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.5. Tóm tắt Visual: Cách Tailwind Class trở thành Pixel trên màn hình

```
Developer viết:
  <div className="bg-body text-text-primary shadow-md p-4">

        │
        ▼ Tailwind Engine (build time / dev time)
        
Sinh CSS:
  .bg-body { background-color: var(--color-bg-body); }
  .text-text-primary { color: var(--color-text-primary); }
  .shadow-md { box-shadow: var(--shadow-md); }
  .p-4 { padding: 1rem; }

        │
        ▼ Browser CSS Engine (runtime)

Resolve CSS Variables (dựa trên có/không class "dark" trên <html>):

  Light Mode (:root):                    Dark Mode (.dark):
  background: #f7f7f9                    background: #282a42
  color: #4c4e64de                       color: #eaeaffde
  box-shadow: 0px 4px 8px... (light)     box-shadow: 0px 4px 8px... (dark)
  padding: 16px                          padding: 16px

        │
        ▼ Browser Rendering Engine

Paint pixels lên màn hình ✨
```

---

## PHỤ LỤC: Bảng tham chiếu nhanh

### A. Tailwind Class → CSS Variable → Giá trị thực

| Tailwind Class | CSS Output | Light Value | Dark Value |
|---|---|---|---|
| `bg-body` | `var(--color-bg-body)` | `#f7f7f9` | `#282a42` |
| `bg-paper` | `var(--color-bg-paper)` | `#ffffff` | `#30334e` |
| `text-text-primary` | `var(--color-text-primary)` | `#4c4e64de` | `#eaeaffde` |
| `text-text-secondary` | `var(--color-text-secondary)` | `#4c4e64ad` | `#e7e3fcad` |
| `text-text-disabled` | `var(--color-text-disabled)` | `#4c4e6461` | `#e7e3fc61` |
| `border-border` | `var(--color-bg-border)` | `#3a35414d` | `#e7e3fc4d` |
| `bg-action-hover` | `var(--color-action-hover)` | `#4c4e640d` | `#eaeaff0d` |
| `shadow-md` | `var(--shadow-md)` | shadow sáng | shadow tối |

### B. Tailwind Class → Giá trị Brand Color (KHÔNG đổi theo theme)

| Tailwind Class | CSS Output |
|---|---|
| `bg-primary` | `#666cff` |
| `bg-primary-dark` | `#5a5fe0` |
| `bg-primary-light` | `#787eff` |
| `text-primary-contrast` | `#ffffff` |
| `bg-error` | `#ff4d49` |
| `bg-success` | `#72e128` |
| `bg-warning` | `#fdb528` |
| `bg-info` | `#26c6f9` |
| `bg-grey-100` | `#f5f5f5` |
| `bg-grey-900` | `#212121` |

### C. File nào làm gì — Cheat Sheet

| File | Vai trò |
|---|---|
| `package.json` | Định nghĩa scripts, dependencies |
| `vite.config.ts` | Dev server config, alias `@` |
| `tsconfig.app.json` | TypeScript config, alias `@` cho TS |
| `postcss.config.js` | Pipeline: Tailwind → Autoprefixer |
| `tailwind.config.js` | Tailwind: content, darkMode, theme extend |
| `src/styles/global.css` | CSS Variables (light/dark) + Tailwind directives |
| `src/styles/tokens/colors.ts` | Color design tokens |
| `src/styles/tokens/typography.ts` | Typography design tokens |
| `src/styles/tokens/shadows.ts` | Shadow design tokens |
| `src/stores/theme.store.ts` | Theme state + toggle logic |
| `src/components/.../ToggleTheme.tsx` | UI button đổi theme |
| `src/main.tsx` | Entry point, import CSS, mount React |
| `index.html` | HTML shell, `<div id="root">` |
