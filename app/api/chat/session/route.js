import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

// Create or get product chat session
export async function POST(req) {
    try {
        const user = await getSessionUser()
        const body = await req.json()
        const { productId, visitorId, visitorName, visitorPhone } = body

        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 })
        }

        // Get product to find storeId
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        // Find existing ticket
        let ticket = null

        if (user) {
            // Logged-in user: find by userId + productId
            ticket = await prisma.supportTicket.findFirst({
                where: { userId: user.id, productId },
                include: {
                    messages: {
                        include: { sender: { select: { id: true, name: true, role: true, image: true } } },
                        orderBy: { createdAt: "asc" },
                    },
                    product: { select: { id: true, name: true, images: true } },
                },
            })
        } else if (visitorId) {
            // Guest: find by visitorId + productId
            ticket = await prisma.supportTicket.findFirst({
                where: { visitorId, productId },
                include: {
                    messages: {
                        include: { sender: { select: { id: true, name: true, role: true, image: true } } },
                        orderBy: { createdAt: "asc" },
                    },
                    product: { select: { id: true, name: true, images: true } },
                },
            })
        }

        // Auto-close if last message was > 7 days ago (for customer/visitor chats)
        if (ticket && ticket.status !== "closed") {
            const lastMsg = ticket.messages[ticket.messages.length - 1]
            if (lastMsg) {
                const daysSince = (Date.now() - new Date(lastMsg.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                if (daysSince > 7) {
                    await prisma.supportTicket.update({ where: { id: ticket.id }, data: { status: "closed" } })
                    ticket.status = "closed"
                }
            }
        }

        // Create new ticket if not found
        if (!ticket) {
            const productName = product.name
            ticket = await prisma.supportTicket.create({
                data: {
                    subject: `Chat about ${productName}`,
                    userId: user?.id || null,
                    productId,
                    storeId: product.storeId,
                    visitorId: visitorId || null,
                    visitorName: visitorName || "",
                    visitorPhone: visitorPhone || "",
                },
                include: {
                    messages: true,
                    product: { select: { id: true, name: true, images: true } },
                },
            })
        }

        return NextResponse.json({ ticket })
    } catch (error) {
        console.error("Chat session error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
