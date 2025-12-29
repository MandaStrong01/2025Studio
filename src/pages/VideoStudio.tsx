import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Play, Pause, Volume2, VolumeX, Download, Save,
  Film, Sliders, ChevronDown, ChevronUp, ArrowLeft, Sparkles,
  Trash2, Plus, Loader, CheckCircle, X, Image as ImageIcon, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../lib/supabase';
import EditorNav from '../components/EditorNav';

interface Track {
  id: string;
  type: 'video' | 'audio' | 'image';
  file: any;
  startTime: number;
  duration: number;
}

export default function VideoStudio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mediaFiles, addMediaFiles } = useProject();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [expandedPanel, setExpandedPanel] = useState<string>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [settings, setSettings] = useState({
    volume: 100,
    stereoBalance: 50,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    removeWatermark: false,
    enhanceQuality: false,
    targetDuration: 600
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setIsUploading(true);

    try {
      const uploadedFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const fileType = file.type.split('/')[0];

        uploadedFiles.push({
          user_id: user.id,
          project_id: null,
          file_name: file.name,
          file_type: fileType,
          file_url: publicUrl,
          file_size: file.size,
          duration: 0,
          metadata: { originalName: file.name, mimeType: file.type }
        });
      }

      if (uploadedFiles.length > 0) {
        await addMediaFiles(uploadedFiles);
        alert(`Successfully uploaded ${uploadedFiles.length} file(s)!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addToTimeline = (file: any) => {
    const lastTrack = tracks[tracks.length - 1];
    const startTime = lastTrack ? lastTrack.startTime + lastTrack.duration : 0;

    const newTrack: Track = {
      id: `track-${Date.now()}-${Math.random()}`,
      type: file.file_type,
      file: file,
      startTime: startTime,
      duration: file.duration || 5
    };

    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (trackId: string) => {
    setTracks(tracks.filter(t => t.id !== trackId));
    if (selectedTrack?.id === trackId) {
      setSelectedTrack(null);
    }
  };

  const updateTrackDuration = (trackId: string, newDuration: number) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId) {
        return { ...track, duration: newDuration };
      }
      return track;
    }));
    if (selectedTrack?.id === trackId) {
      setSelectedTrack({ ...selectedTrack, duration: newDuration });
    }
  };

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

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim() || !user) {
      alert('Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: aiPrompt, userId: user.id })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Video generation started! Check your media library in a few minutes.');
        setAiPrompt('');
      } else {
        alert('Generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRender = async () => {
    if (tracks.length === 0) {
      alert('Please add media to the timeline first');
      return;
    }

    setIsRendering(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/render-video`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            tracks: tracks,
            settings: settings
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Video rendering started! You will receive the output shortly.');
      } else {
        alert('Rendering failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Render error:', error);
      alert('Failed to render video. Please try again.');
    } finally {
      setIsRendering(false);
    }
  };

  const handleExport = () => {
    if (tracks.length === 0) {
      alert('No content to export');
      return;
    }

    const exportData = {
      tracks: tracks,
      settings: settings,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Project exported successfully!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePanel = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? '' : panel);
  };

  const videoFiles = mediaFiles.filter(f => f.file_type === 'video');
  const audioFiles = mediaFiles.filter(f => f.file_type === 'audio');
  const imageFiles = mediaFiles.filter(f => f.file_type === 'image');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Film className="w-20 h-20 text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to access the studio</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <EditorNav />

      <div className="p-4 lg:p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Video Studio</h1>
              <p className="text-gray-400">Complete video editing and generation workspace</p>
            </div>
            <button
              onClick={() => navigate('/media-library')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Media Library
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Film className="w-5 h-5 text-blue-400" />
                  Preview
                </h3>
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  {selectedTrack && selectedTrack.type === 'video' ? (
                    <video
                      ref={videoRef}
                      src={selectedTrack.file.file_url}
                      className="w-full h-full object-contain"
                      style={{
                        filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`
                      }}
                      onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                      crossOrigin="anonymous"
                    />
                  ) : selectedTrack && selectedTrack.type === 'image' ? (
                    <img
                      src={selectedTrack.file.file_url}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      style={{
                        filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Film className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Select media from timeline to preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedTrack && selectedTrack.type === 'video' && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={handlePlayPause}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(currentTime / (selectedTrack.duration || 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(selectedTrack.duration || 0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-400" />
                    Timeline ({tracks.length} tracks)
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRender}
                      disabled={isRendering || tracks.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                    >
                      {isRendering ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Rendering...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Render
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleExport}
                      disabled={tracks.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => setTracks([])}
                      disabled={tracks.length === 0}
                      className="p-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-black/50 rounded-lg p-4 min-h-32">
                  {tracks.length === 0 ? (
                    <div className="flex items-center justify-center h-24">
                      <p className="text-gray-400">Add media to timeline to start editing</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tracks.map((track, index) => (
                        <div
                          key={track.id}
                          className={`p-3 rounded-lg transition-all ${
                            selectedTrack?.id === track.id
                              ? 'bg-blue-600/30 border-2 border-blue-500'
                              : 'bg-gray-800/50 border-2 border-transparent hover:bg-gray-800'
                          }`}
                        >
                          <div
                            onClick={() => setSelectedTrack(track)}
                            className="flex items-center gap-3 cursor-pointer mb-2"
                          >
                            <div className="flex-shrink-0">
                              {track.type === 'video' && <Film className="w-5 h-5 text-blue-400" />}
                              {track.type === 'audio' && <Volume2 className="w-5 h-5 text-green-400" />}
                              {track.type === 'image' && <ImageIcon className="w-5 h-5 text-orange-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm truncate">
                                Track {index + 1}: {track.file.file_name}
                              </p>
                              <p className="text-gray-400 text-xs">
                                Start: {formatTime(track.startTime)} | Duration: {formatTime(track.duration)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTrack(track.id);
                              }}
                              className="p-1 bg-red-600 hover:bg-red-700 rounded text-white transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 pl-8" onClick={(e) => e.stopPropagation()}>
                            <label className="text-white text-xs font-semibold whitespace-nowrap">
                              Duration: {Math.floor(track.duration / 60)} min {track.duration % 60} sec
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="10800"
                              value={track.duration}
                              onChange={(e) => updateTrackDuration(track.id, parseInt(e.target.value))}
                              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => togglePanel('upload')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Files
                  </span>
                  {expandedPanel === 'upload' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedPanel === 'upload' && (
                  <div className="p-4 space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full p-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Choose Files
                        </>
                      )}
                    </button>
                    <p className="text-gray-400 text-xs text-center">
                      Supports images, videos, and audio up to 5GB
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => togglePanel('ai')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    AI Generate
                  </span>
                  {expandedPanel === 'ai' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedPanel === 'ai' && (
                  <div className="p-4 space-y-3">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe what you want to create..."
                      className="w-full h-24 p-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleGenerateAI}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="w-full p-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Video
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => togglePanel('media')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Media Library ({mediaFiles.length})
                  </span>
                  {expandedPanel === 'media' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedPanel === 'media' && (
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {mediaFiles.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">No media files yet</p>
                    ) : (
                      <>
                        {videoFiles.length > 0 && (
                          <div>
                            <p className="text-gray-400 text-xs font-semibold mb-2">VIDEOS</p>
                            {videoFiles.map(file => (
                              <button
                                key={file.id}
                                onClick={() => addToTimeline(file)}
                                className="w-full p-2 mb-1 bg-gray-800 hover:bg-gray-700 rounded text-left transition-all group"
                              >
                                <div className="flex items-center gap-2">
                                  <Film className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                  <span className="text-white text-sm truncate flex-1">{file.file_name}</span>
                                  <Plus className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {audioFiles.length > 0 && (
                          <div>
                            <p className="text-gray-400 text-xs font-semibold mb-2">AUDIO</p>
                            {audioFiles.map(file => (
                              <button
                                key={file.id}
                                onClick={() => addToTimeline(file)}
                                className="w-full p-2 mb-1 bg-gray-800 hover:bg-gray-700 rounded text-left transition-all group"
                              >
                                <div className="flex items-center gap-2">
                                  <Volume2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  <span className="text-white text-sm truncate flex-1">{file.file_name}</span>
                                  <Plus className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {imageFiles.length > 0 && (
                          <div>
                            <p className="text-gray-400 text-xs font-semibold mb-2">IMAGES</p>
                            {imageFiles.map(file => (
                              <button
                                key={file.id}
                                onClick={() => addToTimeline(file)}
                                className="w-full p-2 mb-1 bg-gray-800 hover:bg-gray-700 rounded text-left transition-all group"
                              >
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                  <span className="text-white text-sm truncate flex-1">{file.file_name}</span>
                                  <Plus className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => togglePanel('settings')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Audio & Video
                  </span>
                  {expandedPanel === 'settings' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedPanel === 'settings' && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Target Duration: {Math.floor(settings.targetDuration / 60)} min {settings.targetDuration % 60} sec
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10800"
                        value={settings.targetDuration}
                        onChange={(e) => updateSetting('targetDuration', parseInt(e.target.value))}
                        className="w-full slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0 min</span>
                        <span>60 min</span>
                        <span>120 min</span>
                        <span>180 min</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <label className="text-white text-sm font-semibold mb-2 block flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Volume: {settings.volume}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={settings.volume}
                        onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                        className="w-full slider"
                      />
                    </div>

                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">
                        Stereo Balance: {settings.stereoBalance}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.stereoBalance}
                        onChange={(e) => updateSetting('stereoBalance', parseInt(e.target.value))}
                        className="w-full slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Left</span>
                        <span>Center</span>
                        <span>Right</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">
                        Brightness: {settings.brightness}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={settings.brightness}
                        onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                        className="w-full slider"
                      />
                    </div>

                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">
                        Contrast: {settings.contrast}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={settings.contrast}
                        onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
                        className="w-full slider"
                      />
                    </div>

                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">
                        Saturation: {settings.saturation}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={settings.saturation}
                        onChange={(e) => updateSetting('saturation', parseInt(e.target.value))}
                        className="w-full slider"
                      />
                    </div>

                    <div className="border-t border-gray-700 pt-4 space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-all">
                        <input
                          type="checkbox"
                          checked={settings.removeWatermark}
                          onChange={(e) => updateSetting('removeWatermark', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-white text-sm font-semibold">Remove Watermark</p>
                          <p className="text-gray-400 text-xs">AI-powered watermark removal</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-all">
                        <input
                          type="checkbox"
                          checked={settings.enhanceQuality}
                          onChange={(e) => updateSetting('enhanceQuality', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-white text-sm font-semibold">Enhance Quality</p>
                          <p className="text-gray-400 text-xs">AI upscaling and enhancement</p>
                        </div>
                      </label>
                    </div>
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
