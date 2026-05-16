import { AppShell } from './app/AppShell';
import { useBootstrap } from './store/bootstrap';
import './blocks';

export default function App() {
  const { ready } = useBootstrap();
  if (!ready) {
    return (
      <div className="splash">
        <div>resume design system</div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>loading…</div>
      </div>
    );
  }
  return <AppShell />;
}
