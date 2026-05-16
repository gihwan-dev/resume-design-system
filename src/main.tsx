import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ShareView } from './share/ShareView';
import { parseShareHash } from './share/shareCodec';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

const shareToken = parseShareHash(window.location.hash);

createRoot(rootEl).render(
  <StrictMode>{shareToken ? <ShareView token={shareToken} /> : <App />}</StrictMode>,
);
