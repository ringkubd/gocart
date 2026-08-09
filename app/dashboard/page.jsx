import { getSeoByPage } from "@/lib/seo"
import DashboardHomeClient from "./DashboardHomeClient"

export async function generateMetadata() {
    const seo = await getSeoByPage("dashboard")
    return {
        title: seo.title,
        description: seo.description,
    }
}

export default function DashboardHome() {
    return <DashboardHomeClient />
}
