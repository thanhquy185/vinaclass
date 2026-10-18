import { vi } from "vitest";
import type { AxiosInstance } from "axios";

/**
 * Mock axios instance
 */
export const createMockAxios = (): AxiosInstance => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaults: {} as any,
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    getUri: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    postForm: vi.fn(),
    putForm: vi.fn(),
    patchForm: vi.fn(),
  } as unknown as AxiosInstance;
};
