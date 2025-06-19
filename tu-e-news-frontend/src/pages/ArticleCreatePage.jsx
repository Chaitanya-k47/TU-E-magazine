// src/pages/ArticleCreatePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import AuthorMultiSelect from '../components/AuthorMultiSelect'; 
import { useAuth } from '../context/AuthContext';

const articleCategories = ['Academics', 'Events', 'Research', 'Campus Life', 'Achievements', 'Announcements', 'Other'];

function ArticleCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(articleCategories[0]);
  
  // Author IDs state, initialized with the current user
  const [authorIds, setAuthorIds] = useState(user ? [user.id.toString()] : []); 
  
  // --- CORRECTED IMAGE STATE ---
  const [newImageFile, setNewImageFile] = useState(null); // State for the selected File object
  const [imagePreview, setImagePreview] = useState(''); // State for the image preview URL
  // --- END CORRECTED IMAGE STATE ---
  
  // State for attachments (files selected by user for upload)
  const [stagedAttachments, setStagedAttachments] = useState([]); // Renamed for clarity

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    // Ensure current user is always in authorIds if they are not an admin selecting for others
    // or if the list becomes empty by mistake.
    if (user) {
        setAuthorIds(prevIds => {
            const currentUserIdStr = user.id.toString();
            if (!prevIds.includes(currentUserIdStr)) {
                return [...new Set([...prevIds, currentUserIdStr])];
            }
            return prevIds; // Return previous state if no change to avoid infinite loop if user is already there
        });
    }
  }, [user]); // Re-run if user object changes (e.g., on login/logout during component mount)

  const handleAuthorChange = (selectedCoAuthorIds) => {
    // selectedCoAuthorIds comes from AuthorMultiSelect (these are the *other* authors)
    let newAuthorList = [...selectedCoAuthorIds];
    if (user) { // Ensure current user (creator) is always included
      if (!newAuthorList.includes(user.id.toString())) {
        newAuthorList.push(user.id.toString());
      }
    }
    setAuthorIds([...new Set(newAuthorList)]); // Ensure uniqueness
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file); // Use setNewImageFile
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setNewImageFile(null); // Use setNewImageFile
      setImagePreview('');
    }
  };

  const handleAttachmentsChange = (e) => {
    console.log("--- handleAttachmentsChange triggered (Create Page) ---");
    if (e.target.files && e.target.files.length > 0) {
      const newFilesArray = Array.from(e.target.files);
      setStagedAttachments(prev => { // Append to existing staged files
        const updated = [...prev, ...newFilesArray];
        return updated;
      });
    }
    e.target.value = null; // Reset file input
  };

  const removeAttachment = (fileNameToRemove) => {
    setStagedAttachments(prev => prev.filter(file => file.name !== fileNameToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);

    // Author IDs processing
    let finalAuthorIdsForSubmit = [...new Set(authorIds.map(id => id.toString()))]; // Ensure unique strings

    if (user && !finalAuthorIdsForSubmit.includes(user.id.toString())) {
        finalAuthorIdsForSubmit.push(user.id.toString()); // Final check to ensure creator is included
    }
    finalAuthorIdsForSubmit = [...new Set(finalAuthorIdsForSubmit)]; // Final uniqueness pass


    if (finalAuthorIdsForSubmit.length === 0) {
        setError("Article must have at least one author.");
        setLoading(false);
        return;
    }
    finalAuthorIdsForSubmit.forEach(id => formData.append('authorIds[]', id));

    // Image file
    if (newImageFile) {
      formData.append('imageUrl', newImageFile);
    }

    // Attachment files
    if (stagedAttachments.length > 0) {
      console.log("Appending attachments to FormData:", stagedAttachments.map(f=>f.name));
      stagedAttachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    console.log('--- Submitting FormData (Create Article) ---');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`FormData Entry: ${key} -> File: ${value.name}, Type: ${value.type}, Size: ${value.size}`);
      } else {
        console.log(`FormData Entry: ${key} -> Value: ${value}`);
      }
    }
    console.log('------------------------------------------');

    try {
      const response = await apiClient.post('/articles', formData);
      setSuccessMessage('Article created successfully! Redirecting...');
      
      // Reset form fields
      setTitle('');
      setContent('');
      setCategory(articleCategories[0]);
      setAuthorIds(user ? [user.id.toString()] : []);
      setNewImageFile(null);
      setImagePreview('');
      setStagedAttachments([]);
      
      setTimeout(() => {
        navigate(`/article/${response.data.data._id}`);
      }, 1500);

    } catch (err) {
      console.error('Error creating article:', err.response || err.message || err);
      setError(err.response?.data?.error || 'Failed to create article. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md my-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Create New Article</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successMessage}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full input-style" // Assuming input-style is globally defined
            required
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full input-style"
            required
          >
            {articleCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Author Selection */}
        <div className="mb-6">
          <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-1">
            Co-authors (Optional)
          </label>
          <AuthorMultiSelect
            // Pass only OTHER authors to the select; current user is handled by default/logic
            selectedAuthorIds={authorIds.filter(id => id !== user?.id.toString())}
            onChange={handleAuthorChange} // handleAuthorChange will combine selection with current user
            currentUserId={user?.id} // Pass current user ID for potential filtering within AuthorMultiSelect
          />
          <p className="text-xs text-gray-500 mt-1">
            You ({user?.name || 'Current User'}) are an author. Select additional co-authors.
          </p>
        </div>

        {/* Content - Standard Textarea */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
          <textarea
            id="content"
            rows="10" // Reduced default rows, can be adjusted
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full input-style min-h-[200px]" // Use min-h for textarea
            required
            placeholder="Write your article content here..."
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label htmlFor="image-upload-input" className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
          <input
            type="file"
            id="image-upload-input" // Changed id
            accept="image/png, image/jpeg, image/gif"
            onChange={handleImageChange}
            className="file-input-style" // Assuming file-input-style is globally defined
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded object-cover border" />
            </div>
          )}
        </div>

        {/* Attachments Upload */}
        <div className="mb-6">
          <label htmlFor="attachments-input" className="block text-sm font-medium text-gray-700 mb-1">
            Attachments (PDF, DOC, DOCX - Max 5)
          </label>
          <input
            type="file"
            id="attachments-input"
            accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            onChange={handleAttachmentsChange}
            className="file-input-style"
          />
          {stagedAttachments.length > 0 && (
            <div className="mt-3 space-y-2 border-t pt-3">
              <p className="text-sm font-medium text-gray-700">Selected attachments:</p>
              {stagedAttachments.map((file, index) => (
                <div key={`${file.name}-${index}`} className="text-xs text-gray-600 flex items-center justify-between bg-gray-100 p-2 rounded-md shadow-sm">
                  <span className="truncate w-4/5" title={file.name}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.name)}
                    className="text-red-500 hover:text-red-700 font-semibold ml-2 p-1 rounded-full hover:bg-red-100 transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} // Assuming btn-primary is globally defined
          >
            {loading ? 'Creating Article...' : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArticleCreatePage;

// // src/pages/ArticleCreatePage.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import apiClient from '../utils/api';
// import AuthorMultiSelect from '../components/AuthorMultiSelect'; 
// import { useAuth } from '../context/AuthContext'; // To potentially get author info or check role


// // Get category enum values from backend or define them here
// // For now, let's hardcode them as per your Article model, but fetching is better
// const articleCategories = ['Academics', 'Events', 'Research', 'Campus Life', 'Achievements', 'Announcements', 'Other'];


// function ArticleCreatePage() {
//   const navigate = useNavigate();
//   const { user } = useAuth(); // Get current user if needed for default author

//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState(''); // For ReactQuill or textarea
//   const [category, setCategory] = useState(articleCategories[0]); // Default to the first category
// const [authorIds, setAuthorIds] = useState(user ? [user.id.toString()] : []); // Default to current user as an author  const [imageUrl, setImageUrl] = useState(null); // File object for image
//   const [imagePreview, setImagePreview] = useState('');
//   const [attachments, setAttachments] = useState([]); // Array of File objects

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
  

//   // Users list for author selection (fetch this from backend if dynamic)
//   // For now, we'll just use the logged-in user as the default author.
//   // In a real app, you'd fetch users and provide a multi-select component.

//    useEffect(() => {
//     // Ensure current user is always in authorIds when the component loads or user changes
//     // This handles the case where the form might be for an admin creating on behalf of others,
//     // but by default, the creator should be an author.
//     if (user && !authorIds.includes(user.id.toString())) {
//       setAuthorIds(prev => [...new Set([...prev, user.id.toString()])]);
//     }
//   }, [user]); // Only run when user object changes

//   const handleAuthorChange = (selectedIds) => {
//     // Ensure current user (if not admin) remains in the list if they are the creator
//     let newAuthorIds = selectedIds;
//     if (user && user.role !== 'admin' && !newAuthorIds.includes(user.id.toString())) {
//       newAuthorIds = [...new Set([...newAuthorIds, user.id.toString()])];
//     } else if (user && newAuthorIds.length === 0 && user.role !== 'admin') {
//       // If editor clears all, re-add them. Admin can clear all.
//       newAuthorIds = [user.id.toString()];
//     } else if (newAuthorIds.length === 0 && user && user.role === 'admin') {
//       // Admin can choose to have no authors selected initially via UI, 
//       // but form submit might add current admin if list is still empty then.
//       // This is handled in handleSubmit before API call.
//     }
//     setAuthorIds(newAuthorIds);
//   };


//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageUrl(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setImageUrl(null);
//       setImagePreview('');
//     }
//   };

//   const handleAttachmentsChange = (e) => {
//     console.log("--- handleAttachmentsChange triggered ---");
//     console.log("e.target.files before processing:", e.target.files);

//     if (e.target.files && e.target.files.length > 0) {
//       const newFilesArray = Array.from(e.target.files); // Convert FileList to Array
//       console.log("New files selected:", newFilesArray.map(f => f.name));

//       setAttachments(prevAttachments => {
//         const updated = [...prevAttachments, ...newFilesArray];
//         console.log("Attachments state AFTER update (appending):", updated.map(f => f.name));
//         return updated;
//       });
//     } else {
//       console.log("No files selected in this event, or e.target.files is empty.");
//     }
//     // Reset the file input's value so onChange fires even if the same file is selected again
//     e.target.value = null;
//   };

//   const removeAttachment = (fileNameToRemove) => { // Changed to remove by name for more robustness
//     console.log("Attempting to remove attachment by name:", fileNameToRemove);
//     setAttachments(prev => {
//       const updatedAttachments = prev.filter(file => file.name !== fileNameToRemove);
//       console.log("Attachments state AFTER removal:", updatedAttachments.map(f => f.name));
//       return updatedAttachments;
//     });
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccessMessage('');

//     // --- Prepare FormData for multipart/form-data request ---
//     const formData = new FormData();
//     formData.append('title', title);
//     formData.append('content', content); // Content from ReactQuill is HTML string
//     formData.append('category', category);

//     // Append authorIds (assuming backend expects an array of strings)
//     // If backend expects `authorIds[]=id1&authorIds[]=id2`, FormData handles this for array fields.
//     let finalAuthorIds = authorIds ? [...new Set(authorIds.map(id => id.toString()))] : []; // Start with unique IDs from UI state
//     if (user && !finalAuthorIds.includes(user.id.toString())) { // Ensure creator is there
//         finalAuthorIds.push(user.id.toString());
//     }
//     if (finalAuthorIds.length === 0) { // Should not happen if creator is auto-added
//         return setError("Article must have at least one author. Please select authors or ensure you are logged in.");
//     }
//     finalAuthorIds.forEach(id => formData.append('authorIds[]', id));


//     if (authorIds && authorIds.length > 0) {
//         authorIds.forEach(id => formData.append('authorIds[]', id));
//     } else if (user) { // Default to current user if no authors explicitly set
//         formData.append('authorIds[]', user.id);
//     }


//     if (newImageFile) { // Corrected from 'imageUrl' to 'newImageFile'
//       formData.append('imageUrl', newImageFile);
//     }

//     // Use 'newAttachmentFiles' state for attachments
//     if (newAttachmentFiles && newAttachmentFiles.length > 0) { // Corrected from 'attachments' to 'newAttachmentFiles'
//       console.log("Appending attachments to FormData:", newAttachmentFiles.map(f => f.name));
//       newAttachmentFiles.forEach((file) => {
//         formData.append('attachments', file);
//       });
//     }

//     console.log('--- Submitting FormData (Create Article) ---');
//     for (let [key, value] of formData.entries()) {
//       if (value instanceof File) {
//         console.log(`FormData Entry: ${key} -> File: ${value.name}`);
//       } else {
//         console.log(`FormData Entry: ${key} -> Value: ${value}`);
//       }
//     }
//     console.log('------------------------------------------');

//     try {
//       const response = await apiClient.post('/articles', formData); // Removed manual headers
//       setSuccessMessage('Article created successfully!');
      
//       // Clear form on success
//       setTitle('');
//       setContent('');
//       setCategory(articleCategories[0]);
//       setAuthorIds(user ? [user.id.toString()] : []); // Reset authors to current user
//       setNewImageFile(null);
//       setImagePreview('');
//       setNewAttachmentFiles([]);
      
//       setTimeout(() => {
//         navigate(`/article/${response.data.data._id}`);
//       }, 1500);
//     } catch (err) {
//       console.error('Error creating article:', err.response || err);
//       setError(err.response?.data?.error || 'Failed to create article. Please check your input.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
//       <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Create New Article</h1>

//       {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}
//       {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successMessage}</div>}

//       <form onSubmit={handleSubmit} encType="multipart/form-data">
//         {/* Title */}
//         <div className="mb-4">
//           <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
//           <input
//             type="text"
//             id="title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             required
//           />
//         </div>

//         {/* Category */}
//         <div className="mb-4">
//           <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
//           <select
//             id="category"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             required
//           >
//             {articleCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//           </select>
//         </div>

//         {/* Authors - Simple for now, using logged-in user.
//             For multiple authors, you'd need a multi-select component.
//             For this example, `authorIds` state defaults to logged-in user.
//             If you allow changing authors, you'd have a component here.
//         */}
//         <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Author(s)</label>
//             <p className="text-sm text-gray-600 bg-gray-50 p-2 border rounded-md">
//                 {user ? `${user.name} (You)` : 'No author assigned'}
//                 {authorIds.length > 1 ? ` and ${authorIds.length -1} other(s)` : ''}
//             </p>
//             {/* Placeholder for a multi-select user component */}
//             {/* <UserMultiSelect selectedUsers={authorIds} onChange={setAuthorIds} /> */}
//         </div>



//         <div className="mb-6">
//           <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
//           {/* Fallback or alternative: Simple Textarea*/}
//           <textarea
//             id="content"
//             rows="10"
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             required
//           />
//         </div>


//         {/* Image Upload */}
//         <div className="mb-6">
//           <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
//           <input
//             type="file"
//             id="imageUrl"
//             accept="image/png, image/jpeg, image/gif"
//             onChange={handleImageChange}
//             className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//           />
//           {imagePreview && (
//             <div className="mt-2">
//               <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded object-cover" />
//             </div>
//           )}
//         </div>

//         {/* Attachments Upload */}
//         <div className="mb-6">
//           <label htmlFor="attachments-input" className="block text-sm font-medium text-gray-700 mb-1">
//             Attachments (PDF, DOC, DOCX - Max 5)
//           </label>
//           <input
//             type="file"
//             id="attachments-input" // Changed ID to avoid potential conflicts if you had another id="attachments"
//             accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//             multiple // Allow multiple file selection
//             onChange={handleAttachmentsChange}
//             className="file-input-style"
//           />
//           {attachments.length > 0 && (
//             <div className="mt-3 space-y-2 border-t pt-3">
//               <p className="text-sm font-medium text-gray-700">Selected attachments:</p>
//               {attachments.map((file, index) => (
//                 <div key={index} className="text-xs text-gray-600 flex items-center justify-between bg-gray-100 p-2 rounded-md shadow-sm">
//                   <span className="truncate w-4/5" title={file.name}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
//                   <button
//                     type="button"
//                     onClick={() => removeAttachment(file.name)} // Remove by name
//                     className="text-red-500 hover:text-red-700 font-semibold ml-2 p-1 rounded-full hover:bg-red-100 transition-colors"
//                     aria-label={`Remove ${file.name}`}
//                   >
//                     × {/* Clearer remove icon */}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* --- Author Selection --- */}
//         <div className="mb-6">
//           <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-1">
//             Co-authors (Optional)
//           </label>
//           <AuthorMultiSelect
//             selectedAuthorIds={authorIds.filter(id => id !== user?.id)} // Don't show current user in the selectable list if they are auto-included
//             onChange={(selectedCoAuthorIds) => {
//                 // Combine selected co-authors with the current user (creator)
//                 const newSelectedList = [...new Set([...selectedCoAuthorIds, user?.id].filter(Boolean))];
//                 setAuthorIds(newSelectedList);
//             }}
//             currentUserId={user?.id}
//           />
//           <p className="text-xs text-gray-500 mt-1">
//             You ({user?.name || 'Current User'}) will be automatically added as an author. Select additional co-authors.
//           </p>
//         </div>
//         {/* --- End Author Selection --- */}

//         {/* Submit Button */}
//         <div className="mt-6">
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {loading ? 'Creating Article...' : 'Create Article'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default ArticleCreatePage;