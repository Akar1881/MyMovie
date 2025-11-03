import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaGrid from '../components/MediaGrid';
import { Media, getPopular, getTopRated, getNewReleases } from '../services/tmdb';

type SortOption = 'popular' | 'top_rated' | 'new';

export default function TVShows() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        switch (sortBy) {
          case 'top_rated':
            data = await getTopRated('tv', currentPage);
            break;
          case 'new':
            data = await getNewReleases('tv', currentPage);
            break;
          default:
            data = await getPopular('tv', currentPage);
        }
        setMedia(data.results);
        setTotalPages(Math.min(data.total_pages, 500));
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, sortBy]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24 pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">TV Shows</h1>

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => handleSortChange('popular')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              sortBy === 'popular'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => handleSortChange('top_rated')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              sortBy === 'top_rated'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Top Rated
          </button>
          <button
            onClick={() => handleSortChange('new')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              sortBy === 'new'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Newest
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-xl">Loading...</div>
          </div>
        ) : (
          <>
            <MediaGrid media={media} mediaType="tv" />

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <span className="text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
