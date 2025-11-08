// ✅ FIXED VERSION - Step1BasicInfo.jsx
// KEY CHANGES:
// 1. Changed from required_watch_duration_minutes to video_watch_required, minimum_watch_time, minimum_watch_percentage
// 2. Added checkbox to enable/disable video watch requirements
// 3. Separate inputs for seconds and percentage
// 4. Updated validation and save functions

import { useState, useEffect } from 'react';
/*eslint-disable*/
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { checkEligibility } from '../../../../../redux/api/election/electionApi';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaImage, 
  FaVideo, 
  FaPalette,
  FaInfoCircle,
  FaCheckCircle,
  FaYoutube,
  FaVimeoV,
  FaUpload,
  FaLink,
  FaPlay,
  FaHourglass
} from 'react-icons/fa';
import { createDraft } from '../../../../../redux/api/election/electionApi';

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper function to extract Vimeo video ID
const getVimeoVideoId = (url) => {
  if (!url) return null;
  const regExp = /vimeo.com\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// Helper function to calculate duration in days
const calculateDurationInDays = (startDate, startTime, endDate, endTime) => {
  if (!startDate || !startTime || !endDate || !endTime) return null;
  
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export default function Step1BasicInfo({ data, updateData, onNext, creatorType, setElectionId }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [videoMode, setVideoMode] = useState('url'); // 'url' or 'upload'
  const [previewImage, setPreviewImage] = useState(data.topic_image ? URL.createObjectURL(data.topic_image) : null);
  const [previewLogo, setPreviewLogo] = useState(data.logo ? URL.createObjectURL(data.logo) : null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [durationDays, setDurationDays] = useState(null);

  // Calculate duration whenever dates/times change
  useEffect(() => {
    const days = calculateDurationInDays(
      data.start_date, 
      data.start_time, 
      data.end_date, 
      data.end_time
    );
    setDurationDays(days);
  }, [data.start_date, data.start_time, data.end_date, data.end_time]);

  // Add after line 47 (after the duration calculation useEffect)

// ✅ ADD THIS: Instant date validation
useEffect(() => {
  if (data.start_date && data.start_time) {
    const startDateTime = new Date(`${data.start_date}T${data.start_time}`);
    const now = new Date();
    
    if (startDateTime < now) {
      setErrors(prev => ({ ...prev, start_date: 'Start date/time must be in the future' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.start_date;
        return newErrors;
      });
    }
  }
  
  if (data.start_date && data.end_date && data.start_time && data.end_time) {
    const startDateTime = new Date(`${data.start_date}T${data.start_time}`);
    const endDateTime = new Date(`${data.end_date}T${data.end_time}`);
    
    if (endDateTime <= startDateTime) {
      setErrors(prev => ({ ...prev, end_date: 'End date/time must be after start date/time' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.end_date;
        return newErrors;
      });
    }
  }
}, [data.start_date, data.start_time, data.end_date, data.end_time]);

  // Get video IDs for preview
  const youtubeVideoId = getYouTubeVideoId(data.topic_video_url);
  const vimeoVideoId = getVimeoVideoId(data.topic_video_url);

  const validateStep = () => {
    const newErrors = {};

    if (!data.title?.trim()) {
      newErrors.title = 'Election title is required';
    } else if (data.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (data.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    if (!data.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (data.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!data.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!data.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!data.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (!data.end_time) {
      newErrors.end_time = 'End time is required';
    }

    if (data.start_date && data.end_date) {
      const startDateTime = new Date(`${data.start_date}T${data.start_time}`);
      const endDateTime = new Date(`${data.end_date}T${data.end_time}`);
      const now = new Date();

      if (startDateTime < now) {
        newErrors.start_date = 'Start date/time must be in the future';
      }

      if (endDateTime <= startDateTime) {
        newErrors.end_date = 'End date/time must be after start date/time';
      }
    }

    // ✅ FIXED: Validate video watch requirements if enabled
    if (data.video_watch_required) {
      if (data.minimum_watch_time === 0 && data.minimum_watch_percentage === 0) {
        newErrors.video_watch_required = 'Please set either minimum watch time or percentage';
      }
      if (data.minimum_watch_time < 0) {
        newErrors.video_watch_required = 'Watch time cannot be negative';
      }
      if (data.minimum_watch_percentage < 0 || data.minimum_watch_percentage > 100) {
        newErrors.video_watch_required = 'Percentage must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (type === 'topic_image') {
      updateData({ topic_image: file });
      setPreviewImage(URL.createObjectURL(file));
    } else if (type === 'logo') {
      updateData({ logo: file });
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size must be less than 100MB');
      return;
    }

    updateData({ 
      topic_video: file, 
      topic_video_url: '', 
      video_watch_required: false,
      minimum_watch_time: 0,
      minimum_watch_percentage: 0
    });
    toast.success('Video file selected successfully');
  };

  const handleSaveAndContinue = async () => {
    if (!validateStep()) {
      toast.error('Please fix all errors before continuing');
      return;
    }

    setLoading(true);

    try {
      // ✅ FIXED: Create draft with correct backend field names
      const draftData = {
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        start_time: data.start_time,
        end_date: data.end_date,
        end_time: data.end_time,
        topic_video_url: videoMode === 'url' ? data.topic_video_url : '',
        
        // ✅ FIXED: Correct backend field names
        video_watch_required: data.video_watch_required || false,
        minimum_watch_time: data.minimum_watch_time || 0,
        minimum_watch_percentage: data.minimum_watch_percentage || 0,
        
        creator_type: creatorType,
        status: 'draft'
      };

      const response = await createDraft(draftData);
      
      if (response.success) {
        const draftId = response.data.draft_id || response.data.id;
        setElectionId(draftId);
        
        toast.success('Basic information saved!');
        onNext();
      } else {
        toast.error(response.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(error.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          Basic Election Information
        </h2>
        <p className="text-gray-600">
          Let's start by setting up the fundamental details of your election
        </p>
      </div>

      {/* Election Title */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          Election Title *
          <span className="text-sm font-normal text-gray-500 ml-2">
            (10-200 characters)
          </span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="e.g., 2025 Student Council President Election"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          maxLength={200}
        />
        <div className="flex justify-between items-center mt-2">
          {errors.title && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <FaInfoCircle /> {errors.title}
            </p>
          )}
          <p className="text-gray-500 text-sm ml-auto">
            {data.title?.length || 0} / 200 characters
          </p>
        </div>
      </div>

      {/* Election Description */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          Election Description *
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Minimum 50 characters)
          </span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Provide a detailed description of your election, including its purpose, eligibility criteria, and any important information voters should know..."
          rows={6}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          maxLength={2000}
        />
        <div className="flex justify-between items-center mt-2">
          {errors.description && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <FaInfoCircle /> {errors.description}
            </p>
          )}
          <p className="text-gray-500 text-sm ml-auto">
            {data.description?.length || 0} / 2000 characters
          </p>
        </div>
      </div>

      {/* Media Upload Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Topic Image */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaImage className="text-blue-600" />
            Election Cover Image
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Upload a cover image for your election (Max 5MB)
          </p>
          
          {previewImage && (
            <div className="mb-4 relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={() => {
                  updateData({ topic_image: null });
                  setPreviewImage(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FaUpload className="text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-semibold">
                Click to upload image
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'topic_image')}
            />
          </label>
        </div>

        {/* Logo Upload */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaPalette className="text-purple-600" />
            Branding Logo
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Upload your logo for branding (Max 5MB)
          </p>
          
          {previewLogo && (
            <div className="mb-4 relative">
              <img
                src={previewLogo}
                alt="Logo Preview"
                className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
              />
              <button
                onClick={() => {
                  updateData({ logo: null });
                  setPreviewLogo(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FaUpload className="text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-semibold">
                Click to upload logo
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'logo')}
            />
          </label>
        </div>
      </div>

      {/* Video Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FaVideo className="text-red-600" />
          Election Video (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Add a video to explain your election to voters
        </p>

        {/* Video Mode Toggle */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setVideoMode('url')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              videoMode === 'url'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaLink className="inline mr-2" />
            Video URL (YouTube/Vimeo)
          </button>
          <button
            onClick={() => setVideoMode('upload')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              videoMode === 'upload'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaUpload className="inline mr-2" />
            Upload Video File
          </button>
        </div>

        {videoMode === 'url' ? (
          <div>
            <div className="flex gap-2 mb-3">
              <FaYoutube className="text-red-600 text-2xl" />
              <FaVimeoV className="text-blue-500 text-2xl" />
              <span className="text-sm text-gray-600 flex-1">
                Paste your YouTube or Vimeo video URL
              </span>
            </div>
            <input
              type="url"
              value={data.topic_video_url}
              onChange={(e) => updateData({ topic_video_url: e.target.value, topic_video: null })}
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* ✅ FIXED: VIDEO WATCH REQUIREMENTS - NEW IMPLEMENTATION */}
            {data.topic_video_url && (youtubeVideoId || vimeoVideoId) && (
              <div className="mt-4 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                {/* Checkbox to Enable/Disable */}
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.video_watch_required || false}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      updateData({ 
                        video_watch_required: isChecked,
                        minimum_watch_time: isChecked ? (data.minimum_watch_time || 30) : 0,
                        minimum_watch_percentage: isChecked ? (data.minimum_watch_percentage || 50) : 0
                      });
                    }}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <FaClock className="text-orange-600" />
                      Require Minimum Watch Time
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      Force voters to watch at least a portion of the video before voting
                    </p>
                  </div>
                </label>
                
                {/* Show inputs only when checked */}
                {data.video_watch_required && (
                  <div className="ml-8 space-y-4 bg-white rounded-lg p-4 border-2 border-orange-300">
                    {/* Minimum Watch Time in Seconds */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ⏱️ Minimum Watch Time (seconds) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="3600"
                        value={data.minimum_watch_time || 0}
                        onChange={(e) => {
                          const seconds = parseInt(e.target.value) || 0;
                          updateData({ minimum_watch_time: seconds });
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., 30 (voters must watch 30 seconds)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Voters must watch at least this many seconds of the video
                      </p>
                    </div>
                    
                    {/* Minimum Watch Percentage */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📊 OR Minimum Watch Percentage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={data.minimum_watch_percentage || 0}
                        onChange={(e) => {
                          const percentage = parseFloat(e.target.value) || 0;
                          updateData({ minimum_watch_percentage: percentage });
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., 75 (voters must watch 75% of video)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Voters must watch at least this percentage of the video length
                      </p>
                    </div>
                    
                    {/* Display Current Settings Summary */}
                    {(data.minimum_watch_time > 0 || data.minimum_watch_percentage > 0) && (
                      <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                        <p className="text-sm font-bold text-green-800 mb-2">✅ Requirement Summary:</p>
                        <div className="space-y-1">
                          {data.minimum_watch_time > 0 && (
                            <p className="text-xs text-gray-700">
                              • Voters must watch at least <span className="font-bold text-orange-600">{data.minimum_watch_time} seconds</span>
                            </p>
                          )}
                          {data.minimum_watch_percentage > 0 && (
                            <p className="text-xs text-gray-700">
                              • OR watch at least <span className="font-bold text-orange-600">{data.minimum_watch_percentage}%</span> of the video
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2 italic">
                            * Whichever requirement is met first will allow the voter to proceed
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Validation Error */}
                    {errors.video_watch_required && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <FaInfoCircle /> {errors.video_watch_required}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Info when not checked */}
                {!data.video_watch_required && (
                  <div className="ml-8 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-xs text-yellow-700 flex items-center gap-2">
                      <FaInfoCircle />
                      Video watch time is optional - voters can vote without watching the video
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* YouTube Video Preview */}
            {/* {youtubeVideoId && (
              <div className="mt-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-3">
                  <FaCheckCircle className="text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    YouTube video detected
                  </span>
                </div>
                
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                  {!videoPlaying ? (
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => setVideoPlaying(true)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                        <div className="bg-red-600 rounded-full p-5 group-hover:scale-110 transition-transform">
                          <FaPlay className="text-white text-3xl ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <p className="text-white font-semibold">Click to play video</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </div>
            )} */}
           

{youtubeVideoId && (
  <div className="mt-4">
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-3">
      <FaCheckCircle className="text-green-600" />
      <span className="text-sm text-green-700 font-medium">
        YouTube video detected
      </span>
    </div>
    
    <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>
)}

            {/* Vimeo Video Preview */}
            {vimeoVideoId && (
              <div className="mt-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-3">
                  <FaCheckCircle className="text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Vimeo video detected
                  </span>
                </div>
                
                <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://player.vimeo.com/video/${vimeoVideoId}`}
                    title="Vimeo video player"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Show message if URL is entered but not recognized */}
            {data.topic_video_url && !youtubeVideoId && !vimeoVideoId && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <FaInfoCircle className="text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Please enter a valid YouTube or Vimeo URL
                </span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="flex flex-col items-center justify-center">
                <FaVideo className="text-4xl text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 font-semibold mb-1">
                  Click to upload video file
                </p>
                <p className="text-xs text-gray-500">MP4, MOV, AVI (MAX 100MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="video/*"
                onChange={handleVideoUpload}
              />
            </label>
            {data.topic_video && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Video file: {data.topic_video.name}
                  </span>
                </div>
                <button
                  onClick={() => updateData({ 
                    topic_video: null, 
                    video_watch_required: false,
                    minimum_watch_time: 0,
                    minimum_watch_percentage: 0
                  })}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="bg-green-600 text-white p-3 rounded-lg">
            <FaCalendarAlt className="text-xl" />
          </div>
          <span>Election Schedule</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Start Date & Time */}
          <div className="bg-white rounded-xl shadow-md p-5 border-2 border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <FaCalendarAlt className="text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-800">Start Date & Time</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Start Date *
                </label>
                <input
                  type="date"
                  value={data.start_date}
                  onChange={(e) => updateData({ start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                    errors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FaInfoCircle /> {errors.start_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🕐 Start Time *
                </label>
                <input
                  type="time"
                  value={data.start_time}
                  onChange={(e) => updateData({ start_time: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                    errors.start_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_time && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FaInfoCircle /> {errors.start_time}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* End Date & Time */}
          <div className="bg-white rounded-xl shadow-md p-5 border-2 border-red-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <FaCalendarAlt className="text-red-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-800">End Date & Time</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 End Date *
                </label>
                <input
                  type="date"
                  value={data.end_date}
                  onChange={(e) => updateData({ end_date: e.target.value })}
                  min={data.start_date || new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FaInfoCircle /> {errors.end_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🕐 End Time *
                </label>
                <input
                  type="time"
                  value={data.end_time}
                  onChange={(e) => updateData({ end_time: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.end_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_time && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FaInfoCircle /> {errors.end_time}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Duration Display */}
        {data.start_date && data.start_time && data.end_date && data.end_time && durationDays !== null && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-purple-600 text-white p-3 rounded-lg">
                <FaHourglass className="text-2xl" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Election Duration</h4>
                
                {/* Days Count */}
                <div className="bg-white rounded-lg p-4 mb-3 border-2 border-purple-300 shadow-sm">
                  <div className="flex items-center justify-center gap-3">
                    <FaClock className="text-purple-600 text-3xl" />
                    <div className="text-center">
                      <p className="text-4xl font-bold text-purple-600">
                        {durationDays}
                      </p>
                      <p className="text-sm font-semibold text-gray-600">
                        {durationDays === 1 ? 'Day' : 'Days'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date/Time Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-700">▶ Start:</span>
                    <span className="text-gray-700">
                      {new Date(`${data.start_date}T${data.start_time}`).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-700">■ End:</span>
                    <span className="text-gray-700">
                      {new Date(`${data.end_date}T${data.end_time}`).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAndContinue}
          disabled={loading}
          className={`px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <FaCheckCircle />
              Save & Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
}
// // ✅ KEY CHANGES:
// // 1. Removed Timezone field completely
// // 2. Added Required Watch Duration (hours + minutes) for video URLs
// // 3. Stores as required_watch_duration_minutes in Redux

// import { useState, useEffect } from 'react';
// /*eslint-disable*/
// import { useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
// import { checkEligibility } from '../../../../../redux/api/election/electionApi';
// import { 
//   FaCalendarAlt, 
//   FaClock, 
//   FaImage, 
//   FaVideo, 
//   FaPalette,
//   FaInfoCircle,
//   FaCheckCircle,
//   FaYoutube,
//   FaVimeoV,
//   FaUpload,
//   FaLink,
//   FaPlay,
//   FaHourglass
// } from 'react-icons/fa';
// import { createDraft } from '../../../../../redux/api/election/electionApi';

// // Helper function to extract YouTube video ID
// const getYouTubeVideoId = (url) => {
//   if (!url) return null;
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return (match && match[2].length === 11) ? match[2] : null;
// };

// // Helper function to extract Vimeo video ID
// const getVimeoVideoId = (url) => {
//   if (!url) return null;
//   const regExp = /vimeo.com\/(\d+)/;
//   const match = url.match(regExp);
//   return match ? match[1] : null;
// };

// // Helper function to calculate duration in days
// const calculateDurationInDays = (startDate, startTime, endDate, endTime) => {
//   if (!startDate || !startTime || !endDate || !endTime) return null;
  
//   const start = new Date(`${startDate}T${startTime}`);
//   const end = new Date(`${endDate}T${endTime}`);
  
//   const diffTime = Math.abs(end - start);
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
//   return diffDays;
// };

// export default function Step1BasicInfo({ data, updateData, onNext, creatorType, setElectionId }) {
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [videoMode, setVideoMode] = useState('url'); // 'url' or 'upload'
//   const [previewImage, setPreviewImage] = useState(data.topic_image ? URL.createObjectURL(data.topic_image) : null);
//   const [previewLogo, setPreviewLogo] = useState(data.logo ? URL.createObjectURL(data.logo) : null);
//   const [videoPlaying, setVideoPlaying] = useState(false);
//   const [durationDays, setDurationDays] = useState(null);

//   // Calculate duration whenever dates/times change
//   useEffect(() => {
//     const days = calculateDurationInDays(
//       data.start_date, 
//       data.start_time, 
//       data.end_date, 
//       data.end_time
//     );
//     setDurationDays(days);
//   }, [data.start_date, data.start_time, data.end_date, data.end_time]);

//   // Get video IDs for preview
//   const youtubeVideoId = getYouTubeVideoId(data.topic_video_url);
//   const vimeoVideoId = getVimeoVideoId(data.topic_video_url);

//   const validateStep = () => {
//     const newErrors = {};

//     if (!data.title?.trim()) {
//       newErrors.title = 'Election title is required';
//     } else if (data.title.length < 10) {
//       newErrors.title = 'Title must be at least 10 characters';
//     } else if (data.title.length > 200) {
//       newErrors.title = 'Title must not exceed 200 characters';
//     }

//     if (!data.description?.trim()) {
//       newErrors.description = 'Description is required';
//     } else if (data.description.length < 50) {
//       newErrors.description = 'Description must be at least 50 characters';
//     }

//     if (!data.start_date) {
//       newErrors.start_date = 'Start date is required';
//     }

//     if (!data.start_time) {
//       newErrors.start_time = 'Start time is required';
//     }

//     if (!data.end_date) {
//       newErrors.end_date = 'End date is required';
//     }

//     if (!data.end_time) {
//       newErrors.end_time = 'End time is required';
//     }

//     if (data.start_date && data.end_date) {
//       const startDateTime = new Date(`${data.start_date}T${data.start_time}`);
//       const endDateTime = new Date(`${data.end_date}T${data.end_time}`);
//       const now = new Date();

//       if (startDateTime < now) {
//         newErrors.start_date = 'Start date/time must be in the future';
//       }

//       if (endDateTime <= startDateTime) {
//         newErrors.end_date = 'End date/time must be after start date/time';
//       }
//     }

//     // ✅ Validate required watch duration if video URL exists
//     if (data.topic_video_url && (youtubeVideoId || vimeoVideoId)) {
//       if (!data.required_watch_duration_minutes || data.required_watch_duration_minutes < 0) {
//         newErrors.required_watch_duration = 'Please set required watch duration (can be 0 for no minimum)';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleImageChange = (e, type) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       toast.error('Please select an image file');
//       return;
//     }

//     // Validate file size (5MB limit)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error('Image size must be less than 5MB');
//       return;
//     }

//     if (type === 'topic_image') {
//       updateData({ topic_image: file });
//       setPreviewImage(URL.createObjectURL(file));
//     } else if (type === 'logo') {
//       updateData({ logo: file });
//       setPreviewLogo(URL.createObjectURL(file));
//     }
//   };

//   const handleVideoUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('video/')) {
//       toast.error('Please select a video file');
//       return;
//     }

//     // Validate file size (100MB limit)
//     if (file.size > 100 * 1024 * 1024) {
//       toast.error('Video size must be less than 100MB');
//       return;
//     }

//     updateData({ topic_video: file, topic_video_url: '', required_watch_duration_minutes: 0 });
//     toast.success('Video file selected successfully');
//   };

//   const handleSaveAndContinue = async () => {
//     if (!validateStep()) {
//       toast.error('Please fix all errors before continuing');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Create draft with basic info
//       const draftData = {
//         title: data.title,
//         description: data.description,
//         start_date: data.start_date,
//         start_time: data.start_time,
//         end_date: data.end_date,
//         end_time: data.end_time,
//         topic_video_url: videoMode === 'url' ? data.topic_video_url : '',
//         required_watch_duration_minutes: data.required_watch_duration_minutes || 0, // ✅ Include this
//         creator_type: creatorType,
//         status: 'draft'
//       };

//       const response = await createDraft(draftData);
      
//       if (response.success) {
//         const draftId = response.data.draft_id || response.data.id;
//         setElectionId(draftId);
        
//         toast.success('Basic information saved!');
//         onNext();
//       } else {
//         toast.error(response.message || 'Failed to save draft');
//       }
//     } catch (error) {
//       console.error('Error saving draft:', error);
//       toast.error(error.response?.data?.message || 'Failed to save. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
//         <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//           <span className="text-3xl">📋</span>
//           Basic Election Information
//         </h2>
//         <p className="text-gray-600">
//           Let's start by setting up the fundamental details of your election
//         </p>
//       </div>

//       {/* Election Title */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <label className="block text-lg font-semibold text-gray-800 mb-3">
//           Election Title *
//           <span className="text-sm font-normal text-gray-500 ml-2">
//             (10-200 characters)
//           </span>
//         </label>
//         <input
//           type="text"
//           value={data.title}
//           onChange={(e) => updateData({ title: e.target.value })}
//           placeholder="e.g., 2025 Student Council President Election"
//           className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
//             errors.title ? 'border-red-500' : 'border-gray-300'
//           }`}
//           maxLength={200}
//         />
//         <div className="flex justify-between items-center mt-2">
//           {errors.title && (
//             <p className="text-red-500 text-sm flex items-center gap-1">
//               <FaInfoCircle /> {errors.title}
//             </p>
//           )}
//           <p className="text-gray-500 text-sm ml-auto">
//             {data.title?.length || 0} / 200 characters
//           </p>
//         </div>
//       </div>

//       {/* Election Description */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <label className="block text-lg font-semibold text-gray-800 mb-3">
//           Election Description *
//           <span className="text-sm font-normal text-gray-500 ml-2">
//             (Minimum 50 characters)
//           </span>
//         </label>
//         <textarea
//           value={data.description}
//           onChange={(e) => updateData({ description: e.target.value })}
//           placeholder="Provide a detailed description of your election, including its purpose, eligibility criteria, and any important information voters should know..."
//           rows={6}
//           className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
//             errors.description ? 'border-red-500' : 'border-gray-300'
//           }`}
//           maxLength={2000}
//         />
//         <div className="flex justify-between items-center mt-2">
//           {errors.description && (
//             <p className="text-red-500 text-sm flex items-center gap-1">
//               <FaInfoCircle /> {errors.description}
//             </p>
//           )}
//           <p className="text-gray-500 text-sm ml-auto">
//             {data.description?.length || 0} / 2000 characters
//           </p>
//         </div>
//       </div>

//       {/* Media Upload Section */}
//       <div className="grid md:grid-cols-2 gap-6">
//         {/* Topic Image */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
//             <FaImage className="text-blue-600" />
//             Election Cover Image
//           </label>
//           <p className="text-sm text-gray-600 mb-4">
//             Upload a cover image for your election (Max 5MB)
//           </p>
          
//           {previewImage && (
//             <div className="mb-4 relative">
//               <img
//                 src={previewImage}
//                 alt="Preview"
//                 className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
//               />
//               <button
//                 onClick={() => {
//                   updateData({ topic_image: null });
//                   setPreviewImage(null);
//                 }}
//                 className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
//               >
//                 ✕
//               </button>
//             </div>
//           )}

//           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
//             <div className="flex flex-col items-center justify-center pt-5 pb-6">
//               <FaUpload className="text-3xl text-gray-400 mb-2" />
//               <p className="text-sm text-gray-600 font-semibold">
//                 Click to upload image
//               </p>
//               <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX 5MB)</p>
//             </div>
//             <input
//               type="file"
//               className="hidden"
//               accept="image/*"
//               onChange={(e) => handleImageChange(e, 'topic_image')}
//             />
//           </label>
//         </div>

//         {/* Logo Upload */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
//             <FaPalette className="text-purple-600" />
//             Branding Logo
//           </label>
//           <p className="text-sm text-gray-600 mb-4">
//             Upload your logo for branding (Max 5MB)
//           </p>
          
//           {previewLogo && (
//             <div className="mb-4 relative">
//               <img
//                 src={previewLogo}
//                 alt="Logo Preview"
//                 className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
//               />
//               <button
//                 onClick={() => {
//                   updateData({ logo: null });
//                   setPreviewLogo(null);
//                 }}
//                 className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
//               >
//                 ✕
//               </button>
//             </div>
//           )}

//           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
//             <div className="flex flex-col items-center justify-center pt-5 pb-6">
//               <FaUpload className="text-3xl text-gray-400 mb-2" />
//               <p className="text-sm text-gray-600 font-semibold">
//                 Click to upload logo
//               </p>
//               <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX 5MB)</p>
//             </div>
//             <input
//               type="file"
//               className="hidden"
//               accept="image/*"
//               onChange={(e) => handleImageChange(e, 'logo')}
//             />
//           </label>
//         </div>
//       </div>

//       {/* Video Section */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
//           <FaVideo className="text-red-600" />
//           Election Video (Optional)
//         </label>
//         <p className="text-sm text-gray-600 mb-4">
//           Add a video to explain your election to voters
//         </p>

//         {/* Video Mode Toggle */}
//         <div className="flex gap-3 mb-4">
//           <button
//             onClick={() => setVideoMode('url')}
//             className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
//               videoMode === 'url'
//                 ? 'bg-blue-600 text-white shadow-md'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             <FaLink className="inline mr-2" />
//             Video URL (YouTube/Vimeo)
//           </button>
//           <button
//             onClick={() => setVideoMode('upload')}
//             className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
//               videoMode === 'upload'
//                 ? 'bg-blue-600 text-white shadow-md'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             <FaUpload className="inline mr-2" />
//             Upload Video File
//           </button>
//         </div>

//         {videoMode === 'url' ? (
//           <div>
//             <div className="flex gap-2 mb-3">
//               <FaYoutube className="text-red-600 text-2xl" />
//               <FaVimeoV className="text-blue-500 text-2xl" />
//               <span className="text-sm text-gray-600 flex-1">
//                 Paste your YouTube or Vimeo video URL *
//               </span>
//             </div>
//             <input
//               type="url"
//               value={data.topic_video_url}
//               onChange={(e) => updateData({ topic_video_url: e.target.value, topic_video: null })}
//               placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
//               className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
            
//             {/* ✅ REQUIRED WATCH DURATION - SHOWN ONLY IF VIDEO URL IS VALID */}
//             {data.topic_video_url && (youtubeVideoId || vimeoVideoId) && (
//               <div className="mt-4 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
//                 <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
//                   <FaClock className="text-orange-600" />
//                   Required Watch Duration * (How much must voters watch?)
//                 </label>
//                 <p className="text-xs text-gray-600 mb-3">
//                   Voters must watch at least this amount of the video to participate in voting
//                 </p>
                
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1">
//                       Hours
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="23"
//                       value={Math.floor((data.required_watch_duration_minutes || 0) / 60)}
//                       onChange={(e) => {
//                         const hours = parseInt(e.target.value) || 0;
//                         const currentMinutes = (data.required_watch_duration_minutes || 0) % 60;
//                         updateData({ required_watch_duration_minutes: (hours * 60) + currentMinutes });
//                       }}
//                       className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                       placeholder="0"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1">
//                       Minutes
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="59"
//                       value={(data.required_watch_duration_minutes || 0) % 60}
//                       onChange={(e) => {
//                         const minutes = parseInt(e.target.value) || 0;
//                         const currentHours = Math.floor((data.required_watch_duration_minutes || 0) / 60);
//                         updateData({ required_watch_duration_minutes: (currentHours * 60) + minutes });
//                       }}
//                       className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                       placeholder="0"
//                     />
//                   </div>
//                 </div>
                
//                 {/* Display Total */}
//                 {data.required_watch_duration_minutes > 0 && (
//                   <div className="mt-3 bg-white rounded-lg p-3 border border-orange-200">
//                     <p className="text-sm font-bold text-gray-800">
//                       ✅ Voters must watch: <span className="text-orange-600">
//                         {Math.floor((data.required_watch_duration_minutes || 0) / 60)}h {(data.required_watch_duration_minutes || 0) % 60}m
//                       </span>
//                     </p>
//                   </div>
//                 )}
                
//                 {data.required_watch_duration_minutes === 0 && (
//                   <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
//                     <p className="text-xs text-yellow-700 flex items-center gap-1">
//                       <FaInfoCircle />
//                       Setting to 0 means no minimum watch time required
//                     </p>
//                   </div>
//                 )}
                
//                 {errors.required_watch_duration && (
//                   <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
//                     <FaInfoCircle /> {errors.required_watch_duration}
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* YouTube Video Preview */}
//             {youtubeVideoId && (
//               <div className="mt-4">
//                 <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-3">
//                   <FaCheckCircle className="text-green-600" />
//                   <span className="text-sm text-green-700 font-medium">
//                     YouTube video detected
//                   </span>
//                 </div>
                
//                 <div className="relative rounded-lg overflow-hidden shadow-lg">
//                   {!videoPlaying ? (
//                     <div 
//                       className="relative cursor-pointer group"
//                       onClick={() => setVideoPlaying(true)}
//                     >
//                       <img
//                         src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
//                         alt="Video thumbnail"
//                         className="w-full h-64 object-cover"
//                       />
//                       <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
//                         <div className="bg-red-600 rounded-full p-5 group-hover:scale-110 transition-transform">
//                           <FaPlay className="text-white text-3xl ml-1" />
//                         </div>
//                       </div>
//                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
//                         <p className="text-white font-semibold">Click to play video</p>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="relative" style={{ paddingBottom: '56.25%' }}>
//                       <iframe
//                         className="absolute top-0 left-0 w-full h-full"
//                         src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
//                         title="YouTube video player"
//                         frameBorder="0"
//                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                         allowFullScreen
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Vimeo Video Preview */}
//             {vimeoVideoId && (
//               <div className="mt-4">
//                 <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-3">
//                   <FaCheckCircle className="text-green-600" />
//                   <span className="text-sm text-green-700 font-medium">
//                     Vimeo video detected
//                   </span>
//                 </div>
                
//                 <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
//                   <iframe
//                     className="absolute top-0 left-0 w-full h-full"
//                     src={`https://player.vimeo.com/video/${vimeoVideoId}`}
//                     title="Vimeo video player"
//                     frameBorder="0"
//                     allow="autoplay; fullscreen; picture-in-picture"
//                     allowFullScreen
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Show message if URL is entered but not recognized */}
//             {data.topic_video_url && !youtubeVideoId && !vimeoVideoId && (
//               <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
//                 <FaInfoCircle className="text-yellow-600" />
//                 <span className="text-sm text-yellow-700">
//                   Please enter a valid YouTube or Vimeo URL
//                 </span>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div>
//             <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
//               <div className="flex flex-col items-center justify-center">
//                 <FaVideo className="text-4xl text-gray-400 mb-3" />
//                 <p className="text-sm text-gray-600 font-semibold mb-1">
//                   Click to upload video file
//                 </p>
//                 <p className="text-xs text-gray-500">MP4, MOV, AVI (MAX 100MB)</p>
//               </div>
//               <input
//                 type="file"
//                 className="hidden"
//                 accept="video/*"
//                 onChange={handleVideoUpload}
//               />
//             </label>
//             {data.topic_video && (
//               <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <FaCheckCircle className="text-green-600" />
//                   <span className="text-sm text-green-700 font-medium">
//                     Video file: {data.topic_video.name}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => updateData({ topic_video: null, required_watch_duration_minutes: 0 })}
//                   className="text-red-600 hover:text-red-700 font-semibold text-sm"
//                 >
//                   Remove
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Schedule Section - ✅ REMOVED TIMEZONE */}
//       <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
//         <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//           <div className="bg-green-600 text-white p-3 rounded-lg">
//             <FaCalendarAlt className="text-xl" />
//           </div>
//           <span>Election Schedule</span>
//         </h3>

//         <div className="grid md:grid-cols-2 gap-6">
//           {/* Start Date & Time */}
//           <div className="bg-white rounded-xl shadow-md p-5 border-2 border-green-100">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="bg-green-100 p-2 rounded-lg">
//                 <FaCalendarAlt className="text-green-600" />
//               </div>
//               <h4 className="text-lg font-bold text-gray-800">Start Date & Time</h4>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   📅 Start Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={data.start_date}
//                   onChange={(e) => updateData({ start_date: e.target.value })}
//                   min={new Date().toISOString().split('T')[0]}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
//                     errors.start_date ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.start_date && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.start_date}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   🕐 Start Time *
//                 </label>
//                 <input
//                   type="time"
//                   value={data.start_time}
//                   onChange={(e) => updateData({ start_time: e.target.value })}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
//                     errors.start_time ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.start_time && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.start_time}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* End Date & Time */}
//           <div className="bg-white rounded-xl shadow-md p-5 border-2 border-red-100">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="bg-red-100 p-2 rounded-lg">
//                 <FaCalendarAlt className="text-red-600" />
//               </div>
//               <h4 className="text-lg font-bold text-gray-800">End Date & Time</h4>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   📅 End Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={data.end_date}
//                   onChange={(e) => updateData({ end_date: e.target.value })}
//                   min={data.start_date || new Date().toISOString().split('T')[0]}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
//                     errors.end_date ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.end_date && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.end_date}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   🕐 End Time *
//                 </label>
//                 <input
//                   type="time"
//                   value={data.end_time}
//                   onChange={(e) => updateData({ end_time: e.target.value })}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
//                     errors.end_time ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.end_time && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.end_time}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Duration Display */}
//         {data.start_date && data.start_time && data.end_date && data.end_time && durationDays !== null && (
//           <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-md">
//             <div className="flex items-start gap-4">
//               <div className="bg-purple-600 text-white p-3 rounded-lg">
//                 <FaHourglass className="text-2xl" />
//               </div>
//               <div className="flex-1">
//                 <h4 className="text-lg font-bold text-gray-900 mb-2">Election Duration</h4>
                
//                 {/* Days Count */}
//                 <div className="bg-white rounded-lg p-4 mb-3 border-2 border-purple-300 shadow-sm">
//                   <div className="flex items-center justify-center gap-3">
//                     <FaClock className="text-purple-600 text-3xl" />
//                     <div className="text-center">
//                       <p className="text-4xl font-bold text-purple-600">
//                         {durationDays}
//                       </p>
//                       <p className="text-sm font-semibold text-gray-600">
//                         {durationDays === 1 ? 'Day' : 'Days'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Date/Time Details */}
//                 <div className="space-y-2 text-sm">
//                   <div className="flex items-center gap-2">
//                     <span className="font-semibold text-green-700">▶ Start:</span>
//                     <span className="text-gray-700">
//                       {new Date(`${data.start_date}T${data.start_time}`).toLocaleString('en-US', {
//                         weekday: 'short',
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="font-semibold text-red-700">■ End:</span>
//                     <span className="text-gray-700">
//                       {new Date(`${data.end_date}T${data.end_time}`).toLocaleString('en-US', {
//                         weekday: 'short',
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Action Button */}
//       <div className="flex justify-end">
//         <button
//           onClick={handleSaveAndContinue}
//           disabled={loading}
//           className={`px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 ${
//             loading
//               ? 'bg-gray-400 cursor-not-allowed'
//               : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
//           }`}
//         >
//           {loading ? (
//             <>
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               Saving...
//             </>
//           ) : (
//             <>
//               <FaCheckCircle />
//               Save & Continue
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }
//last workable code tested
// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import { 
//   FaCalendarAlt, 
//   FaClock, 
//   FaImage, 
//   FaVideo, 
//   FaPalette,
//   FaGlobe,
//   FaInfoCircle,
//   FaCheckCircle,
//   FaYoutube,
//   FaVimeoV,
//   FaUpload,
//   FaLink,
//   FaPlay,
//   FaHourglass
// } from 'react-icons/fa';
// import { createDraft } from '../../../../../redux/api/election/electionApi';

// // Helper function to extract YouTube video ID
// const getYouTubeVideoId = (url) => {
//   if (!url) return null;
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return (match && match[2].length === 11) ? match[2] : null;
// };

// // Helper function to extract Vimeo video ID
// const getVimeoVideoId = (url) => {
//   if (!url) return null;
//   const regExp = /vimeo.com\/(\d+)/;
//   const match = url.match(regExp);
//   return match ? match[1] : null;
// };

// // Helper function to calculate duration in days
// const calculateDurationInDays = (startDate, startTime, endDate, endTime) => {
//   if (!startDate || !startTime || !endDate || !endTime) return null;
  
//   const start = new Date(`${startDate}T${startTime}`);
//   const end = new Date(`${endDate}T${endTime}`);
  
//   const diffTime = Math.abs(end - start);
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
//   return diffDays;
// };

// // Timezone list (major timezones)
// const TIMEZONES = [
//   { value: 'UTC', label: '(UTC+00:00) Coordinated Universal Time' },
//   { value: 'America/New_York', label: '(UTC-05:00) Eastern Time (US & Canada)' },
//   { value: 'America/Chicago', label: '(UTC-06:00) Central Time (US & Canada)' },
//   { value: 'America/Denver', label: '(UTC-07:00) Mountain Time (US & Canada)' },
//   { value: 'America/Los_Angeles', label: '(UTC-08:00) Pacific Time (US & Canada)' },
//   { value: 'America/Toronto', label: '(UTC-05:00) Toronto' },
//   { value: 'America/Mexico_City', label: '(UTC-06:00) Mexico City' },
//   { value: 'America/Sao_Paulo', label: '(UTC-03:00) Brasilia' },
//   { value: 'Europe/London', label: '(UTC+00:00) London' },
//   { value: 'Europe/Paris', label: '(UTC+01:00) Paris, Berlin, Rome' },
//   { value: 'Europe/Istanbul', label: '(UTC+03:00) Istanbul' },
//   { value: 'Europe/Moscow', label: '(UTC+03:00) Moscow' },
//   { value: 'Africa/Cairo', label: '(UTC+02:00) Cairo' },
//   { value: 'Africa/Johannesburg', label: '(UTC+02:00) Johannesburg' },
//   { value: 'Africa/Lagos', label: '(UTC+01:00) Lagos' },
//   { value: 'Asia/Dubai', label: '(UTC+04:00) Dubai' },
//   { value: 'Asia/Karachi', label: '(UTC+05:00) Karachi' },
//   { value: 'Asia/Kolkata', label: '(UTC+05:30) Mumbai, Kolkata' },
//   { value: 'Asia/Dhaka', label: '(UTC+06:00) Dhaka' },
//   { value: 'Asia/Bangkok', label: '(UTC+07:00) Bangkok' },
//   { value: 'Asia/Singapore', label: '(UTC+08:00) Singapore' },
//   { value: 'Asia/Hong_Kong', label: '(UTC+08:00) Hong Kong' },
//   { value: 'Asia/Shanghai', label: '(UTC+08:00) Beijing, Shanghai' },
//   { value: 'Asia/Tokyo', label: '(UTC+09:00) Tokyo' },
//   { value: 'Asia/Seoul', label: '(UTC+09:00) Seoul' },
//   { value: 'Australia/Sydney', label: '(UTC+10:00) Sydney' },
//   { value: 'Australia/Melbourne', label: '(UTC+10:00) Melbourne' },
//   { value: 'Pacific/Auckland', label: '(UTC+12:00) Auckland' },
// ];

// export default function Step1BasicInfo({ data, updateData, onNext, creatorType, setElectionId }) {
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [videoMode, setVideoMode] = useState('url'); // 'url' or 'upload'
//   const [previewImage, setPreviewImage] = useState(data.topic_image ? URL.createObjectURL(data.topic_image) : null);
//   const [previewLogo, setPreviewLogo] = useState(data.logo ? URL.createObjectURL(data.logo) : null);
//   const [videoPlaying, setVideoPlaying] = useState(false);
//   const [durationDays, setDurationDays] = useState(null);

//   // Calculate duration whenever dates/times change
//   useEffect(() => {
//     const days = calculateDurationInDays(
//       data.start_date, 
//       data.start_time, 
//       data.end_date, 
//       data.end_time
//     );
//     setDurationDays(days);
//   }, [data.start_date, data.start_time, data.end_date, data.end_time]);

//   // Get video IDs for preview
//   const youtubeVideoId = getYouTubeVideoId(data.topic_video_url);
//   const vimeoVideoId = getVimeoVideoId(data.topic_video_url);

//   const validateStep = () => {
//     const newErrors = {};

//     if (!data.title?.trim()) {
//       newErrors.title = 'Election title is required';
//     } else if (data.title.length < 10) {
//       newErrors.title = 'Title must be at least 10 characters';
//     } else if (data.title.length > 200) {
//       newErrors.title = 'Title must not exceed 200 characters';
//     }

//     if (!data.description?.trim()) {
//       newErrors.description = 'Description is required';
//     } else if (data.description.length < 50) {
//       newErrors.description = 'Description must be at least 50 characters';
//     }

//     if (!data.start_date) {
//       newErrors.start_date = 'Start date is required';
//     }

//     if (!data.start_time) {
//       newErrors.start_time = 'Start time is required';
//     }

//     if (!data.end_date) {
//       newErrors.end_date = 'End date is required';
//     }

//     if (!data.end_time) {
//       newErrors.end_time = 'End time is required';
//     }

//     if (data.start_date && data.end_date) {
//       const startDateTime = new Date(`${data.start_date}T${data.start_time}`);
//       const endDateTime = new Date(`${data.end_date}T${data.end_time}`);
//       const now = new Date();

//       if (startDateTime < now) {
//         newErrors.start_date = 'Start date/time must be in the future';
//       }

//       if (endDateTime <= startDateTime) {
//         newErrors.end_date = 'End date/time must be after start date/time';
//       }
//     }

//     if (!data.timezone) {
//       newErrors.timezone = 'Timezone is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleImageChange = (e, type) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       toast.error('Please select an image file');
//       return;
//     }

//     // Validate file size (5MB limit)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error('Image size must be less than 5MB');
//       return;
//     }

//     if (type === 'topic_image') {
//       updateData({ topic_image: file });
//       setPreviewImage(URL.createObjectURL(file));
//     } else if (type === 'logo') {
//       updateData({ logo: file });
//       setPreviewLogo(URL.createObjectURL(file));
//     }
//   };

//   const handleVideoUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('video/')) {
//       toast.error('Please select a video file');
//       return;
//     }

//     // Validate file size (100MB limit)
//     if (file.size > 100 * 1024 * 1024) {
//       toast.error('Video size must be less than 100MB');
//       return;
//     }

//     updateData({ topic_video: file, topic_video_url: '' });
//     toast.success('Video file selected successfully');
//   };

//   const handleSaveAndContinue = async () => {
//     if (!validateStep()) {
//       toast.error('Please fix all errors before continuing');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Create draft with basic info
//       const draftData = {
//         title: data.title,
//         description: data.description,
//         start_date: data.start_date,
//         start_time: data.start_time,
//         end_date: data.end_date,
//         end_time: data.end_time,
//         timezone: data.timezone,
//         topic_video_url: videoMode === 'url' ? data.topic_video_url : '',
//         creator_type: creatorType,
//         status: 'draft'
//       };

//       const response = await createDraft(draftData);
      
//       if (response.success) {
//         // The response should have draft_id or id
//         const draftId = response.data.draft_id || response.data.id;
//         setElectionId(draftId);
        
//         toast.success('Basic information saved!');
//         onNext();
//       } else {
//         toast.error(response.message || 'Failed to save draft');
//       }
//     } catch (error) {
//       console.error('Error saving draft:', error);
//       toast.error(error.response?.data?.message || 'Failed to save. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
//         <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//           <span className="text-3xl">📋</span>
//           Basic Election Information
//         </h2>
//         <p className="text-gray-600">
//           Let's start by setting up the fundamental details of your election
//         </p>
//       </div>

//       {/* Election Title */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <label className="block text-lg font-semibold text-gray-800 mb-3">
//           Election Title *
//           <span className="text-sm font-normal text-gray-500 ml-2">
//             (10-200 characters)
//           </span>
//         </label>
//         <input
//           type="text"
//           value={data.title}
//           onChange={(e) => updateData({ title: e.target.value })}
//           placeholder="e.g., 2025 Student Council President Election"
//           className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
//             errors.title ? 'border-red-500' : 'border-gray-300'
//           }`}
//           maxLength={200}
//         />
//         <div className="flex justify-between items-center mt-2">
//           {errors.title && (
//             <p className="text-red-500 text-sm flex items-center gap-1">
//               <FaInfoCircle /> {errors.title}
//             </p>
//           )}
//           <p className="text-gray-500 text-sm ml-auto">
//             {data.title?.length || 0} / 200 characters
//           </p>
//         </div>
//       </div>

//       {/* Election Description */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <label className="block text-lg font-semibold text-gray-800 mb-3">
//           Election Description *
//           <span className="text-sm font-normal text-gray-500 ml-2">
//             (Minimum 50 characters)
//           </span>
//         </label>
//         <textarea
//           value={data.description}
//           onChange={(e) => updateData({ description: e.target.value })}
//           placeholder="Provide a detailed description of your election, including its purpose, eligibility criteria, and any important information voters should know..."
//           rows={6}
//           className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
//             errors.description ? 'border-red-500' : 'border-gray-300'
//           }`}
//           maxLength={2000}
//         />
//         <div className="flex justify-between items-center mt-2">
//           {errors.description && (
//             <p className="text-red-500 text-sm flex items-center gap-1">
//               <FaInfoCircle /> {errors.description}
//             </p>
//           )}
//           <p className="text-gray-500 text-sm ml-auto">
//             {data.description?.length || 0} / 2000 characters
//           </p>
//         </div>
//       </div>

//       {/* Media Upload Section */}
//       <div className="grid md:grid-cols-2 gap-6">
//         {/* Topic Image */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
//             <FaImage className="text-blue-600" />
//             Election Cover Image
//           </label>
//           <p className="text-sm text-gray-600 mb-4">
//             Upload a cover image for your election (Max 5MB)
//           </p>
          
//           {previewImage && (
//             <div className="mb-4 relative">
//               <img
//                 src={previewImage}
//                 alt="Preview"
//                 className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
//               />
//               <button
//                 onClick={() => {
//                   updateData({ topic_image: null });
//                   setPreviewImage(null);
//                 }}
//                 className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
//               >
//                 ✕
//               </button>
//             </div>
//           )}

//           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
//             <div className="flex flex-col items-center justify-center pt-5 pb-6">
//               <FaUpload className="text-3xl text-gray-400 mb-2" />
//               <p className="text-sm text-gray-600 font-semibold">
//                 Click to upload image
//               </p>
//               <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX 5MB)</p>
//             </div>
//             <input
//               type="file"
//               className="hidden"
//               accept="image/*"
//               onChange={(e) => handleImageChange(e, 'topic_image')}
//             />
//           </label>
//         </div>

//         {/* Logo Upload */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
//             <FaPalette className="text-purple-600" />
//             Branding Logo
//           </label>
//           <p className="text-sm text-gray-600 mb-4">
//             Upload your logo for branding (Max 5MB)
//           </p>
          
//           {previewLogo && (
//             <div className="mb-4 relative">
//               <img
//                 src={previewLogo}
//                 alt="Logo Preview"
//                 className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
//               />
//               <button
//                 onClick={() => {
//                   updateData({ logo: null });
//                   setPreviewLogo(null);
//                 }}
//                 className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
//               >
//                 ✕
//               </button>
//             </div>
//           )}

//           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
//             <div className="flex flex-col items-center justify-center pt-5 pb-6">
//               <FaUpload className="text-3xl text-gray-400 mb-2" />
//               <p className="text-sm text-gray-600 font-semibold">
//                 Click to upload logo
//               </p>
//               <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX 5MB)</p>
//             </div>
//             <input
//               type="file"
//               className="hidden"
//               accept="image/*"
//               onChange={(e) => handleImageChange(e, 'logo')}
//             />
//           </label>
//         </div>
//       </div>

//       {/* Video Section */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
//           <FaVideo className="text-red-600" />
//           Election Video (Optional)
//         </label>
//         <p className="text-sm text-gray-600 mb-4">
//           Add a video to explain your election to voters
//         </p>

//         {/* Video Mode Toggle */}
//         <div className="flex gap-3 mb-4">
//           <button
//             onClick={() => setVideoMode('url')}
//             className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
//               videoMode === 'url'
//                 ? 'bg-blue-600 text-white shadow-md'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             <FaLink className="inline mr-2" />
//             Video URL (YouTube/Vimeo)
//           </button>
//           <button
//             onClick={() => setVideoMode('upload')}
//             className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
//               videoMode === 'upload'
//                 ? 'bg-blue-600 text-white shadow-md'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             <FaUpload className="inline mr-2" />
//             Upload Video File
//           </button>
//         </div>

//         {videoMode === 'url' ? (
//           <div>
//             <div className="flex gap-2 mb-3">
//               <FaYoutube className="text-red-600 text-2xl" />
//               <FaVimeoV className="text-blue-500 text-2xl" />
//               <span className="text-sm text-gray-600 flex-1">
//                 Paste your YouTube or Vimeo video URL
//               </span>
//             </div>
//             <input
//               type="url"
//               value={data.topic_video_url}
//               onChange={(e) => updateData({ topic_video_url: e.target.value, topic_video: null })}
//               placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
//               className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
            
//             {/* YouTube Video Preview */}
//             {youtubeVideoId && (
//               <div className="mt-4">
//                 <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-3">
//                   <FaCheckCircle className="text-green-600" />
//                   <span className="text-sm text-green-700 font-medium">
//                     YouTube video detected
//                   </span>
//                 </div>
                
//                 <div className="relative rounded-lg overflow-hidden shadow-lg">
//                   {!videoPlaying ? (
//                     <div 
//                       className="relative cursor-pointer group"
//                       onClick={() => setVideoPlaying(true)}
//                     >
//                       <img
//                         src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
//                         alt="Video thumbnail"
//                         className="w-full h-64 object-cover"
//                       />
//                       <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
//                         <div className="bg-red-600 rounded-full p-5 group-hover:scale-110 transition-transform">
//                           <FaPlay className="text-white text-3xl ml-1" />
//                         </div>
//                       </div>
//                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
//                         <p className="text-white font-semibold">Click to play video</p>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="relative" style={{ paddingBottom: '56.25%' }}>
//                       <iframe
//                         className="absolute top-0 left-0 w-full h-full"
//                         src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
//                         title="YouTube video player"
//                         frameBorder="0"
//                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                         allowFullScreen
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Vimeo Video Preview */}
//             {vimeoVideoId && (
//               <div className="mt-4">
//                 <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-3">
//                   <FaCheckCircle className="text-green-600" />
//                   <span className="text-sm text-green-700 font-medium">
//                     Vimeo video detected
//                   </span>
//                 </div>
                
//                 <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
//                   <iframe
//                     className="absolute top-0 left-0 w-full h-full"
//                     src={`https://player.vimeo.com/video/${vimeoVideoId}`}
//                     title="Vimeo video player"
//                     frameBorder="0"
//                     allow="autoplay; fullscreen; picture-in-picture"
//                     allowFullScreen
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Show message if URL is entered but not recognized */}
//             {data.topic_video_url && !youtubeVideoId && !vimeoVideoId && (
//               <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
//                 <FaInfoCircle className="text-yellow-600" />
//                 <span className="text-sm text-yellow-700">
//                   Please enter a valid YouTube or Vimeo URL
//                 </span>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div>
//             <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
//               <div className="flex flex-col items-center justify-center">
//                 <FaVideo className="text-4xl text-gray-400 mb-3" />
//                 <p className="text-sm text-gray-600 font-semibold mb-1">
//                   Click to upload video file
//                 </p>
//                 <p className="text-xs text-gray-500">MP4, MOV, AVI (MAX 100MB)</p>
//               </div>
//               <input
//                 type="file"
//                 className="hidden"
//                 accept="video/*"
//                 onChange={handleVideoUpload}
//               />
//             </label>
//             {data.topic_video && (
//               <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <FaCheckCircle className="text-green-600" />
//                   <span className="text-sm text-green-700 font-medium">
//                     Video file: {data.topic_video.name}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => updateData({ topic_video: null })}
//                   className="text-red-600 hover:text-red-700 font-semibold text-sm"
//                 >
//                   Remove
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Schedule Section - IMPROVED STYLING */}
//       <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
//         <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//           <div className="bg-green-600 text-white p-3 rounded-lg">
//             <FaCalendarAlt className="text-xl" />
//           </div>
//           <span>Election Schedule</span>
//         </h3>

//         <div className="grid md:grid-cols-2 gap-6">
//           {/* Start Date & Time */}
//           <div className="bg-white rounded-xl shadow-md p-5 border-2 border-green-100">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="bg-green-100 p-2 rounded-lg">
//                 <FaCalendarAlt className="text-green-600" />
//               </div>
//               <h4 className="text-lg font-bold text-gray-800">Start Date & Time</h4>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   📅 Start Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={data.start_date}
//                   onChange={(e) => updateData({ start_date: e.target.value })}
//                   min={new Date().toISOString().split('T')[0]}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
//                     errors.start_date ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.start_date && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.start_date}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   🕐 Start Time *
//                 </label>
//                 <input
//                   type="time"
//                   value={data.start_time}
//                   onChange={(e) => updateData({ start_time: e.target.value })}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
//                     errors.start_time ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.start_time && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.start_time}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* End Date & Time */}
//           <div className="bg-white rounded-xl shadow-md p-5 border-2 border-red-100">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="bg-red-100 p-2 rounded-lg">
//                 <FaCalendarAlt className="text-red-600" />
//               </div>
//               <h4 className="text-lg font-bold text-gray-800">End Date & Time</h4>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   📅 End Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={data.end_date}
//                   onChange={(e) => updateData({ end_date: e.target.value })}
//                   min={data.start_date || new Date().toISOString().split('T')[0]}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
//                     errors.end_date ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.end_date && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.end_date}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   🕐 End Time *
//                 </label>
//                 <input
//                   type="time"
//                   value={data.end_time}
//                   onChange={(e) => updateData({ end_time: e.target.value })}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
//                     errors.end_time ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.end_time && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.end_time}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Timezone */}
//         <div className="mt-6 bg-white rounded-xl shadow-md p-5 border-2 border-blue-100">
//           <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//             <div className="bg-blue-100 p-2 rounded-lg">
//               <FaGlobe className="text-blue-600" />
//             </div>
//             <span>Timezone *</span>
//           </label>
//           <select
//             value={data.timezone}
//             onChange={(e) => updateData({ timezone: e.target.value })}
//             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
//               errors.timezone ? 'border-red-500' : 'border-gray-300'
//             }`}
//           >
//             <option value="">Select timezone</option>
//             {TIMEZONES.map((tz) => (
//               <option key={tz.value} value={tz.value}>
//                 {tz.label}
//               </option>
//             ))}
//           </select>
//           {errors.timezone && (
//             <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//               <FaInfoCircle /> {errors.timezone}
//             </p>
//           )}
//         </div>

//         {/* Duration Display - WITH DAYS COUNT */}
//         {data.start_date && data.start_time && data.end_date && data.end_time && durationDays !== null && (
//           <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-md">
//             <div className="flex items-start gap-4">
//               <div className="bg-purple-600 text-white p-3 rounded-lg">
//                 <FaHourglass className="text-2xl" />
//               </div>
//               <div className="flex-1">
//                 <h4 className="text-lg font-bold text-gray-900 mb-2">Election Duration</h4>
                
//                 {/* Days Count - PROMINENT DISPLAY */}
//                 <div className="bg-white rounded-lg p-4 mb-3 border-2 border-purple-300 shadow-sm">
//                   <div className="flex items-center justify-center gap-3">
//                     <FaClock className="text-purple-600 text-3xl" />
//                     <div className="text-center">
//                       <p className="text-4xl font-bold text-purple-600">
//                         {durationDays}
//                       </p>
//                       <p className="text-sm font-semibold text-gray-600">
//                         {durationDays === 1 ? 'Day' : 'Days'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Date/Time Details */}
//                 <div className="space-y-2 text-sm">
//                   <div className="flex items-center gap-2">
//                     <span className="font-semibold text-green-700">▶ Start:</span>
//                     <span className="text-gray-700">
//                       {new Date(`${data.start_date}T${data.start_time}`).toLocaleString('en-US', {
//                         weekday: 'short',
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="font-semibold text-red-700">■ End:</span>
//                     <span className="text-gray-700">
//                       {new Date(`${data.end_date}T${data.end_time}`).toLocaleString('en-US', {
//                         weekday: 'short',
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Action Button */}
//       <div className="flex justify-end">
//         <button
//           onClick={handleSaveAndContinue}
//           disabled={loading}
//           className={`px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 ${
//             loading
//               ? 'bg-gray-400 cursor-not-allowed'
//               : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
//           }`}
//         >
//           {loading ? (
//             <>
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               Saving...
//             </>
//           ) : (
//             <>
//               <FaCheckCircle />
//               Save & Continue
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }
