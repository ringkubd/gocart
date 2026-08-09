import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useStorefrontData from './useStorefrontData';
import { useCurrency } from './useCurrency';

const OrderSummary = ({ totalPrice, items }) => {

    const { format } = useCurrency();

    const router = useRouter();
    const { status } = useSession();
    const { shippingMethods, gateways } = useStorefrontData();

    const activeGateways = gateways || [];

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [shippingMethod, setShippingMethod] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [placing, setPlacing] = useState(false);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        try {
            const res = await fetch(`/api/coupons?code=${couponCodeInput.toUpperCase()}`)
            const data = await res.json()
            if (!res.ok || !data.coupon) {
                toast.error('Invalid coupon code')
                return
            }
            if (new Date(data.coupon.expiresAt) < new Date()) {
                toast.error('This coupon has expired')
                return
            }
            setCoupon(data.coupon)
            toast.success('Coupon applied')
        } catch (error) {
            toast.error('Invalid coupon code')
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (status !== 'authenticated') {
            router.push('/login')
            return
        }

        if (!selectedAddress) {
            toast.error('Please select or add a delivery address')
            return
        }

        if (shippingMethods.length > 0 && !shippingMethod) {
            toast.error('Please select a shipping method')
            return
        }

        if (paymentMethod !== 'COD' && paymentMethod !== 'SSLCOM' && !transactionId.trim()) {
            toast.error('Please enter your transaction ID after sending the payment')
            return
        }

        if (placing) return
        setPlacing(true)

        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'InitiateCheckout', { value: finalTotal, currency: 'USD', num_items: items.length })
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
                    address: {
                        name: selectedAddress.name,
                        email: selectedAddress.email,
                        street: selectedAddress.street,
                        city: selectedAddress.city,
                        state: selectedAddress.state,
                        zip: selectedAddress.zip,
                        country: selectedAddress.country,
                        phone: selectedAddress.phone,
                    },
                    paymentMethod,
                    coupon: coupon ? { code: coupon.code } : null,
                    shippingMethod: shippingMethod ? { id: shippingMethod.id } : null,
                    transactionId: transactionId || '',
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to place order')
            }

            toast.success('Order placed successfully')
            router.push('/orders')
        } catch (error) {
            toast.error(error.message || 'Failed to place order')
        } finally {
            setPlacing(false)
        }
    }

    const discountAmount = coupon ? (coupon.discount / 100 * totalPrice) : 0;
    const shippingCost = shippingMethod ? shippingMethod.cost : 0;
    const finalTotal = totalPrice - discountAmount + shippingCost;

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" name="payment" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>Cash on Delivery</label>
            </div>
            {activeGateways.map((gw) => (
                <div key={gw.code} className='flex gap-2 items-center mt-1'>
                    <input type="radio" id={gw.code} name="payment" onChange={() => setPaymentMethod(gw.code.toUpperCase())} checked={paymentMethod === gw.code.toUpperCase()} className='accent-gray-500' />
                    <label htmlFor={gw.code} className='cursor-pointer'>{gw.name} (Online)</label>
                </div>
            ))}
            {paymentMethod !== 'COD' && (
                <div className='mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-slate-600'>
                    <p>Complete payment to the merchant number shown at your gateway, then enter the transaction ID below. Our team will verify and confirm your order.</p>
                    <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter Transaction ID" className="mt-2 w-full border border-slate-300 rounded p-2 text-sm outline-none" />
                </div>
            )}
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            {shippingMethods.length > 0 && (
                <div className='my-4 py-4 border-b border-slate-200 text-slate-400'>
                    <p>Shipping Method</p>
                    <div className='flex flex-col gap-2 mt-2'>
                        {shippingMethods.map((method) => (
                            <label key={method.id} className='flex items-center gap-2 text-sm text-slate-600 cursor-pointer'>
                                <input type="radio" name="shipping" checked={shippingMethod?.id === method.id} onChange={() => setShippingMethod(method)} className='accent-gray-500' />
                                <span>{method.name} {method.deliveryTime && <span className='text-xs text-slate-400'>({method.deliveryTime})</span>}</span>
                                <span className='ml-auto font-medium'>{method.cost > 0 ? format(method.cost) : 'Free'}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{format(totalPrice)}</p>
                        <p>{shippingCost > 0 ? format(shippingCost) : 'Free'}</p>
                        {coupon && <p>{`-${format(discountAmount)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={handleCouponCode} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon(null)} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{coupon ? format(finalTotal) : format(totalPrice)}</p>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50'>
                {placing ? 'Placing Order...' : 'Place Order'}
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary
