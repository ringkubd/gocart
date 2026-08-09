import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        })
        return NextResponse.json({ categories })
    } catch (error) {
        console.error("Categories GET error:", error)
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
        const { name, image, active, sortOrder } = body

        if (!name) {
            return NextResponse.json({ error: "name required" }, { status: 400 })
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

        const existing = await prisma.category.findUnique({ where: { name } })
        if (existing) {
            return NextResponse.json({ error: "Category already exists" }, { status: 409 })
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                image: image || "",
                active: active !== undefined ? Boolean(active) : true,
                sortOrder: Number(sortOrder) || 0,
            },
        })

        return NextResponse.json({ category }, { status: 201 })
    } catch (error) {
        console.error("Categories POST error:", error)
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
        if (body.name !== undefined) {
            data.name = body.name
            data.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        }
        if (body.image !== undefined) data.image = body.image
        if (body.active !== undefined) data.active = Boolean(body.active)
        if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder)

        const category = await prisma.category.update({ where: { id }, data })

        return NextResponse.json({ category })
    } catch (error) {
        console.error("Categories PATCH error:", error)
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
        await prisma.category.delete({ where: { id: body.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Categories DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
