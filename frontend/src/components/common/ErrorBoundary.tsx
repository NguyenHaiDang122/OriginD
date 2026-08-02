import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#060913] p-4 font-sans text-white relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-fuchsia-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-fuchsia-500/10 blur-3xl" />
          
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Đã xảy ra sự cố không mong muốn</h2>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              Hệ thống giao diện gặp một chút vấn đề trong quá trình hiển thị. Bạn đừng lo, chức năng và dữ liệu của bạn vẫn an toàn. Hãy thử tải lại trang nhé.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Tải lại trang ngay
            </button>
            <div className="mt-4 flex justify-center">
              <a href="/" className="text-xs text-white/40 hover:text-white transition-colors">Về Trang chủ</a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
