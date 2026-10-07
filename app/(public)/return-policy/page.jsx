import Link from "next/link"

export const metadata = {
    title: "Return & Refund Policy",
    description:
        "Read The Dhaka Shop's Return & Refund Policy — eligibility, conditions, unboxing video requirement, warranty, refunds, delivery charges, cancellations and how to request a return.",
    alternates: { canonical: "https://thedhakashop.com/return-policy" },
    openGraph: {
        title: "Return & Refund Policy | The Dhaka Shop",
        description:
            "Return eligibility, conditions, refunds, warranty and how to request a return at The Dhaka Shop.",
        url: "https://thedhakashop.com/return-policy",
        type: "website",
    },
}

export default function ReturnPolicyPage() {
    return (
        <div className="mx-auto max-w-3xl my-16 mb-28 px-6 text-slate-600">
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-800">Return &amp; Refund Policy</h1>
            <p className="text-sm text-slate-400 mt-2">Effective Date: October 2026</p>

            <p className="mt-6 leading-relaxed">
                At <strong className="text-slate-700">The Dhaka Shop</strong>, we want you to be satisfied with your
                purchase. If you receive a damaged, defective, incorrect, or incomplete product, we will work with you
                to resolve the issue fairly and quickly.
            </p>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">1. Return Eligibility</h2>
                <p className="mt-3">A product may be eligible for return or replacement if:</p>
                <ul className="mt-3 list-disc pl-6 space-y-1.5">
                    <li>You received the wrong product.</li>
                    <li>The product is damaged during delivery.</li>
                    <li>The product has a manufacturing defect.</li>
                    <li>The product is missing parts or accessories.</li>
                    <li>The product does not match the product description in a significant way.</li>
                </ul>
                <p className="mt-3">
                    Please contact us within <strong className="text-slate-700">48 hours</strong> of receiving the order
                    for damaged, incorrect, or defective products.
                </p>
                <p className="mt-3">
                    For warranty-related issues, the applicable manufacturer or seller warranty period will apply.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">2. Conditions for Return</h2>
                <p className="mt-3">To qualify for a return:</p>
                <ul className="mt-3 list-disc pl-6 space-y-1.5">
                    <li>The product must be unused or in its original condition, where applicable.</li>
                    <li>The original packaging should be preserved.</li>
                    <li>All accessories, manuals, warranty cards, tags, and other included items should be returned.</li>
                    <li>You may be required to provide photos or videos showing the problem.</li>
                    <li>The order number and purchase details must be provided.</li>
                </ul>
                <p className="mt-3">Products returned without prior approval may not be accepted.</p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">3. Unboxing Video</h2>
                <p className="mt-3">
                    For electronics, electrical products, computers, mobile phones, fragile products, and other
                    high-value items, we strongly recommend recording a continuous unboxing video immediately after
                    receiving the package.
                </p>
                <p className="mt-3">The video should clearly show:</p>
                <ol className="mt-3 list-decimal pl-6 space-y-1.5">
                    <li>The sealed package.</li>
                    <li>The shipping label.</li>
                    <li>The opening of the package.</li>
                    <li>The product and accessories.</li>
                </ol>
                <p className="mt-3">
                    This helps us investigate claims involving shipping damage, missing items, or incorrect products.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">4. Products That Cannot Normally Be Returned</h2>
                <p className="mt-3">
                    For hygiene, safety, licensing, or product-condition reasons, certain products may not be returnable
                    unless they are defective, damaged, or incorrectly supplied.
                </p>
                <p className="mt-3">These may include:</p>
                <ul className="mt-3 list-disc pl-6 space-y-1.5">
                    <li>Used electrical products</li>
                    <li>Installed electrical equipment</li>
                    <li>Opened software or activation keys</li>
                    <li>Downloadable/digital products</li>
                    <li>Customized or specially ordered products</li>
                    <li>Used personal-care products</li>
                    <li>Opened food or grocery products</li>
                    <li>Products damaged through misuse, incorrect installation, or negligence</li>
                    <li>Products without required original accessories or packaging</li>
                </ul>
                <p className="mt-3">
                    Specific return conditions may vary by product category and will be mentioned on the product page
                    where applicable.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">5. Change of Mind</h2>
                <p className="mt-3">
                    We generally do not accept returns simply because a customer has changed their mind, ordered the
                    wrong product, or no longer needs the product.
                </p>
                <p className="mt-3">
                    However, certain unused products may be eligible for an exchange at our discretion, subject to
                    product-specific conditions and applicable delivery/handling charges.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">6. Wrong or Damaged Product</h2>
                <p className="mt-3">If you receive a wrong or visibly damaged product:</p>
                <p className="mt-3">
                    Please contact us within <strong className="text-slate-700">48 hours</strong>.
                </p>
                <p className="mt-3">Send us:</p>
                <ul className="mt-3 list-disc pl-6 space-y-1.5">
                    <li>Order number</li>
                    <li>Customer name</li>
                    <li>Phone number</li>
                    <li>Photos of the package</li>
                    <li>Photos/videos of the product</li>
                    <li>Description of the issue</li>
                </ul>
                <p className="mt-3">After reviewing the claim, we may arrange:</p>
                <p className="mt-3">
                    <strong className="text-slate-700">Replacement → Exchange → Refund</strong>
                </p>
                <p className="mt-3">depending on product availability and the circumstances.</p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">7. Warranty</h2>
                <p className="mt-3">
                    Some products sold by The Dhaka Shop may include a manufacturer, distributor, or seller warranty.
                </p>
                <p className="mt-3">
                    Warranty coverage depends on the individual product and will be stated on the product page, invoice,
                    or warranty documentation.
                </p>
                <p className="mt-3">Warranty generally does not cover:</p>
                <ul className="mt-3 list-disc pl-6 space-y-1.5">
                    <li>Physical damage</li>
                    <li>Water/liquid damage</li>
                    <li>Burn damage caused by incorrect voltage</li>
                    <li>Damage caused by incorrect installation</li>
                    <li>Unauthorized repair or modification</li>
                    <li>Normal wear and tear</li>
                    <li>Damage caused by misuse</li>
                </ul>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">8. Refunds</h2>
                <p className="mt-3">
                    If a refund is approved, the refund amount will depend on the circumstances of the return.
                </p>
                <p className="mt-3">
                    Refunds may be processed through the original payment method or another mutually agreed method.
                </p>
                <p className="mt-3">
                    For Cash on Delivery orders, customers may be required to provide accurate bank/mobile financial
                    service details for the refund.
                </p>
                <p className="mt-3">
                    Refund processing time may vary depending on the payment method and financial institution.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">9. Delivery Charges</h2>
                <p className="mt-3">Where the return is caused by an error on our part, such as:</p>
                <ul className="mt-3 list-disc pl-6 space-y-1.5">
                    <li>Wrong product sent</li>
                    <li>Product damaged before delivery</li>
                    <li>Confirmed manufacturing defect</li>
                </ul>
                <p className="mt-3">
                    The applicable return/replacement delivery cost will generally be handled by The Dhaka Shop.
                </p>
                <p className="mt-3">
                    Where a return is approved for another reason, the customer may be responsible for applicable
                    delivery or handling costs.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">10. Order Cancellation</h2>
                <p className="mt-3">
                    Orders may be cancelled before dispatch, subject to order status.
                </p>
                <p className="mt-3">Once an order has been shipped, cancellation may no longer be possible.</p>
                <p className="mt-3">
                    If the customer refuses delivery after dispatch without a valid reason, applicable delivery or
                    return costs may be charged where appropriate.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-slate-800">11. How to Request a Return</h2>
                <p className="mt-3">Contact The Dhaka Shop through:</p>
                <ul className="mt-3 list-disc pl-6 space-y-1.5">
                    <li>
                        Website: <Link href="/" className="text-green-600 hover:underline">thedhakashop.com</Link>
                    </li>
                    <li>
                        Email: <a href="mailto:support@thedhakashop.com" className="text-green-600 hover:underline">support@thedhakashop.com</a>
                    </li>
                    <li>
                        Phone/WhatsApp: <a href="tel:+8801700000000" className="text-green-600 hover:underline">[Your Business Number]</a>
                    </li>
                </ul>
                <p className="mt-3">Please include:</p>
                <p className="mt-3">
                    <strong className="text-slate-700">Order Number + Product Name + Reason for Return + Photos/Videos</strong>
                </p>
                <p className="mt-3">
                    Our customer support team will review your request and provide the next steps.
                </p>
            </section>
        </div>
    )
}
