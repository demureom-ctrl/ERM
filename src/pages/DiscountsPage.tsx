import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Plus, X, Percent, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

import { Discount, Product } from '../types';

export const DiscountsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [discountsData, productsData] = await Promise.all([
                api.getAllDiscounts(),
                api.getProducts()
            ]);
            setDiscounts(discountsData);
            setProducts(productsData);
        } catch (e) {
            toast.error('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا التخفيض؟')) {
            try {
                await api.deleteDiscount(id);
                toast.success('تم الحذف');
                loadData();
            } catch (e) {
                toast.error('فشل الحذف');
            }
        }
    };

    // Check if discount is currently active
    const isDiscountActive = (discount: Discount) => {
        const now = new Date();
        const start = new Date(discount.start_date);
        const end = new Date(discount.end_date);
        return now >= start && now <= end && discount.is_active;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-100">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">إدارة التخفيضات</h1>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        إضافة تخفيض
                    </button>
                )}
            </header>

            <div className="max-w-4xl mx-auto space-y-4">
                {loading ? (
                    <p className="text-center text-slate-400 py-4">جاري التحميل...</p>
                ) : discounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Percent size={48} className="mb-4 opacity-50" />
                        <p>لا توجد تخفيضات</p>
                    </div>
                ) : (
                    discounts.map(discount => {
                        const active = isDiscountActive(discount);
                        return (
                            <div
                                key={discount.id}
                                className={`card-premium p-5 ${active ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-slate-900">{discount.name}</h3>
                                            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                -{discount.percentage}%
                                            </span>
                                            {active && (
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                                    نشط الآن
                                                </span>
                                            )}
                                        </div>

                                        {/* Employee View: Only show percentage */}
                                        {!isAdmin && active && (
                                            <p className="text-sm text-slate-500">تخفيض نشط</p>
                                        )}

                                        {/* Admin View: Show all details */}
                                        {isAdmin && (
                                            <>
                                                <div className="flex gap-4 text-sm text-slate-600 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        من: {new Date(discount.start_date).toLocaleDateString('ar')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        إلى: {new Date(discount.end_date).toLocaleDateString('ar')}
                                                    </span>
                                                </div>

                                                <div className="text-sm text-slate-600">
                                                    {discount.apply_to_all ? (
                                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                                            جميع المنتجات
                                                        </span>
                                                    ) : (
                                                        <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                                                            {discount.product_ids.length} منتج محدد
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(discount.id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Discount Modal */}
            {isAdmin && showAddModal && (
                <AddDiscountModal
                    products={products}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

// Add Discount Modal Component
const AddDiscountModal = ({ products, onClose, onSuccess }: { products: Product[], onClose: () => void, onSuccess: () => void }) => {
    const [formData, setFormData] = useState<{
        name: string;
        percentage: number;
        start_date: string;
        end_date: string;
        apply_to_all: boolean;
        product_ids: string[];
    }>({
        name: '',
        percentage: 10,
        start_date: '',
        end_date: '',
        apply_to_all: true,
        product_ids: []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('الرجاء إدخال اسم التخفيض');
            return;
        }

        if (!formData.start_date || !formData.end_date) {
            toast.error('الرجاء اختيار التواريخ');
            return;
        }

        if (!formData.apply_to_all && formData.product_ids.length === 0) {
            toast.error('الرجاء اختيار منتج واحد على الأقل');
            return;
        }

        try {
            await api.addDiscount(formData);
            toast.success('تم إضافة التخفيض');
            onSuccess();
        } catch (e) {
            toast.error('فشل الإضافة');
        }
    };

    const toggleProduct = (productId: string) => {
        setFormData(prev => ({
            ...prev,
            product_ids: prev.product_ids.includes(productId)
                ? prev.product_ids.filter(id => id !== productId)
                : [...prev.product_ids, productId]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">إضافة تخفيض جديد</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Discount Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            اسم التخفيض
                        </label>
                        <input
                            type="text"
                            className="input-premium"
                            placeholder="مثال: تخفيضات الصيف"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Percentage */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            نسبة التخفيض
                        </label>
                        <div className="flex gap-2">
                            {[10, 20, 30].map(percent => (
                                <button
                                    key={percent}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, percentage: percent })}
                                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${formData.percentage === percent
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {percent}%
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                تاريخ البداية
                            </label>
                            <input
                                type="datetime-local"
                                className="input-premium"
                                value={formData.start_date}
                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                تاريخ النهاية
                            </label>
                            <input
                                type="datetime-local"
                                className="input-premium"
                                value={formData.end_date}
                                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Apply To */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            تطبيق التخفيض على
                        </label>
                        <div className="flex gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, apply_to_all: true, product_ids: [] })}
                                className={`flex-1 py-2 rounded-xl font-bold transition-all ${formData.apply_to_all
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                جميع المنتجات
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, apply_to_all: false })}
                                className={`flex-1 py-2 rounded-xl font-bold transition-all ${!formData.apply_to_all
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                منتجات محددة
                            </button>
                        </div>

                        {/* Product Selection */}
                        {!formData.apply_to_all && (
                            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2">
                                {products.map(product => (
                                    <label
                                        key={product.id}
                                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.product_ids.includes(product.id)}
                                            onChange={() => toggleProduct(product.id)}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm font-medium text-slate-700">{product.name}</span>
                                        <span className="text-xs text-slate-400 mr-auto">{product.price} ر.ع.</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary w-full">
                        إضافة التخفيض
                    </button>
                </form>
            </div>
        </div>
    );
};
