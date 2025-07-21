import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, registerUser } from "../api/auth"; 
import API from "../api/axios"; 

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
        localStorage.removeItem('token'); // Clear token if check fails
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const userData = await loginUser(credentials);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      setUser(null);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const newUser = await registerUser(userData);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      setUser(null);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      setError(null);
    }
  };

  const contextValue = {
    user,
    setUser,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};