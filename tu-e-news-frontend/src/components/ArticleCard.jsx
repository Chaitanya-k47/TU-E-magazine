// src/components/ArticleCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiThumbsUp, FiMessageSquare, FiImage, FiBookOpen } from 'react-icons/fi'; // Icons for likes/comments

// Function to format date (optional, can use a library like date-fns later)
const formatDate = (dateString) => {
  if (!dateString) return 'Date unavailable';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return 'Invalid date';
  }
};

// Helper to get a placeholder color based on category (optional, for more variety)
const getCategoryPlaceholderColor = (category) => {
  const colors = {
    'Academics': 'bg-blue-100',
    'Events': 'bg-green-100',
    'Research': 'bg-indigo-100',
    'Campus Life': 'bg-yellow-100',
    'Achievements': 'bg-purple-100',
    'Announcements': 'bg-pink-100',
    'Other': 'bg-red-100', // Default
  };
  return colors[category] || colors['Other'];
};

function ArticleCard({ article }) {
  if (!article) return null; // Don't render if no article data

  // Safely access nested author data (populated from backend)
  const authorName = article.userIds && article.userIds.length > 0
    ? article.userIds.map(author => author.name).join(', ') // Join names if multiple authors
    : 'Unknown Author';

  // Basic excerpt generation (can be improved)
  const excerpt = article.content
    ? article.content.substring(0, 150) + (article.content.length > 150 ? '...' : '')
    : 'No content preview available.';

  return (
    <Link 
      to={`/article/${article._id}`}
      className={`
        flex flex-col {/* Ensure card content flows vertically */}
        bg-white rounded-lg shadow-md overflow-hidden mb-6 
        transition-all duration-300 ease-in-out 
        hover:shadow-xl hover:-translate-y-1 hover:scale-[1.015] 
        focus:shadow-xl focus:-translate-y-1 focus:scale-[1.015] {/* Use focus directly on the Link */}
        group relative
      `}
    >
      {/* Optional Image */}
      <div className="w-full h-48 flex items-center justify-center overflow-hidden"> {/* Consistent height container */}
          {article.imageUrl ? (
            <img
              src={article.imageUrl.startsWith('http') ? article.imageUrl : `${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''}${article.imageUrl}`}
              alt={article.title || 'Article image'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" // h-full to fill container
            />
          ) : (
            // Placeholder for when there's no image
            <div 
              className={`w-full h-full flex flex-col items-center justify-center p-4 text-center ${getCategoryPlaceholderColor(article.category)}`}
            >
              <FiBookOpen size={48} className="text-gray-400 opacity-70 mb-2" /> {/* Icon */}
              {/* Optionally display category name as placeholder text */}
              <span className="text-sm font-medium text-gray-500">
                {article.category || 'Article'}
              </span>
            </div>
          )}
        </div>

      <div className="p-4 sm:p-6 flex-grow flex flex-col justify-between">
        <div>
        {/* Category */}
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mb-2 px-2.5 py-0.5 rounded">
          {article.category || 'Uncategorized'}
        </span>

        {/* Title */}
        <Link to={`/article/${article._id}`}>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-blue-600 mb-2 line-clamp-2"> {/* group-hover on title text */}
            {article.title || 'Untitled Article'}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {excerpt}
        </p>
        </div>


        {/* Meta Info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100"> {/* mt-auto pushes this down */}
          <span className="mb-1 sm:mb-0 mr-3">
            By <span className="font-medium">{authorName}</span>
          </span>
          <span className="mb-1 sm:mb-0">
            {formatDate(article.publishedAt || article.createdAt)} {/* Prefer publishedAt */}
          </span>

          {/* Likes and Comments Icons */}
          <div className="flex items-center space-x-3 mt-1 sm:mt-0 w-full sm:w-auto justify-start sm:justify-end">
            <span className="flex items-center">
              <FiThumbsUp className="mr-1" /> {article.likesCount !== undefined ? article.likesCount : 0} {/* USE likesCount */}
            </span>
            <span className="flex items-center">
              <FiMessageSquare className="mr-1" /> {article.commentCount !== undefined ? article.commentCount : 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;