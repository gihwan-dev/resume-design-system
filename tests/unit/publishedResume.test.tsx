import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { PublishedResumeView } from '../../src/share/PublishedResumeView';

const resume = {
  v: 1,
  name: '별도 이력서',
  theme: 'default',
  pages: [
    {
      id: 'new-page',
      blocks: [
        {
          id: 'new-header',
          type: 'header',
          data: {
            name: '최기환',
            role: 'Frontend Engineer',
            tagline: '',
            contacts: [],
          },
        },
      ],
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('loads the selected public document and links its own PDF', async () => {
  const fetchDocument = vi.fn().mockResolvedValue({ ok: true, json: async () => resume });
  vi.stubGlobal('fetch', fetchDocument);
  render(<PublishedResumeView slug="tossplace-platform-impact" label="Platform용 개선 버전" />);
  await screen.findByText('Frontend Engineer');
  expect(fetchDocument).toHaveBeenCalledWith(
    '/resumes/tossplace-platform-impact.json',
    expect.any(Object),
  );
  expect(screen.getByRole('link', { name: 'PDF 보기' })).toHaveAttribute(
    'href',
    '/resumes/tossplace-platform-impact.pdf',
  );
  expect(screen.getByText('Platform용 개선 버전')).toBeInTheDocument();
});

test('retains the original published resume by default', async () => {
  const fetchDocument = vi.fn().mockResolvedValue({ ok: true, json: async () => resume });
  vi.stubGlobal('fetch', fetchDocument);
  render(<PublishedResumeView />);
  await screen.findByText('Frontend Engineer');
  expect(fetchDocument).toHaveBeenCalledWith(
    '/resumes/tossplace-platform.json',
    expect.any(Object),
  );
  expect(screen.getByRole('link', { name: 'PDF 보기' })).toHaveAttribute(
    'href',
    '/resumes/tossplace-platform.pdf',
  );
});

test('clears a previous document when the selected document fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => resume })
      .mockResolvedValueOnce({ ok: false }),
  );
  const { rerender } = render(<PublishedResumeView />);
  await screen.findByText('Frontend Engineer');
  rerender(<PublishedResumeView slug="tossplace-platform-impact" label="Platform용 개선 버전" />);
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('불러오지 못했습니다'));
  expect(screen.queryByText('Frontend Engineer')).not.toBeInTheDocument();
});
