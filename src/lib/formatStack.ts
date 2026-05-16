/**
 * Stack fields use `·` (middle dot) as the canonical separator, but `·` is
 * awkward to type on most keyboards. This helper accepts any mix of commas,
 * middle dots, or surrounding whitespace and rewrites the value to the
 * canonical " · " form on the way out. It's intentionally only applied to
 * stack-shaped fields (project/case stacks); rich-text bodies keep commas
 * as commas because users may want them as actual punctuation.
 */
export function formatStack(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .split(/\s*[,·]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' · ');
}
