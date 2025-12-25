import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Video, Play, Clock, Sparkles } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';

export default function Page15() {
  const navigate = useNavigate();
  const { movieDuration, setMovieDuration } = useProject();

  const tutorials = [
    {
      title: 'Getting Started with MandaStrong Studio',
      duration: '5:30',
      level: 'Beginner',
      description: 'Learn how to navigate the interface and access the editor suite instantly to start creating.'
    },
    {
      title: 'Multi-Track Timeline Editing',
      duration: '12:45',
      level: 'Intermediate',
      description: 'Master the timeline editor with drag-and-drop clips, multiple tracks, and professional editing tools.'
    },
    {
      title: 'Professional Color Grading Techniques',
      duration: '18:20',
      level: 'Advanced',
      description: 'Advanced color correction and grading workspace for cinema-quality results.'
    },
    {
      title: 'Audio Mixing & Mastering',
      duration: '15:10',
      level: 'Intermediate',
      description: 'Professional audio mixing suite with effects and multi-channel audio support.'
    },
    {
      title: 'Creating Stunning Visual Effects',
      duration: '22:35',
      level: 'Advanced',
      description: 'Access thousands of transitions, effects, and filters from our comprehensive library.'
    },
    {
      title: 'Export Settings for Social Media',
      duration: '8:15',
      level: 'Beginner',
      description: 'Optimize your exports for different platforms with the right resolution and format settings.'
    },
  ];

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="h-screen flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4 px-4 py-3 bg-white/5 border border-purple-600/30 rounded-lg">
          <h1 className="text-2xl font-bold text-white">TUTORIALS & LEARNING CENTER</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/community')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Main Video Player */}
          <div className="flex-1 bg-white/5 border border-purple-600/30 rounded-lg p-6">
            <div className="h-full flex flex-col">
              <div className="flex-1 bg-black rounded-lg flex items-center justify-center border-2 border-purple-600/20 mb-4">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <Play className="w-16 h-16 text-purple-400" />
                  </div>
                  <p className="text-xl text-white font-bold mb-2">Tutorial Video Player</p>
                  <p className="text-sm text-gray-500">Select a tutorial to begin learning</p>
                </div>
              </div>

              <div className="bg-black/50 border border-purple-600/20 rounded-lg p-4">
                <h2 className="text-lg font-bold text-white mb-2">Getting Started with MandaStrong Studio</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Welcome to MandaStrong Studio! This tutorial shows you how to access the editor suite instantly
                  and explore all the professional features available to you.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    5:30
                  </span>
                  <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">Beginner</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tutorial Library Sidebar */}
          <div className="w-96 bg-white/5 border border-purple-600/30 rounded-lg p-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Tutorial Library
            </h2>

            <div className="space-y-3">
              {tutorials.map((tutorial, index) => (
                <button
                  key={index}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    index === 0
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-black/50 border-purple-600/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white mb-1">{tutorial.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tutorial.duration}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded">
                          {tutorial.level}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-2 border-purple-500/50 rounded-lg p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                Quick Start Guide
              </h3>
              <div className="space-y-3 text-sm text-gray-200">
                <div className="flex gap-2">
                  <span className="text-purple-300 font-bold">1.</span>
                  <p>Click <strong>"Launch Editor Suite"</strong> to access all editing tools instantly</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-300 font-bold">2.</span>
                  <p>Explore the timeline, effects, and color grading features</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-300 font-bold">3.</span>
                  <p>Start editing and creating videos with the full suite</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-300 font-bold">4.</span>
                  <p>Export and render your finished videos seamlessly</p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-black/50 border border-purple-600/20 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">Learning Paths</h3>
              <div className="space-y-2">
                <button className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white text-left transition-all">
                  Complete Beginner Course
                </button>
                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white text-left transition-all">
                  Professional Editing Mastery
                </button>
                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white text-left transition-all">
                  Color Grading Specialist
                </button>
                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white text-left transition-all">
                  Audio Production Expert
                </button>
              </div>
            </div>

            <div className="mt-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-4 text-center">
              <h3 className="text-sm font-bold text-white mb-2">Need Help?</h3>
              <p className="text-xs text-white/80 mb-3">Chat with Agent Grok for instant assistance</p>
              <button className="w-full px-4 py-2 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all">
                Open Help Desk
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white/5 border border-purple-600/30 rounded-lg p-6">
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
