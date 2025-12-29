import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Play, Pause, Volume2, VolumeX, Scissors, Crop,
  Sparkles, Clock, Eraser, Download, Save, RotateCcw,
  Film, Sliders, ChevronDown, ChevronUp, ArrowLeft, Maximize2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../lib/supabase';
import EditorNav from '../components/EditorNav';

interface EditSettings {
  volume: number;
  aspectRatio: string;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  speed: number;
  trimStart: number;
  trimEnd: number;
  targetDuration: number;
  removeWatermark: boolean;
}

export default function VideoStudio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mediaFiles } = useProject();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>('audio');

  const [settings, setSettings] = useState<EditSettings>({
    volume: 100,
    aspectRatio: '16:9',
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    speed: 1,
    trimStart: 0,
    trimEnd: 100,
    targetDuration: 60,
    removeWatermark: false,
  });

  const videoFiles = mediaFiles.filter(file => file.file_type === 'video');

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = settings.volume / 100;
    }
  }, [settings.volume]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateSetting = (key: keyof EditSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const handleExport = async () => {
    if (!selectedVideo) return;

    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const link = document.createElement('a');
      link.href = selectedVideo.file_url;
      link.download = `edited_${selectedVideo.file_name}`;
      link.click();

      alert('Video export complete! In a production environment, this would apply all your edits.');
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveProject = async () => {
    if (!selectedVideo || !user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .upsert({
          user_id: user.id,
          name: `Edited - ${selectedVideo.file_name}`,
          settings: JSON.stringify(settings),
          video_id: selectedVideo.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert('Project saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save project');
    }
  };

  const resetSettings = () => {
    setSettings({
      volume: 100,
      aspectRatio: '16:9',
      blur: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      speed: 1,
      trimStart: 0,
      trimEnd: 100,
      targetDuration: 60,
      removeWatermark: false,
    });
  };

  const getVideoStyle = () => {
    return {
      filter: `blur(${settings.blur}px) brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
      transform: `scale(${settings.speed})`,
    };
  };

  const aspectRatios = [
    { label: '16:9 (Landscape)', value: '16:9' },
    { label: '9:16 (Portrait)', value: '9:16' },
    { label: '1:1 (Square)', value: '1:1' },
    { label: '4:3 (Standard)', value: '4:3' },
    { label: '21:9 (Cinema)', value: '21:9' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black flex items-center justify-center">
        <div className="text-center">
          <Film className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to access the video studio</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black">
      <EditorNav />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Video Editing Studio</h1>
              <p className="text-gray-400">Professional video editing tools for your content</p>
            </div>
            <button
              onClick={() => navigate('/media-library')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-black/70 border border-purple-600/30 rounded-xl p-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
                  {selectedVideo ? (
                    <video
                      ref={videoRef}
                      src={selectedVideo.file_url}
                      className="w-full h-full object-contain"
                      style={getVideoStyle()}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg font-semibold">Select a video to start editing</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedVideo && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePlayPause}
                        className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={handleMute}
                        className="p-3 bg-purple-600/50 hover:bg-purple-600 rounded-lg text-white transition-all"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>

                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, rgba(147, 51, 234, 0.3) ${(currentTime / duration) * 100}%, rgba(147, 51, 234, 0.3) 100%)`
                          }}
                        />
                      </div>

                      <div className="text-white font-mono text-sm min-w-24 text-right">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={handleSaveProject}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Save Project
                      </button>

                      <button
                        onClick={handleExport}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        {isProcessing ? 'Processing...' : 'Export Video'}
                      </button>

                      <button
                        onClick={resetSettings}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {videoFiles.length > 0 && (
                <div className="bg-black/70 border border-purple-600/30 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-purple-400" />
                    Your Videos
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {videoFiles.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => {
                          setSelectedVideo(video);
                          setIsPlaying(false);
                          resetSettings();
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedVideo?.id === video.id
                            ? 'border-purple-500 bg-purple-900/30'
                            : 'border-purple-600/30 bg-black/50 hover:border-purple-500/50'
                        }`}
                      >
                        <Film className="w-8 h-8 text-purple-400 mb-2" />
                        <p className="text-white text-sm font-semibold truncate">{video.file_name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-black/70 border border-purple-600/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('audio')}
                  className="w-full p-4 bg-purple-900/30 hover:bg-purple-900/50 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Audio Controls
                  </span>
                  {expandedSection === 'audio' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'audio' && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Volume: {settings.volume}%</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={settings.volume}
                        onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Speed: {settings.speed}x</label>
                      <input
                        type="range"
                        min="0.25"
                        max="2"
                        step="0.25"
                        value={settings.speed}
                        onChange={(e) => updateSetting('speed', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-black/70 border border-purple-600/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('ratio')}
                  className="w-full p-4 bg-purple-900/30 hover:bg-purple-900/50 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Maximize2 className="w-5 h-5" />
                    Aspect Ratio
                  </span>
                  {expandedSection === 'ratio' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'ratio' && (
                  <div className="p-4 space-y-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => updateSetting('aspectRatio', ratio.value)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          settings.aspectRatio === ratio.value
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-900/20 text-gray-300 hover:bg-purple-900/40'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-black/70 border border-purple-600/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('effects')}
                  className="w-full p-4 bg-purple-900/30 hover:bg-purple-900/50 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Visual Effects
                  </span>
                  {expandedSection === 'effects' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'effects' && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Blur: {settings.blur}px</label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={settings.blur}
                        onChange={(e) => updateSetting('blur', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Brightness: {settings.brightness}%</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={settings.brightness}
                        onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Contrast: {settings.contrast}%</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={settings.contrast}
                        onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Saturation: {settings.saturation}%</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={settings.saturation}
                        onChange={(e) => updateSetting('saturation', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-black/70 border border-purple-600/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('trim')}
                  className="w-full p-4 bg-purple-900/30 hover:bg-purple-900/50 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Scissors className="w-5 h-5" />
                    Trim & Duration
                  </span>
                  {expandedSection === 'trim' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'trim' && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">
                        Target Duration: {settings.targetDuration} minutes
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="180"
                        value={settings.targetDuration}
                        onChange={(e) => updateSetting('targetDuration', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0 min</span>
                        <span>90 min</span>
                        <span>180 min</span>
                      </div>
                    </div>
                    <div className="border-t border-purple-600/30 pt-4">
                      <p className="text-gray-400 text-xs mb-3">Trim Controls</p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-white text-sm font-semibold mb-2 block">Start: {settings.trimStart}%</label>
                          <input
                            type="range"
                            min="0"
                            max={settings.trimEnd - 1}
                            value={settings.trimStart}
                            onChange={(e) => updateSetting('trimStart', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-white text-sm font-semibold mb-2 block">End: {settings.trimEnd}%</label>
                          <input
                            type="range"
                            min={settings.trimStart + 1}
                            max="100"
                            value={settings.trimEnd}
                            onChange={(e) => updateSetting('trimEnd', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-black/70 border border-purple-600/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('advanced')}
                  className="w-full p-4 bg-purple-900/30 hover:bg-purple-900/50 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Advanced Tools
                  </span>
                  {expandedSection === 'advanced' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'advanced' && (
                  <div className="p-4 space-y-4">
                    <label className="flex items-center gap-3 p-3 bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-900/40 transition-all">
                      <input
                        type="checkbox"
                        checked={settings.removeWatermark}
                        onChange={(e) => updateSetting('removeWatermark', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <div>
                        <p className="text-white font-semibold">Remove Watermark</p>
                        <p className="text-gray-400 text-xs">AI-powered watermark removal</p>
                      </div>
                    </label>

                    <button className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Enhance Quality
                    </button>

                    <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                      <Crop className="w-4 h-4" />
                      Auto Crop & Frame
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
