import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

// Magic-byte signatures so a renamed/spoofed extension or Content-Type
// header can't slip a non-image file (or something malicious) through.
const MAGIC_BYTES: Record<AllowedMimeType, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // "RIFF", WEBP marker checked separately
};

function matchesSignature(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) return false;
  return signature.every((byte, i) => buffer[i] === byte);
}

function isValidImageBuffer(buffer: Buffer, mimeType: AllowedMimeType): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  const headerMatches = signatures.some((sig) => matchesSignature(buffer, sig));

  if (!headerMatches) return false;

  if (mimeType === "image/webp") {
    // RIFF....WEBP - the "WEBP" marker sits at bytes 8-11
    const marker = buffer.subarray(8, 12).toString("ascii");
    return marker === "WEBP";
  }

  return true;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_IMAGE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as AllowedMimeType)) {
      cb(
        new AppError(
          400,
          `Unsupported file type "${file.mimetype}". Allowed types: ${ALLOWED_MIME_TYPES.join(
            ", "
          )}`
        )
      );
      return;
    }
    cb(null, true);
  },
});

/** Multer middleware: expects a single file field named "image". */
export const uploadImage = upload.single("image");

/**
 * Runs after multer. Confirms a file was actually provided and that its
 * real bytes match the claimed mime type (defense against spoofed headers).
 */
export function validateUploadedImage(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const file = req.file;

  if (!file) {
    next(AppError.badRequest('No image file provided. Attach it under the "image" field.'));
    return;
  }

  if (!file.buffer || file.buffer.length === 0) {
    next(AppError.badRequest("Uploaded image file is empty."));
    return;
  }

  const mimeType = file.mimetype as AllowedMimeType;

  if (!isValidImageBuffer(file.buffer, mimeType)) {
    next(
      AppError.badRequest(
        "File content does not match its declared image type. The file may be corrupted or mislabeled."
      )
    );
    return;
  }

  next();
}

/**
 * Translates multer-specific errors (e.g. file-too-large) into AppError
 * so they flow through the same JSON error envelope as everything else.
 */
export function handleMulterError(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(
        AppError.badRequest(
          `Image exceeds the ${env.MAX_IMAGE_SIZE_MB}MB size limit.`
        )
      );
      return;
    }
    next(AppError.badRequest(`Upload error: ${err.message}`));
    return;
  }
  next(err);
}
