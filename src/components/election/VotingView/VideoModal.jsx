import React, { useRef, useState, useEffect } from 'react';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';

export default function VideoModal({ 
  videoUrl, 
  isOpen, 
  onClose, 
  videoWatched, 
  onVideoEnd 
}) {
  const videoRef = useRef(null);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen && !videoWatched) {
      setMaxWatchedTime(0);
    }
  }, [isOpen, videoWatched]);

  if (!isOpen || !videoUrl) return null;

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = isYouTube ? getYouTubeId(videoUrl) : null;
  
  // ✅ Disable controls for YouTube to prevent skipping
  const embedUrl = youtubeId 
    ? `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&rel=0&controls=0&disablekb=1&fs=0&modestbranding=1`
    : null;

  // ✅ Handle video time updates - prevent skipping forward
  const handleTimeUpdate = (e) => {
    const video = e.target;
    const currentTime = video.currentTime;

    // Track maximum watched time
    if (currentTime > maxWatchedTime) {
      setMaxWatchedTime(currentTime);
    }

    // If user tries to skip forward beyond what they've watched
    if (currentTime > maxWatchedTime + 0.5) {
      console.warn('⚠️ Skipping prevented - must watch video sequentially');
      video.currentTime = maxWatchedTime;
      setShowSkipWarning(true);
      setTimeout(() => setShowSkipWarning(false), 3000);
    }

    // Mark as watched if 90% watched
    if (currentTime / video.duration > 0.9 && !videoWatched) {
      console.log('✅ Video 90% watched');
      onVideoEnd();
    }
  };

  // ✅ Prevent seeking (scrubbing the timeline)
  const handleSeeking = (e) => {
    const video = e.target;
    if (video.currentTime > maxWatchedTime && !videoWatched) {
      console.warn('⚠️ Seeking prevented');
      video.currentTime = maxWatchedTime;
      setShowSkipWarning(true);
      setTimeout(() => setShowSkipWarning(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Election Video</h2>
          <button
            onClick={onClose}
            disabled={!videoWatched}
            className={`transition-colors ${
              videoWatched 
                ? 'text-gray-500 hover:text-gray-700' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Close video"
            title={videoWatched ? 'Close' : 'Watch video to close'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Skip Warning */}
        {showSkipWarning && (
          <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-lg p-3 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-800 font-semibold text-sm">
                ⚠️ You cannot skip forward! Please watch the video sequentially.
              </p>
            </div>
          </div>
        )}
        
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 relative">
          {isYouTube && embedUrl ? (
            <>
              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Election Video"
                onLoad={() => {
                  console.log('📺 YouTube video loaded');
                  
                  // Auto-mark as watched after full duration
                  // Note: YouTube iframe doesn't allow skip prevention
                  setTimeout(() => {
                    if (!videoWatched) {
                      console.log('✅ Video marked as watched (YouTube timeout)');
                      onVideoEnd();
                    }
                  }, 60000); // 60 seconds - adjust based on your video length
                }}
              />
              {/* Overlay to prevent right-click */}
              <div className="absolute inset-0 pointer-events-none"></div>
            </>
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full"
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()} // Prevent right-click
              onTimeUpdate={handleTimeUpdate}
              onSeeking={handleSeeking}
              onEnded={() => {
                console.log('✅ Video watched completely');
                onVideoEnd();
              }}
              // ✅ Custom controls - only play/pause, no seeking
            >
              Your browser does not support the video tag.
            </video>
          )}
          
          {/* Custom minimal controls for direct video */}
          {!isYouTube && videoRef.current && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                    } else {
                      videoRef.current.pause();
                    }
                  }}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <div className="flex-1 text-white text-sm">
                  <span className="opacity-75">Watch time: </span>
                  <span className="font-semibold">
                    {Math.floor(maxWatchedTime)}s / {videoRef.current ? Math.floor(videoRef.current.duration) : 0}s
                  </span>
                </div>
                <div className="text-white text-xs opacity-75">
                  {Math.floor((maxWatchedTime / (videoRef.current?.duration || 1)) * 100)}% watched
                </div>
              </div>
            </div>
          )}
        </div>

        {!videoWatched ? (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-yellow-800 text-sm font-semibold mb-1">
                  {isYouTube 
                    ? 'Please watch the video completely to enable voting.'
                    : 'Please watch at least 90% of the video to enable voting.'
                  }
                </p>
                <ul className="text-yellow-700 text-xs space-y-1 mt-2">
                  <li>• You cannot skip forward</li>
                  <li>• You must watch the video sequentially</li>
                  <li>• You cannot close this window until video is watched</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-800 font-medium">Video watched! You can now proceed to vote.</p>
          </div>
        )}
      </div>
    </div>
  );
}
// import React from 'react';
// import { CheckCircle, Info } from 'lucide-react';

// export default function VideoModal({ 
//   videoUrl, 
//   isOpen, 
//   onClose, 
//   videoWatched, 
//   onVideoEnd 
// }) {
//   if (!isOpen || !videoUrl) return null;

//   // Check if it's a YouTube URL
//   const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
//   // Extract YouTube video ID
//   const getYouTubeId = (url) => {
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
//     return (match && match[2].length === 11) ? match[2] : null;
//   };

//   const youtubeId = isYouTube ? getYouTubeId(videoUrl) : null;
//   const embedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&rel=0` : null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-4xl w-full p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold text-gray-900">Election Video</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 transition-colors"
//             aria-label="Close video"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
        
//         <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
//           {isYouTube && embedUrl ? (
//             <iframe
//               src={embedUrl}
//               className="w-full h-full"
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//               title="Election Video"
//               onLoad={() => {
//                 // YouTube iframe loaded
//                 console.log('📺 YouTube video loaded');
                
//                 // Auto-mark as watched after 30 seconds (YouTube doesn't provide onEnd for iframe)
//                 setTimeout(() => {
//                   if (!videoWatched) {
//                     console.log('✅ Video marked as watched (timeout)');
//                     onVideoEnd();
//                   }
//                 }, 30000); // 30 seconds
//               }}
//             />
//           ) : (
//             <video
//               src={videoUrl}
//               controls
//               className="w-full h-full"
//               onEnded={() => {
//                 console.log('✅ Video watched completely');
//                 onVideoEnd();
//               }}
//               onTimeUpdate={(e) => {
//                 // Mark as watched if user watches 80% of video
//                 const video = e.target;
//                 if (video.currentTime / video.duration > 0.8 && !videoWatched) {
//                   console.log('✅ Video 80% watched');
//                   onVideoEnd();
//                 }
//               }}
//             >
//               Your browser does not support the video tag.
//             </video>
//           )}
//         </div>

//         {!videoWatched ? (
//           <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
//             <p className="text-yellow-800 text-sm">
//               <Info className="inline mr-2" size={16} />
//               {isYouTube 
//                 ? 'Please watch the video for at least 30 seconds to enable voting.'
//                 : 'Please watch the entire video (or at least 80%) to enable voting.'
//               }
//             </p>
//           </div>
//         ) : (
//           <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-center gap-3">
//             <CheckCircle className="text-green-600" size={20} />
//             <p className="text-green-800 font-medium">Video watched! You can now proceed to vote.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }