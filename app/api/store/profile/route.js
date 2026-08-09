import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({
            where: { userId: user.id },
            include: {
                user: { select: { name: true, email: true, image: true } },
                _count: { select: { Product: true, Order: true } },
            },
        })

        if (!store) {
            return NextResponse.json({ error: "No store found" }, { status: 404 })
        }

        return NextResponse.json({ store })
    } catch (error) {
        console.error("Store profile GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return NextResponse.json({ error: "No store found" }, { status: 404 })
        }

        const body = await req.json()
        const data = {}
        if (body.name !== undefined) data.name = body.name
        if (body.description !== undefined) data.description = body.description
        if (body.email !== undefined) data.email = body.email
        if (body.contact !== undefined) data.contact = body.contact
        if (body.address !== undefined) data.address = body.address
        if (body.logo !== undefined) data.logo = body.logo

        const updated = await prisma.store.update({
            where: { id: store.id },
            data,
        })

        return NextResponse.json({ store: updated })
    } catch (error) {
        console.error("Store profile PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
