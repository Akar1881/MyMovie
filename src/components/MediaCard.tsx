import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Media, getImageUrl } from '../services/tmdb';

interface MediaCardProps {
  media: Media;
  mediaType?: 'movie' | 'tv';
}

export default function MediaCard({ media, mediaType }: MediaCardProps) {
  const navigate = useNavigate();
  const type = mediaType || media.media_type || 'movie';
  const title = media.title || media.name || 'Untitled';
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';

  const handleClick = () => {
    navigate(`/details/${type}/${media.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex-shrink-0 w-40 md:w-48 cursor-pointer group transition-transform hover:scale-105"
    >
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <img
          src={getImageUrl(media.poster_path, 'w342')}
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
}
