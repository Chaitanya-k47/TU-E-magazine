// src/pages/profile/EditProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Import icons

function EditProfilePage() {
  const { user, token, login: refreshUserAfterUpdate } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [successDetails, setSuccessDetails] = useState('');
  const [successPassword, setSuccessPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    } else if (token) { // Only fetch if token exists but user details might be missing
      const fetchUserDetails = async () => {
        try {
          const response = await apiClient.get('/auth/me');
          setName(response.data.data.name || '');
          setEmail(response.data.data.email || '');
        } catch (err) {
          console.error("Error fetching profile for edit page:", err);
          setErrorDetails('Could not load profile details.');
        }
      };
      fetchUserDetails();
    }
  }, [user, token]); // Depend on user and token

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setLoadingDetails(true);
    setErrorDetails('');
    setSuccessDetails('');
    try {
      await apiClient.put(`/users/${user.id}`, { name, email });
      setSuccessDetails('Profile details updated successfully!');
      // Consider a user refresh mechanism here for AuthContext if name/email changed
      // For example, if AuthContext had a refreshUser function:
      // if (typeof refreshUser === 'function') {
      //   await refreshUser();
      // }
    } catch (err) {
      setErrorDetails(err.response?.data?.error || 'Failed to update details.');
    } finally {
      setLoadingDetails(false);
    }
  };

    const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorPassword(''); // Clear previous password errors

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        setErrorPassword('All password fields are required.');
        return;
    }

    if (newPassword.length < 6) {
      setErrorPassword('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorPassword('New passwords do not match.');
      return;
    }

    // --- NEW CHECK: New password same as current ---
    if (newPassword === currentPassword) {
      setErrorPassword('Your new password cannot be the same as your current password.');
      return;
    }
    // --- END NEW CHECK ---

    setLoadingPassword(true);
    setSuccessPassword('');
    try {
      await apiClient.put('/auth/updatepassword', { currentPassword, newPassword, confirmNewPassword });
      setSuccessPassword('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setErrorPassword(err.response?.data?.error || 'Failed to update password. Check your current password.');
    } finally {
      setLoadingPassword(false);
    }
  };


  if (!user && !token) {
    navigate('/login');
    return <div className="text-center py-10">Redirecting to login...</div>;
  }
  if (!user && token) {
      return <div className="text-center py-10">Loading profile...</div>
  }

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-8">
      {/* Update Profile Details Form */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Edit Profile Details</h2>
        {errorDetails && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{errorDetails}</div>}
        {successDetails && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successDetails}</div>}
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 input-style" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 input-style" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-sm text-gray-500 bg-gray-100 p-3 border rounded-md capitalize">{user?.role}</p>
          </div>
          <button type="submit" disabled={loadingDetails} className={`w-full btn-primary ${loadingDetails ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {loadingDetails ? 'Updating Details...' : 'Update Details'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Change Password</h2>
        {errorPassword && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{errorPassword}</div>}
        {successPassword && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successPassword}</div>}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
            <div className="mt-1 relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-style pr-10"
                required // Make sure all are required
              />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}>
                {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="mt-1 relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-style pr-10"
                placeholder="Min. 6 characters"
                required // Make sure all are required
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}>
                {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="mt-1 relative">
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="input-style pr-10"
                required // Make sure all are required
              />
              <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" aria-label={showConfirmNewPassword ? 'Hide confirm new password' : 'Show confirm new password'}>
                {showConfirmNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loadingPassword} className={`w-full btn-primary ${loadingPassword ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {loadingPassword ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;