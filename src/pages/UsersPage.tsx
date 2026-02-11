import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, ActivityLog } from '../types';
import { Users, UserPlus, Trash2, Activity, Shield, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // New User State
    const [newUser, setNewUser] = useState<Partial<User>>({
        name: '',
        username: '',
        password: '',
        role: 'sales'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, logsData] = await Promise.all([
                api.getUsers(),
                api.getLogs()
            ]);
            setUsers(usersData);
            setLogs(logsData);
        } catch (error) {
            console.error(error);
            toast.error('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!newUser.name || !newUser.username || !newUser.password) {
                toast.error('يرجى ملء جميع الحقول');
                return;
            }

            await api.addUser(newUser);

            // Log this action
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            await api.logActivity(currentUser, 'إضافة مستخدم', { added_user: newUser.username || '' });

            toast.success('تمت إضافة المستخدم بنجاح');
            setShowAddModal(false);
            setNewUser({ name: '', username: '', password: '', role: 'sales' });
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء الإضافة');
        }
    };

    const handleDeleteUser = async (id: string, username: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

        try {
            await api.deleteUser(id);

            // Log this action
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            await api.logActivity(currentUser, 'حذف مستخدم', { deleted_user: username });

            toast.success('تم حذف المستخدم');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('فشل الحذف');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Users className="text-indigo-600" size={32} />
                        إدارة المستخدمين
                    </h1>
                    <p className="text-slate-500 mt-2">إضافة وحذف المستخدمين وتتبع النشاطات</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <UserPlus size={20} />
                    مستخدم جديد
                </button>
            </header>


            {
                loading ? (
                    <div className="flex items-center justify-center py-20">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Users List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Shield size={24} className="text-emerald-600" />
                                المستخدمين الحاليين
                            </h2>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right">
                                        <thead className="bg-slate-50 text-slate-500 text-sm">
                                            <tr>
                                                <th className="p-4 font-bold">الاسم</th>
                                                <th className="p-4 font-bold">اسم المستخدم</th>
                                                <th className="p-4 font-bold">الدور</th>
                                                <th className="p-4 font-bold">تاريخ الانشاء</th>
                                                <th className="p-4 font-bold">إجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 font-medium text-slate-900">{user.name}</td>
                                                    <td className="p-4 text-slate-600 font-mono text-sm bg-slate-50 rounded w-fit px-2 py-1">{user.username}</td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {user.role === 'admin' ? 'مدير عام' : 'مبيعات'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-slate-500 text-sm">
                                                        {new Date(user.created_at || Date.now()).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                            disabled={user.username === 'admin'}
                                                            title={user.username === 'admin' ? "لا يمكن حذف المدير الرئيسي" : "حذف"}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Activity Logs */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Activity size={24} className="text-orange-500" />
                                سجل النشاطات (آخر 100)
                            </h2>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 h-[600px] overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    {logs.map((log) => (
                                        <div key={log.id} className="flex gap-3 relative pb-4 border-b border-slate-50 last:border-0">
                                            <div className="mt-1">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs ring-2 ring-white shadow-sm">
                                                    {log.username.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-slate-800 text-sm">{log.username}</span>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {new Date(log.created_at || Date.now()).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-0.5">{log.action}</p>
                                                {log.details && Object.keys(log.details).length > 0 && (
                                                    <pre className="mt-2 text-[10px] bg-slate-50 p-2 rounded border border-slate-100 text-slate-500 font-mono">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add User Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn">
                            <h2 className="text-2xl font-bold mb-6 text-slate-800">إضافة مستخدم جديد</h2>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">اسم المستخدم (للدخول)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الصلاحية</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewUser({ ...newUser, role: 'sales' })}
                                            className={`p-3 rounded-xl border font-medium transition-all ${newUser.role === 'sales'
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            موظف مبيعات
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewUser({ ...newUser, role: 'admin' })}
                                            className={`p-3 rounded-xl border font-medium transition-all ${newUser.role === 'admin'
                                                ? 'bg-purple-50 border-purple-500 text-purple-700'
                                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            مدير نظام
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 border border-slate-200"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                    >
                                        حفظ المستخدم
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
