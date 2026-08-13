'use client'
import Link from "next/link"
import { StoreIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/components/LanguageProvider"

export default function CreateStore() {

    const { data: session, status } = useSession()
    const { t } = useLanguage()

    const isAdmin = status === 'authenticated' && session.user.role === 'admin'

    return (
        <div className="min-h-[70vh] mx-6 flex flex-col items-center justify-center text-center">
            <StoreIcon size={48} className="text-slate-300 mb-5" />
            <h1 className="text-3xl font-semibold text-slate-700">{t('sellerRegistration')}</h1>
            <p className="max-w-lg mt-4 text-slate-500">
                {t('sellerNotice')}
            </p>
            <p className="max-w-lg mt-2 text-sm text-slate-400">
                {t('existingSeller')}
            </p>
            <div className="flex items-center gap-4 mt-8">
                <Link href="/login" className="bg-slate-800 text-white px-8 py-2.5 rounded-full text-sm hover:bg-slate-900 transition">{t('sellerLogin')}</Link>
                {isAdmin && (
                    <Link href="/admin/stores" className="border border-slate-300 text-slate-600 px-8 py-2.5 rounded-full text-sm hover:bg-slate-50 transition">{t('manageSellers')}</Link>
                )}
            </div>
        </div>
    )
}
