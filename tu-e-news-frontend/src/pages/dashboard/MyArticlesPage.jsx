// src/pages/dashboard/MyArticlesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/api';
import { Link } from 'react-router-dom';
import { 
    FiEdit, FiTrash2, FiEye, FiPlusCircle, 
    FiAlertTriangle, FiCheckCircle, FiClock, FiThumbsUp, 
    FiCheckSquare, FiAlertCircle // FiAlertCircle might be redundant if FiAlertTriangle is used for warnings
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) { return 'Invalid Date'; }
};

const articleStatuses = ['Draft', 'Pending Approval', 'Pending Admin Review', 'Published', 'Rejected'];

const PlagiarismDisplay = ({ status, score }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';
  let IconComponent = FiThumbsUp; // Default for OK or Not Checked

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
    IconComponent = FiAlertTriangle; // Using AlertTriangle for failure too
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

function MyArticlesPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const articlesPerPage = 10;

  const fetchMyArticles = useCallback(async () => {
    if (!user) { // Don't fetch if user is not loaded yet
        setLoading(false); // Stop loading if no user
        return;
    }
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit: articlesPerPage };
      if (filterStatus) params.status = filterStatus;

      const response = await apiClient.get('/articles/my-articles/all', { params });
      setArticles(response.data.data || []);
      setTotalArticles(response.data.totalCount || 0);
      setTotalPages(Math.ceil((response.data.totalCount || 0) / articlesPerPage));
    } catch (err) {
      console.error("Error fetching my articles:", err);
      setError(err.response?.data?.error || 'Failed to fetch your articles.');
      setArticles([]);
      setTotalArticles(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, articlesPerPage, filterStatus, user]); // Added user to dependency

  useEffect(() => {
    fetchMyArticles();
  }, [fetchMyArticles]);


  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (window.confirm(`Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`)) {
        try {
            await apiClient.delete(`/articles/${articleId}`);
            setArticles(prev => prev.filter(article => article._id !== articleId));
            setTotalArticles(prev => Math.max(0, prev -1));
            alert('Article deleted successfully.');
             // Optionally re-calculate totalPages or refetch if it affects pagination display
            if (articles.length === 1 && currentPage > 1) { // If last item on a page deleted
                setCurrentPage(prevPage => Math.max(1, prevPage -1));
            } else {
                setTotalPages(Math.ceil((totalArticles -1) / articlesPerPage));
            }
        } catch (err) {
            console.error("Error deleting article:", err);
            setError(err.response?.data?.error || 'Failed to delete article.');
        }
    }
  };

  const handleCoAuthorApprove = async (articleId, articleTitle) => {
    if (!window.confirm(`Are you sure you want to approve the article "${articleTitle}"?`)) {
      return;
    }
    try {
      const response = await apiClient.put(`/articles/${articleId}/approve-coauthor`);
      // Update the specific article in the list with the full updated object from backend
      setArticles(prevArticles =>
        prevArticles.map(art =>
          art._id === articleId ? response.data.data : art
        )
      );
      alert(`Your approval for "${articleTitle}" has been recorded. New status: ${response.data.data.status}`);
    } catch (err) {
      console.error("Error approving article:", err);
      alert(`Failed to approve article: ${err.response?.data?.error || err.message}`);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let pages = [];
    // Simple pagination: just show current page, prev/next
    // For more complex page numbers, you'd add more logic here
    return (
        <div className="mt-6 flex justify-center items-center space-x-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading} className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <span className="text-sm text-gray-700 px-2 py-1 bg-gray-100 rounded-md">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading} className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
    );
  };


  if (loading && articles.length === 0) return <p className="text-gray-500 p-4 text-center">Loading your articles...</p>;
  if (error) return <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>;
  if (!user && !loading) { 
    return <p className="text-gray-500 p-4 text-center">Please log in to see your articles.</p>;
  }


  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-700">My Authored Articles</h1>
        <div className="flex items-center gap-4">
            <div>
              <label htmlFor="statusFilterMyArticles" className="sr-only">Filter by Status</label>
              <select
                id="statusFilterMyArticles"
                name="status"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="">All My Statuses</option>
                {articleStatuses.map(status => ( <option key={status} value={status}>{status}</option> ))}
              </select>
            </div>
            <Link
                to="/articles/create"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm flex items-center whitespace-nowrap"
            > <FiPlusCircle className="mr-2" /> Create New </Link>
        </div>
      </div>

      {loading && articles.length > 0 && <p className="text-center text-gray-500 my-4">Updating list...</p>}

      {articles.length === 0 && !loading ? (
        <p className="text-gray-500 text-center py-5">
            {filterStatus ? `No articles found with status "${filterStatus}".` : "You haven't created or been added as an author to any articles yet."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plagiarism</th>
                {/* --- NEW COLUMN FOR YOUR APPROVAL STATUS --- */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Approval</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Edited By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => {
                const isCurrentUserLastEditor = article.lastEditedBy?._id === user?.id || article.lastEditedBy === user?.id;
                let userApprovalStatusText = 'N/A';
                let needsMyApprovalAction = false;

                if (article.status === 'Pending Approval' && user) {
                  const myApprovalEntry = article.pendingApprovals?.find(
                    appr => (appr.userId?._id || appr.userId) === user.id
                  );

                  if (myApprovalEntry) {
                    if (myApprovalEntry.approved) {
                      userApprovalStatusText = 'Approved by You';
                    } else {
                      userApprovalStatusText = 'Awaiting Your Approval';
                      needsMyApprovalAction = true; // Show Approve button
                    }
                  } else if (article.userIds.length > 1 && !isCurrentUserLastEditor && article.userIds.some(uid => (uid._id || uid) === user.id)) {
                    // If I'm a co-author, not the last editor, and somehow not in pendingApprovals (should be rare if backend logic is correct)
                    // Or if pendingApprovals is empty but I'm a co-author and not last editor.
                    // This signifies my approval is implicitly needed for the flow.
                    // The backend `approveCoAuthor` will verify if user is in `article.pendingApprovals` to actually approve.
                    // If an article is 'Pending Approval' and the current user didn't edit it last, they should have an option to approve.
                    userApprovalStatusText = 'Action Required';
                    needsMyApprovalAction = true;
                  } else if (isCurrentUserLastEditor && article.userIds.length > 1) {
                    userApprovalStatusText = 'Your Edit (Awaiting Others)';
                  } else if (article.userIds.length === 1 && isCurrentUserLastEditor) {
                    userApprovalStatusText = 'Ready for Admin'; // Single author, their "approval" is implicit by editing/creating
                  }
                } else if (article.status === 'Pending Approval' && article.userIds.length > 1 && !isCurrentUserLastEditor) {
                    // If pendingApprovals array is missing/empty but should have entries for co-authors
                    userApprovalStatusText = 'Awaiting Your Approval';
                    needsMyApprovalAction = true;
                }


                return (
                  <tr key={article._id} className={`${needsMyApprovalAction ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 truncate w-40 sm:w-60" title={article.title}>{article.title}</div>
                      {article.reviewNotes && <p className="text-xs text-orange-600 mt-1 italic truncate w-40 sm:w-60" title={article.reviewNotes}>Notes: {article.reviewNotes}</p>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${article.status === 'Published' ? 'bg-green-100 text-green-800' :
                          article.status === 'Pending Approval' ? 'bg-orange-100 text-orange-800' : // Distinct color
                          article.status === 'Pending Admin Review' ? 'bg-yellow-100 text-yellow-800' :
                          article.status === 'Draft' ? 'bg-gray-200 text-gray-800' :
                          'bg-red-100 text-red-800'}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <PlagiarismDisplay status={article.plagiarismStatus} score={article.plagiarismScore} />
                    </td>
                    {/* --- MY APPROVAL STATUS / ACTION CELL --- */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {needsMyApprovalAction ? (
                        <button
                          onClick={() => handleCoAuthorApprove(article._id, article.title)}
                          className="text-green-600 hover:text-green-800 font-semibold flex items-center text-xs py-1 px-2 rounded-md bg-green-100 hover:bg-green-200 shadow-sm transition-colors"
                        >
                          <FiCheckSquare className="mr-1.5 h-4 w-4" /> Approve
                        </button>
                      ) : (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full
                          ${userApprovalStatusText === 'Approved by You' ? 'bg-green-100 text-green-700' : 
                            userApprovalStatusText.includes('Awaiting Others') ? 'bg-blue-100 text-blue-700' :
                            userApprovalStatusText.includes('Ready for Admin') ? 'bg-indigo-100 text-indigo-700' :
                            'text-gray-500'}`}>
                            {userApprovalStatusText}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {article.lastEditedBy?.name || (isCurrentUserLastEditor && article.status !== 'Published' ? 'You' : 'N/A')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1 sm:space-x-2">
                      <Link to={`/article/${article._id}`} className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-100" title="View"><FiEye size={16}/></Link>
                      <Link to={`/article/${article._id}/edit`} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-100" title="Edit"><FiEdit size={16}/></Link>
                      {(article.status === 'Draft' || article.status === 'Pending Approval' || article.status === 'Rejected') && (
                           <button onClick={() => handleDeleteArticle(article._id, article.title)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100" title="Delete"><FiTrash2 size={16}/></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {renderPagination()}
    </div>
  );
}

export default MyArticlesPage;