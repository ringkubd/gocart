import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req, { params }) {
    try {
        const { username } = await params

        const store = await prisma.store.findUnique({
            where: { username },
            include: {
                user: { select: { name: true, image: true } },
                Product: {
                    where: { inStock: true },
                    include: { rating: true },
                },
            },
        })

        if (!store || !store.isActive) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }

        return NextResponse.json({ store })
    } catch (error) {
        console.error("Store GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
