/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true
    },
    async headers() {
        // Prevent indexing of private / utility routes
        const noindex = [
            { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ]
        return [
            { source: '/admin/:path*', headers: noindex },
            { source: '/store/:path*', headers: noindex },
            { source: '/dashboard/:path*', headers: noindex },
            { source: '/cart', headers: noindex },
            { source: '/orders/:path*', headers: noindex },
            { source: '/order-confirmation', headers: noindex },
            { source: '/login', headers: noindex },
            { source: '/register', headers: noindex },
        ]
    },
};

export default nextConfig;
