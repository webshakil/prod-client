import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaImage, FaVideo, FaUpload, FaTimes, FaCalendar, FaClock } from 'react-icons/fa';

export default function Step1BasicInfo({ data, updateData, onNext, onClose }) {
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (fileType === 'topic_image' || fileType === 'logo') {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Image file size should be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fileType === 'topic_image') {
          setPreviewImage(reader.result);
        } else {
          setPreviewLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'topic_video') {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast.error('Video file size should be less than 50MB');
        return;
      }
      
      // Create preview
      const videoURL = URL.createObjectURL(file);
      setPreviewVideo(videoURL);
    }
    
    updateData({ [fileType]: file });
  };
  
  const removeFile = (fileType) => {
    updateData({ [fileType]: null });
    if (fileType === 'topic_image') setPreviewImage(null);
    if (fileType === 'topic_video') setPreviewVideo(null);
    if (fileType === 'logo') setPreviewLogo(null);
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!data.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (data.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!data.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (data.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
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
    
    // Validate dates
    if (data.start_date && data.end_date) {
      const startDateTime = new Date(`${data.start_date}T${data.start_time || '00:00'}`);
      const endDateTime = new Date(`${data.end_date}T${data.end_time || '00:00'}`);
      
      if (endDateTime <= startDateTime) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validate()) {
      onNext();
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 1: Basic Information
      </h2>
      
      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Election Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Enter election title (e.g., 'Presidential Election 2025')"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>
      
      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Describe your election purpose, rules, and any important details..."
          rows={5}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {data.description?.length || 0} characters (minimum 20)
        </p>
      </div>
      
      {/* Date & Time */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Start Date & Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaCalendar className="inline mr-2" />
            Start Date & Time <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={data.start_date}
              onChange={(e) => updateData({ start_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.start_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <input
              type="time"
              value={data.start_time}
              onChange={(e) => updateData({ start_time: e.target.value })}
              className={`px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.start_time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {(errors.start_date || errors.start_time) && (
            <p className="text-red-500 text-sm mt-1">
              {errors.start_date || errors.start_time}
            </p>
          )}
        </div>
        
        {/* End Date & Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaClock className="inline mr-2" />
            End Date & Time <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={data.end_date}
              onChange={(e) => updateData({ end_date: e.target.value })}
              min={data.start_date || new Date().toISOString().split('T')[0]}
              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.end_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <input
              type="time"
              value={data.end_time}
              onChange={(e) => updateData({ end_time: e.target.value })}
              className={`px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.end_time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {(errors.end_date || errors.end_time) && (
            <p className="text-red-500 text-sm mt-1">
              {errors.end_date || errors.end_time}
            </p>
          )}
        </div>
      </div>
      
      {/* File Uploads */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Media Uploads (Optional)
        </label>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Topic Image */}
          <FileUploadBox
            label="Topic Image"
            icon={<FaImage />}
            accept="image/*"
            file={data.topic_image}
            preview={previewImage}
            onChange={(e) => handleFileChange(e, 'topic_image')}
            onRemove={() => removeFile('topic_image')}
            helpText="Max 5MB (JPG, PNG)"
          />
          
          {/* Topic Video */}
          <FileUploadBox
            label="Topic Video"
            icon={<FaVideo />}
            accept="video/*"
            file={data.topic_video}
            preview={previewVideo}
            isVideo
            onChange={(e) => handleFileChange(e, 'topic_video')}
            onRemove={() => removeFile('topic_video')}
            helpText="Max 50MB (MP4, MOV)"
          />
          
          {/* Logo */}
          <FileUploadBox
            label="Logo"
            icon={<FaImage />}
            accept="image/*"
            file={data.logo}
            preview={previewLogo}
            onChange={(e) => handleFileChange(e, 'logo')}
            onRemove={() => removeFile('logo')}
            helpText="Max 5MB (JPG, PNG)"
          />
        </div>
      </div>
      
      {/* Custom URL */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Custom URL Slug (Optional)
        </label>
        <div className="flex items-center">
          <span className="px-4 py-3 bg-gray-100 border-2 border-r-0 border-gray-300 rounded-l-lg text-gray-600">
            vottery.com/vote/
          </span>
          <input
            type="text"
            value={data.custom_url}
            onChange={(e) => updateData({ custom_url: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
            placeholder="my-election-2025"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Leave empty to auto-generate from title
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onClose}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
        >
          Cancel
        </button>
        
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-md"
        >
          Next: Configuration →
        </button>
      </div>
    </div>
  );
}

// File Upload Box Component
function FileUploadBox({ label, icon, accept, file, preview, isVideo, onChange, onRemove, helpText }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {icon}
        {label}
      </p>
      
      {!file ? (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition">
            <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
            <p className="text-sm text-gray-600">Click to upload</p>
            <p className="text-xs text-gray-400 mt-1">{helpText}</p>
          </div>
          <input
            type="file"
            accept={accept}
            onChange={onChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative border-2 border-green-500 rounded-lg p-2 bg-green-50">
          {preview && !isVideo && (
            <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
          )}
          {preview && isVideo && (
            <video src={preview} controls className="w-full h-32 rounded mb-2" />
          )}
          <p className="text-sm text-gray-700 truncate">{file.name}</p>
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}