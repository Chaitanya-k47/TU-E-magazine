// src/pages/ArticleEditPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/api';
import AuthorMultiSelect from '../components/AuthorMultiSelect'; // Ensure this component is created and working
import { useAuth } from '../context/AuthContext';

const articleCategories = ['Academics', 'Events', 'Research', 'Campus Life', 'Achievements', 'Announcements', 'Other'];

function ArticleEditPage() {
  const { id: articleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Current logged-in user

  const [originalArticle, setOriginalArticle] = useState(null); // Stores the initially fetched article
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [authorIds, setAuthorIds] = useState([]); // Holds the array of author IDs for the form
  
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // URL of the existing image
  const [newImageFile, setNewImageFile] = useState(null);    // New File object for image replacement
  const [imagePreview, setImagePreview] = useState('');      // Data URL for previewing new or existing image
  
  const [currentAttachments, setCurrentAttachments] = useState([]); // Existing attachments {fileName, fileUrl, fileType, _uiId}
  const [newAttachmentFiles, setNewAttachmentFiles] = useState([]); // New File objects for attachments

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchArticleToEdit = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/articles/${articleId}`);
      const fetchedArticle = response.data.data;
      setOriginalArticle(fetchedArticle);

      const isAdmin = user?.role === 'admin';
      // Ensure fetchedArticle.userIds is an array before calling .some()
      const isAnAuthor = Array.isArray(fetchedArticle.userIds) && fetchedArticle.userIds.some(
        author => (author._id || author) === user?.id // Handles populated or string IDs
      );

      if (!isAdmin && !isAnAuthor) {
        setError('You are not authorized to edit this article.');
        setLoading(false);
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      setTitle(fetchedArticle.title || '');
      setContent(fetchedArticle.content || '');
      setCategory(fetchedArticle.category || articleCategories[0]);
      
      // Initialize authorIds state from fetched article
      const loadedAuthorIds = (fetchedArticle.userIds || []).map(authorOrId => 
        typeof authorOrId === 'string' ? authorOrId : authorOrId?._id
      ).filter(Boolean); // Ensure all are strings and valid
      setAuthorIds([...new Set(loadedAuthorIds)]); // Ensure unique IDs

      const imageUrlFromBackend = fetchedArticle.imageUrl || '';
      setCurrentImageUrl(imageUrlFromBackend);
      setImagePreview(imageUrlFromBackend ? (imageUrlFromBackend.startsWith('http') ? imageUrlFromBackend : `${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''}${imageUrlFromBackend}`) : '');
      
      setCurrentAttachments(
        (fetchedArticle.attachments || []).map((att, index) => ({
          ...att,
          _uiId: `current-${Date.now()}-${index}` // Unique ID for UI list management
        }))
      );
      setNewAttachmentFiles([]); // Reset any staged new files

    } catch (err) {
      console.error('Error fetching article for edit:', err);
      setError(err.response?.data?.error || 'Failed to load article data. Please check permissions or if the article exists.');
      setOriginalArticle(null);
    } finally {
      setLoading(false);
    }
  }, [articleId, user, navigate]);

  useEffect(() => {
    fetchArticleToEdit();
  }, [fetchArticleToEdit]);

  // Handler for AuthorMultiSelect component
  const handleAuthorChange = (selectedIds) => {
    // selectedIds is an array of string IDs from AuthorMultiSelect
    let newAuthorList = [...new Set(selectedIds)]; // Ensure uniqueness

    // Business rule: If the current user is an editor and was an original author,
    // they should not be able to remove themselves if it leaves no authors or
    // if specific rules apply. Admins have more freedom.
    // This example ensures that if the current user (editor) was an author,
    // and the new list would make them not an author, they are re-added IF they
    // are not an admin. This ensures an editor doesn't accidentally remove themselves.
    // More complex rules can be applied (e.g., must have at least one author always).
    if (user && user.role !== 'admin' && originalArticle?.userIds?.map(a => a._id || a).includes(user.id)) {
        if (!newAuthorList.includes(user.id.toString())) {
            newAuthorList.push(user.id.toString());
            newAuthorList = [...new Set(newAuthorList)]; // Re-ensure uniqueness
        }
    }
    // Ensure there's at least one author if the list becomes empty and user is not admin
    // If admin, they could potentially make it empty (if backend allows)
    if (newAuthorList.length === 0 && user && user.role !== 'admin') {
        newAuthorList = [user.id.toString()];
    }

    setAuthorIds(newAuthorList);
  };

  const handleNewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    } else {
      setNewImageFile(null);
      const actualCurrentImg = originalArticle?.imageUrl || ''; // Use originalArticle for fallback
      setImagePreview(actualCurrentImg ? (actualCurrentImg.startsWith('http') ? actualCurrentImg : `${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''}${actualCurrentImg}`) : '');
    }
  };

  const handleRemoveCurrentImage = () => {
    setNewImageFile(null);
    setCurrentImageUrl(''); // This reflects UI intent to remove
    setImagePreview('');
  };

  const handleNewAttachmentsChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFilesArray = Array.from(e.target.files);
      setNewAttachmentFiles(prev => [...new Set([...prev, ...newFilesArray])]); // Append and ensure uniqueness by object ref
    }
    e.target.value = null;
  };

  const removeNewAttachment = (fileNameToRemove) => {
    setNewAttachmentFiles(prev => prev.filter(file => file.name !== fileNameToRemove));
  };

  const removeExistingAttachment = (uiIdToRemove) => {
    setCurrentAttachments(prev => prev.filter(att => att._uiId !== uiIdToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalArticle && !loading && !error) {
        setError("Cannot submit form: original article data could not be loaded or is missing.");
        return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);

    // Author IDs
    if (authorIds && authorIds.length > 0) {
        const finalAuthorIds = [...new Set(authorIds.map(id => id.toString()))]; // Final check for uniqueness
        if (finalAuthorIds.length === 0) {
            setError("Article must have at least one author."); setIsSubmitting(false); return;
        }
        finalAuthorIds.forEach(id => formData.append('authorIds[]', id));
    } else {
        setError("Article must have at least one author. Please select/add authors.");
        setIsSubmitting(false);
        return;
    }

    // Image Handling
    if (newImageFile) {
      formData.append('imageUrl', newImageFile);
    } else if (!newImageFile && currentImageUrl === '' && originalArticle?.imageUrl) {
      formData.append('imageUrl', ''); // Signal backend to delete
    }

    // Attachments Handling
    if (newAttachmentFiles.length > 0) {
      newAttachmentFiles.forEach(file => formData.append('attachments', file));
    } else {
        // No new files. Check if user intends to modify existing attachments.
        const originalAttachmentUrls = (originalArticle?.attachments || []).map(att => att.fileUrl).sort();
        const currentAttachmentUrlsInUI = currentAttachments.map(att => att.fileUrl).sort();

        if (JSON.stringify(originalAttachmentUrls) !== JSON.stringify(currentAttachmentUrlsInUI)) {
            // The list of attachments to keep has changed from the original.
            if (currentAttachments.length === 0 && originalAttachmentUrls.length > 0) {
                formData.append('clearAllAttachments', 'true');
            } else if (currentAttachments.length > 0) {
                currentAttachments.forEach(att => formData.append('existingAttachmentUrlsToKeep[]', att.fileUrl));
            }
            // If currentAttachments matches originalAttachments, nothing needs to be sent about attachments.
        }
    }

    console.log('--- Submitting FormData (Edit Article) ---');
    for (let [key, value] of formData.entries()) { /* ... console log ... */ }
    console.log('------------------------------------------');

    try {
      const response = await apiClient.put(`/articles/${articleId}`, formData);
      setSuccessMessage('Article updated successfully!');
      const updatedData = response.data.data;

      setOriginalArticle(updatedData); // Update originalArticle with new server data
      setTitle(updatedData.title || '');
      setContent(updatedData.content || '');
      setCategory(updatedData.category || '');
      setAuthorIds((updatedData.userIds || []).map(author => typeof author === 'string' ? author : author._id).filter(Boolean));
      
      const newImgUrl = updatedData.imageUrl || '';
      setCurrentImageUrl(newImgUrl); // Reflects what's now in DB
      if (!newImageFile) { // Only reset preview if a new file wasn't just staged
          setImagePreview(newImgUrl ? (newImgUrl.startsWith('http') ? newImgUrl : `${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''}${newImgUrl}`) : '');
      }
      
      setCurrentAttachments(
        (updatedData.attachments || []).map((att, index) => ({ ...att, _uiId: `current-${Date.now()}-${index}`}))
      );
      setNewImageFile(null); // Clear staged new image file
      setNewAttachmentFiles([]); // Clear staged new attachment files

      setTimeout(() => {
        if (originalArticle?.status === 'Published' && updatedData.status !== 'Published' && updatedData.status !== originalArticle.status) {
            alert("Article updated. Since it was previously published and significantly changed, its status is now '"+updatedData.status+"' and may require re-approval.");
        }
        navigate(`/article/${articleId}`);
      }, 1500);

    } catch (err) {
      console.error('Error updating article (frontend):', err.response || err.message || err);
      setError(err.response?.data?.error || 'Failed to update article. Please check your input and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading article for editing...</div>;
  
  if (error && !originalArticle) {
      return (
          <div className="max-w-3xl mx-auto p-6 my-8">
              <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md shadow-md">
                <p className="font-semibold">Error Loading Article Data:</p>
                <p>{error}</p>
              </div>
              <Link to="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">Back to Dashboard</Link>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md my-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Edit Article</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successMessage}</div>}

      {originalArticle ? (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full input-style" required />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full input-style" required>
              {articleCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* --- Author Selection --- */}
          <div className="mb-6">
            <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-1">
              Authors
            </label>
            <AuthorMultiSelect
              selectedAuthorIds={authorIds} // Pass current authorIds state
              onChange={handleAuthorChange}    // Use the dedicated handler
              currentUserId={user?.id}
              currentUserRole={user?.role}
            />
            <p className="text-xs text-gray-500 mt-1">Select one or more authors for this article.</p>
          </div>
          {/* --- End Author Selection --- */}

          {/* Content - Standard Textarea */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
            <textarea
              id="content"
              rows="15"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full input-style min-h-[250px]"
              required
              placeholder="Write your article content here..."
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label htmlFor="newImageFile-edit" className="block text-sm font-medium text-gray-700 mb-1">Change Featured Image</label>
            <input type="file" id="newImageFile-edit" accept="image/png, image/jpeg, image/gif" onChange={handleNewImageChange} className="file-input-style" />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">{newImageFile ? "New image preview:" : (currentImageUrl ? "Current image:" : "Image preview:")}</p>
                <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded object-cover border" />
              </div>
            )}
            {currentImageUrl && !newImageFile && (
              <button type="button" onClick={handleRemoveCurrentImage}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 p-1 border border-red-300 rounded hover:bg-red-50">Clear current image</button>
            )}
          </div>

          {/* Attachments Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Manage Attachments</label>
            {currentAttachments.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">Current attachments (click × to remove for this update):</p>
                {currentAttachments.map((att) => (
                  <div key={att._uiId} className="text-xs text-gray-500 flex items-center justify-between bg-gray-50 p-1.5 rounded mb-1 shadow-sm">
                    <a href={att.fileUrl.startsWith('http') ? att.fileUrl : `${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''}${att.fileUrl}`} target="_blank" rel="noopener noreferrer" className="hover:underline truncate w-4/5" title={att.fileName}>
                      {att.fileName}
                    </a>
                    <button type="button" onClick={() => removeExistingAttachment(att._uiId)} className="text-red-500 hover:text-red-700 font-semibold ml-2 p-1 rounded-full hover:bg-red-100 transition-colors" aria-label={`Remove ${att.fileName}`}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label htmlFor="new-attachments-input-edit" className="block text-sm font-medium text-gray-700 mb-1">Add New Attachments</label>
            <input type="file" id="new-attachments-input-edit" multiple onChange={handleNewAttachmentsChange} className="file-input-style" />
            {newAttachmentFiles.length > 0 && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <p className="text-sm font-medium text-gray-700">New files to upload:</p>
                {newAttachmentFiles.map((file, index) => (
                  <div key={`new-edit-${index}-${file.name}`} className="text-xs text-gray-600 flex items-center justify-between bg-blue-50 p-1.5 rounded-md shadow-sm">
                    <span className="truncate w-4/5" title={file.name}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    <button type="button" onClick={() => removeNewAttachment(file.name)} className="text-red-500 hover:text-red-700 font-semibold ml-2 p-1 rounded-full hover:bg-red-100 transition-colors" aria-label={`Remove ${file.name}`}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button type="submit" disabled={isSubmitting || loading} className={`w-full btn-primary ${isSubmitting || loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSubmitting ? 'Updating Article...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        !error && <p className="text-center text-gray-500 py-10">Could not load article data to edit. It might have been deleted or an error occurred.</p>
      )}
    </div>
  );
}

export default ArticleEditPage;