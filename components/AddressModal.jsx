'use client'
import { XIcon, MapPinIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { addAddress } from "@/lib/features/address/addressSlice"

const AddressModal = ({ setShowAddressModal }) => {

    const dispatch = useDispatch()

    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    })
    const [locating, setLocating] = useState(false)

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    // Auto-detect customer location using browser geolocation + free OpenStreetMap (Nominatim) reverse geocoding
    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser')
            return
        }

        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`
                    )
                    const data = await res.json()
                    const a = data.address || {}

                    const street = [
                        a.road || a.pedestrian || a.neighbourhood || '',
                        a.house_number || '',
                    ].filter(Boolean).join(', ')

                    setAddress((prev) => ({
                        ...prev,
                        street: street || prev.street,
                        city: a.city || a.town || a.village || a.county || prev.city,
                        state: a.state || a.county || prev.state,
                        zip: a.postcode || prev.zip,
                        country: a.country || prev.country,
                    }))
                    toast.success('Location detected')
                } catch (error) {
                    toast.error('Could not determine your full location. Please enter it manually.')
                } finally {
                    setLocating(false)
                }
            },
            () => {
                setLocating(false)
                toast.error('Location permission denied. Please enter your address manually.')
            },
            { timeout: 10000 }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(address),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save address')
            }

            dispatch(addAddress(data.address))
            toast.success('Address added')
            setShowAddressModal(false)
        } catch (error) {
            toast.error(error.message || 'Something went wrong')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center">
            <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6">
                <h2 className="text-3xl ">Add New <span className="font-semibold">Address</span></h2>
                <button type="button" onClick={detectLocation} disabled={locating} className="flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded p-2.5 text-sm font-medium hover:bg-green-100 transition disabled:opacity-60">
                    <MapPinIcon size={16} /> {locating ? 'Detecting your location...' : 'Use my current location'}
                </button>
                <input name="name" onChange={handleAddressChange} value={address.name} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Enter your name" required />
                <input name="email" onChange={handleAddressChange} value={address.email} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="email" placeholder="Email address" required />
                <input name="street" onChange={handleAddressChange} value={address.street} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Street" required />
                <div className="flex gap-4">
                    <input name="city" onChange={handleAddressChange} value={address.city} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="City" required />
                    <input name="state" onChange={handleAddressChange} value={address.state} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="State" required />
                </div>
                <div className="flex gap-4">
                    <input name="zip" onChange={handleAddressChange} value={address.zip} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="number" placeholder="Zip code" required />
                    <input name="country" onChange={handleAddressChange} value={address.country} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Country" required />
                </div>
                <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Phone" required />
                <button className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all">SAVE ADDRESS</button>
            </div>
            <XIcon size={30} className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 cursor-pointer" onClick={() => setShowAddressModal(false)} />
        </form>
    )
}

export default AddressModal
