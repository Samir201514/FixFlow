import { randomBytes } from 'crypto';

// placeholder used for the first insert, replaced once the id is known
export function buildTemporaryTrackingCode(): string {
  return `TMP-${randomBytes(8).toString('hex')}`;
}

// FF-<year>-<id padded to 5>
export function buildTrackingCode(complaintId: number, createdAt: Date): string {
  const year = createdAt.getFullYear();
  return `FF-${year}-${String(complaintId).padStart(5, '0')}`;
}
