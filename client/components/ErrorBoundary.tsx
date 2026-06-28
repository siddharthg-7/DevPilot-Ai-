import { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught exception in Aether cognitive runtime:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background ambient light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full mb-6">
                <AlertOctagon className="h-10 w-10 text-rose-400 animate-pulse" />
              </div>

              <h1 className="text-xl font-semibold text-slate-100 mb-2 font-sans tracking-tight">
                Cognitive Subsystem Halt
              </h1>
              <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
                A critical error occurred within the Aether agent pipeline. The orchestrator was halted safely to prevent state corruption.
              </p>

              {this.state.error && (
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-left mb-6 overflow-x-auto max-h-36">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-500 font-bold block mb-1">
                    Trace log
                  </span>
                  <code className="text-xs text-slate-300 font-mono block whitespace-pre-wrap leading-tight">
                    {this.state.error.message || "Unknown execution crash"}
                  </code>
                </div>
              )}

              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-100 hover:text-white rounded-xl font-medium text-sm transition-all border border-slate-700 shadow-md active:scale-98 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Re-initialize Orchestrator
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
