import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product, RawMaterial, RecipeItem, InventoryItem } from '../types';
import { Search, AlertTriangle, CheckCircle, Package, Droplet, Plus, Tag, Truck, Pencil, Factory } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export const InventoryPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filter, setFilter] = useState('الكل');
    const [search, setSearch] = useState('');
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);

    const [manufactureModalOpen, setManufactureModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [products, materials] = await Promise.all([api.getProducts(), api.getMaterials()]);
        const normalizedProducts = products.map(p => ({ ...p, category: 'منتج', icon: Package, isRaw: false }));
        const normalizedMaterials = materials.map(m => ({ ...m, category: 'مادة خام', icon: Droplet, stock_qty: m.quantity, isRaw: true }));
        setItems([...normalizedProducts, ...normalizedMaterials]);
    };

    const handlePurchase = async (qty: string, unitPrice: string) => {
        if (!selectedMaterial) return;
        try {
            await api.updateMaterialStock(selectedMaterial.id, qty, unitPrice);
            toast.success('تم تسجيل الشراء بنجاح');
            setPurchaseModalOpen(false);
            loadData();
        } catch (error: any) {

            toast.error('فشل تسجيل العملية: ' + (error.message || 'غير معروف'));
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'الكل' || item.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col h-full p-4 bg-slate-50 relative">
            <header className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-slate-900">المخزون</h1>
                    <div className="flex gap-2">
                        <NavLink to="/inventory/categories" className="bg-white border border-slate-200 text-slate-600 rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-medium hover:bg-slate-50">
                            <Tag size={18} />
                            <span>التصنيفات</span>
                        </NavLink>
                        <NavLink to="/inventory/add" className="btn-primary py-2 px-3 flex items-center gap-2 text-sm">
                            <Plus size={18} />
                            <span>إضافة منتج</span>
                        </NavLink>
                    </div>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث في المخزون..."
                        className="input-premium pl-10"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full max-w-md mx-auto mb-6 shadow-inner">
                    {[
                        { id: 'الكل', label: 'الكل', icon: null },
                        { id: 'منتج', label: 'المنتجات', icon: Package },
                        { id: 'مادة خام', label: 'المواد الخام', icon: Droplet }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={clsx(
                                "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                filter === f.id
                                    ? "bg-white text-indigo-600 shadow-md transform scale-105"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            )}
                        >
                            {f.icon && <f.icon size={16} className={clsx(filter === f.id ? "text-indigo-600" : "text-slate-400")} />}
                            <span>{f.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            <div className="space-y-3 pb-24">
                {filteredItems.map(item => (
                    <div
                        key={item.id}
                        className={clsx(
                            "relative overflow-hidden p-4 flex justify-between items-center group transition-all duration-300 rounded-2xl border",
                            item.isRaw
                                ? "bg-teal-50/30 border-teal-100 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-100"
                                : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100"
                        )}
                    >
                        {/* Type Badge */}
                        <div className={clsx(
                            "absolute top-0 left-0 px-2 py-0.5 rounded-br-lg text-[10px] font-bold",
                            item.isRaw ? "bg-teal-100 text-teal-700" : "bg-indigo-100 text-indigo-700"
                        )}>
                            {item.isRaw ? 'مادة خام' : 'منتج للبيع'}
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                            <div className={clsx(
                                "p-3 rounded-2xl shadow-sm",
                                item.category === 'منتج' ? "bg-indigo-100 text-indigo-600" : "bg-teal-100 text-teal-600"
                            )}>
                                <item.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg mb-0.5">{item.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                                        {item.category === 'منتج' ? (item as Product).type : (item as RawMaterial).unit}
                                    </span>
                                    {!item.isRaw && <span>• سعر البيع: {(item as Product).price} ر.ع.</span>}
                                    {item.isRaw && (item as RawMaterial).avg_cost && (item as RawMaterial).avg_cost! > 0 && <span>• متوسط التكلفة: {Number((item as RawMaterial).avg_cost).toFixed(3)} ر.ع.</span>}
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                            {/* Manufacture Button for Products - Always visible */}
                            {!item.isRaw && (
                                <button
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        const product = item as Product;
                                        if (product.recipe && product.recipe.length > 0) {
                                            setSelectedProduct(product);
                                            setManufactureModalOpen(true);
                                        } else {
                                            toast.error('يجب إضافة مواد خام (وصفة) لهذا المنتج أولاً من صفحة التعديل', {
                                                duration: 4000,
                                                icon: '⚠️'
                                            });
                                            // Optional: navigate to edit page
                                            // navigate(`/inventory/edit/${item.id}`);
                                        }
                                    }}
                                    className={clsx(
                                        "px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-md",
                                        (item as Product).recipe && (item as Product).recipe!.length > 0
                                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                                            : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                                    )}
                                    title={(item as Product).recipe && (item as Product).recipe!.length > 0 ? "تصنيع" : "أضف وصفة أولاً"}
                                >
                                    <Factory size={16} />
                                    <span>تصنيع</span>
                                </button>
                            )}

                            {/* Purchase Button for Raw Materials */}
                            {item.isRaw && (
                                <button
                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedMaterial(item as RawMaterial); setPurchaseModalOpen(true); }}
                                    className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-200 flex items-center gap-2 active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span>شراء</span>
                                </button>
                            )}

                            {/* Edit Button */}
                            <button
                                onClick={() => navigate(`/inventory/edit/${item.id}`)}
                                className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            >
                                <Pencil size={18} />
                            </button>

                            <div className="bg-white/50 p-2 rounded-xl backdrop-blur-sm border border-slate-100/50">
                                <div className={clsx(
                                    "flex items-center gap-1.5 font-bold mb-0.5 justify-end text-lg",
                                    item.stock_qty < 10 ? "text-rose-600" : "text-emerald-600"
                                )}>
                                    {item.stock_qty < 10 ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                                    <span>{item.stock_qty}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold text-center">
                                    {item.isRaw ? item.unit : 'قطع'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {/* Manufacture Modal */}
            {manufactureModalOpen && selectedProduct && (
                <ManufactureModal
                    product={selectedProduct}
                    onClose={() => { setManufactureModalOpen(false); }}
                    onConfirm={(qty) => {
                        api.manufactureProduct(selectedProduct.id, qty)
                            .then(() => {
                                toast.success(`تم تصنيع ${qty} من ${selectedProduct.name}`);
                                loadData();
                                setManufactureModalOpen(false);
                            })
                            .catch(err => toast.error(err.message || 'فشل التصنيع'));
                    }}
                />
            )}

            {/* Purchase Modal */}
            {purchaseModalOpen && selectedMaterial && (
                <PurchaseModal
                    material={selectedMaterial}
                    onClose={() => setPurchaseModalOpen(false)}
                    onConfirm={handlePurchase}
                />
            )}
        </div>
    );
};

interface PurchaseModalProps {
    material: RawMaterial;
    onClose: () => void;
    onConfirm: (qty: string, unitPrice: string) => void;
}

const PurchaseModal = ({ material, onClose, onConfirm }: PurchaseModalProps) => {
    const [qty, setQty] = useState('');
    const [unitPrice, setUnitPrice] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(qty, unitPrice);
    };

    const totalCost = (parseFloat(qty) || 0) * (parseFloat(unitPrice) || 0);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-enter">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">شراء مادة خام</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>

                <div className="mb-6 flex items-center gap-3 bg-teal-50 p-3 rounded-xl">
                    <div className="bg-white p-2 rounded-lg text-teal-600">
                        <Droplet size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{material.name}</h3>
                        <p className="text-sm text-slate-500">مخزون حالي: {material.quantity} {material.unit}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-1 block">الكمية المشتراة ({material.unit})</label>
                        <input
                            type="number"
                            required
                            className="input-premium w-full"
                            placeholder="0"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-1 block">سعر الوحدة ({material.unit})</label>
                        <input
                            type="number"
                            step="0.001"
                            required
                            className="input-premium w-full"
                            placeholder="0.000"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value)}
                        />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500">الإجمالي:</span>
                        <span className="text-lg font-bold text-teal-600">{totalCost.toLocaleString()} ر.ع.</span>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg justify-center">
                        <Truck size={20} />
                        تأكيد الشراء
                    </button>
                </form>
            </div>
        </div>
    );
};


interface ManufactureModalProps {
    product: Product;
    onClose: () => void;
    onConfirm: (qty: string) => void;
}

const ManufactureModal = ({ product, onClose, onConfirm }: ManufactureModalProps) => {
    const [qty, setQty] = useState('');
    const [materials, setMaterials] = useState<RawMaterial[]>([]);

    useEffect(() => {
        // Fetch current material stock
        api.getMaterials().then(mats => {
            setMaterials(mats);
        });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(qty);
    };

    const getMaterialAvailable = (materialId: string) => {
        const mat = materials.find(m => m.id === materialId);
        return mat ? mat.quantity : 0;
    };

    const getRequiredQty = (ingredient: RecipeItem) => {
        return ingredient.quantity * (parseInt(qty) || 0);
    };

    const canManufacture = () => {
        const quantity = parseInt(qty);
        if (!qty || isNaN(quantity) || quantity <= 0) return false;
        if (!product.recipe || product.recipe.length === 0) return false;

        return product.recipe.every(ing => {
            const available = getMaterialAvailable(ing.materialId);
            const required = getRequiredQty(ing);
            return available >= required;
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-enter">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">تصنيع منتج</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>

                <div className="mb-6 flex items-center gap-3 bg-indigo-50 p-3 rounded-xl">
                    <div className="bg-white p-2 rounded-lg text-indigo-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{product.name}</h3>
                        <p className="text-sm text-slate-500">مخزون حالي: {product.stock_qty} قطعة</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-1 block">الكمية المراد تصنيعها</label>
                        <input
                            type="number"
                            required
                            className="input-premium w-full"
                            placeholder="0"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                    </div>

                    {/* Recipe Requirements */}
                    {parseInt(qty) > 0 && product.recipe && product.recipe.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                            <h4 className="text-sm font-bold text-slate-700 mb-2">المواد المطلوبة:</h4>
                            {product.recipe.map((ing, idx) => {
                                const required = getRequiredQty(ing);
                                const available = getMaterialAvailable(ing.materialId);
                                const sufficient = available >= required;
                                const mat = materials.find(m => m.id === ing.materialId);

                                return (
                                    <div key={idx} className={clsx(
                                        "flex justify-between text-sm p-2 rounded-lg",
                                        sufficient ? "bg-green-50 text-green-700" : "bg-rose-50 text-rose-700"
                                    )}>
                                        <span>{ing.name}</span>
                                        <span className="font-bold">
                                            {required} / {available} {mat?.unit || ''}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!canManufacture()}
                        className="btn-primary w-full py-3 mt-4 text-lg justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Factory size={20} />
                        تأكيد التصنيع
                    </button>
                </form>
            </div>
        </div>
    );
};
