import { GROUP_PHOTO_UPLOAD_CONTENT_TYPE } from "@/configs/const";

const MAX_DIMENSION = 2048;

export function pngFileName(name: string) {
  const base = name.replace(/\.[^./\\]+$/, "");
  return `${base || "image"}.png`;
}

export function canvasToPngFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not encode the image as PNG"));
        return;
      }
      resolve(new File([blob], pngFileName(name), { type: GROUP_PHOTO_UPLOAD_CONTENT_TYPE }));
    }, GROUP_PHOTO_UPLOAD_CONTENT_TYPE);
  });
}

export async function toPngFile(file: File, maxDimension = MAX_DIMENSION): Promise<File> {
  if (file.type === GROUP_PHOTO_UPLOAD_CONTENT_TYPE) return file;

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not convert the image");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return await canvasToPngFile(canvas, file.name);
  } finally {
    bitmap.close();
  }
}
