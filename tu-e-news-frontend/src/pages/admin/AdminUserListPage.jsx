// src/pages/admin/AdminUserListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/api';
import { FiEdit2, FiTrash2, FiUserPlus, FiCheck, FiX } from 'react-icons/fi'; // Icons
import { useAuth } from '../../context/AuthContext'; // To ensure current admin cannot delete self easily

// Reusable date formatter
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) { return 'Invalid Date'; }
};

const availableRoles = ['reader', 'editor', 'admin']; // From your User model schema

function AdminUserListPage() {
  const { user: currentAdmin } = useAuth(); // Get current logged-in admin info
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null); // User object being edited or null
  const [newRole, setNewRole] = useState('');

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/users'); // Backend endpoint for getting all users (admin protected)
      setUsers(response.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const handleEditRoleClick = (userToEdit) => {
    setEditingUser(userToEdit);
    setNewRole(userToEdit.role); // Pre-fill with current role
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewRole('');
  };

  const handleRoleChange = async (userId) => {
    if (!newRole || !editingUser || editingUser._id !== userId) return;

    // Prevent admin from demoting themselves if they are the only admin (more complex logic needed for that)
    // For now, basic check: cannot change own role via this simple UI if it's the current user
    if (currentAdmin && currentAdmin.id === userId && currentAdmin.role === 'admin' && newRole !== 'admin') {
        alert("Admins cannot demote their own role through this interface. Use another admin account or database tools for such changes.");
        return;
    }

    try {
      await apiClient.put(`/users/${userId}`, { role: newRole });
      setUsers(prevUsers =>
        prevUsers.map(u => (u._id === userId ? { ...u, role: newRole } : u))
      );
      alert(`User ${editingUser.name}'s role updated to ${newRole}.`);
      handleCancelEdit(); // Close editing UI
    } catch (err) {
      console.error("Error updating role:", err);
      alert('Failed to update role: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (currentAdmin && currentAdmin.id === userId) {
        alert("You cannot delete your own account through this interface.");
        return;
    }
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await apiClient.delete(`/users/${userId}`);
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
        alert(`User "${userName}" deleted successfully.`);
      } catch (err) {
        console.error("Error deleting user:", err);
        alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  if (loading) return <p className="text-gray-500 p-4">Loading users...</p>;
  if (error) return <div className="text-red-500 bg-red-100 p-4 rounded">{error}</div>;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-700">Manage Users</h1>
        {/* Optional: Add User Button (if admin can create users directly from here) */}
        {/* <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded text-sm flex items-center">
          <FiUserPlus className="mr-1" /> Add User
        </button> */}
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {editingUser && editingUser._id === u._id ? (
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs rounded-md"
                      >
                        {availableRoles.map(roleOption => (
                          <option key={roleOption} value={roleOption} className="capitalize">
                            {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize">{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                    {editingUser && editingUser._id === u._id ? (
                      <>
                        <button onClick={() => handleRoleChange(u._id)} className="text-green-600 hover:text-green-900" title="Save Role"><FiCheck /></button>
                        <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700" title="Cancel Edit"><FiX /></button>
                      </>
                    ) : (
                      <button onClick={() => handleEditRoleClick(u)} className="text-blue-600 hover:text-blue-900" title="Edit Role"><FiEdit2 /></button>
                    )}
                    {currentAdmin && currentAdmin.id !== u._id && ( // Admin cannot delete themselves
                         <button onClick={() => handleDeleteUser(u._id, u.name)} className="text-red-600 hover:text-red-900" title="Delete User"><FiTrash2 /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* TODO: Add Pagination if API supports it for users */}
    </div>
  );
}

export default AdminUserListPage;