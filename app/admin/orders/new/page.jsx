'use client'
import ManualOrderForm from "@/components/ManualOrderForm"
import { useLanguage } from "@/components/LanguageProvider"
import { useRouter } from "next/navigation"

export default function AdminNewOrder() {
    const { t } = useLanguage()
    const router = useRouter()
    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">{t('orderManagement')} — Manual Order</h1>
            <p className="text-sm text-slate-400 mt-1">Create an order for phone / messenger buyers.</p>
            <div className="mt-6">
                <ManualOrderForm
                    mode="admin"
                    submitUrl="/api/admin/orders"
                    onCreated={(order) => router.push('/admin/orders/' + order.id)}
                />
            </div>
        </div>
    )
}
