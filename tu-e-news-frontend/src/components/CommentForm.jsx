// src/components/CommentForm.jsx
import React, { useState } from 'react';
import apiClient from '../utils/api';
import { useAuth } from '../context/AuthContext';

function CommentForm({ articleId, onCommentAdded }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth(); // Only needed if rendering conditionally outside

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    // Basic length check (optional)
    if (text.length > 1000) {
        setError('Comment is too long (max 1000 characters).');
        return;
    }


    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiClient.post(`/articles/${articleId}/comments`, { text });
      onCommentAdded(response.data.data); // Pass the new comment up to the parent
      setText(''); // Clear the form
    } catch (err) {
      console.error("Error posting comment:", err);
      setError(err.response?.data?.error || 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If component is rendered, user must be authenticated based on parent logic
  if (!isAuthenticated) {
    return <p className="text-gray-500">Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> to comment.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <label htmlFor="commentText" className="block text-sm font-medium text-gray-700 mb-1">
        Add your comment
      </label>
      <textarea
        id="commentText"
        rows="3"
        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
        placeholder="Write something thoughtful..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        disabled={isSubmitting}
      ></textarea>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}

export default CommentForm;