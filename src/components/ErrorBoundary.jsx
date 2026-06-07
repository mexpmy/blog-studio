import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-8">
          <div className="max-w-2xl w-full bg-zinc-900 border border-red-500/50 rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
            
            <p className="text-zinc-300 mb-6">
              An error occurred while rendering the application. This is likely related to the new Monitor tab or recent changes.
            </p>

            {this.state.error && (
              <div className="bg-zinc-950 rounded-lg p-4 mb-4 overflow-auto">
                <p className="font-mono text-sm text-red-300 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
                Show stack trace
              </summary>
              <pre className="mt-2 text-xs text-zinc-400 bg-zinc-950 p-4 rounded overflow-auto max-h-64">
                {this.state.errorInfo?.componentStack || 'No stack available'}
              </pre>
            </details>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition"
            >
              Reload Page
            </button>

            <p className="mt-4 text-xs text-zinc-500">
              Tip: Open DevTools (F12) → Console tab for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;