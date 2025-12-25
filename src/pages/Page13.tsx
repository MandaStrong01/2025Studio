import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Volume2, Mic, Music, Activity, Clock, Save } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import EditorNav from '../components/EditorNav';

export default function Page13() {
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();
  const { movieDuration, setMovieDuration, currentProject, updateProject } = useProject();
  const [musicVolume, setMusicVolume] = useState(75);
  const [voiceVolume, setVoiceVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(65);
  const [masterVolume, setMasterVolume] = useState(80);
  const [musicMuted, setMusicMuted] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const handleSaveAudioSettings = async () => {
    if (!isSubscribed) {
      setShowSubscribeModal(true);
      return;
    }
    if (!currentProject) return;

    setSaving(true);
    await updateProject(currentProject.id, {
      timeline_data: {
        ...currentProject.timeline_data,
        audioSettings: {
          musicVolume,
          voiceVolume,
          sfxVolume,
          masterVolume,
          musicMuted,
          voiceMuted,
          sfxMuted
        }
      }
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <EditorNav />
      <div className="p-4">
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black border-2 border-purple-600 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-white mb-4">Subscription Required</h2>
            <p className="text-gray-300 mb-6">
              You need an active subscription to use the audio mixer and save audio settings.
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
      <div className="h-screen flex flex-col">
        <div className="flex items-center justify-between mb-4 px-4 py-3 bg-white/5 border border-purple-600/30 rounded-lg">
          <div>
            <h1 className="text-2xl font-bold text-white">AUDIO MIXER</h1>
            {currentProject && (
              <p className="text-sm text-gray-400">{currentProject.project_name}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/export')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="flex-1 bg-white/5 border border-purple-600/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-purple-400">PROFESSIONAL AUDIO MIXER</h2>
              <button
                onClick={handleSaveAudioSettings}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-black/50 border border-purple-600/20 rounded-lg p-4">
                <div className="text-center mb-4">
                  <Music className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <span className="text-sm text-white font-bold">MUSIC</span>
                </div>

                <div className="h-56 bg-white/5 rounded-lg mb-4 relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-purple-400 rounded-lg transition-all duration-200"
                    style={{ height: `${musicMuted ? 0 : musicVolume}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="w-full mb-3"
                />

                <div className="text-center text-white text-lg font-bold mb-3">
                  {musicVolume}%
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setMusicMuted(!musicMuted)}
                    className={`flex-1 px-3 py-2 rounded text-xs font-bold transition-all ${
                      musicMuted ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    MUTE
                  </button>
                  <button className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-white transition-all">
                    SOLO
                  </button>
                </div>
              </div>

              <div className="bg-black/50 border border-purple-600/20 rounded-lg p-4">
                <div className="text-center mb-4">
                  <Mic className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <span className="text-sm text-white font-bold">VOICE</span>
                </div>

                <div className="h-56 bg-white/5 rounded-lg mb-4 relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-purple-400 rounded-lg transition-all duration-200"
                    style={{ height: `${voiceMuted ? 0 : voiceVolume}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(Number(e.target.value))}
                  className="w-full mb-3"
                />

                <div className="text-center text-white text-lg font-bold mb-3">
                  {voiceVolume}%
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setVoiceMuted(!voiceMuted)}
                    className={`flex-1 px-3 py-2 rounded text-xs font-bold transition-all ${
                      voiceMuted ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    MUTE
                  </button>
                  <button className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-white transition-all">
                    SOLO
                  </button>
                </div>
              </div>

              <div className="bg-black/50 border border-purple-600/20 rounded-lg p-4">
                <div className="text-center mb-4">
                  <Volume2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <span className="text-sm text-white font-bold">SFX</span>
                </div>

                <div className="h-56 bg-white/5 rounded-lg mb-4 relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-purple-400 rounded-lg transition-all duration-200"
                    style={{ height: `${sfxMuted ? 0 : sfxVolume}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(Number(e.target.value))}
                  className="w-full mb-3"
                />

                <div className="text-center text-white text-lg font-bold mb-3">
                  {sfxVolume}%
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSfxMuted(!sfxMuted)}
                    className={`flex-1 px-3 py-2 rounded text-xs font-bold transition-all ${
                      sfxMuted ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    MUTE
                  </button>
                  <button className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-white transition-all">
                    SOLO
                  </button>
                </div>
              </div>

              <div className="bg-black/50 border-2 border-purple-600 rounded-lg p-4">
                <div className="text-center mb-4">
                  <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <span className="text-sm text-white font-bold">MASTER</span>
                </div>

                <div className="h-56 bg-white/5 rounded-lg mb-4 relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-purple-400 rounded-lg transition-all duration-200"
                    style={{ height: `${masterVolume}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="w-full mb-3"
                />

                <div className="text-center text-white text-lg font-bold mb-3">
                  {masterVolume}%
                </div>

                <div className="text-center">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-xs font-bold text-white transition-all">
                    OUTPUT
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-purple-600/20 rounded-lg p-4">
              <h3 className="text-sm font-bold text-purple-400 mb-3">AUDIO EFFECTS</h3>
              <div className="grid md:grid-cols-4 gap-3">
                <button className="p-3 bg-white/10 hover:bg-purple-600 rounded-lg text-white text-sm transition-all">
                  Reverb
                </button>
                <button className="p-3 bg-white/10 hover:bg-purple-600 rounded-lg text-white text-sm transition-all">
                  Echo
                </button>
                <button className="p-3 bg-white/10 hover:bg-purple-600 rounded-lg text-white text-sm transition-all">
                  Compressor
                </button>
                <button className="p-3 bg-white/10 hover:bg-purple-600 rounded-lg text-white text-sm transition-all">
                  Equalizer
                </button>
              </div>
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
    </div>
  );
}
