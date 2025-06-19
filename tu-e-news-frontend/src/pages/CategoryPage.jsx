// src/pages/CategoryPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import { useParams, useSearchParams, Link } from 'react-router-dom';
import apiClient from '../utils/api';
import ArticleCard from '../components/ArticleCard';
import SortDropdown from '../components/SortDropdown';

const sortOptions = [
  { value: 'publishedAt:desc', label: 'Latest (Default)' },
  { value: 'publishedAt:asc', label: 'Oldest First' },
  { value: 'title:asc', label: 'Title (A-Z)' },
  { value: 'title:desc', label: 'Title (Z-A)' },
  // { value: 'likesCount:desc', label: 'Most Popular' },
];

// Helper function to format date (ensure this is consistent or imported from utils)
// const formatDate = (dateString) => { /* ... */ }; // Assuming you have this or import it

function CategoryPage() {
  const { categoryName: categorySlug } = useParams(); // e.g., "campus-life"
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paginationInfo, setPaginationInfo] = useState({}); // For pagination data from API
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive state from URL search parameters
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSortBy = searchParams.get('sortBy') || sortOptions[0].value;
  const currentLimit = 9;

  const displayCategoryName = useMemo(() => {
    if (!categorySlug) return 'Unknown Category';
    return categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [categorySlug]);

  // Effect to fetch articles
  const fetchCategorizedArticles = useCallback(async () => {
    if (!categorySlug) {
      setLoading(false);
      setError("Category not specified.");
      setArticles([]);
      setPaginationInfo({});
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = {
        category: displayCategoryName, // API expects "Campus Life", not "campus-life"
        page: currentPage,
        limit: currentLimit,
        sortBy: currentSortBy,
      };

      console.log(`Fetching articles for category: "${displayCategoryName}", with params:`, params);
      const response = await apiClient.get('/articles', { params });
      
      setArticles(response.data.data || []);
      setPaginationInfo({
        ...response.data.pagination,
        totalCount: response.data.totalCount,
        currentPage: currentPage, // Store current page for display
        limit: currentLimit
      });

    } catch (err) {
      console.error(`Error fetching articles for category ${displayCategoryName}:`, err);
      setError(err.response?.data?.error || `Failed to load articles for "${displayCategoryName}".`);
      setArticles([]);
      setPaginationInfo({});
    } finally {
      setLoading(false);
    }
  }, [categorySlug, displayCategoryName, currentPage, currentLimit, currentSortBy]); // All derived values that affect the fetch

  useEffect(() => {
    fetchCategorizedArticles();
  }, [fetchCategorizedArticles]); // fetchCategorizedArticles is memoized and changes when its deps change

  // Handler for changing sort order
  const handleSortChange = (newSortValue) => {
    const newSearchParams = { sortBy: newSortValue, page: '1', limit: currentLimit.toString() };
    // categoryName is from useParams, not searchParams, so it won't be overwritten here.
    // If categoryName was also in searchParams, you'd need to preserve it:
    // const currentCategory = searchParams.get('category'); // Example if category was a query
    // if (currentCategory) newSearchParams.category = currentCategory;
    setSearchParams(newSearchParams, { replace: true });
  };


  // Function to generate pagination link URL
  const getPageUrl = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    // Ensure sortBy and limit are preserved or set
    if (!params.has('sortBy')) params.set('sortBy', currentSortBy);
    if (!params.has('limit')) params.set('limit', currentLimit.toString());
    return `/category/${categorySlug}?${params.toString()}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm mb-3 text-gray-500" aria-label="Breadcrumb">
            <ol className="list-none p-0 inline-flex space-x-1 items-center"> {/* Added items-center */}
                <li className="flex items-center">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                </li>
                <li className="flex items-center">
                    <span className="mx-1 text-gray-400">/</span>
                    {/* You could make "Categories" a link to a page listing all categories */}
                    <span className="text-gray-400">Categories</span> 
                </li>
                <li className="flex items-center">
                    <span className="mx-1 text-gray-400">/</span>
                    <span className="font-medium text-gray-700">{displayCategoryName}</span>
                </li>
            </ol>
        </nav>
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-0">
                Articles in: <span className="text-blue-600">{displayCategoryName}</span>
            </h1>
           {/* --- USE SortDropdown COMPONENT --- */}
          <SortDropdown
            options={sortOptions}
            selectedValue={currentSortBy}
            onChange={handleSortChange}
          />
          {/* --- END SortDropdown --- */}
        </div>
      </div>

      {loading && ( <div className="text-center py-20"><p className="text-gray-500 text-lg">Loading articles...</p></div> )}
      
      {error && !loading && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 my-8 rounded-md shadow-md text-center" role="alert">
          <p className="font-bold text-lg mb-2">Oops! Something went wrong.</p>
          <p>{error}</p>
          <Link to="/" className="mt-4 inline-block bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors">
            Go Back Home
          </Link>
        </div>
      )}
      
      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No articles found in the "{displayCategoryName}" category.</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to all articles
          </Link>
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination Controls - Using paginationInfo */}
      {!loading && !error && (paginationInfo.prev || paginationInfo.next || paginationInfo.currentPage > 1) && articles.length > 0 && (
         <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-2">
          {paginationInfo.prev ? (
            <Link
              to={getPageUrl(paginationInfo.prev.page)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
            >
              ← Previous
            </Link>
          ) : ( <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed w-full sm:w-auto text-center">← Previous</span> )}

          <span className="text-sm text-gray-700 px-2 py-1 bg-gray-100 rounded-md">
             Page {paginationInfo.currentPage}
             {paginationInfo.totalCount ? ` of ${Math.ceil(paginationInfo.totalCount / paginationInfo.limit)}` : ''}
          </span>

          {paginationInfo.next ? (
            <Link
              to={getPageUrl(paginationInfo.next.page)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
            >
              Next →
            </Link>
          ) : ( <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed w-full sm:w-auto text-center">Next →</span> )}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;

// // src/pages/CategoryPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useSearchParams, Link } from 'react-router-dom';
// import apiClient from '../utils/api';
// import ArticleCard from '../components/ArticleCard';

// // Define these in HomePage.jsx or a constants file
// const sortOptions = [
//   { value: 'publishedAt:desc', label: 'Latest (Default)' },
//   { value: 'publishedAt:asc', label: 'Oldest' },
//   { value: 'title:asc', label: 'Title (A-Z)' },
//   { value: 'title:desc', label: 'Title (Z-A)' },
//   // { value: 'likesCount:desc', label: 'Most Popular' }, // Future option
// ];

// function CategoryPage() {
//   const { categoryName } = useParams(); // Get category name from URL parameter
//   const [articles, setArticles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [pagination, setPagination] = useState({});
//   const [searchParams] = useSearchParams();

//   // Initialize sortBy from URL query param if present, otherwise default
//   const initialSortBy = searchParams.get('sortBy') || sortOptions[0].value; // Default to 'Latest'
//   const [sortBy, setSortBy] = useState(initialSortBy);

//   const currentPage = parseInt(searchParams.get('page') || '1', 10);
//   const currentLimit = 9; // Same as homepage for consistency, or adjust

//   // Capitalize categoryName for display (e.g., "academics" -> "Academics")
//   const displayCategoryName = useMemo(() => {
//     if (!categoryName) return '';
//     return categoryName
//       .split('-') // ["campus", "life"]
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // ["Campus", "Life"]
//       .join(' '); // "Campus Life"
//   }, [categoryName]);

//   useEffect(() => {
//     const fetchCategorizedArticles = async () => {
//       if (!categoryName) return;

//       setLoading(true);
//       setError('');
//       try {
//         const params = {
//           category: displayCategoryName, // Use the (potentially formatted) category name for API
//           page: currentPage,
//           limit: currentLimit,
//           sortBy: currentSortByFromUrl,
//         };

//         console.log(`Fetching articles for category param: "${params.category}" (from displayCategoryName: "${displayCategoryName}") with URL param: "${categoryName}"`);
//         const response = await apiClient.get('/articles', { params });
//         setArticles(response.data.data || []);
//         setPagination(response.data.pagination || {});
//       } catch (err) {
//         console.error(`Error fetching articles for category ${categoryName}:`, err);
//         setError(err.response?.data?.error || `Failed to load articles for ${displayCategoryName}.`);
//         setArticles([]);
//         setPagination({});
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategorizedArticles();
//   }, [categoryName, displayCategoryName, currentPage, currentLimit, searchParams]); // Re-fetch if categoryName or page changes

//   // Ensure category names used in Links match the expected API filter value
//   // e.g., if API expects "Campus Life", link should be to "/category/campus-life"
//   // and displayCategoryName should correctly format it back if needed for the API call.
//   // The current displayCategoryName assumes the API expects capitalized, space-separated names.

//   const handleSortChange = (e) => {
//     setSortBy(e.target.value);
//     // The useEffect for 'sortBy' will handle updating searchParams and triggering re-fetch
//   };
  
//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Latest Articles</h1>
//         {/* --- SORTING DROPDOWN --- */}
//         <div>
//           <label htmlFor="sortArticles" className="sr-only">Sort articles by</label>
//           <select
//             id="sortArticles"
//             name="sortBy"
//             className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
//             value={sortBy}
//             onChange={handleSortChange}
//           >
//             {sortOptions.map(option => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>
//         {/* --- END SORTING DROPDOWN --- */}
//       </div>

//       <div className="mb-8 pb-4 border-b border-gray-200">
//         {/* Optional Breadcrumbs */}
//         <nav className="text-sm mb-2" aria-label="Breadcrumb">
//           <ol className="list-none p-0 inline-flex">
//             <li className="flex items-center">
//               <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
//               <svg className="fill-current w-3 h-3 mx-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
//             </li>
//             <li className="flex items-center">
//               <span className="text-gray-400">Categories</span> {/* Or a link to a categories list page */}
//               <svg className="fill-current w-3 h-3 mx-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
//             </li>
//             <li className="flex items-center">
//               <span className="text-gray-700 font-medium">{displayCategoryName}</span>
//             </li>
//           </ol>
//         </nav>
//         <h1 className="text-3xl font-bold text-gray-800">
//           Articles in: <span className="text-blue-600">{displayCategoryName}</span>
//         </h1>
//       </div>


//       {loading && (
//         <div className="text-center py-20"><p className="text-gray-500 text-lg">Loading articles...</p></div>
//       )}
//       {error && (
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
//           <p className="font-bold">Error</p>
//           <p>{error}</p>
//         </div>
//       )}
//       {!loading && !error && articles.length === 0 && (
//         <div className="text-center py-20">
//           <p className="text-gray-500 text-lg">No articles found in the "{displayCategoryName}" category.</p>
//           <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
//             ← Back to all articles
//           </Link>
//         </div>
//       )}

//       {!loading && !error && articles.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
//           {articles.map((article) => (
//             <ArticleCard key={article._id} article={article} />
//           ))}
//         </div>
//       )}

//       {/* Pagination Controls (identical to HomePage) */}
//       {!loading && (pagination.prev || pagination.next) && (
//          <div className="mt-10 flex justify-center items-center space-x-2 sm:space-x-4">
//           {pagination.prev ? (
//             <Link
//               // Construct link with categoryName in path and page/limit in query
//               to={`/category/${categoryName}?page=${pagination.next.page}&limit=${currentLimit}&sortBy=${sortBy}`}
//               className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               ← Previous
//             </Link>
//           ) : ( <span className="px-3 sm:px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-400 cursor-not-allowed">← Previous</span> )}

//           <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
//              Page {currentPage} {pagination.totalPages ? `of ${Math.ceil(pagination.totalCount / currentLimit)}` : ''}
//           </span>

//           {pagination.next ? (
//             <Link
//               to={`/category/${categoryName}?page=${pagination.next.page}&limit=${currentLimit}&sortBy=${sortBy}`}
//               className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               Next →
//             </Link>
//           ) : ( <span className="px-3 sm:px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-400 cursor-not-allowed">Next →</span> )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default CategoryPage;