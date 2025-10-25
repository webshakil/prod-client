import { useSelector } from 'react-redux';

export const useUser = () => {
  const user = useSelector((state) => state.user);
  const auth = useSelector((state) => state.auth);

  return {
    userId: auth.userId,
    currentUser: {
      user_id: auth.userId,
      user_email: auth.email,
      user_phone: auth.phone,
      user_firstname: auth.firstName,
      user_lastname: auth.lastName,
      user_name: auth.username,
      roles: auth.roles, // ← ADD THIS LINE
      profilePicture: auth.profilePicture,
      isAdmin: auth.isAdmin,
      isModerator: auth.isModerator,
      isContentCreator: auth.isContentCreator,
      isSubscribed: auth.isSubscribed,
      ...user.currentUser, // merge with any other user state
    },
    profile: user.profile,
    preferences: user.preferences,
    loading: user.loading,
    error: user.error,
  };
};

export default useUser;
// import { useSelector } from 'react-redux';

// export const useUser = () => {
//   const user = useSelector((state) => state.user);
//   const auth = useSelector((state) => state.auth);

//   return {
//     userId: auth.userId,
//     currentUser: user.currentUser,
//     profile: user.profile,
//     preferences: user.preferences,
//     loading: user.loading,
//     error: user.error,
//   };
// };

// export default useUser;