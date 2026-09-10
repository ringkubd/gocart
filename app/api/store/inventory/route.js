import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

// GET: inventory overview — products with purchase aggregates + batch history
export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return NextResponse.json({ error: "No store found" }, { status: 404 })
        }

        const products = await prisma.product.findMany({
            where: { storeId: store.id },
            include: {
                variants: true,
                purchases: { orderBy: { createdAt: "desc" } },
            },
            orderBy: { createdAt: "desc" },
        })

        const inventory = products.map((p) => {
            const batches = p.purchases || []
            const totalQty = batches.reduce((s, b) => s + b.quantity, 0)
            const totalCost = batches.reduce((s, b) => s + b.quantity * Number(b.unitCost || 0), 0)
            const byVariant = {}
            for (const b of batches) {
                const key = b.variantId || "__simple__"
                if (!byVariant[key]) byVariant[key] = { quantity: 0, cost: 0, batches: [] }
                byVariant[key].quantity += b.quantity
                byVariant[key].cost += b.quantity * Number(b.unitCost || 0)
                byVariant[key].batches.push(b)
            }
            const variantStats = Object.entries(byVariant).map(([variantId, v]) => ({
                variantId: variantId === "__simple__" ? null : variantId,
                quantity: v.quantity,
                avgCost: v.quantity > 0 ? v.cost / v.quantity : 0,
                batches: v.batches,
            }))
            return {
                id: p.id,
                name: p.name,
                images: p.images,
                hasVariants: p.hasVariants,
                variants: p.variants,
                stock: p.stock,
                totalPurchased: totalQty,
                avgCost: totalQty > 0 ? totalCost / totalQty : 0,
                totalCost,
                batchCount: batches.length,
                lastPurchase: batches[0] || null,
                variantStats,
            }
        })

        return NextResponse.json({ inventory })
    } catch (error) {
        console.error("Store inventory GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// POST: add stock (new purchase batch) — { productId, variantId?, supplier, quantity, unitCost, note? }
export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return NextResponse.json({ error: "No store found" }, { status: 404 })
        }

        const body = await req.json()
        const { productId, variantId, supplier, quantity, unitCost, note } = body

        if (!productId) return NextResponse.json({ error: "Product is required" }, { status: 400 })
        if (!supplier?.trim()) return NextResponse.json({ error: "Supplier / source is required" }, { status: 400 })
        const qty = Number(quantity) || 0
        if (qty < 1) return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
        const cost = Math.max(0, Number(unitCost) || 0)

        const product = await prisma.product.findFirst({
            where: { id: productId, storeId: store.id },
            include: { variants: true },
        })
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

        let variant = null
        if (variantId) {
            variant = product.variants.find((v) => v.id === variantId)
            if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 })
        } else if (product.hasVariants) {
            return NextResponse.json({ error: "Select a variant for this product" }, { status: 400 })
        }

        const [batch] = await prisma.$transaction([
            prisma.purchaseBatch.create({
                data: {
                    storeId: store.id,
                    productId: product.id,
                    variantId: variant?.id || null,
                    supplier: supplier.trim(),
                    quantity: qty,
                    unitCost: cost,
                    note: note || "",
                    createdById: user.id,
                },
            }),
            ...(variant
                ? [prisma.productVariant.update({
                    where: { id: variant.id },
                    data: { stock: { increment: qty }, inStock: true },
                })]
                : [prisma.product.update({
                    where: { id: product.id },
                    data: { stock: { increment: qty }, inStock: true },
                })]),
        ])

        return NextResponse.json({ batch }, { status: 201 })
    } catch (error) {
        console.error("Store inventory POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
