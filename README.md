<div align="center">
  <h1><img src="https://thedhakashop.com/favicon.ico" width="20" height="20" alt="theDhakaShop Favicon">
   theDhakaShop</h1>
  <p>
    A complete multi-vendor e-commerce platform built with Next.js, MySQL and Tailwind CSS.
  </p>
  <p>
    <a href="https://thedhakashop.com"><strong>Live Demo</strong></a> · 
    <a href="https://gocart-hazel-two.vercel.app/">Vercel Preview</a> · 
    <a href="https://github.com/ringkubd/gocart">GitHub</a>
  </p>
  <p>
    <a href="https://github.com/ringkubd/gocart/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/ringkubd/gocart?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/ringkubd/gocart/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome"></a>
    <a href="https://github.com/ringkubd/gocart/issues"><img src="https://img.shields.io/github/issues/ringkubd/gocart?style=for-the-badge" alt="GitHub issues"></a>
  </p>
</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Default Credentials](#default-credentials)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## Features

### Multi-Vendor Storefront
- **Product catalog** with brands, categories, search and filters
- **Multi-variant products** — Amazon/AliExpress style (Color, Size, Storage etc.) with per-variant SKU, price, stock, and image
- Product detail pages with gallery, reviews, shipping info, brand badges, and **Free Delivery badge**
- **Add-to-cart** from product cards (quick-add) and detail page with variant selector
- **Cart persistence** via localStorage (survives page refresh)
- Checkout with **COD + online gateways** (bKash, Nagad, SSLCommerz), coupons & shipping methods
- **Guest checkout** (email optional) with auto-account creation
- **Free delivery system** — per-product `freeDelivery` flag, `minQtyForFree`, `deliveryDiscount`, global minimum order free delivery rules
- Currency switcher (BDT, USD, INR, EUR, GBP) with auto-detected location
- **Multi-language** support (English / বাংলা) with separate language selection per area (website, store, admin)
- **Product-specific live chat** — customers can chat with store owners about specific products directly from the product page

### Product-Specific Live Chat
- **Floating chat widget** on product pages — 💬 button opens chat window
- **Guest support** — Name + Phone required for visitors, logged-in users use existing info
- **Visitor identity persistence** — UUID stored in localStorage, resumes conversations across sessions
- **Real-time messaging** via Soketi (Pusher-compatible WebSocket)
- **Store dashboard** — "Product Chats" page shows all product conversations with unread badges
- **Admin dashboard** — "Product Chats" tab shows all product chats across all stores, admin can reply
- **Auto-close** conversations after 7 days of inactivity
- Role-based message colors: blue (admin), green (seller), white (customer)

### Order Management
- **Order numbering** (YYYY-NNNNNN format)
- **Status tracking** with history timeline (Order Placed → Processing → Shipped → Delivered)
- **Courier assignment** with tracking number
- **Customer notes** visible in order detail
- **Invoice** — printable, clean design (no browser header/footer), accessible from order history
- **Store-wise orders** — store owners see only their orders, can update status and tracking
- **Multi-variant order items** — variant attributes shown in all order views

### Admin Panel
- Dashboard with revenue charts, orders, top products/stores, status breakdown
- **Order management** with status changes, delivery tracking & courier assignment
- **Product management** — add/edit/delete, variant builder, featured toggle
- **Multi-variant admin** — variant matrix (SKU, price, stock, image per combination)
- Brand management, category management (with inline create)
- **Seller management** — admin creates sellers (no public signup), store approval workflow
- Customer management, review moderation, newsletter subscribers
- Coupons, shipping methods, courier integrations (Pathao, RedX, Steadfast, Paperfly, eCourier)
- **Payment gateway config** (bKash, Nagad, SSLCommerz)
- **Product chat inbox** — view and reply to all product-specific conversations
- Support ticket inbox with live chat
- **Site design** — hero slider, side cards, promo strip, announcement bar, categories marquee, our specs, footer — all admin-controllable
- **SEO control** — per-page meta, AI crawler controls, Google Merchant feed
- **Settings** — site name, logo, favicon, currencies, delivery rules, Facebook pixel

### Store Dashboard
- Dashboard with revenue chart, orders, products, ratings
- **Add/edit products** with variant builder (option groups + variant matrix)
- **Product management** — stock toggle, edit, delete
- **Order management** — view orders, update status, delivery tracking
- **Product Chats** — real-time chat with customers about specific products
- Store profile — name, description, logo, contact, **social sharing settings** (enable/disable share & messenger per store)

### Customer Dashboard
- Order history with status badges and tracking info
- **Invoice** — printable per-order invoice
- Saved addresses — **add, edit, delete** (with Division/Post Code fields)
- Profile & password management

### Professional SEO
- Sitemap index + product-wise sub-sitemaps (auto-generated)
- JSON-LD structured data (Product, Organization, WebSite, Breadcrumb, Store)
- `llms.txt` (AI-friendly index) + AI-crawler controls in `robots.txt`
- Google Merchant Center product feed (`/feed/google.xml`)
- Per-page meta control, canonical URLs, GA4 / Search Console integration
- Open Graph tags with dynamic product images

### Homepage Customization (Admin)
- **Hero slider** — add/edit/delete/toggle slides with title, subtitle, image, button text, link
- **Side cards** — two cards next to carousel (title, image, background color, link) — admin configurable
- **Promo strip** — gradient bar with coupon code claim button
- **Announcement bar** — dark bar above promo strip
- **Categories marquee** — auto-scrolling category chips from database
- **Our Specifications** — homepage feature cards (icon, title, description, accent color)
- **Footer** — about text, social media links — all admin-editable

### Developer Credit
- Credit bar in admin layout: MD ANWAR JAHID, anwarjahid.com

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MySQL + Prisma ORM
- **Auth:** NextAuth (credentials, JWT)
- **Real-time:** Soketi (Pusher-compatible WebSocket)
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit
- **Charts:** Recharts
- **Deployment:** pm2 + HestiaCP (nginx proxy)
- **i18n:** Custom EN/BN translation system (354+ keys)
- **Images:** Local file upload with `/api/upload`

---

## Getting Started

First, install the dependencies:

```bash
npm install
```

Set up your environment variables:

```bash
cp .env.example .env
# edit .env with your database URL, auth secret, soketi credentials
```

Set up the database:

```bash
npx prisma db push
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Deployment

Production build:

```bash
rm -rf .next
npm run build
sudo -u thedhakashop pm2 restart gocart
```

On HestiaCP, serve with pm2 and point the domain's nginx proxy template (`nextjs`) to port 3010.

---

## Default Credentials

After setup, the admin account is:

- **Email:** `admin@thedhakashop.com`
- **Password:** `Admin@12345`

> Change the password immediately after first login.

---

## Environment Variables

See `.env.example` for the full list. Key variables:

```
DATABASE_URL          # MySQL connection string
NEXTAUTH_SECRET       # Auth secret
SOKETI_APP_ID         # Soketi WebSocket app ID
SOKETI_APP_KEY        # Soketi WebSocket public key
SOKETI_APP_SECRET     # Soketi WebSocket secret
SOKETI_HOST           # WebSocket server host
```

---

## Database Schema

Key models:

- **Product** — with `hasVariants`, `options` (JSON), delivery settings
- **ProductVariant** — per-variant SKU, price, stock, image, attributes (JSON)
- **Order** — order numbering, status tracking, coupon support
- **OrderItem** — with optional `variantId` link
- **Store** — multi-vendor stores with social/messenger settings
- **SupportTicket** — product-specific chats with `productId`, `visitorId`
- **SupportMessage** — real-time messages with `senderRole` (user/admin/seller)
- **HeroSlide** — admin-managed homepage carousel
- **SiteSetting** — key-value store for all admin settings

---

## Project Structure

```
gocart/
├── app/
│   ├── (public)/          # Storefront pages (home, shop, product, cart, checkout)
│   ├── admin/             # Admin panel (orders, products, stores, support, settings)
│   ├── store/             # Store dashboard (products, orders, chats, profile)
│   ├── dashboard/         # Customer dashboard (orders, addresses, invoice)
│   └── api/               # API routes
├── components/
│   ├── ProductChatWidget  # Floating chat widget for product pages
│   ├── ChatWindow         # Reusable chat UI component
│   ├── VariantBuilder     # Admin/store variant management UI
│   ├── OrderSummary       # Checkout summary with delivery calculation
│   ├── ProductDetails     # Product detail with variant selector
│   ├── Hero               # Homepage hero with carousel + side cards
│   ├── useVisitorIdentity # Visitor identity hook (localStorage)
│   └── useTicketChannel   # WebSocket hook for real-time chat
├── lib/
│   ├── prisma.js          # Prisma client
│   ├── soketi.js          # WebSocket server-side push
│   ├── i18n/              # Translation system (EN/BN)
│   ├── features/          # Redux slices (cart, product, address, currency)
│   └── seo.js             # SEO defaults and page config
└── prisma/
    └── schema.prisma      # Database schema
```

---

## Acknowledgments

This project is built on top of **[GoCart](https://github.com/GreatStackDev/goCart)** — an open-source multi-vendor e-commerce template originally created by **GreatStackDev** ([github.com/GreatStackDev](https://github.com/GreatStackDev), [gocart-gs.vercel.app](https://gocart-gs.vercel.app)).

We are grateful to the original developers for their excellent work. The original GoCart template was extended into the theDhakaShop platform with multi-variant products, live chat, professional SEO, and comprehensive admin/store dashboards.

> If you like GoCart, please consider starring the original project: **[GreatStackDev/goCart](https://github.com/GreatStackDev/goCart)** ⭐

---

## License

This project is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file for details.
