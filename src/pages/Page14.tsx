import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Settings, Save, Grid, Sliders, Clock } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import EditorNav from '../components/EditorNav';

export default function Page14() {
  const navigate = useNavigate();
  const { movieDuration, setMovieDuration } = useProject();

  return (
    <div className="min-h-screen bg-black">
      <EditorNav />
      <div className="p-4">
      <div className="h-screen flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4 px-4 py-3 bg-white/5 border border-purple-600/30 rounded-lg">
          <h1 className="text-2xl font-bold text-white">SETTINGS & CONFIGURATION</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/tutorials')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Settings Panel */}
          <div className="flex-1 bg-white/5 border border-purple-600/30 rounded-lg p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Video Settings */}
              <div className="bg-black/50 border border-purple-600/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Video Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white font-semibold block mb-2">Movie Title</label>
                    <input
                      type="text"
                      defaultValue="My Awesome Movie"
                      className="w-full p-3 bg-white/5 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white font-semibold block mb-2">Resolution</label>
                      <select className="w-full p-3 bg-white/5 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600">
                        <option>1920x1080 (Full HD)</option>
                        <option>3840x2160 (4K)</option>
                        <option>1280x720 (HD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-white font-semibold block mb-2">Frame Rate</label>
                      <select className="w-full p-3 bg-white/5 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600">
                        <option>30 fps</option>
                        <option>60 fps</option>
                        <option>24 fps (Cinematic)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white font-semibold block mb-2">Aspect Ratio</label>
                    <select className="w-full p-3 bg-white/5 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600">
                      <option>16:9 (Widescreen)</option>
                      <option>9:16 (Vertical)</option>
                      <option>1:1 (Square)</option>
                      <option>4:3 (Standard)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Color Grading Workspace */}
              <div className="bg-black/50 border border-purple-600/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Sliders className="w-6 h-6" />
                  Color Grading Workspace
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-white font-semibold block mb-2">Exposure</label>
                      <input type="range" className="w-full mb-1" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>-2</span>
                        <span>0</span>
                        <span>+2</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white font-semibold block mb-2">Contrast</label>
                      <input type="range" className="w-full mb-1" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>-100</span>
                        <span>0</span>
                        <span>+100</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-white font-semibold block mb-2">Highlights</label>
                      <input type="range" className="w-full mb-1" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>-100</span>
                        <span>0</span>
                        <span>+100</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white font-semibold block mb-2">Shadows</label>
                      <input type="range" className="w-full mb-1" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>-100</span>
                        <span>0</span>
                        <span>+100</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-white font-semibold block mb-2">Saturation</label>
                      <input type="range" className="w-full" />
                    </div>
                    <div>
                      <label className="text-sm text-white font-semibold block mb-2">Vibrance</label>
                      <input type="range" className="w-full" />
                    </div>
                    <div>
                      <label className="text-sm text-white font-semibold block mb-2">Temperature</label>
                      <input type="range" className="w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Settings */}
              <div className="bg-black/50 border border-purple-600/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Grid className="w-6 h-6" />
                  Export Preferences
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white font-semibold block mb-2">Default Export Format</label>
                    <select className="w-full p-3 bg-white/5 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600">
                      <option>MP4 (H.264)</option>
                      <option>MOV (ProRes)</option>
                      <option>WebM</option>
                      <option>AVI</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white font-semibold block mb-2">Quality Preset</label>
                    <select className="w-full p-3 bg-white/5 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600">
                      <option>Maximum Quality</option>
                      <option>High Quality</option>
                      <option>Medium Quality</option>
                      <option>Low Quality (Fast)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white font-semibold block mb-2">Bitrate (Mbps)</label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="w-full p-3 bg-white/5 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Auto-Save Settings */}
              <div className="bg-black/50 border border-purple-600/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Save className="w-6 h-6" />
                  Auto-Save & Backup
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                    <span className="text-white">Enable Auto-Save</span>
                  </label>
                  <div>
                    <label className="text-sm text-white font-semibold block mb-2">Auto-Save Interval</label>
                    <select className="w-full p-3 bg-white/5 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:border-purple-600">
                      <option>Every 5 minutes</option>
                      <option>Every 10 minutes</option>
                      <option>Every 15 minutes</option>
                      <option>Every 30 minutes</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                    <span className="text-white">Create Backup Files</span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="bg-black/50 border border-purple-600/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Movie Duration
                </h2>
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

              <button className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold text-lg transition-all flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                Save All Settings
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
