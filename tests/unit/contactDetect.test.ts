import { describe, expect, it } from 'vitest';
import { detectContact, detectContactKind } from '../../src/lib/contactDetect';

describe('detectContactKind', () => {
  it('recognises plain emails', () => {
    expect(detectContactKind('me@example.com')).toBe('email');
    expect(detectContactKind('foo.bar+tag@sub.example.co.kr')).toBe('email');
  });

  it('recognises URLs with or without scheme', () => {
    expect(detectContactKind('https://github.com/me')).toBe('url');
    expect(detectContactKind('github.com/me')).toBe('url');
    expect(detectContactKind('www.notion.so/x')).toBe('url');
  });

  it('recognises Korean / international phone shapes', () => {
    expect(detectContactKind('+82 10 0000 0000')).toBe('phone');
    expect(detectContactKind('010-1234-5678')).toBe('phone');
    expect(detectContactKind('(02) 555 0100')).toBe('phone');
  });

  it("doesn't misclassify short numbers or words", () => {
    expect(detectContactKind('1234')).toBe('text');
    expect(detectContactKind('hello world')).toBe('text');
    expect(detectContactKind('')).toBe('text');
  });
});

describe('detectContact href shaping', () => {
  it('produces mailto: for emails', () => {
    expect(detectContact('me@example.com').href).toBe('mailto:me@example.com');
  });

  it('produces tel: with separators stripped', () => {
    expect(detectContact('+82 10-1234-5678').href).toBe('tel:+821012345678');
  });

  it('promotes scheme-less URLs to https', () => {
    expect(detectContact('github.com/me').href).toBe('https://github.com/me');
  });

  it('keeps the original scheme when present', () => {
    expect(detectContact('http://example.test').href).toBe('http://example.test');
  });
});
