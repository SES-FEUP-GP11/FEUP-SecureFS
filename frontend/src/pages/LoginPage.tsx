// src/pages/LoginPage.tsx
import React from 'react';
import LoginForm from '../components/Auth/LoginForm'; // Import the LoginForm

/**
 * Renders the login page, including the LoginForm component.
 */
const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md"> {/* Improved styling */}
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800"> {/* Improved styling */}
          Sign in to FEUP SecureFS
        </h1>
        {/* Render the Login Form */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;