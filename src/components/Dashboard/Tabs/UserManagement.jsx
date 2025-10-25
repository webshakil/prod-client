import React from 'react';

export default function UserManagement() {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', roles: ['Voter'], status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', roles: ['ContentCreator', 'Voter'], status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', roles: ['Moderator', 'Voter'], status: 'Active' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Roles</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold">{user.name}</td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <span key={role} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs">Edit</button>
                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}