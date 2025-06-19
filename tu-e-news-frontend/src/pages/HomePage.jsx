// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/api';
import ArticleCard from '../components/ArticleCard';
import { useSearchParams, Link } from 'react-router-dom';
import SortDropdown from '../components/SortDropdown';

const sortOptions = [
  { value: 'publishedAt:desc', label: 'Latest (Default)' },
  { value: 'publishedAt:asc', label: 'Oldest First' },
  { value: 'title:asc', label: 'Title (A-Z)' },
  { value: 'title:desc', label: 'Title (Z-A)' },
  // { value: 'likesCount:desc', label: 'Most Popular' }, // Future
];

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paginationInfo, setPaginationInfo] = useState({}); // Renamed for clarity
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive state from URL search parameters - this is the source of truth
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSortBy = searchParams.get('sortBy') || sortOptions[0].value;
  const currentLimit = 9; // Or your desired limit

  // Effect for fetching articles when searchParams (page, sortBy) change
  useEffect(() => {
    console.log("Data fetching useEffect triggered. Current searchParams:", searchParams.toString());

    const fetchArticles = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          page: currentPage, // Derived from searchParams
          limit: currentLimit,
          sortBy: currentSortBy, // Derived from searchParams
        };
        console.log("Fetching articles with params:", params);

        const response = await apiClient.get('/articles', { params });
        console.log("API Response:", response.data);
        setArticles(response.data.data || []);
        setPaginationInfo({ // Store all pagination related info
          ...response.data.pagination, // next, prev from backend
          totalCount: response.data.totalCount,
          currentPage: currentPage, // Store current page for display
          limit: currentLimit
        });
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(err.response?.data?.error || 'Failed to load articles. Please try again later.');
        setArticles([]);
        setPaginationInfo({});
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchParams, currentPage, currentLimit, currentSortBy]); // Depend on searchParams or its derived values

 const handleSortChange = (newSortValue) => { // onChange now receives the value directly
    setSearchParams({ sortBy: newSortValue, page: '1', limit: currentLimit.toString() }, { replace: true });
  };

  // Function to generate pagination link URL
  const getPageUrl = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    // 'sortBy' and 'limit' are already in searchParams or will be added by handleSortChange
    // or default. Ensure they persist if already there.
    if (!params.has('sortBy')) params.set('sortBy', currentSortBy);
    if (!params.has('limit')) params.set('limit', currentLimit.toString());
    return `/?${params.toString()}`;
  };


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          All Articles {/* Updated Title */}
        </h1>
        {/* --- USE SortDropdown COMPONENT --- */}
        <SortDropdown
          options={sortOptions}
          selectedValue={currentSortBy}
          onChange={handleSortChange}
        />
        {/* --- END SortDropdown --- */}
      </div>

      {loading && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Loading articles...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No articles found.</p>
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && (paginationInfo.prev || paginationInfo.next) && (
         <div className="mt-10 flex justify-center items-center space-x-2 sm:space-x-4">
          {paginationInfo.prev ? (
            <Link
              to={getPageUrl(paginationInfo.prev.page)} // Use helper for URL
              className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Previous
            </Link>
          ) : (
             <span className="px-3 sm:px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-400 cursor-not-allowed">
                ← Previous
             </span>
          )}

          <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
             Page {paginationInfo.currentPage} {paginationInfo.totalCount ? `of ${Math.ceil(paginationInfo.totalCount / paginationInfo.limit)}` : ''}
          </span>

          {paginationInfo.next ? (
            <Link
              to={getPageUrl(paginationInfo.next.page)} // Use helper for URL
              className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Next →
            </Link>
          ) : (
            <span className="px-3 sm:px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-400 cursor-not-allowed">
                Next →
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;