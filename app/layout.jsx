import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import SessionWrapper from "@/components/SessionWrapper";
import ProductsLoader from "@/components/ProductsLoader";
import CurrencyProvider from "@/components/CurrencyProvider";
import MessengerWidget from "@/components/MessengerWidget";
import { getGlobalSeo } from "@/lib/seo";
import { OrganizationSchema, WebSiteSchema } from "@/lib/jsonld";
import JsonLd from "@/components/JsonLd";
import { LanguageProvider } from "@/components/LanguageProvider";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export async function generateMetadata() {
    const seo = await getGlobalSeo()

    // Load favicon + site logo settings (fallback to defaults)
    let favicon = "/favicon.ico"
    let siteLogo = ""
    try {
        const [favSetting, logoSetting] = await Promise.all([
            prisma.siteSetting.findUnique({ where: { key: "siteFavicon" } }),
            prisma.siteSetting.findUnique({ where: { key: "siteLogo" } }),
        ])
        if (favSetting?.value) favicon = favSetting.value
        if (logoSetting?.value) siteLogo = logoSetting.value
    } catch (error) {
        // ignore
    }

    return {
        title: {
            default: seo.title,
            template: `%s | ${seo.siteName}`,
        },
        description: seo.description,
        keywords: seo.keywords,
        metadataBase: new URL("https://thedhakashop.com"),
        alternates: { canonical: "/" },
        icons: {
            icon: favicon,
            shortcut: favicon,
            apple: favicon,
        },
        openGraph: {
            type: "website",
            siteName: seo.siteName,
            title: seo.title,
            description: seo.description,
            url: "https://thedhakashop.com",
            images: [{ url: siteLogo || seo.ogImage }],
        },
        twitter: {
            card: "summary_large_image",
            title: seo.title,
            description: seo.description,
            images: [siteLogo || seo.ogImage],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    }
}

export default async function RootLayout({ children }) {
    let pixelId = ""
    let fbSettings = null
    let googleVerification = ""
    let gtmMeasurementId = ""

    try {
        const setting = await prisma.siteSetting.findUnique({ where: { key: "facebook" } })
        if (setting && setting.value?.pixelId) {
            pixelId = setting.value.pixelId
        }
        if (setting && setting.value) {
            fbSettings = setting.value
        }

        const googleSetting = await prisma.siteSetting.findUnique({ where: { key: "googleConfig" } })
        if (googleSetting?.value) {
            googleVerification = googleSetting.value.googleVerification || ""
            gtmMeasurementId = googleSetting.value.measurementId || ""
        }
    } catch (error) {
        // ignore
    }

    const seo = await getGlobalSeo()
    const orgSchema = OrganizationSchema({ name: seo.siteName })
    const siteSchema = WebSiteSchema({ siteName: seo.siteName })

    const pixelScript = pixelId
        ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`
        : ""
    const noscriptHtml = pixelId
        ? '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=' + pixelId + '&ev=PageView&noscript=1"/>'
        : ""

    const ga4Script = gtmMeasurementId
        ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmMeasurementId}');`
        : ""

    return (
        <html lang="en">
            <head>
                {googleVerification && (
                    <meta name="google-site-verification" content={googleVerification} />
                )}
                {pixelId && (
                    <script dangerouslySetInnerHTML={{ __html: pixelScript }} />
                )}
                {pixelId && (
                    <noscript dangerouslySetInnerHTML={{ __html: noscriptHtml }} />
                )}
                {gtmMeasurementId && (
                    <script dangerouslySetInnerHTML={{ __html: ga4Script }} />
                )}
            </head>
            <body className={`${outfit.className} antialiased`}>
                <JsonLd data={[orgSchema, siteSchema]} />
                <LanguageProvider>
                <SessionWrapper>
                    <StoreProvider>
                        <ProductsLoader />
                        <CurrencyProvider />
                        <Toaster />
                        {children}
                        <MessengerWidget fbSettings={fbSettings} />
                    </StoreProvider>
                </SessionWrapper>
                </LanguageProvider>
            </body>
        </html>
    );
}
