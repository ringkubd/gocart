import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const addresses = await prisma.address.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ addresses })
    } catch (error) {
        console.error("Addresses GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { name, email, street, city, state, zip, country, phone } = body

        if (!name || !email || !street || !city || !state || !zip || !country || !phone) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const address = await prisma.address.create({
            data: {
                userId: user.id,
                name,
                email,
                street,
                city,
                state,
                zip,
                country,
                phone,
            },
        })

        return NextResponse.json({ address }, { status: 201 })
    } catch (error) {
        console.error("Addresses POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const user = await getSessionUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { id, name, email, street, city, state, zip, country, phone } = body
        if (!id) return NextResponse.json({ error: "Address ID required" }, { status: 400 })

        const existing = await prisma.address.findFirst({ where: { id, userId: user.id } })
        if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 })

        const updated = await prisma.address.update({
            where: { id },
            data: { name, email, street, city, state, zip, country, phone },
        })

        return NextResponse.json({ address: updated })
    } catch (error) {
        console.error("Addresses PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const user = await getSessionUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Address ID required" }, { status: 400 })

        const existing = await prisma.address.findFirst({ where: { id, userId: user.id } })
        if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 })

        await prisma.address.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Addresses DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
