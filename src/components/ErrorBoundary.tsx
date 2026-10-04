import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || 'حدث خطأ غير متوقع' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('kids_edu_children');
      localStorage.removeItem('kids_edu_active_child_id');
      localStorage.removeItem('kids_edu_attempts');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 text-center font-sans" dir="rtl">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border-2 border-amber-300 shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl mx-auto">
              🎈
            </div>
            <h2 className="text-2xl font-black text-slate-800">عالم الحروف والأرقام</h2>
            <p className="text-sm text-slate-600 font-medium">
              نأسف لحدوث هذا الخطأ البسيط. اضغط على الزر أدناه لإعادة تشغيل الموقع فوراً.
            </p>
            {this.state.errorMessage && (
              <div className="p-2 bg-slate-100 rounded-xl text-[11px] font-mono text-slate-500 overflow-x-auto">
                {this.state.errorMessage}
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl text-sm transition-all shadow-sm cursor-pointer"
              >
                إعادة تحميل الصفحة
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all cursor-pointer"
              >
                إعادة ضبط البيانات وبدء تجربة جديدة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
