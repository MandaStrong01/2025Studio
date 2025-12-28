import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Play, Pause, Plus, Save, Clock, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import EditorNav from '../components/EditorNav';

export default function Page12() {
  const navigate = useNavigate();
  const { user, isSubscribed } = useAuth();
  const {
    currentProject,
    mediaFiles,
    timelineClips,
    addTimelineClip,
    addMediaFiles,
    movieDuration,
    setMovieDuration
  } = useProject();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [draggedMedia, setDraggedMedia] = useState<string | null>(null);
  const [dragOverTrack, setDragOverTrack] = useState<number | null>(null);
  const [draggedClip, setDraggedClip] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  const tracks = [
    { id: 1, name: 'VIDEO 1', type: 'video' },
    { id: 2, name: 'AUDIO 1', type: 'audio' },
    { id: 3, name: 'TEXT 1', type: 'text' }
  ];

  const handleAddClipToTrack = async (trackNumber: number, trackType: string) => {
    if (!isSubscribed) {
      setShowSubscribeModal(true);
      return;
    }
    if (!selectedMedia) return;

    if (!currentProject) {
      return;
    }

    const mediaFile = mediaFiles.find(m => m.id === selectedMedia);
    if (!mediaFile) return;

    const startTime = timelineClips
      .filter(c => c.track_number === trackNumber)
      .reduce((max, clip) => Math.max(max, clip.end_time), 0);

    const clipDuration = 5;

    setSaving(true);
    await addTimelineClip({
      project_id: currentProject.id,
      media_file_id: mediaFile.id,
      track_number: trackNumber,
      track_type: trackType,
      start_time: startTime,
      end_time: startTime + clipDuration,
      trim_start: 0,
      trim_end: 0,
      properties: {}
    });
    setSaving(false);
  };

  const getClipsForTrack = (trackNumber: number) => {
    return timelineClips.filter(c => c.track_number === trackNumber);
  };

  const handleMediaDragStart = (mediaId: string) => {
    setDraggedMedia(mediaId);
  };

  const handleMediaDragEnd = () => {
    setDraggedMedia(null);
    setDragOverTrack(null);
  };

  const handleTrackDragOver = (e: React.DragEvent, trackNumber: number) => {
    e.preventDefault();
    setDragOverTrack(trackNumber);
  };

  const handleTrackDragLeave = () => {
    setDragOverTrack(null);
  };

  const handleTrackDrop = async (e: React.DragEvent, trackNumber: number, trackType: string) => {
    e.preventDefault();
    setDragOverTrack(null);

    if (draggedClip) {
      return;
    }

    if (!draggedMedia || !isSubscribed) {
      if (!isSubscribed) {
        setShowSubscribeModal(true);
      }
      return;
    }

    if (!currentProject) {
      return;
    }

    const mediaFile = mediaFiles.find(m => m.id === draggedMedia);
    if (!mediaFile) return;

    const startTime = timelineClips
      .filter(c => c.track_number === trackNumber)
      .reduce((max, clip) => Math.max(max, clip.end_time), 0);

    const clipDuration = 5;

    setSaving(true);
    await addTimelineClip({
      project_id: currentProject.id,
      media_file_id: mediaFile.id,
      track_number: trackNumber,
      track_type: trackType,
      start_time: startTime,
      end_time: startTime + clipDuration,
      trim_start: 0,
      trim_end: 0,
      properties: {}
    });
    setSaving(false);
    setDraggedMedia(null);
  };

  const handleClipDragStart = (clipId: string) => {
    setDraggedClip(clipId);
  };

  const handleClipDragEnd = () => {
    setDraggedClip(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    const MAX_FILE_SIZE = 100 * 1024 * 1024 * 1024;
    const oversizedFiles = Array.from(files).filter(f => f.size > MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`).join('\n');
      alert(`The following files exceed the 100GB limit:\n\n${fileList}\n\nPlease use smaller files or compress them first.`);
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    setUploadCount(files.length);

    const errors: string[] = [];

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (error || !data) {
          console.error(`Failed to upload ${file.name}:`, error);
          errors.push(`${file.name}: ${error?.message || 'Unknown error'}`);
          return null;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const fileType = file.type.split('/')[0];

        return {
          user_id: user.id,
          project_id: currentProject?.id || null,
          file_name: file.name,
          file_type: fileType,
          file_url: publicUrl,
          file_size: file.size,
          duration: 0,
          metadata: { originalName: file.name, mimeType: file.type }
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter(f => f !== null);

      if (validFiles.length > 0) {
        await addMediaFiles(validFiles);
      }

      if (errors.length > 0) {
        alert(`Some files failed to upload:\n\n${errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadCount(0);
    }

    e.target.value = '';
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
              You need an active subscription to use the timeline editor and add clips to your projects.
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
            <h1 className="text-2xl font-bold text-white">TIMELINE EDITOR</h1>
            <p className="text-sm text-gray-400">
              {currentProject ? currentProject.project_name : 'New Session'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/media')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="w-64 bg-white/5 border border-purple-600/30 rounded-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-purple-400">MEDIA LIBRARY</h2>
              <label className="cursor-pointer">
                <Upload className="w-4 h-4 text-blue-400 hover:text-blue-300 transition-colors" />
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            {isUploading && (
              <div className="mb-3 text-xs text-purple-400 text-center animate-pulse">
                Uploading {uploadCount} file(s)...
              </div>
            )}
            {mediaFiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-3">No media files</p>
                <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs text-white transition-all cursor-pointer inline-block">
                  Upload Files
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {mediaFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedMedia(file.id)}
                    draggable
                    onDragStart={() => handleMediaDragStart(file.id)}
                    onDragEnd={handleMediaDragEnd}
                    className={`w-full p-3 rounded-lg text-left text-sm transition-all cursor-move ${
                      selectedMedia === file.id
                        ? 'bg-purple-600 text-white'
                        : draggedMedia === file.id
                        ? 'bg-purple-500/50 text-white opacity-50'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  >
                    <div className="font-semibold truncate mb-1">{file.file_name}</div>
                    <div className="text-xs opacity-70">{file.file_type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 bg-white/5 border border-purple-600/30 rounded-lg p-4">
              <div className="h-full bg-black rounded-lg flex items-center justify-center border-2 border-purple-600/20">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <Play className="w-16 h-16 text-purple-400" />
                  </div>
                  <p className="text-gray-500">Video Preview Window</p>
                  <p className="text-sm text-gray-600 mt-2">1920x1080 • 30fps</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <div className="h-80 bg-white/5 border border-purple-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-purple-400">MULTI-TRACK TIMELINE</h3>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400">
                    {timelineClips.length} clips
                  </span>
                  {saving && (
                    <div className="flex items-center gap-2 text-xs text-purple-400">
                      <Save className="w-3 h-3 animate-pulse" />
                      Saving...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto h-60">
                {tracks.map((track) => {
                  const clips = getClipsForTrack(track.id);
                  const isDropTarget = dragOverTrack === track.id;
                  return (
                    <div
                      key={track.id}
                      className={`h-16 border rounded flex items-center px-2 transition-all ${
                        isDropTarget
                          ? 'bg-purple-600/30 border-purple-400 scale-105'
                          : 'bg-black/50 border-purple-600/20'
                      }`}
                      onDragOver={(e) => handleTrackDragOver(e, track.id)}
                      onDragLeave={handleTrackDragLeave}
                      onDrop={(e) => handleTrackDrop(e, track.id, track.type)}
                    >
                      <span className="text-xs text-purple-400 w-20 font-semibold">{track.name}</span>
                      <div className="flex-1 flex gap-1 items-center relative h-12">
                        {clips.map((clip) => {
                          const mediaFile = mediaFiles.find(m => m.id === clip.media_file_id);
                          const width = ((clip.end_time - clip.start_time) / movieDuration) * 100;
                          const left = (clip.start_time / movieDuration) * 100;

                          return (
                            <div
                              key={clip.id}
                              draggable
                              onDragStart={() => handleClipDragStart(clip.id)}
                              onDragEnd={handleClipDragEnd}
                              className={`absolute h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded flex items-center justify-center overflow-hidden cursor-move transition-opacity ${
                                draggedClip === clip.id ? 'opacity-50' : 'opacity-100'
                              }`}
                              style={{ width: `${width}%`, left: `${left}%` }}
                            >
                              <span className="text-xs text-white truncate px-2">
                                {mediaFile?.file_name || 'Clip'}
                              </span>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => handleAddClipToTrack(track.id, track.type)}
                          disabled={!selectedMedia || saving}
                          className="absolute right-2 p-1 bg-purple-600/50 hover:bg-purple-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-center text-xs text-gray-500">
                {draggedMedia ? (
                  <span className="text-purple-400 font-semibold">Drop media onto a track to add it</span>
                ) : selectedMedia ? (
                  <>Drag media onto a track or click <Plus className="w-3 h-3 inline" /> to add</>
                ) : (
                  'Select or drag a media file from the library to add it to the timeline'
                )}
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
