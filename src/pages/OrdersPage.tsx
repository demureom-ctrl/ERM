import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Sale } from '../types';
import { Clock, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

export const OrdersPage = () => {
    const [sales, setSales] = useState<Sale[]>([]);

    useEffect(() => {
        api.getSales().then(data => {
            // Sort by newest first
            setSales([...data].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            }));
        });
    }, []);

    const formatDate = (isoString?: string) => {
        const date = new Date(isoString || Date.now());
        return {
            day: date.toLocaleDateString('ar-OM', { day: 'numeric', month: 'short' }),
            time: date.toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="p-4 bg-slate-50 min-h-full">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">الطلبات الأخيرة</h1>

            <div className="space-y-4 pb-24">
                {sales.map((sale) => {
                    const { day, time } = formatDate(sale.created_at);
                    return (
                        <div key={sale.id} className="card-premium p-0 overflow-hidden group active:scale-[0.98] transition-all">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 font-bold text-xs uppercase tracking-wide">
                                        #{sale.id.slice(-4)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">{day}</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={10} /> {time}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-900">{sale.total.toLocaleString()} <span className="text-xs">ر.ع.</span></div>
                                    <div className="flex gap-2 justify-end">
                                        <div className={clsx(
                                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block",
                                            sale.payment_method === 'card' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            {sale.payment_method === 'card' ? 'بطاقة' : 'كاش'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Preview */}
                            <div className="p-4 bg-slate-50/50">
                                <div className="space-y-2">
                                    {sale.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <span className="font-bold text-slate-400">{item.quantity}x</span>
                                                <span>{item.product.name}</span>
                                            </div>
                                            <span className="text-slate-500">{item.product.price * item.quantity} ر.ع.</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {sales.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <ShoppingBag size={48} className="mb-4 opacity-50" />
                        <p>لا توجد طلبات بعد</p>
                    </div>
                )}
            </div>
        </div>
    );
};
