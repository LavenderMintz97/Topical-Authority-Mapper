import { TopicalMap, FilterOptions } from '../types';

export interface PersistedAppState {
  version: number;
  timestamp: number;
  seed: string;
  mapData: TopicalMap | null;
  userUrlsText: string;
  competitorUrlsText: string;
  filters: FilterOptions;
  selectedNodeId: string | null;
  viewMode: 'list' | 'graph' | 'gaps' | 'json' | 'help';
}

const STORAGE_KEY = 'tam_topical_authority_session_v1';

export function savePersistedState(state: {
  seed: string;
  mapData: TopicalMap | null;
  userUrlsText: string;
  competitorUrlsText: string;
  filters: FilterOptions;
  selectedNodeId: string | null;
  viewMode: 'list' | 'graph' | 'gaps' | 'json' | 'help';
}): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const payload: PersistedAppState = {
      version: 1,
      timestamp: Date.now(),
      seed: state.seed,
      mapData: state.mapData,
      userUrlsText: state.userUrlsText,
      competitorUrlsText: state.competitorUrlsText,
      filters: state.filters,
      selectedNodeId: state.selectedNodeId,
      viewMode: state.viewMode
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
    return false;
  }
}

export function loadPersistedState(): PersistedAppState | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as PersistedAppState;
    if (!data || typeof data !== 'object') return null;

    // Validate structural integrity
    if (data.version === 1) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Failed to parse state from localStorage:', err);
    return null;
  }
}

export function clearPersistedState(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear state from localStorage:', err);
  }
}
