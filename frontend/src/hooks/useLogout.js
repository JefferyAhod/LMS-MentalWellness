import axios from '../api/authApi';
import useAuth from './useAuth';

const useLogout = () => {
  const { setUser } = useAuth();

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return { logout };
};

export default useLogout;
