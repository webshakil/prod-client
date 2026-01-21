// ExtendElection.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updateElection } from '../../../redux/api/election/electionApi';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaArrowLeft, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaUsers,
  FaHourglass,
  FaSpinner
} from 'react-icons/fa';

export default function ExtendElection({ election, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Current values
  const currentEndDate = election?.end_date 
    ? new Date(election.end_date).toISOString().split('T')[0] 
    : '';
  const currentEndTime = election?.end_time || '23:59';
  
  // New values
  const [newEndDate, setNewEndDate] = useState(currentEndDate);
  const [newEndTime, setNewEndTime] = useState(currentEndTime);
  
  // Calculate max extension (6 months)
  const maxExtensionDate = (() => {
    if (!currentEndDate) return null;
    const date = new Date(currentEndDate);
    date.setMonth(date.getMonth() + 6);
    return date.toISOString().split('T')[0];
  })();
  
  // Vote count
  const voteCount = (election?.total_vote_count || 0) || 
                    (election?.normal_vote_count || 0) + (election?.anonymous_vote_count || 0) ||
                    (election?.vote_count || 0);
  
  // Calculate extension days
  const extensionDays = (() => {
    if (!currentEndDate || !newEndDate) return 0;
    const current = new Date(`${currentEndDate}T${currentEndTime}`);
    const newDate = new Date(`${newEndDate}T${newEndTime}`);
    return Math.ceil((newDate - current) / (1000 * 60 * 60 * 24));
  })();

  // Validation
  useEffect(() => {
    setError('');
    if (!newEndDate || !newEndTime) return;
    
    const currentEnd = new Date(`${currentEndDate}T${currentEndTime}`);
    const newEnd = new Date(`${newEndDate}T${newEndTime}`);
    const maxEnd = new Date(`${maxExtensionDate}T23:59:59`);
    
    if (newEnd <= currentEnd) {
      setError('New end date/time must be after current end. You can only extend.');
    } else if (newEnd > maxEnd) {
      setError(`Maximum extension is 6 months (until ${formatDate(maxExtensionDate)})`);
    }
  }, [newEndDate, newEndTime, currentEndDate, currentEndTime, maxExtensionDate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleSubmit = async () => {
    if (error || extensionDays <= 0) {
      toast.error(error || 'Please select a valid extension date');
      return;
    }
    
    setLoading(true);
    try {
      const response = await updateElection(election.id, {
        end_date: newEndDate,
        end_time: newEndTime
      });
      
      if (response.success) {
        toast.success(`Election extended by ${extensionDays} day(s)!`);
        navigate('/dashboard/my-elections');
      } else {
        toast.error(response.message || 'Failed to extend election');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.message || 'Error extending election');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
    else navigate('/dashboard/my-elections');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-500 text-white p-4 rounded-full">
            <FaHourglass className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Extend Election
            </h1>
            <p className="text-gray-700 font-medium mb-2">{election?.title}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              <FaUsers />
              <span><strong>{voteCount}</strong> vote(s) cast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          <span>
            This election has votes and cannot be fully edited. 
            You can only <strong>extend</strong> the end date/time (up to 6 months).
          </span>
        </p>
      </div>

      {/* Current End Date */}
      <div className="bg-gray-100 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FaCalendarAlt className="text-gray-600" />
          Current End Date & Time
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500">Date</p>
            <p className="font-semibold">{formatDate(currentEndDate)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-gray-500">Time</p>
            <p className="font-semibold">{currentEndTime}</p>
          </div>
        </div>
      </div>

      {/* New End Date */}
      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
          <FaCheckCircle className="text-green-600" />
          New End Date & Time
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New End Date *
            </label>
            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              min={currentEndDate}
              max={maxExtensionDate}
              className={`w-full px-3 py-2 border-2 rounded-lg ${
                error ? 'border-red-400' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New End Time *
            </label>
            <input
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className={`w-full px-3 py-2 border-2 rounded-lg ${
                error ? 'border-red-400' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-600">
          Max extension: <strong>{formatDate(maxExtensionDate)}</strong>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-6">
          <p className="text-red-700 text-sm flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </p>
        </div>
      )}

      {/* Extension Summary */}
      {!error && extensionDays > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-purple-800">
            Extending by <span className="text-3xl font-bold text-purple-600">+{extensionDays}</span> day(s)
          </p>
          <p className="text-sm text-gray-600 mt-1">
            New end: {formatDate(newEndDate)} at {newEndTime}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleCancel}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center gap-2"
        >
          <FaArrowLeft /> Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !!error || extensionDays <= 0}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
            loading || error || extensionDays <= 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? (
            <><FaSpinner className="animate-spin" /> Extending...</>
          ) : (
            <><FaCheckCircle /> Extend Election</>
          )}
        </button>
      </div>
    </div>
  );
}