import { getSeoByPage } from "@/lib/seo"
import HomeClient from "./HomeClient"

export async function generateMetadata() {
    const seo = await getSeoByPage("home")
    return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        openGraph: {
            title: seo.title,
            description: seo.description,
            images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
        },
        robots: {
            index: seo.robots?.includes("index"),
            follow: seo.robots?.includes("follow"),
        },
    }
}

export default function Home() {
    return <HomeClient />
}
