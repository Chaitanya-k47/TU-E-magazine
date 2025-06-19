// src/pages/LoginPage.jsx
import React, { useState } from 'react'; // Removed useEffect for this method
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Removed useLocation for this method
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get auth state and logout function
  const { login, logout, isAuthenticated, user, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // const location = useLocation(); // Not strictly needed if not redirecting 'from'
  // const from = location.state?.from?.pathname || "/dashboard"; // Default to dashboard or home

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      // Determine the path to redirect to
      // 'from' is the path the user was trying to access before being sent to login
      // result.user might contain the user details from the login response
      // 'user' from useAuth() will also update shortly after.
      const loggedInUser = result.user || user; // Prioritize user from login result, fallback to context user
      const defaultRedirectPath = loggedInUser?.role === 'reader' ? '/' : '/dashboard';
      const fromPath = location.state?.from?.pathname || defaultRedirectPath;
      
      console.log(`Login successful. Redirecting to: ${fromPath}`);
      navigate(fromPath, { replace: true }); // Use the calculated 'fromPath'
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleLogoutAndShowForm = () => {
    logout();
    // No need to navigate here, the component will re-render and show the form
  };

  // Show loading while auth state is being determined
  if (authIsLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // If user is already authenticated, show message and options
  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Already Logged In</h2>
        <img
            src="/vite.svg" // Replace with your actual logo or a user icon
            alt="User avatar"
            className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-blue-500"
        />
        <p className="text-gray-700 mb-1">
            You are currently logged in as <span className="font-medium">{user.name || user.id}</span>.
        </p>
        <p className="text-gray-600 text-sm mb-6">
            Role: <span className="font-medium capitalize">{user.role}</span>
        </p>
        <div className="mt-6 space-y-3">
          <Link
            to={user.role === 'reader' ? '/' : '/dashboard'}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-150"
          >
            Go to {user.role === 'reader' ? 'Homepage' : 'Dashboard'}
          </Link>
          <button
            onClick={handleLogoutAndShowForm}
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-md transition duration-150"
          >
            Logout and Sign In with a Different Account
          </button>
        </div>
      </div>
    );
  }

  // If not authenticated, show the login form
  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to TU-e-News</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="input-style pr-3" // Using a common style, adjust as needed
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="input-style pr-10" // Using a common style
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
          <p className="text-center text-gray-500 text-xs mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
              Create one now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;