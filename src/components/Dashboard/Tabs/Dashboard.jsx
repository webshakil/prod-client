import React from 'react';
import { useTranslation } from 'react-i18next';
import useUser from '../../../hooks/useUser';

export default function Dashboard() {
  const { t } = useTranslation();
  const { currentUser } = useUser();
  const roles = currentUser?.roles || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.title')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">{t('dashboard.stats.activeElections')}</p>
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-xs text-gray-500 mt-2">{t('dashboard.stats.addedToday', { count: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">{t('dashboard.stats.yourVotes')}</p>
          <p className="text-3xl font-bold text-green-600">24</p>
          <p className="text-xs text-gray-500 mt-2">{t('dashboard.stats.addedToday', { count: 5 })}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">{t('dashboard.stats.pendingVotes')}</p>
          <p className="text-3xl font-bold text-yellow-600">8</p>
          <p className="text-xs text-gray-500 mt-2">{t('dashboard.stats.needVerification')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">{t('dashboard.stats.yourRole')}</p>
          <p className="text-lg font-bold text-purple-600">{roles.join(', ')}</p>
          <p className="text-xs text-gray-500 mt-2">{t('dashboard.stats.permissions', { count: roles.length })}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{t('dashboard.recentActivity.title')}</h2>
        <div className="space-y-4">
          <div className="flex gap-4 pb-4 border-b">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">🗳️</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t('dashboard.recentActivity.voted', { election: 'Feature Request' })}</p>
              <p className="text-xs text-gray-500">{t('dashboard.recentActivity.timeAgo.hoursAgo', { count: 2 })}</p>
            </div>
          </div>
          <div className="flex gap-4 pb-4 border-b">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">📊</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t('dashboard.recentActivity.completed', { election: 'Design Theme' })}</p>
              <p className="text-xs text-gray-500">{t('dashboard.recentActivity.timeAgo.hoursAgo', { count: 5 })}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">👥</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t('dashboard.recentActivity.promoted', { role: 'Admin' })}</p>
              <p className="text-xs text-gray-500">{t('dashboard.recentActivity.timeAgo.dayAgo', { count: 1 })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// import React from 'react';
// import useUser from '../../../hooks/useUser';
// //import { useUser } from '../../../redux/hooks/useUser';

// export default function Dashboard() {
//   const { currentUser } = useUser();
//   const roles = currentUser?.roles || [];

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Dashboard </h1>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-600 text-sm">Active Elections</p>
//           <p className="text-3xl font-bold text-blue-600">12</p>
//           <p className="text-xs text-gray-500 mt-2">+2 today</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-600 text-sm">Your Votes</p>
//           <p className="text-3xl font-bold text-green-600">24</p>
//           <p className="text-xs text-gray-500 mt-2">+5 today</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-600 text-sm">Pending Votes</p>
//           <p className="text-3xl font-bold text-yellow-600">8</p>
//           <p className="text-xs text-gray-500 mt-2">Need verification</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-600 text-sm">Your Role</p>
//           <p className="text-lg font-bold text-purple-600">{roles.join(', ')}</p>
//           <p className="text-xs text-gray-500 mt-2">Permissions: {roles.length}</p>
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="bg-white p-6 rounded-lg shadow">
//         <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
//         <div className="space-y-4">
//           <div className="flex gap-4 pb-4 border-b">
//             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">🗳️</div>
//             <div className="flex-1">
//               <p className="font-semibold text-sm">You voted on "Feature Request"</p>
//               <p className="text-xs text-gray-500">2 hours ago</p>
//             </div>
//           </div>
//           <div className="flex gap-4 pb-4 border-b">
//             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">📊</div>
//             <div className="flex-1">
//               <p className="font-semibold text-sm">Election "Design Theme" completed</p>
//               <p className="text-xs text-gray-500">5 hours ago</p>
//             </div>
//           </div>
//           <div className="flex gap-4">
//             <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">👥</div>
//             <div className="flex-1">
//               <p className="font-semibold text-sm">You were promoted to Admin</p>
//               <p className="text-xs text-gray-500">1 day ago</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }