//version 3:
// src/pages/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEdit3, FiFileText, FiUsers, FiSettings, FiPlusCircle, FiHome } from 'react-icons/fi'; // Added FiHome

function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center p-10">Loading user data or not authenticated...</div>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-4xl mx-auto my-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Welcome, <span className="text-blue-600">{user.name || user.id}</span>!
        </h1>
        {/* "Back to Homepage" button for all roles, moved to top right */}
        <Link 
          to="/" 
          className="mt-2 sm:mt-0 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          <FiHome className="mr-1.5 h-4 w-4" />
          Back to Homepage
        </Link>
      </div>
      <p className="text-md text-gray-600 mb-8">
        Your role: <span className="font-semibold capitalize px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm">{user.role}</span>
      </p>

      {/* Specific introductory message for Readers */}
      {user.role === 'reader' && (
        <p className="text-gray-600 mb-8 bg-blue-50 p-4 rounded-md border border-blue-200">
          Explore the latest news and articles from Tezpur University. You can manage your profile settings below.
        </p>
      )}
      
      {/* Message for Editors/Admins (Optional) */}
      {(user.role === 'editor' || user.role === 'admin') && (
        <p className="text-gray-600 mb-8 bg-green-50 p-4 rounded-md border border-green-200">
          Manage your content and site settings using the tools below.
        </p>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common for All Authenticated Users */}
        <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <FiSettings className="mr-2 text-blue-500" />
            Account Settings
          </h2>
          <Link
            to="/profile/edit"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium block"
          >
            Edit My Profile & Change Password
          </Link>
        </div>

        {/* For Editors & Admins: Content Management */}
        {(user.role === 'editor' || user.role === 'admin') && (
          <>
            <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                <FiFileText className="mr-2 text-green-500" />
                My Articles
              </h2>
              <Link
                to="/dashboard/my-articles"
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium block mb-2"
              >
                View & Manage My Articles
              </Link>
              <Link
                to="/articles/create"
                className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md text-sm transition duration-150"
              >
                <FiPlusCircle className="mr-1.5" /> Create New Article
              </Link>
            </div>
          </>
        )}

        {/* For Admins Only: Site Management */}
        {user.role === 'admin' && (
          <>
            <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                <FiEdit3 className="mr-2 text-purple-500" />
                Admin Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/admin/articles"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium block"
                  >
                    Manage All Articles (Approve/Reject)
                  </Link>
                  <Link
                    to="/admin/users"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium block"
                  >
                    Manage Users
                  </Link>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Removed the reader-specific section from here as the button is now at the top */}

    </div>
  );
}

export default DashboardPage;

//version 2:
// src/pages/DashboardPage.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { FiEdit3, FiFileText, FiUsers, FiSettings, FiPlusCircle } from 'react-icons/fi'; // Added FiSettings

// function DashboardPage() {
//   const { user } = useAuth();

//   if (!user) {
//     // Should be caught by ProtectedRoute, but as a fallback
//     return <div className="text-center p-10">Loading user data or not authenticated...</div>;
//   }

//   return (
//     <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-4xl mx-auto my-8">
//       <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
//         Welcome to Your Dashboard, <span className="text-blue-600">{user.name || user.id}</span>!
//       </h1>
//       <p className="text-md text-gray-600 mb-8">
//         Your role: <span className="font-semibold capitalize px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm">{user.role}</span>
//       </p>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Common for All Authenticated Users */}
//         <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
//           <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
//             <FiSettings className="mr-2 text-blue-500" />
//             Account Settings
//           </h2>
//           <Link
//             to="/profile/edit"
//             className="text-blue-600 hover:text-blue-800 hover:underline font-medium block"
//           >
//             Edit My Profile & Change Password
//           </Link>
//           {/* Add more general account settings links here if needed */}
//         </div>

//         {/* For Editors & Admins: Content Management */}
//         {(user.role === 'editor' || user.role === 'admin') && (
//           <>
//             <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
//               <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
//                 <FiFileText className="mr-2 text-green-500" />
//                 My Articles
//               </h2>
//               <Link
//                 to="/dashboard/my-articles"
//                 className="text-blue-600 hover:text-blue-800 hover:underline font-medium block mb-2"
//               >
//                 View & Manage My Articles
//               </Link>
//               <Link
//                 to="/articles/create"
//                 className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md text-sm transition duration-150"
//               >
//                 <FiPlusCircle className="mr-1.5" /> Create New Article
//               </Link>
//             </div>
//           </>
//         )}

//         {/* For Admins Only: Site Management */}
//         {user.role === 'admin' && (
//           <>
//             <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow md:col-span-2"> {/* Span 2 columns on medium screens for better layout */}
//               <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
//                 <FiEdit3 className="mr-2 text-purple-500" />
//                 Admin Tools
//               </h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <Link
//                     to="/admin/articles"
//                     className="text-blue-600 hover:text-blue-800 hover:underline font-medium block"
//                   >
//                     Manage All Articles (Approve/Reject)
//                   </Link>
//                   <Link
//                     to="/admin/users"
//                     className="text-blue-600 hover:text-blue-800 hover:underline font-medium block"
//                   >
//                     Manage Users
//                   </Link>
//                   {/* Add more admin links here, e.g., Category Management */}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
      
//       {/* General Info or Quick Links for Readers */}
//       {user.role === 'reader' && (
//         <div className="mt-8 pt-6 border-t border-gray-200">
//             <p className="text-gray-600">
//                 Explore the latest news and articles from Tezpur University. You can manage your profile settings above.
//             </p>
//             <Link to="/" className="mt-4 inline-block btn-primary">
//                 Back to Homepage
//             </Link>
//         </div>
//       )}

//     </div>
//   );
// }

// export default DashboardPage;

//version 1:
// // src/pages/DashboardPage.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { FiEdit3, FiFileText, FiUsers, FiSettings, FiPlusCircle } from 'react-icons/fi'; // Added FiSettings

// function DashboardPage() {
//   const { user } = useAuth();

//   if (!user) {
//     // Should be caught by ProtectedRoute, but as a fallback
//     return <div className="text-center p-10">Loading user data or not authenticated...</div>;
//   }

//   return (
//     <div className="bg-white p-6 rounded-lg shadow">
//       <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
//       <p className="text-gray-600 mb-2">
//         Welcome, <span className="font-semibold">{user?.name || user?.id}</span>!
//       </p>
//       <p className="text-gray-600 mb-6">
//         Your role: <span className="font-semibold capitalize">{user?.role}</span>
//       </p>

//  <div className="space-y-4">
//         {/* Links for Editors and Admins */}
//         {(user?.role === 'editor' || user?.role === 'admin') && (
//           <> {/* Use Fragment for multiple elements */}
//             <div>
//               <Link
//                 to="/articles/create"
//                 className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out inline-block mb-2" // Added inline-block & mb-2
//               >
//                 Create New Article
//               </Link>
//             </div>
//             {/* --- ADD "MY ARTICLES" LINK --- */}
//             <div>
//               <Link
//                 to="/dashboard/my-articles" // Link to the MyArticlesPage route
//                 className="text-blue-600 hover:text-blue-800 hover:underline"
//               >
//                 Manage My Articles
//               </Link>
//             </div>
//             {/* --- END "MY ARTICLES" LINK --- */}
//           </>
//         )}

//         {/* Links specifically for Admins */}
//         {user?.role === 'admin' && (
//           <>
//             <div className="mt-4 pt-4 border-t"> {/* Add some separation for admin links */}
//               <h3 className="text-lg font-semibold text-gray-700 mb-2">Admin Tools</h3>
//               <div>
//                 <Link
//                   to="/admin/articles"
//                   className="text-blue-600 hover:text-blue-800 hover:underline block mb-1" // block for full width feel
//                 >
//                   Manage All Articles
//                 </Link>
//               </div>
//               <div>
//                 <Link
//                   to="/admin/users"
//                   className="text-blue-600 hover:text-blue-800 hover:underline block"
//                 >
//                   Manage Users
//                 </Link>
//               </div>
//             </div>
//           </>
//         )}

//         {/* Common links for all dashboard users */}
//         <div className="mt-4 pt-4 border-t">
//           <Link
//             to="/profile/edit" 
//             className="text-gray-600 hover:text-gray-800 hover:underline"
//           >
//             Edit My Profile
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DashboardPage;