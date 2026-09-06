import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

// Admin: list all product chats
export async function GET(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get("status") || ""
        const storeId = searchParams.get("storeId") || ""

        const where = { productId: { not: null } }
        if (status) where.status = status
        if (storeId) where.storeId = storeId

        const tickets = await prisma.supportTicket.findMany({
            where,
            include: {
                product: { select: { id: true, name: true, images: true } },
                store: { select: { id: true, name: true } },
                user: { select: { id: true, name: true, email: true } },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: { sender: { select: { name: true, role: true } } },
                },
                _count: { select: { messages: true } },
            },
            orderBy: { updatedAt: "desc" },
        })

        const ticketsWithUnread = await Promise.all(
            tickets.map(async (ticket) => {
                const unread = await prisma.supportMessage.count({
                    where: { ticketId: ticket.id, read: false, senderRole: { in: ["user", "visitor"] } },
                })
                return { ...ticket, unreadCount: unread }
            })
        )

        return NextResponse.json({ tickets: ticketsWithUnread })
    } catch (error) {
        console.error("Admin chat list error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
