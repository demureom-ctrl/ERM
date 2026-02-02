
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            toast.success('تم تسجيل الدخول بنجاح');
            // Check role from localstorage or user state if available immediately, 
            // but here we can trust the logic to redirect based on what we just fetched or generic redirect
            // Ideally we check the user object but it depends on state update.
            // Let's redirect to root and let the protected route handle it or check username
            // Since we don't have user state immediately updated in this closure usually, 
            // we can check the result of login if it returns role or we can just redirect to /
            navigate('/');
        } else {
            toast.error('اسم المستخدم أو كلمة المرور غير صحيحة');
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
                    <p>© 2024 نظام إدارة المبيعات</p>
                </div>
            </div>
        </div>
    );
};
