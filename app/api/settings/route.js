import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const [settings, slides, categories, brands, shippingMethods, gateways, couriers] = await Promise.all([
            prisma.siteSetting.findMany(),
            prisma.heroSlide.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
            prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
            prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
            prisma.shippingMethod.findMany({ where: { active: true } }),
            prisma.paymentGateway.findMany({ where: { active: true } }),
            prisma.courierProvider.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
        ])

        const settingsMap = {}
        settings.forEach((s) => {
            settingsMap[s.key] = s.value
        })

        return NextResponse.json({
            settings: settingsMap,
            slides,
            categories,
            brands,
            shippingMethods,
            gateways,
            couriers,
        })
    } catch (error) {
        console.error("Public settings GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
