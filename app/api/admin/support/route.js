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
        const status = searchParams.get("status") || ""

        const where = status ? { status } : {}
        const tickets = await prisma.supportTicket.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                messages: {
                    include: { sender: { select: { name: true, role: true } } },
                    orderBy: { createdAt: "asc" },
                },
                _count: { select: { messages: true } },
            },
            orderBy: { updatedAt: "desc" },
        })

        return NextResponse.json({ tickets })
    } catch (error) {
        console.error("Admin support GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
