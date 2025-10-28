import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheck, FaEdit, FaSave, FaRocket } from 'react-icons/fa';
import { createDraft, createElection } from '../../../../redux/api/election/electionApi';

export default function Step4Review({ data, onPrevious, onClose }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const formatDate = (date, time) => {
    if (!date || !time) return 'Not set';
    return new Date(`${date}T${time}`).toLocaleString();
  };
  
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      // Create FormData for file uploads
      const draftData = {
        ...data,
        status: 'draft'
      };
      
      const response = await createDraft(draftData);
      
      if (response.success) {
        toast.success('Draft saved successfully!');
        setTimeout(() => {
          onClose();
          navigate('/dashboard'); // Go back to dashboard
        }, 1500);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(error.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePublish = async () => {
    if (!window.confirm('Are you sure you want to publish this election? It will be visible to voters immediately.')) {
      return;
    }
    
    try {
      setPublishing(true);
      
      // Prepare files object
      const files = {};
      if (data.topic_image) files.topic_image = data.topic_image;
      if (data.topic_video) files.topic_video = data.topic_video;
      if (data.logo) files.logo = data.logo;
      
      // Prepare election data (without files)
      const electionData = { ...data };
      delete electionData.topic_image;
      delete electionData.topic_video;
      delete electionData.logo;
      
      const response = await createElection(electionData, files);
      
      if (response.success) {
        toast.success('🎉 Election published successfully!');
        setTimeout(() => {
          onClose();
          navigate(`/dashboard`); // Go to election details
        }, 2000);
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error(error.response?.data?.message || 'Failed to publish election');
    } finally {
      setPublishing(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 4: Review & Publish
      </h2>
      
      <p className="text-gray-600 mb-6">
        Review all your election details before publishing. You can save as draft to continue later.
      </p>
      
      {/* Basic Information */}
      <Section title="Basic Information" editStep={1} onPrevious={onPrevious}>
        <InfoRow label="Title" value={data.title} />
        <InfoRow label="Description" value={data.description} />
        <InfoRow label="Creator Type" value={data.creator_type} />
        <InfoRow label="Start Date" value={formatDate(data.start_date, data.start_time)} />
        <InfoRow label="End Date" value={formatDate(data.end_date, data.end_time)} />
        <InfoRow label="Custom URL" value={data.custom_url || 'Auto-generated'} />
        <InfoRow label="Topic Image" value={data.topic_image ? '✓ Uploaded' : 'None'} />
        <InfoRow label="Topic Video" value={data.topic_video ? '✓ Uploaded' : 'None'} />
        <InfoRow label="Logo" value={data.logo ? '✓ Uploaded' : 'None'} />
      </Section>
      
      {/* Voting Configuration */}
      <Section title="Voting Configuration" editStep={2} onPrevious={onPrevious}>
        <InfoRow label="Voting Type" value={formatVotingType(data.voting_type)} />
        <InfoRow label="Permission Type" value={formatPermissionType(data.permission_type)} />
        {data.permission_type === 'country_specific' && (
          <InfoRow 
            label="Allowed Countries" 
            value={`${data.allowed_countries?.length || 0} countries selected`} 
          />
        )}
        <InfoRow label="Pricing Type" value={formatPricingType(data.pricing_type)} />
        {data.pricing_type === 'general_fee' && (
          <InfoRow label="Participation Fee" value={`$${data.general_participation_fee}`} />
        )}
        {data.pricing_type === 'regional_fee' && (
          <InfoRow 
            label="Regional Pricing" 
            value={`${data.regional_pricing?.length || 0} regions configured`} 
          />
        )}
        <InfoRow 
          label="Authentication" 
          value={data.authentication_methods?.join(', ') || 'None'} 
        />
        <InfoRow label="Biometric Required" value={data.biometric_required ? 'Yes' : 'No'} />
        <InfoRow label="Show Live Results" value={data.show_live_results ? 'Yes' : 'No'} />
        <InfoRow label="Allow Vote Editing" value={data.vote_editing_allowed ? 'Yes' : 'No'} />
      </Section>
      
      {/* Questions */}
      <Section title="Questions" editStep={3} onPrevious={onPrevious}>
        <div className="space-y-4">
          {data.questions && data.questions.length > 0 ? (
            data.questions.map((question, index) => (
              <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    Question {index + 1}: {question.question_text}
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {question.question_type}
                  </span>
                </div>
                {question.question_type !== 'open_text' && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Options:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        /*eslint-disable*/
                      {question.options?.map((option) => (
                        <li key={option.id}>{option.option_text}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>Required: {question.is_required ? 'Yes' : 'No'}</span>
                  {question.question_type === 'multiple_choice' && (
                    <span>Max Selections: {question.max_selections}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No questions added</p>
          )}
        </div>
      </Section>
      
      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t mt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
        >
          ← Previous
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition shadow-md disabled:opacity-50"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          
          <button
            onClick={handlePublish}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-semibold transition shadow-lg disabled:opacity-50"
          >
            <FaRocket />
            {publishing ? 'Publishing...' : 'Publish Election'}
          </button>
        </div>
      </div>
      
      {/* Warning */}
      <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Once published, the election will be visible to voters based on your permission settings. 
          You can still edit some details after publishing, but major changes may require creating a new election.
        </p>
      </div>
    </div>
  );
}

// Section Component
function Section({ title, editStep, onPrevious, children }) {
  return (
    <div className="mb-6 p-6 bg-white border-2 border-gray-200 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FaCheck className="text-green-500" />
          {title}
        </h3>
        <button
          onClick={() => {
            // Go back to specific step
            for (let i = 0; i < (4 - editStep); i++) {
              onPrevious();
            }
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold"
        >
          <FaEdit />
          Edit
        </button>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

// Info Row Component
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900 font-semibold text-right max-w-md">
        {value || 'Not set'}
      </span>
    </div>
  );
}

// Helper functions
function formatVotingType(type) {
  const types = {
    'plurality': 'Plurality (First Past the Post)',
    'ranked_choice': 'Ranked Choice Voting',
    'approval': 'Approval Voting'
  };
  return types[type] || type;
}

function formatPermissionType(type) {
  const types = {
    'public': 'Public (Anyone can vote)',
    'country_specific': 'Country Specific',
    'organization_only': 'Organization Only'
  };
  return types[type] || type;
}

function formatPricingType(type) {
  const types = {
    'free': 'Free Election',
    'general_fee': 'General Fee',
    'regional_fee': 'Regional Pricing'
  };
  return types[type] || type;
}