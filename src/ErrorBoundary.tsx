import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The visual lab failed to render:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="fallback-page">
          <section className="section-card">
            <p className="eyebrow">Render fallback</p>
            <h1>The Shape of High Dimensions</h1>
            <p className="hero-copy">
              The app loaded, but one interactive visualisation failed to render in this browser.
            </p>
            <div className="explanation-box warning">
              Try refreshing the page. If this persists, open the browser console and share the error message from the visual lab.
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
