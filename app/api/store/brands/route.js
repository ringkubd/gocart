import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

// GET: list global brands + store's own brands
// POST: create a new brand (global if admin, store-specific if vendor)
export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })

        const brands = await prisma.brand.findMany({
            where: {
                active: true,
                OR: [
                    { storeId: null }, // global brands
                    ...(store ? [{ storeId: store.id }] : []),
                ],
            },
            orderBy: { name: "asc" },
        })

        return NextResponse.json({ brands })
    } catch (error) {
        console.error("Store brands GET error:", error)
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
        const { name } = body

        if (!name) {
            return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

        // Check if brand already exists (global or same store)
        const existing = await prisma.brand.findFirst({
            where: {
                name: name,
                storeId: store?.id || null,
            },
        })

        if (existing) {
            return NextResponse.json({ brand: existing })
        }

        const brand = await prisma.brand.create({
            data: {
                name,
                slug,
                storeId: store?.id || null,
            },
        })

        return NextResponse.json({ brand }, { status: 201 })
    } catch (error) {
        console.error("Store brands POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
