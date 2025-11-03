import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Media, getImageUrl } from '../services/tmdb';

interface MediaGridProps {
  media: Media[];
  mediaType?: 'movie' | 'tv';
}

export default function MediaGrid({ media, mediaType }: MediaGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {media.map((item) => {
        const type = mediaType || item.media_type || 'movie';
        const title = item.title || item.name || 'Untitled';
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

        return (
          <div
            key={item.id}
            onClick={() => navigate(`/details/${type}/${item.id}`)}
            className="cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
              <img
                src={getImageUrl(item.poster_path, 'w342')}
                alt={title}
                className="w-full h-60 md:h-72 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold">{rating}</span>
                </div>
              </div>
            </div>
            <h3 className="mt-2 text-sm font-medium text-white line-clamp-2">{title}</h3>
          </div>
        );
      })}
    </div>
  );
}
