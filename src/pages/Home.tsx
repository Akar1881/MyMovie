import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from '../components/MediaCard';
import { Media, getTrending, getNewReleases, getClassic, getImageUrl } from '../services/tmdb';

interface MediaSection {
  title: string;
  media: Media[];
  mediaType?: 'movie' | 'tv';
}

export default function Home() {
  const [sections, setSections] = useState<MediaSection[]>([]);
  const [hero, setHero] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, newTV, newMovies, classicMovies, classicTV] = await Promise.all([
          getTrending('all', 'week'),
          getNewReleases('tv'),
          getNewReleases('movie'),
          getClassic('movie'),
          getClassic('tv'),
        ]);

        setHero(trending[0]);
        setSections([
          { title: 'Trending Now', media: trending.slice(1, 20) },
          { title: 'New TV Shows', media: newTV.results, mediaType: 'tv' },
          { title: 'New Movies', media: newMovies.results, mediaType: 'movie' },
          { title: 'Classic Movies', media: classicMovies, mediaType: 'movie' },
          { title: 'Classic TV Shows', media: classicTV, mediaType: 'tv' },
        ]);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollSection = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24 pt-20">
      {hero && (
        <div className="relative h-[70vh] w-full mb-8">
          <div className="absolute inset-0">
            <img
              src={getImageUrl(hero.backdrop_path, 'original')}
              alt={hero.title || hero.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
          <div className="relative h-full flex items-end">
            <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {hero.title || hero.name}
              </h2>
              <p className="text-lg text-gray-200 max-w-3xl line-clamp-3">{hero.overview}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {sections.map((section, index) => (
          <MediaSection
            key={index}
            title={section.title}
            media={section.media}
            mediaType={section.mediaType}
            onScroll={scrollSection}
          />
        ))}
      </div>
    </div>
  );
}

interface MediaSectionProps {
  title: string;
  media: Media[];
  mediaType?: 'movie' | 'tv';
  onScroll: (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => void;
}

function MediaSection({ title, media, mediaType, onScroll }: MediaSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <div className="relative group">
        {showLeftArrow && (
          <button
            onClick={() => onScroll(scrollRef, 'left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {showRightArrow && (
          <button
            onClick={() => onScroll(scrollRef, 'right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {media.map((item) => (
            <MediaCard key={item.id} media={item} mediaType={mediaType} />
          ))}
        </div>
      </div>
    </div>
  );
}
