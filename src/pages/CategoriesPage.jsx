import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Plus, X, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (e) {
            toast.error('فشل تحميل التصنيفات');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCat.trim()) return;

        try {
            await api.addCategory(newCat.trim());
            setNewCat('');
            toast.success('تمت إضافة التصنيف');
            loadCategories();
        } catch (e) {
            toast.error('فشل الإضافة');
        }
    };

    const handleDelete = async (catName) => {
        if (confirm(`هل أنت متأكد من حذف تصنيف "${catName}"؟`)) {
            try {
                await api.deleteCategory(catName);
                toast.success('تم الحذف');
                loadCategories();
            } catch (e) {
                toast.error('فشل الحذف');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-100">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">إدارة التصنيفات</h1>
            </header>

            <div className="max-w-md mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-indigo-600" />
                        إضافة تصنيف جديد
                    </h2>
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            className="input-premium flex-1"
                            placeholder="مثال: هدايا"
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!newCat.trim()}
                            className="btn-primary"
                        >
                            إضافة
                        </button>
                    </form>
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900 px-2 flex items-center gap-2">
                        <Tag size={20} className="text-slate-400" />
                        التصنيفات الحالية
                    </h2>
                    {loading ? (
                        <p className="text-center text-slate-400 py-4">جاري التحميل...</p>
                    ) : (
                        categories.map(cat => (
                            <div key={cat} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 group hover:border-indigo-100 transition-colors">
                                <span className="font-medium text-slate-800">{cat}</span>
                                <button
                                    onClick={() => handleDelete(cat)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
