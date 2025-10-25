import React from 'react';

export default function VerifyVotes() {
  const pendingVotes = [
    { id: 1, election: 'Feature Request', user: 'john@example.com', vote: 'Option A', timestamp: '10 mins ago', status: 'pending' },
    { id: 2, election: 'Design Theme', user: 'jane@example.com', vote: 'Option B', timestamp: '25 mins ago', status: 'pending' },
    { id: 3, election: 'API Updates', user: 'bob@example.com', vote: 'Option C', timestamp: '1 hour ago', status: 'flagged' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Verify Votes</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Election</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Vote</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingVotes.map((vote) => (
                <tr key={vote.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{vote.election}</td>
                  <td className="px-6 py-4 text-sm">{vote.user}</td>
                  <td className="px-6 py-4 text-sm">{vote.vote}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vote.timestamp}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      vote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">Approve</button>
                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Reject</button>
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