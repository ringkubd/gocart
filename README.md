<div align="center">
  <h1><img src="https://thedhakashop.com/favicon.ico" width="20" height="20" alt="theDhakaShop Favicon">
   theDhakaShop</h1>
  <p>
    A complete multi-vendor e-commerce platform built with Next.js, MySQL and Tailwind CSS — live at
    <a href="https://thedhakashop.com">thedhakashop.com</a>.
  </p>
  <p>
    <a href="https://github.com/ringkubd/gocart/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/ringkubd/gocart?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/ringkubd/gocart/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome"></a>
    <a href="https://github.com/ringkubd/gocart/issues"><img src="https://img.shields.io/github/issues/ringkubd/gocart?style=for-the-badge" alt="GitHub issues"></a>
  </p>
</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🏗️ Deployment](#-deployment)
- [🔐 Default Credentials](#-default-credentials)
- [🙏 Acknowledgments](#-acknowledgments)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Features

### Storefront
- Product catalog with **brands & categories**, search and filters
- Product detail pages with gallery, reviews, shipping info and **brand badges**
- Add-to-cart from every product card (quick-add button)
- Checkout with **COD + payment gateways** (bKash, Nagad, SSLCommerz), coupons & shipping methods
- Currency switcher (USD, BDT, INR, EUR, GBP) with auto-detected location
- Real-time **support chat** via websocket (Soketi/Pusher)

### Admin Panel
- Dashboard with revenue, orders, top products/stores, status breakdown
- **Order management** with delivery tracking & courier assignment
- **Product & brand management**, category management
- Customer management, **review moderation**, newsletter subscribers
- **Seller management** (admin creates sellers — no public signup)
- Coupons, shipping methods, **courier integrations** (Pathao, RedX, Steadfast, Paperfly, eCourier)
- **Payment gateway config** (bKash, Nagad, SSLCommerz)
- Support ticket inbox with live chat
- Site design (hero slider, promo strip, categories, footer), **SEO control** & settings

### Professional SEO
- Sitemap index + **product-wise sub-sitemaps** (auto-generated)
- JSON-LD structured data (Product, Organization, WebSite, Breadcrumb, Store)
- `llms.txt` (AI-friendly index) + AI-crawler controls in `robots.txt`
- Google Merchant Center product feed (`/feed/google.xml`)
- Per-page meta control, canonical URLs, GA4 / Search Console integration

### Customer Dashboard
- Order history, saved addresses, profile & password management

## 🛠️ Tech Stack <a name="-tech-stack"></a>

- **Framework:** Next.js 15 (App Router)
- **Database:** MySQL + Prisma ORM
- **Auth:** NextAuth (credentials)
- **Real-time:** Soketi (Pusher-compatible websocket)
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit
- **Charts:** Recharts
- **Deployment:** pm2 + HestiaCP (nginx proxy)

## 🚀 Getting Started <a name="-getting-started"></a>

First, install the dependencies. We recommend using `npm` for this project.

```bash
npm install
```

Set up your environment variables (see `.env.example`):

```bash
cp .env.example .env
# edit .env with your database URL, auth secret, soketi credentials
```

Set up the database and seed demo data:

```bash
npx prisma db push
npm run seed
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Deployment <a name="-deployment"></a>

Production build:

```bash
npm run build
npm start -p 3010
```

On HestiaCP, serve with pm2 and point the domain's nginx proxy template (`nextjs`) to port 3010.

## 🔐 Default Credentials <a name="-default-credentials"></a>

After seeding, the admin account is:

- **Email:** `admin@thedhakashop.com`
- **Password:** `Admin@12345`

> Change the password immediately after first login.

## 🙏 Acknowledgments <a name="-acknowledgments"></a>

This project is built on top of **[GoCart](https://github.com/GreatStackDev/goCart)** — an open-source multi-vendor e-commerce template originally created by **GreatStackDev** ([github.com/GreatStackDev](https://github.com/GreatStackDev), [gocart-gs.vercel.app](https://gocart-gs.vercel.app)).

We are grateful to the original developers for their excellent work. The original GoCart template (Next.js + Tailwind CSS, MIT licensed) was extended into the theDhakaShop platform with:

- A full MySQL + Prisma backend (products, brands, orders, checkout, reviews, coupons)
- Admin, seller, and customer dashboards wired to real data
- Courier integrations, payment gateways, real-time support chat, and professional SEO

> This project is a modified version of the original GoCart template. If you like GoCart, please consider starring and supporting the original project: **[GreatStackDev/goCart](https://github.com/GreatStackDev/goCart)** ⭐

## 🤝 Contributing <a name="-contributing"></a>

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for more details on how to get started.

## 📜 License <a name="-license"></a>

This project is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file for details.
