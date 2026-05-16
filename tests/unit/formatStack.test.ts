import { describe, expect, it } from 'vitest';
import { formatStack } from '../../src/lib/formatStack';

describe('formatStack', () => {
  it('joins comma-separated tokens with " · "', () => {
    expect(formatStack('React, TypeScript, Vite')).toBe('React · TypeScript · Vite');
  });

  it('accepts middle dot or comma input interchangeably', () => {
    expect(formatStack('React · TypeScript')).toBe('React · TypeScript');
    expect(formatStack('React,TypeScript')).toBe('React · TypeScript');
    expect(formatStack('React ,  TypeScript ')).toBe('React · TypeScript');
  });

  it('drops empty tokens caused by trailing or doubled separators', () => {
    expect(formatStack('React,, Vite,')).toBe('React · Vite');
  });

  it('returns empty string for empty / nullish input', () => {
    expect(formatStack('')).toBe('');
    expect(formatStack(undefined)).toBe('');
    expect(formatStack(null)).toBe('');
  });

  it('leaves single-token input untouched', () => {
    expect(formatStack('React')).toBe('React');
  });
});
