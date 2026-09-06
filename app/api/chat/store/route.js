import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

// Store owner: list all product chats for their store
export async function GET(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return NextResponse.json({ error: "No store found" }, { status: 404 })
        }

        const tickets = await prisma.supportTicket.findMany({
            where: { storeId: store.id, productId: { not: null } },
            include: {
                product: { select: { id: true, name: true, images: true } },
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

        // Calculate unread count (messages from user/visitor that are unread)
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
        console.error("Store chat list error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
