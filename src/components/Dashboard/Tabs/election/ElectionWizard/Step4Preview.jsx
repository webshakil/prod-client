


//last workable files
// src/components/Dashboard/Tabs/election/ElectionWizard/Step4Preview.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaLock,
  FaGift,
  FaVoteYea,
  FaQuestionCircle,
  FaEye,
  FaEyeSlash,
  FaPalette,
  FaRocket,
  FaSave,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaGlobe,
  FaFlag,
  FaFingerprint,
  FaKey,
  FaLink,
  FaTags
} from 'react-icons/fa';
import { publishElection, updateDraft } from '../../../../../redux/api/election/electionApi';

export default function Step4Preview({ data, onBack, onPublish, electionId }) {
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    schedule: true,
    access: true,
    pricing: true,
    lottery: true,
    voting: true,
    questions: true,
    branding: true
  });
  
  const userData = useSelector((state) => state.auth.userData);

  // Debug effect to log all data when component mounts
  useEffect(() => {
    console.log('=== STEP 4 COMPLETE DATA ===');
    console.log('Full data object:', data);
    console.log('Authentication Methods:', data?.authentication_methods);
    console.log('Selected Auth Method:', data?.authentication_methods?.[0]);
    console.log('Category ID:', data?.category_id);
    console.log('Lottery Config:', data?.lottery_config);
    console.log('Lottery Enabled:', data?.lottery_enabled);
    console.log('Estimated Value:', data?.lottery_config?.estimated_value);
    console.log('Prize Description:', data?.lottery_config?.prize_description);
    console.log('Show Participation Fee:', data?.show_participation_fee_in_preview);
    console.log('Show Lottery Prizes:', data?.show_lottery_prizes_in_preview);
    console.log('===========================');
  }, [data]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate duration
  const calculateDuration = () => {
    if (!data?.start_date || !data?.start_time || !data?.end_date || !data?.end_time) {
      return { days: 0, hours: 0, minutes: 0, text: 'Not set' };
    }
    
    try {
      const start = new Date(`${data.start_date}T${data.start_time}`);
      const end = new Date(`${data.end_date}T${data.end_time}`);
      const diffTime = Math.abs(end - start);
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
      return { 
        days, 
        hours, 
        minutes, 
        text: `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
      };
      /*eslint-disable*/
    } catch (error) {
      return { days: 0, hours: 0, minutes: 0, text: 'Invalid date' };
    }
  };

  // Get voting method details
  const getVotingMethodDetails = () => {
    const methods = {
      'plurality': { name: 'Plurality Voting', icon: '📊', desc: 'Single choice voting' },
      'ranked_choice': { name: 'Ranked Choice Voting', icon: '📈', desc: 'Rank candidates by preference' },
      'approval': { name: 'Approval Voting', icon: '✅', desc: 'Approve multiple choices' }
    };
    const votingType = data?.voting_type || 'plurality';
    return methods[votingType] || methods['plurality'];
  };

  // Get auth method details - FIXED to check the correct field
const getAuthMethodDetails = () => {
  // Step3 saves to 'auth_method', so check that first
  const selectedMethod = 
    data?.auth_method ||                    // ✅ Check auth_method FIRST (from Step3)
    data?.authentication_methods?.[0] ||    // Fallback to authentication_methods
    'passkey';
  
  console.log('Getting auth method, found:', selectedMethod);
  
  const methods = {
    'passkey': { 
      name: 'Passkey Authentication', 
      icon: <FaFingerprint className="text-blue-600 text-2xl" />,
      desc: 'Biometric authentication using device passkey'
    },
    'oauth': { 
      name: 'OAuth (Social Login)', 
      icon: <FaGlobe className="text-purple-600 text-2xl" />,
      desc: 'Login with Google, Facebook, or other providers'
    },
    'magic_link': { 
      name: 'Magic Link', 
      icon: <FaLink className="text-orange-600 text-2xl" />,
      desc: 'Email link authentication without password'
    },
    'email_password': { 
      name: 'Email & Password', 
      icon: <FaKey className="text-gray-600 text-2xl" />,
      desc: 'Traditional email and password login'
    }
  };
  
  return methods[selectedMethod] || methods['passkey'];
};


  // Get category details
  const getCategoryDetails = () => {
    const categories = {
      1: { name: 'Politics', icon: '🏛️' },
      2: { name: 'Sports', icon: '⚽' },
      3: { name: 'Entertainment', icon: '🎬' },
      4: { name: 'Education', icon: '📚' },
      5: { name: 'Business', icon: '💼' },
      6: { name: 'Community', icon: '🏘️' },
      7: { name: 'Technology', icon: '💻' },
      8: { name: 'Health', icon: '🏥' }
    };
    return categories[data?.category_id] || null;
  };

  // Get lottery prize display - FIXED to use the exact value
  const getLotteryPrizeDisplay = () => {
    if (!data?.lottery_enabled || !data?.lottery_config) {
      return null;
    }

    const config = data.lottery_config;
    console.log('Gamify config in display function:', config);
    
    // Monetary Prize
    if (config.reward_type === 'monetary') {
      const amount = parseFloat(config.total_prize_pool || 0);
      return {
        type: 'Monetary Prize',
        icon: '💵',
        amount: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        description: 'Cash prize',
        value: amount
      };
    }
    
    // Non-Monetary Prize - FIXED
    if (config.reward_type === 'non_monetary') {
      const estimatedValue = parseFloat(config.estimated_value || 0);
      console.log('Non-monetary estimated value:', estimatedValue);
      
      return {
        type: 'Non-Monetary Prize',
        icon: '🎁',
        amount: config.prize_description || 'Prize package',
        description: `Estimated value: $${estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        value: estimatedValue
      };
    }
    
    // Projected Revenue
    if (config.reward_type === 'projected_revenue') {
      const prizePool = (config.projected_revenue || 0) * ((config.revenue_share_percentage || 0) / 100);
      return {
        type: 'Revenue Share Prize',
        icon: '📈',
        amount: `$${prizePool.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        description: `${config.revenue_share_percentage}% of $${config.projected_revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} projected revenue`,
        value: prizePool
      };
    }

    return null;
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!electionId) {
      toast.error('No draft ID found');
      return;
    }

    setLoading(true);
    try {
      const draftData = {
        title: data.title,
        description: data.description,
        draft_data: { ...data, current_step: 4 }
      };

      const files = {};
      if (data.topic_image instanceof File) files.topic_image = data.topic_image;
      if (data.topic_video instanceof File) files.topic_video = data.topic_video;
      if (data.logo instanceof File) files.logo = data.logo;

      const response = await updateDraft(electionId, draftData, files);
      if (response.success) {
        toast.success('Draft saved successfully!');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  // Publish election
const handlePublish = async () => {
  if (!data.questions || data.questions.length === 0) {
    toast.error('Please add at least one question');
    return;
  }

  const confirmed = window.confirm(
    '🚀 Ready to publish your election?\n\nOnce published, your election will be live and voters can start participating.\n\nAre you sure you want to continue?'
  );
  if (!confirmed) return;

  setPublishing(true);
  try {
    // Get userData from Redux or localStorage fallback
    let currentUserId;
    let currentCreatorType = 'individual';
    
    if (userData && userData.userId) {
      currentUserId = userData.userId;
    } else {
      // Fallback to localStorage
      const localUserData = localStorage.getItem('userData');
      if (localUserData) {
        try {
          const parsedUserData = JSON.parse(localUserData);
          currentUserId = parsedUserData.userId;
        } catch (error) {
          console.error('Error parsing localStorage userData:', error);
        }
      }
    }

    if (!currentUserId) {
      toast.error('User authentication error. Please log in again.');
      setPublishing(false);
      return;
    }

    // Prepare the election payload
    const electionPayload = {
      election: {
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        start_time: data.start_time,
        end_date: data.end_date,
        end_time: data.end_time,
        timezone: data.timezone,
        topic_video_url: data.topic_video_url || null,
        // Map permission_type to match database constraint
        permission_type: data.permission_type === 'specific_countries' 
          ? 'country_specific' 
          : data.permission_type === 'country_specific'
          ? 'country_specific'
          : data.permission_type || 'public',
        allowed_countries: data.allowed_countries || [],
        // Map pricing_type to match database constraint
        pricing_type: data.pricing_type === 'paid_regional' 
          ? 'regional_fee' 
          : data.pricing_type === 'general_fee'
          ? 'general_fee'
          : 'free',
        general_participation_fee: parseFloat(data.general_participation_fee) || 0,
        biometric_required: data.biometric_required || false,
        show_live_results: data.show_live_results || false,
        vote_editing_allowed: data.vote_editing_allowed || false,
        voting_type: data.voting_type || 'plurality',
        authentication_methods: data.auth_method ? [data.auth_method] : (data.authentication_methods || ['passkey']),
        slug: data.election_slug,
        creator_id: currentUserId,
        creator_type: data.creator_type || currentCreatorType,
        status: 'published',
        category_id: data.category_id
      },
      
      questions: data.questions.map((q, idx) => ({
        question_text: q.question_text,
        question_type: q.type === 'mcq' ? 'multiple_choice' : q.type === 'text' ? 'open_text' : q.type === 'image' ? 'image_based' : 'comparison',
        question_order: idx + 1,
        is_required: q.required !== undefined ? q.required : true,
        options: (q.answers || []).filter(a => a?.trim()).map((a, i) => ({
          option_text: a,
          option_order: i + 1
        }))
      }))
    };

    // Add regional pricing if applicable
    if (data.pricing_type === 'paid_regional' && data.regional_fees) {
      // Map region codes to match database constraint
      const regionCodeMap = {
        'north_america': 'region_1_us_canada',
        'us_canada': 'region_1_us_canada',
        'western_europe': 'region_2_western_europe',
        'eastern_europe': 'region_3_eastern_europe',
        'africa': 'region_4_africa',
        'latin_america': 'region_5_latin_america',
        'middle_east': 'region_6_middle_east_asia',
        'middle_east_asia': 'region_6_middle_east_asia',
        'asia': 'region_6_middle_east_asia',
        'australia_nz': 'region_7_australasia',
        'australasia': 'region_7_australasia',
        'china': 'region_8_china'
      };

      electionPayload.regional_pricing = Object.entries(data.regional_fees).map(([region, fee]) => ({
        region_code: regionCodeMap[region] || region, // Use mapped code or fallback to original
        region_name: region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        participation_fee: parseFloat(fee),
        currency: 'USD'
      }));
    }

    // Add lottery configuration if enabled
    if (data.lottery_enabled && data.lottery_config) {
      const lotteryConfig = {
        is_lotterized: true,
        winner_count: parseInt(data.lottery_config.winner_count) || 1,
        prize_funding_source: data.lottery_config.prize_funding_source || 'creator_funded'
      };

      if (data.lottery_config.reward_type === 'monetary') {
        lotteryConfig.reward_type = 'monetary';
        lotteryConfig.reward_amount = parseFloat(data.lottery_config.total_prize_pool) || 0;
        lotteryConfig.prize_description = `Cash prize of $${lotteryConfig.reward_amount.toLocaleString()}`;
      } else if (data.lottery_config.reward_type === 'non_monetary') {
        lotteryConfig.reward_type = 'non_monetary';
        lotteryConfig.reward_amount = parseFloat(data.lottery_config.estimated_value) || 0;
        lotteryConfig.prize_description = data.lottery_config.prize_description || 'Non-monetary prize';
      } else if (data.lottery_config.reward_type === 'projected_revenue') {
        lotteryConfig.reward_type = 'projected_revenue';
        lotteryConfig.projected_revenue = parseFloat(data.lottery_config.projected_revenue) || 0;
        lotteryConfig.revenue_share_percentage = parseFloat(data.lottery_config.revenue_share_percentage) || 0;
        lotteryConfig.reward_amount = (lotteryConfig.projected_revenue * lotteryConfig.revenue_share_percentage) / 100;
        lotteryConfig.prize_description = `${lotteryConfig.revenue_share_percentage}% of $${lotteryConfig.projected_revenue.toLocaleString()} projected revenue`;
      }

      electionPayload.lottery_config = lotteryConfig;
    }

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add files if they exist
    if (data.topic_image instanceof File) {
      formData.append('topic_image', data.topic_image);
    }
    if (data.topic_video instanceof File) {
      formData.append('topic_video', data.topic_video);
    }
    if (data.logo instanceof File) {
      formData.append('logo', data.logo);
    }

    // Append the election data as JSON string
    formData.append('electionData', JSON.stringify(electionPayload));

    console.log('Publishing election with payload:', electionPayload);

    const response = await publishElection(electionId, formData);
    
    if (response.success) {
      toast.success('🎉 Election published successfully!');
      setTimeout(() => onPublish(), 2000);
    } else {
      toast.error(response.message || 'Failed to publish election');
    }
  } catch (error) {
    console.error('Publish error:', error);
    toast.error(error.response?.data?.message || 'Failed to publish election');
  } finally {
    setPublishing(false);
  }
};

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">📋 Election Preview</h2>
            <p className="text-purple-100">Review your election before publishing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <FaSave /> {loading ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-blue-600 text-xl" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
              <p className="text-sm text-gray-600">{data?.title || 'No title'}</p>
            </div>
          </div>
          {expandedSections.basic ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {expandedSections.basic && (
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Election Title</div>
                <div className="font-semibold text-gray-900">{data?.title || 'Not set'}</div>
              </div>
              
              {getCategoryDetails() && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Category</div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">{getCategoryDetails().icon}</span>
                    {getCategoryDetails().name}
                  </div>
                </div>
              )}
            </div>

            {data?.description && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Description</div>
                <div className="text-gray-900">{data.description}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('schedule')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-orange-600 text-xl" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>
              <p className="text-sm text-gray-600">
                {calculateDuration().text}
              </p>
            </div>
          </div>
          {expandedSections.schedule ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {expandedSections.schedule && (
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="text-sm text-gray-600 mb-1">Start Date & Time</div>
                <div className="font-semibold text-gray-900">
                  {data?.start_date} at {data?.start_time}
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="text-sm text-gray-600 mb-1">End Date & Time</div>
                <div className="font-semibold text-gray-900">
                  {data?.end_date} at {data?.end_time}
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Duration</div>
              <div className="font-semibold text-gray-900">{calculateDuration().text}</div>
            </div>
          </div>
        )}
      </div>

      {/* Access Control Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('access')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FaUsers className="text-purple-600 text-xl" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">Access Control</h3>
              <p className="text-sm text-gray-600">
                {data?.permission_type === 'public' ? 'Public election' : 
                 data?.permission_type === 'specific_countries' ? 'Country-specific' : 'Restricted'}
              </p>
            </div>
          </div>
          {expandedSections.access ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {expandedSections.access && (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Permission Type</div>
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                {data?.permission_type === 'public' && '🌍 Public - Anyone can participate'}
                {data?.permission_type === 'specific_countries' && '🚩 Country-Specific'}
                {data?.permission_type === 'organization_only' && '🏢 Organization Only'}
              </div>
            </div>

            {data?.permission_type === 'specific_countries' && data?.allowed_countries && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Allowed Countries</div>
                <div className="flex flex-wrap gap-2">
                  {data.allowed_countries.map((country, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Authentication Method */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Authentication Method</div>
              <div className="flex items-center gap-3">
                {getAuthMethodDetails().icon}
                <div>
                  <div className="font-semibold text-gray-900">{getAuthMethodDetails().name}</div>
                  <div className="text-sm text-gray-600">{getAuthMethodDetails().desc}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================
          PRICING SECTION - WITH CONDITIONAL DISPLAY
          ============================================ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('pricing')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FaDollarSign className="text-green-600 text-xl" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">Pricing & Fees</h3>
              <p className="text-sm text-gray-600">
                {data?.pricing_type === 'free' ? 'Free election' : 'Paid participation'}
              </p>
            </div>
          </div>
          {expandedSections.pricing ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {expandedSections.pricing && (
          <div className="p-6 space-y-4">
            {/* Show/Hide Toggle Status - Only visible to creator */}
            {!data?.show_participation_fee_in_preview && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <FaEyeSlash className="text-yellow-600" />
                <p className="text-sm text-yellow-800 font-medium">
                  Participation fees are hidden from public preview
                </p>
              </div>
            )}

            {/* Pricing Type */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">
                {data?.pricing_type === 'free' ? '🆓' : 
                 data?.pricing_type === 'general_fee' ? '💵' : '🌍'}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 mb-1">Pricing Model</div>
                <div className="text-sm text-gray-600">
                  {data?.pricing_type === 'free' && 'Free - No participation fee'}
                  {data?.pricing_type === 'general_fee' && 'General Fee - Same fee for all participants'}
                  {data?.pricing_type === 'paid_regional' && 'Regional Pricing - Different fees by region'}
                </div>
              </div>
            </div>

            {/* ✅ CONDITIONAL DISPLAY - Only show if toggle is ON */}
            {data?.show_participation_fee_in_preview !== false && (
              <>
                {/* General Fee Display */}
                {data?.pricing_type === 'general_fee' && (
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Participation Fee</div>
                      <div className="text-3xl font-bold text-green-600">
                        ${parseFloat(data?.general_participation_fee || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Per participant</div>
                    </div>
                  </div>
                )}

                {/* Regional Pricing Display */}
                {data?.pricing_type === 'paid_regional' && data?.regional_fees && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Regional Fees:</div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(data.regional_fees).map(([region, fee]) => (
                        <div key={region} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <FaGlobe className="text-blue-600 text-sm" />
                            <div className="text-sm font-medium text-gray-800">
                              {region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            ${parseFloat(fee).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* If fees are hidden, show placeholder */}
            {data?.show_participation_fee_in_preview === false && data?.pricing_type !== 'free' && (
              <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 text-center">
                <FaEyeSlash className="text-gray-400 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  Fee information hidden from public preview
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Fees will be displayed during checkout
                </p>
              </div>
            )}

            {/* Processing Fee (always show to creator) */}
            {data?.processing_fee_percentage > 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <FaExclamationTriangle className="inline mr-1" />
                Processing fee: {data.processing_fee_percentage}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================
          //LOTTERY SECTION - WITH CONDITIONAL DISPLAY
          ============================================ */}
      {data?.lottery_enabled && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('lottery')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FaGift className="text-yellow-600 text-xl" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-800">Gamify & Prizes</h3>
                <p className="text-sm text-gray-600">
                  {data?.lottery_config?.winner_count || 1} winner(s)
                </p>
              </div>
            </div>
            {expandedSections.lottery ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {expandedSections.lottery && (
            <div className="p-6 space-y-4">
              {/* Show/Hide Toggle Status - Only visible to creator */}
              {!data?.show_lottery_prizes_in_preview && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <FaEyeSlash className="text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-medium">
                    Gamity prizes.
                  </p>
                </div>
              )}

              {/* Gamify Enabled Badge */}
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <FaCheckCircle className="text-green-600" />
                <span className="text-sm font-medium text-green-800">Gamify Enabled</span>
              </div>

              {/* ✅ CONDITIONAL DISPLAY - Only show if toggle is ON */}
              {data?.show_lottery_prizes_in_preview !== false ? (
                <>
                  {/* Prize Display */}
                  {(() => {
                    const prizeInfo = getLotteryPrizeDisplay();
                    if (!prizeInfo) return null;

                    return (
                      <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                        <div className="text-center">
                          <div className="text-5xl mb-3">{prizeInfo.icon}</div>
                          <div className="text-sm text-gray-600 mb-2">{prizeInfo.type}</div>
                          <div className="text-4xl font-bold text-yellow-600 mb-2">
                            {prizeInfo.amount}
                          </div>
                          <div className="text-sm text-gray-600">{prizeInfo.description}</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Winner Count */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Winners</span>
                    <span className="text-lg font-bold text-gray-800">
                      {data?.lottery_config?.winner_count || 1}
                    </span>
                  </div>

                  {/* Prize Distribution */}
                  {data?.lottery_config?.prize_distribution && 
                   data.lottery_config.prize_distribution.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Prize Distribution:</div>
                      {data.lottery_config.prize_distribution.map((dist, idx) => {
                        const prizeInfo = getLotteryPrizeDisplay();
                        const prizeValue = prizeInfo?.value || 0;
                        const amount = (prizeValue * dist.percentage) / 100;
                        
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-white font-bold rounded-full text-sm">
                                {dist.rank}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">
                                  {dist.rank === 1 ? '🥇 1st Place' :
                                   dist.rank === 2 ? '🥈 2nd Place' :
                                   dist.rank === 3 ? '🥉 3rd Place' :
                                   `${dist.rank}th Place`}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {dist.percentage}% of total prize
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-yellow-600">
                                ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Funding Source */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm text-gray-600">Prize Funding</span>
                    <span className="text-sm font-medium text-blue-800">
                      {data?.lottery_config?.prize_funding_source === 'creator_funded' 
                        ? '👤 Creator Funded' 
                        : '💰 Participation Fee Funded'}
                    </span>
                  </div>
                </>
              ) : (
                /* If lottery is hidden, show placeholder */
                <div className="p-6 bg-gray-100 rounded-lg border border-gray-300 text-center">
                  <FaEyeSlash className="text-gray-400 text-3xl mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Gamify prize information hidden from public preview
                  </p>
                  <p className="text-xs text-gray-500">
                    Prize details will be revealed to participants after voting
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Voting Configuration Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('voting')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FaVoteYea className="text-indigo-600 text-xl" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">Voting Configuration</h3>
              <p className="text-sm text-gray-600">{getVotingMethodDetails().name}</p>
            </div>
          </div>
          {expandedSections.voting ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {expandedSections.voting && (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getVotingMethodDetails().icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{getVotingMethodDetails().name}</div>
                  <div className="text-sm text-gray-600">{getVotingMethodDetails().desc}</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Live Results</div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  {data?.show_live_results ? (
                    <><FaEye className="text-green-600" /> Enabled</>
                  ) : (
                    <><FaEyeSlash className="text-gray-400" /> Disabled</>
                  )}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Vote Editing</div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  {data?.vote_editing_allowed ? (
                    <><FaCheckCircle className="text-green-600" /> Allowed</>
                  ) : (
                    <><FaLock className="text-gray-400" /> Not Allowed</>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('questions')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FaQuestionCircle className="text-pink-600 text-xl" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
              <p className="text-sm text-gray-600">
                {data?.questions?.length || 0} question{data?.questions?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {expandedSections.questions ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {expandedSections.questions && (
          <div className="p-6 space-y-4">
            {data?.questions && data.questions.length > 0 ? (
              data.questions.map((question, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-pink-500">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white rounded-full font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-2">{question.question_text}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        Type: {question.type} {question.required && '• Required'}
                      </div>
                      {question.answers && question.answers.length > 0 && (
                        <div className="space-y-1">
                          {question.answers.map((answer, ansIdx) => (
                            <div key={ansIdx} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                              {answer}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaQuestionCircle className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No questions added yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-4 pt-6">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
        >
          ← Back to Questions
        </button>

        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {publishing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Publishing...
            </>
          ) : (
            <>
              <FaRocket /> Publish Election
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Before Publishing</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review all election details carefully</li>
              <li>• Ensure start and end dates are correct</li>
              <li>• Verify questions and voting options</li>
              <li>• Check pricing and Gamify configuration</li>
              <li>• Once published, some changes cannot be undone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}





// // src/components/Dashboard/Tabs/election/ElectionWizard/Step4Preview.jsx
// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import {
//   FaCheckCircle,
//   FaCalendarAlt,
//   FaUsers,
//   FaDollarSign,
//   FaLock,
//   FaGift,
//   FaVoteYea,
//   FaQuestionCircle,
//   FaEye,
//   FaEyeSlash,
//   FaPalette,
//   FaRocket,
//   FaSave,
//   FaExclamationTriangle,
//   FaChevronDown,
//   FaChevronUp,
//   FaGlobe,
//   FaFlag,
//   FaFingerprint,
//   FaKey,
//   FaLink,
//   FaTags
// } from 'react-icons/fa';
// import { publishElection, updateDraft } from '../../../../../redux/api/election/electionApi';

// export default function Step4Preview({ data, onBack, onPublish, electionId }) {
//   const [loading, setLoading] = useState(false);
//   const [publishing, setPublishing] = useState(false);
//   const [expandedSections, setExpandedSections] = useState({
//     basic: true,
//     schedule: true,
//     access: true,
//     pricing: true,
//     lottery: true,
//     voting: true,
//     questions: true,
//     branding: true
//   });
  
//   const userData = useSelector((state) => state.auth.userData);

//   // Debug effect to log all data when component mounts
//   useEffect(() => {
//     console.log('=== STEP 4 COMPLETE DATA ===');
//     console.log('Full data object:', data);
//     console.log('Authentication Methods:', data?.authentication_methods);
//     console.log('Selected Auth Method:', data?.authentication_methods?.[0]);
//     console.log('Category ID:', data?.category_id);
//     console.log('Lottery Config:', data?.lottery_config);
//     console.log('Lottery Enabled:', data?.lottery_enabled);
//     console.log('Estimated Value:', data?.lottery_config?.estimated_value);
//     console.log('Prize Description:', data?.lottery_config?.prize_description);
//     console.log('===========================');
//   }, [data]);

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
//   };

//   // Calculate duration
//   const calculateDuration = () => {
//     if (!data?.start_date || !data?.start_time || !data?.end_date || !data?.end_time) {
//       return { days: 0, hours: 0, minutes: 0, text: 'Not set' };
//     }
    
//     try {
//       const start = new Date(`${data.start_date}T${data.start_time}`);
//       const end = new Date(`${data.end_date}T${data.end_time}`);
//       const diffTime = Math.abs(end - start);
//       const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//       const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
//       return { 
//         days, 
//         hours, 
//         minutes, 
//         text: `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
//       };
//       /*eslint-disable*/
//     } catch (error) {
//       return { days: 0, hours: 0, minutes: 0, text: 'Invalid date' };
//     }
//   };

//   // Get voting method details
//   const getVotingMethodDetails = () => {
//     const methods = {
//       'plurality': { name: 'Plurality Voting', icon: '📊', desc: 'Single choice voting' },
//       'ranked_choice': { name: 'Ranked Choice Voting', icon: '📈', desc: 'Rank candidates by preference' },
//       'approval': { name: 'Approval Voting', icon: '✅', desc: 'Approve multiple choices' }
//     };
//     const votingType = data?.voting_type || 'plurality';
//     return methods[votingType] || methods['plurality'];
//   };

//   // Get auth method details - FIXED to check multiple possible keys

//   // Get auth method details - FIXED to check the correct field
// const getAuthMethodDetails = () => {
//   // Step3 saves to 'auth_method', so check that first
//   const selectedMethod = 
//     data?.auth_method ||                    // ✅ Check auth_method FIRST (from Step3)
//     data?.authentication_methods?.[0] ||    // Fallback to authentication_methods
//     'passkey';
  
//   console.log('Getting auth method, found:', selectedMethod);
  
//   const methods = {
//     'passkey': { 
//       name: 'Passkey Authentication', 
//       icon: <FaFingerprint className="text-blue-600 text-2xl" />,
//       desc: 'Biometric authentication using device passkey'
//     },
//     'oauth': { 
//       name: 'OAuth (Social Login)', 
//       icon: <FaGlobe className="text-purple-600 text-2xl" />,
//       desc: 'Login with Google, Facebook, or other providers'
//     },
//     'magic_link': { 
//       name: 'Magic Link', 
//       icon: <FaLink className="text-orange-600 text-2xl" />,
//       desc: 'Email link authentication without password'
//     },
//     'email_password': { 
//       name: 'Email & Password', 
//       icon: <FaKey className="text-gray-600 text-2xl" />,
//       desc: 'Traditional email and password login'
//     }
//   };
  
//   return methods[selectedMethod] || methods['passkey'];
// };


//   // Get category details
//   const getCategoryDetails = () => {
//     const categories = {
//       1: { name: 'Politics', icon: '🏛️' },
//       2: { name: 'Sports', icon: '⚽' },
//       3: { name: 'Entertainment', icon: '🎬' },
//       4: { name: 'Education', icon: '📚' },
//       5: { name: 'Business', icon: '💼' },
//       6: { name: 'Community', icon: '🏘️' },
//       7: { name: 'Technology', icon: '💻' },
//       8: { name: 'Health', icon: '🏥' }
//     };
//     return categories[data?.category_id] || null;
//   };

//   // Get lottery prize display - FIXED to use the exact value
//   const getLotteryPrizeDisplay = () => {
//     if (!data?.lottery_enabled || !data?.lottery_config) {
//       return null;
//     }

//     const config = data.lottery_config;
//     console.log('Lottery config in display function:', config);
    
//     // Monetary Prize
//     if (config.reward_type === 'monetary') {
//       const amount = parseFloat(config.total_prize_pool || 0);
//       return {
//         type: 'Monetary Prize',
//         icon: '💵',
//         amount: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
//         description: 'Cash prize',
//         value: amount
//       };
//     }
    
//     // Non-Monetary Prize - FIXED
//     if (config.reward_type === 'non_monetary') {
//       const estimatedValue = parseFloat(config.estimated_value || 0);
//       console.log('Non-monetary estimated value:', estimatedValue);
      
//       return {
//         type: 'Non-Monetary Prize',
//         icon: '🎁',
//         amount: config.prize_description || 'Prize package',
//         description: `Estimated value: $${estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
//         value: estimatedValue
//       };
//     }
    
//     // Projected Revenue
//     if (config.reward_type === 'projected_revenue') {
//       const prizePool = (config.projected_revenue || 0) * ((config.revenue_share_percentage || 0) / 100);
//       return {
//         type: 'Revenue Share Prize',
//         icon: '📈',
//         amount: `$${prizePool.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
//         description: `${config.revenue_share_percentage}% of $${config.projected_revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} projected revenue`,
//         value: prizePool
//       };
//     }

//     return null;
//   };

//   // Save draft
//   const handleSaveDraft = async () => {
//     if (!electionId) {
//       toast.error('No draft ID found');
//       return;
//     }

//     setLoading(true);
//     try {
//       const draftData = {
//         title: data.title,
//         description: data.description,
//         draft_data: { ...data, current_step: 4 }
//       };

//       const files = {};
//       if (data.topic_image instanceof File) files.topic_image = data.topic_image;
//       if (data.topic_video instanceof File) files.topic_video = data.topic_video;
//       if (data.logo instanceof File) files.logo = data.logo;

//       const response = await updateDraft(electionId, draftData, files);
//       if (response.success) {
//         toast.success('Draft saved successfully!');
//       }
//     } catch (error) {
//       console.error('Save error:', error);
//       toast.error('Failed to save draft');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Publish election
// // UPDATED handlePublish function for Step4Preview.jsx

// const handlePublish = async () => {
//   if (!data.questions || data.questions.length === 0) {
//     toast.error('Please add at least one question');
//     return;
//   }

//   const confirmed = window.confirm(
//     '🚀 Ready to publish your election?\n\nOnce published, your election will be live and voters can start participating.\n\nAre you sure you want to continue?'
//   );
//   if (!confirmed) return;

//   setPublishing(true);
//   try {
//     // Get userData from Redux or localStorage fallback
//     let currentUserId;
//     let currentCreatorType = 'individual';
    
//     if (userData && userData.userId) {
//       currentUserId = userData.userId;
//     } else {
//       // Fallback to localStorage
//       const localUserData = localStorage.getItem('userData');
//       if (localUserData) {
//         try {
//           const parsedUserData = JSON.parse(localUserData);
//           currentUserId = parsedUserData.userId;
//         } catch (error) {
//           console.error('Error parsing localStorage userData:', error);
//         }
//       }
//     }

//     if (!currentUserId) {
//       toast.error('User authentication error. Please log in again.');
//       setPublishing(false);
//       return;
//     }

//     // Prepare the election payload
//     const electionPayload = {
//       election: {
//         title: data.title,
//         description: data.description,
//         start_date: data.start_date,
//         start_time: data.start_time,
//         end_date: data.end_date,
//         end_time: data.end_time,
//         timezone: data.timezone,
//         topic_video_url: data.topic_video_url || null,
//         // Map permission_type to match database constraint
//         permission_type: data.permission_type === 'specific_countries' 
//           ? 'country_specific' 
//           : data.permission_type === 'country_specific'
//           ? 'country_specific'
//           : data.permission_type || 'public',
//         allowed_countries: data.allowed_countries || [],
//         // Map pricing_type to match database constraint
//         pricing_type: data.pricing_type === 'paid_regional' 
//           ? 'regional_fee' 
//           : data.pricing_type === 'general_fee'
//           ? 'general_fee'
//           : 'free',
//         general_participation_fee: parseFloat(data.general_participation_fee) || 0,
//         biometric_required: data.biometric_required || false,
//         show_live_results: data.show_live_results || false,
//         vote_editing_allowed: data.vote_editing_allowed || false,
//         voting_type: data.voting_type || 'plurality',
//         authentication_methods: data.auth_method ? [data.auth_method] : (data.authentication_methods || ['passkey']),
//         slug: data.election_slug,
//         creator_id: currentUserId,
//         creator_type: data.creator_type || currentCreatorType,
//         status: 'published',
//         category_id: data.category_id
//       },
      
//       questions: data.questions.map((q, idx) => ({
//         question_text: q.question_text,
//         question_type: q.type === 'mcq' ? 'multiple_choice' : q.type === 'text' ? 'open_text' : q.type === 'image' ? 'image_based' : 'comparison',
//         question_order: idx + 1,
//         is_required: q.required !== undefined ? q.required : true,
//         options: (q.answers || []).filter(a => a?.trim()).map((a, i) => ({
//           option_text: a,
//           option_order: i + 1
//         }))
//       }))
//     };

//     // Add regional pricing if applicable
//     if (data.pricing_type === 'paid_regional' && data.regional_fees) {
//       // Map region codes to match database constraint
//       const regionCodeMap = {
//         'north_america': 'region_1_us_canada',
//         'us_canada': 'region_1_us_canada',
//         'western_europe': 'region_2_western_europe',
//         'eastern_europe': 'region_3_eastern_europe',
//         'africa': 'region_4_africa',
//         'latin_america': 'region_5_latin_america',
//         'middle_east': 'region_6_middle_east_asia',
//         'middle_east_asia': 'region_6_middle_east_asia',
//         'asia': 'region_6_middle_east_asia',
//         'australia_nz': 'region_7_australasia',
//         'australasia': 'region_7_australasia',
//         'china': 'region_8_china'
//       };

//       electionPayload.regional_pricing = Object.entries(data.regional_fees).map(([region, fee]) => ({
//         region_code: regionCodeMap[region] || region, // Use mapped code or fallback to original
//         region_name: region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//         participation_fee: parseFloat(fee),
//         currency: 'USD'
//       }));
//     }

//     // Add lottery configuration if enabled
//     if (data.lottery_enabled && data.lottery_config) {
//       const lotteryConfig = {
//         is_lotterized: true,
//         winner_count: parseInt(data.lottery_config.winner_count) || 1,
//         prize_funding_source: data.lottery_config.prize_funding_source || 'creator_funded'
//       };

//       if (data.lottery_config.reward_type === 'monetary') {
//         lotteryConfig.reward_type = 'monetary';
//         lotteryConfig.reward_amount = parseFloat(data.lottery_config.total_prize_pool) || 0;
//         lotteryConfig.prize_description = `Cash prize of $${lotteryConfig.reward_amount.toLocaleString()}`;
//       } else if (data.lottery_config.reward_type === 'non_monetary') {
//         lotteryConfig.reward_type = 'non_monetary';
//         lotteryConfig.reward_amount = parseFloat(data.lottery_config.estimated_value) || 0;
//         lotteryConfig.prize_description = data.lottery_config.prize_description || 'Non-monetary prize';
//       } else if (data.lottery_config.reward_type === 'projected_revenue') {
//         lotteryConfig.reward_type = 'projected_revenue';
//         lotteryConfig.projected_revenue = parseFloat(data.lottery_config.projected_revenue) || 0;
//         lotteryConfig.revenue_share_percentage = parseFloat(data.lottery_config.revenue_share_percentage) || 0;
//         lotteryConfig.reward_amount = (lotteryConfig.projected_revenue * lotteryConfig.revenue_share_percentage) / 100;
//         lotteryConfig.prize_description = `${lotteryConfig.revenue_share_percentage}% of $${lotteryConfig.projected_revenue.toLocaleString()} projected revenue`;
//       }

//       electionPayload.lottery_config = lotteryConfig;
//     }

//     // Create FormData for file upload
//     const formData = new FormData();
    
//     // Add files if they exist
//     if (data.topic_image instanceof File) {
//       formData.append('topic_image', data.topic_image);
//     }
//     if (data.topic_video instanceof File) {
//       formData.append('topic_video', data.topic_video);
//     }
//     if (data.logo instanceof File) {
//       formData.append('logo', data.logo);
//     }

//     // Append the election data as JSON string
//     formData.append('electionData', JSON.stringify(electionPayload));

//     console.log('Publishing election with payload:', electionPayload);

//     const response = await publishElection(electionId, formData);
    
//     if (response.success) {
//       toast.success('🎉 Election published successfully!');
//       setTimeout(() => onPublish(), 2000);
//     } else {
//       toast.error(response.message || 'Failed to publish election');
//     }
//   } catch (error) {
//     console.error('Publish error:', error);
//     toast.error(error.response?.data?.message || 'Failed to publish election');
//   } finally {
//     setPublishing(false);
//   }
// };



//   const duration = calculateDuration();
//   const votingMethod = getVotingMethodDetails();
//   const authMethod = getAuthMethodDetails();
//   const categoryInfo = getCategoryDetails();
//   const lotteryPrize = getLotteryPrizeDisplay();
//   const totalQuestions = data?.questions?.length || 0;
//   const totalOptions = data?.questions?.reduce((sum, q) => sum + ((q.answers || []).filter(a => a?.trim()).length || 0), 0) || 0;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-2">Election Preview</h2>
//         <p className="text-gray-600">Review all settings before publishing your election.</p>
//       </div>

//       {/* Main Election Card */}
//       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
//         <div className="flex items-start gap-6">
//           {/* Logo */}
//           {data?.logo && (
//             <div className="flex-shrink-0">
//               <img
//                 src={typeof data.logo === 'string' ? data.logo : URL.createObjectURL(data.logo)}
//                 alt="Logo"
//                 className="w-24 h-24 rounded-xl object-contain bg-white p-2 border-2 border-blue-300 shadow-md"
//               />
//             </div>
//           )}

//           {/* Election Info */}
//           <div className="flex-1">
//             <h1 className="text-3xl font-bold text-gray-900 mb-3">{data?.title || 'Untitled Election'}</h1>
            
//             {/* URL */}
//             <div className="flex items-center gap-2 mb-4 text-blue-600 font-mono text-sm bg-white px-4 py-2 rounded-lg border border-blue-200">
//               <FaGlobe />
//               <span>vottery.com/vote/{data?.election_slug || 'your-slug'}</span>
//             </div>

//             <p className="text-gray-700 leading-relaxed">{data?.description || 'No description'}</p>

//             {/* Cover Image */}
//             {data?.topic_image && (
//               <div className="mt-4">
//                 <img
//                   src={typeof data.topic_image === 'string' ? data.topic_image : URL.createObjectURL(data.topic_image)}
//                   alt="Cover"
//                   className="w-full h-48 object-cover rounded-xl border-2 border-blue-200 shadow-md"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t-2 border-blue-200">
//           <div className="bg-white rounded-xl p-4 text-center shadow-sm">
//             <div className="text-3xl font-bold text-blue-600">{duration.days}</div>
//             <div className="text-sm text-gray-600">Days</div>
//           </div>
//           <div className="bg-white rounded-xl p-4 text-center shadow-sm">
//             <div className="text-3xl font-bold text-purple-600">{totalQuestions}</div>
//             <div className="text-sm text-gray-600">Questions</div>
//           </div>
//           <div className="bg-white rounded-xl p-4 text-center shadow-sm">
//             <div className="text-3xl font-bold text-orange-600">{totalOptions}</div>
//             <div className="text-sm text-gray-600">Options</div>
//           </div>
//           <div className="bg-white rounded-xl p-4 text-center shadow-sm">
//             <div className="text-3xl font-bold text-green-600">
//               {data?.pricing_type === 'free' ? 'FREE' : '$$$'}
//             </div>
//             <div className="text-sm text-gray-600">Pricing</div>
//           </div>
//         </div>
//       </div>

//       {/* Category Display */}
//       {categoryInfo && (
//         <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//           <div className="p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-3">
//                 <div className="bg-purple-100 p-3 rounded-lg">
//                   <FaTags className="text-purple-600 text-xl" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="font-bold text-gray-900 text-lg">Category</h3>
//                   <p className="text-sm text-gray-600">Election category classification</p>
//                 </div>
//               </div>
//               <FaCheckCircle className="text-green-500 text-xl" />
//             </div>
//             <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200 text-center">
//               <div className="text-5xl mb-3">{categoryInfo.icon}</div>
//               <div className="font-bold text-gray-900 text-2xl">{categoryInfo.name}</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Schedule Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('schedule')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-green-100 p-3 rounded-lg">
//               <FaCalendarAlt className="text-green-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Schedule</h3>
//               <p className="text-sm text-gray-600">{duration.text}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-green-500 text-xl" />
//             {expandedSections.schedule ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.schedule && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             <div className="grid md:grid-cols-2 gap-4 mt-4">
//               <div className="bg-white rounded-lg p-4 border border-gray-200">
//                 <div className="text-sm text-gray-600 mb-1">Start</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.start_date && data?.start_time 
//                     ? new Date(`${data.start_date}T${data.start_time}`).toLocaleString('en-US', {
//                         month: 'long',
//                         day: 'numeric',
//                         year: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })
//                     : 'Not set'}
//                 </div>
//               </div>
//               <div className="bg-white rounded-lg p-4 border border-gray-200">
//                 <div className="text-sm text-gray-600 mb-1">End</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.end_date && data?.end_time
//                     ? new Date(`${data.end_date}T${data.end_time}`).toLocaleString('en-US', {
//                         month: 'long',
//                         day: 'numeric',
//                         year: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })
//                     : 'Not set'}
//                 </div>
//               </div>
//               <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
//                 <div className="text-sm text-gray-600 mb-1">Timezone</div>
//                 <div className="font-semibold text-gray-900">{data?.timezone || 'Not set'}</div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Access Control Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('access')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-purple-100 p-3 rounded-lg">
//               <FaUsers className="text-purple-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Access Control</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.permission_type === 'public' ? 'World Citizens' : `${data?.allowed_countries?.length || 0} Countries`}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-green-500 text-xl" />
//             {expandedSections.access ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.access && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             <div className="mt-4 space-y-4">
//               <div className="bg-white rounded-lg p-4 border border-gray-200">
//                 <div className="flex items-center gap-3 mb-2">
//                   {data?.permission_type === 'public' ? (
//                     <FaGlobe className="text-green-600 text-2xl" />
//                   ) : (
//                     <FaFlag className="text-blue-600 text-2xl" />
//                   )}
//                   <div>
//                     <div className="font-bold text-gray-900">
//                       {data?.permission_type === 'public' ? 'Public Election' : 'Country Specific'}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       {data?.permission_type === 'public' 
//                         ? 'Anyone from anywhere can participate'
//                         : 'Only selected countries can participate'}
//                     </div>
//                   </div>
//                 </div>

//                 {data?.permission_type === 'specific_countries' && data?.allowed_countries?.length > 0 && (
//                   <div className="mt-3 pt-3 border-t border-gray-200">
//                     <div className="font-semibold text-gray-700 mb-2">Allowed Countries:</div>
//                     <div className="flex flex-wrap gap-2">
//                       {data.allowed_countries.map((country, idx) => (
//                         <span
//                           key={idx}
//                           className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
//                         >
//                           {country}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Authentication Method Card */}
//               <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-5 border-2 border-orange-300 shadow-md">
//                 <div className="flex items-center gap-4">
//                   <div className="flex-shrink-0">
//                     {authMethod.icon}
//                   </div>
//                   <div className="flex-1">
//                     <div className="text-sm text-orange-600 font-semibold mb-1">Authentication Method</div>
//                     <div className="font-bold text-gray-900 text-xl">{authMethod.name}</div>
//                     <div className="text-sm text-gray-600 mt-1">{authMethod.desc}</div>
//                   </div>
//                 </div>
//               </div>

//               {data?.biometric_required && (
//                 <div className="bg-white rounded-lg p-4 border border-gray-200">
//                   <div className="flex items-center gap-3">
//                     <FaFingerprint className="text-blue-600 text-2xl" />
//                     <div>
//                       <div className="font-bold text-gray-900">Biometric Required</div>
//                       <div className="text-sm text-gray-600">Voters must verify with biometrics</div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Voting Method Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('voting')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <FaVoteYea className="text-blue-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Voting Method</h3>
//               <p className="text-sm text-gray-600">{votingMethod.name}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-green-500 text-xl" />
//             {expandedSections.voting ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.voting && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             <div className="mt-4">
//               <div className="bg-white rounded-lg p-5 border-2 border-blue-200 mb-4">
//                 <div className="flex items-center gap-3">
//                   <span className="text-4xl">{votingMethod.icon}</span>
//                   <div>
//                     <div className="font-bold text-gray-900 text-lg">{votingMethod.name}</div>
//                     <div className="text-gray-600">{votingMethod.desc}</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="bg-white rounded-lg p-4 border border-gray-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     {data?.show_live_results ? (
//                       <FaEye className="text-green-600" />
//                     ) : (
//                       <FaEyeSlash className="text-gray-400" />
//                     )}
//                     <span className="font-semibold text-gray-900">Live Results</span>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     {data?.show_live_results ? 'Enabled - Voters can see results' : 'Disabled - Results hidden until end'}
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg p-4 border border-gray-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaLock className={data?.vote_editing_allowed ? 'text-green-600' : 'text-gray-400'} />
//                     <span className="font-semibold text-gray-900">Vote Editing</span>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     {data?.vote_editing_allowed ? 'Allowed - Voters can change votes' : 'Not allowed - Votes are final'}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Pricing Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('pricing')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-green-100 p-3 rounded-lg">
//               <FaDollarSign className="text-green-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Financial Settings</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.pricing_type === 'free' ? 'Free' : 
//                  data?.pricing_type === 'paid_general' ? 'General Fee' : 'Regional Pricing'}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-green-500 text-xl" />
//             {expandedSections.pricing ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.pricing && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             <div className="mt-4">
//               {data?.pricing_type === 'free' ? (
//                 <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200 text-center">
//                   <div className="text-5xl mb-3">🆓</div>
//                   <div className="font-bold text-gray-900 text-xl">Free Election</div>
//                   <div className="text-gray-600">No participation fee required</div>
//                 </div>
//               ) : data?.pricing_type === 'paid_general' ? (
//                 <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200 text-center">
//                   <div className="text-5xl mb-3">💳</div>
//                   <div className="font-bold text-gray-900 text-xl mb-2">General Fee</div>
//                   <div className="text-4xl font-bold text-blue-600">
//                     ${parseFloat(data.general_participation_fee || 0).toFixed(2)}
//                   </div>
//                   <div className="text-gray-600 mt-2">Per participant</div>
//                 </div>
//               ) : (
//                 <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
//                   <div className="text-center mb-4">
//                     <div className="text-5xl mb-3">🌍</div>
//                     <div className="font-bold text-gray-900 text-xl">Regional Pricing</div>
//                     <div className="text-gray-600">Different fees by region</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 mt-4">
//                     <table className="w-full">
//                       <thead className="border-b-2 border-indigo-200">
//                         <tr>
//                           <th className="text-left py-2 font-bold text-gray-800">Region</th>
//                           <th className="text-right py-2 font-bold text-gray-800">Fee</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {data?.regional_fees && Object.entries(data.regional_fees).map(([region, fee]) => (
//                           <tr key={region} className="border-b border-gray-200">
//                             <td className="py-2 text-gray-700 capitalize">{region.replace(/_/g, ' ')}</td>
//                             <td className="py-2 text-right font-semibold text-gray-900">${parseFloat(fee).toFixed(2)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Lottery Section */}
//       {data?.lottery_enabled && lotteryPrize && (
//         <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection('lottery')}
//             className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//           >
//             <div className="flex items-center gap-3">
//               <div className="bg-yellow-100 p-3 rounded-lg">
//                 <FaGift className="text-yellow-600 text-xl" />
//               </div>
//               <div className="text-left">
//                 <h3 className="font-bold text-gray-900 text-lg">Lottery Enabled</h3>
//                 <p className="text-sm text-gray-600">
//                   {data?.lottery_config?.winner_count || 1} winner(s) - {lotteryPrize.type}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <FaCheckCircle className="text-green-500 text-xl" />
//               {expandedSections.lottery ? <FaChevronUp /> : <FaChevronDown />}
//             </div>
//           </button>

//           {expandedSections.lottery && (
//             <div className="px-6 pb-6 border-t border-gray-200 bg-yellow-50">
//               <div className="mt-4">
//                 {/* Prize Type Banner */}
//                 <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border-2 border-yellow-300 mb-4">
//                   <div className="flex items-center gap-4">
//                     <span className="text-6xl">{lotteryPrize.icon}</span>
//                     <div className="flex-1">
//                       <div className="font-bold text-gray-900 text-2xl mb-1">{lotteryPrize.type}</div>
//                       <div className="text-3xl font-bold text-orange-600 mb-2">{lotteryPrize.amount}</div>
//                       <div className="text-gray-700">{lotteryPrize.description}</div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Lottery Stats */}
//                 <div className="grid md:grid-cols-3 gap-4">
//                   <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 text-center">
//                     <div className="text-sm text-gray-600 mb-1">Funding Source</div>
//                     <div className="font-bold text-gray-900 capitalize">
//                       {data?.lottery_config?.prize_funding_source?.replace('_', ' ') || 'Creator Funded'}
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 text-center">
//                     <div className="text-sm text-gray-600 mb-1">Total Winners</div>
//                     <div className="text-3xl font-bold text-purple-600">
//                       {data?.lottery_config?.winner_count || 1}
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 text-center">
//                     <div className="text-sm text-gray-600 mb-1">Per Winner</div>
//                     <div className="text-2xl font-bold text-green-600">
//                       {lotteryPrize.value 
//                         ? `$${(lotteryPrize.value / (data?.lottery_config?.winner_count || 1)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
//                         : lotteryPrize.amount}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Questions Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('questions')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-purple-100 p-3 rounded-lg">
//               <FaQuestionCircle className="text-purple-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Questions & Answers</h3>
//               <p className="text-sm text-gray-600">{totalQuestions} questions, {totalOptions} total options</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {totalQuestions > 0 ? (
//               <FaCheckCircle className="text-green-500 text-xl" />
//             ) : (
//               <FaExclamationTriangle className="text-red-500 text-xl" />
//             )}
//             {expandedSections.questions ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.questions && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             {totalQuestions === 0 ? (
//               <div className="mt-4 bg-red-50 rounded-lg p-6 border-2 border-red-200 text-center">
//                 <FaExclamationTriangle className="text-red-600 text-4xl mx-auto mb-3" />
//                 <div className="font-bold text-red-900 mb-2">No Questions Added</div>
//                 <div className="text-red-700">Please go back and add at least one question</div>
//               </div>
//             ) : (
//               <div className="mt-4 space-y-3">
//                 {data?.questions?.map((question, idx) => (
//                   <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
//                     <div className="flex items-start gap-3">
//                       <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
//                         {idx + 1}
//                       </div>
//                       <div className="flex-1">
//                         <div className="font-semibold text-gray-900 mb-2">{question.question_text}</div>
//                         <div className="flex items-center gap-2 mb-2">
//                           <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">
//                             {question.type === 'mcq' ? 'Multiple Choice' : 'Open Text'}
//                           </span>
//                           {question.required && (
//                             <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
//                               Required
//                             </span>
//                           )}
//                         </div>
//                         {question.type === 'mcq' && question.answers?.filter(a => a?.trim()).length > 0 && (
//                           <div className="space-y-1 mt-3">
//                             {question.answers.filter(a => a?.trim()).map((answer, ansIdx) => (
//                               <div key={ansIdx} className="flex items-center gap-2 text-sm text-gray-700">
//                                 <span className="font-semibold text-gray-500">{String.fromCharCode(65 + ansIdx)}.</span>
//                                 <span>{answer}</span>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Branding Section */}
//       {(data?.logo || data?.primary_color || data?.secondary_color) && (
//         <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection('branding')}
//             className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//           >
//             <div className="flex items-center gap-3">
//               <div className="bg-pink-100 p-3 rounded-lg">
//                 <FaPalette className="text-pink-600 text-xl" />
//               </div>
//               <div className="text-left">
//                 <h3 className="font-bold text-gray-900 text-lg">Branding</h3>
//                 <p className="text-sm text-gray-600">Custom colors and logo</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <FaCheckCircle className="text-green-500 text-xl" />
//               {expandedSections.branding ? <FaChevronUp /> : <FaChevronDown />}
//             </div>
//           </button>

//           {expandedSections.branding && (
//             <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//               <div className="mt-4 flex items-center gap-6">
//                 {data?.logo && (
//                   <img
//                     src={typeof data.logo === 'string' ? data.logo : URL.createObjectURL(data.logo)}
//                     alt="Logo"
//                     className="w-32 h-32 object-contain bg-white rounded-lg border-2 border-gray-200 p-2"
//                   />
//                 )}
//                 {(data?.primary_color || data?.secondary_color) && (
//                   <div className="flex gap-4">
//                     {data?.primary_color && (
//                       <div>
//                         <div className="text-sm text-gray-600 mb-2">Primary Color</div>
//                         <div 
//                           className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
//                           style={{ backgroundColor: data.primary_color }}
//                         ></div>
//                         <div className="text-xs text-gray-500 mt-1">{data.primary_color}</div>
//                       </div>
//                     )}
//                     {data?.secondary_color && (
//                       <div>
//                         <div className="text-sm text-gray-600 mb-2">Secondary Color</div>
//                         <div 
//                           className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
//                           style={{ backgroundColor: data.secondary_color }}
//                         ></div>
//                         <div className="text-xs text-gray-500 mt-1">{data.secondary_color}</div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Ready to Publish */}
//       {totalQuestions > 0 ? (
//         <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 flex items-start gap-4">
//           <FaCheckCircle className="text-green-600 text-3xl flex-shrink-0" />
//           <div>
//             <h4 className="font-bold text-green-900 text-xl mb-2">Election Ready to Publish!</h4>
//             <p className="text-green-700">
//               Your election is properly configured and ready to be published. Click &quot;Publish Election&quot; to make it live.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 flex items-start gap-4">
//           <FaExclamationTriangle className="text-red-600 text-3xl flex-shrink-0" />
//           <div>
//             <h4 className="font-bold text-red-900 text-xl mb-2">Cannot Publish Yet</h4>
//             <p className="text-red-700">Please add at least one question before publishing your election.</p>
//           </div>
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
//         <button
//           onClick={onBack}
//           className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold text-lg transition-all"
//         >
//           ← Previous
//         </button>

//         <div className="flex gap-4">
//           <button
//             onClick={handleSaveDraft}
//             disabled={loading}
//             className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all flex items-center gap-2 ${
//               loading
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
//             }`}
//           >
//             <FaSave />
//             {loading ? 'Saving...' : 'Save Draft'}
//           </button>

//           <button
//             onClick={handlePublish}
//             disabled={publishing || totalQuestions === 0}
//             className={`px-10 py-3 rounded-xl font-bold text-lg transition-all flex items-center gap-3 ${
//               publishing || totalQuestions === 0
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
//             }`}
//           >
//             <FaRocket />
//             {publishing ? 'Publishing...' : 'Publish Election'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/election/ElectionWizard/Step4Preview.jsx
// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import {
//   FaCheckCircle,
//   FaCalendarAlt,
//   FaUsers,
//   FaDollarSign,
//   FaLock,
//   FaGift,
//   FaVoteYea,
//   FaQuestionCircle,
//   FaEye,
//   FaEyeSlash,
//   FaPalette,
//   FaRocket,
//   FaSave,
//   FaExclamationTriangle,
//   FaChevronDown,
//   FaChevronUp,
//   FaGlobe,
//   FaFlag,
//   FaFingerprint,
//   FaKey,
//   FaLink,
//   FaTags
// } from 'react-icons/fa';
// import { publishElection, updateDraft } from '../../../../../redux/api/election/electionApi';

// export default function Step4Preview({ data, onBack, onPublish, electionId }) {
//   const [loading, setLoading] = useState(false);
//   const [publishing, setPublishing] = useState(false);
//   const [expandedSections, setExpandedSections] = useState({
//     basic: true,
//     schedule: true,
//     access: true,
//     pricing: true,
//     lottery: true,
//     voting: true,
//     questions: true,
//     branding: true
//   });
  
//   const userData = useSelector((state) => state.auth.userData);

//   // Debug effect to log all data when component mounts
//   useEffect(() => {
//     console.log('=== STEP 4 COMPLETE DATA ===');
//     console.log('Full data object:', data);
//     console.log('Authentication Methods:', data?.authentication_methods);
//     console.log('Selected Auth Method:', data?.authentication_methods?.[0]);
//     console.log('Category ID:', data?.category_id);
//     console.log('Lottery Config:', data?.lottery_config);
//     console.log('Lottery Enabled:', data?.lottery_enabled);
//     console.log('Estimated Value:', data?.lottery_config?.estimated_value);
//     console.log('Prize Description:', data?.lottery_config?.prize_description);
//     console.log('===========================');
//   }, [data]);

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
//   };

//   // Calculate duration
//   const calculateDuration = () => {
//     if (!data?.start_date || !data?.start_time || !data?.end_date || !data?.end_time) {
//       return { days: 0, hours: 0, minutes: 0, text: 'Not set' };
//     }
    
//     try {
//       const start = new Date(`${data.start_date}T${data.start_time}`);
//       const end = new Date(`${data.end_date}T${data.end_time}`);
//       const diffTime = Math.abs(end - start);
//       const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//       const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
//       return { 
//         days, 
//         hours, 
//         minutes, 
//         text: `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
//       };
//       /*eslint-disable*/
//     } catch (error) {
//       return { days: 0, hours: 0, minutes: 0, text: 'Invalid date' };
//     }
//   };

//   // Get voting method details
//   const getVotingMethodDetails = () => {
//     const methods = {
//       'plurality': { name: 'Plurality Voting', icon: '📊', desc: 'Single choice voting' },
//       'ranked_choice': { name: 'Ranked Choice Voting', icon: '📈', desc: 'Rank candidates by preference' },
//       'approval': { name: 'Approval Voting', icon: '✅', desc: 'Approve multiple choices' }
//     };
//     const votingType = data?.voting_type || 'plurality';
//     return methods[votingType] || methods['plurality'];
//   };

//   // Get auth method details - FIXED to check multiple possible keys

//   // Get auth method details - FIXED to check the correct field
// const getAuthMethodDetails = () => {
//   // Step3 saves to 'auth_method', so check that first
//   const selectedMethod = 
//     data?.auth_method ||                    // ✅ Check auth_method FIRST (from Step3)
//     data?.authentication_methods?.[0] ||    // Fallback to authentication_methods
//     'passkey';
  
//   console.log('Getting auth method, found:', selectedMethod);
  
//   const methods = {
//     'passkey': { 
//       name: 'Passkey Authentication', 
//       icon: <FaFingerprint className="text-blue-600 text-2xl" />,
//       desc: 'Biometric authentication using device passkey'
//     },
//     'oauth': { 
//       name: 'OAuth (Social Login)', 
//       icon: <FaGlobe className="text-purple-600 text-2xl" />,
//       desc: 'Login with Google, Facebook, or other providers'
//     },
//     'magic_link': { 
//       name: 'Magic Link', 
//       icon: <FaLink className="text-orange-600 text-2xl" />,
//       desc: 'Email link authentication without password'
//     },
//     'email_password': { 
//       name: 'Email & Password', 
//       icon: <FaKey className="text-gray-600 text-2xl" />,
//       desc: 'Traditional email and password login'
//     }
//   };
  
//   return methods[selectedMethod] || methods['passkey'];
// };


//   // Get category details
//   const getCategoryDetails = () => {
//     const categories = {
//       1: { name: 'Politics', icon: '🏛️' },
//       2: { name: 'Sports', icon: '⚽' },
//       3: { name: 'Entertainment', icon: '🎬' },
//       4: { name: 'Education', icon: '📚' },
//       5: { name: 'Business', icon: '💼' },
//       6: { name: 'Community', icon: '🏘️' },
//       7: { name: 'Technology', icon: '💻' },
//       8: { name: 'Health', icon: '🏥' }
//     };
//     return categories[data?.category_id] || null;
//   };

//   // Get lottery prize display - FIXED to use the exact value
//   const getLotteryPrizeDisplay = () => {
//     if (!data?.lottery_enabled || !data?.lottery_config) {
//       return null;
//     }

//     const config = data.lottery_config;
//     console.log('Lottery config in display function:', config);
    
//     // Monetary Prize
//     if (config.reward_type === 'monetary') {
//       const amount = parseFloat(config.total_prize_pool || 0);
//       return {
//         type: 'Monetary Prize',
//         icon: '💵',
//         amount: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
//         description: 'Cash prize',
//         value: amount
//       };
//     }
    
//     // Non-Monetary Prize - FIXED
//     if (config.reward_type === 'non_monetary') {
//       const estimatedValue = parseFloat(config.estimated_value || 0);
//       console.log('Non-monetary estimated value:', estimatedValue);
      
//       return {
//         type: 'Non-Monetary Prize',
//         icon: '🎁',
//         amount: config.prize_description || 'Prize package',
//         description: `Estimated value: $${estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
//         value: estimatedValue
//       };
//     }
    
//     // Projected Revenue
//     if (config.reward_type === 'projected_revenue') {
//       const prizePool = (config.projected_revenue || 0) * ((config.revenue_share_percentage || 0) / 100);
//       return {
//         type: 'Revenue Share Prize',
//         icon: '📈',
//         amount: `$${prizePool.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
//         description: `${config.revenue_share_percentage}% of $${config.projected_revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} projected revenue`,
//         value: prizePool
//       };
//     }

//     return null;
//   };

//   // Save draft
//   const handleSaveDraft = async () => {
//     if (!electionId) {
//       toast.error('No draft ID found');
//       return;
//     }

//     setLoading(true);
//     try {
//       const draftData = {
//         title: data.title,
//         description: data.description,
//         draft_data: { ...data, current_step: 4 }
//       };

//       const files = {};
//       if (data.topic_image instanceof File) files.topic_image = data.topic_image;
//       if (data.topic_video instanceof File) files.topic_video = data.topic_video;
//       if (data.logo instanceof File) files.logo = data.logo;

//       const response = await updateDraft(electionId, draftData, files);
//       if (response.success) {
//         toast.success('Draft saved successfully!');
//       }
//     } catch (error) {
//       console.error('Save error:', error);
//       toast.error('Failed to save draft');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Publish election
//   const handlePublish = async () => {
//     if (!data.questions || data.questions.length === 0) {
//       toast.error('Please add at least one question');
//       return;
//     }

//     const confirmed = window.confirm(
//       '🚀 Ready to publish your election?\n\nOnce published, your election will be live and voters can start participating.\n\nAre you sure you want to continue?'
//     );
//     if (!confirmed) return;

//     setPublishing(true);
//     try {
//       const publishData = {
//         election: {
//           title: data.title,
//           description: data.description,
//           start_date: data.start_date,
//           start_time: data.start_time,
//           end_date: data.end_date,
//           end_time: data.end_time,
//           timezone: data.timezone,
//           topic_video_url: data.topic_video_url || null,
//           permission_type: data.permission_type || 'public',
//           allowed_countries: data.allowed_countries || [],
//           pricing_type: data.pricing_type || 'free',
//           general_participation_fee: data.general_participation_fee || 0,
//           biometric_required: data.biometric_required || false,
//           show_live_results: data.show_live_results || false,
//           vote_editing_allowed: data.vote_editing_allowed || false,
//           voting_type: data.voting_type || 'plurality',
//           authentication_methods: data.authentication_methods || ['passkey'],
//           slug: data.election_slug,
//           creator_id: userData.userId,
//           status: 'published',
//         },
//         questions: data.questions.map((q, idx) => ({
//           question_text: q.question_text,
//           question_type: q.type === 'mcq' ? 'multiple_choice' : 'open_text',
//           question_order: idx + 1,
//           is_required: q.required !== undefined ? q.required : true,
//           options: (q.answers || []).filter(a => a?.trim()).map((a, i) => ({
//             option_text: a,
//             option_order: i + 1
//           }))
//         })),
//         category_id: data.category_id,
//       };

//       if (data.pricing_type === 'paid_regional' && data.regional_fees) {
//         publishData.regional_pricing = Object.entries(data.regional_fees).map(([region, fee]) => ({
//           region_code: region,
//           region_name: region.replace(/_/g, ' '),
//           participation_fee: parseFloat(fee),
//           currency: 'USD'
//         }));
//       }

//       if (data.lottery_enabled && data.lottery_config) {
//         publishData.lottery_config = {
//           is_lotterized: true,
//           winner_count: data.lottery_config.winner_count || 1,
//           reward_type: data.lottery_config.reward_type || 'monetary',
//           reward_amount: data.lottery_config.total_prize_pool || data.lottery_config.estimated_value || 0,
//           prize_description: data.lottery_config.prize_description || null,
//         };
//       }

//       const response = await publishElection(electionId, publishData);
//       if (response.success) {
//         toast.success('🎉 Election published successfully!');
//         setTimeout(() => onPublish(), 2000);
//       }
//     } catch (error) {
//       console.error('Publish error:', error);
//       toast.error('Failed to publish election');
//     } finally {
//       setPublishing(false);
//     }
//   };

//   const duration = calculateDuration();
//   const votingMethod = getVotingMethodDetails();
//   const authMethod = getAuthMethodDetails();
//   const categoryInfo = getCategoryDetails();
//   const lotteryPrize = getLotteryPrizeDisplay();
//   const totalQuestions = data?.questions?.length || 0;
//   const totalOptions = data?.questions?.reduce((sum, q) => sum + ((q.answers || []).filter(a => a?.trim()).length || 0), 0) || 0;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-2">Election Preview</h2>
//         <p className="text-gray-600">Review all settings before publishing your election.</p>
//       </div>

//       {/* Main Election Card */}
//       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
//         <div className="flex items-start gap-6">
//           {/* Logo */}
//           {data?.logo && (
//             <div className="flex-shrink-0">
//               <img
//                 src={typeof data.logo === 'string' ? data.logo : URL.createObjectURL(data.logo)}
//                 alt="Logo"
//                 className="w-24 h-24 rounded-xl object-contain bg-white p-2 border-2 border-blue-300 shadow-md"
//               />
//             </div>
//           )}

//           {/* Election Info */}
//           <div className="flex-1">
//             <h1 className="text-3xl font-bold text-gray-900 mb-3">{data?.title || 'Untitled Election'}</h1>
            
//             {/* URL */}
//             <div className="flex items-center gap-2 mb-4 text-blue-600 font-mono text-sm bg-white px-4 py-2 rounded-lg border border-blue-200">
//               <FaGlobe />
//               <span>vottery.com/vote/{data?.election_slug || 'your-slug'}</span>
//             </div>

//             <p className="text-gray-700 leading-relaxed">{data?.description || 'No description'}</p>

//             {/* Cover Image */}
//             {data?.topic_image && (
//               <div className="mt-4">
//                 <img
//                   src={typeof data.topic_image === 'string' ? data.topic_image : URL.createObjectURL(data.topic_image)}
//                   alt="Cover"
//                   className="w-full h-48 object-cover rounded-xl border-2 border-blue-200 shadow-md"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t-2 border-blue-200">
//           <div className="bg-white rounded-xl p-4 text-center shadow-sm">
//             <div className="text-3xl font-bold text-blue-600">{duration.days}</div>
//             <div className="text-sm text-gray-600">Days</div>
//           </div>
//           <div className="bg-white rounded-xl p-4 text-center shadow-sm">
//             <div className="text-3xl font-bold text-purple-600">{totalQuestions}</div>
//             <div className="text-sm text-gray-600">Questions</div>
//           </div>
//           <div className="bg-white rounded-xl p-4 text-center shadow-sm">
//             <div className="text-3xl font-bold text-orange-600">{totalOptions}</div>
//             <div className="text-sm text-gray-600">Options</div>
//           </div>
//           <div className="bg-white rounded-xl p-4 text-center shadow-sm">
//             <div className="text-3xl font-bold text-green-600">
//               {data?.pricing_type === 'free' ? 'FREE' : '$$$'}
//             </div>
//             <div className="text-sm text-gray-600">Pricing</div>
//           </div>
//         </div>
//       </div>

//       {/* Category Display */}
//       {categoryInfo && (
//         <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//           <div className="p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-3">
//                 <div className="bg-purple-100 p-3 rounded-lg">
//                   <FaTags className="text-purple-600 text-xl" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="font-bold text-gray-900 text-lg">Category</h3>
//                   <p className="text-sm text-gray-600">Election category classification</p>
//                 </div>
//               </div>
//               <FaCheckCircle className="text-green-500 text-xl" />
//             </div>
//             <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200 text-center">
//               <div className="text-5xl mb-3">{categoryInfo.icon}</div>
//               <div className="font-bold text-gray-900 text-2xl">{categoryInfo.name}</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Schedule Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('schedule')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-green-100 p-3 rounded-lg">
//               <FaCalendarAlt className="text-green-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Schedule</h3>
//               <p className="text-sm text-gray-600">{duration.text}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-green-500 text-xl" />
//             {expandedSections.schedule ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.schedule && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             <div className="grid md:grid-cols-2 gap-4 mt-4">
//               <div className="bg-white rounded-lg p-4 border border-gray-200">
//                 <div className="text-sm text-gray-600 mb-1">Start</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.start_date && data?.start_time 
//                     ? new Date(`${data.start_date}T${data.start_time}`).toLocaleString('en-US', {
//                         month: 'long',
//                         day: 'numeric',
//                         year: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })
//                     : 'Not set'}
//                 </div>
//               </div>
//               <div className="bg-white rounded-lg p-4 border border-gray-200">
//                 <div className="text-sm text-gray-600 mb-1">End</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.end_date && data?.end_time
//                     ? new Date(`${data.end_date}T${data.end_time}`).toLocaleString('en-US', {
//                         month: 'long',
//                         day: 'numeric',
//                         year: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })
//                     : 'Not set'}
//                 </div>
//               </div>
//               <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
//                 <div className="text-sm text-gray-600 mb-1">Timezone</div>
//                 <div className="font-semibold text-gray-900">{data?.timezone || 'Not set'}</div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Access Control Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('access')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-purple-100 p-3 rounded-lg">
//               <FaUsers className="text-purple-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Access Control</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.permission_type === 'public' ? 'World Citizens' : `${data?.allowed_countries?.length || 0} Countries`}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-green-500 text-xl" />
//             {expandedSections.access ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.access && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             <div className="mt-4 space-y-4">
//               <div className="bg-white rounded-lg p-4 border border-gray-200">
//                 <div className="flex items-center gap-3 mb-2">
//                   {data?.permission_type === 'public' ? (
//                     <FaGlobe className="text-green-600 text-2xl" />
//                   ) : (
//                     <FaFlag className="text-blue-600 text-2xl" />
//                   )}
//                   <div>
//                     <div className="font-bold text-gray-900">
//                       {data?.permission_type === 'public' ? 'Public Election' : 'Country Specific'}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       {data?.permission_type === 'public' 
//                         ? 'Anyone from anywhere can participate'
//                         : 'Only selected countries can participate'}
//                     </div>
//                   </div>
//                 </div>

//                 {data?.permission_type === 'specific_countries' && data?.allowed_countries?.length > 0 && (
//                   <div className="mt-3 pt-3 border-t border-gray-200">
//                     <div className="font-semibold text-gray-700 mb-2">Allowed Countries:</div>
//                     <div className="flex flex-wrap gap-2">
//                       {data.allowed_countries.map((country, idx) => (
//                         <span
//                           key={idx}
//                           className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
//                         >
//                           {country}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Authentication Method Card */}
//               <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-5 border-2 border-orange-300 shadow-md">
//                 <div className="flex items-center gap-4">
//                   <div className="flex-shrink-0">
//                     {authMethod.icon}
//                   </div>
//                   <div className="flex-1">
//                     <div className="text-sm text-orange-600 font-semibold mb-1">Authentication Method</div>
//                     <div className="font-bold text-gray-900 text-xl">{authMethod.name}</div>
//                     <div className="text-sm text-gray-600 mt-1">{authMethod.desc}</div>
//                   </div>
//                 </div>
//               </div>

//               {data?.biometric_required && (
//                 <div className="bg-white rounded-lg p-4 border border-gray-200">
//                   <div className="flex items-center gap-3">
//                     <FaFingerprint className="text-blue-600 text-2xl" />
//                     <div>
//                       <div className="font-bold text-gray-900">Biometric Required</div>
//                       <div className="text-sm text-gray-600">Voters must verify with biometrics</div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Voting Method Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('voting')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <FaVoteYea className="text-blue-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Voting Method</h3>
//               <p className="text-sm text-gray-600">{votingMethod.name}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-green-500 text-xl" />
//             {expandedSections.voting ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.voting && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             <div className="mt-4">
//               <div className="bg-white rounded-lg p-5 border-2 border-blue-200 mb-4">
//                 <div className="flex items-center gap-3">
//                   <span className="text-4xl">{votingMethod.icon}</span>
//                   <div>
//                     <div className="font-bold text-gray-900 text-lg">{votingMethod.name}</div>
//                     <div className="text-gray-600">{votingMethod.desc}</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="bg-white rounded-lg p-4 border border-gray-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     {data?.show_live_results ? (
//                       <FaEye className="text-green-600" />
//                     ) : (
//                       <FaEyeSlash className="text-gray-400" />
//                     )}
//                     <span className="font-semibold text-gray-900">Live Results</span>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     {data?.show_live_results ? 'Enabled - Voters can see results' : 'Disabled - Results hidden until end'}
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg p-4 border border-gray-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaLock className={data?.vote_editing_allowed ? 'text-green-600' : 'text-gray-400'} />
//                     <span className="font-semibold text-gray-900">Vote Editing</span>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     {data?.vote_editing_allowed ? 'Allowed - Voters can change votes' : 'Not allowed - Votes are final'}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Pricing Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('pricing')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-green-100 p-3 rounded-lg">
//               <FaDollarSign className="text-green-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Financial Settings</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.pricing_type === 'free' ? 'Free' : 
//                  data?.pricing_type === 'paid_general' ? 'General Fee' : 'Regional Pricing'}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-green-500 text-xl" />
//             {expandedSections.pricing ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.pricing && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             <div className="mt-4">
//               {data?.pricing_type === 'free' ? (
//                 <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200 text-center">
//                   <div className="text-5xl mb-3">🆓</div>
//                   <div className="font-bold text-gray-900 text-xl">Free Election</div>
//                   <div className="text-gray-600">No participation fee required</div>
//                 </div>
//               ) : data?.pricing_type === 'paid_general' ? (
//                 <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200 text-center">
//                   <div className="text-5xl mb-3">💳</div>
//                   <div className="font-bold text-gray-900 text-xl mb-2">General Fee</div>
//                   <div className="text-4xl font-bold text-blue-600">
//                     ${parseFloat(data.general_participation_fee || 0).toFixed(2)}
//                   </div>
//                   <div className="text-gray-600 mt-2">Per participant</div>
//                 </div>
//               ) : (
//                 <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
//                   <div className="text-center mb-4">
//                     <div className="text-5xl mb-3">🌍</div>
//                     <div className="font-bold text-gray-900 text-xl">Regional Pricing</div>
//                     <div className="text-gray-600">Different fees by region</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 mt-4">
//                     <table className="w-full">
//                       <thead className="border-b-2 border-indigo-200">
//                         <tr>
//                           <th className="text-left py-2 font-bold text-gray-800">Region</th>
//                           <th className="text-right py-2 font-bold text-gray-800">Fee</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {data?.regional_fees && Object.entries(data.regional_fees).map(([region, fee]) => (
//                           <tr key={region} className="border-b border-gray-200">
//                             <td className="py-2 text-gray-700 capitalize">{region.replace(/_/g, ' ')}</td>
//                             <td className="py-2 text-right font-semibold text-gray-900">${parseFloat(fee).toFixed(2)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Lottery Section */}
//       {data?.lottery_enabled && lotteryPrize && (
//         <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection('lottery')}
//             className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//           >
//             <div className="flex items-center gap-3">
//               <div className="bg-yellow-100 p-3 rounded-lg">
//                 <FaGift className="text-yellow-600 text-xl" />
//               </div>
//               <div className="text-left">
//                 <h3 className="font-bold text-gray-900 text-lg">Lottery Enabled</h3>
//                 <p className="text-sm text-gray-600">
//                   {data?.lottery_config?.winner_count || 1} winner(s) - {lotteryPrize.type}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <FaCheckCircle className="text-green-500 text-xl" />
//               {expandedSections.lottery ? <FaChevronUp /> : <FaChevronDown />}
//             </div>
//           </button>

//           {expandedSections.lottery && (
//             <div className="px-6 pb-6 border-t border-gray-200 bg-yellow-50">
//               <div className="mt-4">
//                 {/* Prize Type Banner */}
//                 <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border-2 border-yellow-300 mb-4">
//                   <div className="flex items-center gap-4">
//                     <span className="text-6xl">{lotteryPrize.icon}</span>
//                     <div className="flex-1">
//                       <div className="font-bold text-gray-900 text-2xl mb-1">{lotteryPrize.type}</div>
//                       <div className="text-3xl font-bold text-orange-600 mb-2">{lotteryPrize.amount}</div>
//                       <div className="text-gray-700">{lotteryPrize.description}</div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Lottery Stats */}
//                 <div className="grid md:grid-cols-3 gap-4">
//                   <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 text-center">
//                     <div className="text-sm text-gray-600 mb-1">Funding Source</div>
//                     <div className="font-bold text-gray-900 capitalize">
//                       {data?.lottery_config?.prize_funding_source?.replace('_', ' ') || 'Creator Funded'}
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 text-center">
//                     <div className="text-sm text-gray-600 mb-1">Total Winners</div>
//                     <div className="text-3xl font-bold text-purple-600">
//                       {data?.lottery_config?.winner_count || 1}
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 text-center">
//                     <div className="text-sm text-gray-600 mb-1">Per Winner</div>
//                     <div className="text-2xl font-bold text-green-600">
//                       {lotteryPrize.value 
//                         ? `$${(lotteryPrize.value / (data?.lottery_config?.winner_count || 1)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
//                         : lotteryPrize.amount}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Questions Section */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('questions')}
//           className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <div className="bg-purple-100 p-3 rounded-lg">
//               <FaQuestionCircle className="text-purple-600 text-xl" />
//             </div>
//             <div className="text-left">
//               <h3 className="font-bold text-gray-900 text-lg">Questions & Answers</h3>
//               <p className="text-sm text-gray-600">{totalQuestions} questions, {totalOptions} total options</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {totalQuestions > 0 ? (
//               <FaCheckCircle className="text-green-500 text-xl" />
//             ) : (
//               <FaExclamationTriangle className="text-red-500 text-xl" />
//             )}
//             {expandedSections.questions ? <FaChevronUp /> : <FaChevronDown />}
//           </div>
//         </button>

//         {expandedSections.questions && (
//           <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//             {totalQuestions === 0 ? (
//               <div className="mt-4 bg-red-50 rounded-lg p-6 border-2 border-red-200 text-center">
//                 <FaExclamationTriangle className="text-red-600 text-4xl mx-auto mb-3" />
//                 <div className="font-bold text-red-900 mb-2">No Questions Added</div>
//                 <div className="text-red-700">Please go back and add at least one question</div>
//               </div>
//             ) : (
//               <div className="mt-4 space-y-3">
//                 {data?.questions?.map((question, idx) => (
//                   <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
//                     <div className="flex items-start gap-3">
//                       <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
//                         {idx + 1}
//                       </div>
//                       <div className="flex-1">
//                         <div className="font-semibold text-gray-900 mb-2">{question.question_text}</div>
//                         <div className="flex items-center gap-2 mb-2">
//                           <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">
//                             {question.type === 'mcq' ? 'Multiple Choice' : 'Open Text'}
//                           </span>
//                           {question.required && (
//                             <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
//                               Required
//                             </span>
//                           )}
//                         </div>
//                         {question.type === 'mcq' && question.answers?.filter(a => a?.trim()).length > 0 && (
//                           <div className="space-y-1 mt-3">
//                             {question.answers.filter(a => a?.trim()).map((answer, ansIdx) => (
//                               <div key={ansIdx} className="flex items-center gap-2 text-sm text-gray-700">
//                                 <span className="font-semibold text-gray-500">{String.fromCharCode(65 + ansIdx)}.</span>
//                                 <span>{answer}</span>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Branding Section */}
//       {(data?.logo || data?.primary_color || data?.secondary_color) && (
//         <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection('branding')}
//             className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
//           >
//             <div className="flex items-center gap-3">
//               <div className="bg-pink-100 p-3 rounded-lg">
//                 <FaPalette className="text-pink-600 text-xl" />
//               </div>
//               <div className="text-left">
//                 <h3 className="font-bold text-gray-900 text-lg">Branding</h3>
//                 <p className="text-sm text-gray-600">Custom colors and logo</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <FaCheckCircle className="text-green-500 text-xl" />
//               {expandedSections.branding ? <FaChevronUp /> : <FaChevronDown />}
//             </div>
//           </button>

//           {expandedSections.branding && (
//             <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
//               <div className="mt-4 flex items-center gap-6">
//                 {data?.logo && (
//                   <img
//                     src={typeof data.logo === 'string' ? data.logo : URL.createObjectURL(data.logo)}
//                     alt="Logo"
//                     className="w-32 h-32 object-contain bg-white rounded-lg border-2 border-gray-200 p-2"
//                   />
//                 )}
//                 {(data?.primary_color || data?.secondary_color) && (
//                   <div className="flex gap-4">
//                     {data?.primary_color && (
//                       <div>
//                         <div className="text-sm text-gray-600 mb-2">Primary Color</div>
//                         <div 
//                           className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
//                           style={{ backgroundColor: data.primary_color }}
//                         ></div>
//                         <div className="text-xs text-gray-500 mt-1">{data.primary_color}</div>
//                       </div>
//                     )}
//                     {data?.secondary_color && (
//                       <div>
//                         <div className="text-sm text-gray-600 mb-2">Secondary Color</div>
//                         <div 
//                           className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
//                           style={{ backgroundColor: data.secondary_color }}
//                         ></div>
//                         <div className="text-xs text-gray-500 mt-1">{data.secondary_color}</div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Ready to Publish */}
//       {totalQuestions > 0 ? (
//         <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 flex items-start gap-4">
//           <FaCheckCircle className="text-green-600 text-3xl flex-shrink-0" />
//           <div>
//             <h4 className="font-bold text-green-900 text-xl mb-2">Election Ready to Publish!</h4>
//             <p className="text-green-700">
//               Your election is properly configured and ready to be published. Click &quot;Publish Election&quot; to make it live.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 flex items-start gap-4">
//           <FaExclamationTriangle className="text-red-600 text-3xl flex-shrink-0" />
//           <div>
//             <h4 className="font-bold text-red-900 text-xl mb-2">Cannot Publish Yet</h4>
//             <p className="text-red-700">Please add at least one question before publishing your election.</p>
//           </div>
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
//         <button
//           onClick={onBack}
//           className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold text-lg transition-all"
//         >
//           ← Previous
//         </button>

//         <div className="flex gap-4">
//           <button
//             onClick={handleSaveDraft}
//             disabled={loading}
//             className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all flex items-center gap-2 ${
//               loading
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
//             }`}
//           >
//             <FaSave />
//             {loading ? 'Saving...' : 'Save Draft'}
//           </button>

//           <button
//             onClick={handlePublish}
//             disabled={publishing || totalQuestions === 0}
//             className={`px-10 py-3 rounded-xl font-bold text-lg transition-all flex items-center gap-3 ${
//               publishing || totalQuestions === 0
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
//             }`}
//           >
//             <FaRocket />
//             {publishing ? 'Publishing...' : 'Publish Election'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
