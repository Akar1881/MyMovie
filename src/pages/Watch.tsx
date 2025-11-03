import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Play } from 'lucide-react';
import { getTVSeasons, getSeasonEpisodes, Season, Episode, getImageUrl } from '../services/tmdb';

export default function Watch() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (type === 'tv' && id) {
      fetchSeasons();
    } else if (type === 'movie') {
      setLoading(false);
      setShowPlayer(true);
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

  const handleSeasonChange = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setShowPlayer(false);
  };

  const handleEpisodeSelect = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
    setShowPlayer(true);
  };

  const getIframeSrc = () => {
    if (type === 'movie') {
      return `https://vidlink.pro/movie/${id}`;
    } else {
      return `https://vidlink.pro/tv/${id}/${selectedSeason}/${selectedEpisode}`;
    }
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
              <button
                onClick={() => setShowPlayer(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-semibold transition-colors mb-6"
              >
                <Play className="w-5 h-5" />
                Play Episode {selectedEpisode}
              </button>
            )}
          </>
        )}

        {showPlayer && (
          <div className="w-full">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
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
