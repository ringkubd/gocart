import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { triggerSupportEvent } from "@/lib/soketi"

export async function POST(req) {
    try {
        const user = await getSessionUser()
        const body = await req.json()
        const { ticketId, message, visitorId } = body

        if (!ticketId || !message) {
            return NextResponse.json({ error: "Ticket ID and message required" }, { status: 400 })
        }

        const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        // Verify access: owner (userId), visitor (visitorId), admin, or store owner
        let hasAccess = false
        let senderRole = "user"
        let senderId = null

        if (user) {
            if (user.role === "admin") {
                hasAccess = true
                senderRole = "admin"
                senderId = user.id
            } else {
                // Check if store owner
                const store = await prisma.store.findUnique({ where: { userId: user.id } })
                if (store && ticket.storeId === store.id) {
                    hasAccess = true
                    senderRole = "seller"
                    senderId = user.id
                }
                // Check if ticket owner
                if (ticket.userId === user.id) {
                    hasAccess = true
                    senderRole = "user"
                    senderId = user.id
                }
            }
        } else if (visitorId) {
            // Guest visitor
            if (ticket.visitorId === visitorId) {
                hasAccess = true
                senderRole = "user"
            }
        }

        if (!hasAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const msg = await prisma.supportMessage.create({
            data: {
                ticketId,
                senderId,
                senderRole,
                body: message,
            },
            include: { sender: { select: { id: true, name: true, role: true, image: true } } },
        })

        // Update ticket timestamp
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() },
        })

        // Real-time notification
        await triggerSupportEvent(ticketId, "new-message", {
            id: msg.id,
            body: msg.body,
            senderId: senderId,
            senderName: user?.name || ticket.visitorName || "Visitor",
            senderRole,
            createdAt: msg.createdAt,
        })

        return NextResponse.json({ message: msg }, { status: 201 })
    } catch (error) {
        console.error("Chat message error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
