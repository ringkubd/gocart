const BASE = "https://thedhakashop.com"
const CURRENCY = "BDT"

const abs = (url) => {
    if (!url) return undefined
    return url.startsWith("http") ? url : `${BASE}${url}`
}

export function OrganizationSchema({ name = "theDhakaShop", logo, contact = {}, social = {}, siteName } = {}) {
    const sameAs = Object.values(social || {}).filter(Boolean)
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url: BASE,
        logo: abs(logo) || `${BASE}/branding/logo-square.png`,
        ...(contact?.email && { email: contact.email }),
        ...(contact?.phone && {
            contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                telephone: contact.phone,
                email: contact.email || undefined,
                areaServed: "BD",
                availableLanguage: ["en", "bn"],
            },
        }),
        ...(contact?.address && {
            address: {
                "@type": "PostalAddress",
                streetAddress: typeof contact.address === "string" ? contact.address : undefined,
                addressCountry: "BD",
            },
        }),
        ...(sameAs.length > 0 && { sameAs }),
    }
}

export function WebSiteSchema({ siteName = "theDhakaShop" } = {}) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteName,
        url: BASE,
        inLanguage: ["en", "bn"],
        potentialAction: {
            "@type": "SearchAction",
            target: `${BASE}/shop?search={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    }
}

export function ProductSchema({ product, currency = CURRENCY }) {
    const rating = product.rating || []
    const avg = rating.length
        ? (rating.reduce((s, r) => s + r.rating, 0) / rating.length).toFixed(1)
        : null

    const images = (Array.isArray(product.images) ? product.images : []).map(abs).filter(Boolean)
    const variants = Array.isArray(product.variants) ? product.variants : []

    // Price + availability: variant-aware
    const prices = variants.length
        ? variants.map(v => Number(v.price)).filter(p => p > 0)
        : [Number(product.price) || 0]
    const priceOffers = variants.filter(v => Number(v.price) > 0)
    const price = prices.length ? Math.min(...prices) : (Number(product.price) || 0)
    const highPrice = prices.length ? Math.max(...prices) : price
    const inStock = variants.length
        ? variants.some(v => v.inStock && Number(v.stock) > 0)
        : !!product.inStock

    const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const common = {
        url: `${BASE}/product/${product.id}`,
        priceCurrency: currency,
        priceValidUntil: validUntil,
        availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: product.store?.name || "theDhakaShop" },
        hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "BD",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 7,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/ReturnShippingFees",
            url: `${BASE}/return-policy`,
        },
        ...(product.freeDelivery && {
            shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: { "@type": "MonetaryAmount", value: 0, currency: currency },
                shippingDestination: { "@type": "DefinedRegion", addressCountry: "BD" },
            },
        }),
    }

    const offers = priceOffers.length > 2
        ? {
            "@type": "AggregateOffer",
            ...common,
            lowPrice: price,
            highPrice,
            offerCount: priceOffers.length,
        }
        : { "@type": "Offer", ...common, price }

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: images.length ? images : [`${BASE}/branding/logo-square.png`],
        description: (product.description || "").slice(0, 500),
        sku: product.id,
        ...(product.brand?.name && { brand: { "@type": "Brand", name: product.brand.name } }),
        category: product.category || undefined,
        offers,
        ...(rating.length > 0 && avg && {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: avg,
                reviewCount: rating.length,
            },
        }),
    }
}

export function BreadcrumbSchema({ items }) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: `${BASE}${item.path}`,
        })),
    }
}

export function StoreSchema({ store }) {
    return {
        "@context": "https://schema.org",
        "@type": "Store",
        name: store.name,
        url: `${BASE}/shop/${store.username}`,
        description: store.description,
        image: abs(store.logo) || `${BASE}/branding/logo-square.png`,
        email: store.email,
        telephone: store.contact || undefined,
        address: {
            "@type": "PostalAddress",
            streetAddress: store.address,
            addressCountry: "BD",
        },
    }
}
