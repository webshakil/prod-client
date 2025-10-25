import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  useGetProfileMutation,
  useUpdateProfileMutation,
  useGetPreferencesMutation,
  /*eslint-disable*/
  useUpdatePreferencesMutation,
} from '../../redux/api/user/userApi.js';
import { setSuccess, setError } from '../../redux/slices/authSlice.js';
import ProfileForm from './ProfileForm.jsx';
import PreferencesForm from './PreferencesForm.jsx';
import UserCard from './UserCard.jsx';
import Loading from '../Common/Loading.jsx';
import ErrorAlert from '../Common/ErrorAlert.jsx';
import useUser from '../../hooks/useUser.js';
import { useNavigate } from 'react-router-dom'; // ✅ For navigation

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ initialize navigation
  const { userId, currentUser, profile, preferences, loading, error } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [getProfile] = useGetProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [getPreferences] = useGetPreferencesMutation();

  useEffect(() => {
    if (userId) {
      console.log('📤 Loading profile and preferences for userId:', userId);
      getProfile(userId);
      getPreferences(userId);
    }
  }, [userId, getProfile, getPreferences]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorAlert message={error?.message || 'Error loading profile'} />;
  }

  const handleProfileUpdate = async (profileData) => {
    try {
      await updateProfile({ userId, ...profileData }).unwrap();
      dispatch(setSuccess('Profile updated successfully'));
    } catch (err) {
      dispatch(setError(err?.data?.message || 'Failed to update profile'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>

        {/* ✅ Back to Dashboard Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1">
          <UserCard user={currentUser} profile={profile} />
        </div>

        {/* Profile Forms */}
        <div className="md:col-span-2">
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'preferences'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Preferences
            </button>
          </div>

          {activeTab === 'profile' && (
            <ProfileForm
              userId={userId}
              initialData={profile}
              isLoading={isUpdating}
              onSubmit={handleProfileUpdate}
            />
          )}

          {activeTab === 'preferences' && (
            <PreferencesForm userId={userId} initialData={preferences} />
          )}
        </div>
      </div>
    </div>
  );
}




// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// //import { useUser } from '../../redux/hooks/useUser.js';
// import {
//   useGetProfileMutation,
//   useUpdateProfileMutation,
//   useGetPreferencesMutation,
//   /*eslint-disable*/
//   useUpdatePreferencesMutation,
// } from '../../redux/api/user/userApi.js';
// import { setSuccess, setError } from '../../redux/slices/authSlice.js';
// import ProfileForm from './ProfileForm.jsx';
// import PreferencesForm from './PreferencesForm.jsx';
// import UserCard from './UserCard.jsx';
// import Loading from '../Common/Loading.jsx';
// import ErrorAlert from '../Common/ErrorAlert.jsx';
// import useUser from '../../hooks/useUser.js';

// export default function ProfilePage() {
//   const dispatch = useDispatch();
//   const { userId, currentUser, profile, preferences, loading, error } = useUser();
//   const [activeTab, setActiveTab] = useState('profile');
//   const [getProfile] = useGetProfileMutation();
//   const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
//   const [getPreferences] = useGetPreferencesMutation();

//   useEffect(() => {
//     if (userId) {
//       console.log('📤 Loading profile and preferences for userId:', userId);
//       getProfile(userId);
//       getPreferences(userId);
//     }
//   }, [userId, getProfile, getPreferences]);

//   if (loading) {
//     return <Loading />;
//   }

//   if (error) {
//     return <ErrorAlert message={error?.message || 'Error loading profile'} />;
//   }

//   const handleProfileUpdate = async (profileData) => {
//     try {
//       await updateProfile({ userId, ...profileData }).unwrap();
//       dispatch(setSuccess('Profile updated successfully'));
//     } catch (err) {
//       dispatch(setError(err?.data?.message || 'Failed to update profile'));
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg">
//       <h1 className="text-3xl font-bold mb-6">My Profile</h1>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* User Card */}
//         <div className="md:col-span-1">
//           <UserCard user={currentUser} profile={profile} />
//         </div>

//         {/* Profile Forms */}
//         <div className="md:col-span-2">
//           <div className="flex gap-4 mb-6 border-b">
//             <button
//               onClick={() => setActiveTab('profile')}
//               className={`px-4 py-2 font-semibold ${
//                 activeTab === 'profile'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-600'
//               }`}
//             >
//               Profile
//             </button>
//             <button
//               onClick={() => setActiveTab('preferences')}
//               className={`px-4 py-2 font-semibold ${
//                 activeTab === 'preferences'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-600'
//               }`}
//             >
//               Preferences
//             </button>
//           </div>

//           {activeTab === 'profile' && (
//             <ProfileForm
//               userId={userId}
//               initialData={profile}
//               isLoading={isUpdating}
//               onSubmit={handleProfileUpdate}
//             />
//           )}

//           {activeTab === 'preferences' && (
//             <PreferencesForm userId={userId} initialData={preferences} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }