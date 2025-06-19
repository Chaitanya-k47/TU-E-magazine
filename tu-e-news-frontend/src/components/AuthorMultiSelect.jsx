// src/components/AuthorMultiSelect.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // Main import
import apiClient from '../utils/api'; // Your API client
import { useAuth } from '../context/AuthContext';

// react-select expects options in the format: { value: 'someId', label: 'Some Name' }
const transformUsersToOptions = (users = [], currentUserIdToExclude = null) => {
  return users
    // .filter(user => user._id !== currentUserIdToExclude) // Optionally filter out current user here
    .map(user => ({
      value: user._id,
      label: `${user.name} (${user.email || user.role})` // Added role as fallback if email is missing
    }));
};

function AuthorMultiSelect({ selectedAuthorIds = [], onChange, currentUserId }) {
  const [authorOptions, setAuthorOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: loggedInUser } = useAuth(); // Get the full logged-in user object

useEffect(() => {
    const fetchAuthors = async () => {
      setIsLoading(true);
      setError('');
      try {
        // --- CALL NEW ENDPOINT ---
        const response = await apiClient.get('/users/authors'); // Use the new endpoint
        const users = response.data.data || [];

        // Filter out the currently logged-in user from the list of options
        // as they are usually implicitly an author or handled separately.
        // Admins might still want to see themselves if they are also authors.
        // For simplicity, we will filter out the current logged-in user from the dropdown options.
        // The parent component (Create/Edit page) is responsible for ensuring the current user is added
        // to the final list of authorIds if they are the creator/editor.
        const filteredUsers = users.filter(u => u._id !== currentUserId);

        setAuthorOptions(transformUsersToOptions(filteredUsers));

      } catch (err) {
        console.error("Error fetching potential authors:", err);
        setError(err.response?.data?.error || 'Could not load author list.');
        setAuthorOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'editor')) {
        fetchAuthors();
    } else {
        // If current user is not admin/editor, they shouldn't be seeing this component to select others.
        // Or, if they could see it but not fetch, handle appropriately.
        setIsLoading(false);
        // setError('You do not have permission to select authors.'); // Or just show no options
    }
  }, [currentUserId, loggedInUser]); // Re-fetch if currentUserId changes (though unlikely here) or loggedInUser role changes

  const handleChange = (selectedOptions) => {
    const newSelectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    onChange(newSelectedIds);
  };

  const valueForSelect = authorOptions.filter(option => selectedAuthorIds.includes(option.value));

  if (error && !isLoading) { // Only show error if not loading
    return <p className="text-red-500 text-xs italic mt-1">{error}</p>;
  }
  
  return (
    <Select
      instanceId="author-multi-select" // Important for SSR or multiple instances
      isMulti
      name="authors"
      options={authorOptions}
      className="basic-multi-select" // For overall container styling
      classNamePrefix="select" // For styling internal parts (e.g., select__control, select__option)
      isLoading={isLoading}
      value={valueForSelect}
      onChange={handleChange}
      placeholder="Select co-authors..."
      noOptionsMessage={() => isLoading ? "Loading authors..." : "No other authors found"}
      styles={{ // Optional: Basic custom styling to make it fit Tailwind better
        control: (baseStyles, state) => ({
          ...baseStyles,
          borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', // Tailwind blue-500 and gray-300
          boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : baseStyles.boxShadow,
          '&:hover': {
            borderColor: state.isFocused ? '#3b82f6' : '#9ca3af', // gray-400
          },
          borderRadius: '0.375rem', // rounded-md
          padding: '0.1rem',
        }),
        multiValue: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: '#e0e7ff', // indigo-100
          borderRadius: '0.25rem', // rounded-sm
        }),
        multiValueLabel: (baseStyles) => ({
          ...baseStyles,
          color: '#3730a3', // indigo-800
        }),
        multiValueRemove: (baseStyles) => ({
          ...baseStyles,
          color: '#4338ca', // indigo-700
          ':hover': {
            backgroundColor: '#c7d2fe', // indigo-200
            color: '#312e81', // indigo-900
          },
        }),
      }}
    />
  );
}

export default AuthorMultiSelect;