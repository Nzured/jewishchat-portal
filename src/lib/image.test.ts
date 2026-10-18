import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canvasToPngFile, pngFileName, toPngFile } from "./image";

const drawImage = vi.fn();

function stubCanvas(blob: Blob | null = new Blob(["png"], { type: "image/png" })) {
  const sizes: { width: number; height: number }[] = [];
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
    this: HTMLCanvasElement,
  ) {
    sizes.push({ width: this.width, height: this.height });
    return { drawImage } as unknown as CanvasRenderingContext2D;
  } as unknown as HTMLCanvasElement["getContext"]);
  const toBlob = vi
    .spyOn(HTMLCanvasElement.prototype, "toBlob")
    .mockImplementation((callback) => callback(blob));
  return { sizes, toBlob };
}

function stubBitmap(width: number, height: number) {
  const close = vi.fn();
  const createImageBitmap = vi.fn().mockResolvedValue({ width, height, close });
  vi.stubGlobal("createImageBitmap", createImageBitmap);
  return { createImageBitmap, close };
}

describe("pngFileName", () => {
  it.each([
    ["photo.jpg", "photo.png"],
    ["my.holiday.photo.webp", "my.holiday.photo.png"],
    ["noextension", "noextension.png"],
    [".jpg", "image.png"],
  ])("pngFileName(%j) -> %j", (input, expected) => {
    expect(pngFileName(input)).toBe(expected);
  });
});

describe("canvasToPngFile", () => {
  it("encodes the canvas as a PNG file", async () => {
    const { toBlob } = stubCanvas();
    const file = await canvasToPngFile(document.createElement("canvas"), "a.jpg");
    expect(toBlob.mock.calls[0][1]).toBe("image/png");
    expect(file).toMatchObject({ name: "a.png", type: "image/png" });
  });

  it("rejects when the browser cannot encode the canvas", async () => {
    stubCanvas(null);
    await expect(canvasToPngFile(document.createElement("canvas"), "a.jpg")).rejects.toThrow(
      /PNG/,
    );
  });
});

describe("toPngFile", () => {
  beforeEach(() => {
    drawImage.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns PNG files untouched", async () => {
    const { createImageBitmap } = stubBitmap(10, 10);
    const png = new File(["x"], "a.png", { type: "image/png" });
    await expect(toPngFile(png)).resolves.toBe(png);
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  it.each(["image/jpeg", "image/webp"])("converts %s to PNG at full size", async (type) => {
    const { close } = stubBitmap(800, 600);
    const { sizes } = stubCanvas();

    const result = await toPngFile(new File(["x"], "photo.jpg", { type }));

    expect(result).toMatchObject({ name: "photo.png", type: "image/png" });
    expect(sizes[0]).toEqual({ width: 800, height: 600 });
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 800, 600);
    expect(close).toHaveBeenCalled();
  });

  it("scales large images down to the maximum dimension, keeping the aspect ratio", async () => {
    stubBitmap(4000, 3000);
    const { sizes } = stubCanvas();
    await toPngFile(new File(["x"], "big.jpg", { type: "image/jpeg" }));
    expect(sizes[0]).toEqual({ width: 2048, height: 1536 });
  });

  it("scales portrait images by their height", async () => {
    stubBitmap(1000, 4096);
    const { sizes } = stubCanvas();
    await toPngFile(new File(["x"], "tall.jpg", { type: "image/jpeg" }));
    expect(sizes[0]).toEqual({ width: 500, height: 2048 });
  });

  it("releases the bitmap even when encoding fails", async () => {
    const { close } = stubBitmap(10, 10);
    stubCanvas(null);
    await expect(toPngFile(new File(["x"], "a.jpg", { type: "image/jpeg" }))).rejects.toThrow();
    expect(close).toHaveBeenCalled();
  });
});
