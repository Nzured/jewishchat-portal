import { act, renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacterCount } from "./useCharacterCount";
import { useDebouncedValue } from "./useDebouncedValue";
import { useExpiry } from "./useExpiry";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 300));
    expect(result.current).toBe("a");
  });

  it("only updates after the value settles", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("abc");
  });
});

describe("useCharacterCount", () => {
  function change(value: string) {
    return { target: { value } } as ChangeEvent<HTMLInputElement>;
  }

  it("counts the default value when uncontrolled", () => {
    const { result } = renderHook(() => useCharacterCount<HTMLInputElement>({ defaultValue: "abc" }));
    expect(result.current.length).toBe(3);
  });

  it("tracks typing when uncontrolled and forwards the event", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useCharacterCount<HTMLInputElement>({ onChange }));
    const event = change("hello");
    act(() => result.current.handleChange(event));
    expect(result.current.length).toBe(5);
    expect(onChange).toHaveBeenCalledWith(event);
  });

  it("uses the controlled value when given", () => {
    const { result } = renderHook(() =>
      useCharacterCount<HTMLInputElement>({ value: "controlled" }),
    );
    act(() => result.current.handleChange(change("x")));
    expect(result.current.length).toBe(10);
  });

  it("counts numeric values by their string length", () => {
    const { result } = renderHook(() => useCharacterCount<HTMLInputElement>({ value: 12345 }));
    expect(result.current.length).toBe(5);
  });
});

describe("useExpiry", () => {
  const NOW = new Date("2026-10-14T12:00:00Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null without an expiry", () => {
    const { result } = renderHook(() => useExpiry({}));
    expect(result.current).toBeNull();
  });

  it("returns null for an unparsable date without a fallback", () => {
    const { result } = renderHook(() => useExpiry({ expiresAt: "garbage" }));
    expect(result.current).toBeNull();
  });

  it("uses an absolute expiry date", () => {
    const { result } = renderHook(() =>
      useExpiry({ expiresAt: new Date(NOW + 3 * 3_600_000).toISOString() }),
    );
    expect(result.current).toMatchObject({
      expired: false,
      urgent: false,
      label: "expires in 3h",
    });
    expect(result.current?.exactLabel).toEqual(expect.any(String));
  });

  it("falls back to a relative expiry in seconds", () => {
    const { result } = renderHook(() => useExpiry({ expiresInSeconds: 30 * 60 }));
    expect(result.current).toMatchObject({ urgent: true, label: "expires in 30m" });
    expect(result.current?.exactLabel).toBeUndefined();
  });

  it("ticks down and eventually expires", () => {
    const { result } = renderHook(() => useExpiry({ expiresInSeconds: 90 }, { refreshMs: 1000 }));
    expect(result.current?.label).toBe("expires in 1m");
    act(() => vi.advanceTimersByTime(90_000));
    expect(result.current).toMatchObject({ expired: true, label: "expired" });
  });

  it("does not report a bogus duration for an already expired date", () => {
    const { result } = renderHook(() =>
      useExpiry({ expiresAt: new Date(NOW - 60_000).toISOString() }),
    );
    expect(result.current).toMatchObject({ expired: true, label: "expired" });
  });
});
