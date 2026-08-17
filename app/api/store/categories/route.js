import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

// GET: list global categories + store's own categories
// POST: create a new category (store-specific)
export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })

        const categories = await prisma.category.findMany({
            where: {
                active: true,
                OR: [
                    { storeId: null },
                    ...(store ? [{ storeId: store.id }] : []),
                ],
            },
            orderBy: { sortOrder: "asc" },
        })

        return NextResponse.json({ categories })
    } catch (error) {
        console.error("Store categories GET error:", error)
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
        const { name, nameBn } = body

        if (!name) {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

        const existing = await prisma.category.findFirst({
            where: {
                name: name,
                storeId: store?.id || null,
            },
        })

        if (existing) {
            return NextResponse.json({ category: existing })
        }

        const category = await prisma.category.create({
            data: {
                name,
                nameBn: nameBn || "",
                slug,
                storeId: store?.id || null,
            },
        })

        return NextResponse.json({ category }, { status: 201 })
    } catch (error) {
        console.error("Store categories POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
