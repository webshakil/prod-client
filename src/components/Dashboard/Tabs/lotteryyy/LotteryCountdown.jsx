// src/components/Dashboard/Tabs/lotteryyy/LotteryCountdown.jsx
// ✨ Countdown to lottery draw
import React, { useEffect, useState } from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function LotteryCountdown({ electionId }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEnded, setIsEnded] = useState(false);

  // Get election end time from Redux or props
  const election = useSelector(state => 
    state.election.myElections?.find(e => e.id === electionId)
  );

  useEffect(() => {
    if (!election) return;

    const calculateTimeLeft = () => {
      // Combine end_date and end_time
      const endDateTime = `${election.end_date}T${election.end_time || '23:59:59'}`;
      const endTime = new Date(endDateTime).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setIsEnded(true);
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [election]);

  if (!election || isEnded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center"
      >
        <Clock className="w-12 h-12 mx-auto mb-3" />
        <p className="text-2xl font-bold mb-2">Election Ended</p>
        <p className="text-sm opacity-90">Lottery draw in progress...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-black bg-opacity-20 px-6 py-4 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-white" />
        <div>
          <p className="text-white text-sm font-semibold opacity-90">Lottery Draw Countdown</p>
          <p className="text-white text-xs opacity-75">
            Ends: {new Date(`${election.end_date}T${election.end_time || '23:59:59'}`).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Countdown Display */}
      <div className="p-8">
        <div className="grid grid-cols-4 gap-4">
          {/* Days */}
          <div className="text-center">
            <motion.div
              key={timeLeft.days}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 mb-2"
            >
              <p className="text-4xl md:text-5xl font-black text-white">
                {timeLeft.days.toString().padStart(2, '0')}
              </p>
            </motion.div>
            <p className="text-white text-xs md:text-sm font-semibold opacity-90">DAYS</p>
          </div>

          {/* Hours */}
          <div className="text-center">
            <motion.div
              key={timeLeft.hours}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 mb-2"
            >
              <p className="text-4xl md:text-5xl font-black text-white">
                {timeLeft.hours.toString().padStart(2, '0')}
              </p>
            </motion.div>
            <p className="text-white text-xs md:text-sm font-semibold opacity-90">HOURS</p>
          </div>

          {/* Minutes */}
          <div className="text-center">
            <motion.div
              key={timeLeft.minutes}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 mb-2"
            >
              <p className="text-4xl md:text-5xl font-black text-white">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </p>
            </motion.div>
            <p className="text-white text-xs md:text-sm font-semibold opacity-90">MINUTES</p>
          </div>

          {/* Seconds */}
          <div className="text-center">
            <motion.div
              key={timeLeft.seconds}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 mb-2"
            >
              <p className="text-4xl md:text-5xl font-black text-white">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </p>
            </motion.div>
            <p className="text-white text-xs md:text-sm font-semibold opacity-90">SECONDS</p>
          </div>
        </div>

        {/* Urgency Message */}
        {timeLeft.days === 0 && timeLeft.hours < 24 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-yellow-400 text-yellow-900 rounded-xl p-4 text-center font-bold"
          >
            ⏰ Less than 24 hours left! Vote now to enter the lottery!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}