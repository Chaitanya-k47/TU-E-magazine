// src/pages/admin/AdminArticleListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/api';
import { Link } from 'react-router-dom';
import { 
    FiEdit, FiTrash2, FiCheckCircle, FiXCircle, 
    FiClock, FiEye, FiArchive, FiAlertTriangle, FiThumbsUp, FiMessageSquare, FiEdit3
} from 'react-icons/fi';

// --- PlagiarismDisplay Component (Moved here for self-containment of this file) ---
// In a real app, this would be in its own components/PlagiarismDisplay.jsx file and imported.
const PlagiarismDisplay = ({ status, score }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';
  let IconComponent = FiThumbsUp; // Default

  if (status === 'Checked - Flagged') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
    IconComponent = FiAlertTriangle;
  } else if (status === 'Checked - OK') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-700';
    IconComponent = FiCheckCircle;
  } else if (status === 'Check Failed') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
    IconComponent = FiAlertTriangle;
  } else if (status === 'Pending' || status === 'Not Checked') {
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      IconComponent = FiClock;
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} whitespace-nowrap`}>
      <IconComponent className="mr-1 h-3.5 w-3.5" />
      {status}
      {typeof score === 'number' && <span className="ml-1 font-semibold">({score}%)</span>}
    </div>
  );
};
// --- End PlagiarismDisplay ---


const articleStatuses = ['Draft', 'Pending Approval', 'Pending Admin Review', 'Published', 'Rejected'];
const articleCategories = ['Academics', 'Events', 'Research', 'Campus Life', 'Achievements', 'Announcements', 'Other'];

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) { return 'Invalid Date'; }
};

function AdminArticleListPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({ status: 'Pending Admin Review', category: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const articlesPerPage = 10;

  const fetchAdminArticles = useCallback(async () => {
    setLoading(true); 
    setError('');
    try {
      const params = { 
        page: currentPage, 
        limit: articlesPerPage 
      };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;

      const response = await apiClient.get('/admin/articles', { params });
      setArticles(response.data.data || []);
      setTotalArticles(response.data.totalCount || 0);
      setTotalPages(Math.ceil((response.data.totalCount || 0) / articlesPerPage));
    } catch (err) {
      console.error("Error fetching admin articles:", err);
      setError(err.response?.data?.error || 'Failed to fetch articles.');
      setArticles([]); 
      setTotalArticles(0); 
      setTotalPages(1);
    } finally { 
      setLoading(false); 
    }
  }, [filters, currentPage, articlesPerPage]);

  useEffect(() => {
    fetchAdminArticles();
  }, [fetchAdminArticles]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const prepareStatusChange = (articleId, articleTitle, currentArticleStatus, newStatus) => {
    let currentReviewNotes = articles.find(art => art._id === articleId)?.reviewNotes || '';
    let promptMessage = `Enter optional review notes before changing status of "${articleTitle}" to "${newStatus}":`;

    if (newStatus === 'Rejected') {
      promptMessage = `REASON FOR REJECTING "${articleTitle}": (This will be visible to authors)`;
      const notes = prompt(promptMessage, currentReviewNotes);
      if (notes === null) return; // User cancelled rejection prompt
      if (notes.trim() === '') {
          alert("Rejection reason cannot be empty.");
          return;
      }
      executeStatusChange(articleId, articleTitle, newStatus, notes);
    } else if (newStatus === 'Published' && currentArticleStatus === 'Pending Admin Review') {
      promptMessage = `Optional notes for PUBLISHING "${articleTitle}":`;
      const notes = prompt(promptMessage, currentReviewNotes);
      if (notes === null) return; // User cancelled publishing prompt
      executeStatusChange(articleId, articleTitle, newStatus, notes);
    } else {
      if (!window.confirm(`Are you sure you want to change status of "${articleTitle}" from "${currentArticleStatus}" to "${newStatus}"?`)) {
        return;
      }
      const notes = prompt(`Optional notes for changing status of "${articleTitle}" to "${newStatus}":`, currentReviewNotes);
      if (notes === null) return; // User cancelled notes prompt
      executeStatusChange(articleId, articleTitle, newStatus, notes);
    }
  };

  const executeStatusChange = async (articleId, articleTitle, newStatus, notes) => {
    try {
      const payload = { status: newStatus };
      if (notes !== undefined && notes !== null) {
        payload.reviewNotes = notes;
      }
      const response = await apiClient.put(`/articles/${articleId}/status`, payload);
      // Update local state for immediate UI feedback
      setArticles(prevArticles =>
        prevArticles.map(art =>
          art._id === articleId ? response.data.data : art // Replace with the full updated article from backend
        )
      );
      alert(`Article "${articleTitle}" status updated to ${newStatus}.`);
      // Optionally, if the current filter was for the old status, refetch or clear filter
      if (filters.status && filters.status !== newStatus && filters.status !== '') {
          fetchAdminArticles(); // Re-fetch if item might disappear from current filter
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY DELETE the article "${articleTitle}"? This action cannot be undone.`)) {
        try {
            await apiClient.delete(`/articles/${articleId}`);
            setArticles(prev => prev.filter(article => article._id !== articleId));
            const newTotalArticles = totalArticles - 1;
            setTotalArticles(newTotalArticles);
            setTotalPages(Math.ceil(newTotalArticles / articlesPerPage));
            if (articles.length -1 === 0 && currentPage > 1) {
                setCurrentPage(prevPage => Math.max(1, prevPage -1));
            }
            alert(`Article "${articleTitle}" deleted successfully.`);
        } catch (err) {
            console.error("Error deleting article:", err);
            setError(err.response?.data?.error || 'Failed to delete article.');
        }
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    // For simplicity, just Prev/Next and Current Page/Total Pages
    return (
        <div className="mt-6 flex justify-center items-center space-x-2">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1 || loading} 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Prev
            </button>
            <span className="text-sm text-gray-700 px-3 py-1.5 bg-gray-100 rounded-md">
                Page {currentPage} of {totalPages}
            </span>
            <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages || loading} 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
  };

  if (loading && articles.length === 0) return <p className="text-gray-500 p-4 text-center">Loading articles for admin review...</p>;
  if (error) return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6">Manage All Articles</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="statusFilterAdmin" className="block text-sm font-medium text-gray-700">Filter by Status</label>
          <select id="statusFilterAdmin" name="status" value={filters.status} onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="">All Statuses</option>
            {articleStatuses.map(status => (<option key={status} value={status}>{status}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="categoryFilterAdmin" className="block text-sm font-medium text-gray-700">Filter by Category</label>
          <select id="categoryFilterAdmin" name="category" value={filters.category} onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="">All Categories</option>
            {articleCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
        </div>
      </div>

      {loading && articles.length > 0 && <p className="text-center text-gray-500 my-4">Updating list...</p> }

      {articles.length === 0 && !loading ? (
        <p className="text-gray-500 text-center py-5">No articles found matching your criteria.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title/Category</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author(s)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plagiarism</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Notes</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article._id} className={`${article.status === 'Pending Admin Review' ? 'bg-blue-50 hover:bg-blue-100' : article.status === 'Pending Approval' ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate w-40 hover:whitespace-normal hover:overflow-visible" title={article.title}>{article.title}</div>
                    <div className="text-xs text-gray-500">{article.category}</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500 truncate w-32 hover:whitespace-normal hover:overflow-visible" title={article.userIds?.map(author => author.name).join(', ')}>
                    {article.userIds?.map(author => author.name).join(', ') || 'N/A'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${article.status === 'Published' ? 'bg-green-100 text-green-800' :
                        article.status === 'Pending Approval' ? 'bg-orange-100 text-orange-800' :
                        article.status === 'Pending Admin Review' ? 'bg-blue-100 text-blue-800' :
                        article.status === 'Draft' ? 'bg-gray-200 text-gray-800' :
                        'bg-red-100 text-red-800'}`}> {article.status} </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <PlagiarismDisplay status={article.plagiarismStatus} score={article.plagiarismScore} />
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-500 truncate w-32 hover:whitespace-normal hover:overflow-visible" title={article.reviewNotes}>
                    {article.reviewNotes || '-'}
                  </td>
                   <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div>Created: {formatDate(article.createdAt)}</div>
                    {article.publishedAt && <div>Published: {formatDate(article.publishedAt)}</div>}
                    <div>Updated: {formatDate(article.updatedAt)}</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 mb-1"> {/* Main actions */}
                        <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50" title="View"><FiEye size={15}/></Link>
                        <Link to={`/article/${article._id}/edit`} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="Edit"><FiEdit size={15}/></Link>
                        <button onClick={() => handleDeleteArticle(article._id, article.title)} className="text-red-700 hover:text-red-900 p-1 rounded hover:bg-red-100" title="Delete Permanently"><FiTrash2 size={15}/></button>
                    </div>
                    <div className="flex items-center space-x-1"> {/* Status change actions */}
                        {article.status === 'Pending Admin Review' && (
                          <>
                            <button onClick={() => prepareStatusChange(article._id, article.title, article.status, 'Published')} className="text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-50" title="Approve & Publish"><FiCheckCircle size={15}/></button>
                            <button onClick={() => prepareStatusChange(article._id, article.title, article.status, 'Rejected')} className="text-pink-500 hover:text-pink-700 p-1 rounded hover:bg-pink-50" title="Reject Article"><FiXCircle size={15}/></button>
                          </>
                        )}
                        {article.status === 'Published' && (
                          <button onClick={() => prepareStatusChange(article._id, article.title, article.status, 'Draft')} className="text-yellow-500 hover:text-yellow-700 p-1 rounded hover:bg-yellow-50" title="Unpublish (Set to Draft)"><FiArchive size={15}/></button>
                        )}
                        {(article.status === 'Draft' || article.status === 'Pending Approval') && (
                          <button onClick={() => prepareStatusChange(article._id, article.title, article.status, 'Pending Admin Review')} className="text-teal-500 hover:text-teal-700 p-1 rounded hover:bg-teal-50" title="Mark as Ready for Admin Review"><FiClock size={15}/></button>
                        )}
                         {article.status === 'Rejected' && (
                          <button onClick={() => prepareStatusChange(article._id, article.title, article.status, 'Draft')} className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100" title="Move to Draft for Re-editing"><FiEdit3 size={15}/></button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {renderPagination()}
    </div>
  );
}

export default AdminArticleListPage;