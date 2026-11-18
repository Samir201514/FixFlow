import { randomBytes } from 'crypto';
export function buildTemporaryTrackingCode(): string {
    return `TMP-${randomBytes(8).toString('hex')}`;
}
export function buildTrackingCode(complaintId: number, createdAt: Date): string {
    const year = createdAt.getFullYear();
    return `FF-${year}-${String(complaintId).padStart(5, '0')}`;
}
