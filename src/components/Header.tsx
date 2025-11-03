import { Search as SearchIcon, Menu, X } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const siteName = import.meta.env.VITE_WEBSITE_NAME || 'Movie Database';

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'TV Shows', path: '/tv' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 mb-4 md:mb-0">
          <div
            className="flex-shrink-0 cursor-pointer group"
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
          >
            <h1 className="text-2xl md:text-3xl font-black text-white group-hover:text-gray-200 transition-colors">
              {siteName}
            </h1>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-gray-300 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm font-semibold transition-colors relative group ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 transition-all ${
                    isActive(item.path)
                      ? 'w-full bg-white'
                      : 'w-0 bg-white group-hover:w-full'
                  }`}
                />
              </button>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xs">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-800/50 text-white px-4 py-2.5 pl-10 rounded-lg border border-gray-700/50 focus:border-gray-500 focus:bg-gray-800 focus:outline-none transition-all placeholder:text-gray-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
          </form>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden space-y-3 pt-4 border-t border-gray-800">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-gray-700/50 text-white font-semibold'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <form onSubmit={handleSearch} className="pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies or TV shows..."
                  className="w-full bg-gray-800/50 text-white px-4 py-2.5 pl-10 rounded-lg border border-gray-700/50 focus:border-gray-500 focus:outline-none transition-all placeholder:text-gray-500"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}