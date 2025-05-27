import React, { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Component rendering the login form fields and handling submission.
 */
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState(""); // CHANGED: from username to email
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/files";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      console.log("LoginForm: Submitting login with email:", email);
      // CHANGED: Pass email instead of username
      await login(email, password); // This now expects email as the first argument
      console.log("LoginForm: Login successful, navigating to:", from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("LoginForm: Login submission failed", err);
      // Error is displayed by AuthContext's error state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Login Failed: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      )}

      {/* Email Input */}
      <div>
        <label
          htmlFor="email" // CHANGED: htmlFor to "email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <input
          id="email" // CHANGED: id to "email"
          name="email" // CHANGED: name to "email"
          type="email" // CHANGED: type to "email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          placeholder="your.email@example.com" // CHANGED: placeholder
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
          disabled={isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          placeholder="password123"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
