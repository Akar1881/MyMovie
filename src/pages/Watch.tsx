import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Play, Subtitles } from 'lucide-react';
import { getTVSeasons, getSeasonEpisodes, Season, Episode, getImageUrl } from '../services/tmdb';

interface SubtitleState {
  url: string | null;
  status: 'idle' | 'fetching' | 'translating' | 'ready' | 'error';
  message: string;
  fromCache: boolean;
}

export default function Watch() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [subtitle, setSubtitle] = useState<SubtitleState>({
    url: null,
    status: 'idle',
    message: '',
    fromCache: false,
  });

  useEffect(() => {
    if (type === 'tv' && id) {
      fetchSeasons();
    } else if (type === 'movie') {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => {
    if (type === 'tv' && id && selectedSeason) {
      fetchEpisodes();
    }
  }, [selectedSeason, type, id]);

  const fetchSeasons = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const seasonsData = await getTVSeasons(parseInt(id));
      const filteredSeasons = seasonsData.filter(s => s.season_number > 0);
      setSeasons(filteredSeasons);
      if (filteredSeasons.length > 0) {
        setSelectedSeason(filteredSeasons[0].season_number);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async () => {
    if (!id) return;
    try {
      const episodesData = await getSeasonEpisodes(parseInt(id), selectedSeason);
      setEpisodes(episodesData);
      if (episodesData.length > 0) {
        setSelectedEpisode(episodesData[0].episode_number);
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const fetchSubtitle = async () => {
    if (!id) return;

    setSubtitle({ url: null, status: 'fetching', message: 'Fetching subtitle...', fromCache: false });

    try {
      const apiUrl = import.meta.env.VITE_SUBTITLE_API_URL;
      const body = type === 'movie'
        ? { tmdbId: parseInt(id), type: 'movie' }
        : { tmdbId: parseInt(id), type: 'tv', season: selectedSeason, episode: selectedEpisode };

      const response = await fetch(`${apiUrl}/api/subtitle/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success && data.subtitleUrl) {
        setSubtitle({
          url: data.subtitleUrl, // This is the full URL returned by the API
          status: 'ready',
          message: data.fromCache ? 'Subtitle loaded from cache' : 'Subtitle ready',
          fromCache: data.fromCache,
        });
      } else {
        setSubtitle({
          url: null,
          status: 'error',
          message: data.message || 'Subtitle not available',
          fromCache: false,
        });
      }
    } catch (error) {
      console.error('Error fetching subtitle:', error);
      setSubtitle({
        url: null,
        status: 'error',
        message: 'Failed to fetch subtitle',
        fromCache: false,
      });
    }
  };

  const buildPlayerUrl = (subtitleUrl: string | null = null) => {
    const baseUrl = type === 'movie'
      ? `https://vidlink.pro/movie/${id}`
      : `https://vidlink.pro/tv/${id}/${selectedSeason}/${selectedEpisode}`;

    const params = new URLSearchParams({
      primaryColor: '63b8bc',
      secondaryColor: 'a2a2a2',
      iconColor: 'eefdec',
      icons: 'default',
      player: 'default',
      title: 'true',
      poster: 'true',
      autoplay: 'true',
      nextbutton: 'false'
    });

    if (subtitleUrl) {
      // Use the full URL returned by the API directly
      params.append('sub_file', subtitleUrl);
      params.append('sub_label', 'Kurdish');
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const handleSeasonChange = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setShowPlayer(false);
    setSubtitle({ url: null, status: 'idle', message: '', fromCache: false });
  };

  const handleEpisodeSelect = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
    setShowPlayer(false);
    setSubtitle({ url: null, status: 'idle', message: '', fromCache: false });
  };

  const handlePlayWithSubtitle = async () => {
    // For both movies and TV shows, fetch subtitle first, then show player
    await fetchSubtitle();
    setShowPlayer(true);
  };

  const handlePlayWithoutSubtitle = () => {
    setSubtitle({ url: null, status: 'idle', message: '', fromCache: false });
    setShowPlayer(true);
  };

  const getIframeSrc = () => {
    return buildPlayerUrl(subtitle.status === 'ready' ? subtitle.url : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {type === 'tv' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Select Season</h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {seasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => handleSeasonChange(season.season_number)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all flex-shrink-0 ${
                      selectedSeason === season.season_number
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {season.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Episodes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto scrollbar-hide">
                {episodes.map((episode) => (
                  <div
                    key={episode.id}
                    onClick={() => handleEpisodeSelect(episode.episode_number)}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all hover:scale-105 ${
                      selectedEpisode === episode.episode_number && showPlayer
                        ? 'ring-2 ring-white'
                        : ''
                    }`}
                  >
                    <div className="relative bg-gray-800">
                      <img
                        src={getImageUrl(episode.still_path, 'w300')}
                        alt={episode.name}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded">
                            E{episode.episode_number}
                          </span>
                          {episode.vote_average > 0 && (
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs font-semibold">
                                {episode.vote_average.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-800">
                      <h3 className="text-white font-medium text-sm line-clamp-2">
                        {episode.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!showPlayer && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handlePlayWithSubtitle}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-semibold transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Play Episode {selectedEpisode} with Subtitle
                </button>
                <button
                  onClick={handlePlayWithoutSubtitle}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Play Without Subtitle
                </button>
              </div>
            )}
          </>
        )}

        {type === 'movie' && !showPlayer && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={handlePlayWithSubtitle}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-semibold transition-colors"
            >
              <Play className="w-5 h-5" />
              Play Movie with Subtitle
            </button>
            <button
              onClick={handlePlayWithoutSubtitle}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              <Play className="w-5 h-5" />
              Play Without Subtitle
            </button>
          </div>
        )}

        {subtitle.status !== 'idle' && (
          <div className="mb-6">
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4">
              <Subtitles className={`w-5 h-5 ${
                subtitle.status === 'ready' ? 'text-green-400' :
                subtitle.status === 'error' ? 'text-red-400' :
                'text-yellow-400'
              }`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  subtitle.status === 'ready' ? 'text-green-400' :
                  subtitle.status === 'error' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {subtitle.message}
                </p>
                {(subtitle.status === 'fetching' || subtitle.status === 'translating') && (
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showPlayer && (
          <div className="w-full">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                key={getIframeSrc()}
                src={getIframeSrc()}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Video Player"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}