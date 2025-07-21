import { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const useUser = () => {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return { fetchUser, loading };
};

export default useUser;