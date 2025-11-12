import React, { useEffect, useState } from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, Trophy } from 'lucide-react';
import CountUp from 'react-countup';

export default function LotteryPrizeDisplay({ 
  totalPrizePool = 0,
  participantCount = 0,
  winnerCount = 0,
  rewardType = 'monetary',
  prizeDescription = '',
  estimatedValue = 0,
  projectedRevenue = 0,
  revenueSharePercentage = 0,
  prizeDistribution = [],
}) {
  const [previousPrizePool, setPreviousPrizePool] = useState(totalPrizePool);

  useEffect(() => {
    setPreviousPrizePool(totalPrizePool);
  }, [totalPrizePool]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPrizeTypeDisplay = () => {
    switch (rewardType) {
      case 'monetary':
        return {
          icon: <DollarSign className="w-8 h-8" />,
          label: 'Total Prize Pool',
          value: formatCurrency(totalPrizePool),
          gradient: 'from-green-500 to-emerald-600',
        };
      case 'non_monetary':
        return {
          icon: <Trophy className="w-8 h-8" />,
          label: prizeDescription || 'Prize',
          value: estimatedValue > 0 ? `Est. ${formatCurrency(estimatedValue)}` : 'Special Prize',
          gradient: 'from-purple-500 to-pink-600',
        };
      case 'projected_revenue':
        return {
          icon: <TrendingUp className="w-8 h-8" />,
          label: `${revenueSharePercentage}% Revenue Share`,
          value: projectedRevenue > 0 ? formatCurrency(projectedRevenue) : 'TBD',
          gradient: 'from-blue-500 to-indigo-600',
        };
      default:
        return {
          icon: <DollarSign className="w-8 h-8" />,
          label: 'Prize Pool',
          value: formatCurrency(totalPrizePool),
          gradient: 'from-yellow-500 to-orange-600',
        };
    }
  };

  const prizeDisplay = getPrizeTypeDisplay();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Main Prize Pool Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`bg-gradient-to-br ${prizeDisplay.gradient} rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>

        <div className="relative z-10">
          {/* Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              {prizeDisplay.icon}
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Trophy className="w-6 h-6 opacity-30" />
            </motion.div>
          </div>

          {/* Label */}
          <p className="text-sm font-semibold opacity-90 mb-2">
            {prizeDisplay.label}
          </p>

          {/* Amount */}
          <div className="text-4xl font-black mb-2">
            {rewardType === 'monetary' || rewardType === 'projected_revenue' ? (
              <CountUp
                start={previousPrizePool}
                end={totalPrizePool}
                duration={2}
                separator=","
                prefix="$"
                decimals={0}
              />
            ) : (
              prizeDisplay.value
            )}
          </div>

          {/* Subtext */}
          {rewardType === 'non_monetary' && prizeDescription && (
            <p className="text-xs opacity-75 line-clamp-2">
              {prizeDescription}
            </p>
          )}
        </div>

        {/* Glow Effect */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full opacity-10 blur-3xl"></div>
      </motion.div>

      {/* Participants Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          {/* Icon */}
          <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm w-fit mb-4">
            <Users className="w-8 h-8" />
          </div>

          {/* Label */}
          <p className="text-sm font-semibold opacity-90 mb-2">
            Total Participants
          </p>

          {/* Count */}
          <div className="text-4xl font-black mb-1">
            <CountUp
              end={participantCount}
              duration={1.5}
              separator=","
            />
          </div>

          <p className="text-xs opacity-75">
            Active lottery tickets
          </p>
        </div>

        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full opacity-10 blur-3xl"></div>
      </motion.div>

      {/* Winners Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          {/* Icon */}
          <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm w-fit mb-4">
            <Trophy className="w-8 h-8" />
          </div>

          {/* Label */}
          <p className="text-sm font-semibold opacity-90 mb-2">
            Total Winners
          </p>

          {/* Count */}
          <div className="text-4xl font-black mb-1">
            {winnerCount}
          </div>

          <p className="text-xs opacity-75">
            Lucky winners selected
          </p>
        </div>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full opacity-10 blur-3xl"></div>
      </motion.div>

      {/* Prize Distribution Table */}
      {prizeDistribution && prizeDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Prize Distribution
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rank</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Percentage</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {prizeDistribution.map((prize, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {prize.rank === 1 && '🥇'}
                        {prize.rank === 2 && '🥈'}
                        {prize.rank === 3 && '🥉'}
                        {prize.rank > 3 && '🏅'}
                        <span className="font-semibold text-gray-800">
                          {prize.rank === 1 ? '1st Place' : prize.rank === 2 ? '2nd Place' : prize.rank === 3 ? '3rd Place' : `${prize.rank}th Place`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-blue-600 font-semibold">
                        {prize.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-600 font-bold">
                        {formatCurrency(prize.amount)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}