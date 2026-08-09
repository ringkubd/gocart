import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico', '.avif']
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

        const filename = `${randomUUID()}${ext}`
        const uploadDir = path.join(process.cwd(), "public", "uploads")
        await mkdir(uploadDir, { recursive: true })
        await writeFile(path.join(uploadDir, filename), bytes)

        return NextResponse.json({ url: `/uploads/${filename}` })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
