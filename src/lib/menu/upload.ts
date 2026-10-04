import { mkdir, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")
const MAX_BYTES = 2 * 1024 * 1024
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function saveMenuImage(file: File) {
  const extension = TYPES[file.type]

  if (!extension) {
    return { ok: false as const, error: "Image must be JPG, PNG, or WebP" }
  }

  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: "Image must be 2MB or smaller" }
  }

  await mkdir(UPLOAD_DIR, { recursive: true })

  const filename = `${crypto.randomUUID()}.${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOAD_DIR, filename), buffer)

  return { ok: true as const, url: `/uploads/${filename}` }
}

export async function removeLocalImage(imageUrl: string | null | undefined) {
  if (!imageUrl?.startsWith("/uploads/")) {
    return
  }

  const filename = path.basename(imageUrl)
  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => undefined)
}

export function isUploadFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0
}
