// src/utils/electionDataTransform.js

/**
 * Transform Redux state to database-ready format
 */
export const transformElectionDataForPublish = (step1, step2, step3, userData) => {
  const publishData = {
    // Main Election Data (votteryyy_elections)
    election: {
      // From Step 1
      title: step1.title,
      description: step1.description,
      topic_image_url: step1.topic_image_url || null,
      topic_video_url: step1.topic_video_url || null,
      logo_url: step1.logo_url || null,
      start_date: step1.start_date,
      start_time: step1.start_time,
      end_date: step1.end_date,
      end_time: step1.end_time,
      timezone: step1.timezone,
      
      // From Step 2
      permission_type: step2.permission_type,
      allowed_countries: step2.permission_type === 'specific_countries' ? step2.allowed_countries : null,
      is_free: step2.pricing_type === 'free',
      pricing_type: step2.pricing_type,
      general_participation_fee: step2.pricing_type === 'paid_general' ? step2.general_participation_fee : 0,
      biometric_required: step2.biometric_required || false,
      show_live_results: step2.show_live_results || false,
      vote_editing_allowed: step2.vote_editing_allowed || false,
      
      // From Step 3
      voting_type: step3.voting_type,
      authentication_methods: [step3.auth_method],
      slug: step3.election_slug,
      
      // From userData
      creator_id: userData.userId,
      creator_type: userData.creatorType || 'individual',
      
      // Status
      status: 'published',
    },

    // Questions Data (votteryy_election_questions + votteryy_election_options)
    questions: transformQuestions(step3.questions),

    // Regional Pricing (votteryy_election_regional_pricing)
    regional_pricing: step2.pricing_type === 'paid_regional' ? transformRegionalPricing(step2.regional_fees) : null,

    // Lottery Configuration (votteryy_election_lottery_config)
    lottery_config: step2.lottery_enabled ? transformLotteryConfig(step2.lottery_config) : null,

    // Custom URL (votteryy_election_custom_urls)
    custom_url: {
      custom_slug: step3.election_slug,
      is_active: true,
    },

    // Access Rules (votteryy_election_access_rules)
    access_rules: transformAccessRules(step2),

    // Category Mapping (votteryy_election_category_mapping)
    category_id: step2.category_id,
  };

  return publishData;
};

/**
 * Transform questions with their options
 */
const transformQuestions = (questions) => {
  if (!questions || questions.length === 0) return [];

  return questions.map((q, index) => ({
    question_text: q.question_text,
    question_type: mapQuestionType(q.type),
    question_order: index + 1,
    is_required: q.required !== undefined ? q.required : true,
    max_selections: q.type === 'mcq' ? 1 : null,
    options: q.answers
      .filter(answer => answer && answer.trim())
      .map((answer, optIndex) => ({
        option_text: answer,
        option_image_url: q.images && q.images[optIndex] ? q.images[optIndex] : null,
        option_order: optIndex + 1,
      })),
  }));
};

/**
 * Map frontend question types to database types
 */
const mapQuestionType = (frontendType) => {
  const typeMap = {
    'mcq': 'multiple_choice',
    'text': 'open_text',
    'image': 'image_based',
    'comparison': 'multiple_choice', // Comparison can be treated as multiple choice
  };
  return typeMap[frontendType] || 'multiple_choice';
};

/**
 * Transform regional pricing
 */
const transformRegionalPricing = (regionalFees) => {
  if (!regionalFees) return [];

  const regionCodeMap = {
    'north_america': 'region_1_us_canada',
    'western_europe': 'region_2_western_europe',
    'australia_nz': 'region_7_australasia',
    'middle_east': 'region_6_middle_east_asia',
    'eastern_europe': 'region_3_eastern_europe',
    'latin_america': 'region_5_latin_america',
    'asia': 'region_6_middle_east_asia',
    'africa': 'region_4_africa',
  };

  const regionNameMap = {
    'north_america': 'North America',
    'western_europe': 'Western Europe',
    'australia_nz': 'Australasia',
    'middle_east': 'Middle East & Asia',
    'eastern_europe': 'Eastern Europe',
    'latin_america': 'Latin America',
    'asia': 'Middle East & Asia',
    'africa': 'Africa',
  };

  return Object.entries(regionalFees).map(([zoneId, fee]) => ({
    region_code: regionCodeMap[zoneId] || zoneId,
    region_name: regionNameMap[zoneId] || zoneId,
    participation_fee: parseFloat(fee),
    currency: 'USD',
  }));
};

/**
 * Transform lottery configuration
 */
const transformLotteryConfig = (lotteryConfig) => {
  if (!lotteryConfig) return null;

  const config = {
    is_lotterized: true,
    winner_count: lotteryConfig.winner_count || 1,
    lottery_machine_visible: true,
    auto_trigger_at_end: true,
  };

  // Prize funding source
  if (lotteryConfig.prize_funding_source === 'creator_funded') {
    config.reward_type = lotteryConfig.reward_type;

    if (lotteryConfig.reward_type === 'monetary') {
      config.reward_amount = lotteryConfig.total_prize_pool;
      config.prize_pool_total = lotteryConfig.total_prize_pool;
    } else if (lotteryConfig.reward_type === 'non_monetary') {
      config.reward_description = lotteryConfig.prize_description;
      config.reward_amount = lotteryConfig.estimated_value;
    } else if (lotteryConfig.reward_type === 'projected_revenue') {
      config.reward_amount = lotteryConfig.projected_revenue;
      config.prize_pool_total = lotteryConfig.projected_revenue * (lotteryConfig.revenue_share_percentage / 100);
    }
  } else if (lotteryConfig.prize_funding_source === 'participation_fee_funded') {
    config.reward_type = 'monetary';
    config.reward_description = 'Prize pool funded by participation fees';
  }

  return config;
};

/**
 * Transform access rules
 */
const transformAccessRules = (step2Data) => {
  const rules = [];

  if (step2Data.permission_type === 'specific_countries' && step2Data.allowed_countries) {
    step2Data.allowed_countries.forEach(country => {
      rules.push({
        rule_type: 'country',
        rule_value: country,
      });
    });
  }

  return rules.length > 0 ? rules : null;
};

/**
 * Prepare draft data for saving
 */
export const prepareDraftData = (step1, step2, step3, currentStep, completedSteps) => {
  return {
    draft_data: {
      step1: step1 || {},
      step2: step2 || {},
      step3: step3 || {},
      current_step: currentStep,
      completed_steps: completedSteps || [],
      last_saved: new Date().toISOString(),
    },
  };
};

/**
 * Validate complete election data before publish
 */
export const validateElectionData = (step1, step2, step3) => {
  const errors = {};

  // Step 1 Validation
  if (!step1.title || step1.title.trim().length < 10) {
    errors.title = 'Title must be at least 10 characters';
  }
  if (!step1.description || step1.description.trim().length < 50) {
    errors.description = 'Description must be at least 50 characters';
  }
  if (!step1.start_date || !step1.start_time) {
    errors.schedule = 'Start date and time are required';
  }
  if (!step1.end_date || !step1.end_time) {
    errors.schedule = 'End date and time are required';
  }

  // Step 2 Validation
  if (!step2.category_id) {
    errors.category = 'Please select a category';
  }
  if (!step2.permission_type) {
    errors.permission = 'Please select who can participate';
  }
  if (!step2.pricing_type) {
    errors.pricing = 'Please select pricing type';
  }

  // Step 3 Validation
  if (!step3.auth_method) {
    errors.auth = 'Please select authentication method';
  }
  if (!step3.voting_type) {
    errors.voting = 'Please select voting method';
  }
  if (!step3.questions || step3.questions.length === 0) {
    errors.questions = 'At least one question is required';
  }
  if (!step3.election_slug) {
    errors.slug = 'Election slug is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Get image/video file from data
 */
export const extractMediaFiles = (step1Data) => {
  const files = {};

  if (step1Data.topic_image && step1Data.topic_image instanceof File) {
    files.topic_image = step1Data.topic_image;
  }

  if (step1Data.topic_video && step1Data.topic_video instanceof File) {
    files.topic_video = step1Data.topic_video;
  }

  if (step1Data.logo && step1Data.logo instanceof File) {
    files.logo = step1Data.logo;
  }

  return files;
};

/**
 * Calculate election statistics
 */
export const calculateElectionStats = (step1, step2, step3) => {
  const stats = {
    duration_days: 0,
    total_questions: 0,
    total_options: 0,
    estimated_participants: 0,
    prize_pool: 0,
  };

  // Calculate duration
  if (step1.start_date && step1.start_time && step1.end_date && step1.end_time) {
    const start = new Date(`${step1.start_date}T${step1.start_time}`);
    const end = new Date(`${step1.end_date}T${step1.end_time}`);
    const diffTime = Math.abs(end - start);
    stats.duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Count questions and options
  if (step3.questions) {
    stats.total_questions = step3.questions.length;
    stats.total_options = step3.questions.reduce((sum, q) => {
      return sum + (q.answers ? q.answers.filter(a => a && a.trim()).length : 0);
    }, 0);
  }

  // Prize pool
  if (step2.lottery_enabled && step2.lottery_config) {
    if (step2.lottery_config.reward_type === 'monetary') {
      stats.prize_pool = step2.lottery_config.total_prize_pool || 0;
    } else if (step2.lottery_config.reward_type === 'non_monetary') {
      stats.prize_pool = step2.lottery_config.estimated_value || 0;
    } else if (step2.lottery_config.reward_type === 'projected_revenue') {
      stats.prize_pool = (step2.lottery_config.projected_revenue || 0) * 
                        ((step2.lottery_config.revenue_share_percentage || 0) / 100);
    }
  }

  return stats;
};