import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

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

        const ext = path.extname(file.name).toLowerCase() || ".jpg"
        const filename = `${randomUUID()}${ext}`

        const uploadDir = path.join(process.cwd(), "public", "uploads")
        await mkdir(uploadDir, { recursive: true })

        const bytes = Buffer.from(await file.arrayBuffer())
        await writeFile(path.join(uploadDir, filename), bytes)

        return NextResponse.json({ url: `/uploads/${filename}` })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
