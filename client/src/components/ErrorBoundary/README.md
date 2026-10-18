# Error Boundary System

Hệ thống xử lý lỗi toàn diện cho ứng dụng React.

## 📦 Components

### 1. ErrorBoundary

Component class-based để bắt lỗi trong React component tree.

**Sử dụng:**

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

**Với custom fallback UI:**

```tsx
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

### 2. ErrorFallback

UI mặc định hiển thị khi có lỗi trong ErrorBoundary.

**Features:**

- Hiển thị thông báo lỗi thân thiện
- Nút "Thử lại" để reset error state
- Nút "Về trang chủ"
- Hiển thị stack trace trong môi trường development
- Responsive design

### 3. ErrorPage

Trang lỗi cho React Router (dùng làm `errorElement`).

**Sử dụng trong router:**

```tsx
import ErrorPage from '@/pages/error/ErrorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [...]
  }
]);
```

## 🎯 Các loại lỗi được xử lý

### ✅ Được bắt bởi ErrorBoundary:

- Lỗi trong quá trình render component
- Lỗi trong lifecycle methods
- Lỗi trong constructor

### ❌ KHÔNG được bắt bởi ErrorBoundary:

- Lỗi trong event handlers (cần try-catch)
- Lỗi trong async code (setTimeout, promises)
- Lỗi trong Server-side rendering
- Lỗi trong chính ErrorBoundary

## 🔧 Cấu trúc hiện tại

```
src/
├── components/
│   └── ErrorBoundary/
│       ├── ErrorBoundary.tsx    # Main ErrorBoundary component
│       ├── ErrorFallback.tsx    # Default fallback UI
│       └── index.ts              # Exports
├── pages/
│   ├── error/
│   │   └── ErrorPage.tsx        # Route error page
│   └── test/
│       └── ErrorBoundaryTestPage.tsx  # Test page
└── main.tsx                      # App wrapped with ErrorBoundary
```

## 🚀 Implementation

### App Level (main.tsx)

```tsx
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
```

### Router Level (routes/index.tsx)

```tsx
export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorPage />,
    children: [...]
  }
]);
```

## 🧪 Testing

Truy cập `/test-error-boundary` để test các tình huống lỗi:

1. **ErrorBoundary Wrapper** - Lỗi được bắt bởi ErrorBoundary
2. **Route Error** - Lỗi được bắt bởi ErrorPage
3. **Async Error** - Không được bắt (console error)
4. **Event Handler Error** - Cần try-catch thủ công
5. **Promise Rejection** - Cần .catch() thủ công

## 💡 Best Practices

### 1. Xử lý Event Handler Errors

```tsx
const handleClick = () => {
  try {
    // Your code
  } catch (error) {
    console.error("Error:", error);
    // Handle error
  }
};
```

### 2. Xử lý Async Errors

```tsx
const fetchData = async () => {
  try {
    const data = await api.getData();
  } catch (error) {
    console.error("Fetch error:", error);
    // Handle error
  }
};
```

### 3. Xử lý Promise Rejections

```tsx
promise
  .then((result) => {
    // Handle success
  })
  .catch((error) => {
    console.error("Promise error:", error);
    // Handle error
  });
```

### 4. Multiple ErrorBoundaries

Sử dụng nhiều ErrorBoundary cho các phần khác nhau:

```tsx
<ErrorBoundary>
  <Sidebar />
</ErrorBoundary>

<ErrorBoundary>
  <MainContent />
</ErrorBoundary>
```

## 🔍 Logging & Monitoring

ErrorBoundary có thể tích hợp với error tracking services:

```tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Log to console
  console.error('ErrorBoundary caught:', error, errorInfo);

  // Send to error tracking service
  // Sentry.captureException(error, { extra: errorInfo });
  // LogRocket.captureException(error);
  // Bugsnag.notify(error);
}
```

## 🎨 Customization

### Custom Fallback UI

```tsx
<ErrorBoundary
  fallback={
    <div>
      <h1>Something went wrong</h1>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

### Development vs Production

ErrorBoundary tự động ẩn stack trace trong production:

- Development: Hiển thị full error details
- Production: Chỉ hiển thị thông báo lỗi thân thiện

## 📚 Resources

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Router Error Handling](https://reactrouter.com/en/main/route/error-element)
