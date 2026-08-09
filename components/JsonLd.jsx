export default function JsonLd({ data }) {
    const json = Array.isArray(data)
        ? JSON.stringify({ "@context": "https://schema.org", "@graph": data })
        : JSON.stringify({ "@context": "https://schema.org", ...data })

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
        />
    )
}
