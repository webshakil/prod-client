// src/components/election/Step2Configuration.jsx - MAIN FILE
// ✅ FIXED: Gamification section completely removed (no trace) when paid pricing is selected
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';


import { AccessControl, BiometricAuth, CategorySelection } from '../../../../election/Step2Configuration/Step2Configuration-Part1';
import PricingConfiguration from '../../../../election/Step2Configuration/Step2Configuration-Part2';
import LotteryConfiguration from '../../../../election/Step2Configuration/Step2Configuration-Part3-LotteryFull';
import { PreviewSettings, ResultsFeatures } from '../../../../election/Step2Configuration/Step2Configuration-Part4-Final';

export default function Step2Configuration({ data, updateData, onNext, onBack, eligibility }) {
  const [errors, setErrors] = useState({});
  const [regionalFees, setRegionalFees] = useState(data.regional_fees || {});
  
  // ✅ Monetary & Revenue Share: Percentage distribution
  const [prizeDistribution, setPrizeDistribution] = useState(
    data.lottery_config?.prize_distribution || []
  );
  
  // ✅ Non-Monetary: Individual prize descriptions with values
  const [nonMonetaryPrizes, setNonMonetaryPrizes] = useState(
    data.lottery_config?.non_monetary_prizes || []
  );
  
  // Track individual field errors
  const [percentageErrors, setPercentageErrors] = useState({});
  const [nonMonetaryErrors, setNonMonetaryErrors] = useState({});
  
  // Show/Hide pricing in preview toggles
  const [showParticipationFeeInPreview, setShowParticipationFeeInPreview] = useState(
    data.show_participation_fee_in_preview !== false
  );
  const [showLotteryPrizesInPreview, setShowLotteryPrizesInPreview] = useState(
    data.show_lottery_prizes_in_preview !== false
  );

  // ✅ FIXED: Check if gamification should be completely hidden (no trace)
  // Using correct values: 'general_fee' and 'regional_fee'
  const isGamificationDisabled = data.pricing_type === 'general_fee' || data.pricing_type === 'regional_fee';

  // ✅ Auto-disable and clear lottery when paid pricing is selected (silently, no toast)
  useEffect(() => {
    if (isGamificationDisabled && data.lottery_enabled) {
      updateData({
        lottery_enabled: false,
        lottery_config: null
      });
      // ✅ REMOVED: No toast message - complete silent wipe
    }
  }, [data.pricing_type, isGamificationDisabled]);

  // Initialize regional fees with defaults if needed
  useEffect(() => {
    if (data.pricing_type === 'regional_fee' && Object.keys(regionalFees).length === 0) {
      const REGIONAL_ZONES = [
        { id: 'north_america', name: 'North America', default_fee: 5.00 },
        { id: 'western_europe', name: 'Western Europe', default_fee: 4.50 },
        { id: 'australia_nz', name: 'Australia & New Zealand', default_fee: 4.00 },
        { id: 'middle_east', name: 'Middle East', default_fee: 3.50 },
        { id: 'eastern_europe', name: 'Eastern Europe', default_fee: 2.50 },
        { id: 'latin_america', name: 'Latin America', default_fee: 2.00 },
        { id: 'asia', name: 'Asia', default_fee: 1.50 },
        { id: 'africa', name: 'Africa', default_fee: 1.00 }
      ];
      const defaultFees = {};
      REGIONAL_ZONES.forEach(zone => {
        defaultFees[zone.id] = zone.default_fee;
      });
      setRegionalFees(defaultFees);
      updateData({ regional_fees: defaultFees });
    }
    
    setShowParticipationFeeInPreview(data.show_participation_fee_in_preview !== false);
    setShowLotteryPrizesInPreview(data.show_lottery_prizes_in_preview !== false);
  }, [data.pricing_type]);

  // ✅ Auto-set prize_funding_source to 'creator_funded' when lottery is enabled
  useEffect(() => {
    if (data.lottery_enabled && !data.lottery_config?.prize_funding_source) {
      updateData({
        lottery_config: {
          ...data.lottery_config,
          prize_funding_source: 'creator_funded'
        }
      });
    }
  }, [data.lottery_enabled]);

  // ✅ Initialize prize distribution for MONETARY & REVENUE SHARE
  useEffect(() => {
    const rewardType = data.lottery_config?.reward_type;
    const winnerCount = data.lottery_config?.winner_count || 1;
    
    // Only for monetary and projected_revenue
    if ((rewardType === 'monetary' || rewardType === 'projected_revenue') && prizeDistribution.length !== winnerCount) {
      const newDistribution = [];
      for (let i = 0; i < winnerCount; i++) {
        newDistribution.push({
          rank: i + 1,
          percentage: prizeDistribution[i]?.percentage || 0
        });
      }
      setPrizeDistribution(newDistribution);
      updateData({
        lottery_config: {
          ...data.lottery_config,
          prize_distribution: newDistribution
        }
      });
    }
  }, [data.lottery_config?.winner_count, data.lottery_config?.reward_type]);

  // ✅ Initialize non-monetary prizes
  useEffect(() => {
    const rewardType = data.lottery_config?.reward_type;
    const winnerCount = data.lottery_config?.winner_count || 1;
    
    // Only for non_monetary
    if (rewardType === 'non_monetary' && nonMonetaryPrizes.length !== winnerCount) {
      const newPrizes = [];
      for (let i = 0; i < winnerCount; i++) {
        newPrizes.push({
          rank: i + 1,
          prize_description: nonMonetaryPrizes[i]?.prize_description || '',
          prize_value: nonMonetaryPrizes[i]?.prize_value || 0
        });
      }
      setNonMonetaryPrizes(newPrizes);
      updateData({
        lottery_config: {
          ...data.lottery_config,
          non_monetary_prizes: newPrizes
        }
      });
    }
  }, [data.lottery_config?.winner_count, data.lottery_config?.reward_type]);

  // ============================================
  // VALIDATION
  // ============================================

  const validatePrizeDistribution = () => {
    const rewardType = data.lottery_config?.reward_type;
    
    // Validate MONETARY & REVENUE SHARE percentage distribution
    if (rewardType === 'monetary' || rewardType === 'projected_revenue') {
      const total = prizeDistribution.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0);
      
      if (total > 100) {
        return {
          valid: false,
          message: `Total percentage is ${total.toFixed(2)}% which exceeds 100%. Please adjust.`
        };
      }

      for (let i = 0; i < prizeDistribution.length - 1; i++) {
        const current = parseFloat(prizeDistribution[i].percentage) || 0;
        const next = parseFloat(prizeDistribution[i + 1].percentage) || 0;
        
        if (current < next) {
          return {
            valid: false,
            message: `Rank ${i + 1} (${current}%) cannot be less than Rank ${i + 2} (${next}%). Must be in descending order.`
          };
        }
      }

      const allSet = prizeDistribution.every(item => item.percentage !== undefined && item.percentage !== '');
      if (!allSet) {
        return {
          valid: false,
          message: 'Please set percentage for all winners'
        };
      }
    }
    
    // Validate NON-MONETARY individual prizes
    if (rewardType === 'non_monetary') {
      const totalValue = parseFloat(data.lottery_config?.estimated_value) || 0;
      const distributedValue = nonMonetaryPrizes.reduce((sum, item) => sum + (parseFloat(item.prize_value) || 0), 0);
      
      if (distributedValue > totalValue) {
        return {
          valid: false,
          message: `Total prize value ($${distributedValue.toLocaleString()}) exceeds estimated value ($${totalValue.toLocaleString()})`
        };
      }

      // Check all prizes have description and value
      for (let prize of nonMonetaryPrizes) {
        if (!prize.prize_description || !prize.prize_description.trim()) {
          return {
            valid: false,
            message: 'All prizes must have a description'
          };
        }
        if (!prize.prize_value || prize.prize_value <= 0) {
          return {
            valid: false,
            message: 'All prizes must have a value greater than 0'
          };
        }
      }

      // Check descending order
      for (let i = 0; i < nonMonetaryPrizes.length - 1; i++) {
        const current = parseFloat(nonMonetaryPrizes[i].prize_value) || 0;
        const next = parseFloat(nonMonetaryPrizes[i + 1].prize_value) || 0;
        
        if (current < next) {
          return {
            valid: false,
            message: `Rank ${i + 1} value ($${current}) cannot be less than Rank ${i + 2} value ($${next}). Must be in descending order.`
          };
        }
      }
    }

    return { valid: true };
  };

  const validateStep = () => {
    const newErrors = {};

    // Category validation
    if (!data.category_id) {
      newErrors.category_id = 'Please select an election category';
    }

    // Permission type validation
    if (!data.permission_type) {
      newErrors.permission_type = 'Please select who can participate';
    }

    if (data.permission_type === 'specific_countries' && (!data.allowed_countries || data.allowed_countries.length === 0)) {
      newErrors.allowed_countries = 'Please select at least one country';
    }

    // Pricing validation
    if (!data.pricing_type) {
      newErrors.pricing_type = 'Please select a pricing type';
    }

    // ✅ FIXED: Using correct value 'general_fee'
    if (data.pricing_type === 'general_fee' && (!data.general_participation_fee || data.general_participation_fee <= 0)) {
      newErrors.general_participation_fee = 'Please enter a valid participation fee';
    }

    // ✅ FIXED: Using correct value 'regional_fee'
    if (data.pricing_type === 'regional_fee') {
      const REGIONAL_ZONES = [
        { id: 'north_america' }, { id: 'western_europe' }, { id: 'australia_nz' },
        { id: 'middle_east' }, { id: 'eastern_europe' }, { id: 'latin_america' },
        { id: 'asia' }, { id: 'africa' }
      ];
      const invalidRegions = REGIONAL_ZONES.filter(zone => 
        !regionalFees[zone.id] || regionalFees[zone.id] <= 0
      );
      if (invalidRegions.length > 0) {
        newErrors.regional_fees = `Please enter valid fees for all regions`;
      }
    }

    // ✅ Lottery validation - only validate if lottery is enabled AND pricing is FREE
    if (data.lottery_enabled && !isGamificationDisabled) {
      if (!data.lottery_config?.reward_type) {
        newErrors.lottery_reward_type = 'Please select a reward type';
      }

      if (data.lottery_config?.reward_type === 'monetary') {
        if (!data.lottery_config?.total_prize_pool || data.lottery_config.total_prize_pool <= 0) {
          newErrors.lottery_prize_pool = 'Please enter a valid prize pool amount';
        }
      }

      if (data.lottery_config?.reward_type === 'non_monetary') {
        if (!data.lottery_config?.estimated_value || data.lottery_config.estimated_value <= 0) {
          newErrors.lottery_estimated_value = 'Please enter estimated value';
        }
      }

      if (data.lottery_config?.reward_type === 'projected_revenue') {
        if (!data.lottery_config?.projected_revenue || data.lottery_config.projected_revenue <= 0) {
          newErrors.lottery_projected_revenue = 'Please enter projected revenue';
        }
      }

      if (!data.lottery_config?.winner_count || data.lottery_config.winner_count < 1 || data.lottery_config.winner_count > 100) {
        newErrors.lottery_winner_count = 'Winner count must be between 1 and 100';
      }

      const distributionValidation = validatePrizeDistribution();
      if (!distributionValidation.valid) {
        newErrors.prize_distribution = distributionValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) {
      toast.error('Please fix all errors before continuing');
      return;
    }
    
    updateData({
      show_participation_fee_in_preview: showParticipationFeeInPreview,
      show_lottery_prizes_in_preview: showLotteryPrizesInPreview
    });
    
    onNext();
  };

  // Shared props for all components
  const sharedProps = {
    data,
    updateData,
    errors,
    eligibility
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-3xl">⚙️</span>
          Election Configuration
        </h2>
        <p className="text-gray-600">
          Configure category, access control, pricing, and special features
        </p>
      </div>

      {/* Category Selection */}
      <CategorySelection {...sharedProps} />

      {/* Access Control */}
      <AccessControl {...sharedProps} />

      {/* Biometric Authentication */}
      <BiometricAuth {...sharedProps} />

      {/* Pricing Configuration */}
      <PricingConfiguration 
        {...sharedProps}
        regionalFees={regionalFees}
        setRegionalFees={setRegionalFees}
      />

      {/* ✅ GAMIFICATION SECTION - COMPLETELY HIDDEN when pricing is PAID (no trace) */}
      {!isGamificationDisabled && (
        <LotteryConfiguration
          {...sharedProps}
          prizeDistribution={prizeDistribution}
          setPrizeDistribution={setPrizeDistribution}
          nonMonetaryPrizes={nonMonetaryPrizes}
          setNonMonetaryPrizes={setNonMonetaryPrizes}
          percentageErrors={percentageErrors}
          setPercentageErrors={setPercentageErrors}
          nonMonetaryErrors={nonMonetaryErrors}
          setNonMonetaryErrors={setNonMonetaryErrors}
        />
      )}

      {/* ✅ Preview Display Settings - Pass isGamificationDisabled to hide lottery preview option */}
      <PreviewSettings
        showParticipationFeeInPreview={showParticipationFeeInPreview}
        setShowParticipationFeeInPreview={setShowParticipationFeeInPreview}
        showLotteryPrizesInPreview={showLotteryPrizesInPreview}
        setShowLotteryPrizesInPreview={setShowLotteryPrizesInPreview}
        isGamificationDisabled={isGamificationDisabled}
      />

      {/* Results & Features */}
      <ResultsFeatures {...sharedProps} />

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md"
        >
          ← Back
        </button>

        <button
          onClick={handleContinue}
          className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
        >
          Continue to Questions
          <FaCheckCircle />
        </button>
      </div>
    </div>
  );
}
//last successful code only to wipe out gamification section above code
// // src/components/election/Step2Configuration.jsx - MAIN FILE
// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import {
//   FaCheckCircle,
//   FaInfoCircle,
//   FaLock,
//   FaGift,
//   FaTrophy,
//   FaCoins
// } from 'react-icons/fa';


// import { AccessControl, BiometricAuth, CategorySelection } from '../../../../election/Step2Configuration/Step2Configuration-Part1';
// import PricingConfiguration from '../../../../election/Step2Configuration/Step2Configuration-Part2';
// import LotteryConfiguration from '../../../../election/Step2Configuration/Step2Configuration-Part3-LotteryFull';
// import { PreviewSettings, ResultsFeatures } from '../../../../election/Step2Configuration/Step2Configuration-Part4-Final';

// export default function Step2Configuration({ data, updateData, onNext, onBack, eligibility }) {
//   const [errors, setErrors] = useState({});
//   const [regionalFees, setRegionalFees] = useState(data.regional_fees || {});
  
//   // ✅ Monetary & Revenue Share: Percentage distribution
//   const [prizeDistribution, setPrizeDistribution] = useState(
//     data.lottery_config?.prize_distribution || []
//   );
  
//   // ✅ Non-Monetary: Individual prize descriptions with values
//   const [nonMonetaryPrizes, setNonMonetaryPrizes] = useState(
//     data.lottery_config?.non_monetary_prizes || []
//   );
  
//   // Track individual field errors
//   const [percentageErrors, setPercentageErrors] = useState({});
//   const [nonMonetaryErrors, setNonMonetaryErrors] = useState({});
  
//   // Show/Hide pricing in preview toggles
//   const [showParticipationFeeInPreview, setShowParticipationFeeInPreview] = useState(
//     data.show_participation_fee_in_preview !== false
//   );
//   const [showLotteryPrizesInPreview, setShowLotteryPrizesInPreview] = useState(
//     data.show_lottery_prizes_in_preview !== false
//   );

//   // ✅ FIXED: Check if gamification should be disabled 
//   // Using correct values: 'general_fee' and 'regional_fee'
//   const isGamificationDisabled = data.pricing_type === 'general_fee' || data.pricing_type === 'regional_fee';

//   // ✅ Auto-disable lottery when paid pricing is selected
//   useEffect(() => {
//     if (isGamificationDisabled && data.lottery_enabled) {
//       updateData({
//         lottery_enabled: false,
//         lottery_config: null
//       });
//       toast.info('Gamification has been disabled. Only free elections can have gamification features.');
//     }
//   }, [data.pricing_type, isGamificationDisabled]);

//   // Initialize regional fees with defaults if needed
//   useEffect(() => {
//     if (data.pricing_type === 'regional_fee' && Object.keys(regionalFees).length === 0) {
//       const REGIONAL_ZONES = [
//         { id: 'north_america', name: 'North America', default_fee: 5.00 },
//         { id: 'western_europe', name: 'Western Europe', default_fee: 4.50 },
//         { id: 'australia_nz', name: 'Australia & New Zealand', default_fee: 4.00 },
//         { id: 'middle_east', name: 'Middle East', default_fee: 3.50 },
//         { id: 'eastern_europe', name: 'Eastern Europe', default_fee: 2.50 },
//         { id: 'latin_america', name: 'Latin America', default_fee: 2.00 },
//         { id: 'asia', name: 'Asia', default_fee: 1.50 },
//         { id: 'africa', name: 'Africa', default_fee: 1.00 }
//       ];
//       const defaultFees = {};
//       REGIONAL_ZONES.forEach(zone => {
//         defaultFees[zone.id] = zone.default_fee;
//       });
//       setRegionalFees(defaultFees);
//       updateData({ regional_fees: defaultFees });
//     }
    
//     setShowParticipationFeeInPreview(data.show_participation_fee_in_preview !== false);
//     setShowLotteryPrizesInPreview(data.show_lottery_prizes_in_preview !== false);
//   }, [data.pricing_type]);

//   // ✅ Auto-set prize_funding_source to 'creator_funded' when lottery is enabled
//   useEffect(() => {
//     if (data.lottery_enabled && !data.lottery_config?.prize_funding_source) {
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           prize_funding_source: 'creator_funded'
//         }
//       });
//     }
//   }, [data.lottery_enabled]);

//   // ✅ Initialize prize distribution for MONETARY & REVENUE SHARE
//   useEffect(() => {
//     const rewardType = data.lottery_config?.reward_type;
//     const winnerCount = data.lottery_config?.winner_count || 1;
    
//     // Only for monetary and projected_revenue
//     if ((rewardType === 'monetary' || rewardType === 'projected_revenue') && prizeDistribution.length !== winnerCount) {
//       const newDistribution = [];
//       for (let i = 0; i < winnerCount; i++) {
//         newDistribution.push({
//           rank: i + 1,
//           percentage: prizeDistribution[i]?.percentage || 0
//         });
//       }
//       setPrizeDistribution(newDistribution);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           prize_distribution: newDistribution
//         }
//       });
//     }
//   }, [data.lottery_config?.winner_count, data.lottery_config?.reward_type]);

//   // ✅ Initialize non-monetary prizes
//   useEffect(() => {
//     const rewardType = data.lottery_config?.reward_type;
//     const winnerCount = data.lottery_config?.winner_count || 1;
    
//     // Only for non_monetary
//     if (rewardType === 'non_monetary' && nonMonetaryPrizes.length !== winnerCount) {
//       const newPrizes = [];
//       for (let i = 0; i < winnerCount; i++) {
//         newPrizes.push({
//           rank: i + 1,
//           prize_description: nonMonetaryPrizes[i]?.prize_description || '',
//           prize_value: nonMonetaryPrizes[i]?.prize_value || 0
//         });
//       }
//       setNonMonetaryPrizes(newPrizes);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           non_monetary_prizes: newPrizes
//         }
//       });
//     }
//   }, [data.lottery_config?.winner_count, data.lottery_config?.reward_type]);

//   // ============================================
//   // VALIDATION
//   // ============================================

//   const validatePrizeDistribution = () => {
//     const rewardType = data.lottery_config?.reward_type;
    
//     // Validate MONETARY & REVENUE SHARE percentage distribution
//     if (rewardType === 'monetary' || rewardType === 'projected_revenue') {
//       const total = prizeDistribution.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0);
      
//       if (total > 100) {
//         return {
//           valid: false,
//           message: `Total percentage is ${total.toFixed(2)}% which exceeds 100%. Please adjust.`
//         };
//       }

//       for (let i = 0; i < prizeDistribution.length - 1; i++) {
//         const current = parseFloat(prizeDistribution[i].percentage) || 0;
//         const next = parseFloat(prizeDistribution[i + 1].percentage) || 0;
        
//         if (current < next) {
//           return {
//             valid: false,
//             message: `Rank ${i + 1} (${current}%) cannot be less than Rank ${i + 2} (${next}%). Must be in descending order.`
//           };
//         }
//       }

//       const allSet = prizeDistribution.every(item => item.percentage !== undefined && item.percentage !== '');
//       if (!allSet) {
//         return {
//           valid: false,
//           message: 'Please set percentage for all winners'
//         };
//       }
//     }
    
//     // Validate NON-MONETARY individual prizes
//     if (rewardType === 'non_monetary') {
//       const totalValue = parseFloat(data.lottery_config?.estimated_value) || 0;
//       const distributedValue = nonMonetaryPrizes.reduce((sum, item) => sum + (parseFloat(item.prize_value) || 0), 0);
      
//       if (distributedValue > totalValue) {
//         return {
//           valid: false,
//           message: `Total prize value ($${distributedValue.toLocaleString()}) exceeds estimated value ($${totalValue.toLocaleString()})`
//         };
//       }

//       // Check all prizes have description and value
//       for (let prize of nonMonetaryPrizes) {
//         if (!prize.prize_description || !prize.prize_description.trim()) {
//           return {
//             valid: false,
//             message: 'All prizes must have a description'
//           };
//         }
//         if (!prize.prize_value || prize.prize_value <= 0) {
//           return {
//             valid: false,
//             message: 'All prizes must have a value greater than 0'
//           };
//         }
//       }

//       // Check descending order
//       for (let i = 0; i < nonMonetaryPrizes.length - 1; i++) {
//         const current = parseFloat(nonMonetaryPrizes[i].prize_value) || 0;
//         const next = parseFloat(nonMonetaryPrizes[i + 1].prize_value) || 0;
        
//         if (current < next) {
//           return {
//             valid: false,
//             message: `Rank ${i + 1} value ($${current}) cannot be less than Rank ${i + 2} value ($${next}). Must be in descending order.`
//           };
//         }
//       }
//     }

//     return { valid: true };
//   };

//   const validateStep = () => {
//     const newErrors = {};

//     // Category validation
//     if (!data.category_id) {
//       newErrors.category_id = 'Please select an election category';
//     }

//     // Permission type validation
//     if (!data.permission_type) {
//       newErrors.permission_type = 'Please select who can participate';
//     }

//     if (data.permission_type === 'specific_countries' && (!data.allowed_countries || data.allowed_countries.length === 0)) {
//       newErrors.allowed_countries = 'Please select at least one country';
//     }

//     // Pricing validation
//     if (!data.pricing_type) {
//       newErrors.pricing_type = 'Please select a pricing type';
//     }

//     // ✅ FIXED: Using correct value 'general_fee'
//     if (data.pricing_type === 'general_fee' && (!data.general_participation_fee || data.general_participation_fee <= 0)) {
//       newErrors.general_participation_fee = 'Please enter a valid participation fee';
//     }

//     // ✅ FIXED: Using correct value 'regional_fee'
//     if (data.pricing_type === 'regional_fee') {
//       const REGIONAL_ZONES = [
//         { id: 'north_america' }, { id: 'western_europe' }, { id: 'australia_nz' },
//         { id: 'middle_east' }, { id: 'eastern_europe' }, { id: 'latin_america' },
//         { id: 'asia' }, { id: 'africa' }
//       ];
//       const invalidRegions = REGIONAL_ZONES.filter(zone => 
//         !regionalFees[zone.id] || regionalFees[zone.id] <= 0
//       );
//       if (invalidRegions.length > 0) {
//         newErrors.regional_fees = `Please enter valid fees for all regions`;
//       }
//     }

//     // Lottery validation - only validate if lottery is enabled AND pricing is FREE
//     if (data.lottery_enabled && !isGamificationDisabled) {
//       if (!data.lottery_config?.reward_type) {
//         newErrors.lottery_reward_type = 'Please select a reward type';
//       }

//       if (data.lottery_config?.reward_type === 'monetary') {
//         if (!data.lottery_config?.total_prize_pool || data.lottery_config.total_prize_pool <= 0) {
//           newErrors.lottery_prize_pool = 'Please enter a valid prize pool amount';
//         }
//       }

//       if (data.lottery_config?.reward_type === 'non_monetary') {
//         if (!data.lottery_config?.estimated_value || data.lottery_config.estimated_value <= 0) {
//           newErrors.lottery_estimated_value = 'Please enter estimated value';
//         }
//       }

//       if (data.lottery_config?.reward_type === 'projected_revenue') {
//         if (!data.lottery_config?.projected_revenue || data.lottery_config.projected_revenue <= 0) {
//           newErrors.lottery_projected_revenue = 'Please enter projected revenue';
//         }
//       }

//       if (!data.lottery_config?.winner_count || data.lottery_config.winner_count < 1 || data.lottery_config.winner_count > 100) {
//         newErrors.lottery_winner_count = 'Winner count must be between 1 and 100';
//       }

//       const distributionValidation = validatePrizeDistribution();
//       if (!distributionValidation.valid) {
//         newErrors.prize_distribution = distributionValidation.message;
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleContinue = () => {
//     if (!validateStep()) {
//       toast.error('Please fix all errors before continuing');
//       return;
//     }
    
//     updateData({
//       show_participation_fee_in_preview: showParticipationFeeInPreview,
//       show_lottery_prizes_in_preview: showLotteryPrizesInPreview
//     });
    
//     onNext();
//   };

//   // Shared props for all components
//   const sharedProps = {
//     data,
//     updateData,
//     errors,
//     eligibility
//   };

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
//         <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//           <span className="text-3xl">⚙️</span>
//           Election Configuration
//         </h2>
//         <p className="text-gray-600">
//           Configure category, access control, pricing, and special features
//         </p>
//       </div>

//       {/* Category Selection */}
//       <CategorySelection {...sharedProps} />

//       {/* Access Control */}
//       <AccessControl {...sharedProps} />

//       {/* Biometric Authentication */}
//       <BiometricAuth {...sharedProps} />

//       {/* Pricing Configuration */}
//       <PricingConfiguration 
//         {...sharedProps}
//         regionalFees={regionalFees}
//         setRegionalFees={setRegionalFees}
//       />

//       {/* ✅ GAMIFICATION SECTION - Conditionally rendered based on pricing type */}
//       {isGamificationDisabled ? (
//         /* =====================================================
//            DISABLED STATE: Show locked gamification for PAID elections
//            ===================================================== */
//         <div className="relative rounded-xl overflow-hidden">
//           {/* Background gradient */}
//           <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100"></div>
          
//           {/* Decorative pattern overlay */}
//           <div className="absolute inset-0 opacity-5">
//             <div className="absolute top-4 left-4 text-6xl">🎰</div>
//             <div className="absolute top-4 right-4 text-6xl">🎁</div>
//             <div className="absolute bottom-4 left-4 text-6xl">💰</div>
//             <div className="absolute bottom-4 right-4 text-6xl">🏆</div>
//           </div>

//           <div className="relative z-10 p-8">
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
//                   <FaGift className="text-gray-400 text-xl" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-400">Gamification Feature</h3>
//                   <p className="text-sm text-gray-400">Add prizes and incentives for voters</p>
//                 </div>
//               </div>
              
//               {/* Disabled Toggle */}
//               <div className="flex items-center gap-2">
//                 <span className="text-xs text-gray-400 font-medium">DISABLED</span>
//                 <div className="w-14 h-7 bg-gray-300 rounded-full relative cursor-not-allowed">
//                   <div className="absolute left-1 top-0.5 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
//                     <FaLock className="text-gray-400 text-xs" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Main Content Card */}
//             <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
//               <div className="flex flex-col items-center text-center">
//                 {/* Lock Icon with Glow Effect */}
//                 <div className="relative mb-6">
//                   <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
//                   <div className="relative w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-full flex items-center justify-center shadow-lg border-4 border-amber-200">
//                     <FaLock className="text-amber-600 text-3xl" />
//                   </div>
//                 </div>

//                 {/* Title */}
//                 <h4 className="text-2xl font-bold text-gray-800 mb-3">
//                   Gamification Not Available
//                 </h4>

//                 {/* Description */}
//                 <p className="text-gray-600 mb-6 max-w-md">
//                   Gamification features including lottery prizes, rewards, and voter incentives are only available for{' '}
//                   <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full text-sm">
//                     🆓 Free
//                   </span>{' '}
//                   elections.
//                 </p>

//                 {/* Feature Icons - What's disabled */}
//                 <div className="flex justify-center gap-6 mb-6">
//                   <div className="flex flex-col items-center gap-2 opacity-40">
//                     <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
//                       <FaTrophy className="text-gray-400 text-xl" />
//                     </div>
//                     <span className="text-xs text-gray-400">Prizes</span>
//                   </div>
//                   <div className="flex flex-col items-center gap-2 opacity-40">
//                     <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
//                       <FaCoins className="text-gray-400 text-xl" />
//                     </div>
//                     <span className="text-xs text-gray-400">Rewards</span>
//                   </div>
//                   <div className="flex flex-col items-center gap-2 opacity-40">
//                     <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
//                       <FaGift className="text-gray-400 text-xl" />
//                     </div>
//                     <span className="text-xs text-gray-400">Lottery</span>
//                   </div>
//                 </div>

//                 {/* Action hint */}
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 max-w-md">
//                   <div className="flex items-start gap-3">
//                     <FaInfoCircle className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
//                     <div className="text-left">
//                       <p className="text-sm text-blue-800 font-medium">
//                         Want to enable gamification?
//                       </p>
//                       <p className="text-xs text-blue-600 mt-1">
//                         Change your pricing option to <strong>"Free"</strong> in the Pricing Configuration section above to unlock lottery and prize features.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         /* =====================================================
//            ENABLED STATE: Show full LotteryConfiguration for FREE elections
//            ===================================================== */
//         <LotteryConfiguration
//           {...sharedProps}
//           prizeDistribution={prizeDistribution}
//           setPrizeDistribution={setPrizeDistribution}
//           nonMonetaryPrizes={nonMonetaryPrizes}
//           setNonMonetaryPrizes={setNonMonetaryPrizes}
//           percentageErrors={percentageErrors}
//           setPercentageErrors={setPercentageErrors}
//           nonMonetaryErrors={nonMonetaryErrors}
//           setNonMonetaryErrors={setNonMonetaryErrors}
//         />
//       )}

//       {/* Preview Display Settings */}
//       <PreviewSettings
//         showParticipationFeeInPreview={showParticipationFeeInPreview}
//         setShowParticipationFeeInPreview={setShowParticipationFeeInPreview}
//         showLotteryPrizesInPreview={showLotteryPrizesInPreview}
//         setShowLotteryPrizesInPreview={setShowLotteryPrizesInPreview}
//         isGamificationDisabled={isGamificationDisabled}
//       />

//       {/* Results & Features */}
//       <ResultsFeatures {...sharedProps} />

//       {/* Navigation Buttons */}
//       <div className="flex justify-between pt-6">
//         <button
//           onClick={onBack}
//           className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md"
//         >
//           ← Back
//         </button>

//         <button
//           onClick={handleContinue}
//           className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
//         >
//           Continue to Questions
//           <FaCheckCircle />
//         </button>
//       </div>
//     </div>
//   );
// }
//last workable code only Only the “Free” participation fee option can be able to get or enable Gamification
//Feature.
// // src/components/election/Step2Configuration.jsx - MAIN FILE
// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import {
//   FaCheckCircle,
//   FaInfoCircle
// } from 'react-icons/fa';


// import { AccessControl, BiometricAuth, CategorySelection } from '../../../../election/Step2Configuration/Step2Configuration-Part1';
// import PricingConfiguration from '../../../../election/Step2Configuration/Step2Configuration-Part2';
// import LotteryConfiguration from '../../../../election/Step2Configuration/Step2Configuration-Part3-LotteryFull';
// import { PreviewSettings, ResultsFeatures } from '../../../../election/Step2Configuration/Step2Configuration-Part4-Final';

// export default function Step2Configuration({ data, updateData, onNext, onBack, eligibility }) {
//   const [errors, setErrors] = useState({});
//   const [regionalFees, setRegionalFees] = useState(data.regional_fees || {});
  
//   // ✅ Monetary & Revenue Share: Percentage distribution
//   const [prizeDistribution, setPrizeDistribution] = useState(
//     data.lottery_config?.prize_distribution || []
//   );
  
//   // ✅ Non-Monetary: Individual prize descriptions with values
//   const [nonMonetaryPrizes, setNonMonetaryPrizes] = useState(
//     data.lottery_config?.non_monetary_prizes || []
//   );
  
//   // Track individual field errors
//   const [percentageErrors, setPercentageErrors] = useState({});
//   const [nonMonetaryErrors, setNonMonetaryErrors] = useState({});
  
//   // Show/Hide pricing in preview toggles
//   const [showParticipationFeeInPreview, setShowParticipationFeeInPreview] = useState(
//     data.show_participation_fee_in_preview !== false
//   );
//   const [showLotteryPrizesInPreview, setShowLotteryPrizesInPreview] = useState(
//     data.show_lottery_prizes_in_preview !== false
//   );

//   // Initialize regional fees with defaults if needed
//   useEffect(() => {
//     if (data.pricing_type === 'paid_regional' && Object.keys(regionalFees).length === 0) {
//       const REGIONAL_ZONES = [
//         { id: 'north_america', name: 'North America', default_fee: 5.00 },
//         { id: 'western_europe', name: 'Western Europe', default_fee: 4.50 },
//         { id: 'australia_nz', name: 'Australia & New Zealand', default_fee: 4.00 },
//         { id: 'middle_east', name: 'Middle East', default_fee: 3.50 },
//         { id: 'eastern_europe', name: 'Eastern Europe', default_fee: 2.50 },
//         { id: 'latin_america', name: 'Latin America', default_fee: 2.00 },
//         { id: 'asia', name: 'Asia', default_fee: 1.50 },
//         { id: 'africa', name: 'Africa', default_fee: 1.00 }
//       ];
//       const defaultFees = {};
//       REGIONAL_ZONES.forEach(zone => {
//         defaultFees[zone.id] = zone.default_fee;
//       });
//       setRegionalFees(defaultFees);
//       updateData({ regional_fees: defaultFees });
//     }
    
//     setShowParticipationFeeInPreview(data.show_participation_fee_in_preview !== false);
//     setShowLotteryPrizesInPreview(data.show_lottery_prizes_in_preview !== false);
//   }, [data.pricing_type]);

//   // ✅ Auto-set prize_funding_source to 'creator_funded' when lottery is enabled
//   useEffect(() => {
//     if (data.lottery_enabled && !data.lottery_config?.prize_funding_source) {
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           prize_funding_source: 'creator_funded'
//         }
//       });
//     }
//   }, [data.lottery_enabled]);

//   // ✅ Initialize prize distribution for MONETARY & REVENUE SHARE
//   useEffect(() => {
//     const rewardType = data.lottery_config?.reward_type;
//     const winnerCount = data.lottery_config?.winner_count || 1;
    
//     // Only for monetary and projected_revenue
//     if ((rewardType === 'monetary' || rewardType === 'projected_revenue') && prizeDistribution.length !== winnerCount) {
//       const newDistribution = [];
//       for (let i = 0; i < winnerCount; i++) {
//         newDistribution.push({
//           rank: i + 1,
//           percentage: prizeDistribution[i]?.percentage || 0
//         });
//       }
//       setPrizeDistribution(newDistribution);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           prize_distribution: newDistribution
//         }
//       });
//     }
//   }, [data.lottery_config?.winner_count, data.lottery_config?.reward_type]);

//   // ✅ Initialize non-monetary prizes
//   useEffect(() => {
//     const rewardType = data.lottery_config?.reward_type;
//     const winnerCount = data.lottery_config?.winner_count || 1;
    
//     // Only for non_monetary
//     if (rewardType === 'non_monetary' && nonMonetaryPrizes.length !== winnerCount) {
//       const newPrizes = [];
//       for (let i = 0; i < winnerCount; i++) {
//         newPrizes.push({
//           rank: i + 1,
//           prize_description: nonMonetaryPrizes[i]?.prize_description || '',
//           prize_value: nonMonetaryPrizes[i]?.prize_value || 0
//         });
//       }
//       setNonMonetaryPrizes(newPrizes);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           non_monetary_prizes: newPrizes
//         }
//       });
//     }
//   }, [data.lottery_config?.winner_count, data.lottery_config?.reward_type]);

//   // ============================================
//   // VALIDATION
//   // ============================================

//   const validatePrizeDistribution = () => {
//     const rewardType = data.lottery_config?.reward_type;
    
//     // Validate MONETARY & REVENUE SHARE percentage distribution
//     if (rewardType === 'monetary' || rewardType === 'projected_revenue') {
//       const total = prizeDistribution.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0);
      
//       if (total > 100) {
//         return {
//           valid: false,
//           message: `Total percentage is ${total.toFixed(2)}% which exceeds 100%. Please adjust.`
//         };
//       }

//       for (let i = 0; i < prizeDistribution.length - 1; i++) {
//         const current = parseFloat(prizeDistribution[i].percentage) || 0;
//         const next = parseFloat(prizeDistribution[i + 1].percentage) || 0;
        
//         if (current < next) {
//           return {
//             valid: false,
//             message: `Rank ${i + 1} (${current}%) cannot be less than Rank ${i + 2} (${next}%). Must be in descending order.`
//           };
//         }
//       }

//       const allSet = prizeDistribution.every(item => item.percentage !== undefined && item.percentage !== '');
//       if (!allSet) {
//         return {
//           valid: false,
//           message: 'Please set percentage for all winners'
//         };
//       }
//     }
    
//     // Validate NON-MONETARY individual prizes
//     if (rewardType === 'non_monetary') {
//       const totalValue = parseFloat(data.lottery_config?.estimated_value) || 0;
//       const distributedValue = nonMonetaryPrizes.reduce((sum, item) => sum + (parseFloat(item.prize_value) || 0), 0);
      
//       if (distributedValue > totalValue) {
//         return {
//           valid: false,
//           message: `Total prize value ($${distributedValue.toLocaleString()}) exceeds estimated value ($${totalValue.toLocaleString()})`
//         };
//       }

//       // Check all prizes have description and value
//       for (let prize of nonMonetaryPrizes) {
//         if (!prize.prize_description || !prize.prize_description.trim()) {
//           return {
//             valid: false,
//             message: 'All prizes must have a description'
//           };
//         }
//         if (!prize.prize_value || prize.prize_value <= 0) {
//           return {
//             valid: false,
//             message: 'All prizes must have a value greater than 0'
//           };
//         }
//       }

//       // Check descending order
//       for (let i = 0; i < nonMonetaryPrizes.length - 1; i++) {
//         const current = parseFloat(nonMonetaryPrizes[i].prize_value) || 0;
//         const next = parseFloat(nonMonetaryPrizes[i + 1].prize_value) || 0;
        
//         if (current < next) {
//           return {
//             valid: false,
//             message: `Rank ${i + 1} value ($${current}) cannot be less than Rank ${i + 2} value ($${next}). Must be in descending order.`
//           };
//         }
//       }
//     }

//     return { valid: true };
//   };

//   const validateStep = () => {
//     const newErrors = {};

//     // Category validation
//     if (!data.category_id) {
//       newErrors.category_id = 'Please select an election category';
//     }

//     // Permission type validation
//     if (!data.permission_type) {
//       newErrors.permission_type = 'Please select who can participate';
//     }

//     if (data.permission_type === 'specific_countries' && (!data.allowed_countries || data.allowed_countries.length === 0)) {
//       newErrors.allowed_countries = 'Please select at least one country';
//     }

//     // Pricing validation
//     if (!data.pricing_type) {
//       newErrors.pricing_type = 'Please select a pricing type';
//     }

//     if (data.pricing_type === 'paid_general' && (!data.general_participation_fee || data.general_participation_fee <= 0)) {
//       newErrors.general_participation_fee = 'Please enter a valid participation fee';
//     }

//     if (data.pricing_type === 'paid_regional') {
//       const REGIONAL_ZONES = [
//         { id: 'north_america' }, { id: 'western_europe' }, { id: 'australia_nz' },
//         { id: 'middle_east' }, { id: 'eastern_europe' }, { id: 'latin_america' },
//         { id: 'asia' }, { id: 'africa' }
//       ];
//       const invalidRegions = REGIONAL_ZONES.filter(zone => 
//         !regionalFees[zone.id] || regionalFees[zone.id] <= 0
//       );
//       if (invalidRegions.length > 0) {
//         newErrors.regional_fees = `Please enter valid fees for all regions`;
//       }
//     }

//     // Lottery validation
//     if (data.lottery_enabled) {
//       if (!data.lottery_config?.reward_type) {
//         newErrors.lottery_reward_type = 'Please select a reward type';
//       }

//       if (data.lottery_config?.reward_type === 'monetary') {
//         if (!data.lottery_config?.total_prize_pool || data.lottery_config.total_prize_pool <= 0) {
//           newErrors.lottery_prize_pool = 'Please enter a valid prize pool amount';
//         }
//       }

//       if (data.lottery_config?.reward_type === 'non_monetary') {
//         if (!data.lottery_config?.estimated_value || data.lottery_config.estimated_value <= 0) {
//           newErrors.lottery_estimated_value = 'Please enter estimated value';
//         }
//       }

//       if (data.lottery_config?.reward_type === 'projected_revenue') {
//         if (!data.lottery_config?.projected_revenue || data.lottery_config.projected_revenue <= 0) {
//           newErrors.lottery_projected_revenue = 'Please enter projected revenue';
//         }
//       }

//       if (!data.lottery_config?.winner_count || data.lottery_config.winner_count < 1 || data.lottery_config.winner_count > 100) {
//         newErrors.lottery_winner_count = 'Winner count must be between 1 and 100';
//       }

//       const distributionValidation = validatePrizeDistribution();
//       if (!distributionValidation.valid) {
//         newErrors.prize_distribution = distributionValidation.message;
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleContinue = () => {
//     if (!validateStep()) {
//       toast.error('Please fix all errors before continuing');
//       return;
//     }
    
//     updateData({
//       show_participation_fee_in_preview: showParticipationFeeInPreview,
//       show_lottery_prizes_in_preview: showLotteryPrizesInPreview
//     });
    
//     onNext();
//   };

//   // Shared props for all components
//   const sharedProps = {
//     data,
//     updateData,
//     errors,
//     eligibility
//   };

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
//         <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//           <span className="text-3xl">⚙️</span>
//           Election Configuration
//         </h2>
//         <p className="text-gray-600">
//           Configure category, access control, pricing, and special features
//         </p>
//       </div>

//       {/* Category Selection */}
//       <CategorySelection {...sharedProps} />

//       {/* Access Control */}
//       <AccessControl {...sharedProps} />

//       {/* Biometric Authentication */}
//       <BiometricAuth {...sharedProps} />

//       {/* Pricing Configuration */}
//       <PricingConfiguration 
//         {...sharedProps}
//         regionalFees={regionalFees}
//         setRegionalFees={setRegionalFees}
//       />

//       {/* Lottery/Gamification Configuration */}
//       <LotteryConfiguration
//         {...sharedProps}
//         prizeDistribution={prizeDistribution}
//         setPrizeDistribution={setPrizeDistribution}
//         nonMonetaryPrizes={nonMonetaryPrizes}
//         setNonMonetaryPrizes={setNonMonetaryPrizes}
//         percentageErrors={percentageErrors}
//         setPercentageErrors={setPercentageErrors}
//         nonMonetaryErrors={nonMonetaryErrors}
//         setNonMonetaryErrors={setNonMonetaryErrors}
//       />

//       {/* Preview Display Settings */}
//       <PreviewSettings
//         showParticipationFeeInPreview={showParticipationFeeInPreview}
//         setShowParticipationFeeInPreview={setShowParticipationFeeInPreview}
//         showLotteryPrizesInPreview={showLotteryPrizesInPreview}
//         setShowLotteryPrizesInPreview={setShowLotteryPrizesInPreview}
//       />

//       {/* Results & Features */}
//       <ResultsFeatures {...sharedProps} />

//       {/* Navigation Buttons */}
//       <div className="flex justify-between pt-6">
//         <button
//           onClick={onBack}
//           className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md"
//         >
//           ← Back
//         </button>

//         <button
//           onClick={handleContinue}
//           className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
//         >
//           Continue to Questions
//           <FaCheckCircle />
//         </button>
//       </div>
//     </div>
//   );
// }
