import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, Film, ArrowLeft, Link } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getAllStaticVideos,
  updateStaticVideo,
  StaticVideo,
} from '../lib/videoAssets';

export default function VideoManager() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [videos, setVideos] = useState<StaticVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string>('');
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
      const videoList = await getAllStaticVideos();
      setVideos(videoList);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, videoKey: string) => {
    if (!file || !user) return;

    setUploadingKey(videoKey);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${videoKey}-${Date.now()}.${fileExt}`;
      const filePath = `static-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setUploadProgress('Upload failed');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const success = await updateStaticVideo(videoKey, publicUrl, user.id);

      if (success) {
        setUploadProgress('Upload successful!');
        await loadVideos();
        setTimeout(() => setUploadProgress(''), 2000);
      } else {
        setUploadProgress('Failed to update database');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('Upload error');
    } finally {
      setUploadingKey('');
      setTimeout(() => setUploadProgress(''), 3000);
    }
  };

  const isVideoConfigured = (video: StaticVideo) => {
    return video.video_url && video.video_url.length > 0;
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

        {uploadProgress && (
          <div className="bg-purple-900/30 border border-purple-600/50 rounded-xl p-4 mb-8">
            <p className="text-purple-300 font-semibold text-center">{uploadProgress}</p>
          </div>
        )}

        <div className="bg-black/50 border border-purple-600/30 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Static Video Configuration</h2>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-purple-900/20 rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-purple-900/30 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-purple-900/30 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No video configuration found</p>
              <p className="text-gray-500 text-sm mt-2">Contact system administrator</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    isVideoConfigured(video)
                      ? 'bg-green-900/10 border-green-600/50'
                      : 'bg-red-900/10 border-red-600/50'
                  } ${uploadingKey === video.video_key ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {isVideoConfigured(video) ? (
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-white">{video.display_name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{video.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Key: <span className="font-mono">{video.video_key}</span></p>
                      </div>
                    </div>
                    <label
                      className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-bold transition-all ${
                        uploadingKey === video.video_key
                          ? 'bg-gray-600 cursor-not-allowed'
                          : isVideoConfigured(video)
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {isVideoConfigured(video) ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={uploadingKey === video.video_key}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, video.video_key);
                        }}
                      />
                    </label>
                  </div>
                  {isVideoConfigured(video) && (
                    <div className="flex items-center gap-3 mt-3 p-3 bg-black/30 rounded-lg border border-purple-600/30">
                      <Link className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-300 hover:text-purple-200 truncate flex-1 font-mono"
                      >
                        {video.video_url}
                      </a>
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-all flex-shrink-0"
                      >
                        Preview
                      </a>
                    </div>
                  )}
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
            <li>Videos are stored in Supabase storage and publicly accessible</li>
            <li>Once uploaded, videos are immediately available to ALL users</li>
            <li>Replacing a video updates it across the entire app instantly</li>
            <li>All 4 static videos are required for the app to function properly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
