'use client'
import { UserXIcon } from "lucide-react"

// Prominent mark to show an order was placed via guest checkout (no login).
// Guest orders may still have a linked user (auto-created account), so we
// detect guest checkout by the presence of guest contact info.
export default function GuestBadge({ order }) {
    const isGuest = Boolean(order?.guestName || order?.guestEmail || order?.guestPhone)
    if (!isGuest) return null
    return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            <UserXIcon size={12} />
            Guest Checkout
        </span>
    )
}
