import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import bcrypt from "bcryptjs"

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                _count: { select: { buyerOrders: true, Address: true, ratings: true } },
            },
        })

        return NextResponse.json({ profile })
    } catch (error) {
        console.error("Account GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()

        const data = {}
        if (body.name !== undefined) data.name = body.name
        if (body.phone !== undefined) data.phone = body.phone
        if (body.image !== undefined) data.image = body.image
        if (body.password) {
            data.password = await bcrypt.hash(body.password, 10)
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data,
            select: { id: true, name: true, email: true, image: true },
        })

        return NextResponse.json({ profile: updated })
    } catch (error) {
        console.error("Account PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
