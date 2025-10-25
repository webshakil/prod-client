import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetCompleteUserDataMutation } from '../redux/api/user/userApi.js';
import { setCurrentUser, setProfile, setPreferences } from '../redux/slices/userSlice.js';
import { useAuth } from '../redux/hooks.js';
//import { useAuth } from '../redux/hooks/index.js';

export const useUserData = () => {
  const dispatch = useDispatch();
  const auth = useAuth();
  const [fetchCompleteUserData, { isLoading, error, data }] = useGetCompleteUserDataMutation();

  useEffect(() => {
    if (auth.userId) {
      console.log('📤 Fetching complete user data for userId:', auth.userId);
      fetchCompleteUserData(auth.userId);
    }
  }, [auth.userId, fetchCompleteUserData]);

  useEffect(() => {
    if (data?.data) {
      console.log('✅ User data loaded:', data.data);
      dispatch(setCurrentUser(data.data.user));
      dispatch(setProfile(data.data.profile));
      dispatch(setPreferences(data.data.preferences));
    }
  }, [data, dispatch]);

  return {
    userData: data?.data,
    isLoading,
    error,
  };
};

export default useUserData;