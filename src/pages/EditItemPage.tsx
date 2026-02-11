
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { RawMaterial, RecipeItem } from '../types';
import { ArrowLeft, Upload, Loader, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditItemPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    // We determine mode based on fetched data
    const [isRaw, setIsRaw] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        unit: '',
        price: '',
        cost: '',
        stock_qty: '',
        image_placeholder: ''
    });

    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [recipe, setRecipe] = useState<RecipeItem[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [ingredientQty, setIngredientQty] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        try {
            const [item, cats, mats] = await Promise.all([
                api.getItem(id),
                api.getCategories(),
                api.getMaterials()
            ]);

            setCategories(cats);
            setMaterials(mats);
            setIsRaw(item.isRaw);
            setRecipe(item.recipe || []);

            setFormData({
                name: item.name,
                type: item.type || '',
                unit: item.unit || '',
                price: item.price || '',
                cost: item.cost || '',
                stock_qty: item.stock_qty || (item.quantity) || 0,
                image_placeholder: item.image_placeholder || ''
            });
        } catch (error) {
            toast.error('لم يتم العثور على العنصر');
            navigate('/inventory');
        } finally {
            setLoading(false);
        }
    };


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('حجم الصورة كبير جداً');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setFormData(prev => ({ ...prev, image_placeholder: result }));
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updatePayload: any = {
                name: formData.name,
                image_placeholder: formData.image_placeholder
            };

            if (isRaw) {
                updatePayload.unit = formData.unit;
                updatePayload.quantity = formData.stock_qty;
                // We keep stock_qty editable here for corrections, though usually done via purchase
            } else {
                updatePayload.type = formData.type;
                updatePayload.price = formData.price;
                updatePayload.cost = formData.cost;
                updatePayload.stock_qty = formData.stock_qty;
                updatePayload.recipe = recipe; // Save recipe for products
            }

            if (id) {
                await api.updateItem(id, updatePayload, isRaw);
                toast.success('تم الحفظ بنجاح');
                navigate('/inventory');
            }
        } catch (error) {
            toast.error('فشل الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (id && confirm('هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.')) {
            try {
                await api.deleteItem(id);
                toast.success('تم الحذف');
                navigate('/inventory');
            } catch (error) {
                toast.error('فشل الحذف');
            }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-indigo-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">تعديل {isRaw ? 'مادة خام' : 'منتج'}</h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                >
                    <Trash2 size={20} />
                </button>
            </header>

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
                {/* Image */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group hover:border-indigo-400 transition-colors">
                        {formData.image_placeholder ? (
                            <img src={formData.image_placeholder} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-slate-400">
                                <Upload size={24} className="mb-2" />
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
                        <input
                            type="text"
                            className="input-premium"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    {!isRaw ? (
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">سعر البيع</label>
                                    <input
                                        type="number"
                                        className="input-premium"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">التكلفة</label>
                                    <input
                                        type="number"
                                        className="input-premium"
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">وحدة القياس</label>
                            <select
                                className="input-premium appearance-none"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="مل">مل</option>
                                <option value="جرام">جرام</option>
                                <option value="قطعة">قطعة</option>
                                <option value="لتر">لتر</option>
                                <option value="كجم">كجم</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {isRaw ? 'الكمية الحالية (تعديل يدوي)' : 'المخزون الحالي'}
                        </label>
                        <input
                            type="number"
                            className="input-premium"
                            value={formData.stock_qty}
                            onChange={e => setFormData({ ...formData, stock_qty: e.target.value })}
                        />
                        {isRaw && <p className="text-[10px] text-amber-500 mt-1">تنبيه: يفضل استخدام "شراء" لزيادة المخزون بدلاً من التعديل اليدوي.</p>}
                    </div>
                </div>

                {/* Recipe Builder - Products Only */}
                {!isRaw && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">مكونات المنتج (الوصفة)</h3>
                        <p className="text-xs text-slate-500 mb-4">حدد المواد الخام المطلوبة لإنتاج وحدة واحدة من هذا المنتج</p>

                        {/* Add Ingredient */}
                        <div className="grid grid-cols-3 gap-3">
                            <select
                                className="input-premium col-span-2"
                                value={selectedMaterial}
                                onChange={e => setSelectedMaterial(e.target.value)}
                            >
                                <option value="">اختر مادة خام...</option>
                                {materials.map(mat => (
                                    <option key={mat.id} value={mat.id}>{mat.name} ({mat.unit})</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                className="input-premium"
                                placeholder="الكمية"
                                value={ingredientQty}
                                onChange={e => setIngredientQty(e.target.value)}
                                step="0.1"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (!selectedMaterial || !ingredientQty) {
                                    toast.error('اختر المادة وحدد الكمية');
                                    return;
                                }
                                const mat = materials.find(m => m.id === selectedMaterial);
                                const existingIndex = recipe.findIndex(r => r.materialId === selectedMaterial);

                                if (existingIndex >= 0) {
                                    // Update existing
                                    const updated = [...recipe];
                                    updated[existingIndex].quantity = parseFloat(ingredientQty);
                                    setRecipe(updated);
                                } else if (mat) {
                                    // Add new
                                    setRecipe([...recipe, {
                                        materialId: mat.id,
                                        name: mat.name,
                                        quantity: parseFloat(ingredientQty)
                                    }]);
                                }
                                setSelectedMaterial('');
                                setIngredientQty('');
                                toast.success('تمت الإضافة');
                            }}
                            className="btn-secondary py-2 text-sm"
                        >
                            إضافة إلى الوصفة
                        </button>

                        {/* Recipe List */}
                        {recipe.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-bold text-slate-700">المكونات الحالية:</h4>
                                {recipe.map((ing, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                                        <span className="text-sm font-medium">{ing.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-600">{ing.quantity} {ing.unit}</span>
                                            <button
                                                type="button"
                                                onClick={() => setRecipe(recipe.filter((_, i) => i !== idx))}
                                                className="text-rose-500 hover:text-rose-700 text-xs"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary flex justify-center items-center gap-2 py-4 text-lg mt-8"
                >
                    {saving ? <Loader className="animate-spin" /> : <Save />}
                    <span>حفظ التغييرات</span>
                </button>
            </form>
        </div>
    );
};
