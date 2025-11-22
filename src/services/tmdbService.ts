import { Recommendation } from '../types';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Function to search for movies or TV shows on TMDB
export const searchTMDB = async (query: string, category: 'movies' | 'tv' | 'anime'): Promise<Recommendation[]> => {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not found');
    return [];
  }

  try {
    let searchEndpoint = '';
    if (category === 'movies' || category === 'anime') {
      searchEndpoint = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;
    } else { // category === 'tv'
      searchEndpoint = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;
    }

    const response = await fetch(searchEndpoint);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.status_message || 'Error searching TMDB');
    }

    // Transform TMDB results to Recommendation format
    return data.results.slice(0, 3).map((item: any) => ({
      title: item.title || item.name,
      year: item.release_date ? new Date(item.release_date).getFullYear().toString() :
            item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : 'N/A',
      description: item.overview || 'No description available',
      reason: 'TMDB Recommendation',
      fakeId: item.id, // Using the actual TMDB ID
      imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null
    }));
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return [];
  }
};

// Function to get detailed info about a specific movie or TV show
export const getMediaDetails = async (id: number, category: 'movie' | 'tv'): Promise<any> => {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not found');
    return null;
  }

  try {
    const endpoint = `${TMDB_BASE_URL}/${category}/${id}?api_key=${TMDB_API_KEY}`;
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.status_message || 'Error fetching media details');
    }

    return data;
  } catch (error) {
    console.error('Error fetching media details:', error);
    return null;
  }
};

// Function to get detailed media information for the modal view
export const getDetailedMediaInfo = async (id: number, category: 'movie' | 'tv'): Promise<any> => {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not found');
    return null;
  }

  try {
    const endpoint = `${TMDB_BASE_URL}/${category}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,reviews,rating,release_dates`;
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.status_message || `Error fetching detailed ${category} information`);
    }

    // Add category for use in the UI
    data.category = category;

    return data;
  } catch (error) {
    console.error(`Error fetching detailed ${category} information:`, error);
    return null;
  }
};

// Function to get the video URL for playback
export const getVideoUrl = (id: number, type: 'movie' | 'tv', season?: number, episode?: number): string => {
  if (type === 'movie') {
    return `https://player.videasy.net/movie/${id}?color=E50914&overlay=true`;
  } else {
    if (season !== undefined && episode !== undefined) {
      return `https://player.videasy.net/tv/${id}/${season}/${episode}?color=E50914&overlay=true&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true`;
    } else {
      return `https://player.videasy.net/tv/${id}/1/1?color=E50914&overlay=true&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true`;
    }
  }
};