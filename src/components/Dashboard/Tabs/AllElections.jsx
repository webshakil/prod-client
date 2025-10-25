import React from 'react';

export default function AllElections() {
  const elections = [
    {
      id: 1,
      title: 'Feature Request',
      creator: 'John Doe',
      status: 'Active',
      votes: 370,
      participants: 156,
      endDate: '2 days',
    },
    {
      id: 2,
      title: 'Design Theme',
      creator: 'Jane Smith',
      status: 'Completed',
      votes: 568,
      participants: 234,
      endDate: 'Completed',
    },
    {
      id: 3,
      title: 'API Updates',
      creator: 'Admin',
      status: 'Active',
      votes: 289,
      participants: 123,
      endDate: '5 days',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Elections</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm">All</button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm">Active</button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm">Completed</button>
      </div>

      {/* Elections List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election) => (
          <div key={election.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold">{election.title}</h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  election.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {election.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">by {election.creator}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Votes</span>
                <span className="font-semibold">{election.votes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Participants</span>
                <span className="font-semibold">{election.participants}</span>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">
              {election.status === 'Active' ? 'Vote Now' : 'View Results'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}