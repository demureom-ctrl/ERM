import React from 'react';
import { AlertTriangle, RefreshCcw, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        window.location.reload();
    };

    handleFactoryReset = async () => {
        if (confirm('هل أنت متأكد؟ سيتم حذف جميع البيانات والعودة للوضع الافتراضي.')) {
            api.resetData();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans" dir="rtl">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 mb-2">عذراً، حدث خطأ غير متوقع</h1>
                        <p className="text-slate-500 mb-8">واجه النظام مشكلة في معالجة طلبك.</p>

                        <div className="bg-slate-50 p-4 rounded-xl text-left mb-8 border border-slate-100 overflow-auto max-h-32">
                            <code className="text-xs text-rose-600 font-mono">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={18} />
                                <span>إعادة تحميل الصفحة</span>
                            </button>

                            <button
                                onClick={this.handleFactoryReset}
                                className="w-full py-3 px-4 rounded-xl text-rose-500 border border-rose-100 hover:bg-rose-50 font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                <span>حذف البيانات والبدء من جديد</span>
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 mt-6">
                            يساعد خيار "حذف البيانات" في حل مشاكل تعارض البيانات المخزنة.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
