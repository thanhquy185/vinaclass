# Testing Guide

## 🧪 Setup Vitest

Vitest đã được cấu hình với:

- **Environment**: jsdom (cho React testing)
- **Globals**: `describe`, `it`, `expect`, `vi` có sẵn
- **Coverage**: V8 provider
- **Setup file**: Auto import jest-dom matchers

## 📝 Scripts

```bash
# Chạy tests trong watch mode
npm run test

# Chạy tests với UI
npm run test:ui

# Chạy tests một lần (CI)
npm run test:run

# Chạy tests với coverage report
npm run test:coverage
```

## 🎯 Cấu trúc Test Files

```
src/tests/
├── setup.ts                 # Test setup & global config
├── example.test.ts          # Example simple test
├── components/              # Component tests
│   ├── Button.test.tsx
│   ├── Input.test.tsx
│   └── ErrorBoundary.test.tsx
├── pages/                   # Page tests
├── routes/                  # Route tests
└── utils/                   # Test utilities
    ├── test-utils.tsx       # Custom render functions
    ├── mocks.ts             # Mock data
    └── mock-axios.ts        # Axios mocks
```

## ✍️ Viết Tests

### 1. Basic Test

```typescript
import { describe, it, expect } from "vitest";

describe("MyFunction", () => {
  it("should return correct value", () => {
    expect(1 + 1).toBe(2);
  });
});
```

### 2. Component Test

```typescript
import { render, screen } from "@/tests/utils/test-utils";
import { Button } from "@/components/atoms";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### 3. Test với User Interaction

```typescript
import { render, screen } from "@/tests/utils/test-utils";

it("handles click events", async () => {
  const handleClick = vi.fn();
  const { user } = render(<Button onClick={handleClick}>Click</Button>);

  await user.click(screen.getByRole("button"));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 4. Test với Router

```typescript
import { renderWithRouter, screen } from "@/tests/utils/test-utils";

it("navigates correctly", () => {
  renderWithRouter(<MyComponent />);
  // Test routing logic
});
```

### 5. Mock API Calls

```typescript
import { createMockAxios } from "@/tests/utils/mock-axios";

it("fetches data", async () => {
  const mockAxios = createMockAxios();
  mockAxios.get.mockResolvedValue({ data: { id: 1 } });

  // Test API call
});
```

## 🎨 Jest-DOM Matchers

Các matchers có sẵn:

- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toHaveAttribute()`
- `toBeDisabled()`
- `toBeVisible()`
- `toHaveClass()`
- `toHaveStyle()`
- [Xem thêm](https://github.com/testing-library/jest-dom)

## 📊 Coverage

Chạy coverage report:

```bash
npm run test:coverage
```

Xem report tại: `coverage/index.html`

Coverage excludes:

- `node_modules/`
- `src/tests/`
- `*.d.ts`
- `*.config.*`
- `dist/`

## 🔍 Debug Tests

### VS Code Debug

Thêm vào `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```

### Browser UI

```bash
npm run test:ui
```

## 💡 Best Practices

1. **Arrange-Act-Assert pattern**

```typescript
it("should do something", () => {
  // Arrange - setup
  const value = 5;

  // Act - execute
  const result = myFunction(value);

  // Assert - verify
  expect(result).toBe(10);
});
```

2. **Test user behavior, not implementation**

```typescript
// ✅ Good - test what user sees
expect(screen.getByRole("button")).toHaveTextContent("Submit");

// ❌ Bad - test implementation details
expect(component.state.isSubmitting).toBe(false);
```

3. **Use data-testid sparingly**

```typescript
// ✅ Good - semantic queries
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText("Email");

// ⚠️ OK when needed
screen.getByTestId("complex-component");
```

4. **Clean up after tests**

```typescript
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
