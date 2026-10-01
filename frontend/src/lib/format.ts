import type { PublicUser } from '@/types/connection.types';

// Accepts either backend enum style ("A_POSITIVE") or display style ("A+").
export function formatBloodGroup(bg?: string): string {
  if (!bg) return '';
  return bg
    .replace('_POSITIVE', '+')
    .replace('_NEGATIVE', '-')
    .trim()
    .toUpperCase();
}

export function formatLocation(user?: Pick<PublicUser, 'city' | 'subDivision' | 'district'> | null): string {
  if (!user) return '';
  return [user.city, user.subDivision, user.district].filter(Boolean).join(', ');
}

export function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function timeAgo(date?: string): string {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function formatTime(date?: string): string {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * The authenticated account id. Read from the access token's `sub` claim
 * because /users/me returns `_id` while /auth/login returns `id`.
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded?.sub ? String(decoded.sub) : null;
  } catch {
    return null;
  }
}

/** Resolves a populated-or-raw reference to its id. */
export function refId(ref: PublicUser | string | null | undefined): string {
  if (!ref) return '';
  return typeof ref === 'string' ? ref : ref._id;
}
