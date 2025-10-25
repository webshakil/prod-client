import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // ✅ USE THIS
import { useLogoutMutation } from '../../redux/api/auth/sessionApi';
import { logout } from '../../redux/slices/authSlice';
import { useAuth } from '../../redux/hooks';

export default function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ NO window.location
  const auth = useAuth();
  const [logoutMutation, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation({ userId: auth.userId, sessionId: auth.sessionId }).unwrap();

      // ✅ CLEAR EVERYTHING
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('sessionId');
      
      dispatch(logout()); // Clear Redux

      // ✅ USE navigate INSTEAD OF window.location
      navigate('/auth', { replace: true }); // ✅ NO window
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}