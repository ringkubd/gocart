import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const pageSize = parseInt(searchParams.get("pageSize") || "50")

        const where = search ? { email: { contains: search } } : {}
        const total = await prisma.subscriber.count({ where })
        const subscribers = await prisma.subscriber.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        // Newsletter section settings
        const setting = await prisma.siteSetting.findUnique({ where: { key: "newsletter" } })
        const newsletterSettings = setting?.value || { active: true }

        return NextResponse.json({ subscribers, total, page, pageSize, newsletterSettings })
    } catch (error) {
        console.error("Admin newsletter GET error:", error)
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
        const { active, title, description } = body

        const current = await prisma.siteSetting.findUnique({ where: { key: "newsletter" } })
        const existing = current?.value || { active: true }

        const value = {
            active: active !== undefined ? Boolean(active) : existing.active,
            title: title !== undefined ? title : (existing.title || "Join Newsletter"),
            description: description !== undefined ? description : (existing.description || "Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week."),
        }

        const setting = await prisma.siteSetting.upsert({
            where: { key: "newsletter" },
            update: { value },
            create: { key: "newsletter", value },
        })

        return NextResponse.json({ setting })
    } catch (error) {
        console.error("Admin newsletter PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        if (!body.id) {
            return NextResponse.json({ error: "id required" }, { status: 400 })
        }

        await prisma.subscriber.delete({ where: { id: body.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin newsletter DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
