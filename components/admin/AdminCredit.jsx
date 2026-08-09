import Link from "next/link"

// Developer credit — intentionally persistent on the admin dashboard
export default function AdminCredit() {
    return (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-800/95 backdrop-blur border-t border-slate-700">
            <div className="max-w-full px-4 py-1.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <span>Developed by</span>
                <Link
                    href="https://anwarjahid.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-green-400 hover:text-green-300 hover:underline transition"
                >
                    MD ANWAR JAHID
                </Link>
                <span className="text-slate-600">·</span>
                <Link
                    href="https://anwarjahid.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-300 hover:underline transition"
                >
                    anwarjahid.com
                </Link>
            </div>
        </div>
    )
}
