import type { PersistedState } from '../types';

const KEY = 'supernotes:v1';

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // переполнение квоты — игнорируем для учебного
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
}