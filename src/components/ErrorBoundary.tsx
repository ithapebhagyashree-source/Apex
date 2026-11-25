import React from 'react';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  fallbackMessage?: string;
  compact?: boolean;
  onNavigateHome?: () => void;
  homeLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'An unexpected rendering issue occurred.';
    return {
      hasError: true,
      errorMessage: message,
    };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught rendering error:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const {
      title = 'Unable to load this section',
      fallbackMessage = 'Something went wrong while rendering this view. Your saved progress and local data are safe.',
      compact = false,
      onNavigateHome,
      homeLabel = 'Return to Progress',
    } = this.props;

    if (compact) {
      return (
        <div
          role="alert"
          className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">{title}</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {fallbackMessage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="min-h-[44px] px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Chart</span>
          </button>
        </div>
      );
    }

    return (
      <section
        role="alert"
        className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto my-4 space-y-5"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#e11d48]/15 border border-[#e11d48]/35 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#fb7185]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {fallbackMessage}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={this.handleReset}
            className="min-h-[44px] px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {onNavigateHome && (
            <button
              type="button"
              onClick={() => {
                this.handleReset();
                onNavigateHome();
              }}
              className="min-h-[44px] px-4 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{homeLabel}</span>
            </button>
          )}
        </div>
      </section>
    );
  }
}
