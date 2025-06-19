// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import ArticleCreatePage from './pages/ArticleCreatePage';
import ArticleEditPage from './pages/ArticleEditPage';
import MyArticlesPage from './pages/dashboard/MyArticlesPage';
import AdminArticleListPage from './pages/admin/AdminArticleListPage';
import AdminUserListPage from './pages/admin/AdminUserListPage';
import EditProfilePage from './pages/profile/EditProfilePage';
import CategoryPage from './pages/CategoryPage';
import SearchResultsPage from './pages/SearchResultsPage';

function App() {

  
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/article/:id" element={<ArticleDetailPage />} />

          <Route path="/category/:categoryName" element={<CategoryPage />} />

          <Route path="/search" element={<SearchResultsPage />} />
          
          {/* --- MODIFIED DASHBOARD ROUTE --- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute> {/* No specific roles, just needs authentication */}
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* --- END MODIFIED DASHBOARD ROUTE --- */}

          <Route
            path="/profile/edit" // This was already correctly set up
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/my-articles"
            element={<ProtectedRoute roles={['editor', 'admin']}><MyArticlesPage /></ProtectedRoute>}
          />
          <Route
            path="/articles/create"
            element={<ProtectedRoute roles={['editor', 'admin']}><ArticleCreatePage /></ProtectedRoute>}
          />
          <Route
            path="/article/:id/edit"
            element={<ProtectedRoute roles={['editor', 'admin']}><ArticleEditPage /></ProtectedRoute>}
          />

          <Route
            path="/admin/articles"
            element={<ProtectedRoute roles={['admin']}><AdminArticleListPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute roles={['admin']}><AdminUserListPage /></ProtectedRoute>}
          />
        </Routes>
      </Layout>
    </Router>
  );
}
export default App;