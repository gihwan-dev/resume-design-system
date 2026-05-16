import { describe, expect, it } from 'vitest';
import { inferAliasFromUrl, parseHostname } from '../../src/lib/linkAlias';

describe('parseHostname', () => {
  it('extracts host from a full URL', () => {
    expect(parseHostname('https://github.com/foo/bar')).toBe('github.com');
  });

  it('strips a leading www.', () => {
    expect(parseHostname('https://www.medium.com/@me')).toBe('medium.com');
  });

  it('accepts scheme-less input', () => {
    expect(parseHostname('github.com/me')).toBe('github.com');
  });

  it('returns null for empty / invalid input', () => {
    expect(parseHostname('')).toBeNull();
    expect(parseHostname(undefined)).toBeNull();
    expect(parseHostname(null)).toBeNull();
    expect(parseHostname('not a url')).toBeNull();
    // No dot in hostname → not a real domain
    expect(parseHostname('http://localhost')).toBeNull();
  });
});

describe('inferAliasFromUrl', () => {
  it('maps well-known services to branded names', () => {
    expect(inferAliasFromUrl('https://github.com/x')).toBe('GitHub');
    expect(inferAliasFromUrl('https://linkedin.com/in/x')).toBe('LinkedIn');
    expect(inferAliasFromUrl('https://twitter.com/x')).toBe('X');
    expect(inferAliasFromUrl('https://x.com/x')).toBe('X');
    expect(inferAliasFromUrl('https://www.notion.so/page')).toBe('Notion');
    expect(inferAliasFromUrl('https://youtu.be/abc')).toBe('YouTube');
  });

  it('falls back to the raw hostname for unknown domains', () => {
    expect(inferAliasFromUrl('https://my-blog.dev/post')).toBe('my-blog.dev');
  });

  it('returns empty string for invalid input', () => {
    expect(inferAliasFromUrl('')).toBe('');
    expect(inferAliasFromUrl('not a url')).toBe('');
    expect(inferAliasFromUrl(null)).toBe('');
  });
});
