'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { setAddresses } from "@/lib/features/address/addressSlice";
import { useCurrency } from "@/components/useCurrency";
import { useLanguage } from "@/components/LanguageProvider";

export default function Cart() {

    const { format } = useCurrency();
    const { t } = useLanguage();
    
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const { status } = useSession();

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const fetchAddresses = async () => {
        if (status !== 'authenticated') return
        try {
            const res = await fetch('/api/addresses')
            const data = await res.json()
            if (res.ok) {
                dispatch(setAddresses(data.addresses))
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [status])

    const createCartArray = () => {
        setTotalPrice(0);
        const arr = [];
        let total = 0;
        for (const [key, value] of Object.entries(cartItems)) {
            // Handle both old format (number) and new format (object)
            const productId = typeof value === 'number' ? key : value.productId
            const variantId = typeof value === 'number' ? null : value.variantId
            const quantity = typeof value === 'number' ? value : value.quantity

            const product = products.find(p => p.id === productId)
            if (!product) continue

            let variant = null
            if (variantId && product.variants) {
                variant = product.variants.find(v => v.id === variantId)
            }

            const price = variant ? variant.price : product.price
            const mrp = variant ? (variant.mrp || product.mrp) : product.mrp
            const image = variant?.image || product.images?.[0]
            const stock = variant ? variant.stock : product.stock
            const attrs = variant?.attributes || {}

            arr.push({
                ...product,
                cartKey: key,
                quantity,
                variantId,
                variant,
                cartPrice: price,
                cartMrp: mrp,
                cartImage: image,
                cartStock: stock,
                cartAttributes: attrs,
            })
            total += price * quantity
        }
        setCartArray(arr)
        setTotalPrice(total)
    }

    const handleDeleteItemFromCart = (productId, variantId) => {
        dispatch(deleteItemFromCart({ productId, variantId }))
    }

    useEffect(() => {
        if (products.length > 0) {
            createCartArray();
        }
    }, [cartItems, products]);

    return cartArray.length > 0 ? (
        <div className="min-h-screen mx-6 text-slate-800">

            <div className="max-w-7xl mx-auto ">
                <PageTitle heading={t('myCart')} text={t('itemsInCart')} linkText={t('addMore')} />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">

                    <table className="w-full max-w-4xl text-slate-600 table-auto">
                        <thead>
                            <tr className="max-sm:text-sm">
                                <th className="text-left">{t('product')}</th>
                                <th>{t('quantity')}</th>
                                <th>{t('totalPrice')}</th>
                                <th className="max-md:hidden">{t('remove')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                cartArray.map((item, index) => (
                                    <tr key={item.cartKey} className="space-x-2">
                                        <td className="flex gap-3 my-4">
                                            <div className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md">
                                                <Image src={item.cartImage || item.images?.[0]} className="h-14 w-auto" alt="" width={45} height={45} />
                                            </div>
                                            <div>
                                                <p className="max-sm:text-sm">{item.name}</p>
                                                {Object.keys(item.cartAttributes).length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {Object.entries(item.cartAttributes).map(([attr, val]) => (
                                                            <span key={attr} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                                {attr}: {val}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-xs text-slate-500">{item.category}</p>
                                                <p>{format(item.cartPrice)}</p>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Counter productId={item.id} variantId={item.variantId} />
                                        </td>
                                        <td className="text-center">{format(item.cartPrice * item.quantity)}</td>
                                        <td className="text-center max-md:hidden">
                                            <button onClick={() => handleDeleteItemFromCart(item.id, item.variantId)} className=" text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                                <Trash2Icon size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <h1 className="text-2xl sm:text-4xl font-semibold">{t('yourCartEmpty')}</h1>
        </div>
    )
}
