import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEdit, FaTrash, FaShare } from 'react-icons/fa';
import { getElection, deleteElection } from '../../../redux/api/election/electionApi';

export default function ElectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchElection();
  }, [id]);
  
  const fetchElection = async () => {
    try {
      setLoading(true);
      const response = await getElection(id);
      
      if (response.success) {
        setElection(response.data);
      }
    } catch (error) {
      console.error('Fetch election error:', error);
      toast.error('Failed to load election');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this election?')) {
      return;
    }
    
    try {
      const response = await deleteElection(id);
      if (response.success) {
        toast.success('Election deleted successfully');
        navigate('/dashboard/all-elections');
      }
      /*eslint-disable*/
    } catch (error) {
      toast.error('Failed to delete election');
    }
  };
  
  const handleShare = () => {
    const url = `${window.location.origin}/vote/${election.slug || election.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Election link copied to clipboard!');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!election) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Election Not Found</h2>
        <button
          onClick={() => navigate('/dashboard/all-elections')}
          className="text-blue-600 hover:underline"
        >
          Go back to elections
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/all-elections')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <FaArrowLeft />
          Back to All Elections
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.title}</h1>
            <p className="text-gray-600">{election.description}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaShare />
              Share
            </button>
            <button
              onClick={() => navigate(`/dashboard/election/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaEdit />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <FaTrash />
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {/* Details */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Status */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
          <span className={`px-4 py-2 rounded-full font-semibold ${
            election.status === 'active' ? 'bg-green-100 text-green-800' :
            election.status === 'published' ? 'bg-blue-100 text-blue-800' :
            election.status === 'completed' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {election.status}
          </span>
        </div>
        
        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Start Date</h3>
            <p className="text-gray-700">{new Date(election.start_date).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">End Date</h3>
            <p className="text-gray-700">{new Date(election.end_date).toLocaleString()}</p>
          </div>
        </div>
        
        {/* Configuration */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Configuration</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Voting Type:</span>
              <span className="ml-2 font-semibold">{election.voting_type}</span>
            </div>
            <div>
              <span className="text-gray-600">Permission:</span>
              <span className="ml-2 font-semibold">{election.permission_type}</span>
            </div>
            <div>
              <span className="text-gray-600">Pricing:</span>
              <span className="ml-2 font-semibold">{election.is_free ? 'Free' : 'Paid'}</span>
            </div>
          </div>
        </div>
        
        {/* Questions */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Questions ({election.questions?.length || 0})</h3>
          <div className="space-y-3">
            {election.questions?.map((question, index) => (
              <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {index + 1}. {question.question_text}
                </h4>
                {question.options && (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {question.options.map((option) => (
                      <li key={option.id}>{option.option_text}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Voting Link */}
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Voting Link</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={`${window.location.origin}/vote/${election.slug || election.id}`}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded"
            />
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}