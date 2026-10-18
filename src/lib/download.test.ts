import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadBlob } from "./download";

describe("downloadBlob", () => {
  const createObjectURL = vi.fn(() => "blob:mock");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("clicks an attached link with the file name and cleans it up", () => {
    let clicked: HTMLAnchorElement | null = null;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked = this;
      expect(document.body.contains(this)).toBe(true);
    });

    downloadBlob("report.csv", new Blob(["a,b"]));

    expect(clicked).not.toBeNull();
    expect(clicked!.download).toBe("report.csv");
    expect(clicked!.href).toBe("blob:mock");
    expect(document.body.contains(clicked)).toBe(false);
  });

  it("revokes the object url only after the download had time to start", () => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    downloadBlob("report.csv", new Blob(["a,b"]));

    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });
});
