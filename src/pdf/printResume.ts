/**
 * PDF export entry point — relies on browser-native window.print().
 * The print stylesheet (styles/print.global.ts) hides every `[data-print="hide"]`
 * element when `body[data-preview="print"]` is set, leaving the A4 page
 * subtree as the only thing visible.
 */
export function printResume(): void {
  const previousPreview = document.body.dataset.preview;
  document.body.dataset.preview = 'print';

  const restore = () => {
    if (previousPreview === undefined) {
      delete document.body.dataset.preview;
    } else {
      document.body.dataset.preview = previousPreview;
    }
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);

  // Two RAFs — one for the data-attr to flush, one for fonts/layout settling.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });
}
