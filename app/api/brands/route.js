import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const brands = await prisma.brand.findMany({
            where: { active: true },
            include: { _count: { select: { products: true } } },
            orderBy: { name: "asc" },
        })
        return NextResponse.json({ brands })
    } catch (error) {
        console.error("Public brands GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
