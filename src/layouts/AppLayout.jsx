import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Package, Receipt, ShoppingCart, LogOut, Percent } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export const AppLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
            <header className="px-6 py-4 flex justify-between items-center">
                <div className="text-xl font-bold text-indigo-900">ERM System</div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 hidden sm:block">
                        {user?.name} ({user?.role === 'admin' ? 'مدير' : 'مبيعات'})
                    </span>
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-red-500 transition-colors"
                        title="تسجيل الخروج"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-24 animate-enter">
                <Outlet />
            </main>

            <div className="fixed bottom-6 left-4 right-4 z-50">
                <nav className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl px-2 py-2 flex justify-center items-center gap-2 max-w-md mx-auto">
                    {user?.role === 'admin' && (
                        <NavItem to="/" icon={Home} label="الرئيسية" />
                    )}

                    <NavItem to="/pos" icon={ShoppingCart} label="نقاط البيع" />

                    {user?.role === 'admin' && (
                        <>
                            <NavItem to="/inventory" icon={Package} label="المخزون" />
                            <NavItem to="/discounts" icon={Percent} label="التخفيضات" />
                            <NavItem to="/orders" icon={Receipt} label="الطلبات" />
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon: Icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                clsx(
                    "flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300",
                    isActive
                        ? "text-indigo-600 scale-105"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )
            }
        >
            {({ isActive }) => (
                <>
                    <div className={clsx(
                        "p-1.5 rounded-xl transition-all duration-300 mb-0.5",
                        isActive ? "bg-indigo-50" : "bg-transparent"
                    )}>
                        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={clsx("transition-transform", isActive && "-translate-y-0.5")} />
                    </div>
                    <span className={clsx("text-[10px] font-medium transition-opacity", isActive ? "opacity-100 font-bold" : "opacity-0 hidden")}>
                        {label}
                    </span>
                </>
            )}
        </NavLink>
    );
};
