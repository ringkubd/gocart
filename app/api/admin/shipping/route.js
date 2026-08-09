import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const methods = await prisma.shippingMethod.findMany({ orderBy: { createdAt: "asc" } })
        return NextResponse.json({ methods })
    } catch (error) {
        console.error("Shipping GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { name, cost, deliveryTime, active } = body

        if (!name) {
            return NextResponse.json({ error: "name required" }, { status: 400 })
        }

        const method = await prisma.shippingMethod.create({
            data: {
                name,
                cost: Number(cost) || 0,
                deliveryTime: deliveryTime || "",
                active: active !== undefined ? Boolean(active) : true,
            },
        })

        return NextResponse.json({ method }, { status: 201 })
    } catch (error) {
        console.error("Shipping POST error:", error)
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
        if (body.name !== undefined) data.name = body.name
        if (body.cost !== undefined) data.cost = Number(body.cost)
        if (body.deliveryTime !== undefined) data.deliveryTime = body.deliveryTime
        if (body.active !== undefined) data.active = Boolean(body.active)

        const method = await prisma.shippingMethod.update({ where: { id }, data })

        return NextResponse.json({ method })
    } catch (error) {
        console.error("Shipping PATCH error:", error)
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
        await prisma.shippingMethod.delete({ where: { id: body.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Shipping DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
