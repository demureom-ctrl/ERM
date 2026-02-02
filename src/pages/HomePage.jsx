import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TrendingUp, AlertCircle, Package, DollarSign, ArrowLeft, Calendar } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const HomePage = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        lowStockCount: 0,
        totalProducts: 0
    });

    // Default to 'all' to show everything initially
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        loadStats();
    }, [dateFilter, customStartDate, customEndDate]);

    const getDateRange = () => {
        const now = new Date();
        let startDate, endDate;

        switch (dateFilter) {
            case 'all':
                return null;
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                startDate = weekStart;
                endDate = new Date();
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date();
                break;
            case 'custom':
                if (customStartDate && customEndDate) {
                    startDate = new Date(customStartDate);
                    endDate = new Date(customEndDate);
                    endDate.setHours(23, 59, 59, 999);
                } else {
                    return null;
                }
                break;
            default:
                return null; // Default to all if unknown
        }

        return { startDate, endDate };
    };

    const loadStats = async () => {
        try {
            const [products, sales] = await Promise.all([api.getProducts(), api.getSales()]);

            // Calculate Sales based on filter
            const dateRange = getDateRange();
            let filteredSales = sales;

            if (dateRange) {
                filteredSales = sales.filter(s => {
                    const saleDate = new Date(s.created_at);
                    return saleDate >= dateRange.startDate && saleDate <= dateRange.endDate;
                });
            }

            const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);

            // Calculate Low Stock
            const lowStock = products.filter(p => p.stock_qty < 10).length;

            setStats({
                totalSales,
                lowStockCount: lowStock,
                totalProducts: products.length
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    const getFilterLabel = () => {
        switch (dateFilter) {
            case 'all': return 'الكل';
            case 'today': return 'اليوم';
            case 'week': return 'الأسبوع';
            case 'month': return 'الشهر';
            case 'custom': return 'فترة محددة';
            default: return 'الكل';
        }
    };

    return (
        <div className="p-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">صباح الخير،</h1>
                <p className="text-slate-500 font-medium">إليك نظرة عامة.</p>
            </header>

            {/* Date Filter */}
            <div className="mb-6 space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setDateFilter('all')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${dateFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        الكل
                    </button>
                    <button
                        onClick={() => setDateFilter('today')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${dateFilter === 'today'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        اليوم
                    </button>
                    <button
                        onClick={() => setDateFilter('week')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${dateFilter === 'week'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        هذا الأسبوع
                    </button>
                    <button
                        onClick={() => setDateFilter('month')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${dateFilter === 'month'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        هذا الشهر
                    </button>
                    <button
                        onClick={() => setDateFilter('custom')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${dateFilter === 'custom'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        <Calendar size={16} />
                        تاريخ محدد
                    </button>
                </div>

                {/* Custom Date Range */}
                {dateFilter === 'custom' && (
                    <div className="flex gap-2 bg-white p-3 rounded-xl border border-slate-200">
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 mb-1 block">من</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 mb-1 block">إلى</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
                {/* Sales Card */}
                <div className="card-premium p-6 bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-none shadow-xl shadow-indigo-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm">
                            {getFilterLabel()}
                        </span>
                    </div>
                    <div className="text-violet-100 text-sm font-medium mb-1">إجمالي المبيعات</div>
                    <div className="text-4xl font-bold tracking-tight">{stats.totalSales.toLocaleString()} <span className="text-2xl">ر.ع.</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Low Stock Card */}
                    <NavLink to="/inventory" className="card-premium p-5 hover:shadow-lg transition-all active:scale-95 group">
                        <div className="p-2 bg-rose-50 rounded-xl w-fit mb-3 group-hover:bg-rose-100 transition-colors">
                            <AlertCircle className="text-rose-500" size={22} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mb-0.5">{stats.lowStockCount}</div>
                        <div className="text-xs font-semibold text-rose-500">مخزون منخفض</div>
                    </NavLink>

                    {/* Total Products Card */}
                    <NavLink to="/inventory" className="card-premium p-5 hover:shadow-lg transition-all active:scale-95 group">
                        <div className="p-2 bg-emerald-50 rounded-xl w-fit mb-3 group-hover:bg-emerald-100 transition-colors">
                            <Package className="text-emerald-500" size={22} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mb-0.5">{stats.totalProducts}</div>
                        <div className="text-xs font-semibold text-emerald-600">إجمالي المنتجات</div>
                    </NavLink>
                </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-4">إجراءات سريعة</h2>
            <div className="space-y-3">
                <NavLink to="/pos" className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-95 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 p-3 rounded-full">
                            <DollarSign className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900">بيع جديد</div>
                            <div className="text-xs text-slate-500">فتح نقطة البيع</div>
                        </div>
                    </div>
                    <ArrowLeft className="text-slate-300" size={18} />
                </NavLink>

                <NavLink to="/inventory" className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-95 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-50 p-3 rounded-full">
                            <Package className="text-orange-600" size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900">فحص المخزون</div>
                            <div className="text-xs text-slate-500">تحديث الكميات</div>
                        </div>
                    </div>
                    <ArrowLeft className="text-slate-300" size={18} />
                </NavLink>
            </div>
        </div>
    );
};
