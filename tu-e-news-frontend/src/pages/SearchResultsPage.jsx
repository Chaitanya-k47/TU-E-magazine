// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../utils/api';
import ArticleCard from '../components/ArticleCard';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || ''; // Get search query from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLimit = 9; // Consistent with homepage grid

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [totalResults, setTotalResults] = useState(0);


  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setArticles([]);
        setLoading(false);
        setPagination({});
        setTotalResults(0);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const params = {
          search: query,
          page: currentPage,
          limit: currentLimit,
          // sortBy: 'relevance' // Backend text search usually sorts by relevance by default if $meta textScore is used
        };
        const response = await apiClient.get('/articles', { params }); // Use existing /articles endpoint
        setArticles(response.data.data || []);
        setPagination(response.data.pagination || {});
        setTotalResults(response.data.totalCount || 0);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError(err.response?.data?.error || `Failed to load search results for "${query}".`);
        setArticles([]);
        setPagination({});
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage, currentLimit]); // Re-fetch if query or page changes

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">
          Search Results {query && `for: `}
          {query && <span className="text-blue-600">"{query}"</span>}
        </h1>
        {!loading && <p className="text-sm text-gray-500 mt-1">{totalResults} article(s) found.</p>}
      </div>


      {loading && (
        <div className="text-center py-20"><p className="text-gray-500 text-lg">Searching articles...</p></div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && articles.length === 0 && query && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No articles found matching your search for "{query}".</p>
          <p className="text-sm text-gray-500 mt-2">Try different keywords or check your spelling.</p>
        </div>
      )}
      {!loading && !error && articles.length === 0 && !query && (
         <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Please enter a search term to find articles.</p>
        </div>
      )}


      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination Controls (use same structure as HomePage) */}
      {!loading && (pagination.prev || pagination.next) && (
         <div className="mt-10 flex justify-center items-center space-x-2 sm:space-x-4">
          {pagination.prev ? (
            <Link
              to={`/search?q=${encodeURIComponent(query)}&page=${pagination.prev.page}&limit=${pagination.prev.limit}`}
              className="px-3 sm:px-4 py-2 bg-white border ..."
            >
              ← Previous
            </Link>
          ) : ( <span className="px-3 sm:px-4 py-2 bg-gray-100 ...">← Previous</span> )}
          
          <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
             Page {currentPage} {pagination.totalPages ? `of ${Math.ceil(totalResults / currentLimit)}` : ''}
          </span>

          {pagination.next ? (
            <Link
              to={`/search?q=${encodeURIComponent(query)}&page=${pagination.next.page}&limit=${pagination.next.limit}`}
              className="px-3 sm:px-4 py-2 bg-white border ..."
            >
              Next →
            </Link>
          ) : ( <span className="px-3 sm:px-4 py-2 bg-gray-100 ...">Next →</span> )}
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;