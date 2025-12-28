import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, CheckCircle, XCircle, Film, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  listStaticVideos,
  uploadStaticVideo,
  deleteStaticVideo,
  checkRequiredVideos,
  REQUIRED_VIDEOS,
  VideoAsset,
} from '../lib/videoAssets';

export default function VideoManager() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [requiredVideos, setRequiredVideos] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    loadVideos();
  }, [user, isAdmin, navigate]);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const [videoList, required] = await Promise.all([
        listStaticVideos(),
        checkRequiredVideos(),
      ]);
      setVideos(videoList);
      setRequiredVideos(required);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, targetFilename?: string) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const url = await uploadStaticVideo(file, targetFilename);
      if (url) {
        setUploadProgress('Upload successful!');
        await loadVideos();
        setTimeout(() => setUploadProgress(''), 2000);
      } else {
        setUploadProgress('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete ${filename}? This cannot be undone.`)) return;

    try {
      const success = await deleteStaticVideo(filename);
      if (success) {
        await loadVideos();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const getVideoDescription = (filename: string) => {
    switch (filename) {
      case REQUIRED_VIDEOS.BACKGROUND:
        return 'Background video for Pages 1 & 2';
      case REQUIRED_VIDEOS.AVATAR:
        return 'Avatar video for Page 1 (bottom-right)';
      case REQUIRED_VIDEOS.DOXY_MOVIE:
        return 'Main movie "Doxy: The School Bully" (90 min)';
      case REQUIRED_VIDEOS.OUTRO:
        return 'Closing video for Page 21';
      default:
        return 'Custom video asset';
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Video Asset Manager</h1>
            <p className="text-gray-400">Upload and manage static video files for your app</p>
          </div>
          <button
            onClick={() => navigate('/media')}
            className="flex items-center gap-2 px-6 py-3 bg-purple-900/50 hover:bg-purple-800 text-white font-bold rounded-lg transition-all border border-purple-600/50"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Media
          </button>
        </div>

        <div className="bg-black/50 border border-purple-600/30 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Required Videos Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(REQUIRED_VIDEOS).map(([key, filename]) => (
              <div
                key={key}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                  requiredVideos[filename]
                    ? 'bg-green-900/20 border-green-600/50'
                    : 'bg-red-900/20 border-red-600/50'
                }`}
              >
                {requiredVideos[filename] ? (
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{filename}</div>
                  <div className="text-sm text-gray-400">{getVideoDescription(filename)}</div>
                </div>
                {!requiredVideos[filename] && (
                  <label className="cursor-pointer px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded transition-all">
                    Upload
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, filename);
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/50 border border-purple-600/30 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Upload Custom Video</h2>
            <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all">
              <Upload className="w-5 h-5" />
              Choose File
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                disabled={isUploading}
              />
            </label>
          </div>
          {uploadProgress && (
            <div className="text-center py-2 px-4 bg-purple-900/30 border border-purple-600/50 rounded-lg">
              <p className="text-purple-300 font-semibold">{uploadProgress}</p>
            </div>
          )}
        </div>

        <div className="bg-black/50 border border-purple-600/30 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Uploaded Videos ({videos.length})</h2>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-purple-900/20 rounded-lg p-4 animate-pulse">
                  <div className="h-6 bg-purple-900/30 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-purple-900/30 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No videos uploaded yet</p>
              <p className="text-gray-500 text-sm mt-2">Upload the required videos to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => (
                <div
                  key={video.name}
                  className="flex items-center justify-between p-4 bg-purple-900/20 hover:bg-purple-900/30 rounded-lg border border-purple-600/30 transition-all"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <Film className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <h3 className="font-bold text-white truncate">{video.name}</h3>
                      {Object.values(REQUIRED_VIDEOS).includes(video.name) && (
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
                          REQUIRED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 ml-8">{getVideoDescription(video.name)}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 ml-8">
                      <span>Size: {formatFileSize(video.size)}</span>
                      {video.uploadedAt && (
                        <span>Uploaded: {video.uploadedAt.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded transition-all"
                    >
                      Preview
                    </a>
                    <label className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded transition-all">
                      Replace
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, video.name);
                        }}
                      />
                    </label>
                    <button
                      onClick={() => handleDelete(video.name)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all"
                      title="Delete video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-purple-900/20 border border-purple-600/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">Important Notes</h3>
          <ul className="text-gray-400 space-y-2 text-sm list-disc list-inside">
            <li>Maximum file size: 5GB per video</li>
            <li>Supported formats: MP4, WebM, OGG</li>
            <li>Required videos must use exact filenames shown above</li>
            <li>Videos are publicly accessible once uploaded</li>
            <li>Replacing a video will update it across all pages immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
