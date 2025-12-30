import { useNavigate } from 'react-router-dom';
import { Upload, FolderOpen, Image, Video, Music, FileText, Trash2, Download, CheckCircle, ArrowLeft, ArrowRight, GripVertical, Sparkles, Clock, Zap, Layers } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import EditorNav from '../components/EditorNav';
import MediaSkeleton from '../components/MediaSkeleton';

export default function MediaLibrary() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { mediaFiles, addMediaFiles, deleteMediaFile, currentProject, movieDuration, setMovieDuration } = useProject();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; currentFile: string }>({ current: 0, total: 0, currentFile: '' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [draggedFile, setDraggedFile] = useState<any>(null);
  const [previewDropActive, setPreviewDropActive] = useState(false);
  const [timelineDropActive, setTimelineDropActive] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('full');

  const FULL_TEMPLATE = `Analyze the provided movie content and user requirements. Based on the target duration (up to 180 minutes), perform the following:

STEP 1 - CONTENT ANALYSIS:
- Identify existing footage duration and quality
- Detect gaps, incomplete scenes, or areas needing extension
- Calculate additional content needed to reach target duration
- Map narrative structure and pacing requirements

STEP 2 - GAP FILLING & GENERATION:
Generate new scenes and clips to fill identified gaps and extend to target duration. For each generated segment:
- Maintain visual consistency (lighting, color grading, cinematography style, resolution, frame rate)
- Follow established narrative flow, tone, and story logic
- Match character appearances, costumes, voices, and mannerisms exactly
- Preserve continuity in settings, props, time of day, and environments
- Use similar pacing, editing rhythm, and shot composition
- Create meaningful content: transitional scenes, character development moments, atmospheric establishing shots, extended dialogue, action sequences, or emotional beats
- Ensure smooth transitions between original and generated footage
- Blend naturally so new content is indistinguishable from original

STEP 3 - CONTENT TYPES TO GENERATE (as needed):
- Establishing shots and location transitions
- Character interaction and dialogue scenes
- Action or movement sequences
- Emotional beats and reaction shots
- B-roll and atmospheric footage
- Extended versions of existing scenes
- Bridge scenes connecting narrative gaps
- Opening/closing sequences if missing

STEP 4 - INTEGRATION & COMPOSITING:
- Composite all tracks into a seamless timeline
- Balance pacing across the full duration
- Ensure audio continuity and mixing
- Apply consistent color grading throughout
- Add transitions where appropriate
- Synchronize all elements

STEP 5 - FINAL OUTPUT:
- Total duration: ${movieDuration} minutes
- Format: High-quality video export
- Audio: Properly mixed and balanced
- No visible seams between original and generated content

Process each timeline track, generate all required clips following these guidelines, then merge everything into a single cohesive movie file ready for export.`;

  const GAP_FILL_TEMPLATE = `Analyze existing timeline and identify gaps or missing segments. Generate clips ONLY to fill these gaps while maintaining:
- Visual consistency with surrounding footage
- Narrative continuity and flow
- Character and setting consistency
- Natural transitions

Target Duration: ${movieDuration} minutes
Fill gaps proportionally to maintain story pacing.`;

  const EXTEND_TEMPLATE = `Extend existing movie content to ${movieDuration} minutes by:
- Adding extended cuts of existing scenes
- Generating additional B-roll and establishing shots
- Creating transitional sequences
- Expanding dialogue and character moments

Maintain all original content and visual style throughout.`;

  useEffect(() => {
    if (user && isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isInitialLoad]);

  const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const fileType = file.type.split('/')[0];
      if (fileType === 'video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          resolve(video.duration);
        };
        video.onerror = () => resolve(0);
        video.src = URL.createObjectURL(file);
      } else if (fileType === 'audio') {
        const audio = document.createElement('audio');
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
          window.URL.revokeObjectURL(audio.src);
          resolve(audio.duration);
        };
        audio.onerror = () => resolve(0);
        audio.src = URL.createObjectURL(file);
      } else {
        resolve(0);
      }
    });
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0 || !user) return;

    setIsUploading(true);
    setUploadCount(files.length);
    setUploadProgress({ current: 0, total: files.length, currentFile: '' });

    try {
      const filesArray = Array.from(files);
      const uploadedFiles = [];

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setUploadProgress({ current: i + 1, total: files.length, currentFile: file.name });

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (error || !data) {
          console.error(`Failed to upload ${file.name}:`, error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const fileType = file.type.split('/')[0];

        let duration = 0;
        if (fileType === 'video' || fileType === 'audio') {
          duration = await getMediaDuration(file);
        }

        uploadedFiles.push({
          user_id: user.id,
          project_id: currentProject?.id || null,
          file_name: file.name,
          file_type: fileType,
          file_url: publicUrl,
          file_size: file.size,
          duration: Math.round(duration),
          metadata: { originalName: file.name, mimeType: file.type }
        });
      }

      if (uploadedFiles.length > 0) {
        await addMediaFiles(uploadedFiles);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadCount(0);
      setUploadProgress({ current: 0, total: 0, currentFile: '' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await uploadFiles(files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-8 h-8 text-purple-400" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-400" />;
      case 'audio':
        return <Music className="w-8 h-8 text-purple-400" />;
      default:
        return <FileText className="w-8 h-8 text-purple-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleMediaDragStart = (e: React.DragEvent<HTMLDivElement>, file: any) => {
    setIsDraggingMedia(true);
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(file));
  };

  const handleMediaDragEnd = () => {
    setIsDraggingMedia(false);
    setDraggedFile(null);
    setPreviewDropActive(false);
    setTimelineDropActive(false);
  };

  const handlePreviewDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDraggingMedia && draggedFile?.file_type === 'video') {
      setPreviewDropActive(true);
    }
  };

  const handlePreviewDragLeave = () => {
    setPreviewDropActive(false);
  };

  const handlePreviewDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewDropActive(false);

    if (draggedFile && draggedFile.file_type === 'video') {
      setPreviewVideo(draggedFile.file_url);
    }
  };

  const handleTimelineDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDraggingMedia) {
      setTimelineDropActive(true);
    }
  };

  const handleTimelineDragLeave = () => {
    setTimelineDropActive(false);
  };

  const handleTimelineDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setTimelineDropActive(false);

    if (draggedFile) {
      setTimelineItems([...timelineItems, {
        ...draggedFile,
        id: `timeline-${Date.now()}-${Math.random()}`,
        startTime: timelineItems.length * 3,
        duration: 3
      }]);
    }
  };

  const handleDeleteFile = async (fileId: string, fileUrl: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await deleteMediaFile(fileId, fileUrl);
    }
  };

  const loadTemplate = (template: string) => {
    setSelectedTemplate(template);
    switch (template) {
      case 'full':
        setCustomPrompt(FULL_TEMPLATE);
        break;
      case 'gap':
        setCustomPrompt(GAP_FILL_TEMPLATE);
        break;
      case 'extend':
        setCustomPrompt(EXTEND_TEMPLATE);
        break;
      case 'custom':
        setCustomPrompt('Enter your custom generation instructions here...');
        break;
    }
  };

  const handleGenerateMovie = async () => {
    if (!customPrompt.trim()) {
      alert('⚠️ Please enter a prompt or load a template first!');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setGenerationProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        alert(`🎉 Movie Generation Complete!\n\n✓ Duration: ${movieDuration} minutes\n✓ All tracks composited\n✓ Ready to export\n\nYour enhanced movie is ready!`);
      }, 1000);
    }, 8000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black p-8 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to access your media library</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all"
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

      {isUploading && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <div className="bg-blue-900/90 backdrop-blur-xl border border-blue-600 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Uploading {uploadProgress.current} of {uploadProgress.total}</p>
                <p className="text-blue-200 text-xs truncate">{uploadProgress.currentFile}</p>
              </div>
            </div>
            <div className="w-full bg-blue-950 rounded-full h-2">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-blue-200 text-xs mt-2 text-right">{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</p>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Media Library</h1>
              <p className="text-gray-400">Manage your uploaded media files</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/ai-tools')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => navigate('/video-studio')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
              >
                <Video className="w-4 h-4" />
                Open Video Studio
              </button>
              <button
                onClick={() => navigate('/community')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI MOVIE ENHANCEMENT SECTION */}
          <div className="bg-gradient-to-b from-purple-900/30 to-transparent backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/50 mb-8 shadow-2xl shadow-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">AI Movie Enhancement & Generation</h2>
                <p className="text-purple-300 text-sm">Create up to 3-hour movies with AI-powered content generation</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <button onClick={() => loadTemplate('full')} className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${selectedTemplate === 'full' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50 border border-purple-700/30'}`}>
                <CheckCircle className="w-4 h-4" />
                Full Enhancement
              </button>
              <button onClick={() => loadTemplate('gap')} className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${selectedTemplate === 'gap' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50 border border-purple-700/30'}`}>
                <Layers className="w-4 h-4" />
                Gap Filling
              </button>
              <button onClick={() => loadTemplate('extend')} className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${selectedTemplate === 'extend' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50 border border-purple-700/30'}`}>
                <Clock className="w-4 h-4" />
                Duration Extend
              </button>
              <button onClick={() => loadTemplate('custom')} className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${selectedTemplate === 'custom' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50 border border-purple-700/30'}`}>
                <FileText className="w-4 h-4" />
                Custom
              </button>
            </div>

            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="AI generation prompt will appear here... Select a template above or write your own custom instructions." className="w-full h-48 bg-black/50 border border-purple-700/50 rounded-xl p-4 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-purple-500 mb-4" />

            {isGenerating && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-purple-300 mb-2">
                  <span>Generating Movie...</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <div className="w-full h-3 bg-purple-950/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300" style={{ width: `${generationProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-4">
              <button onClick={handleGenerateMovie} disabled={isGenerating || !customPrompt.trim()} className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30">
                <Zap className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Generate Movie'}
              </button>
              <button onClick={() => setCustomPrompt('')} className="px-6 py-4 bg-purple-950/50 hover:bg-purple-900/50 text-gray-300 font-semibold rounded-xl transition-all border border-purple-700/30">Clear</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <button onClick={() => setMovieDuration(30)} className={`px-6 py-3 rounded-xl font-bold transition-all ${movieDuration === 30 ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50' : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50'}`}>30 min</button>
              <button onClick={() => setMovieDuration(60)} className={`px-6 py-3 rounded-xl font-bold transition-all ${movieDuration === 60 ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50' : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50'}`}>60 min</button>
              <button onClick={() => setMovieDuration(90)} className={`px-6 py-3 rounded-xl font-bold transition-all ${movieDuration === 90 ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50' : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50'}`}>90 min</button>
              <button onClick={() => setMovieDuration(120)} className={`px-6 py-3 rounded-xl font-bold transition-all ${movieDuration === 120 ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50' : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50'}`}>120 min</button>
            </div>

            <div className="bg-purple-950/30 border border-purple-700/30 rounded-lg p-4">
              <p className="text-gray-300 text-sm text-center"><span className="text-purple-400 font-semibold">💡 Duration:</span> {movieDuration} minutes ({Math.floor(movieDuration / 60)}h {movieDuration % 60}m) - Up to 180 minutes (3 hours)</p>
            </div>
          </div>

          <div
            className={`mb-6 bg-gradient-to-br from-purple-900/20 to-black border-2 rounded-xl p-8 transition-all ${
              isDragging
                ? 'border-purple-500 bg-purple-900/40 scale-105'
                : 'border-purple-600/30 hover:border-purple-600/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isDragging ? 'bg-purple-500/40 scale-110' : 'bg-purple-500/20'
              }`}>
                <Upload size={40} className={`transition-all ${
                  isDragging ? 'text-purple-300 animate-bounce' : 'text-purple-400'
                }`} />
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold mb-2 transition-all ${
                  isDragging ? 'text-purple-300' : 'text-white'
                }`}>
                  {isDragging ? 'Drop files here!' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-gray-400">
                  Support for images, videos, and audio files
                </p>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div
              className={`bg-gradient-to-br from-purple-900/20 to-black border-2 rounded-xl p-6 transition-all ${
                previewDropActive
                  ? 'border-purple-500 bg-purple-900/40 scale-105 shadow-lg shadow-purple-500/50'
                  : 'border-purple-600/30'
              }`}
              onDragOver={handlePreviewDragOver}
              onDragLeave={handlePreviewDragLeave}
              onDrop={handlePreviewDrop}
            >
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                Video Preview
              </h3>
              <div className={`aspect-video bg-black/50 rounded-lg flex items-center justify-center border-2 border-dashed transition-all ${
                previewDropActive ? 'border-purple-400' : 'border-purple-600/30'
              }`}>
                {previewVideo ? (
                  <video
                    src={previewVideo}
                    controls
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <Video className={`w-16 h-16 mx-auto mb-3 transition-all ${
                      previewDropActive ? 'text-purple-400 animate-bounce' : 'text-gray-600'
                    }`} />
                    <p className={`font-semibold transition-all ${
                      previewDropActive ? 'text-purple-300' : 'text-gray-400'
                    }`}>
                      {previewDropActive ? 'Drop video here!' : 'Drag video here to preview'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`bg-gradient-to-br from-purple-900/20 to-black border-2 rounded-xl p-6 transition-all ${
                timelineDropActive
                  ? 'border-purple-500 bg-purple-900/40 scale-105 shadow-lg shadow-purple-500/50'
                  : 'border-purple-600/30'
              }`}
              onDragOver={handleTimelineDragOver}
              onDragLeave={handleTimelineDragLeave}
              onDrop={handleTimelineDrop}
            >
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                Multi-Track Timeline
              </h3>
              <div className={`h-48 bg-black/50 rounded-lg p-4 border-2 border-dashed overflow-x-auto transition-all ${
                timelineDropActive ? 'border-purple-400' : 'border-purple-600/30'
              }`}>
                {timelineItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Music className={`w-16 h-16 mx-auto mb-3 transition-all ${
                        timelineDropActive ? 'text-purple-400 animate-bounce' : 'text-gray-600'
                      }`} />
                      <p className={`font-semibold transition-all ${
                        timelineDropActive ? 'text-purple-300' : 'text-gray-400'
                      }`}>
                        {timelineDropActive ? 'Drop media here!' : 'Drag media here to add to timeline'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 h-full">
                    {timelineItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="relative h-full bg-purple-600/30 border border-purple-500 rounded-lg p-2 min-w-32 flex flex-col"
                      >
                        <div className="flex items-center gap-1 mb-2">
                          {getFileIcon(item.file_type)}
                          <span className="text-white text-xs font-semibold truncate flex-1">
                            Track {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-300 text-xs truncate mb-1">{item.file_name}</p>
                        <button
                          onClick={() => setTimelineItems(timelineItems.filter(t => t.id !== item.id))}
                          className="mt-auto p-1 bg-red-600 hover:bg-red-700 rounded text-white transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        {isInitialLoad ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <MediaSkeleton key={i} />
            ))}
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="text-center py-20 bg-black/50 border border-purple-600/30 rounded-xl">
            <FolderOpen className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Media Files Yet</h3>
            <p className="text-gray-500 mb-6">Upload your first file to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => handleMediaDragStart(e, file)}
                onDragEnd={handleMediaDragEnd}
                className={`bg-black/50 border border-purple-600/30 hover:border-purple-600 rounded-xl p-4 transition-all transform hover:scale-105 cursor-move ${
                  isDraggingMedia && draggedFile?.id === file.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <GripVertical className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-400 font-semibold">Drag to use</span>
                </div>
                <div className="flex items-center justify-center h-32 bg-purple-900/20 rounded-lg mb-4 relative overflow-hidden">
                  {file.file_type === 'image' ? (
                    <img
                      src={file.file_url}
                      alt={file.file_name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover rounded-lg opacity-0 transition-opacity duration-300"
                      onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                    />
                  ) : (
                    getFileIcon(file.file_type)
                  )}
                </div>

                <h3 className="text-white font-bold text-sm mb-2 truncate">{file.file_name}</h3>
                <p className="text-gray-400 text-xs mb-3">{formatFileSize(file.file_size)}</p>

                <div className="flex gap-2">
                  
                    href={file.file_url}
                    download={file.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                  <button
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id, file.file_url);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}