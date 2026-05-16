import type { Theme } from './tokens';

/**
 * Flatten a Theme into a `:root { --token: value; }` CSS string.
 * Keeping the variable names identical to the reference design system
 * is intentional — the `.rs-*` stylesheet (styles/resume.global.ts)
 * references these names directly.
 */
export function themeToCssVars(theme: Theme): string {
  const lines: string[] = [];
  const push = (name: string, value: string | number) => {
    lines.push(`  ${name}: ${value};`);
  };

  // text
  push('--text-primary', theme.colors.text.primary);
  push('--text-secondary', theme.colors.text.secondary);
  push('--text-muted', theme.colors.text.muted);
  push('--text-faint', theme.colors.text.faint);
  push('--text-inverse', theme.colors.text.inverse);

  // surface
  push('--bg-page', theme.colors.surface.page);
  push('--bg-soft', theme.colors.surface.soft);
  push('--bg-paper', theme.colors.surface.paper);
  push('--bg-code', theme.colors.surface.code);

  // border
  push('--border-subtle', theme.colors.border.subtle);
  push('--border-strong', theme.colors.border.strong);
  push('--border-accent', theme.colors.border.accent);

  // accent
  push('--accent-primary', theme.colors.accent.primary);
  push('--accent-soft', theme.colors.accent.soft);
  push('--accent-on', theme.colors.accent.on);

  // chrome
  push('--chrome-bg', theme.colors.chrome.bg);
  push('--chrome-panel', theme.colors.chrome.panel);
  push('--chrome-panel-border', theme.colors.chrome.panelBorder);
  push('--chrome-hover', theme.colors.chrome.hover);
  push('--chrome-selected', theme.colors.chrome.selected);
  push('--chrome-danger', theme.colors.chrome.danger);
  push('--chrome-success', theme.colors.chrome.success);
  push('--chrome-tag-bg', theme.colors.chrome.tagBg);

  // fonts
  push('--font-sans', theme.fonts.sans);
  push('--font-mono', theme.fonts.mono);

  // font sizes
  push('--fs-name', theme.fontSize.name);
  push('--fs-role', theme.fontSize.role);
  push('--fs-contact', theme.fontSize.contact);
  push('--fs-intro', theme.fontSize.intro);
  push('--fs-section', theme.fontSize.section);
  push('--fs-section-meta', theme.fontSize.sectionMeta);
  push('--fs-project', theme.fontSize.project);
  push('--fs-stack', theme.fontSize.stack);
  push('--fs-body', theme.fontSize.body);
  push('--fs-bullet', theme.fontSize.bullet);
  push('--fs-emphasis', theme.fontSize.emphasis);
  push('--fs-metric', theme.fontSize.metric);
  push('--fs-learning', theme.fontSize.learning);
  push('--fs-link', theme.fontSize.link);

  // weight
  push('--fw-regular', theme.fontWeight.regular);
  push('--fw-medium', theme.fontWeight.medium);
  push('--fw-semibold', theme.fontWeight.semibold);
  push('--fw-bold', theme.fontWeight.bold);

  // line-height
  push('--lh-tight', theme.lineHeight.tight);
  push('--lh-snug', theme.lineHeight.snug);
  push('--lh-normal', theme.lineHeight.normal);
  push('--lh-body', theme.lineHeight.body);
  push('--lh-loose', theme.lineHeight.loose);

  // tracking
  push('--tr-tight', theme.tracking.tight);
  push('--tr-normal', theme.tracking.normal);
  push('--tr-section', theme.tracking.section);

  // space
  push('--sp-0', theme.space[0]);
  push('--sp-1', theme.space[1]);
  push('--sp-2', theme.space[2]);
  push('--sp-3', theme.space[3]);
  push('--sp-4', theme.space[4]);
  push('--sp-5', theme.space[5]);
  push('--sp-6', theme.space[6]);
  push('--sp-7', theme.space[7]);
  push('--sp-8', theme.space[8]);
  push('--sp-9', theme.space[9]);
  push('--sp-10', theme.space[10]);
  push('--sp-11', theme.space[11]);
  push('--sp-12', theme.space[12]);

  // gap
  push('--gap-section', theme.gap.section);
  push('--gap-block', theme.gap.block);
  push('--gap-paragraph', theme.gap.paragraph);
  push('--gap-bullet', theme.gap.bullet);

  // a4
  push('--a4-width', theme.a4.width);
  push('--a4-height', theme.a4.height);
  push('--a4-pad-x', theme.a4.padX);
  push('--a4-pad-y', theme.a4.padY);
  push('--content-w', theme.a4.contentW);

  // border width
  push('--bw-hair', theme.borderWidth.hair);
  push('--bw-1', theme.borderWidth.thin);
  push('--bw-2', theme.borderWidth.medium);

  // radius
  push('--radius-0', theme.radius.none);
  push('--radius-1', theme.radius.sm);
  push('--radius-2', theme.radius.md);
  push('--radius-pill', theme.radius.pill);

  // shadow
  push('--shadow-paper', theme.shadow.paper);

  return `:root {\n${lines.join('\n')}\n}`;
}
