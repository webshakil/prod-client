import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdatePreferencesMutation } from '../../redux/api/user/userApi.js';
import { setSuccess, setError } from '../../redux/slices/authSlice.js';

export default function PreferencesForm({ userId, initialData }) {
  const dispatch = useDispatch();
  const [updatePreferences, { isLoading }] = useUpdatePreferencesMutation();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    theme: 'light',
  });

  useEffect(() => {
    if (initialData) {
      setPreferences({
        emailNotifications: initialData.email_notifications ?? true,
        smsNotifications: initialData.sms_notifications ?? true,
        pushNotifications: initialData.push_notifications ?? true,
        marketingEmails: initialData.marketing_emails ?? false,
        theme: initialData.theme || 'light',
      });
    }
  }, [initialData]);

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      dispatch(setError('User ID not found'));
      return;
    }
    try {
      await updatePreferences({ userId, ...preferences }).unwrap();
      dispatch(setSuccess('Preferences updated successfully'));
    } catch (err) {
      dispatch(setError(err?.data?.message || 'Failed to update preferences'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-medium">Email Notifications</label>
          <input
            type="checkbox"
            checked={!!preferences.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="font-medium">SMS Notifications</label>
          <input
            type="checkbox"
            checked={!!preferences.smsNotifications}
            onChange={() => handleToggle('smsNotifications')}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="font-medium">Push Notifications</label>
          <input
            type="checkbox"
            checked={!!preferences.pushNotifications}
            onChange={() => handleToggle('pushNotifications')}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="font-medium">Marketing Emails</label>
          <input
            type="checkbox"
            checked={!!preferences.marketingEmails}
            onChange={() => handleToggle('marketingEmails')}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
}

// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { useUpdatePreferencesMutation } from '../../redux/api/user/userApi.js';
// import { setSuccess, setError } from '../../redux/slices/authSlice.js';

// export default function PreferencesForm({ userId, initialData }) {
//   const dispatch = useDispatch();
//   const [updatePreferences, { isLoading }] = useUpdatePreferencesMutation();
//   const [preferences, setPreferences] = useState({
//     emailNotifications: true,
//     smsNotifications: true,
//     pushNotifications: true,
//     marketingEmails: false,
//     theme: 'light',
//   });

//   useEffect(() => {
//     if (initialData) {
//       setPreferences({
//         emailNotifications: initialData.email_notifications ?? true,
//         smsNotifications: initialData.sms_notifications ?? true,
//         pushNotifications: initialData.push_notifications ?? true,
//         theme: initialData.theme || 'light',
//       });
//     }
//   }, [initialData]);

//   const handleToggle = (key) => {
//     setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!userId) {
//       dispatch(setError('User ID not found'));
//       return;
//     }
//     try {
//       await updatePreferences({ userId, ...preferences }).unwrap();
//       dispatch(setSuccess('Preferences updated successfully'));
//     } catch (err) {
//       dispatch(setError(err?.data?.message || 'Failed to update preferences'));
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <label className="font-medium">Email Notifications</label>
//           <input
//             type="checkbox"
//             checked={preferences.emailNotifications}
//             onChange={() => handleToggle('emailNotifications')}
//             className="w-4 h-4 cursor-pointer"
//           />
//         </div>
//         <div className="flex items-center justify-between">
//           <label className="font-medium">SMS Notifications</label>
//           <input
//             type="checkbox"
//             checked={preferences.smsNotifications}
//             onChange={() => handleToggle('smsNotifications')}
//             className="w-4 h-4 cursor-pointer"
//           />
//         </div>
//         <div className="flex items-center justify-between">
//           <label className="font-medium">Push Notifications</label>
//           <input
//             type="checkbox"
//             checked={preferences.pushNotifications}
//             onChange={() => handleToggle('pushNotifications')}
//             className="w-4 h-4 cursor-pointer"
//           />
//         </div>
//         <div className="flex items-center justify-between">
//           <label className="font-medium">Marketing Emails</label>
//           <input
//             type="checkbox"
//             checked={preferences.marketingEmails}
//             onChange={() => handleToggle('marketingEmails')}
//             className="w-4 h-4 cursor-pointer"
//           />
//         </div>
//       </div>

//       <button
//         type="submit"
//         disabled={isLoading}
//         className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
//       >
//         {isLoading ? 'Saving...' : 'Save Preferences'}
//       </button>
//     </form>
//   );
// }