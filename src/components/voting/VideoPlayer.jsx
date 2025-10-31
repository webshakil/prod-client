import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle } from 'lucide-react';

export default function VideoPlayer({
  videoUrl,
  /*eslint-disable*/
  electionId,
  onProgress,
  initialProgress,
  required = true,
  requiredPercentage = 80,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchPercentage, setWatchPercentage] = useState(initialProgress?.watch_percentage || 0);
  const [isComplete, setIsComplete] = useState(initialProgress?.completed || false);

  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = getYouTubeId(videoUrl);
  const isYouTube = !!youtubeId;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTube) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      setCurrentTime(current);
      setDuration(total);

      const percentage = (current / total) * 100;
      setWatchPercentage(percentage);

      // Report progress every 5 seconds
      if (Math.floor(current) % 5 === 0) {
        onProgress?.({
          currentTime: current,
          duration: total,
          watchPercentage: percentage,
        });
      }

      // Check if requirement met
      if (percentage >= requiredPercentage && !isComplete) {
        setIsComplete(true);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onProgress, requiredPercentage, isComplete, isYouTube]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
        {isYouTube ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              onClick={togglePlay}
            />
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-blue-400 transition"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition"
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <div className="flex-1">
                  <div className="relative h-1 bg-gray-600 rounded">
                    <div
                      className="absolute h-full bg-blue-600 rounded"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-blue-400 transition"
                >
                  <Maximize size={24} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Progress Bar */}
      {required && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Watch Progress: {Math.floor(watchPercentage)}%
            </span>
            {isComplete ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="text-sm font-semibold">Requirement Met!</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">
                Required: {requiredPercentage}%
              </span>
            )}
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute h-full transition-all ${
                watchPercentage >= requiredPercentage ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${watchPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}