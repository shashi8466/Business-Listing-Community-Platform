import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Keep a clear console error for debugging in Lovable preview
    // eslint-disable-next-line no-console
    console.error("App crashed:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              The app hit a runtime error. Please reload. If it keeps happening, copy the error
              details below and send them here.
            </AlertDescription>
          </Alert>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={this.handleReload}>Reload</Button>
            <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
              Try again
            </Button>
          </div>

          {this.state.error && (
            <details className="mt-6 rounded-lg border border-border bg-card p-4">
              <summary className="cursor-pointer font-medium">Error details</summary>
              <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {this.state.error.name}: {this.state.error.message}
                {this.state.error.stack ? `\n\n${this.state.error.stack}` : ""}
              </pre>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
        </div>
      </div>
    );
  }
}
