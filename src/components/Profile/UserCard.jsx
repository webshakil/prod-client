import React from 'react';

export default function UserCard({ user, profile }) {
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">No user data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="w-24 h-24 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
        {user?.user_firstname?.[0]}{user?.user_lastname?.[0]}
      </div>
      <h2 className="text-2xl font-bold">
        {user?.user_firstname} {user?.user_lastname}
      </h2>
      <p className="text-gray-600 mb-4">{user?.user_email}</p>
      <p className="text-sm text-gray-500 mb-4">{profile?.bio || 'No bio added'}</p>
      <div className="space-y-2 text-sm text-left">
        <p>
          <strong>Country:</strong> {profile?.country || 'Not specified'}
        </p>
        <p>
          <strong>City:</strong> {profile?.city || 'Not specified'}
        </p>
        <p>
          <strong>Timezone:</strong> {profile?.timezone || 'UTC'}
        </p>
        <p>
          <strong>Member Since:</strong> {new Date(user?.user_registered).toLocaleDateString()}
        </p>
        <pre>{JSON.stringify(user, null, 4)}</pre>
        <pre>{JSON.stringify(profile, null, 4)}</pre>
      </div>
    </div>
  );
}