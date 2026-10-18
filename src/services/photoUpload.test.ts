import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GroupService } from "./group/group.service";
import { UserService } from "./user/user.service";

const toPngFile = vi.hoisted(() => vi.fn());

vi.mock("@/lib/image", () => ({ toPngFile }));

describe("photo uploads", () => {
  const original = new File(["jpeg"], "photo.jpg", { type: "image/jpeg" });
  const converted = new File(["png"], "photo.png", { type: "image/png" });

  beforeEach(() => {
    toPngFile.mockReset().mockResolvedValue(converted);
  });

  it("uploads group photos as real PNG bytes with a PNG content type", async () => {
    const put = vi.spyOn(axios, "put").mockResolvedValue({});
    const onProgress = vi.fn();

    await GroupService.uploadGroupPhoto("https://s3/upload", original, onProgress);

    expect(toPngFile).toHaveBeenCalledWith(original);
    expect(put).toHaveBeenCalledWith(
      "https://s3/upload",
      converted,
      expect.objectContaining({ headers: { "Content-Type": "image/png" } }),
    );

    const config = put.mock.calls[0][2] as {
      onUploadProgress: (event: { loaded: number; total?: number }) => void;
    };
    config.onUploadProgress({ loaded: 50, total: 200 });
    config.onUploadProgress({ loaded: 50 });
    expect(onProgress.mock.calls).toEqual([[25], [0]]);
  });

  it("uploads profile pictures as real PNG bytes with a PNG content type", async () => {
    const put = vi.spyOn(axios, "put").mockResolvedValue({});

    await UserService.uploadProfilePicture("https://s3/upload", original);

    expect(put).toHaveBeenCalledWith("https://s3/upload", converted, {
      headers: { "Content-Type": "image/png" },
    });
  });

  it("does not upload when the image cannot be converted", async () => {
    const put = vi.spyOn(axios, "put").mockResolvedValue({});
    toPngFile.mockRejectedValue(new Error("Could not convert the image"));

    await expect(GroupService.uploadGroupPhoto("https://s3/upload", original)).rejects.toThrow();
    expect(put).not.toHaveBeenCalled();
  });
});
