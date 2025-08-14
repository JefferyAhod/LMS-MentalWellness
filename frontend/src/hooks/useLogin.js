import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const useLogin = () => {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', credentials);
      setUser(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;
