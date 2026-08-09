import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { triggerSupportEvent } from "@/lib/soketi"

export async function GET(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { ticketId } = await params
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: ticketId },
            include: {
                messages: {
                    include: { sender: { select: { id: true, name: true, role: true, image: true } } },
                    orderBy: { createdAt: "asc" },
                },
                user: { select: { id: true, name: true, email: true } },
            },
        })

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        // Only the owner or admin can view
        if (ticket.userId !== user.id && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        return NextResponse.json({ ticket })
    } catch (error) {
        console.error("Support ticket GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { ticketId } = await params
        const body = await req.json()
        const { message } = body

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        // Only the owner or admin can reply
        if (ticket.userId !== user.id && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const senderRole = user.role === "admin" ? "admin" : "user"

        const msg = await prisma.supportMessage.create({
            data: {
                ticketId,
                senderId: user.id,
                senderRole,
                body: message,
            },
            include: { sender: { select: { id: true, name: true, role: true, image: true } } },
        })

        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                updatedAt: new Date(),
                status: ticket.status === "closed" ? "open" : ticket.status,
            },
        })

        // Real-time notification via Soketi
        await triggerSupportEvent(ticketId, "new-message", {
            id: msg.id,
            body: msg.body,
            senderId: user.id,
            senderName: user.name,
            senderRole,
            createdAt: msg.createdAt,
        })

        return NextResponse.json({ message: msg }, { status: 201 })
    } catch (error) {
        console.error("Support reply POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { ticketId } = await params
        const body = await req.json()

        const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        // Owner or admin can update status
        if (ticket.userId !== user.id && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const data = {}
        if (body.status) data.status = body.status
        if (body.priority && user.role === "admin") data.priority = body.priority

        const updated = await prisma.supportTicket.update({ where: { id: ticketId }, data })

        return NextResponse.json({ ticket: updated })
    } catch (error) {
        console.error("Support ticket PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
