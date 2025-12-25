import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Play, Pause, Maximize, Volume2, VolumeX, SkipBack, SkipForward, Film } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function Page17() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [movieUrl, setMovieUrl] = useState<string | null>(null);
  const [movieTitle, setMovieTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const { data, error } = await supabase
          .from('public_movies')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setMovieUrl(data.video_url);
          setMovieTitle(data.title || 'Untitled Movie');
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !movieUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      navigate('/collaboration');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    video.volume = volume / 100;
    video.play().catch(() => {});

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [navigate, movieUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Auto-hide controls after 3 seconds of no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const skipBack = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  return (
    <div
      className="min-h-screen bg-black flex flex-col"
      onMouseMove={handleMouseMove}
    >
      {/* Top Bar - Only visible when controls are shown */}
      <div className={`transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
          <h1 className="text-xl font-bold text-white">FULL-SCREEN MOVIE VIEWER</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/community')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/collaboration')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Player Area */}
      <div className="flex-1 flex items-center justify-center relative">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
            <p className="text-white text-lg">Loading movie...</p>
          </div>
        ) : !movieUrl ? (
          <div className="flex flex-col items-center gap-6 text-center px-4">
            <Film className="w-24 h-24 text-gray-600" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">No Movie Uploaded</h2>
              <p className="text-gray-400 mb-6">Upload a Christmas movie to watch it here!</p>
              <button
                onClick={() => navigate('/community')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
              >
                Go to Upload Page
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              src={movieUrl}
              autoPlay
              playsInline
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Central Play/Pause Button Overlay */}
        {movieUrl && (
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center group cursor-pointer"
          >
            <div className={`w-20 h-20 bg-purple-600/80 rounded-full flex items-center justify-center transition-all duration-300 ${
              showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            } group-hover:opacity-100 group-hover:scale-110`}>
              {isPlaying ? (
                <Pause className="w-10 h-10 text-white" />
              ) : (
                <Play className="w-10 h-10 text-white ml-1" />
              )}
            </div>
          </button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      {movieUrl && (
        <div className={`transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-gradient-to-t from-black/90 to-transparent p-6 absolute bottom-0 left-0 right-0">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-purple-600 rounded-full relative transition-all duration-300"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              {/* Skip Back */}
              <button
                onClick={skipBack}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    if (Number(e.target.value) > 0) setIsMuted(false);
                  }}
                  className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #9333ea ${volume}%, rgba(255,255,255,0.2) ${volume}%)`
                  }}
                />
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
              <span className="text-white text-sm font-semibold">{movieTitle}</span>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-all"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
