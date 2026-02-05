import { Injectable } from '@angular/core';

const STORAGE_KEY = 'music_search_history';
const MAX_HISTORY = 5;

@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  private key = STORAGE_KEY;

  addTerm(term: string): void {
    if (!term) return;
    const normalized = term.trim();
    if (!normalized) return;

    const current = this.getHistory();
    // remove existing case-insensitive duplicate
    const idx = current.findIndex(t => t.toLowerCase() === normalized.toLowerCase());
    if (idx !== -1) current.splice(idx, 1);

    current.unshift(normalized);
    if (current.length > MAX_HISTORY) current.splice(MAX_HISTORY);

    try {
      localStorage.setItem(this.key, JSON.stringify(current));
    } catch (e) {
      // ignore storage errors
    }
  }

  getHistory(): string[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // ignore parse errors
    }
    return [];
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (e) {
      // ignore
    }
  }
}
