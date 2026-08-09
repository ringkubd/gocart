import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const slides = await prisma.heroSlide.findMany({
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        })
        return NextResponse.json({ slides })
    } catch (error) {
        console.error("Hero slides GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { title, subtitle, image, link, buttonText, active, sortOrder } = body

        if (!title || !image) {
            return NextResponse.json({ error: "title and image required" }, { status: 400 })
        }

        const slide = await prisma.heroSlide.create({
            data: {
                title,
                subtitle: subtitle || "",
                image,
                link: link || "",
                buttonText: buttonText || "Shop Now",
                active: active !== undefined ? Boolean(active) : true,
                sortOrder: Number(sortOrder) || 0,
            },
        })

        return NextResponse.json({ slide }, { status: 201 })
    } catch (error) {
        console.error("Hero slides POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { id } = body
        if (!id) {
            return NextResponse.json({ error: "id required" }, { status: 400 })
        }

        const data = {}
        if (body.title !== undefined) data.title = body.title
        if (body.subtitle !== undefined) data.subtitle = body.subtitle
        if (body.image !== undefined) data.image = body.image
        if (body.link !== undefined) data.link = body.link
        if (body.buttonText !== undefined) data.buttonText = body.buttonText
        if (body.active !== undefined) data.active = Boolean(body.active)
        if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder)

        const slide = await prisma.heroSlide.update({ where: { id }, data })

        return NextResponse.json({ slide })
    } catch (error) {
        console.error("Hero slides PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        await prisma.heroSlide.delete({ where: { id: body.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Hero slides DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
