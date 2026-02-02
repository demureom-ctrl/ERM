
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Store, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSalesMode, setIsSalesMode] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = login(username, password);
        if (success) {
            toast.success('تم تسجيل الدخول بنجاح');
            if (username === 'sales') {
                navigate('/pos');
            } else {
                navigate('/');
            }
        } else {
            toast.error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    };

    const setDemoLogin = (role) => {
        if (role === 'admin') {
            setUsername('admin');
            setPassword('admin');
            setIsSalesMode(false);
        } else {
            setUsername('sales');
            setPassword('sales');
            setIsSalesMode(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px]" />

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/50 relative z-10 animate-enter">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 transform rotate-3">
                        <Store className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        مرحباً بك
                    </h1>
                    <p className="text-slate-500">سجل الدخول للمتابعة</p>
                </div>

                <div className="flex gap-2 mb-6 p-1 bg-slate-100/80 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setDemoLogin('sales')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isSalesMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        موظف مبيعات
                    </button>
                    <button
                        type="button"
                        onClick={() => setDemoLogin('admin')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isSalesMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        مدير النظام
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 block text-right">اسم المستخدم</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-right"
                                placeholder="أدخل اسم المستخدم"
                            />
                            <User className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 block text-right">كلمة المرور</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-right"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 mt-6 flex items-center justify-center gap-2"
                    >
                        <span>تسجيل الدخول</span>
                        <ShieldCheck className="w-5 h-5" />
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Admin: admin / admin</p>
                    <p>Sales: sales / sales</p>
                </div>
            </div>
        </div>
    );
};
