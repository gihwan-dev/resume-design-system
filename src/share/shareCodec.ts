import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { deserializeResumeExport, type ResumeExportV1 } from './exportFormat';

/**
 * lz-string의 compressToEncodedURIComponent는 UTF-16 입력을 base64-URL-safe
 * 문자열로 변환한다. 한글 그대로 round-trip 안전.
 */
export function encodeShareData(data: ResumeExportV1): string {
  return compressToEncodedURIComponent(JSON.stringify(data));
}

export function decodeShareData(token: string): ResumeExportV1 | null {
  const raw = decompressFromEncodedURIComponent(token);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = deserializeResumeExport(parsed);
  return result.ok ? result.data : null;
}

export function buildShareUrl(token: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/share?d=${token}`;
}

/** Match '#/share?d=XYZ' (any other query params ignored). */
export function parseShareHash(hash: string): string | null {
  const m = hash.match(/^#\/share\?(?:.*&)?d=([^&]+)/);
  return m?.[1] ?? null;
}
