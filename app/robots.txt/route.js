import { prisma } from "@/lib/prisma"

const BASE = "https://thedhakashop.com"

// AI crawler user agents that can be toggled from admin
export const AI_CRAWLERS = {
    gptbot: { name: "GPTBot", default: "allow" },
    chatgpt: { name: "ChatGPT-User", default: "allow" },
    claudebot: { name: "ClaudeBot", default: "allow" },
    claudecrawler: { name: "Claude-Web", default: "allow" },
    anthropic: { name: "anthropic-ai", default: "allow" },
    googleextended: { name: "Google-Extended", default: "allow" },
    perplexity: { name: "PerplexityBot", default: "allow" },
    openai: { name: "OAI-SearchBot", default: "allow" },
    bytespider: { name: "Bytespider", default: "allow" },
    bingai: { name: "BingBot", default: "allow" },
    metaai: { name: "meta-externalagent", default: "allow" },
}

export async function GET() {
    let aiSettings = {}
    let allowSite = "Allow: /"

    try {
        const settings = await prisma.siteSetting.findMany()
        const map = {}
        settings.forEach(s => { map[s.key] = s.value })
        if (map.aiCrawlers) aiSettings = map.aiCrawlers
        if (map.seoRobots === "noindex") allowSite = "Disallow: /"
    } catch (error) {
        // defaults
    }

    let rules = `User-agent: *\n${allowSite}\n`

    // AI crawler rules (default allow, can be set to disallow from admin)
    for (const [key, info] of Object.entries(AI_CRAWLERS)) {
        const setting = aiSettings[key] ?? info.default
        const action = setting === "disallow" ? "Disallow" : "Allow"
        rules += `\nUser-agent: ${info.name}\n${action}: /\n`
    }

    return new Response(
        `${rules}\nSitemap: ${BASE}/sitemap.xml\n`,
        { headers: { "Content-Type": "text/plain" } }
    )
}
