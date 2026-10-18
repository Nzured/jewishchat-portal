import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPendingGroupDraft,
  loadPendingGroupDraft,
  savePendingGroupDraft,
  type PendingGroupDraft,
} from "./pendingGroupDraft";

const draft = {
  draftId: "draft-1",
  values: { name: "Kosher Recipes" },
} as unknown as PendingGroupDraft;

describe("pending group draft", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns null when nothing is saved", () => {
    expect(loadPendingGroupDraft()).toBeNull();
  });

  it("round-trips a saved draft", () => {
    savePendingGroupDraft(draft);
    expect(loadPendingGroupDraft()).toEqual(draft);
  });

  it("clears the draft", () => {
    savePendingGroupDraft(draft);
    clearPendingGroupDraft();
    expect(loadPendingGroupDraft()).toBeNull();
  });

  it("ignores corrupt storage", () => {
    sessionStorage.setItem("pendingGroupDraft", "{nope");
    expect(loadPendingGroupDraft()).toBeNull();
  });
});
