import React from 'react';

export default function VoteNow() {
  const elections = [
    {
      id: 1,
      title: 'Which feature should we implement next?',
      description: 'Help us decide the priority',
      options: ['Dark Mode', 'Mobile App', 'API Documentation'],
      votes: ['125', '89', '156'],
      deadline: '2 days',
      voted: false,
    },
    {
      id: 2,
      title: 'Best color for the new logo?',
      description: 'Vote for your favorite color',
      options: ['Blue', 'Green', 'Purple'],
      votes: ['234', '145', '189'],
      deadline: '5 days',
      voted: true,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Vote Now</h1>

      <div className="space-y-6">
        {elections.map((election) => (
          <div key={election.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{election.title}</h2>
                <p className="text-gray-600 text-sm">{election.description}</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {election.deadline}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {election.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    election.voted
                      ? 'border-gray-200 bg-gray-50 cursor-default'
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                  disabled={election.voted}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{option}</span>
                    <span className="text-sm text-gray-600">{election.votes[idx]} votes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(parseInt(election.votes[idx]) / 500) * 100}%` }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>

            {election.voted && (
              <div className="text-sm text-green-600 font-semibold">✓ You voted on this</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}