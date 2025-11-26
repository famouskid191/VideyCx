import React from 'react';
import { FaPlayCircle, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext'; // Import hook

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const navigate = useNavigate();
  const { showSearch } = useLayout(); // Gunakan konteks untuk mendapatkan status

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch) {
      navigate(`/search?search=${trimmedSearch}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <header className="bg-gray-800 fixed top-0 left-0 w-full p-4 text-white flex items-center justify-between shadow-lg z-50">
        <Link to="/" className="flex items-center flex-shrink-0">
          <FaPlayCircle className="mr-3 text-blue-400" size={24} />
          <h1 className="text-xl font-bold">Streaming Indo</h1>
        </Link>
        
        {/* Tampilkan form pencarian hanya jika showSearch bernilai true */}
        {showSearch && (
          <div className="w-full max-w-sm ml-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search other videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-white">
                <FaSearch />
              </button>
            </form>
          </div>
        )}
      </header>

      <main className="flex-1 text-white pt-20">
        {children}
      </main>

      <footer className="bg-gray-800 p-4 text-white text-center">
        <p>© {new Date().getFullYear()} Lulu Stream. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;