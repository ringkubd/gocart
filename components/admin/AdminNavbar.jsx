'use client'
import Link from "next/link"
import { Globe } from "lucide-react"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/components/LanguageProvider"

const AdminNavbar = () => {

    const { data: session } = useSession()
    const { t, lang, changeLanguage } = useLanguage()

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">theDhaka</span><span className="text-slate-700">Shop</span><span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-3">
                <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">{t('viewStore')}</Link>
                {/* Admin dashboard language switcher (independent of website) */}
                <div className="flex items-center gap-1 border border-slate-200 rounded-full p-1">
                    <Globe size={14} className="text-slate-400" />
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`text-xs px-2 py-1 rounded-full transition ${lang === 'en' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => changeLanguage('bn')}
                        className={`text-xs px-2 py-1 rounded-full transition ${lang === 'bn' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        বাংলা
                    </button>
                </div>
                <p className="text-slate-600 font-medium">{session?.user?.name || 'Admin'}</p>
            </div>
        </div>
    )
}

export default AdminNavbar
