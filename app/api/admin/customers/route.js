import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const pageSize = parseInt(searchParams.get("pageSize") || "20")

        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                ],
            }),
        }

        const total = await prisma.user.count({ where })
        const customers = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                _count: { select: { buyerOrders: true } },
                store: { select: { id: true, name: true, username: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        return NextResponse.json({ customers, total, page, pageSize })
    } catch (error) {
        console.error("Admin customers GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
