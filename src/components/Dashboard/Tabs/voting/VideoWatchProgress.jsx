import React, { useState, useRef, useEffect } from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useUpdateWatchProgressMutation, useGetVideoProgressQuery } from '../../../../redux/api/voting/videoWatchApi';
import { setVideoProgress } from '../../../../redux/slices/votingSlice';

export default function VideoWatchProgress({ 
  electionId,
  videoUrl,
  minimumWatchPercentage = 80,
  onComplete = null,
  required = false,
}) {
  const dispatch = useDispatch();
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const lastTimeRef = useRef(0);
  const totalWatchedRef = useRef(0);
  const playerInstanceRef = useRef(null);
  
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchPercentage, setWatchPercentage] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [updateProgress, { isLoading: isUpdating }] = useUpdateWatchProgressMutation();
  const { data: existingProgress, isLoading: progressLoading } = useGetVideoProgressQuery(electionId);

  // Extract YouTube video ID
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  // Check existing progress
  useEffect(() => {
    if (progressLoading) {
      console.log('📹 Loading existing progress...');
      return;
    }
    
    console.log('📹 Existing progress data:', existingProgress);
    
    if (existingProgress?.completed) {
      console.log('✅ Video already completed');
      setCompleted(true);
      setWatchPercentage(100);
      setLoading(false);
      
      if (onComplete) {
        setTimeout(() => onComplete(), 500);
      }
      return;
    }
    
    if (existingProgress?.watch_percentage > 0) {
      const savedPercentage = parseFloat(existingProgress.watch_percentage);
      setWatchPercentage(savedPercentage);
      totalWatchedRef.current = (savedPercentage / 100) * (existingProgress.total_duration || 0);
      console.log('📹 Resuming from:', savedPercentage + '%', 'Total watched:', totalWatchedRef.current);
    } else {
      console.log('📹 Starting fresh - no previous progress');
    }
    
    setLoading(false);
  }, [existingProgress, progressLoading, onComplete]);

  // Initialize YouTube player
  useEffect(() => {
    if (!videoId || completed || loading) return;

    const initPlayer = () => {
      if (!playerRef.current) return;

      try {
        const ytPlayer = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            controls: 1,
            disablekb: 1,
            fs: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              playerInstanceRef.current = event.target;
              setIsReady(true);
              const videoDuration = event.target.getDuration();
              setDuration(videoDuration);
              console.log('📹 Player ready, duration:', videoDuration);
              
              if (existingProgress?.last_position > 0) {
                console.log('📹 Seeking to last position:', existingProgress.last_position);
                event.target.seekTo(existingProgress.last_position, true);
                lastTimeRef.current = existingProgress.last_position;
              }
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                console.log('▶️ Video playing');
                startTracking();
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                console.log('⏸️ Video paused');
              }
            },
          },
        });
      } catch (error) {
        console.error('❌ Player init error:', error);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
      
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTracking();
      stopPeriodicSave();
      if (playerInstanceRef.current?.destroy) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          console.log('Player cleanup error:', e);
        }
      }
    };
  }, [videoId, completed, loading, existingProgress]);

  const startTracking = () => {
    if (intervalRef.current) return;

    console.log('🎬 Starting video tracking');

    intervalRef.current = setInterval(() => {
      const player = playerInstanceRef.current;
      if (!player || !player.getDuration) return;

      try {
        const current = player.getCurrentTime();
        const total = player.getDuration();

        if (!total || isNaN(total) || !current) return;

        // Prevent seeking forward
        if (current > lastTimeRef.current + 2) {
          console.log('⚠️ Seeking detected, reverting');
          player.seekTo(lastTimeRef.current, true);
          return;
        }

        // Prevent rewinding
        if (current < lastTimeRef.current - 2) {
          console.log('⚠️ Rewinding detected, reverting');
          player.seekTo(lastTimeRef.current, true);
          return;
        }

        // Update watched time
        if (current > lastTimeRef.current) {
          totalWatchedRef.current += (current - lastTimeRef.current);
          lastTimeRef.current = current;
        }

        setCurrentTime(current);
        
        const percentage = Math.min((totalWatchedRef.current / total) * 100, 100);
        setWatchPercentage(percentage);

        console.log('📊 Current progress:', {
          current: current.toFixed(2),
          totalWatched: totalWatchedRef.current.toFixed(2),
          percentage: percentage.toFixed(2)
        });

        // Check completion
        if (percentage >= minimumWatchPercentage && !completed) {
          console.log('✅ Video watch requirement met!');
          setCompleted(true);

          updateProgress({
            electionId,
            watchPercentage: Math.round(percentage),
            lastPosition: Math.round(current),
            totalDuration: Math.round(total),
            completed: true,
          }).unwrap()
            .then((response) => {
              console.log('✅ Completion saved to backend:', response);
            })
            .catch((error) => {
              console.error('❌ Failed to save completion:', error);
            });

          dispatch(setVideoProgress({
            watchPercentage: Math.round(percentage),
            lastPosition: Math.round(current),
            totalDuration: Math.round(total),
            completed: true,
          }));

          if (onComplete) {
            onComplete();
          }

          stopTracking();
          stopPeriodicSave();
        }
      } catch (error) {
        console.error('❌ Tracking error:', error);
      }
    }, 1000);

    // ✅ START PERIODIC SAVES when tracking starts
    startPeriodicSave();
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      console.log('⏹️ Stopping video tracking');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // ✅ PERIODIC SAVE FUNCTION
  const startPeriodicSave = () => {
    if (saveIntervalRef.current || completed) return;

    console.log('📡 Starting periodic saves (every 10% milestone)');
    
    let lastSavedPercentage = 0;

    saveIntervalRef.current = setInterval(() => {
      if (!duration || duration === 0) return;

      const currentPercentage = Math.min((totalWatchedRef.current / duration) * 100, 100);
      
      // ✅ Save every 10% milestone
      if (Math.floor(currentPercentage / 10) > Math.floor(lastSavedPercentage / 10)) {
        const progressData = {
          electionId,
          watchPercentage: Math.round(currentPercentage),
          lastPosition: Math.round(lastTimeRef.current),
          totalDuration: Math.round(duration),
          completed: false,
        };

        console.log('💾 Saving milestone:', progressData);

        updateProgress(progressData)
          .unwrap()
          .then((response) => {
            console.log('✅ Milestone saved:', response);
            lastSavedPercentage = currentPercentage;
          })
          .catch((error) => {
            console.error('❌ Failed to save milestone:', error);
          });
      }
    }, 3000); // Check every 3 seconds
  };

  const stopPeriodicSave = () => {
    if (saveIntervalRef.current) {
      console.log('🛑 Stopping periodic saves');
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
        <p className="text-gray-600">Loading video...</p>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-800 font-semibold">Invalid video URL</p>
      </div>
    );
  }

  if (completed && !isReady) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-900 mb-2">✓ Video Already Completed!</h3>
        <p className="text-green-700 mb-6">You can proceed to vote.</p>
        <button
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
        >
          Continue to Voting →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ paddingTop: '56.25%' }}>
        <div ref={playerRef} className="absolute top-0 left-0 w-full h-full" />
        
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Loader className="animate-spin text-white" size={48} />
          </div>
        )}

        {completed && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
            <CheckCircle size={20} />
            Completed!
          </div>
        )}

        {isUpdating && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
            <Loader className="animate-spin" size={14} />
            Saving...
          </div>
        )}
      </div>

      <div className={`rounded-2xl p-6 ${completed ? 'bg-green-50 border-2 border-green-500' : 'bg-blue-50 border-2 border-blue-300'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {completed ? <CheckCircle className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-blue-600" />}
            <div>
              <h3 className={`font-bold text-lg ${completed ? 'text-green-900' : 'text-blue-900'}`}>
                {completed ? '✓ Video Watch Complete!' : 'Video Watch Required'}
              </h3>
              <p className={`text-sm ${completed ? 'text-green-700' : 'text-blue-700'}`}>
                Watch at least {minimumWatchPercentage}% to proceed
              </p>
            </div>
          </div>
          <div className={`text-3xl font-black ${completed ? 'text-green-600' : 'text-blue-600'}`}>
            {Math.round(watchPercentage)}%
          </div>
        </div>

        <div className="bg-white rounded-full h-4 overflow-hidden">
          <motion.div
            animate={{ width: `${Math.min(watchPercentage, 100)}%` }}
            className={`h-full ${completed ? 'bg-green-500' : 'bg-blue-500'}`}
          />
        </div>

        <div className="flex justify-between mt-3 text-sm">
          <span>Watched: {formatTime(totalWatchedRef.current)} / {formatTime(duration)}</span>
          <span>{Math.max(0, Math.round(minimumWatchPercentage - watchPercentage))}% remaining</span>
        </div>

        {completed && (
          <div className="mt-4 text-center">
            <button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
            >
              Continue to Voting →
            </button>
          </div>
        )}
      </div>

      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <p className="text-red-800 text-xs font-semibold">
          ⚠️ You cannot skip forward. Watch {minimumWatchPercentage}% to proceed. Once completed, you won't need to watch again.
        </p>
      </div>
    </div>
  );
}
//last workbale code
// import React, { useState, useRef, useEffect } from 'react';
// /*eslint-disable*/
// import { motion } from 'framer-motion';
// import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
// import { useDispatch } from 'react-redux';
// import { useUpdateWatchProgressMutation, useGetVideoProgressQuery } from '../../../../redux/api/voting/videoWatchApi';
// import { setVideoProgress } from '../../../../redux/slices/votingSlice';

// export default function VideoWatchProgress({ 
//   electionId,
//   videoUrl,
//   minimumWatchPercentage = 80,
//   onComplete = null,
//   required = false,
// }) {
//   const dispatch = useDispatch();
//   const playerRef = useRef(null);
//   const intervalRef = useRef(null);
//   const lastTimeRef = useRef(0);
//   const totalWatchedRef = useRef(0);
//   const playerInstanceRef = useRef(null);
  
//   const [isReady, setIsReady] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [watchPercentage, setWatchPercentage] = useState(0);
//   const [completed, setCompleted] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const [updateProgress] = useUpdateWatchProgressMutation();
//   const { data: existingProgress, isLoading: progressLoading } = useGetVideoProgressQuery(electionId);

//   // Extract YouTube video ID
//   const getYouTubeVideoId = (url) => {
//     if (!url) return null;
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
//     return (match && match[2].length === 11) ? match[2] : null;
//   };

//   const videoId = getYouTubeVideoId(videoUrl);

//   // Check existing progress
//   useEffect(() => {
//     if (progressLoading) return;
    
//     if (existingProgress?.completed) {
//       console.log('✅ Video already completed');
//       setCompleted(true);
//       setWatchPercentage(100);
//       setLoading(false);
      
//       if (onComplete) {
//         setTimeout(() => onComplete(), 500);
//       }
//       return;
//     }
    
//     if (existingProgress?.watch_percentage > 0) {
//       const savedPercentage = existingProgress.watch_percentage;
//       setWatchPercentage(savedPercentage);
//       totalWatchedRef.current = (savedPercentage / 100) * (existingProgress.total_duration || 0);
//       console.log('📹 Resuming from:', savedPercentage + '%');
//     }
    
//     setLoading(false);
//   }, [existingProgress, progressLoading, onComplete]);

//   // Initialize YouTube player
//   useEffect(() => {
//     if (!videoId || completed || loading) return;

//     const initPlayer = () => {
//       if (!playerRef.current) return;

//       try {
//         const ytPlayer = new window.YT.Player(playerRef.current, {
//           videoId: videoId,
//           width: '100%',
//           height: '100%',
//           playerVars: {
//             controls: 1,
//             disablekb: 1,
//             fs: 1,
//             modestbranding: 1,
//             rel: 0,
//             playsinline: 1,
//           },
//           events: {
//             onReady: (event) => {
//               playerInstanceRef.current = event.target;
//               setIsReady(true);
//               setDuration(event.target.getDuration());
//               console.log('📹 Player ready, duration:', event.target.getDuration());
//             },
//             onStateChange: (event) => {
//               if (event.data === window.YT.PlayerState.PLAYING) {
//                 startTracking();
//               }
//             },
//           },
//         });
//       } catch (error) {
//         console.error('Player init error:', error);
//       }
//     };

//     if (window.YT && window.YT.Player) {
//       initPlayer();
//     } else {
//       const tag = document.createElement('script');
//       tag.src = 'https://www.youtube.com/iframe_api';
//       const firstScript = document.getElementsByTagName('script')[0];
//       firstScript.parentNode.insertBefore(tag, firstScript);
      
//       window.onYouTubeIframeAPIReady = initPlayer;
//     }

//     return () => {
//       stopTracking();
//       if (playerInstanceRef.current?.destroy) {
//         try {
//           playerInstanceRef.current.destroy();
//         } catch (e) {
//           console.log('Player cleanup error:', e);
//         }
//       }
//     };
//   }, [videoId, completed, loading]);

//   const startTracking = () => {
//     if (intervalRef.current) return;

//     intervalRef.current = setInterval(() => {
//       const player = playerInstanceRef.current;
//       if (!player || !player.getDuration) return;

//       try {
//         const current = player.getCurrentTime();
//         const total = player.getDuration();

//         if (!total || isNaN(total) || !current) return;

//         // Prevent seeking forward
//         if (current > lastTimeRef.current + 2) {
//           console.log('⚠️ Seeking detected, reverting');
//           player.seekTo(lastTimeRef.current, true);
//           return;
//         }

//         // Prevent rewinding
//         if (current < lastTimeRef.current - 2) {
//           console.log('⚠️ Rewinding detected, reverting');
//           player.seekTo(lastTimeRef.current, true);
//           return;
//         }

//         // Update watched time
//         if (current > lastTimeRef.current) {
//           totalWatchedRef.current += (current - lastTimeRef.current);
//           lastTimeRef.current = current;
//         }

//         setCurrentTime(current);
        
//         const percentage = Math.min((totalWatchedRef.current / total) * 100, 100);
//         setWatchPercentage(percentage);

//         // Check completion
//         if (percentage >= minimumWatchPercentage && !completed) {
//           console.log('✅ Video completed!');
//           setCompleted(true);

//           updateProgress({
//             electionId,
//             watchPercentage: Math.round(percentage),
//             lastPosition: Math.round(current),
//             totalDuration: Math.round(total),
//             completed: true,
//           });

//           dispatch(setVideoProgress({
//             watchPercentage: Math.round(percentage),
//             lastPosition: Math.round(current),
//             totalDuration: Math.round(total),
//             completed: true,
//           }));

//           if (onComplete) {
//             onComplete();
//           }

//           stopTracking();
//         }
//       } catch (error) {
//         console.error('Tracking error:', error);
//       }
//     }, 1000);
//   };

//   const stopTracking = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   };

//   // Periodic backend updates
//   useEffect(() => {
//     if (!electionId || duration === 0 || completed) return;

//     const saveInterval = setInterval(() => {
//       updateProgress({
//         electionId,
//         watchPercentage: Math.round(watchPercentage),
//         lastPosition: Math.round(currentTime),
//         totalDuration: Math.round(duration),
//         completed: false,
//       });
//     }, 5000);

//     return () => clearInterval(saveInterval);
//   }, [electionId, watchPercentage, currentTime, duration, completed]);

//   const formatTime = (seconds) => {
//     if (!seconds || isNaN(seconds)) return '0:00';
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   if (loading) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
//         <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//         <p className="text-gray-600">Loading video...</p>
//       </div>
//     );
//   }

//   if (!videoId) {
//     return (
//       <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
//         <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//         <p className="text-red-800 font-semibold">Invalid video URL</p>
//       </div>
//     );
//   }

//   if (completed && !isReady) {
//     return (
//       <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center">
//         <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
//         <h3 className="text-2xl font-bold text-green-900 mb-2">✓ Video Already Completed!</h3>
//         <p className="text-green-700 mb-6">You can proceed to vote.</p>
//         <button
//           onClick={onComplete}
//           className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
//         >
//           Continue to Voting →
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ paddingTop: '56.25%' }}>
//         <div ref={playerRef} className="absolute top-0 left-0 w-full h-full" />
        
//         {!isReady && (
//           <div className="absolute inset-0 flex items-center justify-center bg-black">
//             <Loader className="animate-spin text-white" size={48} />
//           </div>
//         )}

//         {completed && (
//           <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
//             <CheckCircle size={20} />
//             Completed!
//           </div>
//         )}
//       </div>

//       <div className={`rounded-2xl p-6 ${completed ? 'bg-green-50 border-2 border-green-500' : 'bg-blue-50 border-2 border-blue-300'}`}>
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-3">
//             {completed ? <CheckCircle className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-blue-600" />}
//             <div>
//               <h3 className={`font-bold text-lg ${completed ? 'text-green-900' : 'text-blue-900'}`}>
//                 {completed ? '✓ Video Watch Complete!' : 'Video Watch Required'}
//               </h3>
//               <p className={`text-sm ${completed ? 'text-green-700' : 'text-blue-700'}`}>
//                 Watch at least {minimumWatchPercentage}% to proceed
//               </p>
//             </div>
//           </div>
//           <div className={`text-3xl font-black ${completed ? 'text-green-600' : 'text-blue-600'}`}>
//             {Math.round(watchPercentage)}%
//           </div>
//         </div>

//         <div className="bg-white rounded-full h-4 overflow-hidden">
//           <motion.div
//             animate={{ width: `${Math.min(watchPercentage, 100)}%` }}
//             className={`h-full ${completed ? 'bg-green-500' : 'bg-blue-500'}`}
//           />
//         </div>

//         <div className="flex justify-between mt-3 text-sm">
//           <span>Watched: {formatTime(totalWatchedRef.current)} / {formatTime(duration)}</span>
//           <span>{Math.max(0, Math.round(minimumWatchPercentage - watchPercentage))}% remaining</span>
//         </div>

//         {completed && (
//           <div className="mt-4 text-center">
//             <button
//               onClick={onComplete}
//               className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
//             >
//               Continue to Voting →
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
//         <p className="text-red-800 text-xs font-semibold">
//           ⚠️ You cannot skip forward. Watch {minimumWatchPercentage}% to proceed. Once completed, you won't need to watch again.
//         </p>
//       </div>
//     </div>
//   );
// }