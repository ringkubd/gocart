const BASE = "https://thedhakashop.com"

export function OrganizationSchema({ name = "theDhakaShop" }) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url: BASE,
        logo: `${BASE}/assets/gs_logo.jpg`,
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
        },
        sameAs: [],
    }
}

export function WebSiteSchema({ siteName = "theDhakaShop" }) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteName,
        url: BASE,
        potentialAction: {
            "@type": "SearchAction",
            target: `${BASE}/shop?search={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    }
}

export function ProductSchema({ product, currency = "USD" }) {
    const rating = product.rating || []
    const avg = rating.length
        ? (rating.reduce((s, r) => s + r.rating, 0) / rating.length).toFixed(1)
        : null

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images?.[0] ? (product.images[0].startsWith("http") ? product.images[0] : `${BASE}${product.images[0]}`) : `${BASE}/assets/product_img1.png`,
        description: product.description?.slice(0, 200),
        sku: product.id,
        brand: product.brand?.name ? { "@type": "Brand", name: product.brand.name } : undefined,
        category: product.category,
        offers: {
            "@type": "Offer",
            url: `${BASE}/product/${product.id}`,
            priceCurrency: currency,
            price: product.price,
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
        },
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
        image: store.logo || `${BASE}/assets/happy_store.webp`,
        email: store.email,
        address: {
            "@type": "PostalAddress",
            addressLocality: store.address?.split(",").pop()?.trim() || store.address,
            addressCountry: "BD",
        },
    }
}
