import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import sharp from "sharp"

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico', '.avif']
const RASTER_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file")

        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        const ext = path.extname(file.name).toLowerCase()
        if (!ALLOWED_EXT.includes(ext)) {
            return NextResponse.json({ error: `File type ${ext || "unknown"} not allowed` }, { status: 400 })
        }

        const bytes = Buffer.from(await file.arrayBuffer())
        if (bytes.length > MAX_SIZE) {
            return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
        }

        const basename = randomUUID()
        const filename = `${basename}${ext}`
        const uploadDir = path.join(process.cwd(), "public", "uploads")
        await mkdir(uploadDir, { recursive: true })
        await writeFile(path.join(uploadDir, filename), bytes)

        // Create a WebP thumbnail for listings (product cards, front page)
        let thumbUrl = `/uploads/${filename}`
        if (RASTER_EXT.includes(ext)) {
            try {
                const thumbName = `${basename}.thumb.webp`
                const thumbBuffer = await sharp(bytes)
                    .rotate()
                    .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer()
                await writeFile(path.join(uploadDir, thumbName), thumbBuffer)
                thumbUrl = `/uploads/${thumbName}`
            } catch (thumbError) {
                console.error("Thumbnail generation failed:", thumbError)
            }
        }

        return NextResponse.json({ url: `/uploads/${filename}`, thumb: thumbUrl })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}