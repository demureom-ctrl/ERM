
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Upload, Check, Loader, Package, Droplet } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const AddProductPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // Mode: 'product' or 'material'
    const [mode, setMode] = useState('product');

    const [formData, setFormData] = useState({
        name: '',
        type: '', // For product category
        unit: 'مل', // For material unit
        price: '',
        cost: '',
        stock_qty: '',
        image_base64: ''
    });

    useEffect(() => {
        // Load categories dynamic
        api.getCategories().then(data => {
            setCategories(data);
            if (data.length > 0) setFormData(prev => ({ ...prev, type: data[0] }));
        });
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error('حجم الصورة كبير جداً (الحد الأقصى 2 ميجابايت)');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image_base64: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'product') {
            if (!formData.name || !formData.price) {
                toast.error('يرجى تعبئة الحقول المطلوبة (الاسم والسعر)');
                return;
            }
        } else {
            if (!formData.name || !formData.unit) {
                toast.error('يرجى تعبئة الحقول المطلوبة (الاسم والوحدة)');
                return;
            }
        }

        setLoading(true);
        try {
            if (mode === 'product') {
                await api.addProduct({
                    name: formData.name,
                    type: formData.type,
                    price: formData.price,
                    cost: formData.cost,
                    stock_qty: formData.stock_qty,
                    image_placeholder: formData.image_base64
                });
                toast.success('تم إضافة المنتج بنجاح');
            } else {
                await api.addRawMaterial({
                    name: formData.name,
                    unit: formData.unit,
                    quantity: formData.stock_qty,
                    image_placeholder: formData.image_base64 // Optional for material
                });
                toast.success('تم إضافة المادة الخام بنجاح');
            }
            navigate('/inventory');
        } catch (error) {
            toast.error('فشل الإضافة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">
                    {mode === 'product' ? 'إضافة منتج جديد' : 'إضافة مادة خام جديدة'}
                </h1>
            </header>

            <div className="max-w-lg mx-auto">
                {/* Mode Selector */}
                <div className="bg-slate-200 p-1 rounded-2xl flex mb-8">
                    <button
                        onClick={() => setMode('product')}
                        className={clsx(
                            "flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            mode === 'product' ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Package size={18} />
                        <span>منتج للبيع</span>
                    </button>
                    <button
                        onClick={() => setMode('material')}
                        className={clsx(
                            "flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            mode === 'material' ? "bg-white text-teal-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Droplet size={18} />
                        <span>مادة خام (شراء)</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Image Upload Section - Optional for Product mainly but valid for both */}
                    <div className="flex flex-col items-center gap-4">
                        <div className={clsx(
                            "relative w-32 h-32 bg-white rounded-2xl shadow-sm border-2 border-dashed flex items-center justify-center overflow-hidden group transition-colors",
                            mode === 'product' ? "border-slate-300 hover:border-indigo-400" : "border-slate-300 hover:border-teal-400"
                        )}>
                            {formData.image_base64 ? (
                                <img src={formData.image_base64} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-slate-400">
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-[10px] font-medium">صورة (اختياري)</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {mode === 'product' ? 'اسم المنتج' : 'اسم المادة الخام'}
                            </label>
                            <input
                                type="text"
                                className="input-premium"
                                placeholder={mode === 'product' ? "مثال: عطر العود" : "مثال: كحول إيثيلي"}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Product Specific Fields */}
                        {mode === 'product' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">التصنيف</label>
                                    <select
                                        className="input-premium appearance-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">سعر البيع (ر.ع.)</label>
                                        <input
                                            type="number"
                                            className="input-premium"
                                            placeholder="0.000"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">التكلفة (ر.ع.)</label>
                                        <input
                                            type="number"
                                            className="input-premium"
                                            placeholder="0.000"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                            step="0.1"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Material Specific Fields */}
                        {mode === 'material' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">وحدة القياس</label>
                                <select
                                    className="input-premium appearance-none"
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    <option value="مل">مل (سائل)</option>
                                    <option value="جرام">جرام (وزن)</option>
                                    <option value="قطعة">قطعة (عدد)</option>
                                    <option value="لتر">لتر</option>
                                    <option value="كجم">كجم</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">الكمية الافتتاحية</label>
                            <input
                                type="number"
                                className="input-premium"
                                placeholder="0"
                                value={formData.stock_qty}
                                onChange={e => setFormData({ ...formData, stock_qty: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">يمكنك إضافة المزيد لاحقاً عبر زر "شراء"</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={clsx(
                            "w-full flex justify-center items-center gap-2 py-4 text-lg mt-8 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95",
                            mode === 'product'
                                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                : "bg-teal-600 hover:bg-teal-700 shadow-teal-200"
                        )}
                    >
                        {loading ? <Loader className="animate-spin" /> : <Check />}
                        <span>{mode === 'product' ? 'حفظ المنتج' : 'حفظ المادة الخام'}</span>
                    </button>

                </form>
            </div>
        </div>
    );
};
