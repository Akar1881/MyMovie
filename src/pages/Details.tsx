import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock } from 'lucide-react';
import { MediaDetails, Cast, getDetails, getCredits, getImageUrl } from '../services/tmdb';

export default function Details() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!type || !id) return;

      setLoading(true);
      try {
        const [detailsData, creditsData] = await Promise.all([
          getDetails(type, parseInt(id)),
          getCredits(type, parseInt(id)),
        ]);
        setDetails(detailsData);
        setCast(creditsData);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Content not found</div>
      </div>
    );
  }

  const title = details.title || details.name || 'Untitled';
  const releaseDate = details.release_date || details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(details.backdrop_path, 'original')}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-black/80 hover:bg-black text-white rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <img
              src={getImageUrl(details.poster_path, 'w500')}
              alt={title}
              className="w-64 rounded-lg shadow-2xl"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{title}</h1>

            {details.tagline && (
              <p className="text-gray-400 italic mb-4">{details.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-400">
                <Star className="w-6 h-6 fill-current" />
                <span className="text-xl font-semibold">{rating}</span>
              </div>

              {releaseDate && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-5 h-5" />
                  <span>{year}</span>
                </div>
              )}

              {details.runtime && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-5 h-5" />
                  <span>{details.runtime} min</span>
                </div>
              )}

              {details.number_of_seasons && (
                <div className="text-gray-300">
                  {details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {details.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{details.overview}</p>
            </div>

            {cast.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Cast</h2>
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-4" style={{ scrollbarWidth: 'none' }}>
                    {cast.map((actor) => (
                      <div key={actor.id} className="flex-shrink-0 w-32 md:w-40 text-center">
                        <div className="relative overflow-hidden rounded-lg shadow-lg mb-3">
                          <img
                            src={getImageUrl(actor.profile_path, 'w185')}
                            alt={actor.name}
                            className="w-full aspect-square object-cover hover:scale-110 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <h3 className="text-white font-medium text-sm line-clamp-2">{actor.name}</h3>
                        <p className="text-gray-400 text-xs line-clamp-2">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
