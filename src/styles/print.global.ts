import { css } from '@emotion/react';

/**
 * Print-time overrides — the PDF "parity" CSS.
 *
 * Why so many display/overflow resets:
 *   The on-screen builder uses flexbox + overflow:auto on the wrappers
 *   that contain the resume pages. Browsers reliably break `page-break-after`
 *   inside flex containers or inside scroll containers — that's why a
 *   naive print emitted only the first page. We collapse every ancestor of
 *   `.rs-page` to plain block + visible overflow at print time so each
 *   `.rs-page` is a direct, flow-level child for the paginator.
 */
export const printGlobalStyles = css`
  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    html,
    body {
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0 !important;
      padding: 0 !important;
    }

    :root {
      --text-muted: #45454b;
      --text-faint: #595961;
    }

    /* Hide every builder chrome surface. The canvas page subtree opts back in. */
    body[data-preview='print'] [data-print='hide'],
    body[data-preview='print'] .app-chrome {
      display: none !important;
    }

    /* Flatten every ancestor of .rs-page into plain block flow so the
       browser paginator can apply page-break rules to each page. */
    body[data-preview='print'] #root,
    body[data-preview='print'] .app,
    body[data-preview='print'] .app-body,
    body[data-preview='print'] .canvas-wrap,
    body[data-preview='print'] .canvas-inner,
    body[data-preview='print'] .canvas-page {
      display: block !important;
      height: auto !important;
      max-height: none !important;
      min-height: 0 !important;
      overflow: visible !important;
      padding: 0 !important;
      margin: 0 !important;
      gap: 0 !important;
      background: #fff !important;
      flex: none !important;
      width: auto !important;
    }

    body[data-preview='print'] .bb-wrap {
      outline: 0 !important;
    }
    body[data-preview='print'] .bb-label,
    body[data-preview='print'] .canvas-page-tag,
    body[data-preview='print'] .canvas-page-actions,
    body[data-preview='print'] .canvas-add-page,
    body[data-preview='print'] .canvas-overflow,
    body[data-preview='print'] .canvas-overflow-banner,
    body[data-preview='print'] .bb-actions {
      display: none !important;
    }

    .rs-page {
      width: var(--a4-width);
      height: var(--a4-height);
      min-height: 0;
      box-shadow: none;
      margin: 0;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      outline: 0 !important;
    }
    .rs-page:last-of-type {
      page-break-after: auto;
      break-after: auto;
    }

    * {
      filter: none !important;
      backdrop-filter: none !important;
    }
  }
`;
