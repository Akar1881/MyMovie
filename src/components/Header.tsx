import { Search } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const siteName = import.meta.env.VITE_WEBSITE_NAME || 'Movie Database';

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <h1
          className="text-xl md:text-2xl font-bold text-white cursor-pointer hover:text-gray-300 transition-colors"
          onClick={() => navigate('/')}
        >
          {siteName}
        </h1>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies or TV shows..."
              className="w-full bg-gray-900 text-white px-4 py-2 pl-10 rounded-full border border-gray-700 focus:border-gray-500 focus:outline-none transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </form>
      </div>
    </header>
  );
}
