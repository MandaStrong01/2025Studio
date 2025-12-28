import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Sparkles, ArrowLeft, CheckCircle, Lock, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { getToolDescription } from '../data/toolDescriptions';

export default function ToolWorkspace() {
  const { toolName } = useParams<{ toolName: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isSubscribed } = useAuth();
  const { addMediaFile, currentProject } = useProject();
  const [selectedMode, setSelectedMode] = useState<'upload' | 'create' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedMediaId, setGeneratedMediaId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const hasSubscription = isAdmin || isSubscribed;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
  };

  const handleReferenceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReferenceFile(file);
  };

  const handleProcessFile = async () => {
    if (!uploadedFile || !user) return;

    try {
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `media/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, uploadedFile);

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const fileType = uploadedFile.type.split('/')[0];

        const mediaFile = await addMediaFile({
          user_id: user.id,
          project_id: currentProject?.id || null,
          file_name: uploadedFile.name,
          file_type: fileType,
          file_url: publicUrl,
          file_size: uploadedFile.size,
          duration: 0,
          metadata: {
            originalName: uploadedFile.name,
            mimeType: uploadedFile.type,
            uploadedFrom: toolName?.replace(/-/g, ' ') || 'AI Tool'
          }
        });

        if (mediaFile) {
          setUploadedMediaId(mediaFile.id);
          setUploadSuccess(true);
        } else {
          alert('File uploaded but failed to save metadata.');
        }
      } else {
        alert('Failed to upload file. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleAddUploadedToTimeline = async () => {
    if (!currentProject || !uploadedMediaId) {
      alert('No project selected or media not found');
      return;
    }

    try {
      const { data: mediaFile } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', uploadedMediaId)
        .single();

      if (!mediaFile) {
        alert('Media file not found');
        return;
      }

      const { error } = await supabase
        .from('timeline_clips')
        .insert({
          project_id: currentProject.id,
          media_file_id: mediaFile.id,
          start_time: 0,
          end_time: mediaFile.duration || 5,
          track_number: 1,
        });

      if (!error) {
        alert('Added to timeline! Go to Timeline Editor to see it.');
        navigate('/page12');
      } else {
        alert('Failed to add to timeline');
      }
    } catch (error) {
      console.error('Add to timeline error:', error);
      alert('Failed to add to timeline');
    }
  };

  const handleCreateWithAI = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please login to use AI generation');
      navigate('/auth');
      return;
    }

    if (!hasSubscription) {
      setShowSubscriptionModal(true);
      return;
    }

    setSelectedMode('create');
  };

  const handleAddToTimeline = async () => {
    if (!currentProject || !generatedMediaId) {
      alert('No project selected or media not found');
      return;
    }

    try {
      const { data: mediaFile } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', generatedMediaId)
        .single();

      if (!mediaFile) {
        alert('Media file not found');
        return;
      }

      const { error } = await supabase
        .from('timeline_clips')
        .insert({
          project_id: currentProject.id,
          media_file_id: mediaFile.id,
          start_time: 0,
          end_time: mediaFile.duration || 5,
          track_number: 1,
        });

      if (!error) {
        alert('Added to timeline! Go to Timeline Editor to see it.');
        navigate('/page12');
      } else {
        alert('Failed to add to timeline');
      }
    } catch (error) {
      console.error('Add to timeline error:', error);
      alert('Failed to add to timeline');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!hasSubscription) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please login to generate content');
        navigate('/auth');
        return;
      }

      const isImageTool = toolName?.toLowerCase().includes('image');
      const isVideoTool = toolName?.toLowerCase().includes('video');

      const functionName = isImageTool ? 'generate-image' : isVideoTool ? 'generate-video' : 'generate-image';

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            toolName: toolName?.replace(/-/g, ' '),
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        const contentUrl = result.imageUrl || result.videoUrl;
        setGeneratedContent(contentUrl);

        const isImage = !!result.imageUrl;
        const fileType = isImage ? 'image' : 'video';
        const fileName = `AI-Generated-${toolName?.replace(/-/g, '-')}-${Date.now()}.${isImage ? 'png' : 'mp4'}`;

        const mediaFile = await addMediaFile({
          user_id: user.id,
          project_id: currentProject?.id || null,
          file_name: fileName,
          file_type: fileType,
          file_url: contentUrl,
          file_size: 0,
          duration: 0,
          metadata: {
            generatedBy: 'AI',
            prompt: prompt,
            toolName: toolName?.replace(/-/g, ' '),
            generatedAt: new Date().toISOString()
          }
        });

        if (mediaFile) {
          setGeneratedMediaId(mediaFile.id);
        }
      } else {
        alert('Generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-purple-900/50 to-slate-900 border-2 border-purple-500 rounded-3xl p-12 max-w-2xl w-full relative">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Lock size={40} className="text-purple-400" />
                </div>
                <h2 className="text-4xl font-black text-white">Subscription Required</h2>
                <p className="text-xl text-slate-300">
                  Subscribe to unlock AI generation and create amazing content
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => navigate('/auth')}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all"
                  >
                    View Plans
                  </button>
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4 capitalize">
              {toolName?.replace(/-/g, ' ')}
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              {getToolDescription(toolName || '')}
            </p>
            <p className="text-lg text-slate-400">
              Choose how you want to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              onClick={() => setSelectedMode('upload')}
              className="group cursor-pointer bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-2xl p-12 hover:border-blue-500 hover:bg-slate-800/80 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Upload size={48} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Upload</h2>
                  <p className="text-slate-400 text-lg">
                    Upload your existing files to enhance, edit, or transform them
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={handleCreateWithAI}
              className="group cursor-pointer bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-2xl p-12 hover:border-purple-500 hover:bg-slate-800/80 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <Sparkles size={48} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Create with AI</h2>
                  <p className="text-slate-400 text-lg">
                    Generate new content from scratch using AI technology
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedMode === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <button
            onClick={() => setSelectedMode(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Upload Your File
            </h1>
            <p className="text-lg text-slate-300 mb-2 capitalize">
              {toolName?.replace(/-/g, ' ')}
            </p>
            <p className="text-base text-slate-400">
              {getToolDescription(toolName || '')}
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-dashed border-slate-600 rounded-2xl p-16 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
            />
            {!uploadedFile ? (
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-6"
              >
                <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Upload size={64} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-slate-400">
                    Support for images, videos, audio, and documents
                  </p>
                </div>
              </label>
            ) : uploadSuccess ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-green-500/20 border border-green-500 rounded-xl p-6 flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <p className="text-white font-semibold">File uploaded successfully!</p>
                </div>
                <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={64} className="text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white mb-2">
                    {uploadedFile.name}
                  </p>
                  <p className="text-slate-400">
                    File uploaded to your media library
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                  <button
                    onClick={handleAddUploadedToTimeline}
                    disabled={!currentProject}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add to Timeline
                  </button>
                  <button
                    onClick={() => navigate('/media')}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all"
                  >
                    View in Media Library
                  </button>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadedMediaId(null);
                      setUploadSuccess(false);
                    }}
                    className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Upload size={64} className="text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white mb-2">
                    {uploadedFile.name}
                  </p>
                  <p className="text-slate-400">
                    File ready to process
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleProcessFile}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Process & Upload
                  </button>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                  >
                    Change File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => setSelectedMode(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Create with AI
          </h1>
          <p className="text-lg text-slate-300 mb-2 capitalize">
            {toolName?.replace(/-/g, ' ')}
          </p>
          <p className="text-base text-slate-400">
            {getToolDescription(toolName || '')}
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-2xl p-12">
          {!generatedContent ? (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3 text-lg">
                  Describe what you want to create
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    maxLength={2000}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[200px] text-lg"
                    placeholder="Enter your prompt here... Be as detailed as possible for best results."
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-slate-500">
                    {prompt.length}/2000
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setPrompt('A futuristic cyberpunk cityscape at night with neon lights, flying cars, and towering skyscrapers reflecting in rain-soaked streets')}
                    className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    Cyberpunk City
                  </button>
                  <button
                    onClick={() => setPrompt('A serene mountain landscape at golden hour with a crystal clear lake, pine trees, and snow-capped peaks in the background')}
                    className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    Mountain Landscape
                  </button>
                  <button
                    onClick={() => setPrompt('An abstract geometric pattern with vibrant colors, modern design, and dynamic shapes flowing across the canvas')}
                    className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    Abstract Art
                  </button>
                  <button
                    onClick={() => setPrompt('A professional product photography setup with perfect lighting, soft shadows, and a minimalist white background')}
                    className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    Product Photo
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <label className="block text-white font-semibold mb-3 text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" />
                  Add Reference File (Optional)
                </label>
                <p className="text-sm text-slate-400 mb-4">
                  Upload an image or video as a reference for the AI to guide generation
                </p>
                <input
                  type="file"
                  id="reference-file-upload"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleReferenceFileUpload}
                />
                {!referenceFile ? (
                  <label
                    htmlFor="reference-file-upload"
                    className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-xl hover:border-purple-500 hover:bg-slate-800/50 transition-all cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300 font-medium">Click to upload reference file</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-2 border-purple-500 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">{referenceFile.name}</span>
                      <span className="text-sm text-slate-400">
                        ({(referenceFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => setReferenceFile(null)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Style
                  </label>
                  <select className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Professional</option>
                    <option>Creative</option>
                    <option>Minimalist</option>
                    <option>Artistic</option>
                    <option>Realistic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">
                    Quality
                  </label>
                  <select className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Standard</option>
                    <option>High</option>
                    <option>Ultra</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <Sparkles size={24} />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-500/20 border border-green-500 rounded-xl p-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <p className="text-white font-semibold">Content generated successfully!</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6">
                {toolName?.toLowerCase().includes('image') ? (
                  <img src={generatedContent} alt="Generated" className="w-full rounded-lg" />
                ) : (
                  <video src={generatedContent} controls className="w-full rounded-lg" />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToTimeline}
                  disabled={!currentProject}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add to Timeline
                </button>
                <button
                  onClick={() => navigate('/media')}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all"
                >
                  View in Media Library
                </button>
                <button
                  onClick={() => {
                    setGeneratedContent(null);
                    setGeneratedMediaId(null);
                    setPrompt('');
                  }}
                  className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                >
                  Generate Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
