import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Plus, X, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<string[]>([]);
    const [newCat, setNewCat] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (error) {
            toast.error('فشل تحميل التصنيفات');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCat.trim()) return;

        try {
            await api.addCategory(newCat);
            toast.success('تمت الإضافة');
            setNewCat('');
            loadCategories();
        } catch (error) {
            toast.error('فشل الإضافة');
        }
    };

    const handleDelete = async (catName: string) => {
        if (!confirm('حذف التصنيف؟')) return;
        try {
            await api.deleteCategory(catName);
            toast.success('تم الحذف');
            loadCategories();
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 animate-enter">
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">إدارة التصنيفات</h1>
                    <p className="text-sm text-slate-500">إضافة وحذف تصنيفات المنتجات</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="اسم التصنيف الجديد..."
                        className="input-premium flex-1"
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={!newCat.trim()}
                    >
                        <Plus size={20} />
                        إضافة
                    </button>
                </form>
            </div>      <div className="space-y-3">
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

    );
};
