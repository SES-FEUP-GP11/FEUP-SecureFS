import type { User, ApiError } from '../types';

// --- API Simulation ---
// Replace this entire section with actual API calls in Phase 6

/**
 * Simulates logging in a user.
 * In a real app, this would make a POST request to /api/auth/login/.
 * @param username - The user's username.
 * @param password - The user's password.
 * @returns A Promise resolving with the User object on success, or rejecting with an ApiError.
 */
export const login = async (username?: string, password?: string): Promise<User> => {
  console.log(`Simulating login for user: ${username}`); // Log simulation

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful login for a specific user/pass combination
      if (username === 'testuser' && password === 'password123') {
        const mockUser: User = {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
        };
        console.log('Simulated login successful:', mockUser);
        resolve(mockUser);
      } else {
        // Simulate failed login
        const error: ApiError = {
          message: 'Invalid credentials',
          statusCode: 401,
        };
        console.error('Simulated login failed:', error);
        reject(error);
      }
    }, 1000); // Simulate network delay
  });
};

/**
 * Simulates logging out a user.
 * In a real app, this might make a POST request to /api/auth/logout/ or just clear local state/tokens.
 * @returns A Promise resolving on successful logout simulation.
 */
export const logout = async (): Promise<void> => {
  console.log('Simulating logout'); // Log simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Simulated logout successful');
      resolve();
    }, 500); // Simulate network delay
  });
};

/**
 * Simulates fetching the currently authenticated user's data.
 * In a real app, this would make a GET request to /api/auth/user/ or similar.
 * @returns A Promise resolving with the User object if authenticated, or rejecting if not.
 */
export const getCurrentUser = async (): Promise<User> => {
  console.log('Simulating getCurrentUser'); // Log simulation
  // For simulation, we need a way to know if the user *should* be logged in.
  // This will be properly handled by the AuthContext state later.
  // For now, let's simulate failure unless we explicitly set a logged-in state elsewhere.
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      const error: ApiError = {
        message: 'Not authenticated (simulation)',
        statusCode: 401,
      };
      console.warn('Simulated getCurrentUser failed (default simulation state)');
      reject(error);
      // To simulate success, you would resolve with a mockUser:
      // const mockUser: User = { id: 'user-123', username: 'testuser' };
      // resolve(mockUser);
    }, 300);
  });
};
