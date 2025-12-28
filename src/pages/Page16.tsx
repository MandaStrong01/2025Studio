import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Film, Download, Loader2, Check, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

export default function Page16() {
  const navigate = useNavigate();
  const { user, isSubscribed } = useAuth();
  const { currentProject, updateProject, movieDuration, setMovieDuration } = useProject();
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [resolution, setResolution] = useState('4K');
  const [format, setFormat] = useState('MP4 (H.264)');
  const [quality, setQuality] = useState('High');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const startRender = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isSubscribed) {
      setShowSubscribeModal(true);
      return;
    }

    setRendering(true);
    setProgress(0);
    setCompleted(false);

    if (currentProject) {
      await updateProject(currentProject.id, {
        render_status: 'rendering'
      });
    }
  };

  useEffect(() => {
    if (rendering && progress < 100) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setRendering(false);
            setCompleted(true);

            if (currentProject) {
              updateProject(currentProject.id, {
                render_status: 'completed',
                output_url: `https://example.com/renders/${currentProject.id}.mp4`
              });
            }

            setTimeout(() => {
              navigate('/marketplace');
            }, 800);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [rendering, progress, navigate, currentProject, updateProject]);


  return (
    <div className="min-h-screen bg-black p-4">
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black border-2 border-purple-600 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-white mb-4">Subscription Required</h2>
            <p className="text-gray-300 mb-6">
              You need an active subscription to render and export videos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
              >
                Close
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white/5 border border-purple-600/30 rounded-lg">
          <div>
            <h1 className="text-2xl font-bold text-white">EXPORT CENTER</h1>
            <p className="text-sm text-gray-400">Ready to export your movie</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/tutorials')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-purple-600/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
              <Film className="w-6 h-6" />
              Export Settings
            </h2>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-white font-semibold block mb-2">Resolution</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setResolution('4K')}
                    className={`p-3 rounded-lg font-bold text-sm transition-all ${
                      resolution === '4K' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    4K
                  </button>
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`p-3 rounded-lg font-bold text-sm transition-all ${
                      resolution === '1080p' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    1080p
                  </button>
                  <button
                    onClick={() => setResolution('720p')}
                    className={`p-3 rounded-lg font-bold text-sm transition-all ${
                      resolution === '720p' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    720p
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {resolution === '4K' ? '3840x2160' : resolution === '1080p' ? '1920x1080' : '1280x720'}
                </p>
              </div>

              <div>
                <label className="text-sm text-white font-semibold block mb-2">Export Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600"
                >
                  <option>MP4 (H.264)</option>
                  <option>MOV (ProRes)</option>
                  <option>WebM</option>
                  <option>AVI</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-white font-semibold block mb-2">Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setQuality('High')}
                    className={`p-3 rounded-lg font-bold text-sm transition-all ${
                      quality === 'High' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    High
                  </button>
                  <button
                    onClick={() => setQuality('Medium')}
                    className={`p-3 rounded-lg font-bold text-sm transition-all ${
                      quality === 'Medium' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setQuality('Low')}
                    className={`p-3 rounded-lg font-bold text-sm transition-all ${
                      quality === 'Low' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Low
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-white font-semibold block mb-2">Frame Rate</label>
                <select className="w-full p-3 bg-white/10 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600">
                  <option>60 fps</option>
                  <option>30 fps</option>
                  <option>24 fps</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-purple-600/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-purple-400 mb-6">Render Status</h2>

            {!rendering && !completed && (
              <div className="text-center py-12">
                <Film className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Ready to Render</h3>
                <p className="text-gray-400 mb-6">Your movie is ready to be exported</p>

                <button
                  onClick={startRender}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg font-bold rounded-lg transition-all transform hover:scale-105"
                >
                  Start Rendering
                </button>
              </div>
            )}

            {rendering && (
              <div className="text-center py-12">
                <Loader2 className="w-20 h-20 text-purple-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-bold text-white mb-2">Rendering Video...</h3>
                <p className="text-gray-400 mb-6">Please wait while we process your video</p>

                <div className="bg-black/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Progress</span>
                    <span className="text-sm text-purple-400 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-purple-400 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Estimated time remaining: {Math.ceil((100 - progress) * 0.5)} seconds
                </p>
              </div>
            )}

            {completed && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Rendering Complete!</h3>
                <p className="text-gray-400 mb-6">Your video is ready to download</p>

                <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg font-bold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto">
                  <Download className="w-5 h-5" />
                  Download Video
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white/5 border border-purple-600/30 rounded-lg p-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Movie Duration</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-lg">0 min</span>
              <div className="text-center">
                <div className="text-4xl font-black text-white mb-1">{movieDuration}</div>
                <div className="text-xs text-purple-400 font-semibold">MINUTES</div>
              </div>
              <span className="text-gray-400 text-lg">180 min</span>
            </div>

            <input
              type="range"
              min="0"
              max="180"
              value={movieDuration}
              onChange={(e) => setMovieDuration(Number(e.target.value))}
              className="w-full h-3 bg-purple-950/50 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${(movieDuration / 180) * 100}%, rgb(88, 28, 135) ${(movieDuration / 180) * 100}%, rgb(88, 28, 135) 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
