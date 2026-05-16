import { css } from '@emotion/react';

/**
 * Print-time overrides — the PDF "parity" CSS.
 *
 * Strategy: the canvas's `.rs-page` is already the exact A4 box.
 * For print we:
 *   - hide builder chrome (anything not inside `.rs-page`)
 *   - lift muted/faint greys a notch (PDF flattening)
 *   - enforce strict 1-page-per-`.rs-page` with no overflow
 *   - strip filters & shadows
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
    body[data-preview='print'] .canvas-wrap {
      background: #fff !important;
      padding: 0 !important;
      overflow: visible !important;
    }
    body[data-preview='print'] .canvas-inner {
      gap: 0 !important;
      padding: 0 !important;
    }
    body[data-preview='print'] .canvas-page {
      box-shadow: none !important;
      margin: 0 !important;
    }
    body[data-preview='print'] .bb-wrap {
      outline: 0 !important;
    }
    body[data-preview='print'] .bb-label,
    body[data-preview='print'] .canvas-page-tag,
    body[data-preview='print'] .canvas-page-actions,
    body[data-preview='print'] .canvas-add-page,
    body[data-preview='print'] .canvas-overflow {
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
    }
    .rs-page:last-of-type {
      page-break-after: auto;
    }

    * {
      filter: none !important;
      backdrop-filter: none !important;
    }
  }
`;
