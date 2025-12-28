import { useNavigate } from 'react-router-dom';
import { Upload, FolderOpen, Image, Video, Music, FileText, Trash2, Download, CheckCircle, ArrowLeft, ArrowRight, GripVertical } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import EditorNav from '../components/EditorNav';
import MediaSkeleton from '../components/MediaSkeleton';

export default function MediaLibrary() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { mediaFiles, addMediaFiles, deleteMediaFile, currentProject } = useProject();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [draggedFile, setDraggedFile] = useState<any>(null);
  const [previewDropActive, setPreviewDropActive] = useState(false);
  const [timelineDropActive, setTimelineDropActive] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [timelineItems, setTimelineItems] = useState<any[]>([]);

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
          return null;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const fileType = file.type.split('/')[0];

        let duration = 0;
        if (fileType === 'video' || fileType === 'audio') {
          duration = await getMediaDuration(file);
        }

        return {
          user_id: user.id,
          project_id: currentProject?.id || null,
          file_name: file.name,
          file_type: fileType,
          file_url: publicUrl,
          file_size: file.size,
          duration: Math.round(duration),
          metadata: { originalName: file.name, mimeType: file.type }
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter(f => f !== null);

      if (validFiles.length > 0) {
        await addMediaFiles(validFiles);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadCount(0);
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
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Uploading {uploadCount} file{uploadCount !== 1 ? 's' : ''}...</p>
                <p className="text-blue-200 text-xs">Please wait</p>
              </div>
            </div>
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
                onClick={() => navigate('/community')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
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
                  <a
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
