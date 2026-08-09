import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const settings = await prisma.siteSetting.findMany()
        const result = {}
        settings.forEach((s) => {
            result[s.key] = s.value
        })
        return NextResponse.json({ settings: result })
    } catch (error) {
        console.error("Settings GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        if (!body.key) {
            return NextResponse.json({ error: "key required" }, { status: 400 })
        }

        const setting = await prisma.siteSetting.upsert({
            where: { key: body.key },
            update: { value: body.value },
            create: { key: body.key, value: body.value },
        })

        return NextResponse.json({ setting })
    } catch (error) {
        console.error("Settings PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
