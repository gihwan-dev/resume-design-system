import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ShareView } from './share/ShareView';
import { parseShareHash } from './share/shareCodec';
import { PublishedResumeView } from './share/PublishedResumeView';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

const shareToken = parseShareHash(window.location.hash);
const publishedSlug = /^\/resume\/(tossplace-platform(?:-impact)?)\/?$/.exec(
  window.location.pathname,
)?.[1];

createRoot(rootEl).render(
  <StrictMode>
    {publishedSlug ? (
      <PublishedResumeView
        key={publishedSlug}
        slug={publishedSlug}
        label={publishedSlug.endsWith('-impact') ? 'Platform용 개선 버전' : 'Platform용 첫 버전'}
      />
    ) : shareToken ? (
      <ShareView token={shareToken} />
    ) : (
      <App />
    )}
  </StrictMode>,
);
