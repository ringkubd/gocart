import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(req, { params }) {
    try {
        const { productId } = await params
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                store: true,
                brand: true,
                rating: { include: { user: true } },
            },
        })

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        return NextResponse.json({ product })
    } catch (error) {
        console.error("Product GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { productId } = await params
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        const isOwner = store && store.id === product.storeId
        const isAdmin = user.role === "admin"

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()

        const updated = await prisma.product.update({
            where: { id: productId },
            data: {
                ...(body.name !== undefined && { name: body.name }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.mrp !== undefined && { mrp: Number(body.mrp) }),
                ...(body.price !== undefined && { price: Number(body.price) }),
                ...(body.images !== undefined && { images: body.images }),
                ...(body.category !== undefined && { category: body.category }),
                ...(body.brandId !== undefined && { brandId: body.brandId }),
                ...(body.inStock !== undefined && { inStock: Boolean(body.inStock) }),
                ...(body.stock !== undefined && { stock: Number(body.stock), inStock: Number(body.stock) > 0 }),
                ...(body.featured !== undefined && { featured: Boolean(body.featured) }),
            },
            include: { store: true, brand: true, rating: true },
        })

        return NextResponse.json({ product: updated })
    } catch (error) {
        console.error("Product PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { productId } = await params
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        const isOwner = store && store.id === product.storeId
        const isAdmin = user.role === "admin"

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.product.delete({ where: { id: productId } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Product DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
