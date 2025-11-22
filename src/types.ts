export type TabType = 'movies' | 'tv' | 'anime';

export interface User {
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Recommendation {
  title: string;
  year: string;
  description: string;
  reason: string;
  fakeId: number; // Simulating a TMDB ID for the UI
  imageUrl?: string | null;
}

export enum PlaybackState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING'
}
