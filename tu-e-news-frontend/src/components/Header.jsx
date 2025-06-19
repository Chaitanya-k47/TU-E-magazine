// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';

function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State for search input
  const [searchQuery, setSearchQuery] = useState('');     // State for search query

  const onAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) setSearchQuery(''); // Clear query when closing search
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false); // Close search input after submit
      setSearchQuery('');   // Clear input
    }
  };

  // --- DESKTOP Link Styles ---
  // Using replace on these was a bit complex, let's define them more directly
  const desktopNavLinkBase = "inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-150";
  const desktopNavLink = `text-gray-500 hover:text-gray-700 ${desktopNavLinkBase}`;
  const desktopActiveNavLink = `border-b-2 border-blue-500 text-blue-600 font-semibold ${desktopNavLinkBase}`;

  // --- MOBILE Link Styles ---
  const mobileNavLinkBase = "block rounded-md text-base font-medium transition-colors duration-150";
  // INCREASED HORIZONTAL PADDING (px-4) and VERTICAL PADDING (py-3) for mobile links
  const mobileNavLinkClasses = `text-gray-700 hover:text-gray-900 hover:bg-gray-100 ${mobileNavLinkBase} px-4 py-3`;
  const mobileActiveNavLinkClasses = `bg-blue-50 border-l-4 border-blue-500 text-blue-600 font-semibold ${mobileNavLinkBase} px-4 py-3`;


  const navigationLinks = [
    { name: 'Academics', href: '/category/academics', apiFilterValue: 'Academics' },
    { name: 'Events', href: '/category/events', apiFilterValue: 'Events' },
    { name: 'Research', href: '/category/research', apiFilterValue: 'Research' },
    { name: 'Campus Life', href: '/category/campus-life', apiFilterValue: 'Campus Life' },
    { name: 'Achievements', href: '/category/achievements', apiFilterValue: 'Achievements' },
    { name: 'Announcements', href: '/category/announcements', apiFilterValue: 'Announcements' },
    { name: 'Other', href: '/category/other', apiFilterValue: 'Other' }
  ];



  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo and Desktop Nav Links */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 flex-shrink-0">
              TU-e-News
            </Link>
            {/* Desktop Navigation Links */}
            {!isSearchOpen && ( // Hide desktop nav when search is open
              <div className="hidden md:ml-6 md:flex md:space-x-4"> {/* space-x-4 for desktop link spacing */}
                {navigationLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={location.pathname.startsWith(item.href) ? desktopActiveNavLink : desktopNavLink}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search Input Area (conditionally rendered or takes over) */}
          {isSearchOpen && (
            <div className="flex-grow max-w-xl mx-auto px-4"> {/* Takes available space */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  name="search"
                  id="search-header"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search articles..."
                  autoFocus
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </form>
            </div>
          )}

          {/* Right Side: Search Icon, Auth Links, Mobile Menu Button*/}
          <div className={`flex items-center ${isSearchOpen ? 'ml-auto' : ''}`}> {/* Adjust margin if search is open */}
            <button
             type="button"
              onClick={handleSearchIconClick}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              {isSearchOpen ? <FiX className="h-5 w-5 sm:h-6 sm:w-6" /> : <FiSearch className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>

            {/* Hide auth links if search is open on smaller screens, or manage layout better */}
            {!isSearchOpen && (
            <>
              {/* Desktop Auth Links */}
              <div className="hidden md:flex items-center">
                {isAuthenticated && user ? (
                  <>
                    <span className="text-xs sm:text-sm text-gray-700 mr-2 sm:mr-4">
                      Hi, {user.name || user.id}
                    </span>
                    <Link
                      to="/dashboard"
                      className="mr-2 sm:mr-4 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 hover:underline"
                    >
                      {user.role === 'reader' ? 'My Profile' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-xs sm:text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  !onAuthPage && (
                    <Link
                      to="/login"
                      className="text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md"
                    >
                      Login
                    </Link>
                  )
                )}
              </div>

              {/* Mobile Menu Button (Hamburger) */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <FiX className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <FiMenu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel with Transition */}
      <div
        className={`
          md:hidden absolute top-16 inset-x-0 bg-white shadow-lg z-40 overflow-y-auto max-h-[calc(100vh-4rem)]
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'transform translate-y-0 opacity-100 visible' : 'transform -translate-y-full opacity-0 invisible'}
        `}
        id="mobile-menu"
      >
        {/* Container for mobile navigation links with desired padding */}
        <div className="px-4 pt-2 pb-3 space-y-1"> {/* Increased px-4 for overall horizontal space */}
          {navigationLinks.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
              className={location.pathname.startsWith(item.href) ? mobileActiveNavLinkClasses : mobileNavLinkClasses}
              aria-current={location.pathname.startsWith(item.href) ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
        </div>
        {/* Mobile Auth Links */}
        <div className="pt-4 pb-3 border-t border-gray-200 px-4"> {/* Consistent padding */}
          {isAuthenticated && user ? (
            <div className="space-y-2"> {/* Add space-y for better separation */}
              <div className="px-1 py-2"> {/* Reduced padding here as links below have their own */}
                <div className="text-base font-medium text-gray-800">{user.name || user.id}</div>
                <div className="text-sm font-medium text-gray-500 capitalize">{user.role}</div>
              </div>
              {(user.role === 'admin' || user.role === 'editor') && (
                <Link 
                    to="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`${mobileNavLinkClasses} text-blue-600`} // Reuse mobile link style
                >
                    Dashboard
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className={`${mobileNavLinkClasses} w-full text-left text-red-500`} // Reuse mobile link style
              >
                Logout
              </button>
            </div>
          ) : (
            !onAuthPage && (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2.5 px-4 rounded-md"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;