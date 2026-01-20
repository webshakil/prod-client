
//last workable code only to add gamification or not above code
// src/components/election/Step2Configuration/Step2Configuration-Part3-LotteryFull.jsx
// Contains: Complete LotteryConfiguration with all 3 prize types
// ✅ FIXED: Percentage calculation now shows correct remaining percentage
// ✅ FIXED: Input fields use parseInt to prevent value changes (e.g., 7000 -> 6988)
// ✅ FIXED: All inputs are erasable and accept keyboard/mouse input properly
import React from 'react';
import {
  FaGift,
  FaCheckCircle,
  FaInfoCircle,
  FaTrophy,
  FaPercent,
  FaExclamationTriangle
} from 'react-icons/fa';

// ============================================
// LOTTERY CONFIGURATION COMPONENT - COMPLETE
// ============================================
export function LotteryConfiguration({
  data,
  updateData,
  errors,
  eligibility,
  prizeDistribution,
  setPrizeDistribution,
  nonMonetaryPrizes,
  setNonMonetaryPrizes,
  percentageErrors,
  setPercentageErrors,
  nonMonetaryErrors,
  setNonMonetaryErrors
}) {

  // ============================================
  // PERCENTAGE DISTRIBUTION FUNCTIONS (Monetary & Revenue)
  // ✅ FIXED: Percentage tracking now accurate
  // ============================================

  const calculateTotalPercentage = () => {
    return prizeDistribution.reduce((sum, item) => {
      const val = parseFloat(item.percentage);
      return sum + (isNaN(val) || item.percentage === '' ? 0 : val);
    }, 0);
  };

  const getRemainingPercentage = () => {
    const total = calculateTotalPercentage();
    return Math.max(0, 100 - total);
  };

  const getTotalPrizePool = () => {
    const rewardType = data.lottery_config?.reward_type;
    if (rewardType === 'monetary') {
      return parseFloat(data.lottery_config?.total_prize_pool) || 0;
    }
    if (rewardType === 'projected_revenue') {
      return parseFloat(data.lottery_config?.projected_revenue) || 0;
    }
    return 0;
  };

  // ✅ FIXED: Handle percentage changes - ALWAYS allow input, show errors but don't block
  const handlePercentageChange = (rank, value) => {
    const index = rank - 1;
    const newErrors = { ...percentageErrors };
    
    // Allow empty string for clearing
    if (value === '' || value === null || value === undefined) {
      const newDistribution = [...prizeDistribution];
      newDistribution[index] = { ...newDistribution[index], percentage: '' };
      setPrizeDistribution(newDistribution);
      delete newErrors[rank];
      setPercentageErrors(newErrors);
      updateData({
        lottery_config: {
          ...data.lottery_config,
          prize_distribution: newDistribution
        }
      });
      return;
    }

    const numValue = parseFloat(value);
    
    // Reject negative values
    if (numValue < 0) return;
    
    // ✅ ALWAYS UPDATE THE VALUE FIRST - Let user edit freely
    const newDistribution = [...prizeDistribution];
    newDistribution[index] = { ...newDistribution[index], percentage: numValue };
    setPrizeDistribution(newDistribution);
    
    // Then check validations and show errors (but don't block input)
    
    // Check if exceeds 100
    if (numValue > 100) {
      newErrors[rank] = `Cannot exceed 100%`;
      setPercentageErrors(newErrors);
      updateData({
        lottery_config: {
          ...data.lottery_config,
          prize_distribution: newDistribution
        }
      });
      return;
    }

    // Calculate what the new total would be
    const newTotal = newDistribution.reduce((sum, item) => {
      const val = parseFloat(item.percentage);
      return sum + (isNaN(val) || item.percentage === '' ? 0 : val);
    }, 0);
    
    // Check if new total exceeds 100%
    if (newTotal > 100) {
      const currentTotal = prizeDistribution.reduce((sum, item) => {
        const val = parseFloat(item.percentage);
        return sum + (isNaN(val) || item.percentage === '' ? 0 : val);
      }, 0);
      const currentRankValue = parseFloat(prizeDistribution[index].percentage) || 0;
      const remaining = 100 - (currentTotal - currentRankValue);
      newErrors[rank] = `Total would exceed 100%. You have ${remaining.toFixed(2)}% remaining`;
      setPercentageErrors(newErrors);
      updateData({
        lottery_config: {
          ...data.lottery_config,
          prize_distribution: newDistribution
        }
      });
      return;
    }

    // Check descending order (rank must be >= next rank)
    if (index > 0) {
      const previousVal = parseFloat(newDistribution[index - 1].percentage);
      if (!isNaN(previousVal) && previousVal !== '' && numValue > previousVal) {
        newErrors[rank] = `Must be ≤ Rank ${rank - 1} (${previousVal}%)`;
        setPercentageErrors(newErrors);
        updateData({
          lottery_config: {
            ...data.lottery_config,
            prize_distribution: newDistribution
          }
        });
        return;
      }
    }

    if (index < newDistribution.length - 1) {
      const nextVal = parseFloat(newDistribution[index + 1].percentage);
      if (!isNaN(nextVal) && nextVal !== '' && numValue < nextVal) {
        newErrors[rank] = `Must be ≥ Rank ${rank + 1} (${nextVal}%)`;
        setPercentageErrors(newErrors);
        updateData({
          lottery_config: {
            ...data.lottery_config,
            prize_distribution: newDistribution
          }
        });
        return;
      }
    }

    // All validations passed
    delete newErrors[rank];
    setPercentageErrors(newErrors);
    updateData({
      lottery_config: {
        ...data.lottery_config,
        prize_distribution: newDistribution
      }
    });
  };

  // ============================================
  // NON-MONETARY PRIZE FUNCTIONS
  // ✅ FIXED: Using parseInt to prevent value corruption
  // ============================================

  const calculateTotalNonMonetaryValue = () => {
    return nonMonetaryPrizes.reduce((sum, item) => {
      const val = parseInt(item.prize_value);
      return sum + (isNaN(val) || item.prize_value === '' ? 0 : val);
    }, 0);
  };

  const getRemainingNonMonetaryValue = () => {
    const totalValue = parseInt(data.lottery_config?.estimated_value) || 0;
    const distributed = calculateTotalNonMonetaryValue();
    return Math.max(0, totalValue - distributed);
  };

  const handleNonMonetaryPrizeChange = (rank, field, value) => {
    const index = rank - 1;
    const newErrors = { ...nonMonetaryErrors };
    const newPrizes = [...nonMonetaryPrizes];
    
    if (field === 'prize_description') {
      newPrizes[index] = { ...newPrizes[index], prize_description: value };
      delete newErrors[`${rank}_description`];
      setNonMonetaryPrizes(newPrizes);
      setNonMonetaryErrors(newErrors);
      updateData({
        lottery_config: {
          ...data.lottery_config,
          non_monetary_prizes: newPrizes
        }
      });
      return;
    } 
    
    if (field === 'prize_value') {
      // Allow empty string for clearing
      if (value === '' || value === null || value === undefined) {
        newPrizes[index] = { ...newPrizes[index], prize_value: '' };
        delete newErrors[`${rank}_value`];
        setNonMonetaryPrizes(newPrizes);
        setNonMonetaryErrors(newErrors);
        updateData({
          lottery_config: {
            ...data.lottery_config,
            non_monetary_prizes: newPrizes
          }
        });
        return;
      }

      // ✅ FIX: Use parseInt to prevent decimal corruption (7000 -> 6988 bug)
      const numValue = parseInt(value);
      
      // Reject if not a valid number
      if (isNaN(numValue)) return;
      
      // Reject negative values
      if (numValue < 0) return;

      // ✅ ALWAYS UPDATE THE VALUE FIRST - Let user edit freely
      newPrizes[index] = { ...newPrizes[index], prize_value: numValue };
      setNonMonetaryPrizes(newPrizes);

      // Then check validations and show errors (but don't block input)
      const totalValue = parseInt(data.lottery_config?.estimated_value) || 0;

      // Calculate new total
      const newTotal = newPrizes.reduce((sum, item) => {
        const val = parseInt(item.prize_value);
        return sum + (isNaN(val) || item.prize_value === '' ? 0 : val);
      }, 0);
      
      // Check if exceeds total value
      if (newTotal > totalValue) {
        const currentTotal = nonMonetaryPrizes.reduce((sum, item) => {
          const val = parseInt(item.prize_value);
          return sum + (isNaN(val) || item.prize_value === '' ? 0 : val);
        }, 0);
        const currentRankValue = parseInt(nonMonetaryPrizes[index].prize_value) || 0;
        const remaining = totalValue - (currentTotal - currentRankValue);
        newErrors[`${rank}_value`] = `Total would exceed $${totalValue.toLocaleString()}. Remaining: $${remaining.toLocaleString()}`;
        setNonMonetaryErrors(newErrors);
        updateData({
          lottery_config: {
            ...data.lottery_config,
            non_monetary_prizes: newPrizes
          }
        });
        return;
      } else {
        // ✅ Clear error if validation passes
        delete newErrors[`${rank}_value`];
      }

      // Check descending order
      if (index > 0) {
        const previousVal = parseInt(nonMonetaryPrizes[index - 1].prize_value) || 0;
        if (previousVal !== '' && !isNaN(previousVal) && numValue > previousVal) {
          newErrors[`${rank}_value`] = `Must be ≤ Rank ${rank - 1} ($${previousVal.toLocaleString()})`;
          setNonMonetaryErrors(newErrors);
          updateData({
            lottery_config: {
              ...data.lottery_config,
              non_monetary_prizes: newPrizes
            }
          });
          return;
        } else {
          // ✅ Clear error if validation passes
          delete newErrors[`${rank}_value`];
        }
      }

      if (index < newPrizes.length - 1) {
        const nextVal = parseInt(newPrizes[index + 1].prize_value) || 0;
        if (nextVal !== '' && !isNaN(nextVal) && nextVal > 0 && numValue < nextVal) {
          newErrors[`${rank}_value`] = `Must be ≥ Rank ${rank + 1} ($${nextVal.toLocaleString()})`;
          setNonMonetaryErrors(newErrors);
          updateData({
            lottery_config: {
              ...data.lottery_config,
              non_monetary_prizes: newPrizes
            }
          });
          return;
        } else {
          // ✅ Clear error if validation passes
          delete newErrors[`${rank}_value`];
        }
      }

      // All validations passed
      delete newErrors[`${rank}_value`];
      setNonMonetaryErrors(newErrors);
      updateData({
        lottery_config: {
          ...data.lottery_config,
          non_monetary_prizes: newPrizes
        }
      });
    }
  };

  return (
    <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
      !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FaGift className="text-yellow-600" />
          Gamification Feature
        </h3>
        <label className={`relative inline-flex items-center ${
          eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
        }`}>
          <input
            type="checkbox"
            checked={data.lottery_enabled || false}
            onChange={(e) => {
              if (eligibility?.canCreatePaidElections) {
                updateData({ lottery_enabled: e.target.checked });
              }
            }}
            disabled={!eligibility?.canCreatePaidElections}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
        </label>
      </div>

      {!eligibility?.canCreatePaidElections && (
        <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
          <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
            <FaInfoCircle />
            ⚠️ Upgrade your plan to enable Gamification Feature
          </p>
        </div>
      )}

      <p className="text-gray-700 mb-4 font-medium">
        {data.lottery_enabled
          ? '🎉 Gamify this election with prizes for voters'
          : 'Add excitement and incentivize voters by Gamifying this Election with Prizes'}
      </p>

      {data.lottery_enabled && eligibility?.canCreatePaidElections && (
        <div className="space-y-6">
          {/* Creator Funded Badge */}
          <div className="bg-white rounded-lg p-5 border-2 border-green-200">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <FaCheckCircle className="text-green-600 text-2xl" />
              <div>
                <h4 className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</h4>
                <p className="text-sm text-gray-600">You or your sponsor will provide the prizes for winners</p>
              </div>
            </div>
          </div>

          {/* Prize Type Selection */}
          <div className="bg-white rounded-lg p-5 border-2 border-green-200">
            <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
            <div className="space-y-4">
              {/* MONETARY PRIZE */}
              <div className={`p-4 rounded-lg border-2 transition-all ${
                data.lottery_config?.reward_type === 'monetary'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300'
              }`}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reward_type"
                    value="monetary"
                    checked={data.lottery_config?.reward_type === 'monetary'}
                    onChange={(e) => {
                      setPrizeDistribution([]);
                      setNonMonetaryPrizes([]);
                      updateData({
                        lottery_config: { 
                          ...data.lottery_config, 
                          reward_type: e.target.value, 
                          prize_funding_source: 'creator_funded',
                          prize_distribution: [],
                          non_monetary_prizes: []
                        }
                      });
                    }}
                    className="w-5 h-5 text-green-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">💵</span>
                      <span className="font-bold text-gray-900">Defined Monetary Prize</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Fixed cash amount with percentage distribution</p>
                    <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
                  </div>
                </label>

                {data.lottery_config?.reward_type === 'monetary' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        💰 Total Prize Pool Amount (USD) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={data.lottery_config?.total_prize_pool === 0 || data.lottery_config?.total_prize_pool === '' ? '' : data.lottery_config?.total_prize_pool || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            updateData({
                              lottery_config: {
                                ...data.lottery_config,
                                total_prize_pool: ''
                              }
                            });
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && numValue > 0) {
                              updateData({
                                lottery_config: {
                                  ...data.lottery_config,
                                  total_prize_pool: numValue
                                }
                              });
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
                            e.preventDefault();
                          }
                        }}
                        onWheel={(e) => e.target.blur()}
                        placeholder="e.g., 100000"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
                          errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.lottery_prize_pool && (
                        <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* NON-MONETARY PRIZE */}
              <div className={`p-4 rounded-lg border-2 transition-all ${
                data.lottery_config?.reward_type === 'non_monetary'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300'
              }`}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reward_type"
                    value="non_monetary"
                    checked={data.lottery_config?.reward_type === 'non_monetary'}
                    onChange={(e) => {
                      setPrizeDistribution([]);
                      setNonMonetaryPrizes([]);
                      updateData({
                        lottery_config: { 
                          ...data.lottery_config, 
                          reward_type: e.target.value, 
                          prize_funding_source: 'creator_funded',
                          prize_distribution: [],
                          non_monetary_prizes: []
                        }
                      });
                    }}
                    className="w-5 h-5 text-purple-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">🎁</span>
                      <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Individual prizes with descriptions and values</p>
                    <p className="text-xs text-gray-500 italic">e.g., 1st: Dubai tour $3000, 2nd: UK tour $2000</p>
                  </div>
                </label>

                {data.lottery_config?.reward_type === 'non_monetary' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        💵 Total Estimated Value (USD) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={data.lottery_config?.estimated_value === 0 || data.lottery_config?.estimated_value === '' ? '' : data.lottery_config?.estimated_value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            updateData({
                              lottery_config: {
                                ...data.lottery_config,
                                estimated_value: ''
                              }
                            });
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && numValue > 0) {
                              updateData({
                                lottery_config: {
                                  ...data.lottery_config,
                                  estimated_value: numValue
                                }
                              });
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
                            e.preventDefault();
                          }
                        }}
                        onWheel={(e) => e.target.blur()}
                        placeholder="Total value of all prizes"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                          errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.lottery_estimated_value && (
                        <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* PROJECTED REVENUE */}
              <div className={`p-4 rounded-lg border-2 transition-all ${
                data.lottery_config?.reward_type === 'projected_revenue'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reward_type"
                    value="projected_revenue"
                    checked={data.lottery_config?.reward_type === 'projected_revenue'}
                    onChange={(e) => {
                      setPrizeDistribution([]);
                      setNonMonetaryPrizes([]);
                      updateData({
                        lottery_config: { 
                          ...data.lottery_config, 
                          reward_type: e.target.value, 
                          prize_funding_source: 'creator_funded',
                          prize_distribution: [],
                          non_monetary_prizes: []
                        }
                      });
                    }}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">📈</span>
                      <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Total prize pool from projected content revenue with percentage distribution</p>
                    <p className="text-xs text-gray-500 italic">e.g., USD 50,000 total prize pool from content revenue</p>
                  </div>
                </label>

                {data.lottery_config?.reward_type === 'projected_revenue' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📊 Total Prize Pool from Projected Revenue (USD) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={data.lottery_config?.projected_revenue === 0 || data.lottery_config?.projected_revenue === '' ? '' : data.lottery_config?.projected_revenue || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            updateData({
                              lottery_config: {
                                ...data.lottery_config,
                                projected_revenue: ''
                              }
                            });
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && numValue > 0) {
                              updateData({
                                lottery_config: {
                                  ...data.lottery_config,
                                  projected_revenue: numValue
                                }
                              });
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
                            e.preventDefault();
                          }
                        }}
                        onWheel={(e) => e.target.blur()}
                        placeholder="e.g., 300000"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the total amount that will be distributed among winners from content revenue
                      </p>
                      {errors.lottery_projected_revenue && (
                        <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {errors.lottery_reward_type && (
              <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
            )}
          </div>

          {/* NUMBER OF WINNERS */}
          <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                <FaTrophy className="inline mr-2 text-yellow-600" />
                Number of Winners (1-100) *
              </label>
            </div>
            
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={data.lottery_config?.winner_count === '' || data.lottery_config?.winner_count === 0 ? '' : data.lottery_config?.winner_count || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  updateData({
                    lottery_config: {
                      ...data.lottery_config,
                      winner_count: ''
                    }
                  });
                } else {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
                    updateData({
                      lottery_config: {
                        ...data.lottery_config,
                        winner_count: numValue
                      }
                    });
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
                  e.preventDefault();
                }
              }}
              onWheel={(e) => e.target.blur()}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
                errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter number between 1 and 100"
            />
            <p className="text-xs text-gray-500 mt-2">
              Specify how many winners will be selected for prizes
            </p>
            {errors.lottery_winner_count && (
              <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
            )}

            {/* PERCENTAGE DISTRIBUTION DISPLAY */}
            {data.lottery_config?.winner_count > 0 && 
             (data.lottery_config?.reward_type === 'monetary' || data.lottery_config?.reward_type === 'projected_revenue') && (
              <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-gray-900 flex items-center gap-2">
                    <FaPercent className="text-orange-600" />
                    Prize Distribution (%)
                  </h5>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      Total: {calculateTotalPercentage().toFixed(2)}% = ${(getTotalPrizePool() * calculateTotalPercentage() / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className={`text-xs font-bold ${
                      getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      Remaining: {getRemainingPercentage().toFixed(2)}% = ${((getTotalPrizePool() * getRemainingPercentage()) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                {calculateTotalPercentage() > 100 && (
                  <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-600" />
                    <p className="text-sm text-red-700 font-semibold">
                      ⚠ Total exceeds 100%! You have {(calculateTotalPercentage() - 100).toFixed(2)}% over the limit.
                    </p>
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {prizeDistribution.map((item, index) => {
                    const totalPool = getTotalPrizePool();
                    const currentPercentage = parseFloat(item.percentage) || 0;
                    const currentAmount = (totalPool * currentPercentage) / 100;

                    return (
                      <div key={item.rank} className="space-y-1">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 w-24">
                            <FaTrophy className={`${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              index === 2 ? 'text-orange-600' :
                              'text-gray-300'
                            }`} />
                            <span className="font-bold text-gray-700">#{item.rank}</span>
                          </div>
                          
                          <div className="flex-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.percentage === '' ? '' : item.percentage}
                              onChange={(e) => handlePercentageChange(item.rank, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                  e.preventDefault();
                                }
                              }}
                              onWheel={(e) => e.target.blur()}
                              placeholder="0.00"
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                percentageErrors[item.rank] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                          </div>

                          <span className="text-lg font-bold text-gray-700">%</span>
                          
                          <div className="text-right min-w-[100px]">
                            <div className="text-sm font-bold text-green-600">
                              ${currentAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>

                        {percentageErrors[item.rank] && (
                          <div className="ml-28 p-2 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
                              <FaExclamationTriangle className="text-red-600" />
                              {percentageErrors[item.rank]}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {errors.prize_distribution && (
                  <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                    <FaInfoCircle /> {errors.prize_distribution}
                  </p>
                )}

                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Rules:</strong><br />
                    • Rank 1 must have highest percentage<br />
                    • Each rank must be ≤ previous rank (descending order)<br />
                    • Total cannot exceed 100%
                  </p>
                </div>
              </div>
            )}

            {/* NON-MONETARY PRIZES DISPLAY */}
            {data.lottery_config?.winner_count > 0 && data.lottery_config?.reward_type === 'non_monetary' && (
              <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-gray-900 flex items-center gap-2">
                    <FaGift className="text-purple-600" />
                    Individual Prize Details
                  </h5>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      Max: ${(parseInt(data.lottery_config?.estimated_value) || 0).toLocaleString()}
                    </p>
                    <p className={`text-xs font-bold ${
                      getRemainingNonMonetaryValue() >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Remaining: ${Math.max(0, getRemainingNonMonetaryValue()).toLocaleString()}
                    </p>
                  </div>
                </div>

                {calculateTotalNonMonetaryValue() > (parseInt(data.lottery_config?.estimated_value) || 0) && (
                  <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-600" />
                    <p className="text-sm text-red-700 font-semibold">
                      ⚠ Total prize value exceeds estimated value by ${(calculateTotalNonMonetaryValue() - (parseInt(data.lottery_config?.estimated_value) || 0)).toLocaleString()}!
                    </p>
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {nonMonetaryPrizes.map((item, index) => {
                    return (
                      <div key={item.rank} className="space-y-1">
                        <div className="p-3 bg-white rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FaTrophy className={`${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              index === 2 ? 'text-orange-600' :
                              'text-gray-300'
                            }`} />
                            <span className="font-bold text-gray-700">
                              {index === 0 ? '🥇 1st Winner' :
                               index === 1 ? '🥈 2nd Winner' :
                               index === 2 ? '🥉 3rd Winner' :
                               `🏅 ${item.rank}th Winner`}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Prize Description *
                              </label>
                              <input
                                type="text"
                                value={item.prize_description || ''}
                                onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_description', e.target.value)}
                                placeholder="e.g., Dubai tour package with 5-star hotel"
                                className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                  nonMonetaryErrors[`${item.rank}_description`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Prize Value (USD) *
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={item.prize_value === '' ? '' : item.prize_value}
                                onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_value', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
                                    e.preventDefault();
                                  }
                                }}
                                onWheel={(e) => e.target.blur()}
                                placeholder="0"
                                className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                  nonMonetaryErrors[`${item.rank}_value`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {(nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]) && (
                          <div className="ml-8 p-2 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
                              <FaExclamationTriangle className="text-red-600" />
                              {nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {errors.prize_distribution && (
                  <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                    <FaInfoCircle /> {errors.prize_distribution}
                  </p>
                )}

                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Rules:</strong><br />
                    • Each prize must have a description and value<br />
                    • Rank 1 must have highest value<br />
                    • Each rank must be ≤ previous rank (descending order)<br />
                    • Total cannot exceed estimated value
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Prize Pool Summary */}
          {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
            <div className="bg-white rounded-lg p-5 border-2 border-green-400">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaTrophy className="text-yellow-600" />
                Prize Distribution Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Prize Pool:</span>
                  <span className="font-bold text-green-600">
                    ${data.lottery_config.total_prize_pool.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Number of Winners:</span>
                  <span className="font-bold">{data.lottery_config.winner_count}</span>
                </div>
                
                {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
                  <div className="mt-3 pt-3 border-t-2 border-green-300">
                    <p className="font-semibold mb-2">Distribution:</p>
                    {prizeDistribution.map((item) => {
                      const percentage = parseFloat(item.percentage) || 0;
                      const amount = (data.lottery_config.total_prize_pool * (percentage / 100));
                      return (
                        <div key={item.rank} className="flex justify-between text-xs py-1">
                          <span>
                            <FaTrophy className={`inline mr-1 ${
                              item.rank === 1 ? 'text-yellow-500' :
                              item.rank === 2 ? 'text-gray-400' :
                              item.rank === 3 ? 'text-orange-600' :
                              'text-gray-300'
                            }`} />
                            Rank {item.rank} ({percentage}%):
                          </span>
                          <span className="font-bold text-green-600">
                            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LotteryConfiguration;













// import React from 'react';
// import {
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaTrophy,
//   FaPercent,
//   FaExclamationTriangle
// } from 'react-icons/fa';

// // ============================================
// // LOTTERY CONFIGURATION COMPONENT - COMPLETE
// // ============================================
// export function LotteryConfiguration({
//   data,
//   updateData,
//   errors,
//   eligibility,
//   prizeDistribution,
//   setPrizeDistribution,
//   nonMonetaryPrizes,
//   setNonMonetaryPrizes,
//   percentageErrors,
//   setPercentageErrors,
//   nonMonetaryErrors,
//   setNonMonetaryErrors
// }) {

//   // ============================================
//   // PERCENTAGE DISTRIBUTION FUNCTIONS (Monetary & Revenue)
//   // ✅ FIXED: Percentage tracking now accurate
//   // ============================================

//   const calculateTotalPercentage = () => {
//     return prizeDistribution.reduce((sum, item) => {
//       const val = parseFloat(item.percentage);
//       return sum + (isNaN(val) || item.percentage === '' ? 0 : val);
//     }, 0);
//   };

//   const getRemainingPercentage = () => {
//     const total = calculateTotalPercentage();
//     return Math.max(0, 100 - total);
//   };

//   const getTotalPrizePool = () => {
//     const rewardType = data.lottery_config?.reward_type;
//     if (rewardType === 'monetary') {
//       return parseFloat(data.lottery_config?.total_prize_pool) || 0;
//     }
//     if (rewardType === 'projected_revenue') {
//       return parseFloat(data.lottery_config?.projected_revenue) || 0;
//     }
//     return 0;
//   };

//   // ✅ FIXED: Handle percentage changes - ALWAYS allow input, show errors but don't block
//   const handlePercentageChange = (rank, value) => {
//     const index = rank - 1;
//     const newErrors = { ...percentageErrors };
    
//     // Allow empty string for clearing
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
    
//     // Reject negative values
//     if (numValue < 0) return;
    
//     // ✅ ALWAYS UPDATE THE VALUE FIRST - Let user edit freely
//     const newDistribution = [...prizeDistribution];
//     newDistribution[index] = { ...newDistribution[index], percentage: numValue };
//     setPrizeDistribution(newDistribution);
    
//     // Then check validations and show errors (but don't block input)
    
//     // Check if exceeds 100
//     if (numValue > 100) {
//       newErrors[rank] = `Cannot exceed 100%`;
//       setPercentageErrors(newErrors);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           prize_distribution: newDistribution
//         }
//       });
//       return;
//     }

//     // Calculate what the new total would be
//     const newTotal = newDistribution.reduce((sum, item) => {
//       const val = parseFloat(item.percentage);
//       return sum + (isNaN(val) || item.percentage === '' ? 0 : val);
//     }, 0);
    
//     // Check if new total exceeds 100%
//     if (newTotal > 100) {
//       const currentTotal = prizeDistribution.reduce((sum, item) => {
//         const val = parseFloat(item.percentage);
//         return sum + (isNaN(val) || item.percentage === '' ? 0 : val);
//       }, 0);
//       const currentRankValue = parseFloat(prizeDistribution[index].percentage) || 0;
//       const remaining = 100 - (currentTotal - currentRankValue);
//       newErrors[rank] = `Total would exceed 100%. You have ${remaining.toFixed(2)}% remaining`;
//       setPercentageErrors(newErrors);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           prize_distribution: newDistribution
//         }
//       });
//       return;
//     }

//     // Check descending order (rank must be >= next rank)
//     if (index > 0) {
//       const previousVal = parseFloat(newDistribution[index - 1].percentage);
//       if (!isNaN(previousVal) && previousVal !== '' && numValue > previousVal) {
//         newErrors[rank] = `Must be ≤ Rank ${rank - 1} (${previousVal}%)`;
//         setPercentageErrors(newErrors);
//         updateData({
//           lottery_config: {
//             ...data.lottery_config,
//             prize_distribution: newDistribution
//           }
//         });
//         return;
//       }
//     }

//     if (index < newDistribution.length - 1) {
//       const nextVal = parseFloat(newDistribution[index + 1].percentage);
//       if (!isNaN(nextVal) && nextVal !== '' && numValue < nextVal) {
//         newErrors[rank] = `Must be ≥ Rank ${rank + 1} (${nextVal}%)`;
//         setPercentageErrors(newErrors);
//         updateData({
//           lottery_config: {
//             ...data.lottery_config,
//             prize_distribution: newDistribution
//           }
//         });
//         return;
//       }
//     }

//     // All validations passed
//     delete newErrors[rank];
//     setPercentageErrors(newErrors);
//     updateData({
//       lottery_config: {
//         ...data.lottery_config,
//         prize_distribution: newDistribution
//       }
//     });
//   };

//   // ============================================
//   // NON-MONETARY PRIZE FUNCTIONS
//   // ✅ FIXED: Using parseInt to prevent value corruption
//   // ============================================

//   const calculateTotalNonMonetaryValue = () => {
//     return nonMonetaryPrizes.reduce((sum, item) => {
//       const val = parseInt(item.prize_value);
//       return sum + (isNaN(val) || item.prize_value === '' ? 0 : val);
//     }, 0);
//   };

//   const getRemainingNonMonetaryValue = () => {
//     const totalValue = parseInt(data.lottery_config?.estimated_value) || 0;
//     const distributed = calculateTotalNonMonetaryValue();
//     return Math.max(0, totalValue - distributed);
//   };

//   const handleNonMonetaryPrizeChange = (rank, field, value) => {
//     const index = rank - 1;
//     const newErrors = { ...nonMonetaryErrors };
//     const newPrizes = [...nonMonetaryPrizes];
    
//     if (field === 'prize_description') {
//       newPrizes[index] = { ...newPrizes[index], prize_description: value };
//       delete newErrors[`${rank}_description`];
//       setNonMonetaryPrizes(newPrizes);
//       setNonMonetaryErrors(newErrors);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           non_monetary_prizes: newPrizes
//         }
//       });
//       return;
//     } 
    
//     if (field === 'prize_value') {
//       // Allow empty string for clearing
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

//       // ✅ FIX: Use parseInt to prevent decimal corruption (7000 -> 6988 bug)
//       const numValue = parseInt(value);
      
//       // Reject if not a valid number
//       if (isNaN(numValue)) return;
      
//       // Reject negative values
//       if (numValue < 0) return;

//       // ✅ ALWAYS UPDATE THE VALUE FIRST - Let user edit freely
//       newPrizes[index] = { ...newPrizes[index], prize_value: numValue };
//       setNonMonetaryPrizes(newPrizes);

//       // Then check validations and show errors (but don't block input)
//       const totalValue = parseInt(data.lottery_config?.estimated_value) || 0;

//       // Calculate new total
//       const newTotal = newPrizes.reduce((sum, item) => {
//         const val = parseInt(item.prize_value);
//         return sum + (isNaN(val) || item.prize_value === '' ? 0 : val);
//       }, 0);
      
//       // Check if exceeds total value
//       if (newTotal > totalValue) {
//         const currentTotal = nonMonetaryPrizes.reduce((sum, item) => {
//           const val = parseInt(item.prize_value);
//           return sum + (isNaN(val) || item.prize_value === '' ? 0 : val);
//         }, 0);
//         const currentRankValue = parseInt(nonMonetaryPrizes[index].prize_value) || 0;
//         const remaining = totalValue - (currentTotal - currentRankValue);
//         newErrors[`${rank}_value`] = `Total would exceed $${totalValue.toLocaleString()}. Remaining: $${remaining.toLocaleString()}`;
//         setNonMonetaryErrors(newErrors);
//         updateData({
//           lottery_config: {
//             ...data.lottery_config,
//             non_monetary_prizes: newPrizes
//           }
//         });
//         return;
//       }

//       // Check descending order
//       if (index > 0) {
//         const previousVal = parseInt(nonMonetaryPrizes[index - 1].prize_value) || 0;
//         if (previousVal !== '' && !isNaN(previousVal) && numValue > previousVal) {
//           newErrors[`${rank}_value`] = `Must be ≤ Rank ${rank - 1} ($${previousVal.toLocaleString()})`;
//           setNonMonetaryErrors(newErrors);
//           updateData({
//             lottery_config: {
//               ...data.lottery_config,
//               non_monetary_prizes: newPrizes
//             }
//           });
//           return;
//         }
//       }

//       if (index < newPrizes.length - 1) {
//         const nextVal = parseInt(newPrizes[index + 1].prize_value) || 0;
//         if (nextVal !== '' && !isNaN(nextVal) && nextVal > 0 && numValue < nextVal) {
//           newErrors[`${rank}_value`] = `Must be ≥ Rank ${rank + 1} ($${nextVal.toLocaleString()})`;
//           setNonMonetaryErrors(newErrors);
//           updateData({
//             lottery_config: {
//               ...data.lottery_config,
//               non_monetary_prizes: newPrizes
//             }
//           });
//           return;
//         }
//       }

//       // All validations passed
//       delete newErrors[`${rank}_value`];
//       setNonMonetaryErrors(newErrors);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           non_monetary_prizes: newPrizes
//         }
//       });
//     }
//   };

//   return (
//     <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//       !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//     }`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//           <FaGift className="text-yellow-600" />
//           Gamification Feature
//         </h3>
//         <label className={`relative inline-flex items-center ${
//           eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//         }`}>
//           <input
//             type="checkbox"
//             checked={data.lottery_enabled || false}
//             onChange={(e) => {
//               if (eligibility?.canCreatePaidElections) {
//                 updateData({ lottery_enabled: e.target.checked });
//               }
//             }}
//             disabled={!eligibility?.canCreatePaidElections}
//             className="sr-only peer"
//           />
//           <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//         </label>
//       </div>

//       {!eligibility?.canCreatePaidElections && (
//         <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//           <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//             <FaInfoCircle />
//             ⚠️ Upgrade your plan to enable Gamification Feature
//           </p>
//         </div>
//       )}

//       <p className="text-gray-700 mb-4 font-medium">
//         {data.lottery_enabled
//           ? '🎉 Gamify this election with prizes for voters'
//           : 'Add excitement and incentivize voters by Gamifying this Election with Prizes'}
//       </p>

//       {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//         <div className="space-y-6">
//           {/* Creator Funded Badge */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
//               <FaCheckCircle className="text-green-600 text-2xl" />
//               <div>
//                 <h4 className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</h4>
//                 <p className="text-sm text-gray-600">You or your sponsor will provide the prizes for winners</p>
//               </div>
//             </div>
//           </div>

//           {/* Prize Type Selection */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//             <div className="space-y-4">
//               {/* MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'monetary'
//                   ? 'border-green-500 bg-green-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="monetary"
//                     checked={data.lottery_config?.reward_type === 'monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">💵</span>
//                       <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Fixed cash amount with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💰 Total Prize Pool Amount (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.total_prize_pool === 0 || data.lottery_config?.total_prize_pool === '' ? '' : data.lottery_config?.total_prize_pool || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   total_prize_pool: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         onWheel={(e) => e.target.blur()}
//                         placeholder="e.g., 100000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                           errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_prize_pool && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* NON-MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'non_monetary'
//                   ? 'border-purple-500 bg-purple-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="non_monetary"
//                     checked={data.lottery_config?.reward_type === 'non_monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-purple-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">🎁</span>
//                       <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Individual prizes with descriptions and values</p>
//                     <p className="text-xs text-gray-500 italic">e.g., 1st: Dubai tour $3000, 2nd: UK tour $2000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'non_monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💵 Total Estimated Value (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.estimated_value === 0 || data.lottery_config?.estimated_value === '' ? '' : data.lottery_config?.estimated_value || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   estimated_value: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         onWheel={(e) => e.target.blur()}
//                         placeholder="Total value of all prizes"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                           errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_estimated_value && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* PROJECTED REVENUE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'projected_revenue'
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="projected_revenue"
//                     checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">📈</span>
//                       <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Total prize pool from projected content revenue with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 50,000 total prize pool from content revenue</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'projected_revenue' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         📊 Total Prize Pool from Projected Revenue (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.projected_revenue === 0 || data.lottery_config?.projected_revenue === '' ? '' : data.lottery_config?.projected_revenue || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   projected_revenue: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         onWheel={(e) => e.target.blur()}
//                         placeholder="e.g., 300000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                           errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Enter the total amount that will be distributed among winners from content revenue
//                       </p>
//                       {errors.lottery_projected_revenue && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {errors.lottery_reward_type && (
//               <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//             )}
//           </div>

//           {/* NUMBER OF WINNERS */}
//           <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//             <div className="flex items-center justify-between mb-3">
//               <label className="block text-sm font-semibold text-gray-700">
//                 <FaTrophy className="inline mr-2 text-yellow-600" />
//                 Number of Winners (1-100) *
//               </label>
//             </div>
            
//             <input
//               type="number"
//               min="1"
//               max="100"
//               step="1"
//               value={data.lottery_config?.winner_count === '' || data.lottery_config?.winner_count === 0 ? '' : data.lottery_config?.winner_count || ''}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (value === '') {
//                   updateData({
//                     lottery_config: {
//                       ...data.lottery_config,
//                       winner_count: ''
//                     }
//                   });
//                 } else {
//                   const numValue = parseInt(value);
//                   if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
//                     updateData({
//                       lottery_config: {
//                         ...data.lottery_config,
//                         winner_count: numValue
//                       }
//                     });
//                   }
//                 }
//               }}
//               onKeyDown={(e) => {
//                 if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
//                   e.preventDefault();
//                 }
//               }}
//               onWheel={(e) => e.target.blur()}
//               className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                 errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter number between 1 and 100"
//             />
//             <p className="text-xs text-gray-500 mt-2">
//               Specify how many winners will be selected for prizes
//             </p>
//             {errors.lottery_winner_count && (
//               <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//             )}

//             {/* PERCENTAGE DISTRIBUTION DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && 
//              (data.lottery_config?.reward_type === 'monetary' || data.lottery_config?.reward_type === 'projected_revenue') && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaPercent className="text-orange-600" />
//                     Prize Distribution (%)
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Total: {calculateTotalPercentage().toFixed(2)}% = ${(getTotalPrizePool() * calculateTotalPercentage() / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
//                     }`}>
//                       Remaining: {getRemainingPercentage().toFixed(2)}% = ${((getTotalPrizePool() * getRemainingPercentage()) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalPercentage() > 100 && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       ⚠ Total exceeds 100%! You have {(calculateTotalPercentage() - 100).toFixed(2)}% over the limit.
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {prizeDistribution.map((item, index) => {
//                     const totalPool = getTotalPrizePool();
//                     const currentPercentage = parseFloat(item.percentage) || 0;
//                     const currentAmount = (totalPool * currentPercentage) / 100;

//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
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
//                               step="0.01"
//                               value={item.percentage === '' ? '' : item.percentage}
//                               onChange={(e) => handlePercentageChange(item.rank, e.target.value)}
//                               onKeyDown={(e) => {
//                                 if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                                   e.preventDefault();
//                                 }
//                               }}
//                               onWheel={(e) => e.target.blur()}
//                               placeholder="0.00"
//                               className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
//                                 percentageErrors[item.rank] ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                               }`}
//                             />
//                           </div>

//                           <span className="text-lg font-bold text-gray-700">%</span>
                          
//                           <div className="text-right min-w-[100px]">
//                             <div className="text-sm font-bold text-green-600">
//                               ${currentAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                             </div>
//                           </div>
//                         </div>

//                         {percentageErrors[item.rank] && (
//                           <div className="ml-28 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {percentageErrors[item.rank]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Rank 1 must have highest percentage<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed 100%
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* NON-MONETARY PRIZES DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && data.lottery_config?.reward_type === 'non_monetary' && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaGift className="text-purple-600" />
//                     Individual Prize Details
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Max: ${(parseInt(data.lottery_config?.estimated_value) || 0).toLocaleString()}
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       getRemainingNonMonetaryValue() >= 0 ? 'text-green-600' : 'text-red-600'
//                     }`}>
//                       Remaining: ${Math.max(0, getRemainingNonMonetaryValue()).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalNonMonetaryValue() > (parseInt(data.lottery_config?.estimated_value) || 0) && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       ⚠ Total prize value exceeds estimated value by ${(calculateTotalNonMonetaryValue() - (parseInt(data.lottery_config?.estimated_value) || 0)).toLocaleString()}!
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {nonMonetaryPrizes.map((item, index) => {
//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="p-3 bg-white rounded-lg border border-purple-200">
//                           <div className="flex items-center gap-2 mb-2">
//                             <FaTrophy className={`${
//                               index === 0 ? 'text-yellow-500' :
//                               index === 1 ? 'text-gray-400' :
//                               index === 2 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             <span className="font-bold text-gray-700">
//                               {index === 0 ? '🥇 1st Winner' :
//                                index === 1 ? '🥈 2nd Winner' :
//                                index === 2 ? '🥉 3rd Winner' :
//                                `🏅 ${item.rank}th Winner`}
//                             </span>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Description *
//                               </label>
//                               <input
//                                 type="text"
//                                 value={item.prize_description || ''}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_description', e.target.value)}
//                                 placeholder="e.g., Dubai tour package with 5-star hotel"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_description`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>

//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Value (USD) *
//                               </label>
//                               <input
//                                 type="number"
//                                 min="0"
//                                 step="1"
//                                 value={item.prize_value === '' ? '' : item.prize_value}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_value', e.target.value)}
//                                 onKeyDown={(e) => {
//                                   if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                                     e.preventDefault();
//                                   }
//                                 }}
//                                 onWheel={(e) => e.target.blur()}
//                                 placeholder="0"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_value`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>
//                           </div>
//                         </div>

//                         {(nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]) && (
//                           <div className="ml-8 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Each prize must have a description and value<br />
//                     • Rank 1 must have highest value<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed estimated value
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Prize Pool Summary */}
//           {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//             <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//               <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Prize Distribution Summary
//               </h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Total Prize Pool:</span>
//                   <span className="font-bold text-green-600">
//                     ${data.lottery_config.total_prize_pool.toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Number of Winners:</span>
//                   <span className="font-bold">{data.lottery_config.winner_count}</span>
//                 </div>
                
//                 {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
//                   <div className="mt-3 pt-3 border-t-2 border-green-300">
//                     <p className="font-semibold mb-2">Distribution:</p>
//                     {prizeDistribution.map((item) => {
//                       const percentage = parseFloat(item.percentage) || 0;
//                       const amount = (data.lottery_config.total_prize_pool * (percentage / 100));
//                       return (
//                         <div key={item.rank} className="flex justify-between text-xs py-1">
//                           <span>
//                             <FaTrophy className={`inline mr-1 ${
//                               item.rank === 1 ? 'text-yellow-500' :
//                               item.rank === 2 ? 'text-gray-400' :
//                               item.rank === 3 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             Rank {item.rank} ({percentage}%):
//                           </span>
//                           <span className="font-bold text-green-600">
//                             ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default LotteryConfiguration;

















// // src/components/election/Step2Configuration/Step2Configuration-Part3-LotteryFull.jsx
// // Contains: Complete LotteryConfiguration with all 3 prize types
// // ✅ FIXED: Percentage calculation now shows correct remaining percentage
// // ✅ FIXED: Input fields use parseInt to prevent value changes (e.g., 7000 -> 6988)
// // ✅ FIXED: All inputs are erasable and accept keyboard/mouse input properly
// import React from 'react';
// import {
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaTrophy,
//   FaPercent,
//   FaExclamationTriangle
// } from 'react-icons/fa';

// // ============================================
// // LOTTERY CONFIGURATION COMPONENT - COMPLETE
// // ============================================
// export function LotteryConfiguration({
//   data,
//   updateData,
//   errors,
//   eligibility,
//   prizeDistribution,
//   setPrizeDistribution,
//   nonMonetaryPrizes,
//   setNonMonetaryPrizes,
//   percentageErrors,
//   setPercentageErrors,
//   nonMonetaryErrors,
//   setNonMonetaryErrors
// }) {

//   // ============================================
//   // PERCENTAGE DISTRIBUTION FUNCTIONS (Monetary & Revenue)
//   // ✅ FIXED: Percentage tracking now accurate
//   // ============================================

//   const calculateTotalPercentage = () => {
//     return prizeDistribution.reduce((sum, item) => {
//       const val = parseFloat(item.percentage);
//       return sum + (isNaN(val) || item.percentage === '' ? 0 : val);
//     }, 0);
//   };

//   const getRemainingPercentage = () => {
//     const total = calculateTotalPercentage();
//     return Math.max(0, 100 - total);
//   };

//   const getTotalPrizePool = () => {
//     const rewardType = data.lottery_config?.reward_type;
//     if (rewardType === 'monetary') {
//       return parseFloat(data.lottery_config?.total_prize_pool) || 0;
//     }
//     if (rewardType === 'projected_revenue') {
//       return parseFloat(data.lottery_config?.projected_revenue) || 0;
//     }
//     return 0;
//   };

//   // ✅ FIXED: Handle percentage changes with proper validation
//   const handlePercentageChange = (rank, value) => {
//     const index = rank - 1;
//     const newErrors = { ...percentageErrors };
    
//     // Allow empty string for clearing
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
    
//     // Reject negative values
//     if (numValue < 0) return;
    
//     // Reject values > 100
//     if (numValue > 100) {
//       newErrors[rank] = `Cannot exceed 100%`;
//       setPercentageErrors(newErrors);
//       return;
//     }

//     // Create new distribution with updated value
//     const newDistribution = [...prizeDistribution];
//     newDistribution[index] = { ...newDistribution[index], percentage: numValue };

//     // ✅ Calculate what the new total would be
//     const newTotal = newDistribution.reduce((sum, item) => {
//       const val = parseFloat(item.percentage);
//       return sum + (isNaN(val) || item.percentage === '' ? 0 : val);
//     }, 0);
    
//     // Check if new total exceeds 100%
//     if (newTotal > 100) {
//       // Calculate how much is remaining
//       const currentTotal = prizeDistribution.reduce((sum, item) => {
//         const val = parseFloat(item.percentage);
//         return sum + (isNaN(val) || item.percentage === '' ? 0 : val);
//       }, 0);
//       const currentRankValue = parseFloat(prizeDistribution[index].percentage) || 0;
//       const remaining = 100 - (currentTotal - currentRankValue);
//       newErrors[rank] = `Total would exceed 100%. You have ${remaining.toFixed(2)}% remaining`;
//       setPercentageErrors(newErrors);
//       return;
//     }

//     // Check descending order (rank must be >= next rank)
//     if (index > 0) {
//       const previousVal = parseFloat(newDistribution[index - 1].percentage);
//       if (!isNaN(previousVal) && previousVal !== '' && numValue > previousVal) {
//         newErrors[rank] = `Must be ≤ Rank ${rank - 1} (${previousVal}%)`;
//         setPercentageErrors(newErrors);
//         return;
//       }
//     }

//     if (index < newDistribution.length - 1) {
//       const nextVal = parseFloat(newDistribution[index + 1].percentage);
//       if (!isNaN(nextVal) && nextVal !== '' && numValue < nextVal) {
//         newErrors[rank] = `Must be ≥ Rank ${rank + 1} (${nextVal}%)`;
//         setPercentageErrors(newErrors);
//         return;
//       }
//     }

//     // All validations passed
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
//   // NON-MONETARY PRIZE FUNCTIONS
//   // ✅ FIXED: Using parseInt to prevent value corruption
//   // ============================================

//   const calculateTotalNonMonetaryValue = () => {
//     return nonMonetaryPrizes.reduce((sum, item) => {
//       const val = parseInt(item.prize_value);
//       return sum + (isNaN(val) || item.prize_value === '' ? 0 : val);
//     }, 0);
//   };

//   const getRemainingNonMonetaryValue = () => {
//     const totalValue = parseInt(data.lottery_config?.estimated_value) || 0;
//     const distributed = calculateTotalNonMonetaryValue();
//     return Math.max(0, totalValue - distributed);
//   };

//   const handleNonMonetaryPrizeChange = (rank, field, value) => {
//     const index = rank - 1;
//     const newErrors = { ...nonMonetaryErrors };
//     const newPrizes = [...nonMonetaryPrizes];
    
//     if (field === 'prize_description') {
//       newPrizes[index] = { ...newPrizes[index], prize_description: value };
//       delete newErrors[`${rank}_description`];
//       setNonMonetaryPrizes(newPrizes);
//       setNonMonetaryErrors(newErrors);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           non_monetary_prizes: newPrizes
//         }
//       });
//       return;
//     } 
    
//     if (field === 'prize_value') {
//       // Allow empty string for clearing
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

//       // ✅ FIX: Use parseInt to prevent decimal corruption (7000 -> 6988 bug)
//       const numValue = parseInt(value);
      
//       // Reject if not a valid number
//       if (isNaN(numValue)) return;
      
//       // Reject negative values
//       if (numValue < 0) return;

//       const totalValue = parseInt(data.lottery_config?.estimated_value) || 0;
//       newPrizes[index] = { ...newPrizes[index], prize_value: numValue };

//       // Calculate new total
//       const newTotal = newPrizes.reduce((sum, item) => {
//         const val = parseInt(item.prize_value);
//         return sum + (isNaN(val) || item.prize_value === '' ? 0 : val);
//       }, 0);
      
//       // Check if exceeds total value
//       if (newTotal > totalValue) {
//         const currentTotal = nonMonetaryPrizes.reduce((sum, item) => {
//           const val = parseInt(item.prize_value);
//           return sum + (isNaN(val) || item.prize_value === '' ? 0 : val);
//         }, 0);
//         const currentRankValue = parseInt(nonMonetaryPrizes[index].prize_value) || 0;
//         const remaining = totalValue - (currentTotal - currentRankValue);
//         newErrors[`${rank}_value`] = `Total would exceed $${totalValue.toLocaleString()}. Remaining: $${remaining.toLocaleString()}`;
//         setNonMonetaryErrors(newErrors);
//         return;
//       }

//       // Check descending order
//       if (index > 0) {
//         const previousVal = parseInt(nonMonetaryPrizes[index - 1].prize_value) || 0;
//         if (previousVal !== '' && !isNaN(previousVal) && numValue > previousVal) {
//           newErrors[`${rank}_value`] = `Must be ≤ Rank ${rank - 1} ($${previousVal.toLocaleString()})`;
//           setNonMonetaryErrors(newErrors);
//           return;
//         }
//       }

//       if (index < newPrizes.length - 1) {
//         const nextVal = parseInt(newPrizes[index + 1].prize_value) || 0;
//         if (nextVal !== '' && !isNaN(nextVal) && nextVal > 0 && numValue < nextVal) {
//           newErrors[`${rank}_value`] = `Must be ≥ Rank ${rank + 1} ($${nextVal.toLocaleString()})`;
//           setNonMonetaryErrors(newErrors);
//           return;
//         }
//       }

//       // All validations passed
//       delete newErrors[`${rank}_value`];
//       setNonMonetaryErrors(newErrors);
//       setNonMonetaryPrizes(newPrizes);
//       updateData({
//         lottery_config: {
//           ...data.lottery_config,
//           non_monetary_prizes: newPrizes
//         }
//       });
//     }
//   };

//   return (
//     <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//       !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//     }`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//           <FaGift className="text-yellow-600" />
//           Gamification Feature
//         </h3>
//         <label className={`relative inline-flex items-center ${
//           eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//         }`}>
//           <input
//             type="checkbox"
//             checked={data.lottery_enabled || false}
//             onChange={(e) => {
//               if (eligibility?.canCreatePaidElections) {
//                 updateData({ lottery_enabled: e.target.checked });
//               }
//             }}
//             disabled={!eligibility?.canCreatePaidElections}
//             className="sr-only peer"
//           />
//           <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//         </label>
//       </div>

//       {!eligibility?.canCreatePaidElections && (
//         <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//           <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//             <FaInfoCircle />
//             ⚠️ Upgrade your plan to enable Gamification Feature
//           </p>
//         </div>
//       )}

//       <p className="text-gray-700 mb-4 font-medium">
//         {data.lottery_enabled
//           ? '🎉 Gamify this election with prizes for voters'
//           : 'Add excitement and incentivize voters by Gamifying this Election with Prizes'}
//       </p>

//       {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//         <div className="space-y-6">
//           {/* Creator Funded Badge */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
//               <FaCheckCircle className="text-green-600 text-2xl" />
//               <div>
//                 <h4 className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</h4>
//                 <p className="text-sm text-gray-600">You or your sponsor will provide the prizes for winners</p>
//               </div>
//             </div>
//           </div>

//           {/* Prize Type Selection */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//             <div className="space-y-4">
//               {/* MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'monetary'
//                   ? 'border-green-500 bg-green-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="monetary"
//                     checked={data.lottery_config?.reward_type === 'monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">💵</span>
//                       <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Fixed cash amount with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💰 Total Prize Pool Amount (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.total_prize_pool === 0 || data.lottery_config?.total_prize_pool === '' ? '' : data.lottery_config?.total_prize_pool || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   total_prize_pool: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         onWheel={(e) => e.target.blur()}
//                         placeholder="e.g., 100000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                           errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_prize_pool && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* NON-MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'non_monetary'
//                   ? 'border-purple-500 bg-purple-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="non_monetary"
//                     checked={data.lottery_config?.reward_type === 'non_monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-purple-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">🎁</span>
//                       <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Individual prizes with descriptions and values</p>
//                     <p className="text-xs text-gray-500 italic">e.g., 1st: Dubai tour $3000, 2nd: UK tour $2000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'non_monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💵 Total Estimated Value (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.estimated_value === 0 || data.lottery_config?.estimated_value === '' ? '' : data.lottery_config?.estimated_value || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   estimated_value: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         onWheel={(e) => e.target.blur()}
//                         placeholder="Total value of all prizes"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                           errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_estimated_value && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* PROJECTED REVENUE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'projected_revenue'
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="projected_revenue"
//                     checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">📈</span>
//                       <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Total prize pool from projected content revenue with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 50,000 total prize pool from content revenue</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'projected_revenue' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         📊 Total Prize Pool from Projected Revenue (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.projected_revenue === 0 || data.lottery_config?.projected_revenue === '' ? '' : data.lottery_config?.projected_revenue || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   projected_revenue: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         onWheel={(e) => e.target.blur()}
//                         placeholder="e.g., 300000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                           errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Enter the total amount that will be distributed among winners from content revenue
//                       </p>
//                       {errors.lottery_projected_revenue && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {errors.lottery_reward_type && (
//               <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//             )}
//           </div>

//           {/* NUMBER OF WINNERS */}
//           <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//             <div className="flex items-center justify-between mb-3">
//               <label className="block text-sm font-semibold text-gray-700">
//                 <FaTrophy className="inline mr-2 text-yellow-600" />
//                 Number of Winners (1-100) *
//               </label>
//             </div>
            
//             <input
//               type="number"
//               min="1"
//               max="100"
//               step="1"
//               value={data.lottery_config?.winner_count === '' || data.lottery_config?.winner_count === 0 ? '' : data.lottery_config?.winner_count || ''}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (value === '') {
//                   updateData({
//                     lottery_config: {
//                       ...data.lottery_config,
//                       winner_count: ''
//                     }
//                   });
//                 } else {
//                   const numValue = parseInt(value);
//                   if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
//                     updateData({
//                       lottery_config: {
//                         ...data.lottery_config,
//                         winner_count: numValue
//                       }
//                     });
//                   }
//                 }
//               }}
//               onKeyDown={(e) => {
//                 if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
//                   e.preventDefault();
//                 }
//               }}
//               onWheel={(e) => e.target.blur()}
//               className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                 errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter number between 1 and 100"
//             />
//             <p className="text-xs text-gray-500 mt-2">
//               Specify how many winners will be selected for prizes
//             </p>
//             {errors.lottery_winner_count && (
//               <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//             )}

//             {/* PERCENTAGE DISTRIBUTION DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && 
//              (data.lottery_config?.reward_type === 'monetary' || data.lottery_config?.reward_type === 'projected_revenue') && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaPercent className="text-orange-600" />
//                     Prize Distribution (%)
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Total: {calculateTotalPercentage().toFixed(2)}% = ${(getTotalPrizePool() * calculateTotalPercentage() / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
//                     }`}>
//                       Remaining: {getRemainingPercentage().toFixed(2)}% = ${((getTotalPrizePool() * getRemainingPercentage()) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalPercentage() > 100 && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       ⚠ Total exceeds 100%! You have {(calculateTotalPercentage() - 100).toFixed(2)}% over the limit.
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {prizeDistribution.map((item, index) => {
//                     const totalPool = getTotalPrizePool();
//                     const currentPercentage = parseFloat(item.percentage) || 0;
//                     const currentAmount = (totalPool * currentPercentage) / 100;

//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
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
//                               step="0.01"
//                               value={item.percentage === '' ? '' : item.percentage}
//                               onChange={(e) => handlePercentageChange(item.rank, e.target.value)}
//                               onKeyDown={(e) => {
//                                 if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                                   e.preventDefault();
//                                 }
//                               }}
//                               onWheel={(e) => e.target.blur()}
//                               placeholder="0.00"
//                               className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
//                                 percentageErrors[item.rank] ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                               }`}
//                             />
//                           </div>

//                           <span className="text-lg font-bold text-gray-700">%</span>
                          
//                           <div className="text-right min-w-[100px]">
//                             <div className="text-sm font-bold text-green-600">
//                               ${currentAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                             </div>
//                           </div>
//                         </div>

//                         {percentageErrors[item.rank] && (
//                           <div className="ml-28 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {percentageErrors[item.rank]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Rank 1 must have highest percentage<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed 100%
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* NON-MONETARY PRIZES DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && data.lottery_config?.reward_type === 'non_monetary' && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaGift className="text-purple-600" />
//                     Individual Prize Details
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Max: ${(parseInt(data.lottery_config?.estimated_value) || 0).toLocaleString()}
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       getRemainingNonMonetaryValue() >= 0 ? 'text-green-600' : 'text-red-600'
//                     }`}>
//                       Remaining: ${Math.max(0, getRemainingNonMonetaryValue()).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalNonMonetaryValue() > (parseInt(data.lottery_config?.estimated_value) || 0) && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       ⚠ Total prize value exceeds estimated value by ${(calculateTotalNonMonetaryValue() - (parseInt(data.lottery_config?.estimated_value) || 0)).toLocaleString()}!
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {nonMonetaryPrizes.map((item, index) => {
//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="p-3 bg-white rounded-lg border border-purple-200">
//                           <div className="flex items-center gap-2 mb-2">
//                             <FaTrophy className={`${
//                               index === 0 ? 'text-yellow-500' :
//                               index === 1 ? 'text-gray-400' :
//                               index === 2 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             <span className="font-bold text-gray-700">
//                               {index === 0 ? '🥇 1st Winner' :
//                                index === 1 ? '🥈 2nd Winner' :
//                                index === 2 ? '🥉 3rd Winner' :
//                                `🏅 ${item.rank}th Winner`}
//                             </span>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Description *
//                               </label>
//                               <input
//                                 type="text"
//                                 value={item.prize_description || ''}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_description', e.target.value)}
//                                 placeholder="e.g., Dubai tour package with 5-star hotel"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_description`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>

//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Value (USD) *
//                               </label>
//                               <input
//                                 type="number"
//                                 min="0"
//                                 step="1"
//                                 value={item.prize_value === '' ? '' : item.prize_value}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_value', e.target.value)}
//                                 onKeyDown={(e) => {
//                                   if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                                     e.preventDefault();
//                                   }
//                                 }}
//                                 onWheel={(e) => e.target.blur()}
//                                 placeholder="0"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_value`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>
//                           </div>
//                         </div>

//                         {(nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]) && (
//                           <div className="ml-8 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Each prize must have a description and value<br />
//                     • Rank 1 must have highest value<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed estimated value
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Prize Pool Summary */}
//           {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//             <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//               <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Prize Distribution Summary
//               </h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Total Prize Pool:</span>
//                   <span className="font-bold text-green-600">
//                     ${data.lottery_config.total_prize_pool.toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Number of Winners:</span>
//                   <span className="font-bold">{data.lottery_config.winner_count}</span>
//                 </div>
                
//                 {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
//                   <div className="mt-3 pt-3 border-t-2 border-green-300">
//                     <p className="font-semibold mb-2">Distribution:</p>
//                     {prizeDistribution.map((item) => {
//                       const percentage = parseFloat(item.percentage) || 0;
//                       const amount = (data.lottery_config.total_prize_pool * (percentage / 100));
//                       return (
//                         <div key={item.rank} className="flex justify-between text-xs py-1">
//                           <span>
//                             <FaTrophy className={`inline mr-1 ${
//                               item.rank === 1 ? 'text-yellow-500' :
//                               item.rank === 2 ? 'text-gray-400' :
//                               item.rank === 3 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             Rank {item.rank} ({percentage}%):
//                           </span>
//                           <span className="font-bold text-green-600">
//                             ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default LotteryConfiguration;
// // src/components/election/Step2Configuration/Step2Configuration-Part3-LotteryFull.jsx
// // Contains: Complete LotteryConfiguration with all 3 prize types
// import React from 'react';
// import {
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaTrophy,
//   FaPercent,
//   FaExclamationTriangle
// } from 'react-icons/fa';

// // ============================================
// // LOTTERY CONFIGURATION COMPONENT - COMPLETE
// // ============================================
// export function LotteryConfiguration({
//   data,
//   updateData,
//   errors,
//   eligibility,
//   prizeDistribution,
//   setPrizeDistribution,
//   nonMonetaryPrizes,
//   setNonMonetaryPrizes,
//   percentageErrors,
//   setPercentageErrors,
//   nonMonetaryErrors,
//   setNonMonetaryErrors
// }) {

//   // ============================================
//   // PERCENTAGE DISTRIBUTION FUNCTIONS (Monetary & Revenue)
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
//       // Use projected_revenue directly as the total prize pool
//       return parseFloat(data.lottery_config?.projected_revenue) || 0;
//     }
//     return 0;
//   };
// /*eslint-disable*/
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
//   // NON-MONETARY PRIZE FUNCTIONS
//   // ============================================

//   const calculateTotalNonMonetaryValue = () => {
//     return nonMonetaryPrizes.reduce((sum, item) => {
//       const val = item.prize_value === '' ? 0 : parseInt(item.prize_value);
//       return sum + (isNaN(val) ? 0 : val);
//     }, 0);
//   };

//   const getRemainingNonMonetaryValue = (upToRank) => {
//     const totalValue = parseFloat(data.lottery_config?.estimated_value) || 0;
//     let distributed = 0;
    
//     for (let i = 0; i < upToRank - 1; i++) {
//       if (nonMonetaryPrizes[i]) {
//         const val = nonMonetaryPrizes[i].prize_value === '' ? 0 : parseInt(nonMonetaryPrizes[i].prize_value);
//         distributed += isNaN(val) ? 0 : val;
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

//       // ✅ FIX: Use parseInt instead of parseFloat to prevent 2000 -> 1988 bug
//       const numValue = parseInt(value);
      
//       // If not a valid number, return
//       if (isNaN(numValue)) return;
      
//       if (numValue < 0) return;

//       const totalValue = parseFloat(data.lottery_config?.estimated_value) || 0;
//       newPrizes[index] = { ...newPrizes[index], prize_value: numValue };

//       const newTotal = newPrizes.reduce((sum, item) => {
//         const val = item.prize_value === '' ? 0 : parseInt(item.prize_value);
//         return sum + (isNaN(val) ? 0 : val);
//       }, 0);
      
//       if (newTotal > totalValue) {
//         const remaining = getRemainingNonMonetaryValue(rank);
//         newErrors[`${rank}_value`] = `Total would exceed $${totalValue.toLocaleString()}. Remaining: $${remaining.toLocaleString()}`;
//         setNonMonetaryErrors(newErrors);
//         return;
//       }

//       if (index > 0) {
//         const previousVal = newPrizes[index - 1].prize_value === '' ? 0 : parseInt(newPrizes[index - 1].prize_value);
//         if (!isNaN(previousVal) && numValue > previousVal) {
//           newErrors[`${rank}_value`] = `Must be ≤ Rank ${rank - 1} ($${previousVal.toLocaleString()})`;
//           setNonMonetaryErrors(newErrors);
//           return;
//         }
//       }

//       if (index < newPrizes.length - 1) {
//         const nextVal = newPrizes[index + 1].prize_value === '' ? 0 : parseInt(newPrizes[index + 1].prize_value);
//         if (!isNaN(nextVal) && nextVal > 0 && numValue < nextVal) {
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

//   return (
//     <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//       !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//     }`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//           <FaGift className="text-yellow-600" />
//           Gamification Feature
//         </h3>
//         <label className={`relative inline-flex items-center ${
//           eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//         }`}>
//           <input
//             type="checkbox"
//             checked={data.lottery_enabled || false}
//             onChange={(e) => {
//               if (eligibility?.canCreatePaidElections) {
//                 updateData({ lottery_enabled: e.target.checked });
//               }
//             }}
//             disabled={!eligibility?.canCreatePaidElections}
//             className="sr-only peer"
//           />
//           <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//         </label>
//       </div>

//       {!eligibility?.canCreatePaidElections && (
//         <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//           <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//             <FaInfoCircle />
//             ⚠️ Upgrade your plan to enable Gamification Feature
//           </p>
//         </div>
//       )}

//       <p className="text-gray-700 mb-4 font-medium">
//         {data.lottery_enabled
//           ? '🎉 Gamify this election with prizes for voters'
//           : 'Add excitement and incentivize voters by Gamifying this Election with Prizes'}
//       </p>

//       {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//         <div className="space-y-6">
//           {/* Creator Funded Badge */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
//               <FaCheckCircle className="text-green-600 text-2xl" />
//               <div>
//                 <h4 className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</h4>
//                 <p className="text-sm text-gray-600">You or your sponsor will provide the prizes for winners</p>
//               </div>
//             </div>
//           </div>

//           {/* Prize Type Selection */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//             <div className="space-y-4">
//               {/* MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'monetary'
//                   ? 'border-green-500 bg-green-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="monetary"
//                     checked={data.lottery_config?.reward_type === 'monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">💵</span>
//                       <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Fixed cash amount with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💰 Total Prize Pool Amount (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.total_prize_pool || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   total_prize_pool: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         placeholder="e.g., 100000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                           errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_prize_pool && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* NON-MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'non_monetary'
//                   ? 'border-purple-500 bg-purple-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="non_monetary"
//                     checked={data.lottery_config?.reward_type === 'non_monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-purple-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">🎁</span>
//                       <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Individual prizes with descriptions and values</p>
//                     <p className="text-xs text-gray-500 italic">e.g., 1st: Dubai tour $3000, 2nd: UK tour $2000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'non_monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💵 Total Estimated Value (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.estimated_value || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   estimated_value: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         placeholder="Total value of all prizes"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                           errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_estimated_value && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* PROJECTED REVENUE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'projected_revenue'
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="projected_revenue"
//                     checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">📈</span>
//                       <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Total prize pool from projected content revenue with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 50,000 total prize pool from content revenue</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'projected_revenue' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         📊 Total Prize Pool from Projected Revenue (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.projected_revenue || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   projected_revenue: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         onPaste={(e) => {
//                           const pastedText = e.clipboardData.getData('text');
//                           if (pastedText.includes('-') || pastedText.includes('.') || pastedText.includes('e')) {
//                             e.preventDefault();
//                           }
//                         }}
//                         placeholder="e.g., 300000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                           errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Enter the total amount that will be distributed among winners from content revenue
//                       </p>
//                       {errors.lottery_projected_revenue && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {errors.lottery_reward_type && (
//               <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//             )}
//           </div>

//           {/* NUMBER OF WINNERS */}
//           <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//             <div className="flex items-center justify-between mb-3">
//               <label className="block text-sm font-semibold text-gray-700">
//                 <FaTrophy className="inline mr-2 text-yellow-600" />
//                 Number of Winners (1-100) *
//               </label>
//             </div>
            
//             <input
//               type="number"
//               min="1"
//               max="100"
//               step="1"
//               value={data.lottery_config?.winner_count === '' ? '' : data.lottery_config?.winner_count || ''}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (value === '') {
//                   updateData({
//                     lottery_config: {
//                       ...data.lottery_config,
//                       winner_count: ''
//                     }
//                   });
//                 } else {
//                   const numValue = parseInt(value);
//                   if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
//                     updateData({
//                       lottery_config: {
//                         ...data.lottery_config,
//                         winner_count: numValue
//                       }
//                     });
//                   }
//                 }
//               }}
//               onKeyDown={(e) => {
//                 if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
//                   e.preventDefault();
//                 }
//               }}
//               className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                 errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter number between 1 and 100"
//             />
//             <p className="text-xs text-gray-500 mt-2">
//               Specify how many winners will be selected for prizes
//             </p>
//             {errors.lottery_winner_count && (
//               <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//             )}

//             {/* PERCENTAGE DISTRIBUTION DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && 
//              (data.lottery_config?.reward_type === 'monetary' || data.lottery_config?.reward_type === 'projected_revenue') && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaPercent className="text-orange-600" />
//                     Prize Distribution (%)
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Total: {calculateTotalPercentage().toFixed(2)}% = ${(getTotalPrizePool() * calculateTotalPercentage() / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
//                     }`}>
//                       Remaining: {getRemainingPercentage().toFixed(2)}% = ${((getTotalPrizePool() * getRemainingPercentage()) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalPercentage() > 100 && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       Total exceeds 100%! Please adjust percentages.
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {prizeDistribution.map((item, index) => {
//                     const totalPool = getTotalPrizePool();
//                     const currentAmount = (totalPool * (parseFloat(item.percentage) || 0)) / 100;
//                     //const remainingAmount = getRemainingAmount(item.rank);
//                     //const remainingPercentage = getRemainingPercentage() + (parseFloat(item.percentage) || 0);

//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
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
                          
//                           <div className="text-right min-w-[100px]">
//                             <div className="text-sm font-bold text-green-600">
//                               ${currentAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                             </div>
//                           </div>
//                         </div>
                        
//                         {/* RUNNING BALANCE DISPLAY */}
//                         {/* <div className="ml-28 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
//                           <p className="text-xs text-blue-800 font-semibold">
//                             After Rank {item.rank}: ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} remaining ({remainingPercentage.toFixed(2)}% left)
//                           </p>
//                         </div> */}

//                         {percentageErrors[item.rank] && (
//                           <div className="ml-28 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {percentageErrors[item.rank]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Rank 1 must have highest percentage<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed 100%
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* NON-MONETARY PRIZES DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && data.lottery_config?.reward_type === 'non_monetary' && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaGift className="text-purple-600" />
//                     Individual Prize Details
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Max: ${(parseFloat(data.lottery_config?.estimated_value) || 0).toLocaleString()}
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       (parseFloat(data.lottery_config?.estimated_value) || 0) - calculateTotalNonMonetaryValue() >= 0
//                         ? 'text-green-600' 
//                         : 'text-red-600'
//                     }`}>
//                       Remaining: ${Math.max(0, (parseFloat(data.lottery_config?.estimated_value) || 0) - calculateTotalNonMonetaryValue()).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalNonMonetaryValue() > (parseFloat(data.lottery_config?.estimated_value) || 0) && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       Total prize value exceeds estimated value! Please adjust.
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {nonMonetaryPrizes.map((item, index) => {
//                     const remainingValue = getRemainingNonMonetaryValue(item.rank);

//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="p-3 bg-white rounded-lg border border-purple-200">
//                           <div className="flex items-center gap-2 mb-2">
//                             <FaTrophy className={`${
//                               index === 0 ? 'text-yellow-500' :
//                               index === 1 ? 'text-gray-400' :
//                               index === 2 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             <span className="font-bold text-gray-700">
//                               {index === 0 ? '🥇 1st Winner' :
//                                index === 1 ? '🥈 2nd Winner' :
//                                index === 2 ? '🥉 3rd Winner' :
//                                `🏅 ${item.rank}th Winner`}
//                             </span>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Description *
//                               </label>
//                               <input
//                                 type="text"
//                                 value={item.prize_description || ''}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_description', e.target.value)}
//                                 placeholder="e.g., Dubai tour package with 5-star hotel"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_description`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>

//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Value (USD) *
//                               </label>
//                               <input
//                                 type="number"
//                                 min="0"
//                                 step="1"
//                                 value={item.prize_value === '' ? '' : item.prize_value}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_value', e.target.value)}
//                                 onKeyDown={(e) => {
//                                   if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                                     e.preventDefault();
//                                   }
//                                 }}
//                                 onPaste={(e) => {
//                                   const pastedText = e.clipboardData.getData('text');
//                                   if (pastedText.includes('-') || pastedText.includes('.') || pastedText.includes('e')) {
//                                     e.preventDefault();
//                                   }
//                                 }}
//                                 placeholder="0"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_value`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>
//                           </div>
//                         </div>

//                         {/* RUNNING BALANCE DISPLAY */}
//                         <div className="ml-8 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
//                           <p className="text-xs text-blue-800 font-semibold">
//                             After Rank {item.rank}: ${remainingValue.toLocaleString()} remaining
//                           </p>
//                         </div>

//                         {(nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]) && (
//                           <div className="ml-8 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Each prize must have a description and value<br />
//                     • Rank 1 must have highest value<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed estimated value
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Prize Pool Summary */}
//           {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//             <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//               <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Prize Distribution Summary
//               </h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Total Prize Pool:</span>
//                   <span className="font-bold text-green-600">
//                     ${data.lottery_config.total_prize_pool.toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Number of Winners:</span>
//                   <span className="font-bold">{data.lottery_config.winner_count}</span>
//                 </div>
                
//                 {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
//                   <div className="mt-3 pt-3 border-t-2 border-green-300">
//                     <p className="font-semibold mb-2">Distribution:</p>
//                     {prizeDistribution.map((item) => {
//                       const amount = (data.lottery_config.total_prize_pool * (item.percentage / 100));
//                       return (
//                         <div key={item.rank} className="flex justify-between text-xs py-1">
//                           <span>
//                             <FaTrophy className={`inline mr-1 ${
//                               item.rank === 1 ? 'text-yellow-500' :
//                               item.rank === 2 ? 'text-gray-400' :
//                               item.rank === 3 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             Rank {item.rank} ({item.percentage}%):
//                           </span>
//                           <span className="font-bold text-green-600">
//                             ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default LotteryConfiguration;
//last working file
// // src/components/election/Step2Configuration/Step2Configuration-Part3-LotteryFull.jsx
// // Contains: Complete LotteryConfiguration with all 3 prize types
// import React from 'react';
// import {
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaTrophy,
//   FaPercent,
//   FaExclamationTriangle
// } from 'react-icons/fa';

// // ============================================
// // LOTTERY CONFIGURATION COMPONENT - COMPLETE
// // ============================================
// export function LotteryConfiguration({
//   data,
//   updateData,
//   errors,
//   eligibility,
//   prizeDistribution,
//   setPrizeDistribution,
//   nonMonetaryPrizes,
//   setNonMonetaryPrizes,
//   percentageErrors,
//   setPercentageErrors,
//   nonMonetaryErrors,
//   setNonMonetaryErrors
// }) {

//   // ============================================
//   // PERCENTAGE DISTRIBUTION FUNCTIONS (Monetary & Revenue)
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
//   // NON-MONETARY PRIZE FUNCTIONS
//   // ============================================

//   const calculateTotalNonMonetaryValue = () => {
//     return nonMonetaryPrizes.reduce((sum, item) => {
//       const val = item.prize_value === '' ? 0 : parseInt(item.prize_value);
//       return sum + (isNaN(val) ? 0 : val);
//     }, 0);
//   };

//   const getRemainingNonMonetaryValue = (upToRank) => {
//     const totalValue = parseFloat(data.lottery_config?.estimated_value) || 0;
//     let distributed = 0;
    
//     for (let i = 0; i < upToRank - 1; i++) {
//       if (nonMonetaryPrizes[i]) {
//         const val = nonMonetaryPrizes[i].prize_value === '' ? 0 : parseInt(nonMonetaryPrizes[i].prize_value);
//         distributed += isNaN(val) ? 0 : val;
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

//       // ✅ FIX: Use parseInt instead of parseFloat to prevent 2000 -> 1988 bug
//       const numValue = parseInt(value);
      
//       // If not a valid number, return
//       if (isNaN(numValue)) return;
      
//       if (numValue < 0) return;

//       const totalValue = parseFloat(data.lottery_config?.estimated_value) || 0;
//       newPrizes[index] = { ...newPrizes[index], prize_value: numValue };

//       const newTotal = newPrizes.reduce((sum, item) => {
//         const val = item.prize_value === '' ? 0 : parseInt(item.prize_value);
//         return sum + (isNaN(val) ? 0 : val);
//       }, 0);
      
//       if (newTotal > totalValue) {
//         const remaining = getRemainingNonMonetaryValue(rank);
//         newErrors[`${rank}_value`] = `Total would exceed $${totalValue.toLocaleString()}. Remaining: $${remaining.toLocaleString()}`;
//         setNonMonetaryErrors(newErrors);
//         return;
//       }

//       if (index > 0) {
//         const previousVal = newPrizes[index - 1].prize_value === '' ? 0 : parseInt(newPrizes[index - 1].prize_value);
//         if (!isNaN(previousVal) && numValue > previousVal) {
//           newErrors[`${rank}_value`] = `Must be ≤ Rank ${rank - 1} ($${previousVal.toLocaleString()})`;
//           setNonMonetaryErrors(newErrors);
//           return;
//         }
//       }

//       if (index < newPrizes.length - 1) {
//         const nextVal = newPrizes[index + 1].prize_value === '' ? 0 : parseInt(newPrizes[index + 1].prize_value);
//         if (!isNaN(nextVal) && nextVal > 0 && numValue < nextVal) {
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

//   return (
//     <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//       !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//     }`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//           <FaGift className="text-yellow-600" />
//           Gamification Feature
//         </h3>
//         <label className={`relative inline-flex items-center ${
//           eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//         }`}>
//           <input
//             type="checkbox"
//             checked={data.lottery_enabled || false}
//             onChange={(e) => {
//               if (eligibility?.canCreatePaidElections) {
//                 updateData({ lottery_enabled: e.target.checked });
//               }
//             }}
//             disabled={!eligibility?.canCreatePaidElections}
//             className="sr-only peer"
//           />
//           <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//         </label>
//       </div>

//       {!eligibility?.canCreatePaidElections && (
//         <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//           <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//             <FaInfoCircle />
//             ⚠️ Upgrade your plan to enable Gamification Feature
//           </p>
//         </div>
//       )}

//       <p className="text-gray-700 mb-4 font-medium">
//         {data.lottery_enabled
//           ? '🎉 Gamify this election with prizes for voters'
//           : 'Add excitement by making this election a gamify with prizes'}
//       </p>

//       {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//         <div className="space-y-6">
//           {/* Creator Funded Badge */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
//               <FaCheckCircle className="text-green-600 text-2xl" />
//               <div>
//                 <h4 className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</h4>
//                 <p className="text-sm text-gray-600">You or your sponsor will provide the prizes for winners</p>
//               </div>
//             </div>
//           </div>

//           {/* Prize Type Selection */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//             <div className="space-y-4">
//               {/* MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'monetary'
//                   ? 'border-green-500 bg-green-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="monetary"
//                     checked={data.lottery_config?.reward_type === 'monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">💵</span>
//                       <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Fixed cash amount with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💰 Total Prize Pool Amount (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.total_prize_pool || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   total_prize_pool: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         placeholder="e.g., 100000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                           errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_prize_pool && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* NON-MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'non_monetary'
//                   ? 'border-purple-500 bg-purple-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="non_monetary"
//                     checked={data.lottery_config?.reward_type === 'non_monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-purple-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">🎁</span>
//                       <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Individual prizes with descriptions and values</p>
//                     <p className="text-xs text-gray-500 italic">e.g., 1st: Dubai tour $3000, 2nd: UK tour $2000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'non_monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💵 Total Estimated Value (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.estimated_value || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   estimated_value: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         placeholder="Total value of all prizes"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                           errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_estimated_value && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* PROJECTED REVENUE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'projected_revenue'
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="projected_revenue"
//                     checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">📈</span>
//                       <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Share of projected content revenue with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 300,000 content generated revenue</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'projected_revenue' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         📊 Projected Content Generated Revenue (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.projected_revenue || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   projected_revenue: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         placeholder="e.g., 300000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                           errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_projected_revenue && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <FaPercent className="inline mr-2" />
//                         Revenue Share Percentage for Winners (%) *
//                       </label>
//                       <input
//                         type="number"
//                         min="0.1"
//                         max="100"
//                         step="0.1"
//                         value={data.lottery_config?.revenue_share_percentage || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 revenue_share_percentage: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseFloat(value);
//                             if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 100) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   revenue_share_percentage: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         placeholder="e.g., 10.5"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                           errors.lottery_revenue_share ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Winners will receive this percentage of the actual generated revenue
//                       </p>
//                       {errors.lottery_revenue_share && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_revenue_share}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {errors.lottery_reward_type && (
//               <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//             )}
//           </div>

//           {/* NUMBER OF WINNERS */}
//           <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//             <div className="flex items-center justify-between mb-3">
//               <label className="block text-sm font-semibold text-gray-700">
//                 <FaTrophy className="inline mr-2 text-yellow-600" />
//                 Number of Winners (1-100) *
//               </label>
//             </div>
            
//             <input
//               type="number"
//               min="1"
//               max="100"
//               step="1"
//               value={data.lottery_config?.winner_count === '' ? '' : data.lottery_config?.winner_count || ''}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (value === '') {
//                   updateData({
//                     lottery_config: {
//                       ...data.lottery_config,
//                       winner_count: ''
//                     }
//                   });
//                 } else {
//                   const numValue = parseInt(value);
//                   if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
//                     updateData({
//                       lottery_config: {
//                         ...data.lottery_config,
//                         winner_count: numValue
//                       }
//                     });
//                   }
//                 }
//               }}
//               onKeyDown={(e) => {
//                 if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
//                   e.preventDefault();
//                 }
//               }}
//               className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                 errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter number between 1 and 100"
//             />
//             <p className="text-xs text-gray-500 mt-2">
//               Specify how many winners will be selected for prizes
//             </p>
//             {errors.lottery_winner_count && (
//               <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//             )}

//             {/* PERCENTAGE DISTRIBUTION DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && 
//              (data.lottery_config?.reward_type === 'monetary' || data.lottery_config?.reward_type === 'projected_revenue') && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaPercent className="text-orange-600" />
//                     Prize Distribution (%)
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Total: {calculateTotalPercentage().toFixed(2)}%
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
//                     }`}>
//                       Remaining: {getRemainingPercentage().toFixed(2)}%
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalPercentage() > 100 && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       Total exceeds 100%! Please adjust percentages.
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {prizeDistribution.map((item, index) => {
//                     const totalPool = getTotalPrizePool();
//                     const currentAmount = (totalPool * (parseFloat(item.percentage) || 0)) / 100;
//                     const remainingAmount = getRemainingAmount(item.rank);
//                     const remainingPercentage = getRemainingPercentage() + (parseFloat(item.percentage) || 0);

//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
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
                          
//                           <div className="text-right min-w-[100px]">
//                             <div className="text-sm font-bold text-green-600">
//                               ${currentAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                             </div>
//                           </div>
//                         </div>
                        
//                         {/* RUNNING BALANCE DISPLAY */}
//                         {/* <div className="ml-28 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
//                           <p className="text-xs text-blue-800 font-semibold">
//                             After Rank {item.rank}: ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} remaining ({remainingPercentage.toFixed(2)}% left)
//                           </p>
//                         </div> */}

//                         {percentageErrors[item.rank] && (
//                           <div className="ml-28 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {percentageErrors[item.rank]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Rank 1 must have highest percentage<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed 100%
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* NON-MONETARY PRIZES DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && data.lottery_config?.reward_type === 'non_monetary' && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaGift className="text-purple-600" />
//                     Individual Prize Details
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Max: ${(parseFloat(data.lottery_config?.estimated_value) || 0).toLocaleString()}
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       (parseFloat(data.lottery_config?.estimated_value) || 0) - calculateTotalNonMonetaryValue() >= 0
//                         ? 'text-green-600' 
//                         : 'text-red-600'
//                     }`}>
//                       Remaining: ${Math.max(0, (parseFloat(data.lottery_config?.estimated_value) || 0) - calculateTotalNonMonetaryValue()).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalNonMonetaryValue() > (parseFloat(data.lottery_config?.estimated_value) || 0) && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       Total prize value exceeds estimated value! Please adjust.
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {nonMonetaryPrizes.map((item, index) => {
//                     const remainingValue = getRemainingNonMonetaryValue(item.rank);

//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="p-3 bg-white rounded-lg border border-purple-200">
//                           <div className="flex items-center gap-2 mb-2">
//                             <FaTrophy className={`${
//                               index === 0 ? 'text-yellow-500' :
//                               index === 1 ? 'text-gray-400' :
//                               index === 2 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             <span className="font-bold text-gray-700">
//                               {index === 0 ? '🥇 1st Winner' :
//                                index === 1 ? '🥈 2nd Winner' :
//                                index === 2 ? '🥉 3rd Winner' :
//                                `🏅 ${item.rank}th Winner`}
//                             </span>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Description *
//                               </label>
//                               <input
//                                 type="text"
//                                 value={item.prize_description || ''}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_description', e.target.value)}
//                                 placeholder="e.g., Dubai tour package with 5-star hotel"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_description`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>

//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Value (USD) *
//                               </label>
//                               <input
//                                 type="number"
//                                 min="0"
//                                 step="1"
//                                 value={item.prize_value === '' ? '' : item.prize_value}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_value', e.target.value)}
//                                 onKeyDown={(e) => {
//                                   if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                                     e.preventDefault();
//                                   }
//                                 }}
//                                 onPaste={(e) => {
//                                   const pastedText = e.clipboardData.getData('text');
//                                   if (pastedText.includes('-') || pastedText.includes('.') || pastedText.includes('e')) {
//                                     e.preventDefault();
//                                   }
//                                 }}
//                                 placeholder="0"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_value`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>
//                           </div>
//                         </div>

//                         {/* RUNNING BALANCE DISPLAY */}
//                         <div className="ml-8 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
//                           <p className="text-xs text-blue-800 font-semibold">
//                             After Rank {item.rank}: ${remainingValue.toLocaleString()} remaining
//                           </p>
//                         </div>

//                         {(nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]) && (
//                           <div className="ml-8 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Each prize must have a description and value<br />
//                     • Rank 1 must have highest value<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed estimated value
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Prize Pool Summary */}
//           {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//             <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//               <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Prize Distribution Summary
//               </h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Total Prize Pool:</span>
//                   <span className="font-bold text-green-600">
//                     ${data.lottery_config.total_prize_pool.toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Number of Winners:</span>
//                   <span className="font-bold">{data.lottery_config.winner_count}</span>
//                 </div>
                
//                 {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
//                   <div className="mt-3 pt-3 border-t-2 border-green-300">
//                     <p className="font-semibold mb-2">Distribution:</p>
//                     {prizeDistribution.map((item) => {
//                       const amount = (data.lottery_config.total_prize_pool * (item.percentage / 100));
//                       return (
//                         <div key={item.rank} className="flex justify-between text-xs py-1">
//                           <span>
//                             <FaTrophy className={`inline mr-1 ${
//                               item.rank === 1 ? 'text-yellow-500' :
//                               item.rank === 2 ? 'text-gray-400' :
//                               item.rank === 3 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             Rank {item.rank} ({item.percentage}%):
//                           </span>
//                           <span className="font-bold text-green-600">
//                             ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default LotteryConfiguration;
// // src/components/election/Step2Configuration/Step2Configuration-Part3-LotteryFull.jsx
// // Contains: Complete LotteryConfiguration with all 3 prize types
// import React from 'react';
// import {
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaTrophy,
//   FaPercent,
//   FaExclamationTriangle
// } from 'react-icons/fa';

// // ============================================
// // LOTTERY CONFIGURATION COMPONENT - COMPLETE
// // ============================================
// export function LotteryConfiguration({
//   data,
//   updateData,
//   errors,
//   eligibility,
//   prizeDistribution,
//   setPrizeDistribution,
//   nonMonetaryPrizes,
//   setNonMonetaryPrizes,
//   percentageErrors,
//   setPercentageErrors,
//   nonMonetaryErrors,
//   setNonMonetaryErrors
// }) {

//   // ============================================
//   // PERCENTAGE DISTRIBUTION FUNCTIONS (Monetary & Revenue)
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
//   // NON-MONETARY PRIZE FUNCTIONS
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

//       const newTotal = newPrizes.reduce((sum, item) => sum + (parseFloat(item.prize_value) || 0), 0);
//       if (newTotal > totalValue) {
//         const remaining = getRemainingNonMonetaryValue(rank);
//         newErrors[`${rank}_value`] = `Total would exceed $${totalValue.toLocaleString()}. Remaining: $${remaining.toLocaleString()}`;
//         setNonMonetaryErrors(newErrors);
//         return;
//       }

//       if (index > 0) {
//         const previousVal = parseFloat(newPrizes[index - 1].prize_value);
//         if (!isNaN(previousVal) && numValue > previousVal) {
//           newErrors[`${rank}_value`] = `Must be ≤ Rank ${rank - 1} ($${previousVal.toLocaleString()})`;
//           setNonMonetaryErrors(newErrors);
//           return;
//         }
//       }

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

//   return (
//     <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
//       !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
//     }`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//           <FaGift className="text-yellow-600" />
//           Gamification Feature
//         </h3>
//         <label className={`relative inline-flex items-center ${
//           eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
//         }`}>
//           <input
//             type="checkbox"
//             checked={data.lottery_enabled || false}
//             onChange={(e) => {
//               if (eligibility?.canCreatePaidElections) {
//                 updateData({ lottery_enabled: e.target.checked });
//               }
//             }}
//             disabled={!eligibility?.canCreatePaidElections}
//             className="sr-only peer"
//           />
//           <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
//         </label>
//       </div>

//       {!eligibility?.canCreatePaidElections && (
//         <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
//           <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
//             <FaInfoCircle />
//             ⚠️ Upgrade your plan to enable Gamification Feature
//           </p>
//         </div>
//       )}

//       <p className="text-gray-700 mb-4 font-medium">
//         {data.lottery_enabled
//           ? '🎉 Gamify this election with prizes for voters'
//           : 'Add excitement by making this election a gamify with prizes'}
//       </p>

//       {data.lottery_enabled && eligibility?.canCreatePaidElections && (
//         <div className="space-y-6">
//           {/* Creator Funded Badge */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
//               <FaCheckCircle className="text-green-600 text-2xl" />
//               <div>
//                 <h4 className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</h4>
//                 <p className="text-sm text-gray-600">You or your sponsor will provide the prizes for winners</p>
//               </div>
//             </div>
//           </div>

//           {/* Prize Type Selection */}
//           <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//             <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//             <div className="space-y-4">
//               {/* MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'monetary'
//                   ? 'border-green-500 bg-green-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="monetary"
//                     checked={data.lottery_config?.reward_type === 'monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">💵</span>
//                       <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Fixed cash amount with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💰 Total Prize Pool Amount (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.total_prize_pool || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   total_prize_pool: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         placeholder="e.g., 100000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                           errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_prize_pool && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* NON-MONETARY PRIZE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'non_monetary'
//                   ? 'border-purple-500 bg-purple-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="non_monetary"
//                     checked={data.lottery_config?.reward_type === 'non_monetary'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-purple-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">🎁</span>
//                       <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Individual prizes with descriptions and values</p>
//                     <p className="text-xs text-gray-500 italic">e.g., 1st: Dubai tour $3000, 2nd: UK tour $2000</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'non_monetary' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         💵 Total Estimated Value (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.estimated_value || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   estimated_value: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         placeholder="Total value of all prizes"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                           errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_estimated_value && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* PROJECTED REVENUE */}
//               <div className={`p-4 rounded-lg border-2 transition-all ${
//                 data.lottery_config?.reward_type === 'projected_revenue'
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-gray-300'
//               }`}>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="reward_type"
//                     value="projected_revenue"
//                     checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                     onChange={(e) => {
//                       setPrizeDistribution([]);
//                       setNonMonetaryPrizes([]);
//                       updateData({
//                         lottery_config: { 
//                           ...data.lottery_config, 
//                           reward_type: e.target.value, 
//                           prize_funding_source: 'creator_funded',
//                           prize_distribution: [],
//                           non_monetary_prizes: []
//                         }
//                       });
//                     }}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-2xl">📈</span>
//                       <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">Share of projected content revenue with percentage distribution</p>
//                     <p className="text-xs text-gray-500 italic">e.g., USD 300,000 content generated revenue</p>
//                   </div>
//                 </label>

//                 {data.lottery_config?.reward_type === 'projected_revenue' && (
//                   <div className="mt-4 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         📊 Projected Content Generated Revenue (USD) *
//                       </label>
//                       <input
//                         type="number"
//                         min="1"
//                         step="1"
//                         value={data.lottery_config?.projected_revenue || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseInt(value);
//                             if (!isNaN(numValue) && numValue > 0) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   projected_revenue: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+') {
//                             e.preventDefault();
//                           }
//                         }}
//                         placeholder="e.g., 300000"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                           errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.lottery_projected_revenue && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <FaPercent className="inline mr-2" />
//                         Revenue Share Percentage for Winners (%) *
//                       </label>
//                       <input
//                         type="number"
//                         min="0.1"
//                         max="100"
//                         step="0.1"
//                         value={data.lottery_config?.revenue_share_percentage || ''}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           if (value === '') {
//                             updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 revenue_share_percentage: ''
//                               }
//                             });
//                           } else {
//                             const numValue = parseFloat(value);
//                             if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 100) {
//                               updateData({
//                                 lottery_config: {
//                                   ...data.lottery_config,
//                                   revenue_share_percentage: numValue
//                                 }
//                               });
//                             }
//                           }
//                         }}
//                         placeholder="e.g., 10.5"
//                         className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                           errors.lottery_revenue_share ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Winners will receive this percentage of the actual generated revenue
//                       </p>
//                       {errors.lottery_revenue_share && (
//                         <p className="text-red-500 text-sm mt-1">{errors.lottery_revenue_share}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {errors.lottery_reward_type && (
//               <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//             )}
//           </div>

//           {/* NUMBER OF WINNERS */}
//           <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//             <div className="flex items-center justify-between mb-3">
//               <label className="block text-sm font-semibold text-gray-700">
//                 <FaTrophy className="inline mr-2 text-yellow-600" />
//                 Number of Winners (1-100) *
//               </label>
//             </div>
            
//             <input
//               type="number"
//               min="1"
//               max="100"
//               step="1"
//               value={data.lottery_config?.winner_count === '' ? '' : data.lottery_config?.winner_count || ''}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (value === '') {
//                   updateData({
//                     lottery_config: {
//                       ...data.lottery_config,
//                       winner_count: ''
//                     }
//                   });
//                 } else {
//                   const numValue = parseInt(value);
//                   if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
//                     updateData({
//                       lottery_config: {
//                         ...data.lottery_config,
//                         winner_count: numValue
//                       }
//                     });
//                   }
//                 }
//               }}
//               onKeyDown={(e) => {
//                 if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
//                   e.preventDefault();
//                 }
//               }}
//               className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                 errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter number between 1 and 100"
//             />
//             <p className="text-xs text-gray-500 mt-2">
//               Specify how many winners will be selected for prizes
//             </p>
//             {errors.lottery_winner_count && (
//               <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//             )}

//             {/* PERCENTAGE DISTRIBUTION DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && 
//              (data.lottery_config?.reward_type === 'monetary' || data.lottery_config?.reward_type === 'projected_revenue') && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaPercent className="text-orange-600" />
//                     Prize Distribution (%)
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Total: {calculateTotalPercentage().toFixed(2)}%
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       getRemainingPercentage() === 0 ? 'text-green-600' : 'text-orange-600'
//                     }`}>
//                       Remaining: {getRemainingPercentage().toFixed(2)}%
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalPercentage() > 100 && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       Total exceeds 100%! Please adjust percentages.
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {prizeDistribution.map((item, index) => {
//                     const totalPool = getTotalPrizePool();
//                     const currentAmount = (totalPool * (parseFloat(item.percentage) || 0)) / 100;
//                     const remainingAmount = getRemainingAmount(item.rank);
//                     const remainingPercentage = getRemainingPercentage() + (parseFloat(item.percentage) || 0);

//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
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
                          
//                           <div className="text-right min-w-[100px]">
//                             <div className="text-sm font-bold text-green-600">
//                               ${currentAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
//                             </div>
//                           </div>
//                         </div>
                        
//                         {/* RUNNING BALANCE DISPLAY */}
//                         <div className="ml-28 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
//                           <p className="text-xs text-blue-800 font-semibold">
//                             After Rank {item.rank}: ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} remaining ({remainingPercentage.toFixed(2)}% left)
//                           </p>
//                         </div>

//                         {percentageErrors[item.rank] && (
//                           <div className="ml-28 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {percentageErrors[item.rank]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Rank 1 must have highest percentage<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed 100%
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* NON-MONETARY PRIZES DISPLAY */}
//             {data.lottery_config?.winner_count > 0 && data.lottery_config?.reward_type === 'non_monetary' && (
//               <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <h5 className="font-bold text-gray-900 flex items-center gap-2">
//                     <FaGift className="text-purple-600" />
//                     Individual Prize Details
//                   </h5>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-gray-700">
//                       Total: ${calculateTotalNonMonetaryValue().toLocaleString()}
//                     </p>
//                     <p className={`text-xs font-bold ${
//                       calculateTotalNonMonetaryValue() <= (parseFloat(data.lottery_config?.estimated_value) || 0) 
//                         ? 'text-green-600' 
//                         : 'text-red-600'
//                     }`}>
//                       Max: ${(parseFloat(data.lottery_config?.estimated_value) || 0).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {calculateTotalNonMonetaryValue() > (parseFloat(data.lottery_config?.estimated_value) || 0) && (
//                   <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded-lg flex items-center gap-2">
//                     <FaExclamationTriangle className="text-red-600" />
//                     <p className="text-sm text-red-700 font-semibold">
//                       Total prize value exceeds estimated value! Please adjust.
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {nonMonetaryPrizes.map((item, index) => {
//                     const remainingValue = getRemainingNonMonetaryValue(item.rank);

//                     return (
//                       <div key={item.rank} className="space-y-1">
//                         <div className="p-3 bg-white rounded-lg border border-purple-200">
//                           <div className="flex items-center gap-2 mb-2">
//                             <FaTrophy className={`${
//                               index === 0 ? 'text-yellow-500' :
//                               index === 1 ? 'text-gray-400' :
//                               index === 2 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             <span className="font-bold text-gray-700">
//                               {index === 0 ? '🥇 1st Winner' :
//                                index === 1 ? '🥈 2nd Winner' :
//                                index === 2 ? '🥉 3rd Winner' :
//                                `🏅 ${item.rank}th Winner`}
//                             </span>
//                           </div>
                          
//                           <div className="space-y-2">
//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Description *
//                               </label>
//                               <input
//                                 type="text"
//                                 value={item.prize_description || ''}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_description', e.target.value)}
//                                 placeholder="e.g., Dubai tour package with 5-star hotel"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_description`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>

//                             <div>
//                               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                                 Prize Value (USD) *
//                               </label>
//                               <input
//                                 type="number"
//                                 min="0"
//                                 step="1"
//                                 value={item.prize_value === '' ? '' : item.prize_value}
//                                 onChange={(e) => handleNonMonetaryPrizeChange(item.rank, 'prize_value', e.target.value)}
//                                 onKeyDown={(e) => {
//                                   if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') {
//                                     e.preventDefault();
//                                   }
//                                 }}
//                                 placeholder="0"
//                                 className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                                   nonMonetaryErrors[`${item.rank}_value`] ? 'border-red-500' : 'border-gray-300'
//                                 }`}
//                               />
//                             </div>
//                           </div>
//                         </div>

//                         {/* RUNNING BALANCE DISPLAY */}
//                         <div className="ml-8 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
//                           <p className="text-xs text-blue-800 font-semibold">
//                             After Rank {item.rank}: ${remainingValue.toLocaleString()} remaining
//                           </p>
//                         </div>

//                         {(nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]) && (
//                           <div className="ml-8 p-2 bg-red-50 border-l-4 border-red-500 rounded">
//                             <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
//                               <FaExclamationTriangle className="text-red-600" />
//                               {nonMonetaryErrors[`${item.rank}_description`] || nonMonetaryErrors[`${item.rank}_value`]}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {errors.prize_distribution && (
//                   <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
//                     <FaInfoCircle /> {errors.prize_distribution}
//                   </p>
//                 )}

//                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-xs text-blue-800">
//                     <strong>Rules:</strong><br />
//                     • Each prize must have a description and value<br />
//                     • Rank 1 must have highest value<br />
//                     • Each rank must be ≤ previous rank (descending order)<br />
//                     • Total cannot exceed estimated value
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Prize Pool Summary */}
//           {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//             <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//               <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Prize Distribution Summary
//               </h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Total Prize Pool:</span>
//                   <span className="font-bold text-green-600">
//                     ${data.lottery_config.total_prize_pool.toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Number of Winners:</span>
//                   <span className="font-bold">{data.lottery_config.winner_count}</span>
//                 </div>
                
//                 {prizeDistribution.length > 0 && calculateTotalPercentage() > 0 && (
//                   <div className="mt-3 pt-3 border-t-2 border-green-300">
//                     <p className="font-semibold mb-2">Distribution:</p>
//                     {prizeDistribution.map((item) => {
//                       const amount = (data.lottery_config.total_prize_pool * (item.percentage / 100));
//                       return (
//                         <div key={item.rank} className="flex justify-between text-xs py-1">
//                           <span>
//                             <FaTrophy className={`inline mr-1 ${
//                               item.rank === 1 ? 'text-yellow-500' :
//                               item.rank === 2 ? 'text-gray-400' :
//                               item.rank === 3 ? 'text-orange-600' :
//                               'text-gray-300'
//                             }`} />
//                             Rank {item.rank} ({item.percentage}%):
//                           </span>
//                           <span className="font-bold text-green-600">
//                             ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default LotteryConfiguration;