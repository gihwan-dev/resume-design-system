import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ShareView } from './share/ShareView';
import { parseShareHash } from './share/shareCodec';
import { PublishedResumeView } from './share/PublishedResumeView';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

const shareToken = parseShareHash(window.location.hash);
const published = /^\/resume\/tossplace-platform\/?$/.test(window.location.pathname);

createRoot(rootEl).render(
  <StrictMode>
    {published ? <PublishedResumeView /> : shareToken ? <ShareView token={shareToken} /> : <App />}
  </StrictMode>,
);
