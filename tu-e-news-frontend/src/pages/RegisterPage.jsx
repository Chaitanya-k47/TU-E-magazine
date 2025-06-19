// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Removed useLocation for this method
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('reader');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get auth state and logout function
  const { register, logout, isAuthenticated, user, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation(); // Not strictly needed
  // const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setLoading(true);
    const result = await register(name, email, password, role);
    setLoading(false);
    if (result.success) {
        const fromPath = location.state?.from?.pathname || "/dashboard"; // Default to /dashboard
        navigate(fromPath, { replace: true });
    if (location.state?.from?.pathname) {
        redirectTo = location.state.from.pathname;
    } else {
        // If no 'from' state, decide based on role.
        // The 'user' object from useAuth() might not be updated yet in this exact render cycle.
        // It's better if your login/register functions in AuthContext return the user info
        // or if you wait for the context user to update.
        // For now, let's assume the result from login/register has user info:
        const loggedInUser = result.user || user; // Prefer result.user if available, else context's user

        if (loggedInUser?.role === 'editor' || loggedInUser?.role === 'admin') {
            redirectTo = '/dashboard';
        } else if (loggedInUser?.role === 'reader') {
            redirectTo = '/';
        }
        // If role is somehow undefined, it defaults to '/'
    }
    navigate(redirectTo, { replace: true });
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleLogoutAndShowForm = () => {
    logout();
  };

  if (authIsLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

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
            Logout and Register a New Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your TU-e-News Account</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
            <input className="input-style" id="name" type="text" placeholder="Your Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email Address</label>
            <input className="input-style" id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <input className="input-style pr-10" id="password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input className="input-style pr-10" id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-type password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">Register As</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="input-style">
              <option value="reader">Reader</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit" disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
          <p className="text-center text-gray-500 text-xs mt-6">
            Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;