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
  const [heroList, setHeroList] = useState<Media[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [heroLoading, setHeroLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const trending = await getTrending('all', 'week');
        setHeroList(trending.slice(0, 10));
        setCurrentHeroIndex(0);
      } catch (error) {
        console.error('Error fetching hero:', error);
      } finally {
        setHeroLoading(false);
      }
    };

    const fetchSections = async () => {
      try {
        const [trending, newTV, newMovies, classicMovies, classicTV] = await Promise.all([
          getTrending('all', 'week'),
          getNewReleases('tv'),
          getNewReleases('movie'),
          getClassic('movie'),
          getClassic('tv'),
        ]);

        setSections([
          { title: 'Trending Now', media: trending.slice(1, 20) },
          { title: 'New TV Shows', media: newTV.results, mediaType: 'tv' },
          { title: 'New Movies', media: newMovies.results, mediaType: 'movie' },
          { title: 'Classic Movies', media: classicMovies, mediaType: 'movie' },
          { title: 'Classic TV Shows', media: classicTV, mediaType: 'tv' },
        ]);
      } catch (error) {
        console.error('Error fetching sections:', error);
      } finally {
        setSectionsLoading(false);
      }
    };

    fetchHero();
    fetchSections();
  }, []);

  useEffect(() => {
    if (heroList.length === 0) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroList.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroList.length]);

  const scrollSection = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const hero = heroList[currentHeroIndex];

  return (
    <div className="min-h-screen bg-black pb-24 pt-20">
      {heroLoading ? (
        <div className="relative h-[70vh] w-full mb-8 bg-gray-900 animate-pulse" />
      ) : hero ? (
        <div className="relative h-[70vh] w-full mb-8 overflow-hidden">
          <div className="absolute inset-0 transition-opacity duration-1000">
            <img
              src={getImageUrl(hero.backdrop_path, 'original')}
              alt={hero.title || hero.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
          <div className="relative h-full flex items-end">
            <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 transition-all duration-500">
                {hero.title || hero.name}
              </h2>
              <p className="text-lg text-gray-200 max-w-3xl line-clamp-3 transition-all duration-500">{hero.overview}</p>
              <div className="flex gap-2 mt-6">
                {heroList.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHeroIndex(index)}
                    className={`h-1 transition-all ${
                      index === currentHeroIndex
                        ? 'w-12 bg-white'
                        : 'w-2 bg-gray-600 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to hero ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-8">
        {sectionsLoading ? (
          <div className="max-w-7xl mx-auto px-4 space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-8 w-48 bg-gray-800 rounded mb-4 animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex-shrink-0 w-40 md:w-48">
                      <div className="w-full h-60 md:h-72 bg-gray-800 rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          sections.map((section, index) => (
            <MediaSection
              key={index}
              title={section.title}
              media={section.media}
              mediaType={section.mediaType}
              onScroll={scrollSection}
            />
          ))
        )}
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
