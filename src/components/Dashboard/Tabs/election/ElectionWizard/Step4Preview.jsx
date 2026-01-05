//last workable files
// src/components/Dashboard/Tabs/election/ElectionWizard/Step4Preview.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  FaTags,
  FaTimes
} from 'react-icons/fa';
import { publishElection, updateDraft } from '../../../../../redux/api/election/electionApi';

export default function Step4Preview({ data, onBack, onPublish, electionId }) {
  const navigate = useNavigate();
  /*eslint-disable*/
  
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ✅ ADDED: State for custom modal
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

  // Get auth method details
  const getAuthMethodDetails = () => {
    const selectedMethod = 
      data?.auth_method ||
      data?.authentication_methods?.[0] ||
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

  // Get lottery prize display
  const getLotteryPrizeDisplay = () => {
    if (!data?.lottery_enabled || !data?.lottery_config) {
      return null;
    }

    const config = data.lottery_config;
    console.log('Gamify config in display function:', config);
    
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

  // ✅ ADDED: Handle publish button click - shows confirmation modal
  const handlePublishClick = () => {
    console.log('🚀 PUBLISH BUTTON CLICKED');
    console.log('📊 Current data:', data);
    console.log('🆔 Election ID:', electionId);
    
    // Validation checks
    if (!data.questions || data.questions.length === 0) {
      console.error('❌ No questions found');
      toast.error('❌ Please add at least one question before publishing');
      return;
    }

    if (!electionId) {
      console.error('❌ No election ID');
      toast.error('❌ Election ID missing. Please save as draft first.');
      return;
    }

    console.log('✅ Questions validated:', data.questions.length, 'questions');
    console.log('✅ Election ID validated:', electionId);

    // ✅ CHANGED: Show custom modal instead of window.confirm
    setShowConfirmModal(true);
  };

  // ✅ ADDED: Confirm publish from modal
  const confirmPublish = async () => {
    setShowConfirmModal(false);
    console.log('✅ User confirmed publish');
    setPublishing(true);
    
    try {
      console.log('🔐 Getting user authentication...');
      
      let currentUserId;
      let currentCreatorType = 'individual';
      
      if (userData && userData.userId) {
        currentUserId = userData.userId;
        console.log('✅ User ID from Redux:', currentUserId);
      } else {
        console.log('⚠️ No Redux userData, checking localStorage...');
        const localUserData = localStorage.getItem('userData');
        if (localUserData) {
          try {
            const parsedUserData = JSON.parse(localUserData);
            currentUserId = parsedUserData.userId;
            console.log('✅ User ID from localStorage:', currentUserId);
          } catch (error) {
            console.error('❌ Error parsing localStorage userData:', error);
          }
        }
      }

      if (!currentUserId) {
        console.error('❌ NO USER ID FOUND');
        toast.error('❌ User authentication error. Please log in again.');
        setPublishing(false);
        return;
      }

      console.log('✅ User authenticated, preparing payload...');

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
          
          category_id: data.category_id ? parseInt(data.category_id) : null,
          
          video_watch_required: data.video_watch_required || false,
          minimum_watch_time: data.minimum_watch_time ? parseInt(data.minimum_watch_time) : 0,
          minimum_watch_percentage: data.minimum_watch_percentage ? parseFloat(data.minimum_watch_percentage) : 0,
          
          permission_type: data.permission_type === 'specific_countries' 
            ? 'country_specific' 
            : data.permission_type === 'country_specific'
            ? 'country_specific'
            : data.permission_type || 'public',
          allowed_countries: data.allowed_countries || [],
          
          pricing_type: data.pricing_type === 'paid_regional' 
            ? 'regional_fee' 
            : data.pricing_type === 'general_fee'
            ? 'general_fee'
            : 'free',
          general_participation_fee: parseFloat(data.general_participation_fee) || 0,
          processing_fee_percentage: parseFloat(data.processing_fee_percentage) || 0,
          
          biometric_required: data.biometric_required || false,
          show_live_results: data.show_live_results || false,
          vote_editing_allowed: data.vote_editing_allowed || false,
          anonymous_voting_enabled: data.anonymous_voting_enabled || false,
          voting_type: data.voting_type || 'plurality',
          authentication_methods: data.auth_method ? [data.auth_method] : (data.authentication_methods || ['passkey']),
          slug: data.election_slug,
          creator_id: currentUserId,
          creator_type: data.creator_type || currentCreatorType,
          status: 'published'
        },
        
        questions: data.questions.map((q, idx) => ({
          question_text: q.question_text,
          question_type: 'multiple_choice',
          question_order: idx + 1,
          is_required: q.is_required !== undefined ? q.is_required : true,
          max_selections: q.max_selections || 1,
          options: (q.options || [])
            .filter(opt => opt.option_text && opt.option_text.trim())
            .map((opt, i) => ({
              option_text: opt.option_text.trim(),
              option_order: i + 1
            }))
        }))
      };

      console.log('📦 Election payload prepared:', electionPayload);

      // Add regional pricing if applicable
      if (data.pricing_type === 'paid_regional' && data.regional_fees) {
        console.log('💰 Adding regional pricing...');
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
          region_code: regionCodeMap[region] || region,
          region_name: region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          participation_fee: parseFloat(fee),
          currency: 'USD'
        }));
        
        console.log('✅ Regional pricing added:', electionPayload.regional_pricing);
      }

      // Add lottery configuration
      if (data.lottery_enabled && data.lottery_config) {
        console.log('🎁 Adding lottery configuration...');
        
        const lotteryConfig = {
          lottery_enabled: true,
          prize_funding_source: data.lottery_config.prize_funding_source || 'creator_funded',
          winner_count: parseInt(data.lottery_config.winner_count) || 1
        };

        if (data.lottery_config.reward_type === 'monetary') {
          lotteryConfig.reward_type = 'monetary';
          lotteryConfig.total_prize_pool = parseFloat(data.lottery_config.total_prize_pool) || 0;
          lotteryConfig.prize_description = `Cash prize of $${lotteryConfig.total_prize_pool.toLocaleString()}`;
          lotteryConfig.estimated_value = lotteryConfig.total_prize_pool;
          
          if (data.lottery_config.prize_distribution && data.lottery_config.prize_distribution.length > 0) {
            lotteryConfig.prize_distribution = data.lottery_config.prize_distribution.map(dist => ({
              rank: parseInt(dist.rank),
              percentage: parseFloat(dist.percentage)
            }));
          }
        } 
        else if (data.lottery_config.reward_type === 'non_monetary') {
          lotteryConfig.reward_type = 'non_monetary';
          lotteryConfig.estimated_value = parseFloat(data.lottery_config.estimated_value) || 0;
          lotteryConfig.prize_description = data.lottery_config.prize_description || 'Non-monetary prize';
          lotteryConfig.total_prize_pool = null;
          
          if (data.lottery_config.non_monetary_prizes && data.lottery_config.non_monetary_prizes.length > 0) {
            lotteryConfig.prize_distribution = data.lottery_config.non_monetary_prizes.map(prize => ({
              rank: parseInt(prize.rank),
              prize_description: prize.prize_description,
              prize_value: parseFloat(prize.prize_value)
            }));
          }
        } 
        else if (data.lottery_config.reward_type === 'projected_revenue') {
          lotteryConfig.reward_type = 'projected_revenue';
          lotteryConfig.projected_revenue = parseFloat(data.lottery_config.projected_revenue) || 0;
          lotteryConfig.revenue_share_percentage = parseFloat(data.lottery_config.revenue_share_percentage) || 0;
          
          const calculatedPrizePool = (lotteryConfig.projected_revenue * lotteryConfig.revenue_share_percentage) / 100;
          lotteryConfig.total_prize_pool = calculatedPrizePool;
          lotteryConfig.estimated_value = calculatedPrizePool;
          lotteryConfig.prize_description = `${lotteryConfig.revenue_share_percentage}% of $${lotteryConfig.projected_revenue.toLocaleString()} projected revenue`;
          
          if (data.lottery_config.prize_distribution && data.lottery_config.prize_distribution.length > 0) {
            lotteryConfig.prize_distribution = data.lottery_config.prize_distribution.map(dist => ({
              rank: parseInt(dist.rank),
              percentage: parseFloat(dist.percentage)
            }));
          }
        }

        electionPayload.lottery_config = lotteryConfig;
        console.log('✅ Lottery config added:', lotteryConfig);
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      if (data.topic_image instanceof File) {
        formData.append('topic_image', data.topic_image);
        console.log('📷 Topic image added to FormData');
      }
      if (data.topic_video instanceof File) {
        formData.append('topic_video', data.topic_video);
        console.log('🎥 Topic video added to FormData');
      }
      if (data.logo instanceof File) {
        formData.append('logo', data.logo);
        console.log('🖼️ Logo added to FormData');
      }

      formData.append('electionData', JSON.stringify(electionPayload));
      console.log('📦 FormData prepared with election data');

      console.log('🚀 CALLING publishElection API...');
      console.log('Election ID:', electionId);

      const response = await publishElection(electionId, formData);
      
      console.log('📤 API RESPONSE RECEIVED:', response);
      console.log('📦 Response data object:', response.data);

      // ✅✅✅ CHECK FOR DEPOSIT REQUIREMENT IN BOTH LOCATIONS ✅✅✅
      const needsDeposit = response.requiresDeposit || response.data?.requiresDeposit;
      const depositInfo = response.data || response;

      if (needsDeposit) {
        console.log('💰 DEPOSIT REQUIRED - BLOCKING PUBLISH');
        console.log('📦 Deposit Info:', depositInfo);
        
        // Save to session storage
        sessionStorage.setItem('pendingPublishElectionId', depositInfo.electionId || electionId);
        sessionStorage.setItem('pendingPublishAmount', depositInfo.depositAmount);
        
        // Show toast notification
        toast.warning(
          `💰 Deposit Required!\n\nYou must deposit $${parseFloat(depositInfo.depositAmount).toFixed(2)} prize pool before publishing.`,
          { autoClose: 7000 }
        );
        
        // Wait 2 seconds then redirect to Creator Wallet
        setTimeout(() => {
          console.log('🔄 Redirecting to Creator Wallet...');
          
          navigate('/dashboard', {
            state: {
              activeTab: 'creator-wallet',
              highlightElection: depositInfo.electionId || electionId,
              depositRequired: true,
              depositAmount: depositInfo.depositAmount
            },
            replace: false
          });
        }, 2000);
        
        setPublishing(false);
        return; // STOP HERE - DON'T PROCEED WITH PUBLISH
      }
      
      // ✅ If we get here, deposit is done OR not needed
      if (response.success) {
        console.log('✅ ELECTION PUBLISHED SUCCESSFULLY!');
        toast.success('🎉 Election published successfully!');
        
        // Clear session storage
        sessionStorage.removeItem('pendingPublishElectionId');
        sessionStorage.removeItem('pendingPublishAmount');
        
        setTimeout(() => {
          console.log('🔄 Calling onPublish callback...');
          onPublish();
        }, 2000);
      } else {
        console.error('❌ PUBLISH FAILED:', response);
        toast.error(response.message || 'Failed to publish election');
      }
      
    } catch (error) {
      console.error('💥 PUBLISH ERROR:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error stack:', error.stack);
      
      toast.error(error.response?.data?.message || error.message || 'Failed to publish election');
    } finally {
      console.log('🏁 Publishing complete, resetting state');
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
            {/* <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <FaSave /> {loading ? 'Saving...' : 'Save Draft'}
            </button> */}
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

      {/* Pricing Section */}
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
            {!data?.show_participation_fee_in_preview && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <FaEyeSlash className="text-yellow-600" />
                <p className="text-sm text-yellow-800 font-medium">
                  Participation fees are hidden from public preview
                </p>
              </div>
            )}

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

            {data?.show_participation_fee_in_preview !== false && (
              <>
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

            {data?.processing_fee_percentage > 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <FaExclamationTriangle className="inline mr-1" />
                Processing fee: {data.processing_fee_percentage}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lottery Section */}
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
              {!data?.show_lottery_prizes_in_preview && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <FaEyeSlash className="text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-medium">
                    Gamify prizes hidden from public preview
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <FaCheckCircle className="text-green-600" />
                <span className="text-sm font-medium text-green-800">Gamify Enabled</span>
              </div>

              {data?.show_lottery_prizes_in_preview !== false ? (
                <>
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

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Winners</span>
                    <span className="text-lg font-bold text-gray-800">
                      {data?.lottery_config?.winner_count || 1}
                    </span>
                  </div>

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
          onClick={handlePublishClick}
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

      {/* ✅ ADDED: Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaRocket className="text-green-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Publish Election?</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Once published, your election will be live and voters can start participating.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Please note:</p>
                    <ul className="space-y-1">
                      <li>• Some settings cannot be changed after publishing</li>
                      <li>• Make sure all details are correct</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublish}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaRocket />
                Yes, Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// //last workable files
// // src/components/Dashboard/Tabs/election/ElectionWizard/Step4Preview.jsx
// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
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
//   const navigate = useNavigate();
  
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
//     console.log('Show Participation Fee:', data?.show_participation_fee_in_preview);
//     console.log('Show Lottery Prizes:', data?.show_lottery_prizes_in_preview);
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

//   // Get auth method details
//   const getAuthMethodDetails = () => {
//     const selectedMethod = 
//       data?.auth_method ||
//       data?.authentication_methods?.[0] ||
//       'passkey';
    
//     console.log('Getting auth method, found:', selectedMethod);
    
//     const methods = {
//       'passkey': { 
//         name: 'Passkey Authentication', 
//         icon: <FaFingerprint className="text-blue-600 text-2xl" />,
//         desc: 'Biometric authentication using device passkey'
//       },
//       'oauth': { 
//         name: 'OAuth (Social Login)', 
//         icon: <FaGlobe className="text-purple-600 text-2xl" />,
//         desc: 'Login with Google, Facebook, or other providers'
//       },
//       'magic_link': { 
//         name: 'Magic Link', 
//         icon: <FaLink className="text-orange-600 text-2xl" />,
//         desc: 'Email link authentication without password'
//       },
//       'email_password': { 
//         name: 'Email & Password', 
//         icon: <FaKey className="text-gray-600 text-2xl" />,
//         desc: 'Traditional email and password login'
//       }
//     };
    
//     return methods[selectedMethod] || methods['passkey'];
//   };

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

//   // Get lottery prize display
//   const getLotteryPrizeDisplay = () => {
//     if (!data?.lottery_enabled || !data?.lottery_config) {
//       return null;
//     }

//     const config = data.lottery_config;
//     console.log('Gamify config in display function:', config);
    
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

//   // ✅✅✅ PUBLISH ELECTION - FIXED TO HANDLE DEPOSIT REQUIREMENT ✅✅✅
//   const handlePublish = async () => {
//     console.log('🚀 PUBLISH BUTTON CLICKED');
//     console.log('📊 Current data:', data);
//     console.log('🆔 Election ID:', electionId);
    
//     // Validation checks
//     if (!data.questions || data.questions.length === 0) {
//       console.error('❌ No questions found');
//       toast.error('❌ Please add at least one question before publishing');
//       return;
//     }

//     if (!electionId) {
//       console.error('❌ No election ID');
//       toast.error('❌ Election ID missing. Please save as draft first.');
//       return;
//     }

//     console.log('✅ Questions validated:', data.questions.length, 'questions');
//     console.log('✅ Election ID validated:', electionId);

//     const confirmed = window.confirm(
//       '🚀 Ready to publish your election?\n\n' +
//       'Once published, your election will be live and voters can start participating.\n\n' +
//       'Are you sure you want to continue?'
//     );
    
//     if (!confirmed) {
//       console.log('❌ User cancelled publish');
//       return;
//     }

//     console.log('✅ User confirmed publish');
//     setPublishing(true);
    
//     try {
//       console.log('🔐 Getting user authentication...');
      
//       let currentUserId;
//       let currentCreatorType = 'individual';
      
//       if (userData && userData.userId) {
//         currentUserId = userData.userId;
//         console.log('✅ User ID from Redux:', currentUserId);
//       } else {
//         console.log('⚠️ No Redux userData, checking localStorage...');
//         const localUserData = localStorage.getItem('userData');
//         if (localUserData) {
//           try {
//             const parsedUserData = JSON.parse(localUserData);
//             currentUserId = parsedUserData.userId;
//             console.log('✅ User ID from localStorage:', currentUserId);
//           } catch (error) {
//             console.error('❌ Error parsing localStorage userData:', error);
//           }
//         }
//       }

//       if (!currentUserId) {
//         console.error('❌ NO USER ID FOUND');
//         toast.error('❌ User authentication error. Please log in again.');
//         setPublishing(false);
//         return;
//       }

//       console.log('✅ User authenticated, preparing payload...');

//       const electionPayload = {
//         election: {
//           title: data.title,
//           description: data.description,
//           start_date: data.start_date,
//           start_time: data.start_time,
//           end_date: data.end_date,
//           end_time: data.end_time,
//           timezone: data.timezone,
//           topic_video_url: data.topic_video_url || null,
          
//           category_id: data.category_id ? parseInt(data.category_id) : null,
          
//           video_watch_required: data.video_watch_required || false,
//           minimum_watch_time: data.minimum_watch_time ? parseInt(data.minimum_watch_time) : 0,
//           minimum_watch_percentage: data.minimum_watch_percentage ? parseFloat(data.minimum_watch_percentage) : 0,
          
//           permission_type: data.permission_type === 'specific_countries' 
//             ? 'country_specific' 
//             : data.permission_type === 'country_specific'
//             ? 'country_specific'
//             : data.permission_type || 'public',
//           allowed_countries: data.allowed_countries || [],
          
//           pricing_type: data.pricing_type === 'paid_regional' 
//             ? 'regional_fee' 
//             : data.pricing_type === 'general_fee'
//             ? 'general_fee'
//             : 'free',
//           general_participation_fee: parseFloat(data.general_participation_fee) || 0,
//           processing_fee_percentage: parseFloat(data.processing_fee_percentage) || 0,
          
//           biometric_required: data.biometric_required || false,
//           show_live_results: data.show_live_results || false,
//           vote_editing_allowed: data.vote_editing_allowed || false,
//           anonymous_voting_enabled: data.anonymous_voting_enabled || false,
//           voting_type: data.voting_type || 'plurality',
//           authentication_methods: data.auth_method ? [data.auth_method] : (data.authentication_methods || ['passkey']),
//           slug: data.election_slug,
//           creator_id: currentUserId,
//           creator_type: data.creator_type || currentCreatorType,
//           status: 'published'
//         },
        
//         questions: data.questions.map((q, idx) => ({
//           question_text: q.question_text,
//           question_type: 'multiple_choice',
//           question_order: idx + 1,
//           is_required: q.is_required !== undefined ? q.is_required : true,
//           max_selections: q.max_selections || 1,
//           options: (q.options || [])
//             .filter(opt => opt.option_text && opt.option_text.trim())
//             .map((opt, i) => ({
//               option_text: opt.option_text.trim(),
//               option_order: i + 1
//             }))
//         }))
//       };

//       console.log('📦 Election payload prepared:', electionPayload);

//       // Add regional pricing if applicable
//       if (data.pricing_type === 'paid_regional' && data.regional_fees) {
//         console.log('💰 Adding regional pricing...');
//         const regionCodeMap = {
//           'north_america': 'region_1_us_canada',
//           'us_canada': 'region_1_us_canada',
//           'western_europe': 'region_2_western_europe',
//           'eastern_europe': 'region_3_eastern_europe',
//           'africa': 'region_4_africa',
//           'latin_america': 'region_5_latin_america',
//           'middle_east': 'region_6_middle_east_asia',
//           'middle_east_asia': 'region_6_middle_east_asia',
//           'asia': 'region_6_middle_east_asia',
//           'australia_nz': 'region_7_australasia',
//           'australasia': 'region_7_australasia',
//           'china': 'region_8_china'
//         };

//         electionPayload.regional_pricing = Object.entries(data.regional_fees).map(([region, fee]) => ({
//           region_code: regionCodeMap[region] || region,
//           region_name: region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//           participation_fee: parseFloat(fee),
//           currency: 'USD'
//         }));
        
//         console.log('✅ Regional pricing added:', electionPayload.regional_pricing);
//       }

//       // Add lottery configuration
//       if (data.lottery_enabled && data.lottery_config) {
//         console.log('🎁 Adding lottery configuration...');
        
//         const lotteryConfig = {
//           lottery_enabled: true,
//           prize_funding_source: data.lottery_config.prize_funding_source || 'creator_funded',
//           winner_count: parseInt(data.lottery_config.winner_count) || 1
//         };

//         if (data.lottery_config.reward_type === 'monetary') {
//           lotteryConfig.reward_type = 'monetary';
//           lotteryConfig.total_prize_pool = parseFloat(data.lottery_config.total_prize_pool) || 0;
//           lotteryConfig.prize_description = `Cash prize of $${lotteryConfig.total_prize_pool.toLocaleString()}`;
//           lotteryConfig.estimated_value = lotteryConfig.total_prize_pool;
          
//           if (data.lottery_config.prize_distribution && data.lottery_config.prize_distribution.length > 0) {
//             lotteryConfig.prize_distribution = data.lottery_config.prize_distribution.map(dist => ({
//               rank: parseInt(dist.rank),
//               percentage: parseFloat(dist.percentage)
//             }));
//           }
//         } 
//         else if (data.lottery_config.reward_type === 'non_monetary') {
//           lotteryConfig.reward_type = 'non_monetary';
//           lotteryConfig.estimated_value = parseFloat(data.lottery_config.estimated_value) || 0;
//           lotteryConfig.prize_description = data.lottery_config.prize_description || 'Non-monetary prize';
//           lotteryConfig.total_prize_pool = null;
          
//           if (data.lottery_config.non_monetary_prizes && data.lottery_config.non_monetary_prizes.length > 0) {
//             lotteryConfig.prize_distribution = data.lottery_config.non_monetary_prizes.map(prize => ({
//               rank: parseInt(prize.rank),
//               prize_description: prize.prize_description,
//               prize_value: parseFloat(prize.prize_value)
//             }));
//           }
//         } 
//         else if (data.lottery_config.reward_type === 'projected_revenue') {
//           lotteryConfig.reward_type = 'projected_revenue';
//           lotteryConfig.projected_revenue = parseFloat(data.lottery_config.projected_revenue) || 0;
//           lotteryConfig.revenue_share_percentage = parseFloat(data.lottery_config.revenue_share_percentage) || 0;
          
//           const calculatedPrizePool = (lotteryConfig.projected_revenue * lotteryConfig.revenue_share_percentage) / 100;
//           lotteryConfig.total_prize_pool = calculatedPrizePool;
//           lotteryConfig.estimated_value = calculatedPrizePool;
//           lotteryConfig.prize_description = `${lotteryConfig.revenue_share_percentage}% of $${lotteryConfig.projected_revenue.toLocaleString()} projected revenue`;
          
//           if (data.lottery_config.prize_distribution && data.lottery_config.prize_distribution.length > 0) {
//             lotteryConfig.prize_distribution = data.lottery_config.prize_distribution.map(dist => ({
//               rank: parseInt(dist.rank),
//               percentage: parseFloat(dist.percentage)
//             }));
//           }
//         }

//         electionPayload.lottery_config = lotteryConfig;
//         console.log('✅ Lottery config added:', lotteryConfig);
//       }

//       // Create FormData for file upload
//       const formData = new FormData();
      
//       if (data.topic_image instanceof File) {
//         formData.append('topic_image', data.topic_image);
//         console.log('📷 Topic image added to FormData');
//       }
//       if (data.topic_video instanceof File) {
//         formData.append('topic_video', data.topic_video);
//         console.log('🎥 Topic video added to FormData');
//       }
//       if (data.logo instanceof File) {
//         formData.append('logo', data.logo);
//         console.log('🖼️ Logo added to FormData');
//       }

//       formData.append('electionData', JSON.stringify(electionPayload));
//       console.log('📦 FormData prepared with election data');

//       console.log('🚀 CALLING publishElection API...');
//       console.log('Election ID:', electionId);

//       const response = await publishElection(electionId, formData);
      
//       console.log('📤 API RESPONSE RECEIVED:', response);
//       console.log('📦 Response data object:', response.data);

//       // ✅✅✅ CHECK FOR DEPOSIT REQUIREMENT IN BOTH LOCATIONS ✅✅✅
//       const needsDeposit = response.requiresDeposit || response.data?.requiresDeposit;
//       const depositInfo = response.data || response;

//       if (needsDeposit) {
//         console.log('💰 DEPOSIT REQUIRED - BLOCKING PUBLISH');
//         console.log('📦 Deposit Info:', depositInfo);
        
//         // Save to session storage
//         sessionStorage.setItem('pendingPublishElectionId', depositInfo.electionId || electionId);
//         sessionStorage.setItem('pendingPublishAmount', depositInfo.depositAmount);
        
//         // Show toast notification
//         toast.warning(
//           `💰 Deposit Required!\n\nYou must deposit $${parseFloat(depositInfo.depositAmount).toFixed(2)} prize pool before publishing.`,
//           { autoClose: 7000 }
//         );
        
//         // Wait 2 seconds then redirect to Creator Wallet
//         setTimeout(() => {
//           console.log('🔄 Redirecting to Creator Wallet...');
          
//           navigate('/dashboard', {
//             state: {
//               activeTab: 'creator-wallet',
//               highlightElection: depositInfo.electionId || electionId,
//               depositRequired: true,
//               depositAmount: depositInfo.depositAmount
//             },
//             replace: false
//           });
//         }, 2000);
        
//         setPublishing(false);
//         return; // STOP HERE - DON'T PROCEED WITH PUBLISH
//       }
      
//       // ✅ If we get here, deposit is done OR not needed
//       if (response.success) {
//         console.log('✅ ELECTION PUBLISHED SUCCESSFULLY!');
//         toast.success('🎉 Election published successfully!');
        
//         // Clear session storage
//         sessionStorage.removeItem('pendingPublishElectionId');
//         sessionStorage.removeItem('pendingPublishAmount');
        
//         setTimeout(() => {
//           console.log('🔄 Calling onPublish callback...');
//           onPublish();
//         }, 2000);
//       } else {
//         console.error('❌ PUBLISH FAILED:', response);
//         toast.error(response.message || 'Failed to publish election');
//       }
      
//     } catch (error) {
//       console.error('💥 PUBLISH ERROR:', error);
//       console.error('Error details:', error.response?.data);
//       console.error('Error status:', error.response?.status);
//       console.error('Error stack:', error.stack);
      
//       toast.error(error.response?.data?.message || error.message || 'Failed to publish election');
//     } finally {
//       console.log('🏁 Publishing complete, resetting state');
//       setPublishing(false);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 p-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold mb-2">📋 Election Preview</h2>
//             <p className="text-purple-100">Review your election before publishing</p>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={handleSaveDraft}
//               disabled={loading}
//               className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center gap-2 backdrop-blur-sm"
//             >
//               <FaSave /> {loading ? 'Saving...' : 'Save Draft'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Basic Info Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('basic')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-blue-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
//               <p className="text-sm text-gray-600">{data?.title || 'No title'}</p>
//             </div>
//           </div>
//           {expandedSections.basic ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.basic && (
//           <div className="p-6 space-y-4">
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Election Title</div>
//                 <div className="font-semibold text-gray-900">{data?.title || 'Not set'}</div>
//               </div>
              
//               {getCategoryDetails() && (
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Category</div>
//                   <div className="font-semibold text-gray-900 flex items-center gap-2">
//                     <span className="text-2xl">{getCategoryDetails().icon}</span>
//                     {getCategoryDetails().name}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {data?.description && (
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Description</div>
//                 <div className="text-gray-900">{data.description}</div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Schedule Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('schedule')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaCalendarAlt className="text-orange-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>
//               <p className="text-sm text-gray-600">
//                 {calculateDuration().text}
//               </p>
//             </div>
//           </div>
//           {expandedSections.schedule ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.schedule && (
//           <div className="p-6 space-y-4">
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
//                 <div className="text-sm text-gray-600 mb-1">Start Date & Time</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.start_date} at {data?.start_time}
//                 </div>
//               </div>

//               <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
//                 <div className="text-sm text-gray-600 mb-1">End Date & Time</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.end_date} at {data?.end_time}
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 bg-blue-50 rounded-lg">
//               <div className="text-sm text-gray-600 mb-1">Duration</div>
//               <div className="font-semibold text-gray-900">{calculateDuration().text}</div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Access Control Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('access')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaUsers className="text-purple-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Access Control</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.permission_type === 'public' ? 'Public election' : 
//                  data?.permission_type === 'specific_countries' ? 'Country-specific' : 'Restricted'}
//               </p>
//             </div>
//           </div>
//           {expandedSections.access ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.access && (
//           <div className="p-6 space-y-4">
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="text-sm text-gray-600 mb-1">Permission Type</div>
//               <div className="font-semibold text-gray-900 flex items-center gap-2">
//                 {data?.permission_type === 'public' && '🌍 Public - Anyone can participate'}
//                 {data?.permission_type === 'specific_countries' && '🚩 Country-Specific'}
//                 {data?.permission_type === 'organization_only' && '🏢 Organization Only'}
//               </div>
//             </div>

//             {data?.permission_type === 'specific_countries' && data?.allowed_countries && (
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-2">Allowed Countries</div>
//                 <div className="flex flex-wrap gap-2">
//                   {data.allowed_countries.map((country, idx) => (
//                     <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
//                       {country}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="text-sm text-gray-600 mb-2">Authentication Method</div>
//               <div className="flex items-center gap-3">
//                 {getAuthMethodDetails().icon}
//                 <div>
//                   <div className="font-semibold text-gray-900">{getAuthMethodDetails().name}</div>
//                   <div className="text-sm text-gray-600">{getAuthMethodDetails().desc}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Pricing Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('pricing')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaDollarSign className="text-green-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Pricing & Fees</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.pricing_type === 'free' ? 'Free election' : 'Paid participation'}
//               </p>
//             </div>
//           </div>
//           {expandedSections.pricing ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.pricing && (
//           <div className="p-6 space-y-4">
//             {!data?.show_participation_fee_in_preview && (
//               <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
//                 <FaEyeSlash className="text-yellow-600" />
//                 <p className="text-sm text-yellow-800 font-medium">
//                   Participation fees are hidden from public preview
//                 </p>
//               </div>
//             )}

//             <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
//               <div className="text-2xl">
//                 {data?.pricing_type === 'free' ? '🆓' : 
//                  data?.pricing_type === 'general_fee' ? '💵' : '🌍'}
//               </div>
//               <div className="flex-1">
//                 <div className="font-semibold text-gray-800 mb-1">Pricing Model</div>
//                 <div className="text-sm text-gray-600">
//                   {data?.pricing_type === 'free' && 'Free - No participation fee'}
//                   {data?.pricing_type === 'general_fee' && 'General Fee - Same fee for all participants'}
//                   {data?.pricing_type === 'paid_regional' && 'Regional Pricing - Different fees by region'}
//                 </div>
//               </div>
//             </div>

//             {data?.show_participation_fee_in_preview !== false && (
//               <>
//                 {data?.pricing_type === 'general_fee' && (
//                   <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
//                     <div className="text-center">
//                       <div className="text-sm text-gray-600 mb-1">Participation Fee</div>
//                       <div className="text-3xl font-bold text-green-600">
//                         ${parseFloat(data?.general_participation_fee || 0).toFixed(2)}
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">Per participant</div>
//                     </div>
//                   </div>
//                 )}

//                 {data?.pricing_type === 'paid_regional' && data?.regional_fees && (
//                   <div className="space-y-3">
//                     <div className="text-sm font-medium text-gray-700 mb-2">Regional Fees:</div>
//                     <div className="grid grid-cols-2 gap-3">
//                       {Object.entries(data.regional_fees).map(([region, fee]) => (
//                         <div key={region} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//                           <div className="flex items-center gap-2 mb-1">
//                             <FaGlobe className="text-blue-600 text-sm" />
//                             <div className="text-sm font-medium text-gray-800">
//                               {region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                             </div>
//                           </div>
//                           <div className="text-lg font-bold text-blue-600">
//                             ${parseFloat(fee).toFixed(2)}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}

//             {data?.show_participation_fee_in_preview === false && data?.pricing_type !== 'free' && (
//               <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 text-center">
//                 <FaEyeSlash className="text-gray-400 text-2xl mx-auto mb-2" />
//                 <p className="text-sm text-gray-600 font-medium">
//                   Fee information hidden from public preview
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Fees will be displayed during checkout
//                 </p>
//               </div>
//             )}

//             {data?.processing_fee_percentage > 0 && (
//               <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
//                 <FaExclamationTriangle className="inline mr-1" />
//                 Processing fee: {data.processing_fee_percentage}%
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Lottery Section */}
//       {data?.lottery_enabled && (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection('lottery')}
//             className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-colors"
//           >
//             <div className="flex items-center gap-3">
//               <FaGift className="text-yellow-600 text-xl" />
//               <div className="text-left">
//                 <h3 className="text-lg font-semibold text-gray-800">Gamify & Prizes</h3>
//                 <p className="text-sm text-gray-600">
//                   {data?.lottery_config?.winner_count || 1} winner(s)
//                 </p>
//               </div>
//             </div>
//             {expandedSections.lottery ? <FaChevronUp /> : <FaChevronDown />}
//           </button>

//           {expandedSections.lottery && (
//             <div className="p-6 space-y-4">
//               {!data?.show_lottery_prizes_in_preview && (
//                 <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
//                   <FaEyeSlash className="text-yellow-600" />
//                   <p className="text-sm text-yellow-800 font-medium">
//                     Gamify prizes hidden from public preview
//                   </p>
//                 </div>
//               )}

//               <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
//                 <FaCheckCircle className="text-green-600" />
//                 <span className="text-sm font-medium text-green-800">Gamify Enabled</span>
//               </div>

//               {data?.show_lottery_prizes_in_preview !== false ? (
//                 <>
//                   {(() => {
//                     const prizeInfo = getLotteryPrizeDisplay();
//                     if (!prizeInfo) return null;

//                     return (
//                       <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
//                         <div className="text-center">
//                           <div className="text-5xl mb-3">{prizeInfo.icon}</div>
//                           <div className="text-sm text-gray-600 mb-2">{prizeInfo.type}</div>
//                           <div className="text-4xl font-bold text-yellow-600 mb-2">
//                             {prizeInfo.amount}
//                           </div>
//                           <div className="text-sm text-gray-600">{prizeInfo.description}</div>
//                         </div>
//                       </div>
//                     );
//                   })()}

//                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                     <span className="text-sm text-gray-600">Total Winners</span>
//                     <span className="text-lg font-bold text-gray-800">
//                       {data?.lottery_config?.winner_count || 1}
//                     </span>
//                   </div>

//                   {data?.lottery_config?.prize_distribution && 
//                    data.lottery_config.prize_distribution.length > 0 && (
//                     <div className="space-y-2">
//                       <div className="text-sm font-medium text-gray-700">Prize Distribution:</div>
//                       {data.lottery_config.prize_distribution.map((dist, idx) => {
//                         const prizeInfo = getLotteryPrizeDisplay();
//                         const prizeValue = prizeInfo?.value || 0;
//                         const amount = (prizeValue * dist.percentage) / 100;
                        
//                         return (
//                           <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
//                             <div className="flex items-center gap-3">
//                               <div className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-white font-bold rounded-full text-sm">
//                                 {dist.rank}
//                               </div>
//                               <div>
//                                 <div className="text-sm font-medium text-gray-800">
//                                   {dist.rank === 1 ? '🥇 1st Place' :
//                                    dist.rank === 2 ? '🥈 2nd Place' :
//                                    dist.rank === 3 ? '🥉 3rd Place' :
//                                    `${dist.rank}th Place`}
//                                 </div>
//                                 <div className="text-xs text-gray-600">
//                                   {dist.percentage}% of total prize
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <div className="text-lg font-bold text-yellow-600">
//                                 ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <span className="text-sm text-gray-600">Prize Funding</span>
//                     <span className="text-sm font-medium text-blue-800">
//                       {data?.lottery_config?.prize_funding_source === 'creator_funded' 
//                         ? '👤 Creator Funded' 
//                         : '💰 Participation Fee Funded'}
//                     </span>
//                   </div>
//                 </>
//               ) : (
//                 <div className="p-6 bg-gray-100 rounded-lg border border-gray-300 text-center">
//                   <FaEyeSlash className="text-gray-400 text-3xl mx-auto mb-3" />
//                   <p className="text-sm text-gray-600 font-medium mb-1">
//                     Gamify prize information hidden from public preview
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     Prize details will be revealed to participants after voting
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Voting Configuration Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('voting')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaVoteYea className="text-indigo-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Voting Configuration</h3>
//               <p className="text-sm text-gray-600">{getVotingMethodDetails().name}</p>
//             </div>
//           </div>
//           {expandedSections.voting ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.voting && (
//           <div className="p-6 space-y-4">
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="flex items-center gap-3 mb-2">
//                 <span className="text-2xl">{getVotingMethodDetails().icon}</span>
//                 <div>
//                   <div className="font-semibold text-gray-900">{getVotingMethodDetails().name}</div>
//                   <div className="text-sm text-gray-600">{getVotingMethodDetails().desc}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Live Results</div>
//                 <div className="font-semibold text-gray-900 flex items-center gap-2">
//                   {data?.show_live_results ? (
//                     <><FaEye className="text-green-600" /> Enabled</>
//                   ) : (
//                     <><FaEyeSlash className="text-gray-400" /> Disabled</>
//                   )}
//                 </div>
//               </div>

//               <div className="p-4 bg-purple-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Vote Editing</div>
//                 <div className="font-semibold text-gray-900 flex items-center gap-2">
//                   {data?.vote_editing_allowed ? (
//                     <><FaCheckCircle className="text-green-600" /> Allowed</>
//                   ) : (
//                     <><FaLock className="text-gray-400" /> Not Allowed</>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Questions Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('questions')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaQuestionCircle className="text-pink-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.questions?.length || 0} question{data?.questions?.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//           </div>
//           {expandedSections.questions ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.questions && (
//           <div className="p-6 space-y-4">
//             {data?.questions && data.questions.length > 0 ? (
//               data.questions.map((question, idx) => (
//                 <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-pink-500">
//                   <div className="flex items-start gap-3">
//                     <div className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white rounded-full font-bold flex-shrink-0">
//                       {idx + 1}
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-semibold text-gray-900 mb-2">{question.question_text}</div>
//                       <div className="text-xs text-gray-500 mb-2">
//                         Type: {question.type} {question.required && '• Required'}
//                       </div>
//                       {question.answers && question.answers.length > 0 && (
//                         <div className="space-y-1">
//                           {question.answers.map((answer, ansIdx) => (
//                             <div key={ansIdx} className="flex items-center gap-2 text-sm text-gray-700">
//                               <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
//                               {answer}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 <FaQuestionCircle className="text-4xl mx-auto mb-2 opacity-50" />
//                 <p>No questions added yet</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-between items-center gap-4 pt-6">
//         <button
//           onClick={onBack}
//           className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
//         >
//           ← Back to Questions
//         </button>

//         <button
//           onClick={handlePublish}
//           disabled={publishing}
//           className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {publishing ? (
//             <>
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               Publishing...
//             </>
//           ) : (
//             <>
//               <FaRocket /> Publish Election
//             </>
//           )}
//         </button>
//       </div>

//       {/* Info Box */}
//       <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
//         <div className="flex items-start gap-3">
//           <FaExclamationTriangle className="text-blue-600 mt-1" />
//           <div>
//             <h4 className="font-semibold text-blue-900 mb-1">Before Publishing</h4>
//             <ul className="text-sm text-blue-800 space-y-1">
//               <li>• Review all election details carefully</li>
//               <li>• Ensure start and end dates are correct</li>
//               <li>• Verify questions and voting options</li>
//               <li>• Check pricing and Gamify configuration</li>
//               <li>• Once published, some changes cannot be undone</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// //last workable files
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
//     console.log('Show Participation Fee:', data?.show_participation_fee_in_preview);
//     console.log('Show Lottery Prizes:', data?.show_lottery_prizes_in_preview);
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
//     console.log('Gamify config in display function:', config);
    
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

//   // Publish election - ✅ FIXED WITH CORRECT BACKEND FIELD MAPPING
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

//     // ✅ FIXED: Prepare the election payload with correct backend field names
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
        
//         // ✅ Category
//         category_id: data.category_id ? parseInt(data.category_id) : null,
        
//         // ✅ VIDEO WATCH FIELDS - NOW INCLUDED
//         video_watch_required: data.video_watch_required || false,
//         minimum_watch_time: data.minimum_watch_time ? parseInt(data.minimum_watch_time) : 0,
//         minimum_watch_percentage: data.minimum_watch_percentage ? parseFloat(data.minimum_watch_percentage) : 0,
        
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
//         processing_fee_percentage: parseFloat(data.processing_fee_percentage) || 0,
        
//         biometric_required: data.biometric_required || false,
//         show_live_results: data.show_live_results || false,
//         vote_editing_allowed: data.vote_editing_allowed || false,
//         anonymous_voting_enabled: data.anonymous_voting_enabled || false,  // ⭐⭐⭐ NEW LINE ADDED - LINE 242 ⭐⭐⭐
//         voting_type: data.voting_type || 'plurality',
//         authentication_methods: data.auth_method ? [data.auth_method] : (data.authentication_methods || ['passkey']),
//         slug: data.election_slug,
//         creator_id: currentUserId,
//         creator_type: data.creator_type || currentCreatorType,
//         status: 'published'
//       },
      
//      questions: data.questions.map((q, idx) => ({
//   question_text: q.question_text,
//   question_type: 'multiple_choice', // ✅ ALWAYS multiple_choice for voting
//   question_order: idx + 1,
//   is_required: q.is_required !== undefined ? q.is_required : true,
//   max_selections: q.max_selections || 1,
//   options: (q.options || [])
//     .filter(opt => opt.option_text && opt.option_text.trim())
//     .map((opt, i) => ({
//       option_text: opt.option_text.trim(),
//       option_order: i + 1
//     }))
// }))
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
//         region_code: regionCodeMap[region] || region,
//         region_name: region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//         participation_fee: parseFloat(fee),
//         currency: 'USD'
//       }));
//     }

//     // ✅ FIXED: Add lottery configuration with CORRECT field names matching backend
//     if (data.lottery_enabled && data.lottery_config) {
//       const lotteryConfig = {
//         lottery_enabled: true, // ✅ Changed from is_lotterized
//         prize_funding_source: data.lottery_config.prize_funding_source || 'creator_funded',
//         winner_count: parseInt(data.lottery_config.winner_count) || 1
//       };

//       // ✅ Monetary Prize
//       if (data.lottery_config.reward_type === 'monetary') {
//         lotteryConfig.reward_type = 'monetary';
//         lotteryConfig.total_prize_pool = parseFloat(data.lottery_config.total_prize_pool) || 0; // ✅ Changed from reward_amount
//         lotteryConfig.prize_description = `Cash prize of $${lotteryConfig.total_prize_pool.toLocaleString()}`;
//         lotteryConfig.estimated_value = lotteryConfig.total_prize_pool; // For consistency
        
//         // ✅ Add prize distribution for monetary
//         if (data.lottery_config.prize_distribution && data.lottery_config.prize_distribution.length > 0) {
//           lotteryConfig.prize_distribution = data.lottery_config.prize_distribution.map(dist => ({
//             rank: parseInt(dist.rank),
//             percentage: parseFloat(dist.percentage)
//           }));
//         }
//       } 
//       // ✅ Non-Monetary Prize
//       else if (data.lottery_config.reward_type === 'non_monetary') {
//         lotteryConfig.reward_type = 'non_monetary';
//         lotteryConfig.estimated_value = parseFloat(data.lottery_config.estimated_value) || 0; // ✅ Correct field
//         lotteryConfig.prize_description = data.lottery_config.prize_description || 'Non-monetary prize';
//         lotteryConfig.total_prize_pool = null; // Not applicable for non-monetary
        
//         // ✅ Add non-monetary prizes if they exist
//         if (data.lottery_config.non_monetary_prizes && data.lottery_config.non_monetary_prizes.length > 0) {
//           lotteryConfig.prize_distribution = data.lottery_config.non_monetary_prizes.map(prize => ({
//             rank: parseInt(prize.rank),
//             prize_description: prize.prize_description,
//             prize_value: parseFloat(prize.prize_value)
//           }));
//         }
//       } 
//       // ✅ Projected Revenue
//       else if (data.lottery_config.reward_type === 'projected_revenue') {
//         lotteryConfig.reward_type = 'projected_revenue';
//         lotteryConfig.projected_revenue = parseFloat(data.lottery_config.projected_revenue) || 0; // ✅ Correct field
//         lotteryConfig.revenue_share_percentage = parseFloat(data.lottery_config.revenue_share_percentage) || 0; // ✅ Correct field
        
//         const calculatedPrizePool = (lotteryConfig.projected_revenue * lotteryConfig.revenue_share_percentage) / 100;
//         lotteryConfig.total_prize_pool = calculatedPrizePool;
//         lotteryConfig.estimated_value = calculatedPrizePool;
//         lotteryConfig.prize_description = `${lotteryConfig.revenue_share_percentage}% of $${lotteryConfig.projected_revenue.toLocaleString()} projected revenue`;
        
//         // ✅ Add prize distribution for projected revenue
//         if (data.lottery_config.prize_distribution && data.lottery_config.prize_distribution.length > 0) {
//           lotteryConfig.prize_distribution = data.lottery_config.prize_distribution.map(dist => ({
//             rank: parseInt(dist.rank),
//             percentage: parseFloat(dist.percentage)
//           }));
//         }
//       }

//       electionPayload.lottery_config = lotteryConfig;
      
//       console.log('✅ Lottery Config being sent to backend:', lotteryConfig);
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

//     console.log('✅ Publishing election with complete payload:', electionPayload);

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

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 p-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold mb-2">📋 Election Preview</h2>
//             <p className="text-purple-100">Review your election before publishing</p>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={handleSaveDraft}
//               disabled={loading}
//               className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center gap-2 backdrop-blur-sm"
//             >
//               <FaSave /> {loading ? 'Saving...' : 'Save Draft'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Basic Info Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('basic')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-blue-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
//               <p className="text-sm text-gray-600">{data?.title || 'No title'}</p>
//             </div>
//           </div>
//           {expandedSections.basic ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.basic && (
//           <div className="p-6 space-y-4">
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Election Title</div>
//                 <div className="font-semibold text-gray-900">{data?.title || 'Not set'}</div>
//               </div>
              
//               {getCategoryDetails() && (
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Category</div>
//                   <div className="font-semibold text-gray-900 flex items-center gap-2">
//                     <span className="text-2xl">{getCategoryDetails().icon}</span>
//                     {getCategoryDetails().name}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {data?.description && (
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Description</div>
//                 <div className="text-gray-900">{data.description}</div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Schedule Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('schedule')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaCalendarAlt className="text-orange-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>
//               <p className="text-sm text-gray-600">
//                 {calculateDuration().text}
//               </p>
//             </div>
//           </div>
//           {expandedSections.schedule ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.schedule && (
//           <div className="p-6 space-y-4">
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
//                 <div className="text-sm text-gray-600 mb-1">Start Date & Time</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.start_date} at {data?.start_time}
//                 </div>
//               </div>

//               <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
//                 <div className="text-sm text-gray-600 mb-1">End Date & Time</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.end_date} at {data?.end_time}
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 bg-blue-50 rounded-lg">
//               <div className="text-sm text-gray-600 mb-1">Duration</div>
//               <div className="font-semibold text-gray-900">{calculateDuration().text}</div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Access Control Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('access')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaUsers className="text-purple-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Access Control</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.permission_type === 'public' ? 'Public election' : 
//                  data?.permission_type === 'specific_countries' ? 'Country-specific' : 'Restricted'}
//               </p>
//             </div>
//           </div>
//           {expandedSections.access ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.access && (
//           <div className="p-6 space-y-4">
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="text-sm text-gray-600 mb-1">Permission Type</div>
//               <div className="font-semibold text-gray-900 flex items-center gap-2">
//                 {data?.permission_type === 'public' && '🌍 Public - Anyone can participate'}
//                 {data?.permission_type === 'specific_countries' && '🚩 Country-Specific'}
//                 {data?.permission_type === 'organization_only' && '🏢 Organization Only'}
//               </div>
//             </div>

//             {data?.permission_type === 'specific_countries' && data?.allowed_countries && (
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-2">Allowed Countries</div>
//                 <div className="flex flex-wrap gap-2">
//                   {data.allowed_countries.map((country, idx) => (
//                     <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
//                       {country}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Authentication Method */}
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="text-sm text-gray-600 mb-2">Authentication Method</div>
//               <div className="flex items-center gap-3">
//                 {getAuthMethodDetails().icon}
//                 <div>
//                   <div className="font-semibold text-gray-900">{getAuthMethodDetails().name}</div>
//                   <div className="text-sm text-gray-600">{getAuthMethodDetails().desc}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ============================================
//           PRICING SECTION - WITH CONDITIONAL DISPLAY
//           ============================================ */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('pricing')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaDollarSign className="text-green-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Pricing & Fees</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.pricing_type === 'free' ? 'Free election' : 'Paid participation'}
//               </p>
//             </div>
//           </div>
//           {expandedSections.pricing ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.pricing && (
//           <div className="p-6 space-y-4">
//             {/* Show/Hide Toggle Status - Only visible to creator */}
//             {!data?.show_participation_fee_in_preview && (
//               <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
//                 <FaEyeSlash className="text-yellow-600" />
//                 <p className="text-sm text-yellow-800 font-medium">
//                   Participation fees are hidden from public preview
//                 </p>
//               </div>
//             )}

//             {/* Pricing Type */}
//             <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
//               <div className="text-2xl">
//                 {data?.pricing_type === 'free' ? '🆓' : 
//                  data?.pricing_type === 'general_fee' ? '💵' : '🌍'}
//               </div>
//               <div className="flex-1">
//                 <div className="font-semibold text-gray-800 mb-1">Pricing Model</div>
//                 <div className="text-sm text-gray-600">
//                   {data?.pricing_type === 'free' && 'Free - No participation fee'}
//                   {data?.pricing_type === 'general_fee' && 'General Fee - Same fee for all participants'}
//                   {data?.pricing_type === 'paid_regional' && 'Regional Pricing - Different fees by region'}
//                 </div>
//               </div>
//             </div>

//             {/* ✅ CONDITIONAL DISPLAY - Only show if toggle is ON */}
//             {data?.show_participation_fee_in_preview !== false && (
//               <>
//                 {/* General Fee Display */}
//                 {data?.pricing_type === 'general_fee' && (
//                   <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
//                     <div className="text-center">
//                       <div className="text-sm text-gray-600 mb-1">Participation Fee</div>
//                       <div className="text-3xl font-bold text-green-600">
//                         ${parseFloat(data?.general_participation_fee || 0).toFixed(2)}
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">Per participant</div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Regional Pricing Display */}
//                 {data?.pricing_type === 'paid_regional' && data?.regional_fees && (
//                   <div className="space-y-3">
//                     <div className="text-sm font-medium text-gray-700 mb-2">Regional Fees:</div>
//                     <div className="grid grid-cols-2 gap-3">
//                       {Object.entries(data.regional_fees).map(([region, fee]) => (
//                         <div key={region} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//                           <div className="flex items-center gap-2 mb-1">
//                             <FaGlobe className="text-blue-600 text-sm" />
//                             <div className="text-sm font-medium text-gray-800">
//                               {region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                             </div>
//                           </div>
//                           <div className="text-lg font-bold text-blue-600">
//                             ${parseFloat(fee).toFixed(2)}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}

//             {/* If fees are hidden, show placeholder */}
//             {data?.show_participation_fee_in_preview === false && data?.pricing_type !== 'free' && (
//               <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 text-center">
//                 <FaEyeSlash className="text-gray-400 text-2xl mx-auto mb-2" />
//                 <p className="text-sm text-gray-600 font-medium">
//                   Fee information hidden from public preview
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Fees will be displayed during checkout
//                 </p>
//               </div>
//             )}

//             {/* Processing Fee (always show to creator) */}
//             {data?.processing_fee_percentage > 0 && (
//               <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
//                 <FaExclamationTriangle className="inline mr-1" />
//                 Processing fee: {data.processing_fee_percentage}%
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ============================================
//           LOTTERY SECTION - WITH CONDITIONAL DISPLAY
//           ============================================ */}
//       {data?.lottery_enabled && (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection('lottery')}
//             className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-colors"
//           >
//             <div className="flex items-center gap-3">
//               <FaGift className="text-yellow-600 text-xl" />
//               <div className="text-left">
//                 <h3 className="text-lg font-semibold text-gray-800">Gamify & Prizes</h3>
//                 <p className="text-sm text-gray-600">
//                   {data?.lottery_config?.winner_count || 1} winner(s)
//                 </p>
//               </div>
//             </div>
//             {expandedSections.lottery ? <FaChevronUp /> : <FaChevronDown />}
//           </button>

//           {expandedSections.lottery && (
//             <div className="p-6 space-y-4">
//               {/* Show/Hide Toggle Status - Only visible to creator */}
//               {!data?.show_lottery_prizes_in_preview && (
//                 <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
//                   <FaEyeSlash className="text-yellow-600" />
//                   <p className="text-sm text-yellow-800 font-medium">
//                     Gamity prizes.
//                   </p>
//                 </div>
//               )}

//               {/* Gamify Enabled Badge */}
//               <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
//                 <FaCheckCircle className="text-green-600" />
//                 <span className="text-sm font-medium text-green-800">Gamify Enabled</span>
//               </div>

//               {/* ✅ CONDITIONAL DISPLAY - Only show if toggle is ON */}
//               {data?.show_lottery_prizes_in_preview !== false ? (
//                 <>
//                   {/* Prize Display */}
//                   {(() => {
//                     const prizeInfo = getLotteryPrizeDisplay();
//                     if (!prizeInfo) return null;

//                     return (
//                       <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
//                         <div className="text-center">
//                           <div className="text-5xl mb-3">{prizeInfo.icon}</div>
//                           <div className="text-sm text-gray-600 mb-2">{prizeInfo.type}</div>
//                           <div className="text-4xl font-bold text-yellow-600 mb-2">
//                             {prizeInfo.amount}
//                           </div>
//                           <div className="text-sm text-gray-600">{prizeInfo.description}</div>
//                         </div>
//                       </div>
//                     );
//                   })()}

//                   {/* Winner Count */}
//                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                     <span className="text-sm text-gray-600">Total Winners</span>
//                     <span className="text-lg font-bold text-gray-800">
//                       {data?.lottery_config?.winner_count || 1}
//                     </span>
//                   </div>

//                   {/* Prize Distribution */}
//                   {data?.lottery_config?.prize_distribution && 
//                    data.lottery_config.prize_distribution.length > 0 && (
//                     <div className="space-y-2">
//                       <div className="text-sm font-medium text-gray-700">Prize Distribution:</div>
//                       {data.lottery_config.prize_distribution.map((dist, idx) => {
//                         const prizeInfo = getLotteryPrizeDisplay();
//                         const prizeValue = prizeInfo?.value || 0;
//                         const amount = (prizeValue * dist.percentage) / 100;
                        
//                         return (
//                           <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
//                             <div className="flex items-center gap-3">
//                               <div className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-white font-bold rounded-full text-sm">
//                                 {dist.rank}
//                               </div>
//                               <div>
//                                 <div className="text-sm font-medium text-gray-800">
//                                   {dist.rank === 1 ? '🥇 1st Place' :
//                                    dist.rank === 2 ? '🥈 2nd Place' :
//                                    dist.rank === 3 ? '🥉 3rd Place' :
//                                    `${dist.rank}th Place`}
//                                 </div>
//                                 <div className="text-xs text-gray-600">
//                                   {dist.percentage}% of total prize
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <div className="text-lg font-bold text-yellow-600">
//                                 ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {/* Funding Source */}
//                   <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <span className="text-sm text-gray-600">Prize Funding</span>
//                     <span className="text-sm font-medium text-blue-800">
//                       {data?.lottery_config?.prize_funding_source === 'creator_funded' 
//                         ? '👤 Creator Funded' 
//                         : '💰 Participation Fee Funded'}
//                     </span>
//                   </div>
//                 </>
//               ) : (
//                 /* If lottery is hidden, show placeholder */
//                 <div className="p-6 bg-gray-100 rounded-lg border border-gray-300 text-center">
//                   <FaEyeSlash className="text-gray-400 text-3xl mx-auto mb-3" />
//                   <p className="text-sm text-gray-600 font-medium mb-1">
//                     Gamify prize information hidden from public preview
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     Prize details will be revealed to participants after voting
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Voting Configuration Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('voting')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaVoteYea className="text-indigo-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Voting Configuration</h3>
//               <p className="text-sm text-gray-600">{getVotingMethodDetails().name}</p>
//             </div>
//           </div>
//           {expandedSections.voting ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.voting && (
//           <div className="p-6 space-y-4">
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="flex items-center gap-3 mb-2">
//                 <span className="text-2xl">{getVotingMethodDetails().icon}</span>
//                 <div>
//                   <div className="font-semibold text-gray-900">{getVotingMethodDetails().name}</div>
//                   <div className="text-sm text-gray-600">{getVotingMethodDetails().desc}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Live Results</div>
//                 <div className="font-semibold text-gray-900 flex items-center gap-2">
//                   {data?.show_live_results ? (
//                     <><FaEye className="text-green-600" /> Enabled</>
//                   ) : (
//                     <><FaEyeSlash className="text-gray-400" /> Disabled</>
//                   )}
//                 </div>
//               </div>

//               <div className="p-4 bg-purple-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Vote Editing</div>
//                 <div className="font-semibold text-gray-900 flex items-center gap-2">
//                   {data?.vote_editing_allowed ? (
//                     <><FaCheckCircle className="text-green-600" /> Allowed</>
//                   ) : (
//                     <><FaLock className="text-gray-400" /> Not Allowed</>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Questions Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('questions')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaQuestionCircle className="text-pink-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.questions?.length || 0} question{data?.questions?.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//           </div>
//           {expandedSections.questions ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.questions && (
//           <div className="p-6 space-y-4">
//             {data?.questions && data.questions.length > 0 ? (
//               data.questions.map((question, idx) => (
//                 <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-pink-500">
//                   <div className="flex items-start gap-3">
//                     <div className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white rounded-full font-bold flex-shrink-0">
//                       {idx + 1}
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-semibold text-gray-900 mb-2">{question.question_text}</div>
//                       <div className="text-xs text-gray-500 mb-2">
//                         Type: {question.type} {question.required && '• Required'}
//                       </div>
//                       {question.answers && question.answers.length > 0 && (
//                         <div className="space-y-1">
//                           {question.answers.map((answer, ansIdx) => (
//                             <div key={ansIdx} className="flex items-center gap-2 text-sm text-gray-700">
//                               <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
//                               {answer}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 <FaQuestionCircle className="text-4xl mx-auto mb-2 opacity-50" />
//                 <p>No questions added yet</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-between items-center gap-4 pt-6">
//         <button
//           onClick={onBack}
//           className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
//         >
//           ← Back to Questions
//         </button>

//         <button
//           onClick={handlePublish}
//           disabled={publishing}
//           className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {publishing ? (
//             <>
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               Publishing...
//             </>
//           ) : (
//             <>
//               <FaRocket /> Publish Election
//             </>
//           )}
//         </button>
//       </div>

//       {/* Info Box */}
//       <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
//         <div className="flex items-start gap-3">
//           <FaExclamationTriangle className="text-blue-600 mt-1" />
//           <div>
//             <h4 className="font-semibold text-blue-900 mb-1">Before Publishing</h4>
//             <ul className="text-sm text-blue-800 space-y-1">
//               <li>• Review all election details carefully</li>
//               <li>• Ensure start and end dates are correct</li>
//               <li>• Verify questions and voting options</li>
//               <li>• Check pricing and Gamify configuration</li>
//               <li>• Once published, some changes cannot be undone</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// //last workable files, only to add anonymous ovting this section
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
//     console.log('Show Participation Fee:', data?.show_participation_fee_in_preview);
//     console.log('Show Lottery Prizes:', data?.show_lottery_prizes_in_preview);
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
//     console.log('Gamify config in display function:', config);
    
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

//   // Publish election - ✅ FIXED WITH CORRECT BACKEND FIELD MAPPING
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

//     // ✅ FIXED: Prepare the election payload with correct backend field names
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
        
//         // ✅ Category
//         category_id: data.category_id ? parseInt(data.category_id) : null,
        
//         // ✅ VIDEO WATCH FIELDS - NOW INCLUDED
//         video_watch_required: data.video_watch_required || false,
//         minimum_watch_time: data.minimum_watch_time ? parseInt(data.minimum_watch_time) : 0,
//         minimum_watch_percentage: data.minimum_watch_percentage ? parseFloat(data.minimum_watch_percentage) : 0,
        
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
//         processing_fee_percentage: parseFloat(data.processing_fee_percentage) || 0,
        
//         biometric_required: data.biometric_required || false,
//         show_live_results: data.show_live_results || false,
//         vote_editing_allowed: data.vote_editing_allowed || false,
//         voting_type: data.voting_type || 'plurality',
//         authentication_methods: data.auth_method ? [data.auth_method] : (data.authentication_methods || ['passkey']),
//         slug: data.election_slug,
//         creator_id: currentUserId,
//         creator_type: data.creator_type || currentCreatorType,
//         status: 'published'
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
//         region_code: regionCodeMap[region] || region,
//         region_name: region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//         participation_fee: parseFloat(fee),
//         currency: 'USD'
//       }));
//     }

//     // ✅ FIXED: Add lottery configuration with CORRECT field names matching backend
//     if (data.lottery_enabled && data.lottery_config) {
//       const lotteryConfig = {
//         lottery_enabled: true, // ✅ Changed from is_lotterized
//         prize_funding_source: data.lottery_config.prize_funding_source || 'creator_funded',
//         winner_count: parseInt(data.lottery_config.winner_count) || 1
//       };

//       // ✅ Monetary Prize
//       if (data.lottery_config.reward_type === 'monetary') {
//         lotteryConfig.reward_type = 'monetary';
//         lotteryConfig.total_prize_pool = parseFloat(data.lottery_config.total_prize_pool) || 0; // ✅ Changed from reward_amount
//         lotteryConfig.prize_description = `Cash prize of $${lotteryConfig.total_prize_pool.toLocaleString()}`;
//         lotteryConfig.estimated_value = lotteryConfig.total_prize_pool; // For consistency
        
//         // ✅ Add prize distribution for monetary
//         if (data.lottery_config.prize_distribution && data.lottery_config.prize_distribution.length > 0) {
//           lotteryConfig.prize_distribution = data.lottery_config.prize_distribution.map(dist => ({
//             rank: parseInt(dist.rank),
//             percentage: parseFloat(dist.percentage)
//           }));
//         }
//       } 
//       // ✅ Non-Monetary Prize
//       else if (data.lottery_config.reward_type === 'non_monetary') {
//         lotteryConfig.reward_type = 'non_monetary';
//         lotteryConfig.estimated_value = parseFloat(data.lottery_config.estimated_value) || 0; // ✅ Correct field
//         lotteryConfig.prize_description = data.lottery_config.prize_description || 'Non-monetary prize';
//         lotteryConfig.total_prize_pool = null; // Not applicable for non-monetary
        
//         // ✅ Add non-monetary prizes if they exist
//         if (data.lottery_config.non_monetary_prizes && data.lottery_config.non_monetary_prizes.length > 0) {
//           lotteryConfig.prize_distribution = data.lottery_config.non_monetary_prizes.map(prize => ({
//             rank: parseInt(prize.rank),
//             prize_description: prize.prize_description,
//             prize_value: parseFloat(prize.prize_value)
//           }));
//         }
//       } 
//       // ✅ Projected Revenue
//       else if (data.lottery_config.reward_type === 'projected_revenue') {
//         lotteryConfig.reward_type = 'projected_revenue';
//         lotteryConfig.projected_revenue = parseFloat(data.lottery_config.projected_revenue) || 0; // ✅ Correct field
//         lotteryConfig.revenue_share_percentage = parseFloat(data.lottery_config.revenue_share_percentage) || 0; // ✅ Correct field
        
//         const calculatedPrizePool = (lotteryConfig.projected_revenue * lotteryConfig.revenue_share_percentage) / 100;
//         lotteryConfig.total_prize_pool = calculatedPrizePool;
//         lotteryConfig.estimated_value = calculatedPrizePool;
//         lotteryConfig.prize_description = `${lotteryConfig.revenue_share_percentage}% of $${lotteryConfig.projected_revenue.toLocaleString()} projected revenue`;
        
//         // ✅ Add prize distribution for projected revenue
//         if (data.lottery_config.prize_distribution && data.lottery_config.prize_distribution.length > 0) {
//           lotteryConfig.prize_distribution = data.lottery_config.prize_distribution.map(dist => ({
//             rank: parseInt(dist.rank),
//             percentage: parseFloat(dist.percentage)
//           }));
//         }
//       }

//       electionPayload.lottery_config = lotteryConfig;
      
//       console.log('✅ Lottery Config being sent to backend:', lotteryConfig);
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

//     console.log('✅ Publishing election with complete payload:', electionPayload);

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

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 p-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold mb-2">📋 Election Preview</h2>
//             <p className="text-purple-100">Review your election before publishing</p>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={handleSaveDraft}
//               disabled={loading}
//               className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center gap-2 backdrop-blur-sm"
//             >
//               <FaSave /> {loading ? 'Saving...' : 'Save Draft'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Basic Info Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('basic')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaCheckCircle className="text-blue-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
//               <p className="text-sm text-gray-600">{data?.title || 'No title'}</p>
//             </div>
//           </div>
//           {expandedSections.basic ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.basic && (
//           <div className="p-6 space-y-4">
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Election Title</div>
//                 <div className="font-semibold text-gray-900">{data?.title || 'Not set'}</div>
//               </div>
              
//               {getCategoryDetails() && (
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Category</div>
//                   <div className="font-semibold text-gray-900 flex items-center gap-2">
//                     <span className="text-2xl">{getCategoryDetails().icon}</span>
//                     {getCategoryDetails().name}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {data?.description && (
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Description</div>
//                 <div className="text-gray-900">{data.description}</div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Schedule Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('schedule')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaCalendarAlt className="text-orange-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>
//               <p className="text-sm text-gray-600">
//                 {calculateDuration().text}
//               </p>
//             </div>
//           </div>
//           {expandedSections.schedule ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.schedule && (
//           <div className="p-6 space-y-4">
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
//                 <div className="text-sm text-gray-600 mb-1">Start Date & Time</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.start_date} at {data?.start_time}
//                 </div>
//               </div>

//               <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
//                 <div className="text-sm text-gray-600 mb-1">End Date & Time</div>
//                 <div className="font-semibold text-gray-900">
//                   {data?.end_date} at {data?.end_time}
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 bg-blue-50 rounded-lg">
//               <div className="text-sm text-gray-600 mb-1">Duration</div>
//               <div className="font-semibold text-gray-900">{calculateDuration().text}</div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Access Control Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('access')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaUsers className="text-purple-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Access Control</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.permission_type === 'public' ? 'Public election' : 
//                  data?.permission_type === 'specific_countries' ? 'Country-specific' : 'Restricted'}
//               </p>
//             </div>
//           </div>
//           {expandedSections.access ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.access && (
//           <div className="p-6 space-y-4">
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="text-sm text-gray-600 mb-1">Permission Type</div>
//               <div className="font-semibold text-gray-900 flex items-center gap-2">
//                 {data?.permission_type === 'public' && '🌍 Public - Anyone can participate'}
//                 {data?.permission_type === 'specific_countries' && '🚩 Country-Specific'}
//                 {data?.permission_type === 'organization_only' && '🏢 Organization Only'}
//               </div>
//             </div>

//             {data?.permission_type === 'specific_countries' && data?.allowed_countries && (
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-2">Allowed Countries</div>
//                 <div className="flex flex-wrap gap-2">
//                   {data.allowed_countries.map((country, idx) => (
//                     <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
//                       {country}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Authentication Method */}
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="text-sm text-gray-600 mb-2">Authentication Method</div>
//               <div className="flex items-center gap-3">
//                 {getAuthMethodDetails().icon}
//                 <div>
//                   <div className="font-semibold text-gray-900">{getAuthMethodDetails().name}</div>
//                   <div className="text-sm text-gray-600">{getAuthMethodDetails().desc}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ============================================
//           PRICING SECTION - WITH CONDITIONAL DISPLAY
//           ============================================ */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('pricing')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaDollarSign className="text-green-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Pricing & Fees</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.pricing_type === 'free' ? 'Free election' : 'Paid participation'}
//               </p>
//             </div>
//           </div>
//           {expandedSections.pricing ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.pricing && (
//           <div className="p-6 space-y-4">
//             {/* Show/Hide Toggle Status - Only visible to creator */}
//             {!data?.show_participation_fee_in_preview && (
//               <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
//                 <FaEyeSlash className="text-yellow-600" />
//                 <p className="text-sm text-yellow-800 font-medium">
//                   Participation fees are hidden from public preview
//                 </p>
//               </div>
//             )}

//             {/* Pricing Type */}
//             <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
//               <div className="text-2xl">
//                 {data?.pricing_type === 'free' ? '🆓' : 
//                  data?.pricing_type === 'general_fee' ? '💵' : '🌍'}
//               </div>
//               <div className="flex-1">
//                 <div className="font-semibold text-gray-800 mb-1">Pricing Model</div>
//                 <div className="text-sm text-gray-600">
//                   {data?.pricing_type === 'free' && 'Free - No participation fee'}
//                   {data?.pricing_type === 'general_fee' && 'General Fee - Same fee for all participants'}
//                   {data?.pricing_type === 'paid_regional' && 'Regional Pricing - Different fees by region'}
//                 </div>
//               </div>
//             </div>

//             {/* ✅ CONDITIONAL DISPLAY - Only show if toggle is ON */}
//             {data?.show_participation_fee_in_preview !== false && (
//               <>
//                 {/* General Fee Display */}
//                 {data?.pricing_type === 'general_fee' && (
//                   <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
//                     <div className="text-center">
//                       <div className="text-sm text-gray-600 mb-1">Participation Fee</div>
//                       <div className="text-3xl font-bold text-green-600">
//                         ${parseFloat(data?.general_participation_fee || 0).toFixed(2)}
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">Per participant</div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Regional Pricing Display */}
//                 {data?.pricing_type === 'paid_regional' && data?.regional_fees && (
//                   <div className="space-y-3">
//                     <div className="text-sm font-medium text-gray-700 mb-2">Regional Fees:</div>
//                     <div className="grid grid-cols-2 gap-3">
//                       {Object.entries(data.regional_fees).map(([region, fee]) => (
//                         <div key={region} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//                           <div className="flex items-center gap-2 mb-1">
//                             <FaGlobe className="text-blue-600 text-sm" />
//                             <div className="text-sm font-medium text-gray-800">
//                               {region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                             </div>
//                           </div>
//                           <div className="text-lg font-bold text-blue-600">
//                             ${parseFloat(fee).toFixed(2)}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}

//             {/* If fees are hidden, show placeholder */}
//             {data?.show_participation_fee_in_preview === false && data?.pricing_type !== 'free' && (
//               <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 text-center">
//                 <FaEyeSlash className="text-gray-400 text-2xl mx-auto mb-2" />
//                 <p className="text-sm text-gray-600 font-medium">
//                   Fee information hidden from public preview
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Fees will be displayed during checkout
//                 </p>
//               </div>
//             )}

//             {/* Processing Fee (always show to creator) */}
//             {data?.processing_fee_percentage > 0 && (
//               <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
//                 <FaExclamationTriangle className="inline mr-1" />
//                 Processing fee: {data.processing_fee_percentage}%
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ============================================
//           LOTTERY SECTION - WITH CONDITIONAL DISPLAY
//           ============================================ */}
//       {data?.lottery_enabled && (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection('lottery')}
//             className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-colors"
//           >
//             <div className="flex items-center gap-3">
//               <FaGift className="text-yellow-600 text-xl" />
//               <div className="text-left">
//                 <h3 className="text-lg font-semibold text-gray-800">Gamify & Prizes</h3>
//                 <p className="text-sm text-gray-600">
//                   {data?.lottery_config?.winner_count || 1} winner(s)
//                 </p>
//               </div>
//             </div>
//             {expandedSections.lottery ? <FaChevronUp /> : <FaChevronDown />}
//           </button>

//           {expandedSections.lottery && (
//             <div className="p-6 space-y-4">
//               {/* Show/Hide Toggle Status - Only visible to creator */}
//               {!data?.show_lottery_prizes_in_preview && (
//                 <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
//                   <FaEyeSlash className="text-yellow-600" />
//                   <p className="text-sm text-yellow-800 font-medium">
//                     Gamity prizes.
//                   </p>
//                 </div>
//               )}

//               {/* Gamify Enabled Badge */}
//               <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
//                 <FaCheckCircle className="text-green-600" />
//                 <span className="text-sm font-medium text-green-800">Gamify Enabled</span>
//               </div>

//               {/* ✅ CONDITIONAL DISPLAY - Only show if toggle is ON */}
//               {data?.show_lottery_prizes_in_preview !== false ? (
//                 <>
//                   {/* Prize Display */}
//                   {(() => {
//                     const prizeInfo = getLotteryPrizeDisplay();
//                     if (!prizeInfo) return null;

//                     return (
//                       <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
//                         <div className="text-center">
//                           <div className="text-5xl mb-3">{prizeInfo.icon}</div>
//                           <div className="text-sm text-gray-600 mb-2">{prizeInfo.type}</div>
//                           <div className="text-4xl font-bold text-yellow-600 mb-2">
//                             {prizeInfo.amount}
//                           </div>
//                           <div className="text-sm text-gray-600">{prizeInfo.description}</div>
//                         </div>
//                       </div>
//                     );
//                   })()}

//                   {/* Winner Count */}
//                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                     <span className="text-sm text-gray-600">Total Winners</span>
//                     <span className="text-lg font-bold text-gray-800">
//                       {data?.lottery_config?.winner_count || 1}
//                     </span>
//                   </div>

//                   {/* Prize Distribution */}
//                   {data?.lottery_config?.prize_distribution && 
//                    data.lottery_config.prize_distribution.length > 0 && (
//                     <div className="space-y-2">
//                       <div className="text-sm font-medium text-gray-700">Prize Distribution:</div>
//                       {data.lottery_config.prize_distribution.map((dist, idx) => {
//                         const prizeInfo = getLotteryPrizeDisplay();
//                         const prizeValue = prizeInfo?.value || 0;
//                         const amount = (prizeValue * dist.percentage) / 100;
                        
//                         return (
//                           <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
//                             <div className="flex items-center gap-3">
//                               <div className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-white font-bold rounded-full text-sm">
//                                 {dist.rank}
//                               </div>
//                               <div>
//                                 <div className="text-sm font-medium text-gray-800">
//                                   {dist.rank === 1 ? '🥇 1st Place' :
//                                    dist.rank === 2 ? '🥈 2nd Place' :
//                                    dist.rank === 3 ? '🥉 3rd Place' :
//                                    `${dist.rank}th Place`}
//                                 </div>
//                                 <div className="text-xs text-gray-600">
//                                   {dist.percentage}% of total prize
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <div className="text-lg font-bold text-yellow-600">
//                                 ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {/* Funding Source */}
//                   <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <span className="text-sm text-gray-600">Prize Funding</span>
//                     <span className="text-sm font-medium text-blue-800">
//                       {data?.lottery_config?.prize_funding_source === 'creator_funded' 
//                         ? '👤 Creator Funded' 
//                         : '💰 Participation Fee Funded'}
//                     </span>
//                   </div>
//                 </>
//               ) : (
//                 /* If lottery is hidden, show placeholder */
//                 <div className="p-6 bg-gray-100 rounded-lg border border-gray-300 text-center">
//                   <FaEyeSlash className="text-gray-400 text-3xl mx-auto mb-3" />
//                   <p className="text-sm text-gray-600 font-medium mb-1">
//                     Gamify prize information hidden from public preview
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     Prize details will be revealed to participants after voting
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Voting Configuration Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('voting')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaVoteYea className="text-indigo-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Voting Configuration</h3>
//               <p className="text-sm text-gray-600">{getVotingMethodDetails().name}</p>
//             </div>
//           </div>
//           {expandedSections.voting ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.voting && (
//           <div className="p-6 space-y-4">
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="flex items-center gap-3 mb-2">
//                 <span className="text-2xl">{getVotingMethodDetails().icon}</span>
//                 <div>
//                   <div className="font-semibold text-gray-900">{getVotingMethodDetails().name}</div>
//                   <div className="text-sm text-gray-600">{getVotingMethodDetails().desc}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Live Results</div>
//                 <div className="font-semibold text-gray-900 flex items-center gap-2">
//                   {data?.show_live_results ? (
//                     <><FaEye className="text-green-600" /> Enabled</>
//                   ) : (
//                     <><FaEyeSlash className="text-gray-400" /> Disabled</>
//                   )}
//                 </div>
//               </div>

//               <div className="p-4 bg-purple-50 rounded-lg">
//                 <div className="text-sm text-gray-600 mb-1">Vote Editing</div>
//                 <div className="font-semibold text-gray-900 flex items-center gap-2">
//                   {data?.vote_editing_allowed ? (
//                     <><FaCheckCircle className="text-green-600" /> Allowed</>
//                   ) : (
//                     <><FaLock className="text-gray-400" /> Not Allowed</>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Questions Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <button
//           onClick={() => toggleSection('questions')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
//         >
//           <div className="flex items-center gap-3">
//             <FaQuestionCircle className="text-pink-600 text-xl" />
//             <div className="text-left">
//               <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
//               <p className="text-sm text-gray-600">
//                 {data?.questions?.length || 0} question{data?.questions?.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//           </div>
//           {expandedSections.questions ? <FaChevronUp /> : <FaChevronDown />}
//         </button>

//         {expandedSections.questions && (
//           <div className="p-6 space-y-4">
//             {data?.questions && data.questions.length > 0 ? (
//               data.questions.map((question, idx) => (
//                 <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-pink-500">
//                   <div className="flex items-start gap-3">
//                     <div className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white rounded-full font-bold flex-shrink-0">
//                       {idx + 1}
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-semibold text-gray-900 mb-2">{question.question_text}</div>
//                       <div className="text-xs text-gray-500 mb-2">
//                         Type: {question.type} {question.required && '• Required'}
//                       </div>
//                       {question.answers && question.answers.length > 0 && (
//                         <div className="space-y-1">
//                           {question.answers.map((answer, ansIdx) => (
//                             <div key={ansIdx} className="flex items-center gap-2 text-sm text-gray-700">
//                               <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
//                               {answer}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 <FaQuestionCircle className="text-4xl mx-auto mb-2 opacity-50" />
//                 <p>No questions added yet</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-between items-center gap-4 pt-6">
//         <button
//           onClick={onBack}
//           className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
//         >
//           ← Back to Questions
//         </button>

//         <button
//           onClick={handlePublish}
//           disabled={publishing}
//           className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {publishing ? (
//             <>
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               Publishing...
//             </>
//           ) : (
//             <>
//               <FaRocket /> Publish Election
//             </>
//           )}
//         </button>
//       </div>

//       {/* Info Box */}
//       <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
//         <div className="flex items-start gap-3">
//           <FaExclamationTriangle className="text-blue-600 mt-1" />
//           <div>
//             <h4 className="font-semibold text-blue-900 mb-1">Before Publishing</h4>
//             <ul className="text-sm text-blue-800 space-y-1">
//               <li>• Review all election details carefully</li>
//               <li>• Ensure start and end dates are correct</li>
//               <li>• Verify questions and voting options</li>
//               <li>• Check pricing and Gamify configuration</li>
//               <li>• Once published, some changes cannot be undone</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

