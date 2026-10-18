import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateGroupFormValues, GroupStatus } from "@/types/Group";
import { GroupsProvider, useGroups } from "./GroupsContext";

const service = vi.hoisted(() => ({
  getCategories: vi.fn(),
  getDraftId: vi.fn(),
  saveDraftStep1: vi.fn(),
  saveDraftStep2: vi.fn(),
  saveDraftStep4: vi.fn(),
  uploadGroupPhoto: vi.fn(),
  submitDraft: vi.fn(),
}));

vi.mock("@/services/group/group.service", () => ({ GroupService: service }));

const values = {
  whatsappLink: "https://chat.whatsapp.com/AbC123xyz",
  name: "Kosher Recipes",
  shortDesc: "Recipes",
  about: "About",
  linkVisibilityLoggedInOnly: false,
  mainCategoryId: 3,
  additionalCategoryIds: [4],
  locationCity: "Haifa",
  locationState: "",
  locationCountry: "Israel",
  memberCount: null,
  image: null,
} as unknown as CreateGroupFormValues;

function wrapper({ children }: { children: ReactNode }) {
  return <GroupsProvider>{children}</GroupsProvider>;
}

describe("GroupsContext", () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    let next = 0;
    service.getDraftId.mockImplementation(() =>
      Promise.resolve({ data: { draftId: `d${++next}`, status: GroupStatus.STARTED } }),
    );
    service.saveDraftStep1.mockResolvedValue({ data: { status: GroupStatus.IN_PROGRESS } });
    service.saveDraftStep2.mockResolvedValue({ data: { status: GroupStatus.IN_PROGRESS } });
  });

  it("creates a draft on the first step 1 save and sends only step 1 fields", async () => {
    const { result } = renderHook(() => useGroups(), { wrapper });
    await act(() => result.current.saveDraftStep1(values));

    expect(result.current.draftId).toBe("d1");
    expect(service.saveDraftStep1).toHaveBeenCalledWith(
      {
        whatsappLink: values.whatsappLink,
        name: values.name,
        shortDesc: values.shortDesc,
        about: values.about,
        linkVisibilityLoggedInOnly: false,
      },
      "d1",
    );
  });

  it("reuses the draft when step 1 is saved again", async () => {
    const { result } = renderHook(() => useGroups(), { wrapper });
    await act(() => result.current.saveDraftStep1(values));
    await act(() => result.current.saveDraftStep1(values));
    expect(service.getDraftId).toHaveBeenCalledTimes(1);
    expect(service.saveDraftStep1).toHaveBeenLastCalledWith(expect.anything(), "d1");
  });

  it("reuses the draft when retrying after a failed step 1 save", async () => {
    service.saveDraftStep1.mockRejectedValueOnce(new Error("Link already listed"));
    const { result } = renderHook(() => useGroups(), { wrapper });

    await act(() => result.current.saveDraftStep1(values).catch(() => {}));
    await act(() => result.current.saveDraftStep1(values));

    expect(service.getDraftId).toHaveBeenCalledTimes(1);
    expect(service.saveDraftStep1).toHaveBeenLastCalledWith(expect.anything(), "d1");
  });

  it("starts a new draft after the previous one was submitted", async () => {
    service.submitDraft.mockResolvedValue({ data: { status: GroupStatus.PENDING_MODERATION } });
    const { result } = renderHook(() => useGroups(), { wrapper });

    await act(() => result.current.saveDraftStep1(values));
    await act(() => result.current.submitDraft("turnstile"));
    await act(() => result.current.saveDraftStep1(values));

    expect(service.getDraftId).toHaveBeenCalledTimes(2);
    expect(result.current.draftId).toBe("d2");
  });

  it("continues a restored draft instead of creating one", async () => {
    const { result } = renderHook(() => useGroups(), { wrapper });
    act(() => result.current.restoreDraftId("restored"));
    await act(() => result.current.saveDraftStep1(values));
    expect(service.getDraftId).not.toHaveBeenCalled();
    expect(service.saveDraftStep1).toHaveBeenCalledWith(expect.anything(), "restored");
  });

  it("refuses step 2 before a draft exists", async () => {
    const { result } = renderHook(() => useGroups(), { wrapper });
    await expect(result.current.saveDraftStep2(values)).rejects.toThrow(/step 1/);
  });

  it("sends step 2 fields and defaults a missing member count to 0", async () => {
    const { result } = renderHook(() => useGroups(), { wrapper });
    await act(() => result.current.saveDraftStep1(values));
    await act(() => result.current.saveDraftStep2(values));
    expect(service.saveDraftStep2).toHaveBeenCalledWith(
      {
        mainCategoryId: 3,
        additionalCategoryIds: [4],
        locationCity: "Haifa",
        locationState: "",
        locationCountry: "Israel",
        memberCount: 0,
      },
      "d1",
    );
  });

  it("uploads the image to the signed url and returns the file key", async () => {
    service.saveDraftStep4.mockResolvedValue({
      data: { uploadUrl: "https://s3/upload", fileKey: "key-1" },
    });
    service.uploadGroupPhoto.mockResolvedValue(undefined);
    const { result } = renderHook(() => useGroups(), { wrapper });
    await act(() => result.current.saveDraftStep1(values));

    const file = new File(["x"], "a.png", { type: "image/png" });
    const onProgress = vi.fn();
    let key = "";
    await act(async () => {
      key = await result.current.uploadGroupImage(file, onProgress);
    });

    expect(key).toBe("key-1");
    expect(service.uploadGroupPhoto).toHaveBeenCalledWith("https://s3/upload", file, onProgress);
  });

  it("dedupes concurrent category requests and retries after a failure", async () => {
    service.getCategories
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValue({ data: [{ id: 1 }] });
    const { result } = renderHook(() => useGroups(), { wrapper });

    await expect(result.current.fetchCategories()).rejects.toThrow("down");
    const [a, b] = await Promise.all([
      result.current.fetchCategories(),
      result.current.fetchCategories(),
    ]);
    expect(a).toEqual([{ id: 1 }]);
    expect(b).toBe(a);
    expect(service.getCategories).toHaveBeenCalledTimes(2);
  });
});
