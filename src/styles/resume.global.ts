import { css } from '@emotion/react';

/**
 * Resume rendering CSS — the `.rs-*` rules consumed by every Block renderer.
 *
 * This is the SAME visual contract the canvas view and the printed PDF use.
 * All values reference CSS variables emitted by ThemeProvider so themes can
 * be swapped without recompiling. Print-time overrides live in print.global.ts.
 */
export const resumeGlobalStyles = css`
  /* ── Semantic typography (class-applied) ─────────────────────── */
  .rs-name {
    font-family: var(--font-sans);
    font-size: var(--fs-name);
    font-weight: var(--fw-semibold);
    letter-spacing: var(--tr-tight);
    line-height: var(--lh-tight);
    color: var(--text-primary);
  }
  .rs-role {
    font-family: var(--font-sans);
    font-size: var(--fs-role);
    font-weight: var(--fw-medium);
    color: var(--text-secondary);
    letter-spacing: 0.01em;
  }
  .rs-contact {
    font-family: var(--font-mono);
    font-size: var(--fs-contact);
    font-weight: var(--fw-regular);
    color: var(--text-muted);
    letter-spacing: 0;
  }
  .rs-intro {
    font-family: var(--font-sans);
    font-size: var(--fs-intro);
    font-weight: var(--fw-regular);
    line-height: var(--lh-body);
    color: var(--text-primary);
    letter-spacing: var(--tr-tight);
    word-break: keep-all;
    white-space: pre-line;
  }
  .rs-section {
    font-family: var(--font-sans);
    font-size: var(--fs-section);
    font-weight: var(--fw-semibold);
    text-transform: uppercase;
    letter-spacing: var(--tr-section);
    color: var(--text-primary);
  }
  .rs-section-meta {
    font-family: var(--font-mono);
    font-size: var(--fs-section-meta);
    text-transform: uppercase;
    letter-spacing: var(--tr-section);
    color: var(--text-faint);
  }
  .rs-project-title {
    font-family: var(--font-sans);
    font-size: var(--fs-project);
    font-weight: var(--fw-semibold);
    line-height: var(--lh-snug);
    color: var(--text-primary);
    letter-spacing: var(--tr-tight);
  }
  .rs-stack {
    font-family: var(--font-mono);
    font-size: var(--fs-stack);
    font-weight: var(--fw-regular);
    color: var(--text-muted);
    letter-spacing: 0;
  }
  .rs-body {
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    font-weight: var(--fw-regular);
    line-height: var(--lh-body);
    color: var(--text-secondary);
    letter-spacing: var(--tr-tight);
    word-break: keep-all;
    white-space: pre-line;
  }
  .rs-bullet {
    font-family: var(--font-sans);
    font-size: var(--fs-bullet);
    font-weight: var(--fw-regular);
    line-height: var(--lh-body);
    color: var(--text-secondary);
    letter-spacing: var(--tr-tight);
    word-break: keep-all;
    white-space: pre-line;
  }
  .rs-emphasis {
    font-family: var(--font-sans);
    font-size: var(--fs-emphasis);
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
  }
  .rs-metric {
    font-family: var(--font-mono);
    font-size: var(--fs-metric);
    font-weight: var(--fw-medium);
    color: var(--accent-primary);
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
  }
  .rs-learning {
    font-family: var(--font-sans);
    font-size: var(--fs-learning);
    font-weight: var(--fw-regular);
    line-height: var(--lh-normal);
    color: var(--text-secondary);
    letter-spacing: var(--tr-tight);
    word-break: keep-all;
    white-space: pre-line;
  }
  .rs-link {
    font-family: var(--font-mono);
    font-size: var(--fs-link);
    color: var(--accent-primary);
    text-decoration: none;
    border-bottom: var(--bw-hair) solid var(--accent-primary);
    letter-spacing: 0;
  }

  /* ── A4 page chrome ──────────────────────────────────────────── */
  .rs-page,
  .rs-page *,
  .rs-page *::before,
  .rs-page *::after {
    box-sizing: border-box;
  }
  .rs-page {
    width: var(--a4-width);
    /* Fixed A4 height on-screen so the page boundary is unambiguous. Content
       that overflows still flows visually (so it stays editable), but the
       canvas wrapper paints a red outline + banner so the user sees the cut. */
    height: var(--a4-height);
    padding: var(--a4-pad-y) var(--a4-pad-x);
    background: var(--bg-page);
    color: var(--text-primary);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    box-shadow: var(--shadow-paper);
    margin: 0 auto;
    position: relative;
    padding-bottom: max(var(--a4-pad-y), 14mm);
    overflow: visible;
  }
  .rs-page.rs-density-compact {
    --gap-section: 18px;
    --gap-block: 10px;
  }

  /* ── Page-break safety ───────────────────────────────────────── */
  .rs-section-header {
    break-after: avoid;
    page-break-after: avoid;
  }
  .rs-project,
  .rs-par-block,
  .rs-impact-item,
  .rs-learning-note,
  .rs-skills,
  .rs-metric-grid {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .rs-section-header + .rs-career,
  .rs-section-header + .rs-project,
  .rs-section-header + .rs-impact,
  .rs-section-header + .rs-skills,
  .rs-section-header + .rs-learning-note,
  .rs-section-header + .rs-links {
    break-before: avoid;
    page-break-before: avoid;
  }
  .rs-career-top,
  .rs-project-top {
    break-after: avoid;
    page-break-after: avoid;
  }

  /* ── Header / Identity ───────────────────────────────────────── */
  .rs-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding-bottom: 16px;
    border-bottom: var(--bw-1) solid var(--text-primary);
    margin-bottom: var(--gap-section);
  }
  .rs-header .rs-tagline {
    margin: 4px 0 10px 0;
    color: var(--text-secondary);
    max-width: 100%;
  }
  .rs-header-contacts {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    font-family: var(--font-mono);
    font-size: var(--fs-contact);
    color: var(--text-muted);
    line-height: 1.5;
  }
  .rs-header-sep {
    color: var(--text-faint);
    margin: 0 8px;
    user-select: none;
  }

  /* ── Positioning Statement ───────────────────────────────────── */
  .rs-positioning {
    margin: 0 0 var(--gap-section) 0;
  }
  .rs-positioning .rs-intro {
    margin: 0;
  }

  /* ── Section Header ──────────────────────────────────────────── */
  .rs-section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-top: 8px;
    margin: var(--gap-section) 0 var(--gap-block) 0;
  }
  .rs-section-header--primary {
    border-top: 1.5px solid var(--text-primary);
  }
  .rs-section-header--secondary {
    border-top: 0.5px solid var(--border-subtle);
  }
  .rs-section-header:first-child,
  .rs-page > .rs-section-header:first-of-type {
    margin-top: 0;
  }

  /* ── Core Impact Summary ─────────────────────────────────────── */
  .rs-impact {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--gap-section) 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .rs-impact-item {
    display: grid;
    grid-template-columns: 22px 1fr;
    column-gap: 0;
    align-items: baseline;
  }
  .rs-impact-num {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: var(--fw-medium);
    color: var(--text-faint);
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
  }

  /* ── Career L1 ───────────────────────────────────────────────── */
  .rs-career {
    margin-bottom: var(--gap-section);
  }
  .rs-career + .rs-career {
    margin-top: calc(-1 * var(--gap-section) + 14px);
    padding-top: 14px;
    border-top: 0.5px solid var(--border-subtle);
  }
  .rs-career-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
  }
  .rs-career-title {
    font-size: 16px;
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
    letter-spacing: var(--tr-tight);
    line-height: 1.3;
  }
  .rs-career-sep {
    color: var(--text-faint);
    margin: 0 6px;
  }
  .rs-career-role {
    color: var(--text-secondary);
    font-weight: var(--fw-medium);
  }
  .rs-career-period {
    color: var(--text-muted);
  }
  .rs-career-summary {
    margin: 4px 0 0 0;
  }
  .rs-career-projects {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── Project L2 ──────────────────────────────────────────────── */
  .rs-project-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
  }
  .rs-project-title {
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
    letter-spacing: var(--tr-tight);
    line-height: var(--lh-snug);
  }
  .rs-project-period {
    color: var(--text-muted);
  }
  .rs-project-stack {
    margin: 3px 0 8px 0;
  }
  .rs-project:not(:has(.rs-project-stack)) .rs-project-pars {
    margin-top: 8px;
  }
  .rs-project-pars {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .rs-project-pars > .rs-par-block + .rs-par-block {
    padding-top: 10px;
    border-top: 0.5px dashed var(--border-subtle);
  }

  /* ── PAR L3 ──────────────────────────────────────────────────── */
  .rs-par-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: var(--fw-semibold);
    text-transform: uppercase;
    letter-spacing: var(--tr-section);
    color: var(--text-faint);
    margin-bottom: 4px;
  }
  .rs-par {
    display: grid;
    grid-template-columns: 64px 1fr;
    column-gap: 16px;
    row-gap: 6px;
    margin: 0;
  }
  .rs-par-key {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
    letter-spacing: var(--tr-section);
    padding-top: 3px;
  }
  .rs-par-val {
    margin: 0;
  }

  /* ── Stack / Skills ──────────────────────────────────────────── */
  .rs-skills {
    display: grid;
    grid-template-columns: 110px 1fr;
    row-gap: 6px;
    column-gap: 16px;
    align-items: baseline;
  }
  .rs-skills-key {
    font-family: var(--font-mono);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: var(--tr-section);
    color: var(--text-primary);
    font-weight: var(--fw-semibold);
  }
  .rs-skills-val {
    line-height: 1.55;
  }

  /* ── Learning Note ───────────────────────────────────────────── */
  .rs-learning-note {
    border-left: 1.5px solid var(--text-primary);
    padding: 2px 0 2px 12px;
    margin-bottom: var(--gap-block);
  }
  .rs-learning-note--minimal {
    border-left-color: var(--text-faint);
  }
  .rs-learning-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
    letter-spacing: var(--tr-section);
    margin-bottom: 4px;
  }

  /* ── Link Row ────────────────────────────────────────────────── */
  .rs-links {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    align-items: center;
  }
  .rs-link-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-sans);
    font-size: var(--fs-link);
    color: var(--text-primary);
    text-decoration: none;
    line-height: 1.4;
    letter-spacing: var(--tr-tight);
  }
  .rs-link-chip-icon {
    width: 14px;
    height: 14px;
    display: inline-block;
    flex: 0 0 auto;
    color: var(--text-muted);
  }
  .rs-link-chip-label {
    border-bottom: var(--bw-hair) solid var(--border-subtle);
    padding-bottom: 1px;
  }
  .rs-link-chip:hover .rs-link-chip-label {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
  }
  /* Legacy cell layout kept for back-compat with the old .rs-link-* classes
     in case any external usage still references them. Safe to remove
     once the wider codebase has migrated. */
  .rs-link-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .rs-link-label {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: var(--tr-section);
    color: var(--text-faint);
  }

  /* ── Inline helpers ──────────────────────────────────────────── */
  .rs-num {
    font-family: var(--font-mono);
    color: var(--accent-primary);
    font-weight: var(--fw-medium);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  /* ── Dividers ────────────────────────────────────────────────── */
  .rs-divider {
    height: var(--bw-1);
    background: var(--border-subtle);
    border: 0;
    margin: 0;
  }
  .rs-divider-strong {
    height: var(--bw-1);
    background: var(--text-primary);
    border: 0;
    margin: 0;
  }

  /* ── Resets ──────────────────────────────────────────────────── */
  .rs-page h1,
  .rs-page h2,
  .rs-page h3,
  .rs-page h4,
  .rs-page p,
  .rs-page ul,
  .rs-page ol,
  .rs-page dl {
    margin: 0;
  }
  .rs-page ul {
    padding-left: 14px;
  }
  .rs-page li {
    padding-left: 2px;
  }
  .rs-page li::marker {
    color: var(--text-faint);
    font-size: 11px;
  }
`;
