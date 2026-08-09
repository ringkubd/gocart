'use client'
import { useState } from "react"

export default function MessengerWidget({ fbSettings }) {

    const [open, setOpen] = useState(false)

    const messengerEnabled = fbSettings?.messengerEnabled && fbSettings?.messengerPageId
    const pageUrl = fbSettings?.pageUrl

    if (!messengerEnabled && !pageUrl) return null

    const messengerLink = fbSettings?.messengerPageId
        ? `https://m.me/${fbSettings.messengerPageId}`
        : pageUrl

    const handleMessengerClick = () => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('trackCustom', 'MessengerClick')
        }
        window.open(messengerLink, '_blank')
        setOpen(false)
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {open && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-72 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                        <p className="font-semibold text-sm">theDhakaShop</p>
                        <p className="text-xs opacity-90">We usually reply within a few minutes</p>
                    </div>
                    <div className="p-4">
                        <p className="text-sm text-slate-600 mb-3">Chat with us on Facebook Messenger</p>
                        {pageUrl && (
                            <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="block w-full mb-2 text-center bg-slate-100 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-200 transition">
                                Visit our Facebook Page
                            </a>
                        )}
                        {messengerEnabled && (
                            <button onClick={handleMessengerClick} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                                Open Messenger
                            </button>
                        )}
                    </div>
                </div>
            )}
            <button
                onClick={() => setOpen(!open)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition"
                aria-label="Chat with us"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.6 7.2V22l3.3-1.8c1 .3 2 .4 3.1.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2zm5.4 6.9l-2.7 4.3c-.4.6-1.2.7-1.8.3l-2.4-1.8-2.6 1.8c-.5.3-1.1-.1-.9-.7l2.7-4.3c.4-.6 1.2-.7 1.8-.3l2.4 1.8 2.6-1.8c.5-.3 1.1.1.9.7z" />
                </svg>
            </button>
        </div>
    )
}
