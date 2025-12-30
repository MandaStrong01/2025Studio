Ah! The issue is that the bullet points (•) in the template strings are being interpreted as code. We need to escape them or use regular dashes. Let me fix that:

```typescript
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Film, Scissors, Music, Sliders, Layers, Sparkles, Clock, Upload, Zap, FileText, CheckCircle } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState } from 'react';
import EditorNav from '../components/EditorNav';

export default function Page11() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { movieDuration, setMovieDuration, addMediaFiles, currentProject } = useProject();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('full');

  // Full AI Generation Template
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

    // Simulate generation progress
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

    // Simulate API call (replace with actual API call)
    setTimeout(() => {
      clearInterval(interval);
      setGenerationProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        alert(`🎉 Movie Generation Complete!\n\n✓ Duration: ${movieDuration} minutes\n✓ All tracks composited\n✓ Ready to export\n\nYour enhanced movie is ready in the timeline!`);
      }, 1000);
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-black relative">
      <EditorNav />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20" />

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/timeline')}
              className="px-4 py-2 bg-purple-900/50 hover:bg-purple-800 rounded-lg text-white text-sm font-semibold transition-all flex items-center gap-2 border border-purple-600/50"
            >
              <ArrowLeft className="w-4 h-4" />
              My Projects
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/video-manager')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-semibold transition-all flex items-center gap-2 border border-purple-500/50"
              >
                <Film className="w-4 h-4" />
                Video Assets
              </button>
            )}
          </div>
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

        {/* AI GENERATION PANEL */}
        <div className="bg-gradient-to-b from-purple-900/30 to-transparent backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/50 mb-12 shadow-2xl shadow-purple-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">AI Movie Enhancement & Generation</h2>
              <p className="text-purple-300 text-sm">Create up to 3-hour movies with AI-powered content generation</p>
            </div>
          </div>

          {/* Template Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => loadTemplate('full')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                selectedTemplate === 'full'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50 border border-purple-700/30'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Full Enhancement
            </button>
            <button
              onClick={() => loadTemplate('gap')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                selectedTemplate === 'gap'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50 border border-purple-700/30'
              }`}
            >
              <Layers className="w-4 h-4" />
              Gap Filling
            </button>
            <button
              onClick={() => loadTemplate('extend')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                selectedTemplate === 'extend'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50 border border-purple-700/30'
              }`}
            >
              <Clock className="w-4 h-4" />
              Duration Extend
            </button>
            <button
              onClick={() => loadTemplate('custom')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                selectedTemplate === 'custom'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-purple-950/50 text-gray-300 hover:bg-purple-900/50 border border-purple-700/30'
              }`}
            >
              <FileText className="w-4 h-4" />
              Custom
            </button>
          </div>

          {/* Prompt Input */}
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="AI generation prompt will appear here... Select a template above or write your own custom instructions."
            className="w-full h-48 bg-black/50 border border-purple-700/50 rounded-xl p-4 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-purple-500 mb-4"
          />

          {/* Generation Progress */}
          {isGenerating && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-purple-300 mb-2">
                <span>Generating Movie...</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-purple-950/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateMovie}
              disabled={isGenerating || !customPrompt.trim()}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
            >
              <Zap className="w-5 h-5" />
              {isGenerating ? 'Generating...' : 'Generate Movie'}
            </button>
            <button
              onClick={() => setCustomPrompt('')}
              className="px-6 py-4 bg-purple-950/50 hover:bg-purple-900/50 text-gray-300 font-semibold rounded-xl transition-all border border-purple-700/30"
            >
              Clear
            </button>
          </div>

          <div className="mt-4 bg-purple-950/30 border border-purple-700/30 rounded-lg p-4">
            <p className="text-gray-300 text-sm text-center">
              <span className="text-purple-400 font-semibold">💡 Tip:</span> The prompt automatically adjusts to your selected duration ({movieDuration} minutes). Choose a template or write custom instructions for best results.
            </p>
          </div>
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
                <span className="text-gray-400">180 min (3 hours)</span>
              </div>
              <input
                type="range"
                min="1"
                max="180"
                value={movieDuration}
                onChange={(e) => setMovieDuration(Number(e.target.value))}
                className="w-full h-4 bg-purple-950/50 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${(movieDuration / 180) * 100}%, rgb(88, 28, 135) ${(movieDuration / 180) * 100}%, rgb(88, 28, 135) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Short</span>
                <span>Feature Length</span>
                <span>Extended (3hrs)</span>
              </div>
            </div>

            <div className="bg-purple-950/30 border border-purple-700/30 rounded-lg p-4">
              <p className="text-gray-300 text-sm text-center">
                <span className="text-purple-400 font-semibold">Tip:</span> Select a preset duration or drag the slider to customize up to 3 hours. Your timeline and AI prompts will adjust automatically.
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