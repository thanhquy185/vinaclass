import { describe, it, expect } from "vitest";

describe("Example Test Suite", () => {
  it("should pass a simple test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should check truthiness", () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });

  it("should work with arrays", () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it("should work with objects", () => {
    const obj = { name: "Test", value: 42 };
    expect(obj).toHaveProperty("name");
    expect(obj.value).toBe(42);
  });
});
