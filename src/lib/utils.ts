import { type ClassValue, clsx } from 'clsx';

export function formatCid(cid: string, length = 8): string {
  if (cid.length <= length) return cid;
  return `${cid.slice(0, length)}...`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function validateCid(cid: string): boolean {
  // Basic IPFS CID validation
  if (!cid || cid.length < 10) return false;

  // CIDv0 starts with 'Qm' and is 46 characters
  if (cid.startsWith('Qm') && cid.length === 46) return true;

  // CIDv1 starts with 'b' or other base32 chars
  if (cid.startsWith('b') && cid.length >= 50) return true;

  // Allow other CID formats
  return /^[a-zA-Z0-9]+$/.test(cid) && cid.length >= 20;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  } finally {
    document.body.removeChild(textArea);
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
