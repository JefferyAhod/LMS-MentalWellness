import { useState } from 'react';
import axios from '../api/authApi';
import useAuth from './useAuth';

const useRegister = () => {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', userData);
      setUser(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};

export default useRegister;
