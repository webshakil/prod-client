// src/components/election/Step2Configuration.jsx - MAIN FILE
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

  // Initialize regional fees with defaults if needed
  useEffect(() => {
    if (data.pricing_type === 'paid_regional' && Object.keys(regionalFees).length === 0) {
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

    if (data.pricing_type === 'paid_general' && (!data.general_participation_fee || data.general_participation_fee <= 0)) {
      newErrors.general_participation_fee = 'Please enter a valid participation fee';
    }

    if (data.pricing_type === 'paid_regional') {
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

    // Lottery validation
    if (data.lottery_enabled) {
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

      {/* Lottery/Gamification Configuration */}
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

      {/* Preview Display Settings */}
      <PreviewSettings
        showParticipationFeeInPreview={showParticipationFeeInPreview}
        setShowParticipationFeeInPreview={setShowParticipationFeeInPreview}
        showLotteryPrizesInPreview={showLotteryPrizesInPreview}
        setShowLotteryPrizesInPreview={setShowLotteryPrizesInPreview}
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
// // src/components/election/Step2Configuration.jsx - MAIN FILE
// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import {
//   FaCheckCircle,
//   FaInfoCircle
// } from 'react-icons/fa';

// // Import sub-components
// //import CategorySelection from './Step2Configuration/CategorySelection';
// //import AccessControl from './Step2Configuration/AccessControl';
// //import BiometricAuth from './Step2Configuration/BiometricAuth';
// //import PricingConfiguration from './Step2Configuration/PricingConfiguration';
// //import LotteryConfiguration from './Step2Configuration/LotteryConfiguration';
// //import PreviewSettings from './Step2Configuration/PreviewSettings';
// //import ResultsFeatures from './Step2Configuration/ResultsFeatures';
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
//         if (!data.lottery_config?.revenue_share_percentage || data.lottery_config.revenue_share_percentage <= 0 || data.lottery_config.revenue_share_percentage > 100) {
//           newErrors.lottery_revenue_share = 'Revenue share must be between 0 and 100%';
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
// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import {
//   FaGlobe,
//   FaDollarSign,
//   FaFingerprint,
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaEye,
//   FaEyeSlash,
//   FaEdit,
//   FaLock,
//   FaTrophy,
//   FaMapMarkedAlt,
//   FaTags,
//   FaPercent,
//   FaExclamationTriangle,
//   FaTrash
// } from 'react-icons/fa';

// // Regional zones for pricing
// const REGIONAL_ZONES = [
//   { id: 'north_america', name: 'North America', countries: 'USA, Canada', default_fee: 5.00 },
//   { id: 'western_europe', name: 'Western Europe', countries: 'UK, Germany, France, etc.', default_fee: 4.50 },
//   { id: 'australia_nz', name: 'Australia & New Zealand', countries: 'Australia, New Zealand', default_fee: 4.00 },
//   { id: 'middle_east', name: 'Middle East', countries: 'UAE, Saudi Arabia, Qatar, etc.', default_fee: 3.50 },
//   { id: 'eastern_europe', name: 'Eastern Europe', countries: 'Poland, Russia, Ukraine, etc.', default_fee: 2.50 },
//   { id: 'latin_america', name: 'Latin America', countries: 'Brazil, Argentina, Mexico, etc.', default_fee: 2.00 },
//   { id: 'asia', name: 'Asia', countries: 'China, India, Thailand, etc.', default_fee: 1.50 },
//   { id: 'africa', name: 'Africa', countries: 'Nigeria, Kenya, South Africa, etc.', default_fee: 1.00 }
// ];

// // All countries organized by continent
// const COUNTRIES_BY_CONTINENT = {
//   'Africa': [
//     'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
//     'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of Congo',
//     'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana',
//     'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
//     'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
//     'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
//     'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
//     'Zambia', 'Zimbabwe'
//   ],
//   'Asia': [
//     'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia',
//     'China', 'Georgia', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan',
//     'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Macau', 'Malaysia',
//     'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine',
//     'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria',
//     'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates',
//     'Uzbekistan', 'Vietnam', 'Yemen'
//   ],
//   'Europe': [
//     'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
//     'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
//     'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein',
//     'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
//     'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia',
//     'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'
//   ],
//   'North America': [
//     'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
//     'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras',
//     'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia',
//     'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'
//   ],
//   'South America': [
//     'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
//     'Peru', 'Suriname', 'Uruguay', 'Venezuela'
//   ],
//   'Australia & Oceania': [
//     'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand',
//     'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
//   ]
// };

// // Election categories
// const ELECTION_CATEGORIES = [
//   { id: 1, category_name: 'Politics', description: 'Political elections and polls', icon: '🏛️' },
//   { id: 2, category_name: 'Sports', description: 'Sports-related voting', icon: '⚽' },
//   { id: 3, category_name: 'Entertainment', description: 'Movies, music, and entertainment', icon: '🎬' },
//   { id: 4, category_name: 'Education', description: 'Academic and educational voting', icon: '📚' },
//   { id: 5, category_name: 'Business', description: 'Corporate and business decisions', icon: '💼' },
//   { id: 6, category_name: 'Community', description: 'Community decisions and polls', icon: '🏘️' },
//   { id: 7, category_name: 'Technology', description: 'Tech-related polls and surveys', icon: '💻' },
//   { id: 8, category_name: 'Health', description: 'Health and wellness voting', icon: '🏥' }
// ];

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
//   // MONETARY & REVENUE SHARE: Percentage Functions
//   // ============================================

//   const calculateTotalPercentage = () => {
//     return prizeDistribution.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0);
//   };

//   const getRemainingPercentage = () => {
//     return Math.max(0, 100 - calculateTotalPercentage());
//   };

//   const getTotalPrizePool = () => {
//     const rewardType = data.lottery_config?.reward_type;
//     if (rewardType === 'monetary') {
//       return parseFloat(data.lottery_config?.total_prize_pool) || 0;
//     }
//     if (rewardType === 'projected_revenue') {
//       const revenue = parseFloat(data.lottery_config?.projected_revenue) || 0;
//       const percentage = parseFloat(data.lottery_config?.revenue_share_percentage) || 0;
//       return (revenue * percentage) / 100;
//     }
//     return 0;
//   };

//   const getRemainingAmount = (upToRank) => {
//     const totalPool = getTotalPrizePool();
//     let distributed = 0;
    
//     for (let i = 0; i < upToRank - 1; i++) {
//       if (prizeDistribution[i]) {
//         distributed += (totalPool * (parseFloat(prizeDistribution[i].percentage) || 0)) / 100;
//       }
//     }
    
//     return Math.max(0, totalPool - distributed);
//   };

//   const handlePercentageChange = (rank, value) => {
//     const index = rank - 1;
//     const newErrors = { ...percentageErrors };
    
//     if (value === '' || value === null || value === undefined) {
//       const newDistribution = [...prizeDistribution];
//       newDistribution[index] = { ...newDistribution[index], percentage: '' };
//       setPrizeDistribution(newDistribution);
//       delete newErrors[rank];
//       setPercentageErrors(newErrors);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           prize_distribution: newDistribution
//         }
//       });
//       return;
//     }

//     const numValue = parseFloat(value);
    
//     if (numValue < 0) return;
//     if (numValue > 100) {
//       newErrors[rank] = `Cannot exceed 100%`;
//       setPercentageErrors(newErrors);
//       return;
//     }

//     const newDistribution = [...prizeDistribution];
//     newDistribution[index] = { ...newDistribution[index], percentage: numValue };

//     const newTotal = newDistribution.reduce((sum, item) => {
//       const val = parseFloat(item.percentage);
//       return sum + (isNaN(val) ? 0 : val);
//     }, 0);
    
//     if (newTotal > 100) {
//       const currentTotal = prizeDistribution.reduce((sum, item) => {
//         const val = parseFloat(item.percentage);
//         return sum + (isNaN(val) ? 0 : val);
//       }, 0);
//       const remaining = 100 - (currentTotal - (parseFloat(prizeDistribution[index].percentage) || 0));
//       newErrors[rank] = `Total would exceed 100%. You have ${remaining.toFixed(1)}% remaining`;
//       setPercentageErrors(newErrors);
//       return;
//     }

//     if (index > 0) {
//       const previousVal = parseFloat(newDistribution[index - 1].percentage);
//       if (!isNaN(previousVal) && numValue > previousVal) {
//         newErrors[rank] = `Must be ≤ Rank ${rank - 1} (${previousVal}%)`;
//         setPercentageErrors(newErrors);
//         return;
//       }
//     }

//     if (index < newDistribution.length - 1) {
//       const nextVal = parseFloat(newDistribution[index + 1].percentage);
//       if (!isNaN(nextVal) && numValue < nextVal) {
//         newErrors[rank] = `Must be ≥ Rank ${rank + 1} (${nextVal}%)`;
//         setPercentageErrors(newErrors);
//         return;
//       }
//     }

//     delete newErrors[rank];
//     setPercentageErrors(newErrors);

//     setPrizeDistribution(newDistribution);
//     updateData({
//       lottery_config: {
//         ...data.lottery_config,
//         prize_distribution: newDistribution
//       }
//     });
//   };

//   // ============================================
//   // NON-MONETARY: Individual Prize Functions
//   // ============================================

//   const calculateTotalNonMonetaryValue = () => {
//     return nonMonetaryPrizes.reduce((sum, item) => sum + (parseFloat(item.prize_value) || 0), 0);
//   };

//   const getRemainingNonMonetaryValue = (upToRank) => {
//     const totalValue = parseFloat(data.lottery_config?.estimated_value) || 0;
//     let distributed = 0;
    
//     for (let i = 0; i < upToRank - 1; i++) {
//       if (nonMonetaryPrizes[i]) {
//         distributed += parseFloat(nonMonetaryPrizes[i].prize_value) || 0;
//       }
//     }
    
//     return Math.max(0, totalValue - distributed);
//   };

//   const handleNonMonetaryPrizeChange = (rank, field, value) => {
//     const index = rank - 1;
//     const newErrors = { ...nonMonetaryErrors };
//     const newPrizes = [...nonMonetaryPrizes];
    
//     if (field === 'prize_description') {
//       newPrizes[index] = { ...newPrizes[index], prize_description: value };
//       delete newErrors[`${rank}_description`];
//     } else if (field === 'prize_value') {
//       if (value === '' || value === null || value === undefined) {
//         newPrizes[index] = { ...newPrizes[index], prize_value: '' };
//         delete newErrors[`${rank}_value`];
//         setNonMonetaryPrizes(newPrizes);
//         setNonMonetaryErrors(newErrors);
//         updateData({
//           lottery_config: {
//             ...data.lottery_config,
//             non_monetary_prizes: newPrizes
//           }
//         });
//         return;
//       }

//       const numValue = parseFloat(value);
      
//       if (numValue < 0) return;

//       const totalValue = parseFloat(data.lottery_config?.estimated_value) || 0;
//       newPrizes[index] = { ...newPrizes[index], prize_value: numValue };

//       // Check if total would exceed estimated value
//       const newTotal = newPrizes.reduce((sum, item) => sum + (parseFloat(item.prize_value) || 0), 0);
//       if (newTotal > totalValue) {
//         const remaining = getRemainingNonMonetaryValue(rank);
//         newErrors[`${rank}_value`] = `Total would exceed $${totalValue.toLocaleString()}. Remaining: $${remaining.toLocaleString()}`;
//         setNonMonetaryErrors(newErrors);
//         return;
//       }

//       // Check descending order - previous rank must be >= current
//       if (index > 0) {
//         const previousVal = parseFloat(newPrizes[index - 1].prize_value);
//         if (!isNaN(previousVal) && numValue > previousVal) {
//           newErrors[`${rank}_value`] = `Must be ≤ Rank ${rank - 1} ($${previousVal.toLocaleString()})`;
//           setNonMonetaryErrors(newErrors);
//           return;
//         }
//       }

//       // Check descending order - current must be >= next rank
//       if (index < newPrizes.length - 1) {
//         const nextVal = parseFloat(newPrizes[index + 1].prize_value);
//         if (!isNaN(nextVal) && numValue < nextVal) {
//           newErrors[`${rank}_value`] = `Must be ≥ Rank ${rank + 1} ($${nextVal.toLocaleString()})`;
//           setNonMonetaryErrors(newErrors);
//           return;
//         }
//       }

//       delete newErrors[`${rank}_value`];
//     }

//     setNonMonetaryErrors(newErrors);
//     setNonMonetaryPrizes(newPrizes);
//     updateData({
//       lottery_config: {
//         ...data.lottery_config,
//         non_monetary_prizes: newPrizes
//       }
//     });
//   };

//   // ============================================
//   // VALIDATION
//   // ============================================

//   const validatePrizeDistribution = () => {
//     const rewardType = data.lottery_config?.reward_type;
    
//     // Validate MONETARY & REVENUE SHARE percentage distribution
//     if (rewardType === 'monetary' || rewardType === 'projected_revenue') {
//       const total = calculateTotalPercentage();
      
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
//       const distributedValue = calculateTotalNonMonetaryValue();
      
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
//         if (!data.lottery_config?.revenue_share_percentage || data.lottery_config.revenue_share_percentage <= 0 || data.lottery_config.revenue_share_percentage > 100) {
//           newErrors.lottery_revenue_share = 'Revenue share must be between 0 and 100%';
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
// /*eslint-disable*/
//   const handlePermissionTypeChange = (type) => {
//     updateData({ 
//       permission_type: type,
//       allowed_countries: type === 'specific_countries' ? data.allowed_countries || [] : []
//     });
//   };

//   const toggleCountry = (country) => {
//     const currentCountries = data.allowed_countries || [];
//     const newCountries = currentCountries.includes(country)
//       ? currentCountries.filter(c => c !== country)
//       : [...currentCountries, country];
//     updateData({ allowed_countries: newCountries });
//   };

//   const selectAllFromContinent = (continent) => {
//     const countries = COUNTRIES_BY_CONTINENT[continent];
//     const currentCountries = data.allowed_countries || [];
//     const allSelected = countries.every(c => currentCountries.includes(c));
    
//     if (allSelected) {
//       updateData({ 
//         allowed_countries: currentCountries.filter(c => !countries.includes(c)) 
//       });
//     } else {
//       const uniqueCountries = [...new Set([...currentCountries, ...countries])];
//       updateData({ allowed_countries: uniqueCountries });
//     }
//   };

//   const handleRegionalFeeChange = (zoneId, value) => {
//     if (value === '' || value === null || value === undefined) {
//       const newFees = { ...regionalFees, [zoneId]: '' };
//       setRegionalFees(newFees);
//       updateData({ regional_fees: newFees });
//       return;
//     }
    
//     const numValue = parseFloat(value);
//     if (!isNaN(numValue) && numValue >= 0) {
//       const newFees = { ...regionalFees, [zoneId]: numValue };
//       setRegionalFees(newFees);
//       updateData({ regional_fees: newFees });
//     }
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

//       {/* Election Category Selection */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaTags className="text-purple-600" />
//             Election Category *
//           </h3>
//           <FaInfoCircle className="text-gray-400 text-xl cursor-help" title="Select the category that best describes your election" />
//         </div>

//         <div className="grid md:grid-cols-4 gap-4">
//           {ELECTION_CATEGORIES.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => updateData({ category_id: category.id })}
//               className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-center ${
//                 data.category_id === category.id
//                   ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
//                   : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
//               }`}
//             >
//               <div className="text-4xl mb-2">{category.icon}</div>
//               <h4 className={`font-bold text-sm mb-1 ${
//                 data.category_id === category.id ? 'text-purple-600' : 'text-gray-800'
//               }`}>
//                 {category.category_name}
//                 {data.category_id === category.id && (
//                   <FaCheckCircle className="inline ml-1 text-green-500 text-xs" />
//                 )}
//               </h4>
//               <p className="text-xs text-gray-500">{category.description}</p>
//             </button>
//           ))}
//         </div>

//         {errors.category_id && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.category_id}
//           </p>
//         )}
//       </div>



//       <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//         !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//       }`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGift className="text-yellow-600" />
//             Gamification Feature
//           </h3>
//           <label className={`relative inline-flex items-center ${
//             eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//           }`}>
//             <input
//               type="checkbox"
//               checked={data.lottery_enabled || false}
//               onChange={(e) => {
//                 if (eligibility?.canCreatePaidElections) {
//                   updateData({ lottery_enabled: e.target.checked });
//                 }
//               }}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//           </label>
//         </div>

//         {!eligibility?.canCreatePaidElections && (
//           <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//             <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//               <FaInfoCircle />
//               ⚠️ Upgrade your plan to enable Gamification Feature
//             </p>
//           </div>
//         )}

//         <p className="text-gray-700 mb-4 font-medium">
//           {data.lottery_enabled
//             ? '🎉 Gamify this election with prizes for voters'
//             : 'Add excitement by making this election a gamify with prizes'}
//         </p>

//         {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//           <div className="space-y-6">
//             {/* Creator Funded Badge */}
//             <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//               <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
//                 <FaCheckCircle className="text-green-600 text-2xl" />
//                 <div>
//                   <h4 className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</h4>
//                   <p className="text-sm text-gray-600">You or your sponsor will provide the prizes for winners</p>
//                 </div>
//               </div>
//             </div>

//             {/* Prize Type Selection */}
//             <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//               <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//               <div className="space-y-4">
//                 {/* ============================================ */}
//                 {/* DEFINED MONETARY PRIZE */}
//                 {/* ============================================ */}
//                 <div className={`p-4 rounded-lg border-2 transition-all ${
//                   data.lottery_config?.reward_type === 'monetary'
//                     ? 'border-green-500 bg-green-50'
//                     : 'border-gray-300'
//                 }`}>
//                   <label className="flex items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="reward_type"
//                       value="monetary"
//                       checked={data.lottery_config?.reward_type === 'monetary'}
//                       onChange={(e) => {
//                         setPrizeDistribution([]);
//                         setNonMonetaryPrizes([]);
//                         updateData({
//                           lottery_config: { 
//                             ...data.lottery_config, 
//                             reward_type: e.target.value, 
//                             prize_funding_source: 'creator_funded',
//                             prize_distribution: [],
//                             non_monetary_prizes: []
//                           }
//                         });
//                       }}
//                       className="w-5 h-5 text-green-600"
//                     />
//                     <div className="ml-3 flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className="text-2xl">💵</span>
//                         <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                       </div>
//                       <p className="text-sm text-gray-600 mb-2">Fixed cash amount with percentage distribution</p>
//                       <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                     </div>
//                   </label>

//                   {data.lottery_config?.reward_type === 'monetary' && (
//                     <div className="mt-4 space-y-3">
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           💰 Total Prize Pool Amount (USD) *
//                         </label>
//                         <input
//                           type="number"
//                           min="1"
//                           step="1"
//                           value={data.lottery_config?.total_prize_pool || ''}
//                           onChange={(e) => {
//                             const value = e.target.value;
//                             if (value === '') {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   total_prize_pool: ''
//                                 }
//                               });
//                             } else {
//                               const numValue = parseInt(value);
//                               if (!isNaN(numValue) && numValue > 0) {
//                                 updateData({
//                                   lottery_config: {
//                                     ...data.lottery_config,
//                                     total_prize_pool: numValue
//                                   }
//                                 });
//                               }
//                             }
//                           }}
//                           onKeyDown={(e) => {
//                             if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                               e.preventDefault();
//                             }
//                           }}
//                           placeholder="e.g., 100000"
//                           className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                             errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                         />
//                         {errors.lottery_prize_pool && (
//                           <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* ============================================ */}
//                 {/* DEFINED NON-MONETARY PRIZE */}
//                 {/* ============================================ */}
//                 <div className={`p-4 rounded-lg border-2 transition-all ${
//                   data.lottery_config?.reward_type === 'non_monetary'
//                     ? 'border-purple-500 bg-purple-50'
//                     : 'border-gray-300'
//                 }`}>
//                   <label className="flex items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="reward_type"
//                       value="non_monetary"
//                       checked={data.lottery_config?.reward_type === 'non_monetary'}
//                       onChange={(e) => {
//                         setPrizeDistribution([]);
//                         setNonMonetaryPrizes([]);
//                         updateData({
//                           lottery_config: { 
//                             ...data.lottery_config, 
//                             reward_type: e.target.value, 
//                             prize_funding_source: 'creator_funded',
//                             prize_distribution: [],
//                             non_monetary_prizes: []
//                           }
//                         });
//                       }}
//                       className="w-5 h-5 text-purple-600"
//                     />
//                     <div className="ml-3 flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className="text-2xl">🎁</span>
//                         <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                       </div>
//                       <p className="text-sm text-gray-600 mb-2">Individual prizes with descriptions and values</p>
//                       <p className="text-xs text-gray-500 italic">e.g., 1st: Dubai tour $3000, 2nd: UK tour $2000</p>
//                     </div>
//                   </label>

//                   {data.lottery_config?.reward_type === 'non_monetary' && (
//                     <div className="mt-4 space-y-3">
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           💵 Total Estimated Value (USD) *
//                         </label>
//                         <input
//                           type="number"
//                           min="1"
//                           step="1"
//                           value={data.lottery_config?.estimated_value || ''}
//                           onChange={(e) => {
//                             const value = e.target.value;
//                             if (value === '') {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   estimated_value: ''
//                                 }
//                               });
//                             } else {
//                               const numValue = parseInt(value);
//                               if (!isNaN(numValue) && numValue > 0) {
//                                 updateData({
//                                   lottery_config: {
//                                     ...data.lottery_config,
//                                     estimated_value: numValue
//                                   }
//                                 });
//                               }
//                             }
//                           }}
//                           onKeyDown={(e) => {
//                             if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                               e.preventDefault();
//                             }
//                           }}
//                           placeholder="Total value of all prizes"
//                           className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                             errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                         />
//                         {errors.lottery_estimated_value && (
//                           <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* ============================================ */}
//                 {/* DEFINED PROJECTED REVENUE */}
//                 {/* ============================================ */}
//                 <div className={`p-4 rounded-lg border-2 transition-all ${
//                   data.lottery_config?.reward_type === 'projected_revenue'
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-300'
//                 }`}>
//                   <label className="flex items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="reward_type"
//                       value="projected_revenue"
//                       checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                       onChange={(e) => {
//                         setPrizeDistribution([]);
//                         setNonMonetaryPrizes([]);
//                         updateData({
//                           lottery_config: { 
//                             ...data.lottery_config, 
//                             reward_type: e.target.value, 
//                             prize_funding_source: 'creator_funded',
//                             prize_distribution: [],
//                             non_monetary_prizes: []
//                           }
//                         });
//                       }}
//                       className="w-5 h-5 text-blue-600"
//                     />
//                     <div className="ml-3 flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className="text-2xl">📈</span>
//                         <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                       </div>
//                       <p className="text-sm text-gray-600 mb-2">Share of projected content revenue with percentage distribution</p>
//                       <p className="text-xs text-gray-500 italic">e.g., USD 300,000 content generated revenue</p>
//                     </div>
//                   </label>

//                   {data.lottery_config?.reward_type === 'projected_revenue' && (
//                     <div className="mt-4 space-y-3">
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           📊 Projected Content Generated Revenue (USD) *
//                         </label>
//                         <input
//                           type="number"
//                           min="1"
//                           step="1"
//                           value={data.lottery_config?.projected_revenue || ''}
//                           onChange={(e) => {
//                             const value = e.target.value;
//                             if (value === '') {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   projected_revenue: ''
//                                 }
//                               });
//                             } else {
//                               const numValue = parseInt(value);
//                               if (!isNaN(numValue) && numValue > 0) {
//                                 updateData({
//                                   lottery_config: {
//                                     ...data.lottery_config,
//                                     projected_revenue: numValue
//                                   }
//                                 });
//                               }
//                             }
//                           }}
//                           onKeyDown={(e) => {
//                             if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                               e.preventDefault();
//                             }
//                           }}
//                           placeholder="e.g., 300000"
//                           className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                             errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                         />
//                         {errors.lottery_projected_revenue && (
//                           <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           <FaPercent className="inline mr-2" />
//                           Revenue Share Percentage for Winners (%) *
//                         </label>
//                         <input
//                           type="number"
//                           min="0.1"
//                           max="100"
//                           step="0.1"
//                           value={data.lottery_config?.revenue_share_percentage || ''}
//                           onChange={(e) => {
//                             const value = e.target.value;
//                             if (value === '') {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   revenue_share_percentage: ''
//                                 }
//                               });
//                             } else {
//                               const numValue = parseFloat(value);
//                               if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 100) {
//                                 updateData({
//                                   lottery_config: {
//                                     ...data.lottery_config,
//                                     revenue_share_percentage: numValue
//                                   }
//                                 });
//                               }
//                             }
//                           }}
//                           placeholder="e.g., 10.5"
//                           className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                             errors.lottery_revenue_share ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                         />
//                         <p className="text-xs text-gray-500 mt-1">
//                           Winners will receive this percentage of the actual generated revenue
//                         </p>
//                         {errors.lottery_revenue_share && (
//                           <p className="text-red-500 text-sm mt-1">{errors.lottery_revenue_share}</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               {errors.lottery_reward_type && (
//                 <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//               )}
//             </div>

//             {/* ============================================ */}
//             {/* NUMBER OF WINNERS */}
//             {/* ============================================ */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <div className="flex items-center justify-between mb-3">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   <FaTrophy className="inline mr-2 text-yellow-600" />
//                   Number of Winners (1-100) *
//                 </label>
//               </div>
              
//               <input
//                 type="number"
//                 min="1"
//                 max="100"
//                 step="1"
//                 value={data.lottery_config?.winner_count === '' ? '' : data.lottery_config?.winner_count || ''}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (value === '') {
//                     updateData({
//                       lottery_config: {
//                         ...data.lottery_config,
//                         winner_count: ''
//                       }
//                     });
//                   } else {
//                     const numValue = parseInt(value);
//                     if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
//                       updateData({
//                         lottery_config: {
//                           ...data.lottery_config,
//                           winner_count: numValue
//                         }
//                       });
//                     }
//                   }
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
//                     e.preventDefault();
//                   }
//                 }}
//                 className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                   errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter number between 1 and 100"
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 Specify how many winners will be selected for prizes
//               </p>
//               {errors.lottery_winner_count && (
//                 <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//               )}

//               {/* ============================================ */}
//               {/* PERCENTAGE DISTRIBUTION (Monetary & Revenue) */}
//               {/* ============================================ */}
//               {data.lottery_config?.winner_count > 0 && 
//                (data.lottery_config?.reward_type === 'monetary' || data.lottery_config?.reward_type === 'projected_revenue') && (
//                 <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
//                   <div className="flex items-center justify-between mb-3">
//                     <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                       <FaPercent className="text-orange-600" />
//                       Prize Distribution (%)
//                     </h5>
//                     <div className="text-right">
//                       <p className="text-sm font-semibold text-gray-700">
//                         Total: {calculateTotalPercentage().toFixed(2)}%
//                       </p>
//                       <p className={`text-xs font-bold ${
//                         getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
//                       }`}>
//                         Remaining: {getRemainingPercentage().toFixed(2)}%
//                       </p>
//                     </div>
//                   </div>

//                   {calculateTotalPercentage() > 100 && (
//                     <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                       <FaExclamationTriangle className="text-red-600" />
//                       <p className="text-sm text-red-700 font-semibold">
//                         Total exceeds 100%! Please adjust percentages.
//                       </p>
//                     </div>
//                   )}

//                   <div className="space-y-3 max-h-96 overflow-y-auto">
//                     {prizeDistribution.map((item, index) => {
//                       const totalPool = getTotalPrizePool();
//                       const currentAmount = (totalPool * (parseFloat(item.percentage) || 0)) / 100;
//                       const remainingAmount = getRemainingAmount(item.rank);
//                       const remainingPercentage = getRemainingPercentage() + (parseFloat(item.percentage) || 0);

//                       return (
//                         <div key={item.rank} className="space-y-1">
//                           <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
//                             <div className="flex items-center gap-2 w-24">
//                               <FaTrophy className={`${
//                                 index === 0 ? 'text-yellow-500' :
//                                 index === 1 ? 'text-gray-400' :
//                                 index === 2 ? 'text-orange-600' :
//                                 'text-gray-300'
//                               }`} />
//                               <span className="font-bold text-gray-700">#{item.rank}</span>
//                             </div>
                            
//                             <div className="flex-1">
//                               <input
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 step="any"
//                                 value={item.percentage === '' ? '' : item.percentage}
//                                 onChange={(e) => handlePercentageChange(item.rank, e.target.value)}
//                                 onKeyDown={(e) => {
//                                   if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                                     e.preventDefault();
//                                   }
//                                 }}
//                                 placeholder="0.0"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
//                                   percentageErrors[item.rank] ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>

//                             <span className="text-lg font-bold text-gray-700">%</span>
                            
//                             <div className="text-right min-w-[100px]">
//                               <div className="text-sm font-bold text-green-600">
//                                 ${currentAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                               </div>
//                             </div>
//                           </div>
                          
//                           {/* Running Balance Display */}
//                           <div className="ml-28 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
//                             <p className="text-xs text-blue-800 font-semibold">
//                               After Rank {item.rank}: ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} remaining ({remainingPercentage.toFixed(2)}% left)
//                             </p>
//                           </div>

//                           {percentageErrors[item.rank] && (
//                             <div className="ml-28 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                               <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                                 <FaExclamationTriangle className="text-red-600" />
//                                 {percentageErrors[item.rank]}
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {errors.prize_distribution && (
//                     <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                       <FaInfoCircle /> {errors.prize_distribution}
//                     </p>
//                   )}

//                   <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                     <p className="text-xs text-blue-800">
//                       <strong>Rules:</strong><br />
//                       • Rank 1 must have highest percentage<br />
//                       • Each rank must be ≤ previous rank (descending order)<br />
//                       • Total cannot exceed 100%
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* ============================================ */}
//               {/* NON-MONETARY INDIVIDUAL PRIZES */}
//               {/* ============================================ */}
//               {data.lottery_config?.winner_count > 0 && data.lottery_config?.reward_type === 'non_monetary' && (
//                 <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
//                   <div className="flex items-center justify-between mb-3">
//                     <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                       <FaGift className="text-purple-600" />
//                       Individual Prize Details
//                     </h5>
//                     <div className="text-right">
//                       <p className="text-sm font-semibold text-gray-700">
//                         Total: ${calculateTotalNonMonetaryValue().toLocaleString()}
//                       </p>
//                       <p className={`text-xs font-bold ${
//                         calculateTotalNonMonetaryValue() <= (parseFloat(data.lottery_config?.estimated_value) || 0) 
//                           ? 'text-green-600' 
//                           : 'text-red-600'
//                       }`}>
//                         Max: ${(parseFloat(data.lottery_config?.estimated_value) || 0).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>

//                   {calculateTotalNonMonetaryValue() > (parseFloat(data.lottery_config?.estimated_value) || 0) && (
//                     <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                       <FaExclamationTriangle className="text-red-600" />
//                       <p className="text-sm text-red-700 font-semibold">
//                         Total prize value exceeds estimated value! Please adjust.
//                       </p>
//                     </div>
//                   )}

//                   <div className="space-y-3 max-h-96 overflow-y-auto">
//                     {nonMonetaryPrizes.map((item, index) => {
//                       const remainingValue = getRemainingNonMonetaryValue(item.rank);

//                       return (
//                         <div key={item.rank} className="space-y-1">
//                           <div className="p-3 bg-white rounded-lg border border-purple-200">
//                             <div className="flex items-center gap-2 mb-2">
//                               <FaTrophy className={`${
//                                 index === 0 ? 'text-yellow-500' :
//                                 index === 1 ? 'text-gray-400' :
//                                 index === 2 ? 'text-orange-600' :
//                                 'text-gray-300'
//                               }`} />
//                               <span className="font-bold text-gray-700">
//                                 {index === 0 ? '🥇 1st Winner' :
//                                  index === 1 ? '🥈 2nd Winner' :
//                                  index === 2 ? '🥉 3rd Winner' :
//                                  `🏅 ${item.rank}th Winner`}
//                               </span>
//                             </div>
                            
//                             <div className="space-y-2">
//                               <div>
//                                 <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                   Prize Description *
//                                 </label>
//                                 <input
//                                   type="text"
//                                   value={item.prize_description || ''}
//                                   onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_description', e.target.value)}
//                                   placeholder="e.g., Dubai tour package with 5-star hotel"
//                                   className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                     nonMonetaryErrors[`${item.rank}_description`] ? 'border-red-500' : 'border-gray-300'
//                                   }`}
//                                 />
//                               </div>

//                               <div>
//                                 <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                   Prize Value (USD) *
//                                 </label>
//                                 <input
//                                   type="number"
//                                   min="0"
//                                   step="1"
//                                   value={item.prize_value === '' ? '' : item.prize_value}
//                                   onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_value', e.target.value)}
//                                   onKeyDown={(e) => {
//                                     if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') {
//                                       e.preventDefault();
//                                     }
//                                   }}
//                                   placeholder="0"
//                                   className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                     nonMonetaryErrors[`${item.rank}_value`] ? 'border-red-500' : 'border-gray-300'
//                                   }`}
//                                 />
//                               </div>
//                             </div>
//                           </div>

//                           {/* Running Balance Display */}
//                           <div className="ml-8 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
//                             <p className="text-xs text-blue-800 font-semibold">
//                               After Rank {item.rank}: ${remainingValue.toLocaleString()} remaining
//                             </p>
//                           </div>

//                           {(nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]) && (
//                             <div className="ml-8 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                               <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                                 <FaExclamationTriangle className="text-red-600" />
//                                 {nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]}
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {errors.prize_distribution && (
//                     <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                       <FaInfoCircle /> {errors.prize_distribution}
//                     </p>
//                   )}

//                   <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                     <p className="text-xs text-blue-800">
//                       <strong>Rules:</strong><br />
//                       • Each prize must have a description and value<br />
//                       • Rank 1 must have highest value<br />
//                       • Each rank must be ≤ previous rank (descending order)<br />
//                       • Total cannot exceed estimated value
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Prize Pool Summary */}
//             {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//                 <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <FaTrophy className="text-yellow-600" />
//                   Prize Distribution Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span>Total Prize Pool:</span>
//                     <span className="font-bold text-green-600">
//                       ${data.lottery_config.total_prize_pool.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Number of Winners:</span>
//                     <span className="font-bold">{data.lottery_config.winner_count}</span>
//                   </div>
                  
//                   {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
//                     <div className="mt-3 pt-3 border-t-2 border-green-300">
//                       <p className="font-semibold mb-2">Distribution:</p>
//                       {prizeDistribution.map((item) => {
//                         const amount = (data.lottery_config.total_prize_pool * (item.percentage / 100));
//                         return (
//                           <div key={item.rank} className="flex justify-between text-xs py-1">
//                             <span>
//                               <FaTrophy className={`inline mr-1 ${
//                                 item.rank === 1 ? 'text-yellow-500' :
//                                 item.rank === 2 ? 'text-gray-400' :
//                                 item.rank === 3 ? 'text-orange-600' :
//                                 'text-gray-300'
//                               }`} />
//                               Rank {item.rank} ({item.percentage}%):
//                             </span>
//                             <span className="font-bold text-green-600">
//                               ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>


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






// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import {
//   FaGlobe,
//   FaDollarSign,
//   FaFingerprint,
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaEye,
//   FaEyeSlash,
//   FaEdit,
//   FaLock,
//   FaTrophy,
//   FaMapMarkedAlt,
//   FaTags,
//   FaPercent,
//   FaExclamationTriangle
// } from 'react-icons/fa';

// // Regional zones for pricing
// const REGIONAL_ZONES = [
//   { id: 'north_america', name: 'North America', countries: 'USA, Canada', default_fee: 5.00 },
//   { id: 'western_europe', name: 'Western Europe', countries: 'UK, Germany, France, etc.', default_fee: 4.50 },
//   { id: 'australia_nz', name: 'Australia & New Zealand', countries: 'Australia, New Zealand', default_fee: 4.00 },
//   { id: 'middle_east', name: 'Middle East', countries: 'UAE, Saudi Arabia, Qatar, etc.', default_fee: 3.50 },
//   { id: 'eastern_europe', name: 'Eastern Europe', countries: 'Poland, Russia, Ukraine, etc.', default_fee: 2.50 },
//   { id: 'latin_america', name: 'Latin America', countries: 'Brazil, Argentina, Mexico, etc.', default_fee: 2.00 },
//   { id: 'asia', name: 'Asia', countries: 'China, India, Thailand, etc.', default_fee: 1.50 },
//   { id: 'africa', name: 'Africa', countries: 'Nigeria, Kenya, South Africa, etc.', default_fee: 1.00 }
// ];

// // All countries organized by continent
// const COUNTRIES_BY_CONTINENT = {
//   'Africa': [
//     'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
//     'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of Congo',
//     'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana',
//     'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
//     'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
//     'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
//     'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
//     'Zambia', 'Zimbabwe'
//   ],
//   'Asia': [
//     'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia',
//     'China', 'Georgia', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan',
//     'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Macau', 'Malaysia',
//     'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine',
//     'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria',
//     'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates',
//     'Uzbekistan', 'Vietnam', 'Yemen'
//   ],
//   'Europe': [
//     'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
//     'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
//     'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein',
//     'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
//     'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia',
//     'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'
//   ],
//   'North America': [
//     'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
//     'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras',
//     'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia',
//     'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'
//   ],
//   'South America': [
//     'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
//     'Peru', 'Suriname', 'Uruguay', 'Venezuela'
//   ],
//   'Australia & Oceania': [
//     'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand',
//     'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
//   ]
// };

// // Election categories
// const ELECTION_CATEGORIES = [
//   { id: 1, category_name: 'Politics', description: 'Political elections and polls', icon: '🏛️' },
//   { id: 2, category_name: 'Sports', description: 'Sports-related voting', icon: '⚽' },
//   { id: 3, category_name: 'Entertainment', description: 'Movies, music, and entertainment', icon: '🎬' },
//   { id: 4, category_name: 'Education', description: 'Academic and educational voting', icon: '📚' },
//   { id: 5, category_name: 'Business', description: 'Corporate and business decisions', icon: '💼' },
//   { id: 6, category_name: 'Community', description: 'Community decisions and polls', icon: '🏘️' },
//   { id: 7, category_name: 'Technology', description: 'Tech-related polls and surveys', icon: '💻' },
//   { id: 8, category_name: 'Health', description: 'Health and wellness voting', icon: '🏥' }
// ];

// export default function Step2Configuration({ data, updateData, onNext, onBack, eligibility }) {
//   const [errors, setErrors] = useState({});
//   const [regionalFees, setRegionalFees] = useState(data.regional_fees || {});
  
//   // ✅ NEW: Prize distribution state
//   const [prizeDistribution, setPrizeDistribution] = useState(
//     data.lottery_config?.prize_distribution || []
//   );
  
//   // ✅ NEW: Track individual field errors
//   const [percentageErrors, setPercentageErrors] = useState({});
  
//   // ✅ NEW: Show/Hide pricing in preview toggles
//   const [showParticipationFeeInPreview, setShowParticipationFeeInPreview] = useState(true);
//   const [showLotteryPrizesInPreview, setShowLotteryPrizesInPreview] = useState(true);

//   // Initialize regional fees with defaults if needed
//   useEffect(() => {
//     if (data.pricing_type === 'paid_regional' && Object.keys(regionalFees).length === 0) {
//       const defaultFees = {};
//       REGIONAL_ZONES.forEach(zone => {
//         defaultFees[zone.id] = zone.default_fee;
//       });
//       setRegionalFees(defaultFees);
//       updateData({ regional_fees: defaultFees });
//     }
    
//     // ✅ NEW: Load show/hide preview settings
//     setShowParticipationFeeInPreview(data.show_participation_fee_in_preview !== false);
//     setShowLotteryPrizesInPreview(data.show_lottery_prizes_in_preview !== false);
//   }, [data.pricing_type]);

//   // ✅ NEW: Initialize prize distribution when winner count changes
//   useEffect(() => {
//     const winnerCount = data.lottery_config?.winner_count || 1;
    
//     // Only initialize if distribution doesn't match winner count
//     if (prizeDistribution.length !== winnerCount) {
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
//   }, [data.lottery_config?.winner_count]);

//   // ✅ NEW: Calculate total percentage and remaining
//   const calculateTotalPercentage = () => {
//     return prizeDistribution.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0);
//   };

//   const getRemainingPercentage = () => {
//     return Math.max(0, 100 - calculateTotalPercentage());
//   };

//   // ✅ NEW: Validate percentage distribution
//   const validatePrizeDistribution = () => {
//     const total = calculateTotalPercentage();
    
//     // Check total doesn't exceed 100%
//     if (total > 100) {
//       return {
//         valid: false,
//         message: `Total percentage is ${total.toFixed(2)}% which exceeds 100%. Please adjust.`
//       };
//     }

//     // Check descending order
//     for (let i = 0; i < prizeDistribution.length - 1; i++) {
//       const current = parseFloat(prizeDistribution[i].percentage) || 0;
//       const next = parseFloat(prizeDistribution[i + 1].percentage) || 0;
      
//       if (current < next) {
//         return {
//           valid: false,
//           message: `Rank ${i + 1} (${current}%) cannot be less than Rank ${i + 2} (${next}%). Must be in descending order.`
//         };
//       }
//     }

//     // Check all percentages are set (optional - can be 0)
//     const allSet = prizeDistribution.every(item => item.percentage !== undefined && item.percentage !== '');
//     if (!allSet) {
//       return {
//         valid: false,
//         message: 'Please set percentage for all winners'
//       };
//     }

//     return { valid: true };
//   };

//   // ✅ IMPROVED: Handle percentage change with inline errors (no toast)
//   const handlePercentageChange = (rank, value) => {
//     const index = rank - 1;
//     const newErrors = { ...percentageErrors };
    
//     // Allow empty string for deletion
//     if (value === '' || value === null || value === undefined) {
//       const newDistribution = [...prizeDistribution];
//       newDistribution[index] = { ...newDistribution[index], percentage: '' };
//       setPrizeDistribution(newDistribution);
//       delete newErrors[rank];
//       setPercentageErrors(newErrors);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           prize_distribution: newDistribution
//         }
//       });
//       return;
//     }

//     // Parse as float
//     const numValue = parseFloat(value);
    
//     // Block negative values
//     if (numValue < 0) {
//       return;
//     }

//     // Block values > 100
//     if (numValue > 100) {
//       newErrors[rank] = `Cannot exceed 100%`;
//       setPercentageErrors(newErrors);
//       return;
//     }

//     // Create new distribution
//     const newDistribution = [...prizeDistribution];
//     newDistribution[index] = { ...newDistribution[index], percentage: numValue };

//     // Check if total would exceed 100%
//     const newTotal = newDistribution.reduce((sum, item) => {
//       const val = parseFloat(item.percentage);
//       return sum + (isNaN(val) ? 0 : val);
//     }, 0);
    
//     if (newTotal > 100) {
//       const currentTotal = prizeDistribution.reduce((sum, item) => {
//         const val = parseFloat(item.percentage);
//         return sum + (isNaN(val) ? 0 : val);
//       }, 0);
//       const remaining = 100 - (currentTotal - (parseFloat(prizeDistribution[index].percentage) || 0));
//       newErrors[rank] = `Total would exceed 100%. You have ${remaining.toFixed(1)}% remaining`;
//       setPercentageErrors(newErrors);
//       return;
//     }

//     // Check descending order - previous rank must be >= current
//     if (index > 0) {
//       const previousVal = parseFloat(newDistribution[index - 1].percentage);
//       if (!isNaN(previousVal) && numValue > previousVal) {
//         newErrors[rank] = `Must be ≤ Rank ${rank - 1} (${previousVal}%)`;
//         setPercentageErrors(newErrors);
//         return;
//       }
//     }

//     // Check descending order - current must be >= next rank
//     if (index < newDistribution.length - 1) {
//       const nextVal = parseFloat(newDistribution[index + 1].percentage);
//       if (!isNaN(nextVal) && numValue < nextVal) {
//         newErrors[rank] = `Must be ≥ Rank ${rank + 1} (${nextVal}%)`;
//         setPercentageErrors(newErrors);
//         return;
//       }
//     }

//     // Clear error if valid
//     delete newErrors[rank];
//     setPercentageErrors(newErrors);

//     setPrizeDistribution(newDistribution);
//     updateData({
//       lottery_config: {
//         ...data.lottery_config,
//         prize_distribution: newDistribution
//       }
//     });
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
//       const invalidRegions = REGIONAL_ZONES.filter(zone => 
//         !regionalFees[zone.id] || regionalFees[zone.id] <= 0
//       );
//       if (invalidRegions.length > 0) {
//         newErrors.regional_fees = `Please enter valid fees for all regions`;
//       }
//     }

//     // Lottery validation
//     if (data.lottery_enabled) {
//       if (!data.lottery_config?.prize_funding_source) {
//         newErrors.prize_funding_source = 'Please select prize funding source';
//       }

//       if (data.lottery_config?.prize_funding_source === 'creator_funded') {
//         if (!data.lottery_config?.reward_type) {
//           newErrors.lottery_reward_type = 'Please select a reward type';
//         }

//         if (data.lottery_config?.reward_type === 'monetary') {
//           if (!data.lottery_config?.total_prize_pool || data.lottery_config.total_prize_pool <= 0) {
//             newErrors.lottery_prize_pool = 'Please enter a valid prize pool amount';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'non_monetary') {
//           if (!data.lottery_config?.prize_description?.trim()) {
//             newErrors.lottery_prize_description = 'Please describe the non-monetary prize';
//           }
//           if (!data.lottery_config?.estimated_value || data.lottery_config.estimated_value <= 0) {
//             newErrors.lottery_estimated_value = 'Please enter estimated value';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'projected_revenue') {
//           if (!data.lottery_config?.projected_revenue || data.lottery_config.projected_revenue <= 0) {
//             newErrors.lottery_projected_revenue = 'Please enter projected revenue';
//           }
//           if (!data.lottery_config?.revenue_share_percentage || data.lottery_config.revenue_share_percentage <= 0 || data.lottery_config.revenue_share_percentage > 100) {
//             newErrors.lottery_revenue_share = 'Revenue share must be between 0 and 100%';
//           }
//         }
//       }

//       if (!data.lottery_config?.winner_count || data.lottery_config.winner_count < 1 || data.lottery_config.winner_count > 100) {
//         newErrors.lottery_winner_count = 'Winner count must be between 1 and 100';
//       }

//       // ✅ NEW: Validate prize distribution
//       const distributionValidation = validatePrizeDistribution();
//       if (!distributionValidation.valid) {
//         newErrors.prize_distribution = distributionValidation.message;
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handlePermissionTypeChange = (type) => {
//     updateData({ 
//       permission_type: type,
//       allowed_countries: type === 'specific_countries' ? data.allowed_countries || [] : []
//     });
//   };

//   const toggleCountry = (country) => {
//     const currentCountries = data.allowed_countries || [];
//     const newCountries = currentCountries.includes(country)
//       ? currentCountries.filter(c => c !== country)
//       : [...currentCountries, country];
//     updateData({ allowed_countries: newCountries });
//   };

//   const selectAllFromContinent = (continent) => {
//     const countries = COUNTRIES_BY_CONTINENT[continent];
//     const currentCountries = data.allowed_countries || [];
//     const allSelected = countries.every(c => currentCountries.includes(c));
    
//     if (allSelected) {
//       updateData({ 
//         allowed_countries: currentCountries.filter(c => !countries.includes(c)) 
//       });
//     } else {
//       const uniqueCountries = [...new Set([...currentCountries, ...countries])];
//       updateData({ allowed_countries: uniqueCountries });
//     }
//   };

//   const handleRegionalFeeChange = (zoneId, value) => {
//     if (value === '' || value === null || value === undefined) {
//       const newFees = { ...regionalFees, [zoneId]: '' };
//       setRegionalFees(newFees);
//       updateData({ regional_fees: newFees });
//       return;
//     }
    
//     const numValue = parseFloat(value);
//     if (!isNaN(numValue) && numValue >= 0) {
//       const newFees = { ...regionalFees, [zoneId]: numValue };
//       setRegionalFees(newFees);
//       updateData({ regional_fees: newFees });
//     }
//   };

//   const handleContinue = () => {
//     if (!validateStep()) {
//       toast.error('Please fix all errors before continuing');
//       return;
//     }
    
//     // ✅ NEW: Include show/hide preview settings
//     updateData({
//       show_participation_fee_in_preview: showParticipationFeeInPreview,
//       show_lottery_prizes_in_preview: showLotteryPrizesInPreview
//     });
    
//     onNext();
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

//       {/* Election Category Selection - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaTags className="text-purple-600" />
//             Election Category *
//           </h3>
//           <FaInfoCircle className="text-gray-400 text-xl cursor-help" title="Select the category that best describes your election" />
//         </div>

//         <div className="grid md:grid-cols-4 gap-4">
//           {ELECTION_CATEGORIES.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => updateData({ category_id: category.id })}
//               className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-center ${
//                 data.category_id === category.id
//                   ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
//                   : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
//               }`}
//             >
//               <div className="text-4xl mb-2">{category.icon}</div>
//               <h4 className={`font-bold text-sm mb-1 ${
//                 data.category_id === category.id ? 'text-purple-600' : 'text-gray-800'
//               }`}>
//                 {category.category_name}
//                 {data.category_id === category.id && (
//                   <FaCheckCircle className="inline ml-1 text-green-500 text-xs" />
//                 )}
//               </h4>
//               <p className="text-xs text-gray-500">{category.description}</p>
//             </button>
//           ))}
//         </div>

//         {errors.category_id && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.category_id}
//           </p>
//         )}
//       </div>

//       {/* Access Control - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGlobe className="text-green-600" />
//             Who can participate in this election? *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* World Citizens */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'public'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="public"
//               checked={data.permission_type === 'public'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaGlobe className="text-green-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">World Citizens</span>
//                 {data.permission_type === 'public' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 Anyone from anywhere in the world can participate in this election. No geographic restrictions will be applied.
//               </p>
//             </div>
//           </label>

//           {/* Specific Countries */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'specific_countries'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="specific_countries"
//               checked={data.permission_type === 'specific_countries'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaMapMarkedAlt className="text-blue-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">Specific Countries</span>
//                 {data.permission_type === 'specific_countries' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Only residents of selected countries can participate. You can choose one or multiple countries.
//               </p>

//               {data.permission_type === 'specific_countries' && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
//                   <div className="flex justify-between items-center mb-4">
//                     <h4 className="font-semibold text-gray-800">
//                       Select Countries ({data.allowed_countries?.length || 0} selected)
//                     </h4>
//                     {data.allowed_countries?.length > 0 && (
//                       <button
//                         onClick={() => updateData({ allowed_countries: [] })}
//                         className="text-sm text-red-600 hover:text-red-700 font-semibold"
//                       >
//                         Clear All
//                       </button>
//                     )}
//                   </div>

//                   {/* Country Selection by Continent */}
//                   <div className="space-y-4 max-h-96 overflow-y-auto">
//                     {Object.entries(COUNTRIES_BY_CONTINENT).map(([continent, countries]) => {
//                       const allSelected = countries.every(c => data.allowed_countries?.includes(c));
                      
//                       return (
//                         <div key={continent} className="border-2 border-gray-200 rounded-lg p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <h5 className="font-bold text-gray-800">{continent}</h5>
//                             <button
//                               onClick={() => selectAllFromContinent(continent)}
//                               className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
//                                 allSelected
//                                   ? 'bg-red-100 text-red-600 hover:bg-red-200'
//                                   : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
//                               }`}
//                             >
//                               {allSelected ? 'Deselect All' : 'Select All'}
//                             </button>
//                           </div>
//                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                             {countries.map((country) => (
//                               <label
//                                 key={country}
//                                 className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
//                                   data.allowed_countries?.includes(country)
//                                     ? 'bg-blue-100 text-blue-800'
//                                     : 'hover:bg-gray-100'
//                                 }`}
//                               >
//                                 <input
//                                   type="checkbox"
//                                   checked={data.allowed_countries?.includes(country) || false}
//                                   onChange={() => toggleCountry(country)}
//                                   className="w-4 h-4 text-blue-600 rounded"
//                                 />
//                                 <span className="ml-2 text-sm">{country}</span>
//                               </label>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.permission_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.permission_type}
//           </p>
//         )}
//         {errors.allowed_countries && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.allowed_countries}
//           </p>
//         )}
//       </div>

//       {/* Biometric Authentication - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaFingerprint className="text-purple-600" />
//             Biometric Authentication
//           </h3>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={data.biometric_required || false}
//               onChange={(e) => updateData({ biometric_required: e.target.checked })}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
//           </label>
//         </div>

//         <p className="text-gray-600 mb-4">
//           {data.biometric_required
//             ? '✅ Biometric authentication is REQUIRED. Voters must verify their identity using fingerprint (Android) or Face ID (iPhone).'
//             : '❌ Biometric authentication is NOT required. Voters can participate without biometric verification.'}
//         </p>

//         {data.biometric_required && (
//           <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
//             <p className="text-sm text-purple-800">
//               <strong>Note:</strong> Desktop users will not be able to vote in this election as biometric authentication is enabled.
//               Only mobile users with fingerprint or Face ID capabilities can participate.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Pricing Configuration - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaDollarSign className="text-green-600" />
//             Participation Fee *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* Free */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'free'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="free"
//               checked={data.pricing_type === 'free'}
//               onChange={(e) => updateData({ pricing_type: e.target.value, general_participation_fee: 0 })}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🆓</span>
//                 <span className="font-bold text-lg text-gray-900">Free</span>
//                 {data.pricing_type === 'free' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 No participation fee. Election is completely free for all voters.
//               </p>
//             </div>
//           </label>

//           {/* Paid General */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_general'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_general"
//               checked={data.pricing_type === 'paid_general'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">💳</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (General Fee)</span>
//                 {data.pricing_type === 'paid_general' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Single participation fee for all participants worldwide
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_general' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-3">
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Participation Fee (USD) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="any"
//                     value={data.general_participation_fee === '' ? '' : data.general_participation_fee || ''}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       if (value === '') {
//                         updateData({ general_participation_fee: '' });
//                       } else {
//                         const numValue = parseFloat(value);
//                         if (!isNaN(numValue) && numValue >= 0) {
//                           updateData({ general_participation_fee: numValue });
//                         }
//                       }
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                         e.preventDefault();
//                       }
//                     }}
//                     placeholder="e.g., 1.00"
//                     className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                       errors.general_participation_fee ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                   />
//                   {errors.general_participation_fee && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.general_participation_fee}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-2">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>

//           {/* Paid Regional */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_regional'
//               ? 'border-indigo-500 bg-indigo-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_regional"
//               checked={data.pricing_type === 'paid_regional'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-indigo-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🌍</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (Regional Fee)</span>
//                 {data.pricing_type === 'paid_regional' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Different fees for 8 regional zones based on purchasing power
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_regional' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-indigo-200">
//                   <h4 className="font-semibold text-gray-800 mb-4">Set Fees by Region (USD)</h4>
//                   <div className="space-y-4">
//                     {REGIONAL_ZONES.map((zone) => (
//                       <div key={zone.id} className="flex items-center gap-4">
//                         <div className="flex-1">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {zone.name}
//                           </label>
//                           <p className="text-xs text-gray-500 mb-2">{zone.countries}</p>
//                         </div>
//                         <div className="w-32">
//                           <input
//                             type="number"
//                             min="0"
//                             step="any"
//                             value={regionalFees[zone.id] === '' ? '' : (regionalFees[zone.id] || zone.default_fee)}
//                             onChange={(e) => handleRegionalFeeChange(zone.id, e.target.value)}
//                             onKeyDown={(e) => {
//                               if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                                 e.preventDefault();
//                               }
//                             }}
//                             placeholder={zone.default_fee.toFixed(2)}
//                             className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   {errors.regional_fees && (
//                     <p className="text-red-500 text-sm mt-3">
//                       {errors.regional_fees}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-3">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted from each transaction
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.pricing_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.pricing_type}
//           </p>
//         )}
//       </div>

//       {/* Lottery Feature - WITH CREATOR-FUNDED SECTIONS - UNCHANGED EXCEPT WINNER DISTRIBUTION */}
//       <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//         !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//       }`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGift className="text-yellow-600" />
//             Gamification Feature
//           </h3>
//           <label className={`relative inline-flex items-center ${
//             eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//           }`}>
//             <input
//               type="checkbox"
//               checked={data.lottery_enabled || false}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ lottery_enabled: e.target.checked })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//           </label>
//         </div>

//         {!eligibility?.canCreatePaidElections && (
//           <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//             <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//               <FaInfoCircle />
//               ⚠️ Upgrade your plan to enable Gamification Feature
//             </p>
//           </div>
//         )}

//         <p className="text-gray-700 mb-4 font-medium">
//           {data.lottery_enabled
//             ? '🎉 Gamify this election with prizes for voters'
//             : 'Add excitement by making this election a gamify with prizes'}
//         </p>

//         {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//           <div className="space-y-6">
//             {/* Prize Funding Source Selection */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <h4 className="font-bold text-gray-900 mb-4">Prize Funding Source *</h4>
//               <div className="space-y-3">
//                 {/* Creator/Sponsor Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'creator_funded'
//                     ? 'border-green-500 bg-green-50'
//                     : 'border-gray-300 hover:border-green-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="creator_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'creator_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</span>
//                     <p className="text-sm text-gray-600">You or your sponsor will provide the prizes</p>
//                   </div>
//                 </label>

//                 {/* Participation Fee Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'participation_fee_funded'
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-300 hover:border-blue-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="participation_fee_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'participation_fee_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Participation Fee Funded</span>
//                     <p className="text-sm text-gray-600">Prize pool comes from voter participation fees</p>
//                   </div>
//                 </label>
//               </div>
//               {errors.prize_funding_source && (
//                 <p className="text-red-500 text-sm mt-2">{errors.prize_funding_source}</p>
//               )}
//             </div>

//             {/* Creator-Funded Prize Configuration - ALL REWARD TYPE SECTIONS UNCHANGED */}
//             {data.lottery_config?.prize_funding_source === 'creator_funded' && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//                 <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//                 <div className="space-y-4">
//                   {/* Defined Monetary Prize - UNCHANGED */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'monetary'
//                       ? 'border-green-500 bg-green-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="monetary"
//                         checked={data.lottery_config?.reward_type === 'monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-green-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">💵</span>
//                           <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Fixed cash amount</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💰 Total Prize Pool Amount (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.total_prize_pool || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 100000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                               errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_pool && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Defined Non-monetary Prize - UNCHANGED */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'non_monetary'
//                       ? 'border-purple-500 bg-purple-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="non_monetary"
//                         checked={data.lottery_config?.reward_type === 'non_monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-purple-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">🎁</span>
//                           <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Coupons, vouchers, experiences</p>
//                         <p className="text-xs text-gray-500 italic">e.g., One week Dubai holiday with 5-star hotel stay</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'non_monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             🏷️ Non-monetary Prize Description *
//                           </label>
//                           <textarea
//                             value={data.lottery_config?.prize_description || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 prize_description: e.target.value
//                               }
//                             })}
//                             placeholder="e.g., One week Dubai holiday with 5-star hotel stay, luxury spa package, tech gadgets bundle"
//                             rows={3}
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none ${
//                               errors.lottery_prize_description ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_description && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_description}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💵 Estimated Value (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.estimated_value || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="Estimated monetary value"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                               errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_estimated_value && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Projected Revenue - UNCHANGED */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'projected_revenue'
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="projected_revenue"
//                         checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-blue-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">📈</span>
//                           <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Share of projected content revenue</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 300,000 content generated revenue</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'projected_revenue' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             📊 Projected Content Generated Revenue (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.projected_revenue || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 300000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_projected_revenue && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             <FaPercent className="inline mr-2" />
//                             Revenue Share Percentage for Winners (%) *
//                           </label>
//                           <input
//                             type="number"
//                             min="0.1"
//                             max="100"
//                             step="0.1"
//                             value={data.lottery_config?.revenue_share_percentage || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 revenue_share_percentage: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 10.5"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_revenue_share ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           <p className="text-xs text-gray-500 mt-1">
//                             Winners will receive this percentage of the actual generated revenue
//                           </p>
//                           {errors.lottery_revenue_share && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_revenue_share}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {errors.lottery_reward_type && (
//                   <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//                 )}
//               </div>
//             )}

//             {/* ✅ MODIFIED: Number of Winners with Percentage Distribution */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <div className="flex items-center justify-between mb-3">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   <FaTrophy className="inline mr-2 text-yellow-600" />
//                   Number of Winners (1-100) *
//                 </label>
//               </div>
              
//               <input
//                 type="number"
//                 min="1"
//                 max="100"
//                 step="1"
//                 value={data.lottery_config?.winner_count === '' ? '' : data.lottery_config?.winner_count || ''}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (value === '') {
//                     updateData({
//                       lottery_config: {
//                         ...data.lottery_config,
//                         winner_count: ''
//                       }
//                     });
//                   } else {
//                     const numValue = parseInt(value);
//                     if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
//                       updateData({
//                         lottery_config: {
//                           ...data.lottery_config,
//                           winner_count: numValue
//                         }
//                       });
//                     }
//                   }
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
//                     e.preventDefault();
//                   }
//                 }}
//                 className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                   errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter number between 1 and 100"
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 Specify how many winners will be selected for prizes
//               </p>
//               {errors.lottery_winner_count && (
//                 <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//               )}

//               {/* ✅ NEW: Prize Percentage Distribution */}
//               {data.lottery_config?.winner_count > 0 && (
//                 <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
//                   <div className="flex items-center justify-between mb-3">
//                     <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                       <FaPercent className="text-orange-600" />
//                       Prize Distribution (%)
//                     </h5>
//                     <div className="text-right">
//                       <p className="text-sm font-semibold text-gray-700">
//                         Total: {calculateTotalPercentage().toFixed(2)}%
//                       </p>
//                       <p className={`text-xs font-bold ${
//                         getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
//                       }`}>
//                         Remaining: {getRemainingPercentage().toFixed(2)}%
//                       </p>
//                     </div>
//                   </div>

//                   {/* Show error if total > 100% */}
//                   {calculateTotalPercentage() > 100 && (
//                     <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                       <FaExclamationTriangle className="text-red-600" />
//                       <p className="text-sm text-red-700 font-semibold">
//                         Total exceeds 100%! Please adjust percentages.
//                       </p>
//                     </div>
//                   )}

//                   {/* Distribution Inputs */}
//                   <div className="space-y-3 max-h-96 overflow-y-auto">
//                     {prizeDistribution.map((item, index) => (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-yellow-200">
//                           <div className="flex items-center gap-2 w-24">
//                             <FaTrophy className={`${
//                               index === 0 ? 'text-yellow-500' :
//                               index === 1 ? 'text-gray-400' :
//                               index === 2 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             <span className="font-bold text-gray-700">#{item.rank}</span>
//                           </div>
                          
//                           <div className="flex-1">
//                             <input
//                               type="number"
//                               min="0"
//                               max="100"
//                               step="any"
//                               value={item.percentage === '' ? '' : item.percentage}
//                               onChange={(e) => handlePercentageChange(item.rank, e.target.value)}
//                               onKeyDown={(e) => {
//                                 // Prevent minus key
//                                 if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                                   e.preventDefault();
//                                 }
//                               }}
//                               placeholder="0.0"
//                               className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
//                                 percentageErrors[item.rank] ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                               }`}
//                             />
//                           </div>

//                           <span className="text-lg font-bold text-gray-700">%</span>
//                         </div>
                        
//                         {/* ✅ Inline error message below input */}
//                         {percentageErrors[item.rank] && (
//                           <div className="ml-28 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {percentageErrors[item.rank]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {errors.prize_distribution && (
//                     <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                       <FaInfoCircle /> {errors.prize_distribution}
//                     </p>
//                   )}

//                   {/* Helper Info */}
//                   <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                     <p className="text-xs text-blue-800">
//                       <strong>Rules:</strong><br />
//                       • Rank 1 must have highest percentage<br />
//                       • Each rank must be ≤ previous rank (descending order)<br />
//                       • Total cannot exceed 100%
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Prize Pool Summary - UPDATED WITH DISTRIBUTION */}
//             {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//                 <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <FaTrophy className="text-yellow-600" />
//                   Prize Distribution Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span>Total Prize Pool:</span>
//                     <span className="font-bold text-green-600">
//                       ${data.lottery_config.total_prize_pool.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Number of Winners:</span>
//                     <span className="font-bold">{data.lottery_config.winner_count}</span>
//                   </div>
                  
//                   {/* Show distribution breakdown */}
//                   {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
//                     <div className="mt-3 pt-3 border-t-2 border-green-300">
//                       <p className="font-semibold mb-2">Distribution:</p>
//                       {prizeDistribution.map((item) => {
//                         const amount = (data.lottery_config.total_prize_pool * (item.percentage / 100));
//                         return (
//                           <div key={item.rank} className="flex justify-between text-xs py-1">
//                             <span>
//                               <FaTrophy className={`inline mr-1 ${
//                                 item.rank === 1 ? 'text-yellow-500' :
//                                 item.rank === 2 ? 'text-gray-400' :
//                                 item.rank === 3 ? 'text-orange-600' :
//                                 'text-gray-300'
//                               }`} />
//                               Rank {item.rank} ({item.percentage}%):
//                             </span>
//                             <span className="font-bold text-green-600">
//                               ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ============================================
//           PREVIEW DISPLAY SETTINGS SECTION (NEW)
//           ============================================ */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-2 bg-purple-100 rounded-lg">
//             <FaEye className="text-purple-600 text-xl" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800">Preview Display Settings</h3>
//             <p className="text-sm text-gray-600">Control what information is visible in the public preview</p>
//           </div>
//         </div>

//         <div className="space-y-4">
//           {/* Show Participation Fee Toggle */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaDollarSign className="text-green-600" />
//                 <label className="font-medium text-gray-800">
//                   Show Participation Fee in Preview
//                 </label>
//               </div>
//               <p className="text-sm text-gray-600 ml-6">
//                 Display participation fees publicly in the election preview
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={() => setShowParticipationFeeInPreview(!showParticipationFeeInPreview)}
//               className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
//                 showParticipationFeeInPreview ? 'bg-green-600' : 'bg-gray-300'
//               }`}
//             >
//               <span
//                 className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
//                   showParticipationFeeInPreview ? 'translate-x-7' : 'translate-x-1'
//                 }`}
//               />
//             </button>
//           </div>

//           {/* Show Lottery Prizes Toggle */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaGift className="text-yellow-600" />
//                 <label className="font-medium text-gray-800">
//                   Show Gamification Prizes in Preview
//                 </label>
//               </div>
//               <p className="text-sm text-gray-600 ml-6">
//                 Display lottery prize information publicly in the election preview
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={() => setShowLotteryPrizesInPreview(!showLotteryPrizesInPreview)}
//               className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
//                 showLotteryPrizesInPreview ? 'bg-green-600' : 'bg-gray-300'
//               }`}
//             >
//               <span
//                 className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
//                   showLotteryPrizesInPreview ? 'translate-x-7' : 'translate-x-1'
//                 }`}
//               />
//             </button>
//           </div>

//           {/* Info Alert */}
//           <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
//             <FaExclamationTriangle className="text-blue-600 mt-1 flex-shrink-0" />
//             <div className="text-sm text-blue-800">
//               <p className="font-medium mb-1">Privacy Control</p>
//               <p>
//                 These settings control what voters see in the election preview. Regardless of these settings, 
//                 fees will still be collected when configured, and lottery information will be available to participants.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Results & Features - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//           <FaEye className="text-indigo-600" />
//           Results & Features
//         </h3>

//         <div className="space-y-4">
//           {/* Show Live Results */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.show_live_results ? <FaEye className="text-green-600" /> : <FaEyeSlash className="text-gray-400" />}
//                 Show Live Results During Election
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Display vote counts in real-time while election is active
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.show_live_results || false}
//                 onChange={(e) => updateData({ show_live_results: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>

//           {/* Vote Editing */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.vote_editing_allowed ? <FaEdit className="text-green-600" /> : <FaLock className="text-gray-400" />}
//                 Allow Voters to Change Their Votes
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Voters can modify their choices before election ends
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.vote_editing_allowed || false}
//                 onChange={(e) => updateData({ vote_editing_allowed: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>
//         </div>
//       </div>

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
// // ✅ ONLY MODIFIED: Number of Winners section - Added percentage distribution with validation
// // - Descending order validation (1st > 2nd > 3rd, etc.)
// // - Total cannot exceed 100%
// // - Shows remaining percentage
// // - Auto-suggests distribution if total exceeds 100%

// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import {
//   FaGlobe,
//   FaDollarSign,
//   FaFingerprint,
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaEye,
//   FaEyeSlash,
//   FaEdit,
//   FaLock,
//   FaTrophy,
//   FaMapMarkedAlt,
//   FaTags,
//   FaPercent,
//   FaExclamationTriangle
// } from 'react-icons/fa';

// // Regional zones for pricing
// const REGIONAL_ZONES = [
//   { id: 'north_america', name: 'North America', countries: 'USA, Canada', default_fee: 5.00 },
//   { id: 'western_europe', name: 'Western Europe', countries: 'UK, Germany, France, etc.', default_fee: 4.50 },
//   { id: 'australia_nz', name: 'Australia & New Zealand', countries: 'Australia, New Zealand', default_fee: 4.00 },
//   { id: 'middle_east', name: 'Middle East', countries: 'UAE, Saudi Arabia, Qatar, etc.', default_fee: 3.50 },
//   { id: 'eastern_europe', name: 'Eastern Europe', countries: 'Poland, Russia, Ukraine, etc.', default_fee: 2.50 },
//   { id: 'latin_america', name: 'Latin America', countries: 'Brazil, Argentina, Mexico, etc.', default_fee: 2.00 },
//   { id: 'asia', name: 'Asia', countries: 'China, India, Thailand, etc.', default_fee: 1.50 },
//   { id: 'africa', name: 'Africa', countries: 'Nigeria, Kenya, South Africa, etc.', default_fee: 1.00 }
// ];

// // All countries organized by continent
// const COUNTRIES_BY_CONTINENT = {
//   'Africa': [
//     'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
//     'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of Congo',
//     'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana',
//     'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
//     'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
//     'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
//     'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
//     'Zambia', 'Zimbabwe'
//   ],
//   'Asia': [
//     'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia',
//     'China', 'Georgia', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan',
//     'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Macau', 'Malaysia',
//     'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine',
//     'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria',
//     'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates',
//     'Uzbekistan', 'Vietnam', 'Yemen'
//   ],
//   'Europe': [
//     'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
//     'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
//     'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein',
//     'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
//     'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia',
//     'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'
//   ],
//   'North America': [
//     'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
//     'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras',
//     'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia',
//     'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'
//   ],
//   'South America': [
//     'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
//     'Peru', 'Suriname', 'Uruguay', 'Venezuela'
//   ],
//   'Australia & Oceania': [
//     'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand',
//     'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
//   ]
// };

// // Election categories
// const ELECTION_CATEGORIES = [
//   { id: 1, category_name: 'Politics', description: 'Political elections and polls', icon: '🏛️' },
//   { id: 2, category_name: 'Sports', description: 'Sports-related voting', icon: '⚽' },
//   { id: 3, category_name: 'Entertainment', description: 'Movies, music, and entertainment', icon: '🎬' },
//   { id: 4, category_name: 'Education', description: 'Academic and educational voting', icon: '📚' },
//   { id: 5, category_name: 'Business', description: 'Corporate and business decisions', icon: '💼' },
//   { id: 6, category_name: 'Community', description: 'Community decisions and polls', icon: '🏘️' },
//   { id: 7, category_name: 'Technology', description: 'Tech-related polls and surveys', icon: '💻' },
//   { id: 8, category_name: 'Health', description: 'Health and wellness voting', icon: '🏥' }
// ];

// export default function Step2Configuration({ data, updateData, onNext, onBack, eligibility }) {
//   const [errors, setErrors] = useState({});
//   const [regionalFees, setRegionalFees] = useState(data.regional_fees || {});
  
//   // ✅ NEW: Prize distribution state
//   const [prizeDistribution, setPrizeDistribution] = useState(
//     data.lottery_config?.prize_distribution || []
//   );
  
//   // ✅ NEW: Track individual field errors
//   const [percentageErrors, setPercentageErrors] = useState({});

//   // Initialize regional fees with defaults if needed
//   useEffect(() => {
//     if (data.pricing_type === 'paid_regional' && Object.keys(regionalFees).length === 0) {
//       const defaultFees = {};
//       REGIONAL_ZONES.forEach(zone => {
//         defaultFees[zone.id] = zone.default_fee;
//       });
//       setRegionalFees(defaultFees);
//       updateData({ regional_fees: defaultFees });
//     }
//   }, [data.pricing_type]);

//   // ✅ NEW: Initialize prize distribution when winner count changes
//   useEffect(() => {
//     const winnerCount = data.lottery_config?.winner_count || 1;
    
//     // Only initialize if distribution doesn't match winner count
//     if (prizeDistribution.length !== winnerCount) {
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
//   }, [data.lottery_config?.winner_count]);

//   // ✅ NEW: Calculate total percentage and remaining
//   const calculateTotalPercentage = () => {
//     return prizeDistribution.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0);
//   };

//   const getRemainingPercentage = () => {
//     return Math.max(0, 100 - calculateTotalPercentage());
//   };

//   // ✅ NEW: Validate percentage distribution
//   const validatePrizeDistribution = () => {
//     const total = calculateTotalPercentage();
    
//     // Check total doesn't exceed 100%
//     if (total > 100) {
//       return {
//         valid: false,
//         message: `Total percentage is ${total.toFixed(2)}% which exceeds 100%. Please adjust.`
//       };
//     }

//     // Check descending order
//     for (let i = 0; i < prizeDistribution.length - 1; i++) {
//       const current = parseFloat(prizeDistribution[i].percentage) || 0;
//       const next = parseFloat(prizeDistribution[i + 1].percentage) || 0;
      
//       if (current < next) {
//         return {
//           valid: false,
//           message: `Rank ${i + 1} (${current}%) cannot be less than Rank ${i + 2} (${next}%). Must be in descending order.`
//         };
//       }
//     }

//     // Check all percentages are set (optional - can be 0)
//     const allSet = prizeDistribution.every(item => item.percentage !== undefined && item.percentage !== '');
//     if (!allSet) {
//       return {
//         valid: false,
//         message: 'Please set percentage for all winners'
//       };
//     }

//     return { valid: true };
//   };

//   // ✅ IMPROVED: Handle percentage change with inline errors (no toast)
//   const handlePercentageChange = (rank, value) => {
//     const index = rank - 1;
//     const newErrors = { ...percentageErrors };
    
//     // Allow empty string for deletion
//     if (value === '' || value === null || value === undefined) {
//       const newDistribution = [...prizeDistribution];
//       newDistribution[index] = { ...newDistribution[index], percentage: '' };
//       setPrizeDistribution(newDistribution);
//       delete newErrors[rank];
//       setPercentageErrors(newErrors);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           prize_distribution: newDistribution
//         }
//       });
//       return;
//     }

//     // Parse as float
//     const numValue = parseFloat(value);
    
//     // Block negative values
//     if (numValue < 0) {
//       return;
//     }

//     // Block values > 100
//     if (numValue > 100) {
//       newErrors[rank] = `Cannot exceed 100%`;
//       setPercentageErrors(newErrors);
//       return;
//     }

//     // Create new distribution
//     const newDistribution = [...prizeDistribution];
//     newDistribution[index] = { ...newDistribution[index], percentage: numValue };

//     // Check if total would exceed 100%
//     const newTotal = newDistribution.reduce((sum, item) => {
//       const val = parseFloat(item.percentage);
//       return sum + (isNaN(val) ? 0 : val);
//     }, 0);
    
//     if (newTotal > 100) {
//       const currentTotal = prizeDistribution.reduce((sum, item) => {
//         const val = parseFloat(item.percentage);
//         return sum + (isNaN(val) ? 0 : val);
//       }, 0);
//       const remaining = 100 - (currentTotal - (parseFloat(prizeDistribution[index].percentage) || 0));
//       newErrors[rank] = `Total would exceed 100%. You have ${remaining.toFixed(1)}% remaining`;
//       setPercentageErrors(newErrors);
//       return;
//     }

//     // Check descending order - previous rank must be >= current
//     if (index > 0) {
//       const previousVal = parseFloat(newDistribution[index - 1].percentage);
//       if (!isNaN(previousVal) && numValue > previousVal) {
//         newErrors[rank] = `Must be ≤ Rank ${rank - 1} (${previousVal}%)`;
//         setPercentageErrors(newErrors);
//         return;
//       }
//     }

//     // Check descending order - current must be >= next rank
//     if (index < newDistribution.length - 1) {
//       const nextVal = parseFloat(newDistribution[index + 1].percentage);
//       if (!isNaN(nextVal) && numValue < nextVal) {
//         newErrors[rank] = `Must be ≥ Rank ${rank + 1} (${nextVal}%)`;
//         setPercentageErrors(newErrors);
//         return;
//       }
//     }

//     // Clear error if valid
//     delete newErrors[rank];
//     setPercentageErrors(newErrors);

//     setPrizeDistribution(newDistribution);
//     updateData({
//       lottery_config: {
//         ...data.lottery_config,
//         prize_distribution: newDistribution
//       }
//     });
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
//       const invalidRegions = REGIONAL_ZONES.filter(zone => 
//         !regionalFees[zone.id] || regionalFees[zone.id] <= 0
//       );
//       if (invalidRegions.length > 0) {
//         newErrors.regional_fees = `Please enter valid fees for all regions`;
//       }
//     }

//     // Lottery validation
//     if (data.lottery_enabled) {
//       if (!data.lottery_config?.prize_funding_source) {
//         newErrors.prize_funding_source = 'Please select prize funding source';
//       }

//       if (data.lottery_config?.prize_funding_source === 'creator_funded') {
//         if (!data.lottery_config?.reward_type) {
//           newErrors.lottery_reward_type = 'Please select a reward type';
//         }

//         if (data.lottery_config?.reward_type === 'monetary') {
//           if (!data.lottery_config?.total_prize_pool || data.lottery_config.total_prize_pool <= 0) {
//             newErrors.lottery_prize_pool = 'Please enter a valid prize pool amount';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'non_monetary') {
//           if (!data.lottery_config?.prize_description?.trim()) {
//             newErrors.lottery_prize_description = 'Please describe the non-monetary prize';
//           }
//           if (!data.lottery_config?.estimated_value || data.lottery_config.estimated_value <= 0) {
//             newErrors.lottery_estimated_value = 'Please enter estimated value';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'projected_revenue') {
//           if (!data.lottery_config?.projected_revenue || data.lottery_config.projected_revenue <= 0) {
//             newErrors.lottery_projected_revenue = 'Please enter projected revenue';
//           }
//           if (!data.lottery_config?.revenue_share_percentage || data.lottery_config.revenue_share_percentage <= 0 || data.lottery_config.revenue_share_percentage > 100) {
//             newErrors.lottery_revenue_share = 'Revenue share must be between 0 and 100%';
//           }
//         }
//       }

//       if (!data.lottery_config?.winner_count || data.lottery_config.winner_count < 1 || data.lottery_config.winner_count > 100) {
//         newErrors.lottery_winner_count = 'Winner count must be between 1 and 100';
//       }

//       // ✅ NEW: Validate prize distribution
//       const distributionValidation = validatePrizeDistribution();
//       if (!distributionValidation.valid) {
//         newErrors.prize_distribution = distributionValidation.message;
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handlePermissionTypeChange = (type) => {
//     updateData({ 
//       permission_type: type,
//       allowed_countries: type === 'specific_countries' ? data.allowed_countries || [] : []
//     });
//   };

//   const toggleCountry = (country) => {
//     const currentCountries = data.allowed_countries || [];
//     const newCountries = currentCountries.includes(country)
//       ? currentCountries.filter(c => c !== country)
//       : [...currentCountries, country];
//     updateData({ allowed_countries: newCountries });
//   };

//   const selectAllFromContinent = (continent) => {
//     const countries = COUNTRIES_BY_CONTINENT[continent];
//     const currentCountries = data.allowed_countries || [];
//     const allSelected = countries.every(c => currentCountries.includes(c));
    
//     if (allSelected) {
//       updateData({ 
//         allowed_countries: currentCountries.filter(c => !countries.includes(c)) 
//       });
//     } else {
//       const uniqueCountries = [...new Set([...currentCountries, ...countries])];
//       updateData({ allowed_countries: uniqueCountries });
//     }
//   };

//   const handleRegionalFeeChange = (zoneId, value) => {
//     if (value === '' || value === null || value === undefined) {
//       const newFees = { ...regionalFees, [zoneId]: '' };
//       setRegionalFees(newFees);
//       updateData({ regional_fees: newFees });
//       return;
//     }
    
//     const numValue = parseFloat(value);
//     if (!isNaN(numValue) && numValue >= 0) {
//       const newFees = { ...regionalFees, [zoneId]: numValue };
//       setRegionalFees(newFees);
//       updateData({ regional_fees: newFees });
//     }
//   };

//   const handleContinue = () => {
//     if (!validateStep()) {
//       toast.error('Please fix all errors before continuing');
//       return;
//     }
//     onNext();
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

//       {/* Election Category Selection - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaTags className="text-purple-600" />
//             Election Category *
//           </h3>
//           <FaInfoCircle className="text-gray-400 text-xl cursor-help" title="Select the category that best describes your election" />
//         </div>

//         <div className="grid md:grid-cols-4 gap-4">
//           {ELECTION_CATEGORIES.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => updateData({ category_id: category.id })}
//               className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-center ${
//                 data.category_id === category.id
//                   ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
//                   : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
//               }`}
//             >
//               <div className="text-4xl mb-2">{category.icon}</div>
//               <h4 className={`font-bold text-sm mb-1 ${
//                 data.category_id === category.id ? 'text-purple-600' : 'text-gray-800'
//               }`}>
//                 {category.category_name}
//                 {data.category_id === category.id && (
//                   <FaCheckCircle className="inline ml-1 text-green-500 text-xs" />
//                 )}
//               </h4>
//               <p className="text-xs text-gray-500">{category.description}</p>
//             </button>
//           ))}
//         </div>

//         {errors.category_id && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.category_id}
//           </p>
//         )}
//       </div>

//       {/* Access Control - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGlobe className="text-green-600" />
//             Who can participate in this election? *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* World Citizens */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'public'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="public"
//               checked={data.permission_type === 'public'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaGlobe className="text-green-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">World Citizens</span>
//                 {data.permission_type === 'public' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 Anyone from anywhere in the world can participate in this election. No geographic restrictions will be applied.
//               </p>
//             </div>
//           </label>

//           {/* Specific Countries */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'specific_countries'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="specific_countries"
//               checked={data.permission_type === 'specific_countries'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaMapMarkedAlt className="text-blue-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">Specific Countries</span>
//                 {data.permission_type === 'specific_countries' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Only residents of selected countries can participate. You can choose one or multiple countries.
//               </p>

//               {data.permission_type === 'specific_countries' && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
//                   <div className="flex justify-between items-center mb-4">
//                     <h4 className="font-semibold text-gray-800">
//                       Select Countries ({data.allowed_countries?.length || 0} selected)
//                     </h4>
//                     {data.allowed_countries?.length > 0 && (
//                       <button
//                         onClick={() => updateData({ allowed_countries: [] })}
//                         className="text-sm text-red-600 hover:text-red-700 font-semibold"
//                       >
//                         Clear All
//                       </button>
//                     )}
//                   </div>

//                   {/* Country Selection by Continent */}
//                   <div className="space-y-4 max-h-96 overflow-y-auto">
//                     {Object.entries(COUNTRIES_BY_CONTINENT).map(([continent, countries]) => {
//                       const allSelected = countries.every(c => data.allowed_countries?.includes(c));
                      
//                       return (
//                         <div key={continent} className="border-2 border-gray-200 rounded-lg p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <h5 className="font-bold text-gray-800">{continent}</h5>
//                             <button
//                               onClick={() => selectAllFromContinent(continent)}
//                               className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
//                                 allSelected
//                                   ? 'bg-red-100 text-red-600 hover:bg-red-200'
//                                   : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
//                               }`}
//                             >
//                               {allSelected ? 'Deselect All' : 'Select All'}
//                             </button>
//                           </div>
//                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                             {countries.map((country) => (
//                               <label
//                                 key={country}
//                                 className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
//                                   data.allowed_countries?.includes(country)
//                                     ? 'bg-blue-100 text-blue-800'
//                                     : 'hover:bg-gray-100'
//                                 }`}
//                               >
//                                 <input
//                                   type="checkbox"
//                                   checked={data.allowed_countries?.includes(country) || false}
//                                   onChange={() => toggleCountry(country)}
//                                   className="w-4 h-4 text-blue-600 rounded"
//                                 />
//                                 <span className="ml-2 text-sm">{country}</span>
//                               </label>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.permission_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.permission_type}
//           </p>
//         )}
//         {errors.allowed_countries && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.allowed_countries}
//           </p>
//         )}
//       </div>

//       {/* Biometric Authentication - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaFingerprint className="text-purple-600" />
//             Biometric Authentication
//           </h3>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={data.biometric_required || false}
//               onChange={(e) => updateData({ biometric_required: e.target.checked })}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
//           </label>
//         </div>

//         <p className="text-gray-600 mb-4">
//           {data.biometric_required
//             ? '✅ Biometric authentication is REQUIRED. Voters must verify their identity using fingerprint (Android) or Face ID (iPhone).'
//             : '❌ Biometric authentication is NOT required. Voters can participate without biometric verification.'}
//         </p>

//         {data.biometric_required && (
//           <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
//             <p className="text-sm text-purple-800">
//               <strong>Note:</strong> Desktop users will not be able to vote in this election as biometric authentication is enabled.
//               Only mobile users with fingerprint or Face ID capabilities can participate.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Pricing Configuration - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaDollarSign className="text-green-600" />
//             Participation Fee *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* Free */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'free'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="free"
//               checked={data.pricing_type === 'free'}
//               onChange={(e) => updateData({ pricing_type: e.target.value, general_participation_fee: 0 })}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🆓</span>
//                 <span className="font-bold text-lg text-gray-900">Free</span>
//                 {data.pricing_type === 'free' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 No participation fee. Election is completely free for all voters.
//               </p>
//             </div>
//           </label>

//           {/* Paid General */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_general'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_general"
//               checked={data.pricing_type === 'paid_general'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">💳</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (General Fee)</span>
//                 {data.pricing_type === 'paid_general' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Single participation fee for all participants worldwide
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_general' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-3">
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Participation Fee (USD) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="any"
//                     value={data.general_participation_fee === '' ? '' : data.general_participation_fee || ''}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       if (value === '') {
//                         updateData({ general_participation_fee: '' });
//                       } else {
//                         const numValue = parseFloat(value);
//                         if (!isNaN(numValue) && numValue >= 0) {
//                           updateData({ general_participation_fee: numValue });
//                         }
//                       }
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                         e.preventDefault();
//                       }
//                     }}
//                     placeholder="e.g., 1.00"
//                     className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                       errors.general_participation_fee ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                   />
//                   {errors.general_participation_fee && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.general_participation_fee}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-2">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>

//           {/* Paid Regional */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_regional'
//               ? 'border-indigo-500 bg-indigo-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_regional"
//               checked={data.pricing_type === 'paid_regional'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-indigo-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🌍</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (Regional Fee)</span>
//                 {data.pricing_type === 'paid_regional' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Different fees for 8 regional zones based on purchasing power
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_regional' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-indigo-200">
//                   <h4 className="font-semibold text-gray-800 mb-4">Set Fees by Region (USD)</h4>
//                   <div className="space-y-4">
//                     {REGIONAL_ZONES.map((zone) => (
//                       <div key={zone.id} className="flex items-center gap-4">
//                         <div className="flex-1">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {zone.name}
//                           </label>
//                           <p className="text-xs text-gray-500 mb-2">{zone.countries}</p>
//                         </div>
//                         <div className="w-32">
//                           <input
//                             type="number"
//                             min="0"
//                             step="any"
//                             value={regionalFees[zone.id] === '' ? '' : (regionalFees[zone.id] || zone.default_fee)}
//                             onChange={(e) => handleRegionalFeeChange(zone.id, e.target.value)}
//                             onKeyDown={(e) => {
//                               if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                                 e.preventDefault();
//                               }
//                             }}
//                             placeholder={zone.default_fee.toFixed(2)}
//                             className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   {errors.regional_fees && (
//                     <p className="text-red-500 text-sm mt-3">
//                       {errors.regional_fees}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-3">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted from each transaction
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.pricing_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.pricing_type}
//           </p>
//         )}
//       </div>

//       {/* Lottery Feature - WITH CREATOR-FUNDED SECTIONS - UNCHANGED EXCEPT WINNER DISTRIBUTION */}
//       <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//         !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//       }`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGift className="text-yellow-600" />
//             Gamification Feature
//           </h3>
//           <label className={`relative inline-flex items-center ${
//             eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//           }`}>
//             <input
//               type="checkbox"
//               checked={data.lottery_enabled || false}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ lottery_enabled: e.target.checked })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//           </label>
//         </div>

//         {!eligibility?.canCreatePaidElections && (
//           <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//             <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//               <FaInfoCircle />
//               ⚠️ Upgrade your plan to enable Gamification Feature
//             </p>
//           </div>
//         )}

//         <p className="text-gray-700 mb-4 font-medium">
//           {data.lottery_enabled
//             ? '🎉 Gamify this election with prizes for voters'
//             : 'Add excitement by making this election a gamify with prizes'}
//         </p>

//         {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//           <div className="space-y-6">
//             {/* Prize Funding Source Selection */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <h4 className="font-bold text-gray-900 mb-4">Prize Funding Source *</h4>
//               <div className="space-y-3">
//                 {/* Creator/Sponsor Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'creator_funded'
//                     ? 'border-green-500 bg-green-50'
//                     : 'border-gray-300 hover:border-green-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="creator_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'creator_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</span>
//                     <p className="text-sm text-gray-600">You or your sponsor will provide the prizes</p>
//                   </div>
//                 </label>

//                 {/* Participation Fee Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'participation_fee_funded'
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-300 hover:border-blue-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="participation_fee_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'participation_fee_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Participation Fee Funded</span>
//                     <p className="text-sm text-gray-600">Prize pool comes from voter participation fees</p>
//                   </div>
//                 </label>
//               </div>
//               {errors.prize_funding_source && (
//                 <p className="text-red-500 text-sm mt-2">{errors.prize_funding_source}</p>
//               )}
//             </div>

//             {/* Creator-Funded Prize Configuration - ALL REWARD TYPE SECTIONS UNCHANGED */}
//             {data.lottery_config?.prize_funding_source === 'creator_funded' && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//                 <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//                 <div className="space-y-4">
//                   {/* Defined Monetary Prize - UNCHANGED */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'monetary'
//                       ? 'border-green-500 bg-green-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="monetary"
//                         checked={data.lottery_config?.reward_type === 'monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-green-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">💵</span>
//                           <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Fixed cash amount</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💰 Total Prize Pool Amount (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.total_prize_pool || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 100000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                               errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_pool && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Defined Non-monetary Prize - UNCHANGED */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'non_monetary'
//                       ? 'border-purple-500 bg-purple-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="non_monetary"
//                         checked={data.lottery_config?.reward_type === 'non_monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-purple-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">🎁</span>
//                           <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Coupons, vouchers, experiences</p>
//                         <p className="text-xs text-gray-500 italic">e.g., One week Dubai holiday with 5-star hotel stay</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'non_monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             🏷️ Non-monetary Prize Description *
//                           </label>
//                           <textarea
//                             value={data.lottery_config?.prize_description || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 prize_description: e.target.value
//                               }
//                             })}
//                             placeholder="e.g., One week Dubai holiday with 5-star hotel stay, luxury spa package, tech gadgets bundle"
//                             rows={3}
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none ${
//                               errors.lottery_prize_description ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_description && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_description}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💵 Estimated Value (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.estimated_value || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="Estimated monetary value"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                               errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_estimated_value && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Projected Revenue - UNCHANGED */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'projected_revenue'
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="projected_revenue"
//                         checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-blue-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">📈</span>
//                           <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Share of projected content revenue</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 300,000 content generated revenue</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'projected_revenue' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             📊 Projected Content Generated Revenue (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.projected_revenue || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 300000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_projected_revenue && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             <FaPercent className="inline mr-2" />
//                             Revenue Share Percentage for Winners (%) *
//                           </label>
//                           <input
//                             type="number"
//                             min="0.1"
//                             max="100"
//                             step="0.1"
//                             value={data.lottery_config?.revenue_share_percentage || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 revenue_share_percentage: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 10.5"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_revenue_share ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           <p className="text-xs text-gray-500 mt-1">
//                             Winners will receive this percentage of the actual generated revenue
//                           </p>
//                           {errors.lottery_revenue_share && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_revenue_share}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {errors.lottery_reward_type && (
//                   <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//                 )}
//               </div>
//             )}

//             {/* ✅ MODIFIED: Number of Winners with Percentage Distribution */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <div className="flex items-center justify-between mb-3">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   <FaTrophy className="inline mr-2 text-yellow-600" />
//                   Number of Winners (1-100) *
//                 </label>
//               </div>
              
//               <input
//                 type="number"
//                 min="1"
//                 max="100"
//                 step="1"
//                 value={data.lottery_config?.winner_count === '' ? '' : data.lottery_config?.winner_count || ''}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (value === '') {
//                     updateData({
//                       lottery_config: {
//                         ...data.lottery_config,
//                         winner_count: ''
//                       }
//                     });
//                   } else {
//                     const numValue = parseInt(value);
//                     if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
//                       updateData({
//                         lottery_config: {
//                           ...data.lottery_config,
//                           winner_count: numValue
//                         }
//                       });
//                     }
//                   }
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
//                     e.preventDefault();
//                   }
//                 }}
//                 className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                   errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter number between 1 and 100"
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 Specify how many winners will be selected for prizes
//               </p>
//               {errors.lottery_winner_count && (
//                 <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//               )}

//               {/* ✅ NEW: Prize Percentage Distribution */}
//               {data.lottery_config?.winner_count > 0 && (
//                 <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
//                   <div className="flex items-center justify-between mb-3">
//                     <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                       <FaPercent className="text-orange-600" />
//                       Prize Distribution (%)
//                     </h5>
//                     <div className="text-right">
//                       <p className="text-sm font-semibold text-gray-700">
//                         Total: {calculateTotalPercentage().toFixed(2)}%
//                       </p>
//                       <p className={`text-xs font-bold ${
//                         getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
//                       }`}>
//                         Remaining: {getRemainingPercentage().toFixed(2)}%
//                       </p>
//                     </div>
//                   </div>

//                   {/* Show error if total > 100% */}
//                   {calculateTotalPercentage() > 100 && (
//                     <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                       <FaExclamationTriangle className="text-red-600" />
//                       <p className="text-sm text-red-700 font-semibold">
//                         Total exceeds 100%! Please adjust percentages.
//                       </p>
//                     </div>
//                   )}

//                   {/* Distribution Inputs */}
//                   <div className="space-y-3 max-h-96 overflow-y-auto">
//                     {prizeDistribution.map((item, index) => (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-yellow-200">
//                           <div className="flex items-center gap-2 w-24">
//                             <FaTrophy className={`${
//                               index === 0 ? 'text-yellow-500' :
//                               index === 1 ? 'text-gray-400' :
//                               index === 2 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             <span className="font-bold text-gray-700">#{item.rank}</span>
//                           </div>
                          
//                           <div className="flex-1">
//                             <input
//                               type="number"
//                               min="0"
//                               max="100"
//                               step="any"
//                               value={item.percentage === '' ? '' : item.percentage}
//                               onChange={(e) => handlePercentageChange(item.rank, e.target.value)}
//                               onKeyDown={(e) => {
//                                 // Prevent minus key
//                                 if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                                   e.preventDefault();
//                                 }
//                               }}
//                               placeholder="0.0"
//                               className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
//                                 percentageErrors[item.rank] ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                               }`}
//                             />
//                           </div>

//                           <span className="text-lg font-bold text-gray-700">%</span>
//                         </div>
                        
//                         {/* ✅ Inline error message below input */}
//                         {percentageErrors[item.rank] && (
//                           <div className="ml-28 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {percentageErrors[item.rank]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {errors.prize_distribution && (
//                     <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                       <FaInfoCircle /> {errors.prize_distribution}
//                     </p>
//                   )}

//                   {/* Helper Info */}
//                   <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                     <p className="text-xs text-blue-800">
//                       <strong>Rules:</strong><br />
//                       • Rank 1 must have highest percentage<br />
//                       • Each rank must be ≤ previous rank (descending order)<br />
//                       • Total cannot exceed 100%
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Prize Pool Summary - UPDATED WITH DISTRIBUTION */}
//             {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//                 <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <FaTrophy className="text-yellow-600" />
//                   Prize Distribution Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span>Total Prize Pool:</span>
//                     <span className="font-bold text-green-600">
//                       ${data.lottery_config.total_prize_pool.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Number of Winners:</span>
//                     <span className="font-bold">{data.lottery_config.winner_count}</span>
//                   </div>
                  
//                   {/* Show distribution breakdown */}
//                   {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
//                     <div className="mt-3 pt-3 border-t-2 border-green-300">
//                       <p className="font-semibold mb-2">Distribution:</p>
//                       {prizeDistribution.map((item) => {
//                         const amount = (data.lottery_config.total_prize_pool * (item.percentage / 100));
//                         return (
//                           <div key={item.rank} className="flex justify-between text-xs py-1">
//                             <span>
//                               <FaTrophy className={`inline mr-1 ${
//                                 item.rank === 1 ? 'text-yellow-500' :
//                                 item.rank === 2 ? 'text-gray-400' :
//                                 item.rank === 3 ? 'text-orange-600' :
//                                 'text-gray-300'
//                               }`} />
//                               Rank {item.rank} ({item.percentage}%):
//                             </span>
//                             <span className="font-bold text-green-600">
//                               ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Results & Features - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//           <FaEye className="text-indigo-600" />
//           Results & Features
//         </h3>

//         <div className="space-y-4">
//           {/* Show Live Results */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.show_live_results ? <FaEye className="text-green-600" /> : <FaEyeSlash className="text-gray-400" />}
//                 Show Live Results During Election
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Display vote counts in real-time while election is active
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.show_live_results || false}
//                 onChange={(e) => updateData({ show_live_results: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>

//           {/* Vote Editing */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.vote_editing_allowed ? <FaEdit className="text-green-600" /> : <FaLock className="text-gray-400" />}
//                 Allow Voters to Change Their Votes
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Voters can modify their choices before election ends
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.vote_editing_allowed || false}
//                 onChange={(e) => updateData({ vote_editing_allowed: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>
//         </div>
//       </div>

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
// // ✅ ONLY MODIFIED: Number of Winners section - Added percentage distribution with validation
// // - Descending order validation (1st > 2nd > 3rd, etc.)
// // - Total cannot exceed 100%
// // - Shows remaining percentage
// // - Auto-suggests distribution if total exceeds 100%

// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import {
//   FaGlobe,
//   FaDollarSign,
//   FaFingerprint,
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaEye,
//   FaEyeSlash,
//   FaEdit,
//   FaLock,
//   FaTrophy,
//   FaMapMarkedAlt,
//   FaTags,
//   FaPercent,
//   FaExclamationTriangle
// } from 'react-icons/fa';

// // Regional zones for pricing
// const REGIONAL_ZONES = [
//   { id: 'north_america', name: 'North America', countries: 'USA, Canada', default_fee: 5.00 },
//   { id: 'western_europe', name: 'Western Europe', countries: 'UK, Germany, France, etc.', default_fee: 4.50 },
//   { id: 'australia_nz', name: 'Australia & New Zealand', countries: 'Australia, New Zealand', default_fee: 4.00 },
//   { id: 'middle_east', name: 'Middle East', countries: 'UAE, Saudi Arabia, Qatar, etc.', default_fee: 3.50 },
//   { id: 'eastern_europe', name: 'Eastern Europe', countries: 'Poland, Russia, Ukraine, etc.', default_fee: 2.50 },
//   { id: 'latin_america', name: 'Latin America', countries: 'Brazil, Argentina, Mexico, etc.', default_fee: 2.00 },
//   { id: 'asia', name: 'Asia', countries: 'China, India, Thailand, etc.', default_fee: 1.50 },
//   { id: 'africa', name: 'Africa', countries: 'Nigeria, Kenya, South Africa, etc.', default_fee: 1.00 }
// ];

// // All countries organized by continent
// const COUNTRIES_BY_CONTINENT = {
//   'Africa': [
//     'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
//     'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of Congo',
//     'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana',
//     'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
//     'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
//     'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
//     'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
//     'Zambia', 'Zimbabwe'
//   ],
//   'Asia': [
//     'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia',
//     'China', 'Georgia', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan',
//     'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Macau', 'Malaysia',
//     'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine',
//     'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria',
//     'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates',
//     'Uzbekistan', 'Vietnam', 'Yemen'
//   ],
//   'Europe': [
//     'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
//     'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
//     'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein',
//     'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
//     'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia',
//     'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'
//   ],
//   'North America': [
//     'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
//     'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras',
//     'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia',
//     'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'
//   ],
//   'South America': [
//     'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
//     'Peru', 'Suriname', 'Uruguay', 'Venezuela'
//   ],
//   'Australia & Oceania': [
//     'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand',
//     'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
//   ]
// };

// // Election categories
// const ELECTION_CATEGORIES = [
//   { id: 1, category_name: 'Politics', description: 'Political elections and polls', icon: '🏛️' },
//   { id: 2, category_name: 'Sports', description: 'Sports-related voting', icon: '⚽' },
//   { id: 3, category_name: 'Entertainment', description: 'Movies, music, and entertainment', icon: '🎬' },
//   { id: 4, category_name: 'Education', description: 'Academic and educational voting', icon: '📚' },
//   { id: 5, category_name: 'Business', description: 'Corporate and business decisions', icon: '💼' },
//   { id: 6, category_name: 'Community', description: 'Community decisions and polls', icon: '🏘️' },
//   { id: 7, category_name: 'Technology', description: 'Tech-related polls and surveys', icon: '💻' },
//   { id: 8, category_name: 'Health', description: 'Health and wellness voting', icon: '🏥' }
// ];

// export default function Step2Configuration({ data, updateData, onNext, onBack, eligibility }) {
//   const [errors, setErrors] = useState({});
//   const [regionalFees, setRegionalFees] = useState(data.regional_fees || {});
  
//   // ✅ NEW: Prize distribution state
//   const [prizeDistribution, setPrizeDistribution] = useState(
//     data.lottery_config?.prize_distribution || []
//   );

//   // Initialize regional fees with defaults if needed
//   useEffect(() => {
//     if (data.pricing_type === 'paid_regional' && Object.keys(regionalFees).length === 0) {
//       const defaultFees = {};
//       REGIONAL_ZONES.forEach(zone => {
//         defaultFees[zone.id] = zone.default_fee;
//       });
//       setRegionalFees(defaultFees);
//       updateData({ regional_fees: defaultFees });
//     }
//   }, [data.pricing_type]);

//   // ✅ NEW: Initialize prize distribution when winner count changes
//   useEffect(() => {
//     const winnerCount = data.lottery_config?.winner_count || 1;
    
//     // Only initialize if distribution doesn't match winner count
//     if (prizeDistribution.length !== winnerCount) {
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
//   }, [data.lottery_config?.winner_count]);

//   // ✅ NEW: Calculate total percentage and remaining
//   const calculateTotalPercentage = () => {
//     return prizeDistribution.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0);
//   };

//   const getRemainingPercentage = () => {
//     return Math.max(0, 100 - calculateTotalPercentage());
//   };

//   // ✅ NEW: Validate percentage distribution
//   const validatePrizeDistribution = () => {
//     const total = calculateTotalPercentage();
    
//     // Check total doesn't exceed 100%
//     if (total > 100) {
//       return {
//         valid: false,
//         message: `Total percentage is ${total.toFixed(2)}% which exceeds 100%. Please adjust.`
//       };
//     }

//     // Check descending order
//     for (let i = 0; i < prizeDistribution.length - 1; i++) {
//       const current = parseFloat(prizeDistribution[i].percentage) || 0;
//       const next = parseFloat(prizeDistribution[i + 1].percentage) || 0;
      
//       if (current < next) {
//         return {
//           valid: false,
//           message: `Rank ${i + 1} (${current}%) cannot be less than Rank ${i + 2} (${next}%). Must be in descending order.`
//         };
//       }
//     }

//     // Check all percentages are set (optional - can be 0)
//     const allSet = prizeDistribution.every(item => item.percentage !== undefined && item.percentage !== '');
//     if (!allSet) {
//       return {
//         valid: false,
//         message: 'Please set percentage for all winners'
//       };
//     }

//     return { valid: true };
//   };

//   // ✅ NEW: Handle percentage change with validation
//   const handlePercentageChange = (rank, value) => {
//     const numValue = parseFloat(value) || 0;
//     const index = rank - 1;

//     // Create new distribution
//     const newDistribution = [...prizeDistribution];
//     newDistribution[index] = { ...newDistribution[index], percentage: numValue };

//     // Check if total would exceed 100%
//     const newTotal = newDistribution.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0);
    
//     if (newTotal > 100) {
//       toast.error(`Total cannot exceed 100%. You have ${(100 - calculateTotalPercentage() + (prizeDistribution[index].percentage || 0)).toFixed(2)}% remaining.`);
//       return;
//     }

//     // Check descending order
//     if (index > 0) {
//       const previous = parseFloat(newDistribution[index - 1].percentage) || 0;
//       if (numValue > previous) {
//         toast.error(`Rank ${rank} percentage (${numValue}%) cannot be greater than Rank ${rank - 1} (${previous}%)`);
//         return;
//       }
//     }

//     if (index < newDistribution.length - 1) {
//       const next = parseFloat(newDistribution[index + 1].percentage) || 0;
//       if (numValue < next) {
//         toast.error(`Rank ${rank} percentage (${numValue}%) cannot be less than Rank ${rank + 1} (${next}%)`);
//         return;
//       }
//     }

//     setPrizeDistribution(newDistribution);
//     updateData({
//       lottery_config: {
//         ...data.lottery_config,
//         prize_distribution: newDistribution
//       }
//     });
//   };

//   // ✅ NEW: Auto-suggest distribution
//   const autoSuggestDistribution = () => {
//     const winnerCount = prizeDistribution.length;
//     const suggested = [];
    
//     // Calculate descending distribution
//     let remaining = 100;
//     for (let i = 0; i < winnerCount; i++) {
//       // Simple descending: distribute remaining evenly among remaining winners
//       const portion = remaining / (winnerCount - i);
//       const percentage = Math.floor(portion * 10) / 10; // Round to 1 decimal
      
//       suggested.push({
//         rank: i + 1,
//         percentage: percentage
//       });
      
//       remaining -= percentage;
//     }

//     // Adjust last winner to use all remaining
//     if (suggested.length > 0) {
//       const totalSoFar = suggested.slice(0, -1).reduce((sum, item) => sum + item.percentage, 0);
//       suggested[suggested.length - 1].percentage = Math.round((100 - totalSoFar) * 10) / 10;
//     }

//     setPrizeDistribution(suggested);
//     updateData({
//       lottery_config: {
//         ...data.lottery_config,
//         prize_distribution: suggested
//       }
//     });
    
//     toast.success('Suggested distribution applied!');
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
//       const invalidRegions = REGIONAL_ZONES.filter(zone => 
//         !regionalFees[zone.id] || regionalFees[zone.id] <= 0
//       );
//       if (invalidRegions.length > 0) {
//         newErrors.regional_fees = `Please enter valid fees for all regions`;
//       }
//     }

//     // Lottery validation
//     if (data.lottery_enabled) {
//       if (!data.lottery_config?.prize_funding_source) {
//         newErrors.prize_funding_source = 'Please select prize funding source';
//       }

//       if (data.lottery_config?.prize_funding_source === 'creator_funded') {
//         if (!data.lottery_config?.reward_type) {
//           newErrors.lottery_reward_type = 'Please select a reward type';
//         }

//         if (data.lottery_config?.reward_type === 'monetary') {
//           if (!data.lottery_config?.total_prize_pool || data.lottery_config.total_prize_pool <= 0) {
//             newErrors.lottery_prize_pool = 'Please enter a valid prize pool amount';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'non_monetary') {
//           if (!data.lottery_config?.prize_description?.trim()) {
//             newErrors.lottery_prize_description = 'Please describe the non-monetary prize';
//           }
//           if (!data.lottery_config?.estimated_value || data.lottery_config.estimated_value <= 0) {
//             newErrors.lottery_estimated_value = 'Please enter estimated value';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'projected_revenue') {
//           if (!data.lottery_config?.projected_revenue || data.lottery_config.projected_revenue <= 0) {
//             newErrors.lottery_projected_revenue = 'Please enter projected revenue';
//           }
//           if (!data.lottery_config?.revenue_share_percentage || data.lottery_config.revenue_share_percentage <= 0 || data.lottery_config.revenue_share_percentage > 100) {
//             newErrors.lottery_revenue_share = 'Revenue share must be between 0 and 100%';
//           }
//         }
//       }

//       if (!data.lottery_config?.winner_count || data.lottery_config.winner_count < 1 || data.lottery_config.winner_count > 100) {
//         newErrors.lottery_winner_count = 'Winner count must be between 1 and 100';
//       }

//       // ✅ NEW: Validate prize distribution
//       const distributionValidation = validatePrizeDistribution();
//       if (!distributionValidation.valid) {
//         newErrors.prize_distribution = distributionValidation.message;
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handlePermissionTypeChange = (type) => {
//     updateData({ 
//       permission_type: type,
//       allowed_countries: type === 'specific_countries' ? data.allowed_countries || [] : []
//     });
//   };

//   const toggleCountry = (country) => {
//     const currentCountries = data.allowed_countries || [];
//     const newCountries = currentCountries.includes(country)
//       ? currentCountries.filter(c => c !== country)
//       : [...currentCountries, country];
//     updateData({ allowed_countries: newCountries });
//   };

//   const selectAllFromContinent = (continent) => {
//     const countries = COUNTRIES_BY_CONTINENT[continent];
//     const currentCountries = data.allowed_countries || [];
//     const allSelected = countries.every(c => currentCountries.includes(c));
    
//     if (allSelected) {
//       updateData({ 
//         allowed_countries: currentCountries.filter(c => !countries.includes(c)) 
//       });
//     } else {
//       const uniqueCountries = [...new Set([...currentCountries, ...countries])];
//       updateData({ allowed_countries: uniqueCountries });
//     }
//   };

//   const handleRegionalFeeChange = (zoneId, value) => {
//     const newFees = { ...regionalFees, [zoneId]: parseFloat(value) || 0 };
//     setRegionalFees(newFees);
//     updateData({ regional_fees: newFees });
//   };

//   const handleContinue = () => {
//     if (!validateStep()) {
//       toast.error('Please fix all errors before continuing');
//       return;
//     }
//     onNext();
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

//       {/* Election Category Selection - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaTags className="text-purple-600" />
//             Election Category *
//           </h3>
//           <FaInfoCircle className="text-gray-400 text-xl cursor-help" title="Select the category that best describes your election" />
//         </div>

//         <div className="grid md:grid-cols-4 gap-4">
//           {ELECTION_CATEGORIES.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => updateData({ category_id: category.id })}
//               className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-center ${
//                 data.category_id === category.id
//                   ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
//                   : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
//               }`}
//             >
//               <div className="text-4xl mb-2">{category.icon}</div>
//               <h4 className={`font-bold text-sm mb-1 ${
//                 data.category_id === category.id ? 'text-purple-600' : 'text-gray-800'
//               }`}>
//                 {category.category_name}
//                 {data.category_id === category.id && (
//                   <FaCheckCircle className="inline ml-1 text-green-500 text-xs" />
//                 )}
//               </h4>
//               <p className="text-xs text-gray-500">{category.description}</p>
//             </button>
//           ))}
//         </div>

//         {errors.category_id && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.category_id}
//           </p>
//         )}
//       </div>

//       {/* Access Control - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGlobe className="text-green-600" />
//             Who can participate in this election? *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* World Citizens */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'public'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="public"
//               checked={data.permission_type === 'public'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaGlobe className="text-green-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">World Citizens</span>
//                 {data.permission_type === 'public' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 Anyone from anywhere in the world can participate in this election. No geographic restrictions will be applied.
//               </p>
//             </div>
//           </label>

//           {/* Specific Countries */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'specific_countries'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="specific_countries"
//               checked={data.permission_type === 'specific_countries'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaMapMarkedAlt className="text-blue-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">Specific Countries</span>
//                 {data.permission_type === 'specific_countries' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Only residents of selected countries can participate. You can choose one or multiple countries.
//               </p>

//               {data.permission_type === 'specific_countries' && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
//                   <div className="flex justify-between items-center mb-4">
//                     <h4 className="font-semibold text-gray-800">
//                       Select Countries ({data.allowed_countries?.length || 0} selected)
//                     </h4>
//                     {data.allowed_countries?.length > 0 && (
//                       <button
//                         onClick={() => updateData({ allowed_countries: [] })}
//                         className="text-sm text-red-600 hover:text-red-700 font-semibold"
//                       >
//                         Clear All
//                       </button>
//                     )}
//                   </div>

//                   {/* Country Selection by Continent */}
//                   <div className="space-y-4 max-h-96 overflow-y-auto">
//                     {Object.entries(COUNTRIES_BY_CONTINENT).map(([continent, countries]) => {
//                       const allSelected = countries.every(c => data.allowed_countries?.includes(c));
                      
//                       return (
//                         <div key={continent} className="border-2 border-gray-200 rounded-lg p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <h5 className="font-bold text-gray-800">{continent}</h5>
//                             <button
//                               onClick={() => selectAllFromContinent(continent)}
//                               className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
//                                 allSelected
//                                   ? 'bg-red-100 text-red-600 hover:bg-red-200'
//                                   : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
//                               }`}
//                             >
//                               {allSelected ? 'Deselect All' : 'Select All'}
//                             </button>
//                           </div>
//                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                             {countries.map((country) => (
//                               <label
//                                 key={country}
//                                 className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
//                                   data.allowed_countries?.includes(country)
//                                     ? 'bg-blue-100 text-blue-800'
//                                     : 'hover:bg-gray-100'
//                                 }`}
//                               >
//                                 <input
//                                   type="checkbox"
//                                   checked={data.allowed_countries?.includes(country) || false}
//                                   onChange={() => toggleCountry(country)}
//                                   className="w-4 h-4 text-blue-600 rounded"
//                                 />
//                                 <span className="ml-2 text-sm">{country}</span>
//                               </label>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.permission_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.permission_type}
//           </p>
//         )}
//         {errors.allowed_countries && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.allowed_countries}
//           </p>
//         )}
//       </div>

//       {/* Biometric Authentication - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaFingerprint className="text-purple-600" />
//             Biometric Authentication
//           </h3>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={data.biometric_required || false}
//               onChange={(e) => updateData({ biometric_required: e.target.checked })}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
//           </label>
//         </div>

//         <p className="text-gray-600 mb-4">
//           {data.biometric_required
//             ? '✅ Biometric authentication is REQUIRED. Voters must verify their identity using fingerprint (Android) or Face ID (iPhone).'
//             : '❌ Biometric authentication is NOT required. Voters can participate without biometric verification.'}
//         </p>

//         {data.biometric_required && (
//           <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
//             <p className="text-sm text-purple-800">
//               <strong>Note:</strong> Desktop users will not be able to vote in this election as biometric authentication is enabled.
//               Only mobile users with fingerprint or Face ID capabilities can participate.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Pricing Configuration - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaDollarSign className="text-green-600" />
//             Participation Fee *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* Free */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'free'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="free"
//               checked={data.pricing_type === 'free'}
//               onChange={(e) => updateData({ pricing_type: e.target.value, general_participation_fee: 0 })}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🆓</span>
//                 <span className="font-bold text-lg text-gray-900">Free</span>
//                 {data.pricing_type === 'free' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 No participation fee. Election is completely free for all voters.
//               </p>
//             </div>
//           </label>

//           {/* Paid General */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_general'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_general"
//               checked={data.pricing_type === 'paid_general'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">💳</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (General Fee)</span>
//                 {data.pricing_type === 'paid_general' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Single participation fee for all participants worldwide
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_general' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-3">
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Participation Fee (USD) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0.01"
//                     step="0.01"
//                     value={data.general_participation_fee || ''}
//                     onChange={(e) => updateData({ general_participation_fee: parseFloat(e.target.value) })}
//                     placeholder="e.g., 1.00"
//                     className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                       errors.general_participation_fee ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                   />
//                   {errors.general_participation_fee && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.general_participation_fee}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-2">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>

//           {/* Paid Regional */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_regional'
//               ? 'border-indigo-500 bg-indigo-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_regional"
//               checked={data.pricing_type === 'paid_regional'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-indigo-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🌍</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (Regional Fee)</span>
//                 {data.pricing_type === 'paid_regional' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Different fees for 8 regional zones based on purchasing power
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_regional' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-indigo-200">
//                   <h4 className="font-semibold text-gray-800 mb-4">Set Fees by Region (USD)</h4>
//                   <div className="space-y-4">
//                     {REGIONAL_ZONES.map((zone) => (
//                       <div key={zone.id} className="flex items-center gap-4">
//                         <div className="flex-1">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {zone.name}
//                           </label>
//                           <p className="text-xs text-gray-500 mb-2">{zone.countries}</p>
//                         </div>
//                         <div className="w-32">
//                           <input
//                             type="number"
//                             min="0.01"
//                             step="0.01"
//                             value={regionalFees[zone.id] || zone.default_fee}
//                             onChange={(e) => handleRegionalFeeChange(zone.id, e.target.value)}
//                             placeholder={zone.default_fee.toFixed(2)}
//                             className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   {errors.regional_fees && (
//                     <p className="text-red-500 text-sm mt-3">
//                       {errors.regional_fees}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-3">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted from each transaction
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.pricing_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.pricing_type}
//           </p>
//         )}
//       </div>

//       {/* Lottery Feature - WITH CREATOR-FUNDED SECTIONS - UNCHANGED EXCEPT WINNER DISTRIBUTION */}
//       <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//         !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//       }`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGift className="text-yellow-600" />
//             Gamification Feature
//           </h3>
//           <label className={`relative inline-flex items-center ${
//             eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//           }`}>
//             <input
//               type="checkbox"
//               checked={data.lottery_enabled || false}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ lottery_enabled: e.target.checked })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//           </label>
//         </div>

//         {!eligibility?.canCreatePaidElections && (
//           <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//             <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//               <FaInfoCircle />
//               ⚠️ Upgrade your plan to enable Gamification Feature
//             </p>
//           </div>
//         )}

//         <p className="text-gray-700 mb-4 font-medium">
//           {data.lottery_enabled
//             ? '🎉 Gamify this election with prizes for voters'
//             : 'Add excitement by making this election a gamify with prizes'}
//         </p>

//         {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//           <div className="space-y-6">
//             {/* Prize Funding Source Selection */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <h4 className="font-bold text-gray-900 mb-4">Prize Funding Source *</h4>
//               <div className="space-y-3">
//                 {/* Creator/Sponsor Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'creator_funded'
//                     ? 'border-green-500 bg-green-50'
//                     : 'border-gray-300 hover:border-green-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="creator_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'creator_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</span>
//                     <p className="text-sm text-gray-600">You or your sponsor will provide the prizes</p>
//                   </div>
//                 </label>

//                 {/* Participation Fee Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'participation_fee_funded'
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-300 hover:border-blue-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="participation_fee_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'participation_fee_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Participation Fee Funded</span>
//                     <p className="text-sm text-gray-600">Prize pool comes from voter participation fees</p>
//                   </div>
//                 </label>
//               </div>
//               {errors.prize_funding_source && (
//                 <p className="text-red-500 text-sm mt-2">{errors.prize_funding_source}</p>
//               )}
//             </div>

//             {/* Creator-Funded Prize Configuration - ALL REWARD TYPE SECTIONS UNCHANGED */}
//             {data.lottery_config?.prize_funding_source === 'creator_funded' && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//                 <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//                 <div className="space-y-4">
//                   {/* Defined Monetary Prize - UNCHANGED */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'monetary'
//                       ? 'border-green-500 bg-green-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="monetary"
//                         checked={data.lottery_config?.reward_type === 'monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-green-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">💵</span>
//                           <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Fixed cash amount</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💰 Total Prize Pool Amount (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.total_prize_pool || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 100000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                               errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_pool && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Defined Non-monetary Prize - UNCHANGED */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'non_monetary'
//                       ? 'border-purple-500 bg-purple-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="non_monetary"
//                         checked={data.lottery_config?.reward_type === 'non_monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-purple-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">🎁</span>
//                           <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Coupons, vouchers, experiences</p>
//                         <p className="text-xs text-gray-500 italic">e.g., One week Dubai holiday with 5-star hotel stay</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'non_monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             🏷️ Non-monetary Prize Description *
//                           </label>
//                           <textarea
//                             value={data.lottery_config?.prize_description || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 prize_description: e.target.value
//                               }
//                             })}
//                             placeholder="e.g., One week Dubai holiday with 5-star hotel stay, luxury spa package, tech gadgets bundle"
//                             rows={3}
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none ${
//                               errors.lottery_prize_description ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_description && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_description}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💵 Estimated Value (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.estimated_value || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="Estimated monetary value"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                               errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_estimated_value && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Projected Revenue - UNCHANGED */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'projected_revenue'
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="projected_revenue"
//                         checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-blue-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">📈</span>
//                           <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Share of projected content revenue</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 300,000 content generated revenue</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'projected_revenue' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             📊 Projected Content Generated Revenue (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.projected_revenue || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 300000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_projected_revenue && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             <FaPercent className="inline mr-2" />
//                             Revenue Share Percentage for Winners (%) *
//                           </label>
//                           <input
//                             type="number"
//                             min="0.1"
//                             max="100"
//                             step="0.1"
//                             value={data.lottery_config?.revenue_share_percentage || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 revenue_share_percentage: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 10.5"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_revenue_share ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           <p className="text-xs text-gray-500 mt-1">
//                             Winners will receive this percentage of the actual generated revenue
//                           </p>
//                           {errors.lottery_revenue_share && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_revenue_share}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {errors.lottery_reward_type && (
//                   <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//                 )}
//               </div>
//             )}

//             {/* ✅ MODIFIED: Number of Winners with Percentage Distribution */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <div className="flex items-center justify-between mb-3">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   <FaTrophy className="inline mr-2 text-yellow-600" />
//                   Number of Winners (1-100) *
//                 </label>
//                 {prizeDistribution.length > 1 && (
//                   <button
//                     onClick={autoSuggestDistribution}
//                     className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
//                   >
//                     Auto-Suggest Distribution
//                   </button>
//                 )}
//               </div>
              
//               <input
//                 type="number"
//                 min="1"
//                 max="100"
//                 value={data.lottery_config?.winner_count || 1}
//                 onChange={(e) => updateData({
//                   lottery_config: {
//                     ...data.lottery_config,
//                     winner_count: parseInt(e.target.value) || 1
//                   }
//                 })}
//                 className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                   errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter number between 1 and 100"
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 Specify how many winners will be selected for prizes
//               </p>
//               {errors.lottery_winner_count && (
//                 <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//               )}

//               {/* ✅ NEW: Prize Percentage Distribution */}
//               {data.lottery_config?.winner_count > 0 && (
//                 <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
//                   <div className="flex items-center justify-between mb-3">
//                     <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                       <FaPercent className="text-orange-600" />
//                       Prize Distribution (%)
//                     </h5>
//                     <div className="text-right">
//                       <p className="text-sm font-semibold text-gray-700">
//                         Total: {calculateTotalPercentage().toFixed(2)}%
//                       </p>
//                       <p className={`text-xs font-bold ${
//                         getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
//                       }`}>
//                         Remaining: {getRemainingPercentage().toFixed(2)}%
//                       </p>
//                     </div>
//                   </div>

//                   {/* Show error if total > 100% */}
//                   {calculateTotalPercentage() > 100 && (
//                     <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                       <FaExclamationTriangle className="text-red-600" />
//                       <p className="text-sm text-red-700 font-semibold">
//                         Total exceeds 100%! Please adjust percentages.
//                       </p>
//                     </div>
//                   )}

//                   {/* Distribution Inputs */}
//                   <div className="space-y-2 max-h-96 overflow-y-auto">
//                     {prizeDistribution.map((item, index) => (
//                       <div key={item.rank} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-yellow-200">
//                         <div className="flex items-center gap-2 w-24">
//                           <FaTrophy className={`${
//                             index === 0 ? 'text-yellow-500' :
//                             index === 1 ? 'text-gray-400' :
//                             index === 2 ? 'text-orange-600' :
//                             'text-gray-300'
//                           }`} />
//                           <span className="font-bold text-gray-700">#{item.rank}</span>
//                         </div>
                        
//                         <div className="flex-1">
//                           <input
//                             type="number"
//                             min="0"
//                             max="100"
//                             step="0.1"
//                             value={item.percentage || ''}
//                             onChange={(e) => handlePercentageChange(item.rank, e.target.value)}
//                             placeholder="0.0"
//                             className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                           />
//                         </div>

//                         <span className="text-lg font-bold text-gray-700">%</span>
//                       </div>
//                     ))}
//                   </div>

//                   {errors.prize_distribution && (
//                     <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                       <FaInfoCircle /> {errors.prize_distribution}
//                     </p>
//                   )}

//                   {/* Helper Info */}
//                   <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                     <p className="text-xs text-blue-800">
//                       <strong>Rules:</strong><br />
//                       • Rank 1 must have highest percentage<br />
//                       • Each rank must be ≤ previous rank (descending order)<br />
//                       • Total cannot exceed 100%
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Prize Pool Summary - UPDATED WITH DISTRIBUTION */}
//             {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//                 <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <FaTrophy className="text-yellow-600" />
//                   Prize Distribution Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span>Total Prize Pool:</span>
//                     <span className="font-bold text-green-600">
//                       ${data.lottery_config.total_prize_pool.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Number of Winners:</span>
//                     <span className="font-bold">{data.lottery_config.winner_count}</span>
//                   </div>
                  
//                   {/* Show distribution breakdown */}
//                   {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
//                     <div className="mt-3 pt-3 border-t-2 border-green-300">
//                       <p className="font-semibold mb-2">Distribution:</p>
//                       {prizeDistribution.map((item) => {
//                         const amount = (data.lottery_config.total_prize_pool * (item.percentage / 100));
//                         return (
//                           <div key={item.rank} className="flex justify-between text-xs py-1">
//                             <span>
//                               <FaTrophy className={`inline mr-1 ${
//                                 item.rank === 1 ? 'text-yellow-500' :
//                                 item.rank === 2 ? 'text-gray-400' :
//                                 item.rank === 3 ? 'text-orange-600' :
//                                 'text-gray-300'
//                               }`} />
//                               Rank {item.rank} ({item.percentage}%):
//                             </span>
//                             <span className="font-bold text-green-600">
//                               ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Results & Features - UNCHANGED */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//           <FaEye className="text-indigo-600" />
//           Results & Features
//         </h3>

//         <div className="space-y-4">
//           {/* Show Live Results */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.show_live_results ? <FaEye className="text-green-600" /> : <FaEyeSlash className="text-gray-400" />}
//                 Show Live Results During Election
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Display vote counts in real-time while election is active
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.show_live_results || false}
//                 onChange={(e) => updateData({ show_live_results: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>

//           {/* Vote Editing */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.vote_editing_allowed ? <FaEdit className="text-green-600" /> : <FaLock className="text-gray-400" />}
//                 Allow Voters to Change Their Votes
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Voters can modify their choices before election ends
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.vote_editing_allowed || false}
//                 onChange={(e) => updateData({ vote_editing_allowed: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>
//         </div>
//       </div>

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
//last workable code
// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import {
//   FaGlobe,
//   FaDollarSign,
//   FaFingerprint,
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaEye,
//   FaEyeSlash,
//   FaEdit,
//   FaLock,
//   FaTrophy,
//   FaMapMarkedAlt,
//   FaTags,
//   FaPercent
// } from 'react-icons/fa';

// // Regional zones for pricing
// const REGIONAL_ZONES = [
//   { id: 'north_america', name: 'North America', countries: 'USA, Canada', default_fee: 5.00 },
//   { id: 'western_europe', name: 'Western Europe', countries: 'UK, Germany, France, etc.', default_fee: 4.50 },
//   { id: 'australia_nz', name: 'Australia & New Zealand', countries: 'Australia, New Zealand', default_fee: 4.00 },
//   { id: 'middle_east', name: 'Middle East', countries: 'UAE, Saudi Arabia, Qatar, etc.', default_fee: 3.50 },
//   { id: 'eastern_europe', name: 'Eastern Europe', countries: 'Poland, Russia, Ukraine, etc.', default_fee: 2.50 },
//   { id: 'latin_america', name: 'Latin America', countries: 'Brazil, Argentina, Mexico, etc.', default_fee: 2.00 },
//   { id: 'asia', name: 'Asia', countries: 'China, India, Thailand, etc.', default_fee: 1.50 },
//   { id: 'africa', name: 'Africa', countries: 'Nigeria, Kenya, South Africa, etc.', default_fee: 1.00 }
// ];

// // All countries organized by continent
// const COUNTRIES_BY_CONTINENT = {
//   'Africa': [
//     'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
//     'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of Congo',
//     'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana',
//     'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
//     'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
//     'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
//     'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
//     'Zambia', 'Zimbabwe'
//   ],
//   'Asia': [
//     'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia',
//     'China', 'Georgia', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan',
//     'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Macau', 'Malaysia',
//     'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine',
//     'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria',
//     'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates',
//     'Uzbekistan', 'Vietnam', 'Yemen'
//   ],
//   'Europe': [
//     'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
//     'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
//     'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein',
//     'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
//     'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia',
//     'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'
//   ],
//   'North America': [
//     'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
//     'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras',
//     'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia',
//     'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'
//   ],
//   'South America': [
//     'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
//     'Peru', 'Suriname', 'Uruguay', 'Venezuela'
//   ],
//   'Australia & Oceania': [
//     'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand',
//     'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
//   ]
// };

// // Election categories (will be fetched from API in real implementation)
// const ELECTION_CATEGORIES = [
//   { id: 1, category_name: 'Politics', description: 'Political elections and polls', icon: '🏛️' },
//   { id: 2, category_name: 'Sports', description: 'Sports-related voting', icon: '⚽' },
//   { id: 3, category_name: 'Entertainment', description: 'Movies, music, and entertainment', icon: '🎬' },
//   { id: 4, category_name: 'Education', description: 'Academic and educational voting', icon: '📚' },
//   { id: 5, category_name: 'Business', description: 'Corporate and business decisions', icon: '💼' },
//   { id: 6, category_name: 'Community', description: 'Community decisions and polls', icon: '🏘️' },
//   { id: 7, category_name: 'Technology', description: 'Tech-related polls and surveys', icon: '💻' },
//   { id: 8, category_name: 'Health', description: 'Health and wellness voting', icon: '🏥' }
// ];

// export default function Step2Configuration({ data, updateData, onNext, onBack, eligibility }) {
//   const [errors, setErrors] = useState({});
//   const [regionalFees, setRegionalFees] = useState(data.regional_fees || {});

//   // Initialize regional fees with defaults if needed
//   useEffect(() => {
//     if (data.pricing_type === 'paid_regional' && Object.keys(regionalFees).length === 0) {
//       const defaultFees = {};
//       REGIONAL_ZONES.forEach(zone => {
//         defaultFees[zone.id] = zone.default_fee;
//       });
//       setRegionalFees(defaultFees);
//       updateData({ regional_fees: defaultFees });
//     }
//   }, [data.pricing_type]);

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
//       const invalidRegions = REGIONAL_ZONES.filter(zone => 
//         !regionalFees[zone.id] || regionalFees[zone.id] <= 0
//       );
//       if (invalidRegions.length > 0) {
//         newErrors.regional_fees = `Please enter valid fees for all regions`;
//       }
//     }

//     // Lottery validation
//     if (data.lottery_enabled) {
//       if (!data.lottery_config?.prize_funding_source) {
//         newErrors.prize_funding_source = 'Please select prize funding source';
//       }

//       if (data.lottery_config?.prize_funding_source === 'creator_funded') {
//         if (!data.lottery_config?.reward_type) {
//           newErrors.lottery_reward_type = 'Please select a reward type';
//         }

//         if (data.lottery_config?.reward_type === 'monetary') {
//           if (!data.lottery_config?.total_prize_pool || data.lottery_config.total_prize_pool <= 0) {
//             newErrors.lottery_prize_pool = 'Please enter a valid prize pool amount';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'non_monetary') {
//           if (!data.lottery_config?.prize_description?.trim()) {
//             newErrors.lottery_prize_description = 'Please describe the non-monetary prize';
//           }
//           if (!data.lottery_config?.estimated_value || data.lottery_config.estimated_value <= 0) {
//             newErrors.lottery_estimated_value = 'Please enter estimated value';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'projected_revenue') {
//           if (!data.lottery_config?.projected_revenue || data.lottery_config.projected_revenue <= 0) {
//             newErrors.lottery_projected_revenue = 'Please enter projected revenue';
//           }
//           if (!data.lottery_config?.revenue_share_percentage || data.lottery_config.revenue_share_percentage <= 0 || data.lottery_config.revenue_share_percentage > 100) {
//             newErrors.lottery_revenue_share = 'Revenue share must be between 0 and 100%';
//           }
//         }
//       }

//       if (!data.lottery_config?.winner_count || data.lottery_config.winner_count < 1 || data.lottery_config.winner_count > 100) {
//         newErrors.lottery_winner_count = 'Winner count must be between 1 and 100';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handlePermissionTypeChange = (type) => {
//     updateData({ 
//       permission_type: type,
//       allowed_countries: type === 'specific_countries' ? data.allowed_countries || [] : []
//     });
//   };

//   const toggleCountry = (country) => {
//     const currentCountries = data.allowed_countries || [];
//     const newCountries = currentCountries.includes(country)
//       ? currentCountries.filter(c => c !== country)
//       : [...currentCountries, country];
//     updateData({ allowed_countries: newCountries });
//   };

//   const selectAllFromContinent = (continent) => {
//     const countries = COUNTRIES_BY_CONTINENT[continent];
//     const currentCountries = data.allowed_countries || [];
//     const allSelected = countries.every(c => currentCountries.includes(c));
    
//     if (allSelected) {
//       updateData({ 
//         allowed_countries: currentCountries.filter(c => !countries.includes(c)) 
//       });
//     } else {
//       const uniqueCountries = [...new Set([...currentCountries, ...countries])];
//       updateData({ allowed_countries: uniqueCountries });
//     }
//   };

//   const handleRegionalFeeChange = (zoneId, value) => {
//     const newFees = { ...regionalFees, [zoneId]: parseFloat(value) || 0 };
//     setRegionalFees(newFees);
//     updateData({ regional_fees: newFees });
//   };

//   const handleContinue = () => {
//     if (!validateStep()) {
//       toast.error('Please fix all errors before continuing');
//       return;
//     }
//     onNext();
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

//       {/* Election Category Selection */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaTags className="text-purple-600" />
//             Election Category *
//           </h3>
//           <FaInfoCircle className="text-gray-400 text-xl cursor-help" title="Select the category that best describes your election" />
//         </div>

//         <div className="grid md:grid-cols-4 gap-4">
//           {ELECTION_CATEGORIES.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => updateData({ category_id: category.id })}
//               className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-center ${
//                 data.category_id === category.id
//                   ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
//                   : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
//               }`}
//             >
//               <div className="text-4xl mb-2">{category.icon}</div>
//               <h4 className={`font-bold text-sm mb-1 ${
//                 data.category_id === category.id ? 'text-purple-600' : 'text-gray-800'
//               }`}>
//                 {category.category_name}
//                 {data.category_id === category.id && (
//                   <FaCheckCircle className="inline ml-1 text-green-500 text-xs" />
//                 )}
//               </h4>
//               <p className="text-xs text-gray-500">{category.description}</p>
//             </button>
//           ))}
//         </div>

//         {errors.category_id && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.category_id}
//           </p>
//         )}
//       </div>

//       {/* Access Control */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGlobe className="text-green-600" />
//             Who can participate in this election? *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* World Citizens */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'public'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="public"
//               checked={data.permission_type === 'public'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaGlobe className="text-green-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">World Citizens</span>
//                 {data.permission_type === 'public' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 Anyone from anywhere in the world can participate in this election. No geographic restrictions will be applied.
//               </p>
//             </div>
//           </label>

//           {/* Specific Countries */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'specific_countries'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="specific_countries"
//               checked={data.permission_type === 'specific_countries'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaMapMarkedAlt className="text-blue-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">Specific Countries</span>
//                 {data.permission_type === 'specific_countries' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Only residents of selected countries can participate. You can choose one or multiple countries.
//               </p>

//               {data.permission_type === 'specific_countries' && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
//                   <div className="flex justify-between items-center mb-4">
//                     <h4 className="font-semibold text-gray-800">
//                       Select Countries ({data.allowed_countries?.length || 0} selected)
//                     </h4>
//                     {data.allowed_countries?.length > 0 && (
//                       <button
//                         onClick={() => updateData({ allowed_countries: [] })}
//                         className="text-sm text-red-600 hover:text-red-700 font-semibold"
//                       >
//                         Clear All
//                       </button>
//                     )}
//                   </div>

//                   {/* Country Selection by Continent */}
//                   <div className="space-y-4 max-h-96 overflow-y-auto">
//                     {Object.entries(COUNTRIES_BY_CONTINENT).map(([continent, countries]) => {
//                       const allSelected = countries.every(c => data.allowed_countries?.includes(c));
                      
//                       return (
//                         <div key={continent} className="border-2 border-gray-200 rounded-lg p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <h5 className="font-bold text-gray-800">{continent}</h5>
//                             <button
//                               onClick={() => selectAllFromContinent(continent)}
//                               className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
//                                 allSelected
//                                   ? 'bg-red-100 text-red-600 hover:bg-red-200'
//                                   : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
//                               }`}
//                             >
//                               {allSelected ? 'Deselect All' : 'Select All'}
//                             </button>
//                           </div>
//                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                             {countries.map((country) => (
//                               <label
//                                 key={country}
//                                 className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
//                                   data.allowed_countries?.includes(country)
//                                     ? 'bg-blue-100 text-blue-800'
//                                     : 'hover:bg-gray-100'
//                                 }`}
//                               >
//                                 <input
//                                   type="checkbox"
//                                   checked={data.allowed_countries?.includes(country) || false}
//                                   onChange={() => toggleCountry(country)}
//                                   className="w-4 h-4 text-blue-600 rounded"
//                                 />
//                                 <span className="ml-2 text-sm">{country}</span>
//                               </label>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.permission_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.permission_type}
//           </p>
//         )}
//         {errors.allowed_countries && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.allowed_countries}
//           </p>
//         )}
//       </div>

//       {/* Biometric Authentication */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaFingerprint className="text-purple-600" />
//             Biometric Authentication
//           </h3>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={data.biometric_required || false}
//               onChange={(e) => updateData({ biometric_required: e.target.checked })}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
//           </label>
//         </div>

//         <p className="text-gray-600 mb-4">
//           {data.biometric_required
//             ? '✅ Biometric authentication is REQUIRED. Voters must verify their identity using fingerprint (Android) or Face ID (iPhone).'
//             : '❌ Biometric authentication is NOT required. Voters can participate without biometric verification.'}
//         </p>

//         {data.biometric_required && (
//           <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
//             <p className="text-sm text-purple-800">
//               <strong>Note:</strong> Desktop users will not be able to vote in this election as biometric authentication is enabled.
//               Only mobile users with fingerprint or Face ID capabilities can participate.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Pricing Configuration */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaDollarSign className="text-green-600" />
//             Participation Fee *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* Free */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'free'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="free"
//               checked={data.pricing_type === 'free'}
//               onChange={(e) => updateData({ pricing_type: e.target.value, general_participation_fee: 0 })}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🆓</span>
//                 <span className="font-bold text-lg text-gray-900">Free</span>
//                 {data.pricing_type === 'free' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 No participation fee. Election is completely free for all voters.
//               </p>
//             </div>
//           </label>

//           {/* Paid General */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_general'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_general"
//               checked={data.pricing_type === 'paid_general'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">💳</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (General Fee)</span>
//                 {data.pricing_type === 'paid_general' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Single participation fee for all participants worldwide
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_general' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-3">
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Participation Fee (USD) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0.01"
//                     step="0.01"
//                     value={data.general_participation_fee || ''}
//                     onChange={(e) => updateData({ general_participation_fee: parseFloat(e.target.value) })}
//                     placeholder="e.g., 1.00"
//                     className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                       errors.general_participation_fee ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                   />
//                   {errors.general_participation_fee && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.general_participation_fee}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-2">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>

//           {/* Paid Regional */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_regional'
//               ? 'border-indigo-500 bg-indigo-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_regional"
//               checked={data.pricing_type === 'paid_regional'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-indigo-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🌍</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (Regional Fee)</span>
//                 {data.pricing_type === 'paid_regional' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Different fees for 8 regional zones based on purchasing power
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_regional' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-indigo-200">
//                   <h4 className="font-semibold text-gray-800 mb-4">Set Fees by Region (USD)</h4>
//                   <div className="space-y-4">
//                     {REGIONAL_ZONES.map((zone) => (
//                       <div key={zone.id} className="flex items-center gap-4">
//                         <div className="flex-1">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {zone.name}
//                           </label>
//                           <p className="text-xs text-gray-500 mb-2">{zone.countries}</p>
//                         </div>
//                         <div className="w-32">
//                           <input
//                             type="number"
//                             min="0.01"
//                             step="0.01"
//                             value={regionalFees[zone.id] || zone.default_fee}
//                             onChange={(e) => handleRegionalFeeChange(zone.id, e.target.value)}
//                             placeholder={zone.default_fee.toFixed(2)}
//                             className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   {errors.regional_fees && (
//                     <p className="text-red-500 text-sm mt-3">
//                       {errors.regional_fees}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-3">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted from each transaction
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.pricing_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.pricing_type}
//           </p>
//         )}
//       </div>

//       {/* Lottery Feature - IMPROVED DESIGN WITH DISABLED STATE FOR FREE USERS */}
//       <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//         !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//       }`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGift className="text-yellow-600" />
//             Gamification Feature
//           </h3>
//           <label className={`relative inline-flex items-center ${
//             eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//           }`}>
//             <input
//               type="checkbox"
//               checked={data.lottery_enabled || false}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ lottery_enabled: e.target.checked })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//           </label>
//         </div>

//         {!eligibility?.canCreatePaidElections && (
//           <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//             <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//               <FaInfoCircle />
//               ⚠️ Upgrade your plan to enable Gamification Feature
//             </p>
//           </div>
//         )}

//         <p className="text-gray-700 mb-4 font-medium">
//           {data.lottery_enabled
//             ? '🎉 Gamify this election with prizes for voters'
//             : 'Add excitement by making this election a gamify with prizes'}
//         </p>

//         {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//           <div className="space-y-6">
//             {/* Prize Funding Source Selection */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <h4 className="font-bold text-gray-900 mb-4">Prize Funding Source *</h4>
//               <div className="space-y-3">
//                 {/* Creator/Sponsor Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'creator_funded'
//                     ? 'border-green-500 bg-green-50'
//                     : 'border-gray-300 hover:border-green-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="creator_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'creator_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</span>
//                     <p className="text-sm text-gray-600">You or your sponsor will provide the prizes</p>
//                   </div>
//                 </label>

//                 {/* Participation Fee Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'participation_fee_funded'
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-300 hover:border-blue-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="participation_fee_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'participation_fee_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Participation Fee Funded</span>
//                     <p className="text-sm text-gray-600">Prize pool comes from voter participation fees</p>
//                   </div>
//                 </label>
//               </div>
//               {errors.prize_funding_source && (
//                 <p className="text-red-500 text-sm mt-2">{errors.prize_funding_source}</p>
//               )}
//             </div>

//             {/* Creator-Funded Prize Configuration */}
//             {data.lottery_config?.prize_funding_source === 'creator_funded' && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//                 <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//                 <div className="space-y-4">
//                   {/* Defined Monetary Prize */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'monetary'
//                       ? 'border-green-500 bg-green-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="monetary"
//                         checked={data.lottery_config?.reward_type === 'monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-green-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">💵</span>
//                           <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Fixed cash amount</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💰 Total Prize Pool Amount (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.total_prize_pool || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 100000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                               errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_pool && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Defined Non-monetary Prize */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'non_monetary'
//                       ? 'border-purple-500 bg-purple-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="non_monetary"
//                         checked={data.lottery_config?.reward_type === 'non_monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-purple-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">🎁</span>
//                           <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Coupons, vouchers, experiences</p>
//                         <p className="text-xs text-gray-500 italic">e.g., One week Dubai holiday with 5-star hotel stay</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'non_monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             🏷️ Non-monetary Prize Description *
//                           </label>
//                           <textarea
//                             value={data.lottery_config?.prize_description || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 prize_description: e.target.value
//                               }
//                             })}
//                             placeholder="e.g., One week Dubai holiday with 5-star hotel stay, luxury spa package, tech gadgets bundle"
//                             rows={3}
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none ${
//                               errors.lottery_prize_description ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_description && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_description}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💵 Estimated Value (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.estimated_value || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="Estimated monetary value"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                               errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_estimated_value && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Projected Revenue */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'projected_revenue'
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="projected_revenue"
//                         checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-blue-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">📈</span>
//                           <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Share of projected content revenue</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 300,000 content generated revenue</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'projected_revenue' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             📊 Projected Content Generated Revenue (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.projected_revenue || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 300000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_projected_revenue && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             <FaPercent className="inline mr-2" />
//                             Revenue Share Percentage for Winners (%) *
//                           </label>
//                           <input
//                             type="number"
//                             min="0.1"
//                             max="100"
//                             step="0.1"
//                             value={data.lottery_config?.revenue_share_percentage || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 revenue_share_percentage: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 10.5"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_revenue_share ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           <p className="text-xs text-gray-500 mt-1">
//                             Winners will receive this percentage of the actual generated revenue
//                           </p>
//                           {errors.lottery_revenue_share && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_revenue_share}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {errors.lottery_reward_type && (
//                   <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//                 )}
//               </div>
//             )}

//             {/* Number of Winners */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <label className="block text-sm font-semibold text-gray-700 mb-3">
//                 <FaTrophy className="inline mr-2 text-yellow-600" />
//                 Number of Winners (1-100) *
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 max="100"
//                 value={data.lottery_config?.winner_count || 1}
//                 onChange={(e) => updateData({
//                   lottery_config: {
//                     ...data.lottery_config,
//                     winner_count: parseInt(e.target.value) || 1
//                   }
//                 })}
//                 className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                   errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter number between 1 and 100"
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 Specify how many winners will be selected for prizes (any number from 1 to 100)
//               </p>
//               {errors.lottery_winner_count && (
//                 <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//               )}
//             </div>

//             {/* Prize Pool Summary for Monetary */}
//             {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//                 <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <FaTrophy className="text-yellow-600" />
//                   Prize Distribution Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span>Total Prize Pool:</span>
//                     <span className="font-bold text-green-600">
//                       ${data.lottery_config.total_prize_pool.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Number of Winners:</span>
//                     <span className="font-bold">{data.lottery_config.winner_count}</span>
//                   </div>
//                   <div className="flex justify-between pt-2 border-t-2 border-green-300">
//                     <span className="font-bold">Prize per Winner:</span>
//                     <span className="font-bold text-lg text-green-600">
//                       ${(data.lottery_config.total_prize_pool / data.lottery_config.winner_count).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Results & Features */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//           <FaEye className="text-indigo-600" />
//           Results & Features
//         </h3>

//         <div className="space-y-4">
//           {/* Show Live Results */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.show_live_results ? <FaEye className="text-green-600" /> : <FaEyeSlash className="text-gray-400" />}
//                 Show Live Results During Election
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Display vote counts in real-time while election is active
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.show_live_results || false}
//                 onChange={(e) => updateData({ show_live_results: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>

//           {/* Vote Editing */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.vote_editing_allowed ? <FaEdit className="text-green-600" /> : <FaLock className="text-gray-400" />}
//                 Allow Voters to Change Their Votes
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Voters can modify their choices before election ends
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.vote_editing_allowed || false}
//                 onChange={(e) => updateData({ vote_editing_allowed: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>
//         </div>
//       </div>

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
