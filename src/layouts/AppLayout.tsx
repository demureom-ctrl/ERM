
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Package, Receipt, ShoppingCart, LogOut, Percent, Users } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export const AppLayout = () => {
    const { logout, user } = useAuth();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="flex h-screen bg-slate-100 font-cairo" dir="rtl">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col shadow-xl z-20 transition-all duration-300">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        نظام ERM
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">الإصدار 2.0</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavItem to="/" icon={Home} label="لوحة التحكم" />
                    <NavItem to="/pos" icon={ShoppingCart} label="نقطة البيع" />
                    <NavItem to="/orders" icon={Receipt} label="المبيعات" />
                    <NavItem to="/inventory" icon={Package} label="المخزون" />
                    {isAdmin && (
                        <>
                            <div className="pt-4 pb-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase px-4">الإدارة</p>
                            </div>
                            <NavItem to="/discounts" icon={Percent} label="الخصومات" />
                            <NavItem to="/users" icon={Users} label="المستخدمين" />
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{user?.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{user?.role === 'admin' ? 'مدير عام' : 'مبيعات'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>تسجيل خروج</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 right-0 left-0 bg-white border-t border-slate-200 z-50 px-4 py-2 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <NavItem to="/" icon={Home} label="الرئيسية" />
                <NavItem to="/pos" icon={ShoppingCart} label="نقاط البيع" />
                <NavItem to="/orders" icon={Receipt} label="الطلبات" />
                <NavItem to="/inventory" icon={Package} label="المخزون" />
                {isAdmin && <NavItem to="/users" icon={Users} label="المستخدمين" />}
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50 relative pb-20 md:pb-0">
                <Outlet />
            </main>
        </div>
    );
};

interface NavItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
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
