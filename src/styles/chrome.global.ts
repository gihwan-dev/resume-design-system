import { css } from '@emotion/react';

/**
 * Builder chrome — the editor UI that wraps the resume preview.
 * Everything here is hidden in print via `[data-print="hide"]` or
 * the `.app-chrome` ancestor (see print.global.ts).
 */
export const chromeGlobalStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  html,
  body,
  #root {
    height: 100%;
    margin: 0;
    padding: 0;
    background: var(--bg-paper);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 13px;
    line-height: 1.45;
  }
  button {
    font: inherit;
    color: inherit;
  }

  .splash {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    gap: 6px;
  }

  /* ── App shell ───────────────────────────────────────────────── */
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--chrome-bg);
  }
  .app[data-preview='true'] .panel-left,
  .app[data-preview='true'] .panel-right {
    display: none;
  }

  .app-body {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  /* ── Topbar ──────────────────────────────────────────────────── */
  .topbar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    background: var(--chrome-panel);
    border-bottom: 1px solid var(--chrome-panel-border);
    z-index: 10;
  }
  .topbar-section {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .topbar-brand {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.04em;
  }

  .menu-anchor {
    position: relative;
    display: inline-block;
  }
  .menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 220px;
    background: var(--chrome-panel);
    border: 1px solid var(--chrome-panel-border);
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(24, 24, 27, 0.08);
    padding: 4px 0;
    z-index: 100;
  }
  .menu.right {
    left: auto;
    right: 0;
  }
  .menu-header {
    font-family: var(--font-mono);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-faint);
    padding: 6px 10px 4px 10px;
  }
  .menu-sep {
    height: 1px;
    background: var(--chrome-panel-border);
    margin: 4px 0;
  }
  .menu-item {
    padding: 6px 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    font-size: 12.5px;
    color: var(--text-secondary);
  }
  .menu-item:hover {
    background: var(--chrome-hover);
  }
  .menu-item.is-current {
    background: var(--chrome-selected);
    color: var(--text-primary);
  }
  .menu-item .meta {
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--text-faint);
  }

  .save-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.04em;
    color: var(--text-faint);
    padding: 0 6px;
    user-select: none;
  }
  .save-indicator .dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
    display: inline-block;
  }
  .save-indicator.is-saving {
    color: var(--text-muted);
  }
  .save-indicator.is-saving .dot {
    background: var(--text-muted);
    animation: rds-save-pulse 1s ease-in-out infinite;
  }
  .save-indicator.is-saved {
    color: var(--chrome-success);
  }
  .save-indicator.is-error {
    color: var(--chrome-danger);
  }
  @keyframes rds-save-pulse {
    0%,
    100% {
      opacity: 0.35;
    }
    50% {
      opacity: 1;
    }
  }

  .resume-picker {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid var(--chrome-panel-border);
    border-radius: 4px;
    padding: 4px 10px;
    cursor: pointer;
    font-weight: 500;
    color: var(--text-primary);
    max-width: 280px;
  }
  .resume-picker .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .resume-picker .caret {
    color: var(--text-faint);
    font-size: 10px;
  }

  /* ── Buttons ─────────────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 10px;
    border-radius: 4px;
    border: 1px solid var(--chrome-panel-border);
    background: var(--chrome-panel);
    color: var(--text-primary);
    cursor: pointer;
    font-size: 12px;
    transition: background 80ms ease;
  }
  .btn:hover {
    background: var(--chrome-hover);
  }
  .btn-primary {
    background: var(--accent-primary);
    color: var(--accent-on);
    border-color: var(--accent-primary);
  }
  .btn-primary:hover {
    filter: brightness(1.08);
  }
  .btn-ghost {
    border-color: transparent;
    background: transparent;
  }
  .btn-icon {
    width: 26px;
    height: 26px;
    padding: 0;
    justify-content: center;
  }
  .btn-danger {
    color: var(--chrome-danger);
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ── Panels (sidebar / inspector) ────────────────────────────── */
  .panel {
    flex: 0 0 auto;
    width: 290px;
    background: var(--chrome-panel);
    border-right: 1px solid var(--chrome-panel-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .panel-right {
    border-right: 0;
    border-left: 1px solid var(--chrome-panel-border);
    width: 320px;
  }
  .panel-tabs {
    display: flex;
    border-bottom: 1px solid var(--chrome-panel-border);
    flex: 0 0 auto;
  }
  .panel-tab {
    flex: 1;
    padding: 9px 12px;
    text-align: center;
    font-size: 12px;
    color: var(--text-muted);
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .panel-tab.is-active {
    color: var(--text-primary);
    border-bottom-color: var(--text-primary);
    font-weight: 500;
  }
  .panel-body {
    flex: 1;
    overflow: auto;
    padding: 12px;
  }
  .panel-section-title {
    font-family: var(--font-mono);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-faint);
    margin-bottom: 10px;
  }

  /* ── Palette ─────────────────────────────────────────────────── */
  .palette {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .palette-item {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 10px;
    border: 1px solid var(--chrome-panel-border);
    border-radius: 4px;
    cursor: grab;
    background: var(--chrome-panel);
  }
  .palette-item:hover {
    background: var(--chrome-hover);
  }
  .pi-icon {
    width: 26px;
    height: 26px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--chrome-tag-bg);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-primary);
  }
  .pi-body {
    flex: 1;
    min-width: 0;
  }
  .pi-name {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-primary);
  }
  .pi-hint {
    font-size: 11px;
    color: var(--text-faint);
  }

  /* ── Outline tree ────────────────────────────────────────────── */
  .outline {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .outline-page {
    border: 1px solid var(--chrome-panel-border);
    border-radius: 4px;
    background: var(--chrome-panel);
    overflow: hidden;
  }
  .outline-page-title {
    padding: 6px 10px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-faint);
    background: var(--chrome-hover);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .outline-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    font-size: 12.5px;
    color: var(--text-secondary);
    cursor: pointer;
    border-top: 1px solid var(--chrome-panel-border);
  }
  .outline-row:hover {
    background: var(--chrome-hover);
  }
  .outline-row.is-selected {
    background: var(--chrome-selected);
    color: var(--text-primary);
  }
  .outline-row.is-overflow {
    color: var(--chrome-danger);
  }
  .outline-row .label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .outline-row .ord {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-faint);
    width: 22px;
  }

  /* ── Canvas ──────────────────────────────────────────────────── */
  .canvas-wrap {
    flex: 1;
    overflow: auto;
    padding: 24px;
    background: var(--bg-paper);
    min-width: 0;
  }
  .canvas-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .canvas-page {
    position: relative;
  }
  .canvas-page-tag {
    position: absolute;
    top: -22px;
    left: 0;
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--text-faint);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .canvas-page-actions {
    position: absolute;
    top: -28px;
    right: 0;
    display: flex;
    gap: 4px;
  }
  .canvas-add-page {
    margin-top: 6px;
    padding: 10px 16px;
    border: 1px dashed var(--chrome-panel-border);
    border-radius: 6px;
    background: transparent;
    color: var(--text-faint);
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .canvas-add-page:hover {
    color: var(--text-primary);
    border-color: var(--text-primary);
  }
  .canvas-overflow {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1.5px dashed var(--chrome-danger);
    pointer-events: none;
    z-index: 1;
  }
  .canvas-overflow .co-label {
    position: absolute;
    top: -12px;
    right: 8px;
    font-family: var(--font-mono);
    font-size: 9.5px;
    color: var(--chrome-danger);
    background: var(--chrome-panel);
    padding: 1px 6px;
    border-radius: 3px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .canvas-page.is-overflow .rs-page {
    outline: 2px solid var(--chrome-danger);
    outline-offset: -2px;
  }
  .canvas-overflow-banner {
    position: absolute;
    top: -22px;
    right: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #fff;
    background: var(--chrome-danger);
    padding: 3px 8px;
    border-radius: 3px;
    z-index: 5;
    white-space: nowrap;
  }
  .canvas-overflow-banner .dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
    opacity: 0.9;
  }
  .rs-page.is-drop-target {
    outline: 2px dashed var(--accent-primary);
    outline-offset: -8px;
  }

  /* ── Block wrap (selection chrome around each rendered block) ── */
  .bb-wrap {
    position: relative;
    outline: 1px solid transparent;
    outline-offset: 0;
    border-radius: 2px;
  }
  .bb-wrap.is-hover {
    outline-color: var(--chrome-panel-border);
  }
  .bb-wrap.is-selected {
    outline-color: var(--accent-primary);
  }
  .bb-label {
    position: absolute;
    top: -16px;
    left: -1px;
    background: var(--accent-primary);
    color: var(--accent-on);
    font-family: var(--font-mono);
    font-size: 9.5px;
    padding: 1px 6px;
    border-radius: 2px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0;
    pointer-events: none;
    z-index: 2;
  }
  .bb-wrap.is-selected .bb-label,
  .bb-wrap.is-hover .bb-label {
    opacity: 1;
  }
  .bb-actions {
    position: absolute;
    top: -16px;
    right: -1px;
    display: flex;
    gap: 2px;
    opacity: 0;
    pointer-events: none;
    z-index: 2;
  }
  .bb-wrap.is-selected .bb-actions,
  .bb-wrap.is-hover .bb-actions {
    opacity: 1;
    pointer-events: auto;
  }
  .bb-action {
    background: var(--accent-primary);
    color: var(--accent-on);
    border: 0;
    font-family: var(--font-mono);
    font-size: 11px;
    width: 18px;
    height: 16px;
    border-radius: 2px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
  }
  .bb-action:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .bb-action:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  /* ── Inspector forms ─────────────────────────────────────────── */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .field-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-faint);
  }
  .field-input,
  .field-textarea {
    width: 100%;
    border: 1px solid var(--chrome-panel-border);
    border-radius: 4px;
    background: var(--chrome-panel);
    color: var(--text-primary);
    padding: 6px 8px;
    font: inherit;
    font-size: 12.5px;
    font-family: var(--font-sans);
    resize: vertical;
  }
  .field-input:focus,
  .field-textarea:focus {
    outline: 2px solid var(--accent-primary);
    outline-offset: -1px;
    border-color: transparent;
  }
  .field-mono {
    font-family: var(--font-mono);
  }
  .field-hint {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-faint);
  }
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 6px;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: var(--chrome-tag-bg);
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-primary);
  }
  .tag .x {
    cursor: pointer;
    color: var(--text-faint);
  }
  .tag .x:hover {
    color: var(--chrome-danger);
  }

  .sub-card {
    border: 1px solid var(--chrome-panel-border);
    border-radius: 5px;
    padding: 10px;
    background: var(--bg-paper);
    margin-bottom: 8px;
  }
  .sub-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .sub-card-title {
    font-family: var(--font-mono);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }
  .sub-card-preview {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed var(--chrome-panel-border);
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
  }
  .icon-btn {
    border: 0;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }
  .icon-btn:hover {
    background: var(--chrome-hover);
  }
  .icon-btn.danger {
    color: var(--chrome-danger);
  }
  .icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .empty-state {
    color: var(--text-faint);
    font-size: 12px;
    text-align: center;
    padding: 32px 0;
  }

  /* ── DnD ─────────────────────────────────────────────────────── */
  .drop-zone {
    height: 6px;
    border-radius: 3px;
    margin: 1px 0;
    transition: background 80ms ease;
  }
  .drop-zone.is-over {
    background: var(--accent-soft);
  }
  .drop-slot {
    position: relative;
    height: 6px;
    margin: -3px 0;
    z-index: 3;
    pointer-events: auto;
  }
  .drop-slot::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 0;
    background: var(--accent-primary);
    border-radius: 2px;
    transition:
      height 80ms ease,
      box-shadow 80ms ease;
  }
  .drop-slot.is-over::after {
    height: 3px;
    box-shadow: 0 0 0 2px var(--accent-soft);
  }
  .bb-wrap.is-dragging {
    opacity: 0.4;
  }

  /* ── Snapshots tray ──────────────────────────────────────────── */
  .snap-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 0;
  }
  .snap-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    font-size: 12px;
    color: var(--text-secondary);
  }
  .snap-row .meta {
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--text-faint);
  }
  .snap-actions {
    display: flex;
    gap: 4px;
  }

  /* ── Share / Copy-Paste ──────────────────────────────────────── */
  .share-toast {
    position: fixed;
    top: 56px;
    right: 18px;
    background: var(--text-primary);
    color: var(--bg-paper);
    padding: 8px 14px;
    border-radius: 4px;
    font-size: 12.5px;
    box-shadow: 0 8px 24px rgba(24, 24, 27, 0.18);
    z-index: 200;
    animation: rds-toast-in 120ms ease-out;
  }
  @keyframes rds-toast-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .share-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(24, 24, 27, 0.45);
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .share-modal {
    width: min(560px, 100%);
    max-height: 80vh;
    background: var(--chrome-panel);
    border: 1px solid var(--chrome-panel-border);
    border-radius: 8px;
    box-shadow: 0 24px 48px rgba(24, 24, 27, 0.24);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .share-modal-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--chrome-panel-border);
    font-weight: 600;
    font-size: 13px;
    color: var(--text-primary);
  }
  .share-modal-body {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
  }
  .share-modal-hint {
    font-size: 12px;
    color: var(--text-muted);
  }
  .share-modal-textarea {
    min-height: 220px;
    border: 1px solid var(--chrome-panel-border);
    border-radius: 4px;
    background: var(--bg-paper);
    color: var(--text-primary);
    padding: 8px 10px;
    font: inherit;
    font-family: var(--font-mono);
    font-size: 11.5px;
    line-height: 1.5;
    resize: vertical;
  }
  .share-modal-textarea:focus {
    outline: 2px solid var(--accent-primary);
    outline-offset: -1px;
    border-color: transparent;
  }
  .share-modal-error {
    color: var(--chrome-danger);
    font-size: 12px;
    background: rgba(220, 38, 38, 0.08);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: 4px;
    padding: 6px 10px;
  }
  .share-modal-preview {
    color: var(--text-secondary);
    font-size: 12.5px;
    background: var(--chrome-hover);
    border-radius: 4px;
    padding: 6px 10px;
  }
  .share-modal-actions {
    padding: 10px 16px;
    border-top: 1px solid var(--chrome-panel-border);
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  /* ── Share viewer (read-only mode) ───────────────────────────── */
  body[data-mode='share'] .topbar,
  body[data-mode='share'] .panel-left,
  body[data-mode='share'] .panel-right,
  body[data-mode='share'] .canvas-add-page,
  body[data-mode='share'] .canvas-page-tag,
  body[data-mode='share'] .canvas-page-actions,
  body[data-mode='share'] .canvas-overflow,
  body[data-mode='share'] .canvas-overflow-banner,
  body[data-mode='share'] [data-print='hide'] {
    display: none !important;
  }
  .canvas-wrap.is-share {
    padding: 24px 24px 48px;
  }
  .share-body {
    flex: 1;
    min-height: 0;
    display: flex;
  }
  .block-wrap.is-readonly {
    user-select: text;
  }

  .share-error {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }
  .share-error-card {
    max-width: 420px;
    text-align: center;
    background: var(--chrome-panel);
    border: 1px solid var(--chrome-panel-border);
    border-radius: 8px;
    padding: 28px 28px 24px;
  }
  .share-error-card h2 {
    margin: 0 0 8px;
    font-size: 15px;
    color: var(--text-primary);
  }
  .share-error-card p {
    margin: 0;
    color: var(--text-muted);
    font-size: 12.5px;
    line-height: 1.6;
  }
`;
