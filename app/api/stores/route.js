import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const stores = await prisma.store.findMany({
            where: { isActive: true, status: "approved" },
            include: {
                user: { select: { name: true, image: true } },
                _count: { select: { Product: true } },
            },
        })
        return NextResponse.json({ stores })
    } catch (error) {
        console.error("Stores GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        if (user.role !== "admin") {
            return NextResponse.json({ error: "Sellers are created by the admin only" }, { status: 403 })
        }

        const existing = await prisma.store.findUnique({ where: { userId: user.id } })
        if (existing) {
            return NextResponse.json({ error: "You have already submitted a store application" }, { status: 409 })
        }

        const body = await req.json()
        const { name, username, description, email, contact, address, logo } = body

        if (!name || !username || !description || !email || !contact || !address) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const usernameTaken = await prisma.store.findUnique({ where: { username } })
        if (usernameTaken) {
            return NextResponse.json({ error: "Username already taken" }, { status: 409 })
        }

        const store = await prisma.store.create({
            data: {
                userId: user.id,
                name,
                username,
                description,
                email,
                contact,
                address,
                logo: logo || "",
                status: "pending",
                isActive: false,
            },
        })

        return NextResponse.json({ store }, { status: 201 })
    } catch (error) {
        console.error("Stores POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
