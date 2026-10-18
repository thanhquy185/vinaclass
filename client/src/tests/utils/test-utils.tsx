import { render as rtlRender } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Custom render function with Router wrapper
 */
export function renderWithRouter(ui: ReactElement, options?: RenderOptions) {
  return {
    ...rtlRender(ui, {
      wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
      ...options,
    }),
    user: userEvent.setup(),
  };
}

/**
 * Custom render function with all providers
 */
export function render(ui: ReactElement, options?: RenderOptions) {
  return {
    ...rtlRender(ui, options),
    user: userEvent.setup(),
  };
}

/**
 * Create mock function with TypeScript support
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMock = <T extends (...args: any[]) => any>() =>
  vi.fn() as unknown as T;

// Re-export everything from testing-library
// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";
export { userEvent };
