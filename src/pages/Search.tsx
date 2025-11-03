import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';
import MediaGrid from '../components/MediaGrid';
import { Media, search } from '../services/tmdb';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return;

      setLoading(true);
      try {
        const data = await search(query, currentPage);
        setMedia(data.results);
        setTotalPages(Math.min(data.total_pages, 500));
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-black pb-24 pt-24 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <SearchIcon className="w-24 h-24 text-gray-700 mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Searching</h1>
          <p className="text-gray-400 text-lg">Enter a movie or TV show name in the search bar to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24 pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Search Results</h1>
          <p className="text-gray-400 text-lg">
            Showing results for <span className="text-red-500 font-semibold">"{query}"</span>
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full h-60 md:h-72 bg-gray-800 rounded-lg mb-2" />
                <div className="h-4 bg-gray-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-white text-2xl font-bold mb-2">No results found</p>
            <p className="text-gray-400 text-lg">Try searching with different keywords</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-400 text-sm">
              {media.length} result{media.length !== 1 ? 's' : ''} found
            </div>
            <MediaGrid media={media} />

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
