/**
 * PDF export entry point — relies on browser-native window.print().
 *
 * Before printing, we look for any `.canvas-page.is-overflow` (set by the
 * canvas overflow measurer). If any page is reporting overflow we surface
 * one confirm so the user can't accidentally print a draft that loses
 * content past the A4 cut. The user can still proceed — sometimes the
 * overflow is intentional whitespace they're about to fix.
 */
export function printResume(): void {
  const overflowing = document.querySelectorAll('.canvas-page.is-overflow').length;
  if (overflowing > 0) {
    const ok = confirm(
      `${overflowing}개 페이지가 A4 영역을 초과합니다.\n` +
        `해당 페이지의 일부 내용이 PDF에서 잘릴 수 있어요.\n\n` +
        `그래도 계속 출력할까요?`,
    );
    if (!ok) return;
  }

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
