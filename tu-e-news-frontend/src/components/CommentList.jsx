// src/components/CommentList.jsx
import React from 'react';
import CommentItem from './CommentItem';
import { Link } from 'react-router-dom'; // Assuming pagination uses react-router Link

function CommentList({
    comments,
    loading,
    error,
    pagination,
    onDeleteComment,
    articleId // Needed for pagination links
}) {

  if (loading) {
    return <p className="text-gray-500">Loading comments...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error loading comments: {error}</p>;
  }

  if (!comments || comments.length === 0) {
    return <p className="text-gray-500 italic">Be the first to comment!</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          onDeleteComment={onDeleteComment}
        />
      ))}

      {/* Pagination for Comments */}
      {(pagination?.prev || pagination?.next) && (
         <div className="mt-6 flex justify-center items-center space-x-4">
           {/* Note: Comment pagination might need different URL handling if not standard query params */}
           {/* This assumes comment pages are handled by query params on the article detail URL */}
           {pagination.prev ? (
            <Link
              to={`/article/${articleId}?commentPage=${pagination.prev.page}&commentLimit=${pagination.prev.limit}`}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
              preventScrollReset={true} // Keep scroll position when changing pages
            >
              ← Previous Comments
            </Link>
          ) : (
             <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-medium text-gray-400 cursor-not-allowed">
                ← Previous Comments
             </span>
          )}

          {pagination.next ? (
            <Link
               to={`/article/${articleId}?commentPage=${pagination.next.page}&commentLimit=${pagination.next.limit}`}
               className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
               preventScrollReset={true}
            >
              Next Comments →
            </Link>
          ) : (
            <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-medium text-gray-400 cursor-not-allowed">
                Next Comments →
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentList;