import React from 'react';

export default function AuditTrail() {
  const auditLogs = [
    { id: 1, user: 'Admin', action: 'Created Election', target: 'Feature Request', timestamp: '2 hours ago', status: 'success' },
    { id: 2, user: 'jane@example.com', action: 'Voted', target: 'Design Theme', timestamp: '3 hours ago', status: 'success' },
    { id: 3, user: 'bob@example.com', action: 'Flagged Vote', target: 'API Updates', timestamp: '5 hours ago', status: 'warning' },
    { id: 4, user: 'Admin', action: 'Deleted User', target: 'spam_user@example.com', timestamp: '1 day ago', status: 'danger' },
    { id: 5, user: 'Admin', action: 'Promoted User', target: 'jane@example.com', timestamp: '2 days ago', status: 'success' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Audit Trail</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Target</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Timestamp</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold">{log.user}</td>
                  <td className="px-6 py-4 text-sm">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.target}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
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