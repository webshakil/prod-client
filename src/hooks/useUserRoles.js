import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../redux/hooks';
import { useGetUserRolesQuery, useGetUserPermissionsQuery } from '../redux/api/role/roleApi';
import { setUserRoles, setUserPermissions } from '../redux/slices/roleSlice';

export const useUserRoles = () => {
  const dispatch = useDispatch();
  const auth = useAuth();
  
  // Fetch user roles
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useGetUserRolesQuery(auth.userId, {
    skip: !auth.userId,
  });
  
  // Fetch user permissions
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useGetUserPermissionsQuery(auth.userId, {
    skip: !auth.userId,
  });
  
  // Update Redux store when data changes
  useEffect(() => {
    if (rolesData?.data) {
      dispatch(setUserRoles(rolesData.data));
    }
  }, [rolesData, dispatch]);
  
  useEffect(() => {
    if (permissionsData?.data) {
      dispatch(setUserPermissions(permissionsData.data));
    }
  }, [permissionsData, dispatch]);
  
  return {
    roles: rolesData?.data || [],
    permissions: permissionsData?.data || [],
    isLoading: rolesLoading || permissionsLoading,
    error: rolesError || permissionsError,
  };
};