// src/components/CommentItem.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiUser } from 'react-icons/fi';

// Reusable date formatter
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
  } catch (e) { return ''; }
};

function CommentItem({ comment, onDeleteComment }) {
  const { user, isAuthenticated } = useAuth();

  // Check if the logged-in user can delete this comment
  const canDelete = isAuthenticated && comment.userId && (
    user?.role === 'admin' || user?.id === comment.userId._id
  );

  const handleDelete = () => {
      if (window.confirm('Are you sure you want to delete this comment?')) {
         onDeleteComment(comment._id);
      }
  };

  if (!comment || !comment.userId) return null; // Basic check for valid comment data

  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          {/* Placeholder Avatar */}
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-400">
             <FiUser className="h-5 w-5 text-white" />
          </span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">{comment.userId.name || 'Anonymous'}</h3>
            <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
           {canDelete && (
             <button
                onClick={handleDelete}
                className="mt-1 text-xs text-red-600 hover:text-red-800 flex items-center"
                aria-label="Delete comment"
             >
                <FiTrash2 className="mr-1" /> Delete
             </button>
           )}
        </div>
      </div>
    </div>
  );
}

export default CommentItem;