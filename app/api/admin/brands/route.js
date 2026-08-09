import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const brands = await prisma.brand.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: "asc" },
        })
        return NextResponse.json({ brands })
    } catch (error) {
        console.error("Brands GET error:", error)
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
        const { name, logo, active } = body

        if (!name) {
            return NextResponse.json({ error: "name required" }, { status: 400 })
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

        const existing = await prisma.brand.findUnique({ where: { name } })
        if (existing) {
            return NextResponse.json({ error: "Brand already exists" }, { status: 409 })
        }

        const brand = await prisma.brand.create({
            data: {
                name,
                slug,
                logo: logo || "",
                active: active !== undefined ? Boolean(active) : true,
            },
        })

        return NextResponse.json({ brand }, { status: 201 })
    } catch (error) {
        console.error("Brands POST error:", error)
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
        if (body.logo !== undefined) data.logo = body.logo
        if (body.active !== undefined) data.active = Boolean(body.active)

        const brand = await prisma.brand.update({ where: { id }, data })

        return NextResponse.json({ brand })
    } catch (error) {
        console.error("Brands PATCH error:", error)
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
        await prisma.brand.delete({ where: { id: body.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Brands DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
