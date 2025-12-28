import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Film, Scissors, Music, Sliders, Layers, Sparkles, Clock, Upload } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState } from 'react';
import EditorNav from '../components/EditorNav';

export default function Page11() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { movieDuration, setMovieDuration, addMediaFiles, currentProject } = useProject();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  const editorFeatures = [
    {
      icon: <Film className="w-12 h-12" />,
      title: "Video Editor",
      description: "Multi-track timeline with professional editing tools"
    },
    {
      icon: <Music className="w-12 h-12" />,
      title: "Audio Mixer",
      description: "Professional audio mixing and effects suite"
    },
    {
      icon: <Sliders className="w-12 h-12" />,
      title: "Color Grading",
      description: "Advanced color correction and grading workspace"
    },
    {
      icon: <Layers className="w-12 h-12" />,
      title: "Effects Library",
      description: "Thousands of transitions, effects, and filters"
    },
    {
      icon: <Scissors className="w-12 h-12" />,
      title: "Precision Tools",
      description: "Frame-accurate cutting and trimming"
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: "AI Enhancement",
      description: "AI-powered upscaling and enhancement"
    }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    const oversizedFiles = Array.from(files).filter(f => f.size > MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`).join('\n');
      alert(`The following files exceed the 50MB limit:\n\n${fileList}\n\nPlease use smaller files or compress them first.`);
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
        navigate('/media-library');
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
    <div className="min-h-screen bg-black relative">
      <EditorNav />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20" />

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/timeline')}
            className="px-4 py-2 bg-purple-900/50 hover:bg-purple-800 rounded-lg text-white text-sm font-semibold transition-all flex items-center gap-2 border border-purple-600/50"
          >
            <ArrowLeft className="w-4 h-4" />
            My Projects
          </button>
          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            {isUploading ? `Uploading ${uploadCount}...` : 'Upload Media'}
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

        <div className="text-center mb-12">
          <h1 className="text-7xl font-black text-transparent bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text mb-4">
            EDITOR SUITE
          </h1>
          <p className="text-2xl text-gray-300 font-light">
            Professional-Grade Video Editing Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {editorFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl rounded-2xl p-8 border border-purple-700/50 hover:border-purple-500 transition-all transform hover:scale-105"
            >
              <div className="text-purple-400 mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-b from-purple-900/20 to-transparent backdrop-blur-xl rounded-2xl p-12 border border-purple-700/50 text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Create?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Upload your media files and jump into our complete suite of professional editing tools!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/media-library')}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
            >
              Media Library
            </button>
            <button
              onClick={() => navigate('/export')}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
            >
              Timeline Editor
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Upload media, edit on timeline, and export your masterpiece
          </p>
        </div>

        <div className="bg-gradient-to-b from-purple-900/20 to-transparent backdrop-blur-xl rounded-2xl p-8 border border-purple-700/50 mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-purple-400" />
            <h3 className="text-3xl font-bold text-white">Set Movie Duration</h3>
          </div>

          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-7xl font-black text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text mb-2">
                {movieDuration}
              </div>
              <div className="text-xl text-purple-400 font-semibold">MINUTES</div>
              <div className="text-sm text-gray-400 mt-2">
                ({Math.floor(movieDuration / 60)}h {movieDuration % 60}m)
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <button
                onClick={() => setMovieDuration(30)}
                className={`px-6 py-4 rounded-xl font-bold transition-all ${
                  movieDuration === 30
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50'
                }`}
              >
                30 min
              </button>
              <button
                onClick={() => setMovieDuration(60)}
                className={`px-6 py-4 rounded-xl font-bold transition-all ${
                  movieDuration === 60
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50'
                }`}
              >
                60 min
              </button>
              <button
                onClick={() => setMovieDuration(90)}
                className={`px-6 py-4 rounded-xl font-bold transition-all ${
                  movieDuration === 90
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50'
                }`}
              >
                90 min
              </button>
              <button
                onClick={() => setMovieDuration(120)}
                className={`px-6 py-4 rounded-xl font-bold transition-all ${
                  movieDuration === 120
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50'
                }`}
              >
                120 min
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">0 min</span>
                <span className="text-gray-400">240 min (4 hours)</span>
              </div>
              <input
                type="range"
                min="1"
                max="240"
                value={movieDuration}
                onChange={(e) => setMovieDuration(Number(e.target.value))}
                className="w-full h-4 bg-purple-950/50 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${(movieDuration / 240) * 100}%, rgb(88, 28, 135) ${(movieDuration / 240) * 100}%, rgb(88, 28, 135) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Short</span>
                <span>Feature Length</span>
                <span>Extended</span>
              </div>
            </div>

            <div className="bg-purple-950/30 border border-purple-700/30 rounded-lg p-4">
              <p className="text-gray-300 text-sm text-center">
                <span className="text-purple-400 font-semibold">Tip:</span> Select a preset duration or drag the slider to customize. Your timeline will adjust automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate('/timeline')}
            className="flex items-center gap-2 px-6 py-3 bg-purple-900/50 hover:bg-purple-800 text-white font-bold rounded-lg transition-all border border-purple-600/50"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => navigate('/export')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
