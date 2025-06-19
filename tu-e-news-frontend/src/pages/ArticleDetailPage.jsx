// src/pages/ArticleDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../utils/api';
import { FiThumbsUp, FiMessageSquare, FiDownload, FiUser, FiGlobe, FiChevronDown, FiLoader, FiPaperclip } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';

// Reusable date formatter
const formatDate = (dateString) => {
  if (!dateString) return 'Date unavailable';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) { return 'Invalid date'; }
};

const availableLanguages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
];

function ArticleDetailPage() {
  const { id: articleId } = useParams();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [articleError, setArticleError] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [currentUserLiked, setCurrentUserLiked] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [stubbedTranslationMessage, setStubbedTranslationMessage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentPagination, setCommentPagination] = useState({});
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentError, setCommentError] = useState('');
  const currentCommentPage = parseInt(searchParams.get('commentPage') || '1', 10);
  const currentCommentLimit = 5;

  const fetchArticle = useCallback(async () => {
    if (!articleId) return;
    setLoadingArticle(true);
    setArticleError('');
    setArticle(null);
    try {
      const response = await apiClient.get(`/articles/${articleId}`);
      const fetchedArticle = response.data.data;
      setArticle(fetchedArticle);
      if (fetchedArticle) {
        const initialLang = fetchedArticle.language || 'en';
        setSelectedLanguage(initialLang);
        setStubbedTranslationMessage(''); // Always start with original content view
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setArticleError(err.response?.data?.error || `Failed to load article (ID: ${articleId}).`);
      setArticle(null);
    } finally {
      setLoadingArticle(false);
    }
  }, [articleId]);

  useEffect(() => {
    if (!authIsLoading) {
      fetchArticle();
    }
  }, [fetchArticle, authIsLoading]);

  const fetchComments = useCallback(async (page) => {
      if (!articleId || !article) {
        return;
      }
      setLoadingComments(true); setCommentError('');
      try {
          const params = { commentPage: page, commentLimit: currentCommentLimit };
          const response = await apiClient.get(`/articles/${articleId}/comments`, { params });
          setComments(response.data.data || []);
          setCommentPagination(response.data.pagination || {});
      } catch (err) {
          console.error("Error fetching comments:", err);
          setCommentError(err.response?.data?.error || 'Failed to load comments.');
          setComments([]);
          setCommentPagination({});
      } finally {
          setLoadingComments(false);
      }
  }, [articleId, article, currentCommentLimit]);

  useEffect(() => {
    if (article && !authIsLoading) {
        fetchComments(currentCommentPage);
    }
  }, [article, fetchComments, currentCommentPage, authIsLoading]);

  useEffect(() => {
    if (article && user && article.likedBy && !authIsLoading) {
      setCurrentUserLiked(article.likedBy.some(likerId => likerId === user.id || (likerId._id && likerId._id === user.id) ));
    } else {
      setCurrentUserLiked(false);
    }
  }, [article, user, authIsLoading]);

  const handleLikeUnlike = async () => {
    if (!isAuthenticated) {
       navigate('/login', { state: { from: `/article/${articleId}` } });
       return;
    }
    if (isLiking) return;
    setIsLiking(true);
    const originallyLiked = currentUserLiked;
    const originalLikesCount = article?.likesCount ?? 0;
    setCurrentUserLiked(!originallyLiked);
    setArticle(prev => prev ? ({ ...prev, likesCount: originallyLiked ? originalLikesCount - 1 : originalLikesCount + 1 }) : null);
    try {
      const response = await apiClient.put(`/articles/${articleId}/like`);
      setArticle(prev => prev ? ({ ...prev, likesCount: response.data.data.likesCount }) : null);
    } catch (err) {
      console.error("Error liking/unliking article:", err);
      setCurrentUserLiked(originallyLiked);
      setArticle(prev => prev ? ({ ...prev, likesCount: originalLikesCount }) : null);
      alert('Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
    setArticle(prevArticle => prevArticle ? ({ ...prevArticle, commentCount: (prevArticle.commentCount || 0) + 1 }) : null);
  };

  const handleCommentDeleted = async (commentIdToDelete) => {
    try {
      await apiClient.delete(`/comments/${commentIdToDelete}`);
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentIdToDelete));
      setArticle(prevArticle => prevArticle ? ({ ...prevArticle, commentCount: Math.max(0, (prevArticle.commentCount || 0) - 1) }) : null);
    } catch (err) {
       console.error("Error deleting comment:", err);
       alert('Failed to delete comment: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleTranslate = async (targetLangCode) => {
    if (!article || !targetLangCode || isTranslating) return;

    const targetLanguageObject = availableLanguages.find(l => l.code === targetLangCode);
    const targetLanguageName = targetLanguageObject ? targetLanguageObject.name : targetLangCode.toUpperCase();
    const originalArticleLanguage = article.language || 'en';

    if (targetLangCode === originalArticleLanguage) {
        setSelectedLanguage(originalArticleLanguage);
        setStubbedTranslationMessage('');
        setShowLanguageSelector(false);
        return;
    }

    // Check local 'article.translatedContent' (plain object)
    if (article.translatedContent && article.translatedContent[targetLangCode]) {
      console.log(`Using locally available stub translation for ${targetLangCode}`);
      setSelectedLanguage(targetLangCode);
      setStubbedTranslationMessage(
        `Displaying STUB translation for ${targetLanguageName} (from cache). Original content below.`
      );
      setShowLanguageSelector(false);
      return;
    }

    setIsTranslating(true);
    setTranslationError('');
    setStubbedTranslationMessage('');
    try {
      console.log(`Requesting translation to: ${targetLangCode} for article ${articleId} from backend.`);
      const response = await apiClient.post(`/articles/${articleId}/translate`, { targetLanguage: targetLangCode });
      
      if (response.data.success && response.data.data?.article) {
        const updatedArticleFromServer = response.data.data.article;
        setArticle(updatedArticleFromServer); // Key: Update the main article state

        setSelectedLanguage(targetLangCode);
        // Set the message based on the (now updated) article.translatedContent
        if (updatedArticleFromServer.translatedContent && updatedArticleFromServer.translatedContent[targetLangCode]) {
            setStubbedTranslationMessage(
              `Displaying STUB translation for ${targetLanguageName}. Original content below.` // Message that it's displaying
            );
        } else {
            // This case should ideally not be hit if backend saves and returns the translation
            setStubbedTranslationMessage(
              `Content displayed below is a STUB. Would be translated to ${targetLanguageName}. (Simulated & Saved)`
            );
        }
        
      } else {
        throw new Error(response.data.message || "Translation response from backend was incomplete.");
      }
    } catch (err) {
      console.error("Error translating article:", err);
      setTranslationError(err.response?.data?.error || err.message || 'Failed to translate article.');
      setStubbedTranslationMessage('');
    } finally {
      setIsTranslating(false);
      setShowLanguageSelector(false);
    }
  };

  // --- RENDER LOGIC ---
  if (authIsLoading || loadingArticle) { return <div className="text-center py-10">Loading article...</div>; }
  if (articleError && !article) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-xl mx-auto my-8" role="alert">
        <strong className="font-bold">Error: </strong> <span className="block sm:inline">{articleError}</span><br/>
        <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">Go back to Home</Link>
      </div>
    );
  }
  if (!article) {
    return ( <div className="text-center py-10 my-8"><p className="text-xl text-gray-600">Article not found.</p><Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Go back to Home</Link></div> );
  }

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isAnAuthor = isAuthenticated && Array.isArray(article.userIds) && article.userIds.some(author => (author && (author._id === user?.id || author === user?.id)));
  const canViewArticle = article.status === 'Published' || isAdmin || isAnAuthor;

  if (!canViewArticle) {
    return ( <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative max-w-xl mx-auto my-8 text-center" role="alert"><strong className="font-bold">Access Denied!</strong><p className="block sm:inline mt-1">This article is currently "{article.status}" and you do not have permission to view it.</p><br/><Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">Go back to Home</Link></div>);
  }

  const canEditThisArticle = isAdmin || isAnAuthor;
  const authorNames = article.userIds?.map(author => author.name || `User ${author._id?.substring(0,6) || (typeof author === 'string' ? author.substring(0,6) : 'ID')}`).join(', ') || 'Unknown Author';
  
  const displayContent = article.content; // Always original content
  const isShowingTranslationStub = selectedLanguage !== (article.language || 'en') && stubbedTranslationMessage;

  return (
    <article className="bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-lg max-w-4xl mx-auto my-8">
      {isAuthenticated && canEditThisArticle && (
        <div className="mb-6 pb-4 border-b flex justify-end">
          <Link to={`/article/${articleId}/edit`} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out text-sm">Edit Article</Link>
        </div>
      )}
      <div className="mb-4">
        <span className={`inline-block text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ${article.status === 'Published' ? 'bg-green-100 text-green-800' : article.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : article.status === 'Draft' ? 'bg-gray-200 text-gray-800' : 'bg-red-100 text-red-800'}`}>Status: {article.status}</span>
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Category: {article.category || 'Uncategorized'}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>
      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 border-b pb-4">
        <div className="flex items-center mr-6 mb-2 sm:mb-0"><FiUser className="mr-1.5 flex-shrink-0" /><span>By <span className="font-medium text-gray-700">{authorNames}</span></span></div>
        <span>{article.status === 'Published' && article.publishedAt ? `Published on ${formatDate(article.publishedAt)}` : `Created on ${formatDate(article.createdAt)}`}</span>
      </div>

      <div className="my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4">
        <div className="flex-grow">
            {isShowingTranslationStub && (
                <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md shadow-sm"><FiGlobe className="inline mr-1.5 mb-0.5 h-4 w-4" />{stubbedTranslationMessage}<button onClick={() => handleTranslate(article.language || 'en')} className="ml-2 text-xs text-blue-700 hover:underline font-semibold">(Show Original)</button></p>
            )}
        </div>
        <div className="relative flex-shrink-0 mt-2 sm:mt-0">
          <button onClick={() => setShowLanguageSelector(!showLanguageSelector)} disabled={isTranslating} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FiGlobe className="mr-2 h-4 w-4 text-gray-500" />Translate<FiChevronDown className={`ml-1 h-4 w-4 text-gray-500 transform transition-transform duration-150 ${showLanguageSelector ? 'rotate-180' : ''}`} />
          </button>
          {showLanguageSelector && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {(article.language || 'en') !== selectedLanguage && (
                     <button onClick={() => handleTranslate(article.language || 'en')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">Show Original ({availableLanguages.find(l => l.code === (article.language || 'en'))?.name || (article.language || 'en').toUpperCase()})</button>
                )}
                {availableLanguages.map((lang) => (
                  lang.code !== (article.language || 'en') && (
                    <button key={lang.code} onClick={() => handleTranslate(lang.code)} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 ${selectedLanguage === lang.code && isShowingTranslationStub ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'}`} role="menuitem" disabled={isTranslating || (selectedLanguage === lang.code && isShowingTranslationStub)}>
                      {isTranslating && selectedLanguage === lang.code ? (<FiLoader className="animate-spin h-4 w-4 mr-2 inline" />) : null}Translate to {lang.name}
                    </button>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isTranslating && !stubbedTranslationMessage && <p className="text-sm text-blue-600 my-2 flex items-center"><FiLoader className="animate-spin h-4 w-4 mr-2"/>Simulating translation...</p>}
      {translationError && <p className="text-sm text-red-500 my-2">Translation Error: {translationError}</p>}

      {article.imageUrl && ( <img src={article.imageUrl.startsWith('http') ? article.imageUrl : `${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''}${article.imageUrl}`} alt={article.title || 'Article feature image'} className="w-full h-auto max-h-[500px] object-contain rounded-lg mb-8 bg-gray-100"/> )}
      <div className="prose prose-slate lg:prose-lg max-w-none text-gray-800 whitespace-pre-wrap break-words mb-8">{displayContent}</div>

      {article.attachments && article.attachments.length > 0 && (
        <div className="my-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><FiPaperclip className="mr-2 text-gray-500" />Attachments</h3>
          <ul className="space-y-3">
            {article.attachments.map((att, index) => (
              <li key={att._id || index} className="text-sm">
                <a href={att.fileUrl.startsWith('http') ? att.fileUrl : `${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''}${att.fileUrl}`} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 -m-1">
                  <FiDownload className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  <span className="truncate" title={att.fileName}>{att.fileName || `Download Attachment ${index + 1}`}</span>
                  {att.fileType && (<span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">{att.fileType.split('/')[1] || att.fileType}</span>)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {article.reviewNotes && (isAdmin || isAnAuthor) && (
        <div className="my-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800">Admin Review Notes:</h4>
            <p className="text-sm text-yellow-700 whitespace-pre-wrap mt-1">{article.reviewNotes}</p>
        </div>
      )}

      <div className="border-t pt-6 flex flex-wrap items-center justify-between gap-4">
         <button onClick={handleLikeUnlike} disabled={isLiking || !isAuthenticated} className={`flex items-center space-x-2 focus:outline-none transition-opacity ${isLiking ? 'opacity-50 cursor-not-allowed' : ''} ${currentUserLiked && isAuthenticated ? 'text-blue-600 hover:text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}>
            <FiThumbsUp size={20} className={currentUserLiked && isAuthenticated ? 'fill-current text-blue-600' : 'text-gray-600'} />
            <span className="text-sm font-medium">{article.likesCount !== undefined ? article.likesCount : 0} Likes</span>
         </button>
         <div className="flex items-center space-x-2 text-gray-600">
            <FiMessageSquare size={20} />
            <a href="#comments" className="text-sm font-medium hover:underline">Comments ({article.commentCount !== undefined ? article.commentCount : '...'})</a>
         </div>
      </div>

      <div id="comments" className="mt-8 pt-6 border-t">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Comments</h2>
          {isAuthenticated ? ( <CommentForm articleId={articleId} onCommentAdded={handleCommentAdded} /> ) : (
             <div className="bg-gray-50 p-4 rounded-md border text-center">
                <p className="text-gray-600 text-sm">Want to join the conversation? Please <Link to="/login" state={{ from: `/article/${articleId}` }} className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">log in</Link> or <Link to="/register" state={{ from: `/article/${articleId}` }} className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">register</Link> to post a comment.</p>
             </div>
          )}
          <CommentList comments={comments} loading={loadingComments} error={commentError} pagination={commentPagination} onDeleteComment={handleCommentDeleted} articleId={articleId}/>
      </div>
    </article>
  );
}

export default ArticleDetailPage;