import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { ticketId } = body

        if (!ticketId) {
            return NextResponse.json({ error: "Ticket ID required" }, { status: 400 })
        }

        const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        // Only store owner (for their store) or admin can mark as read
        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        const isStoreOwner = store && ticket.storeId === store.id
        const isAdmin = user.role === "admin"

        if (!isStoreOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Mark all unread messages from user/visitor as read
        await prisma.supportMessage.updateMany({
            where: { ticketId, read: false, senderRole: { in: ["user", "visitor"] } },
            data: { read: true },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Chat read error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
