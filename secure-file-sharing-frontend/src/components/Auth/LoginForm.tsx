// src/components/Auth/LoginForm.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Use the custom hook

/**
 * Component rendering the login form fields and handling submission.
 */
const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth(); // Get login function and state from context
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login
  // If redirected *to* login, 'from' will contain the original path
  const from = location.state?.from?.pathname || '/files'; // Default to /files

  /**
   * Handles the form submission event.
   * Prevents default form submission, calls the login function from AuthContext,
   * and navigates to the intended page on success or displays errors.
   * @param event - The form submission event.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default browser form submission

    // Clear previous errors if any (optional, error state in context handles this)
    // setError(null); // Error state is managed by AuthContext

    try {
      console.log('LoginForm: Submitting login...');
      await login(username, password); // Call the login function from context
      console.log('LoginForm: Login successful, navigating to:', from);
      navigate(from, { replace: true }); // Redirect to the original destination or default
    } catch (err) {
      // Error is already set in AuthContext, no need to set local error state
      // The error message will be displayed via the 'error' variable from useAuth()
      console.error('LoginForm: Login submission failed', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display Login Error Message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Login Failed: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      )}

      {/* Username Input */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading} // Disable input while loading
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          placeholder="testuser" // Placeholder for testing
        />
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading} // Disable input while loading
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          placeholder="password123" // Placeholder for testing
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading} // Disable button while loading
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;