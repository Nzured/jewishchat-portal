import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { useJoinGroup } from "./useJoinGroup";

const service = vi.hoisted(() => ({ startGroupJoin: vi.fn(), redeemJoinToken: vi.fn() }));
const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("@/services/group/group.service", () => ({ GroupService: service }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));

function fakePopup() {
  return { opener: {} as unknown, location: { href: "" }, close: vi.fn() };
}

describe("useJoinGroup", () => {
  beforeEach(() => {
    service.startGroupJoin.mockReset();
    service.redeemJoinToken.mockReset();
    router.push.mockReset();
    vi.mocked(toast.error).mockClear();
    vi.mocked(toast.info).mockClear();
  });

  it("opens the popup synchronously and sends it to the redirect url", async () => {
    const popup = fakePopup();
    const open = vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
    service.startGroupJoin.mockResolvedValue({ data: { token: "tok" } });
    service.redeemJoinToken.mockResolvedValue({
      data: { redirectUrl: "https://chat.whatsapp.com/AbC123xyz" },
    });

    const { result } = renderHook(() => useJoinGroup("kosher-recipes"));
    await act(() => result.current.join());

    expect(open).toHaveBeenCalledWith("", "_blank");
    expect(service.startGroupJoin).toHaveBeenCalledWith("kosher-recipes");
    expect(service.redeemJoinToken).toHaveBeenCalledWith("tok");
    expect(popup.opener).toBeNull();
    expect(popup.location.href).toBe("https://chat.whatsapp.com/AbC123xyz");
    expect(result.current.isJoining).toBe(false);
  });

  it("closes the popup and asks to log in on a 401", async () => {
    const popup = fakePopup();
    vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
    service.startGroupJoin.mockRejectedValue({ response: { status: 401 } });

    const { result } = renderHook(() => useJoinGroup("g"));
    await act(() => result.current.join());

    expect(popup.close).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/login");
  });

  it.each([
    [403, "This group is not accepting new members right now."],
    [410, "That join link expired. Please try again."],
    [500, "Could not open the group link. Please try again."],
  ])("explains a %d failure", async (status, message) => {
    vi.spyOn(window, "open").mockReturnValue(fakePopup() as unknown as Window);
    service.startGroupJoin.mockRejectedValue({ response: { status } });

    const { result } = renderHook(() => useJoinGroup("g"));
    await act(() => result.current.join());

    expect(toast.error).toHaveBeenCalledWith(message);
  });

  it("prefers the server message", async () => {
    vi.spyOn(window, "open").mockReturnValue(fakePopup() as unknown as Window);
    service.startGroupJoin.mockRejectedValue({
      response: { status: 403, data: { message: "Group is full" } },
    });
    const { result } = renderHook(() => useJoinGroup("g"));
    await act(() => result.current.join());
    expect(toast.error).toHaveBeenCalledWith("Group is full");
  });

  it("fails cleanly when the token is missing", async () => {
    const popup = fakePopup();
    vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
    service.startGroupJoin.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useJoinGroup("g"));
    await act(() => result.current.join());
    expect(popup.close).toHaveBeenCalled();
    expect(service.redeemJoinToken).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it("ignores a second click while joining", async () => {
    vi.spyOn(window, "open").mockReturnValue(fakePopup() as unknown as Window);
    let resolveToken!: (value: unknown) => void;
    service.startGroupJoin.mockReturnValue(
      new Promise((resolve) => {
        resolveToken = resolve;
      }),
    );
    service.redeemJoinToken.mockResolvedValue({ data: { redirectUrl: "https://x" } });
    const { result } = renderHook(() => useJoinGroup("g"));

    let first!: Promise<void>;
    act(() => {
      first = result.current.join();
    });
    await act(() => result.current.join());
    resolveToken({ data: { token: "t" } });
    await act(() => first);

    expect(service.startGroupJoin).toHaveBeenCalledTimes(1);
  });
});
