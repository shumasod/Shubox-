import { Component, type ReactNode } from 'react';
import ServerErrorPage from '../pages/errors/ServerErrorPage';

interface Props  { children: ReactNode }
interface State  { hasError: boolean; message?: string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Log to error tracking in production
    if (process.env.NODE_ENV === 'production') {
      console.error('[ErrorBoundary]', error.message, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage message={this.state.message} />;
    }
    return this.props.children;
  }
}
