
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product, Discount, CartItem } from '../types';
import { Search, Plus, Minus, Trash2, Check, ShoppingBag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

export const POSPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [categories, setCategories] = useState<string[]>(['الكل']);
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, catsData, discountsData] = await Promise.all([
                api.getProducts(),
                api.getCategories(),
                api.getActiveDiscounts()
            ]);
            setProducts(productsData);
            setCategories(['الكل', ...catsData]);
            setActiveDiscounts(discountsData);
        } catch (error) {
            toast.error('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'الكل' || p.type === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                toast.success(`تم تحديث الكمية: ${product.name} `, { id: `cart - ${product.id} `, duration: 1000 });
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            toast.success(`تمت الإضافة للسلة: ${product.name} `, { id: `cart - ${product.id} `, duration: 2000 });
            return [...prev, { productId: product.id, product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                if (newQty === 0) return null; // Filter out later
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const getItemQty = (productId: string) => {
        return cart.find(item => item.productId === productId)?.quantity || 0;
    };

    // Helper: Get discount for a product
    const getProductDiscount = (productId: string) => {
        for (const discount of activeDiscounts) {
            if (discount.apply_to_all) return discount.percentage;
            if (discount.product_ids.includes(productId)) return discount.percentage;
        }
        return 0;
    };

    // Calculate totals with discount
    const subTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalDiscount = cart.reduce((sum, item) => {
        const discountPercent = getProductDiscount(item.product.id);
        return sum + (item.product.price * item.quantity * discountPercent / 100);
    }, 0);
    const totalAmount = subTotal - totalDiscount;

    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash'); // 'cash' | 'card'

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        const loadingToast = toast.loading('جاري معالج الطلب...');
        try {
            await api.addSale({
                items: cart,
                total: totalAmount,
                payment_method: paymentMethod
            });
            toast.success('تم إتمام البيع!', { id: loadingToast });
            setCart([]);
            setShowCartMobile(false);
            loadData();
        } catch (error) {
            toast.error('فشل عملية البيع', { id: loadingToast });
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            )}
            {/* Left Panel: Products */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 pb-2 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-slate-900">نقطة البيع</h1>
                        {/* Mobile Cart Toggle */}
                        <button
                            className="md:hidden relative p-2 bg-indigo-50 text-indigo-600 rounded-xl"
                            onClick={() => setShowCartMobile(true)}
                        >
                            <ShoppingBag />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="بحث عن منتج..."
                                className="input-premium pl-10 h-12"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={clsx(
                                    "px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                                    activeCategory === cat
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                        : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-4 pb-32 md:pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => {
                            const qty = getItemQty(product.id);
                            const discountPercent = getProductDiscount(product.id);
                            const discountedPrice = discountPercent > 0
                                ? product.price * (1 - discountPercent / 100)
                                : product.price;

                            return (
                                <div
                                    key={product.id}
                                    className={clsx(
                                        "card-premium overflow-hidden group transition-all duration-300",
                                        qty > 0 ? "border-indigo-500 ring-1 ring-indigo-500" : "hover:border-indigo-200"
                                    )}
                                >
                                    {/* Image Area */}
                                    <div className="relative aspect-square bg-slate-100">
                                        <img
                                            src={product.image_placeholder}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                            {discountPercent > 0 ? (
                                                <>
                                                    <div className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md">
                                                        -{discountPercent}%
                                                    </div>
                                                    <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                                        <span className="line-through text-slate-400 text-[10px]">{product.price}</span>{' '}
                                                        {discountedPrice.toFixed(3)} ر.ع.
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                                    {product.price} ر.ع.
                                                </div>
                                            )}
                                        </div>
                                        {product.stock_qty < 5 && (
                                            <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                                ينفذ قريباً
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-3">
                                        <h3 className="font-bold text-slate-900 truncate mb-1">{product.name}</h3>
                                        <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
                                            <span>{product.type}</span>
                                            <span className={product.stock_qty < 10 ? "text-red-500" : "text-slate-500"}>
                                                {product.stock_qty} متوفر
                                            </span>
                                        </div>

                                        {/* Quick Actions */}
                                        {qty === 0 ? (
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-full py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} /> إضافة
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(product.id, -1)}
                                                    className="p-1.5 bg-white text-indigo-600 rounded-md shadow-sm hover:bg-indigo-100"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold text-indigo-900">{qty}</span>
                                                <button
                                                    onClick={() => updateQuantity(product.id, 1)}
                                                    className="p-1.5 bg-white text-indigo-600 rounded-md shadow-sm hover:bg-indigo-100"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Panel: Cart (Desktop) */}
            <div className="hidden md:flex w-96 bg-white border-r border-slate-200 h-full flex-col z-20 shadow-2xl">
                <CartPanel
                    cart={cart}
                    updateQuantity={updateQuantity}
                    subTotal={subTotal}
                    totalDiscount={totalDiscount}
                    totalAmount={totalAmount}
                    handleCheckout={handleCheckout}
                    clearCart={() => setCart([])}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                />
            </div>

            {/* Mobile Cart Drawer */}
            <AnimatePresence>
                {showCartMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden flex justify-end"
                        onClick={() => setShowCartMobile(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-4/5 h-full bg-white shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <CartPanel
                                cart={cart}
                                updateQuantity={updateQuantity}
                                subTotal={subTotal}
                                totalDiscount={totalDiscount}
                                totalAmount={totalAmount}
                                handleCheckout={handleCheckout}
                                clearCart={() => setCart([])}
                                onClose={() => setShowCartMobile(false)}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Extracted Cart Component for reuse

interface CartPanelProps {
    cart: CartItem[];
    updateQuantity: (productId: string, delta: number) => void;
    subTotal: number;
    totalDiscount: number;
    totalAmount: number;
    handleCheckout: () => void;
    clearCart: () => void;
    onClose?: () => void;
    paymentMethod: 'cash' | 'card';
    setPaymentMethod: React.Dispatch<React.SetStateAction<'cash' | 'card'>>;
}

const CartPanel = ({ cart, updateQuantity, subTotal, totalDiscount, totalAmount, handleCheckout, clearCart, onClose, paymentMethod, setPaymentMethod }: CartPanelProps) => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">الطلب الحالي</h2>
                    <p className="text-xs text-slate-400">#{Date.now().toString().slice(-6)}</p>
                </div>
                <div className="flex gap-2">
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                            <X size={20} />
                        </button>
                    )}
                    <button
                        onClick={clearCart}
                        disabled={cart.length === 0}
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <ShoppingBag size={64} className="mb-4 stroke-1" />
                        <p>السلة فارغة</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.productId} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                            <img
                                src={item.product.image_placeholder}
                                className="w-14 h-14 rounded-lg object-cover bg-slate-100"
                            />
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.product.name}</h4>
                                    <span className="font-bold text-slate-900 text-sm">{(item.product.price * item.quantity).toFixed(1)}</span>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-slate-500">{item.product.price} ر.ع.</span>
                                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 p-0.5">
                                        <button
                                            onClick={() => updateQuantity(item.productId, -1)}
                                            className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-100"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, 1)}
                                            className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-100"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-slate-500">
                        <span>المجموع الفرعي</span>
                        <span>{subTotal.toFixed(3)} ر.ع.</span>
                    </div>
                    {totalDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                            <span>التخفيض</span>
                            <span>-{totalDiscount.toFixed(3)} ر.ع.</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
                        <span>الإجمالي</span>
                        <span>{totalAmount.toFixed(3)} ر.ع.</span>
                    </div>
                </div>

                {/* Payment Method Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                    <button
                        onClick={() => setPaymentMethod('cash')}
                        className={clsx(
                            "flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                            paymentMethod === 'cash' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        💵 كاش
                    </button>
                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={clsx(
                            "flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                            paymentMethod === 'card' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        💳 بطاقة
                    </button>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className={clsx(
                        "w-full py-4 text-lg shadow-xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] transition-all text-white font-bold rounded-xl",
                        paymentMethod === 'cash' ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700" : "bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700"
                    )}
                >
                    <Check size={20} />
                    <span>إتمام البيع {paymentMethod === 'cash' ? '(كاش)' : '(بطاقة)'}</span>
                </button>
            </div>
        </div>
    );
};
