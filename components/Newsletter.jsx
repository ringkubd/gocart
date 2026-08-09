'use client'
import React from 'react'
import Title from './Title'
import toast from 'react-hot-toast'
import useStorefrontData from './useStorefrontData'

const Newsletter = () => {

    const { settings } = useStorefrontData()
    const nl = settings.newsletter || {}

    const [email, setEmail] = React.useState('')
    const [submitting, setSubmitting] = React.useState(false)

    // If newsletter section is disabled from admin, don't render
    if (nl.active === false) return null

    const title = nl.title || 'Join Newsletter'
    const description = nl.description || 'Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week.'

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (submitting) return
        setSubmitting(true)
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to subscribe')
            toast.success('Subscribed successfully!')
            setEmail('')
        } catch (error) {
            toast.error(error.message || 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='flex flex-col items-center mx-4 my-36'>
            <Title title={title} description={description} visibleButton={false} />
            <form onSubmit={handleSubmit} className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className='flex-1 pl-5 outline-none bg-transparent' placeholder='Enter your email address' />
                <button type="submit" disabled={submitting} className='font-medium bg-green-500 text-white px-7 py-3 rounded-full hover:scale-103 active:scale-95 transition disabled:opacity-50'>
                    {submitting ? 'Subscribing...' : 'Get Updates'}
                </button>
            </form>
        </div>
    )
}

export default Newsletter
