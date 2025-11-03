const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
  first_air_date?: string;
  release_date?: string;
}

export interface MediaDetails extends Media {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status: string;
  tagline?: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export const getImageUrl = (path: string | null, size: string = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

const fetchFromTMDB = async (endpoint: string) => {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  return response.json();
};

export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  const data = await fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
  return data.results;
};

export const getPopular = async (mediaType: 'movie' | 'tv', page: number = 1) => {
  const data = await fetchFromTMDB(`/${mediaType}/popular?page=${page}`);
  return { results: data.results, total_pages: data.total_pages };
};

export const getTopRated = async (mediaType: 'movie' | 'tv', page: number = 1) => {
  const data = await fetchFromTMDB(`/${mediaType}/top_rated?page=${page}`);
  return { results: data.results, total_pages: data.total_pages };
};

export const getNewReleases = async (mediaType: 'movie' | 'tv', page: number = 1) => {
  const endpoint = mediaType === 'movie'
    ? `/movie/now_playing?page=${page}`
    : `/tv/on_the_air?page=${page}`;
  const data = await fetchFromTMDB(endpoint);
  return { results: data.results, total_pages: data.total_pages };
};

export const getClassic = async (mediaType: 'movie' | 'tv') => {
  const currentYear = new Date().getFullYear();
  const endpoint = mediaType === 'movie'
    ? `/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&primary_release_date.lte=${currentYear - 20}-12-31`
    : `/discover/tv?sort_by=vote_average.desc&vote_count.gte=500&first_air_date.lte=${currentYear - 20}-12-31`;
  const data = await fetchFromTMDB(endpoint);
  return data.results;
};

export const search = async (query: string, page: number = 1) => {
  const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
  return { results: data.results.filter((item: Media) => item.media_type === 'movie' || item.media_type === 'tv'), total_pages: data.total_pages };
};

export const getDetails = async (mediaType: 'movie' | 'tv', id: number): Promise<MediaDetails> => {
  return await fetchFromTMDB(`/${mediaType}/${id}`);
};

export const getCredits = async (mediaType: 'movie' | 'tv', id: number) => {
  const data = await fetchFromTMDB(`/${mediaType}/${id}/credits`);
  return data.cast.slice(0, 10);
};

export const getGenres = async (mediaType: 'movie' | 'tv') => {
  const data = await fetchFromTMDB(`/genre/${mediaType}/list`);
  return data.genres;
};
