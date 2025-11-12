// src/components/Dashboard/Tabs/lotteryyy/ParticipantCounter.jsx
// ✨ Live Participant Counter with Animation
import React, { useEffect, useState } from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';
import CountUp from 'react-countup';

export default function ParticipantCounter({ 
  currentCount = 0,
  targetCount = 0,
  isLive = true,
}) {
  const [previousCount, setPreviousCount] = useState(currentCount);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (currentCount > previousCount) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 1000);
    }
    setPreviousCount(currentCount);
  }, [currentCount, previousCount]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>

        {/* Live Indicator */}
        {isLive && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400"></div>
            <span className="text-white text-xs font-semibold uppercase">LIVE</span>
          </div>
        )}

        <div className="relative z-10">
          {/* Icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold opacity-90">
                {isLive ? 'Live Participants' : 'Total Participants'}
              </p>
              <p className="text-cyan-200 text-xs">
                Gamify tickets issued
              </p>
            </div>
          </div>

          {/* Counter */}
          <div className="flex items-end gap-4">
            <motion.div
              animate={showPulse ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="text-6xl md:text-7xl font-black text-white"
            >
              <CountUp
                start={previousCount}
                end={currentCount}
                duration={1}
                separator=","
              />
            </motion.div>

            {/* Growth Indicator */}
            {currentCount > previousCount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-green-300 mb-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-bold">
                  +{currentCount - previousCount}
                </span>
              </motion.div>
            )}
          </div>

          {/* Progress Bar (if target exists) */}
          {targetCount > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-white text-xs mb-2">
                <span>Progress</span>
                <span>{Math.round((currentCount / targetCount) * 100)}%</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentCount / targetCount) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Decorative Element */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full opacity-10 blur-3xl"></div>
      </div>
    </motion.div>
  );
}