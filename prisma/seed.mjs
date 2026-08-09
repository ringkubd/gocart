import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const productSeeds = [
    { name: 'Modern table lamp', mrp: 40, price: 29, category: 'Decoration', images: ['/assets/product_img1.png', '/assets/product_img2.png', '/assets/product_img3.png', '/assets/product_img4.png'], desc: "Modern table lamp with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty." },
    { name: 'Smart speaker gray', mrp: 50, price: 29, category: 'Speakers', images: ['/assets/product_img2.png'], desc: "Smart speaker with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty." },
    { name: 'Smart watch white', mrp: 60, price: 29, category: 'Watch', images: ['/assets/product_img3.png'], desc: "Smart watch with a sleek design and premium build. Perfect for any occasion." },
    { name: 'Wireless headphones', mrp: 70, price: 29, category: 'Headphones', images: ['/assets/product_img4.png'], desc: "Wireless headphones delivering crystal-clear sound with 50 hours of uninterrupted playtime." },
    { name: 'Smart watch black', mrp: 49, price: 29, category: 'Watch', images: ['/assets/product_img5.png'], desc: "Premium black smart watch with advanced health tracking features." },
    { name: 'Security Camera', mrp: 59, price: 29, category: 'Camera', images: ['/assets/product_img6.png'], desc: "High-definition security camera for complete home protection." },
    { name: 'Smart Pen for iPad', mrp: 89, price: 29, category: 'Pen', images: ['/assets/product_img7.png'], desc: "Smart pen with palm rejection and tilt sensitivity for iPad." },
    { name: 'Home Theater', mrp: 99, price: 29, category: 'Theater', images: ['/assets/product_img8.png'], desc: "Immersive home theater system with booming surround sound." },
    { name: 'Apple Wireless Earbuds', mrp: 89, price: 29, category: 'Earbuds', images: ['/assets/product_img9.png'], desc: "Wireless earbuds with active noise cancellation and a compact charging case." },
    { name: 'Apple Smart Watch', mrp: 179, price: 29, category: 'Watch', images: ['/assets/product_img10.png'], desc: "Apple smart watch with fitness tracking, notifications and more." },
    { name: 'RGB Gaming Mouse', mrp: 39, price: 29, category: 'Mouse', images: ['/assets/product_img11.png'], desc: "RGB gaming mouse with programmable buttons and precise tracking." },
    { name: 'Smart Home Cleaner', mrp: 199, price: 149, category: 'Cleaner', images: ['/assets/product_img12.png'], desc: "Smart home cleaner robot that keeps your floors spotless automatically." },
]

async function main() {
    // Seed roles with permissions
    const adminPerms = [
        'dashboard', 'users', 'orders', 'products', 'brands', 'reviews', 'customers',
        'newsletter', 'stores', 'approve_stores', 'coupons', 'shipping', 'couriers',
        'payments', 'support', 'site_design', 'seo', 'settings',
    ]
    const sellerPerms = ['store', 'add_product', 'manage_product', 'store_orders', 'store_profile']
    const customerPerms = ['orders', 'addresses', 'profile', 'reviews']

    const roles = {
        admin: await prisma.role.upsert({ where: { name: 'admin' }, update: { label: 'Administrator', permissions: adminPerms, isSystem: true }, create: { name: 'admin', label: 'Administrator', permissions: adminPerms, isSystem: true } }),
        seller: await prisma.role.upsert({ where: { name: 'seller' }, update: { label: 'Seller', permissions: sellerPerms, isSystem: true }, create: { name: 'seller', label: 'Seller', permissions: sellerPerms, isSystem: true } }),
        user: await prisma.role.upsert({ where: { name: 'user' }, update: { label: 'Customer', permissions: customerPerms, isSystem: true }, create: { name: 'user', label: 'Customer', permissions: customerPerms, isSystem: true } }),
    }

    // Admin user
    const adminPass = await bcrypt.hash('Admin@12345', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@thedhakashop.com' },
        update: { role: 'admin', roleId: roles.admin.id, active: true },
        create: {
            name: 'The Dhaka Shop Admin',
            email: 'admin@thedhakashop.com',
            password: adminPass,
            role: 'admin',
            roleId: roles.admin.id,
            active: true,
            cart: {},
        },
    })

    // Default store (approved)
    const store = await prisma.store.upsert({
        where: { username: 'thedhakashop' },
        update: { status: 'approved', isActive: true },
        create: {
            userId: admin.id,
            name: 'The Dhaka Shop',
            username: 'thedhakashop',
            description: "The Dhaka Shop - your one-stop destination for electronics, lifestyle and everyday essentials at unbeatable prices.",
            address: 'Dhaka, Bangladesh',
            status: 'approved',
            isActive: true,
            logo: '/assets/happy_store.webp',
            email: 'support@thedhakashop.com',
            contact: '+880 1XXX-XXXXXX',
        },
    })

    // Seed products
    for (const p of productSeeds) {
        const existing = await prisma.product.findFirst({ where: { name: p.name } })
        if (!existing) {
            await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.desc,
                    mrp: p.mrp,
                    price: p.price,
                    images: p.images,
                    category: p.category,
                    inStock: true,
                    storeId: store.id,
                },
            })
        }
    }

    // Sample public coupon
    await prisma.coupon.upsert({
        where: { code: 'WELCOME10' },
        update: {},
        create: {
            code: 'WELCOME10',
            description: '10% off for new users',
            discount: 10,
            forNewUser: true,
            forMember: false,
            isPublic: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
    })

    // Seed categories
    const categorySeeds = [
        { name: 'Headphones', image: '/assets/product_img4.png' },
        { name: 'Speakers', image: '/assets/product_img2.png' },
        { name: 'Watch', image: '/assets/product_img3.png' },
        { name: 'Earbuds', image: '/assets/product_img9.png' },
        { name: 'Mouse', image: '/assets/product_img11.png' },
        { name: 'Camera', image: '/assets/product_img6.png' },
        { name: 'Home & Kitchen', image: '/assets/product_img12.png' },
        { name: 'Electronics', image: '/assets/product_img10.png' },
    ]
    for (const [index, c] of categorySeeds.entries()) {
        const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        await prisma.category.upsert({
            where: { name: c.name },
            update: {},
            create: {
                name: c.name,
                slug,
                image: c.image,
                active: true,
                sortOrder: index,
            },
        })
    }

    // Seed hero slides
    await prisma.heroSlide.deleteMany({})
    await prisma.heroSlide.createMany({
        data: [
            { title: 'Gadgets you\'ll love', subtitle: 'Discover the latest electronics at unbeatable prices.', image: '/assets/hero_product_img1.png', link: '/shop', buttonText: 'Shop Now', sortOrder: 1 },
            { title: 'Smart. Stylish. Yours.', subtitle: 'Premium smart watches & wearables for every lifestyle.', image: '/assets/hero_product_img2.png', link: '/shop', buttonText: 'Explore', sortOrder: 2 },
        ],
    })

    // Seed shipping methods
    await prisma.shippingMethod.deleteMany({})
    await prisma.shippingMethod.createMany({
        data: [
            { name: 'Inside Dhaka', cost: 60, deliveryTime: '1-2 days' },
            { name: 'Outside Dhaka', cost: 120, deliveryTime: '2-4 days' },
        ],
    })

    // Seed brands
    const brandSeeds = ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'Boat', 'Anker', 'JBL', 'Generic']
    const brands = {}
    for (const b of brandSeeds) {
        const slug = b.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const brand = await prisma.brand.upsert({
            where: { name: b },
            update: {},
            create: { name: b, slug, logo: '' },
        })
        brands[b] = brand.id
    }

    // Seed courier providers (inactive until admin adds API keys)
    await prisma.courierProvider.deleteMany({})
    const courierSeeds = [
        { name: 'Pathao', code: 'pathao' },
        { name: 'RedX', code: 'redx' },
        { name: 'Steadfast', code: 'steadfast' },
        { name: 'Paperfly', code: 'paperfly' },
        { name: 'eCourier', code: 'ecourier' },
    ]
    for (const c of courierSeeds) {
        await prisma.courierProvider.create({ data: { ...c, extra: {} } })
    }

    // Seed payment gateways (inactive until configured)
    await prisma.paymentGateway.deleteMany({})
    const gatewaySeeds = [
        { name: 'bKash', code: 'bkash' },
        { name: 'Nagad', code: 'nagad' },
        { name: 'SSLCommerz', code: 'sslcommerz' },
    ]
    for (const g of gatewaySeeds) {
        await prisma.paymentGateway.create({ data: { ...g, extra: {} } })
    }

    // Assign brands to products (round-robin)
    const allProducts = await prisma.product.findMany()
    const brandIds = Object.values(brands)
    for (const [index, p] of allProducts.entries()) {
        await prisma.product.update({
            where: { id: p.id },
            data: { brandId: brandIds[index % brandIds.length] },
        })
    }

    // Seed site settings
    const settings = {
        siteName: 'theDhakaShop',
        tagline: 'Shop smarter',
        currency: '$',
        defaultCurrency: 'USD',
        promoStrip: { text: 'Get 10% OFF on Your First Order!', couponCode: 'WELCOME10', active: true },
        announcement: { active: false, text: '' },
        newsletter: { active: true, title: 'Join Newsletter', description: 'Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week.' },
        ourSpecs: [
            { title: 'Free & Fast Delivery', description: 'Free shipping on orders over a threshold, delivered quickly across Bangladesh.', icon: 'truck', accent: '#16a34a' },
            { title: 'Secure Payments', description: 'Cash on delivery, bKash, Nagad and more — your payments are safe with us.', icon: 'shield', accent: '#2563eb' },
            { title: '24/7 Support', description: 'Our support team is here to help you anytime via live chat and tickets.', icon: 'support', accent: '#9333ea' },
        ],
        contact: { email: 'support@thedhakashop.com', phone: '+880 1XXX-XXXXXX', address: 'Dhaka, Bangladesh' },
        currencies: [
            { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
            { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 110 },
            { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83 },
            { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
            { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
        ],
        footer: {
            about: 'The Dhaka Shop is your one-stop destination for electronics, lifestyle and everyday essentials at unbeatable prices.',
            social: { facebook: '#', instagram: '#', twitter: '#', youtube: '#' },
            links: { Shop: '/shop', Orders: '/orders', 'Become a Seller': '/create-store' },
        },
    }
    for (const [key, value] of Object.entries(settings)) {
        await prisma.siteSetting.upsert({
            where: { key },
            update: {},
            create: { key, value },
        })
    }

    // Assign roles to existing users that don't have one yet
    const users = await prisma.user.findMany()
    for (const u of users) {
        if (!u.roleId) {
            const roleName = u.role === 'admin' ? 'admin' : (u.store ? 'seller' : 'user')
            await prisma.user.update({
                where: { id: u.id },
                data: { roleId: roles[roleName].id, active: true },
            })
        }
    }

    console.log('Seed complete. Admin:', admin.email, '/ Admin@12345')
    console.log('Store:', store.username)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
