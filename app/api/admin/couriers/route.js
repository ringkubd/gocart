import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const providers = await prisma.courierProvider.findMany({ orderBy: { name: "asc" } })
        return NextResponse.json({ providers })
    } catch (error) {
        console.error("Couriers GET error:", error)
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
        const { id } = body
        if (!id) {
            return NextResponse.json({ error: "id required" }, { status: 400 })
        }

        const data = {}
        if (body.apiKey !== undefined) data.apiKey = body.apiKey
        if (body.apiSecret !== undefined) data.apiSecret = body.apiSecret
        if (body.baseUrl !== undefined) data.baseUrl = body.baseUrl
        if (body.active !== undefined) data.active = Boolean(body.active)
        if (body.extra !== undefined) data.extra = body.extra

        const provider = await prisma.courierProvider.update({ where: { id }, data })

        return NextResponse.json({ provider })
    } catch (error) {
        console.error("Couriers PATCH error:", error)
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
        await prisma.courierProvider.delete({ where: { id: body.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Couriers DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
