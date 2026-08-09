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
