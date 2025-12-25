import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, MessageSquare, Upload, TrendingUp, Clock, Flame, User, Film, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  user_profiles?: {
    display_name: string;
    username: string;
  };
}

export default function Page20Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('recent');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isUploadingMovie, setIsUploadingMovie] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [movieTitle, setMovieTitle] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadPosts();
    if (user) {
      loadUserLikes();
    }
  }, [sortBy, user]);

  const loadPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        user_profiles (
          display_name,
          username
        )
      `);

    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('likes_count', { ascending: false });
    } else if (sortBy === 'trending') {
      query = query.order('views_count', { ascending: false });
    }

    const { data, error } = await query.limit(12);

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const loadUserLikes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id);

    if (data) {
      setLikedPosts(new Set(data.map(like => like.post_id)));
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const isLiked = likedPosts.has(postId);

    if (isLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      await supabase.rpc('decrement', {
        table_name: 'community_posts',
        row_id: postId,
        column_name: 'likes_count'
      });

      setLikedPosts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });

      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p));
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });

      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));

      setLikedPosts(prev => new Set([...prev, postId]));
    }
  };

  const incrementViews = async (postId: string) => {
    await supabase
      .from('community_posts')
      .update({ views_count: supabase.rpc('increment', { x: 1 }) })
      .eq('id', postId);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  const handleMovieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    const file = e.target.files[0];

    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }

    setIsUploadingMovie(true);
    setUploadSuccess(false);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `movies/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('public_movies')
        .insert({
          title: movieTitle || file.name,
          video_url: publicUrl
        });

      if (dbError) throw dbError;

      setUploadSuccess(true);
      setMovieTitle('');

      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error uploading movie:', error);
      alert('Failed to upload movie. Please try again.');
    } finally {
      setIsUploadingMovie(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white/5 border border-purple-600/30 rounded-lg">
          <h1 className="text-2xl font-bold text-white">COMMUNITY HUB</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                sortBy === 'recent'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              Recent
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                sortBy === 'popular'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Popular
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                sortBy === 'trending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Flame className="w-4 h-4" />
              Trending
            </button>
          </div>

          <button
            onClick={() => user ? setShowUploadModal(true) : navigate('/auth')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Film className="w-5 h-5" />
            Upload Christmas Movie
          </button>
        </div>

        {showUploadModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-black border-2 border-purple-600 rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Film className="w-7 h-7" />
                  Upload Christmas Movie
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isUploadingMovie}
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {uploadSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Upload Successful!</h3>
                  <p className="text-gray-300">Your movie is now available for viewing</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-2">Movie Title</label>
                    <input
                      type="text"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      placeholder="e.g., A Christmas Carol"
                      className="w-full px-4 py-3 bg-white/10 border border-purple-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-600"
                      disabled={isUploadingMovie}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-2">Video File</label>
                    <div className="relative">
                      <input
                        type="file"
                        id="movie-upload"
                        accept="video/*"
                        onChange={handleMovieUpload}
                        className="hidden"
                        disabled={isUploadingMovie}
                      />
                      <label
                        htmlFor="movie-upload"
                        className={`block w-full px-4 py-8 bg-purple-600/20 border-2 border-dashed border-purple-600 rounded-lg text-center cursor-pointer transition-all ${
                          isUploadingMovie ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600/30 hover:border-purple-500'
                        }`}
                      >
                        {isUploadingMovie ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent"></div>
                            <p className="text-white font-semibold">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                            <p className="text-white font-semibold">Click to select video file</p>
                            <p className="text-gray-400 text-sm mt-1">MP4, MOV, AVI supported</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm text-center">
                    Once uploaded, your movie will be available for everyone to watch in the theater!
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            <p className="text-white mt-4">Loading community posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white text-xl mb-4">No posts yet</p>
            <p className="text-gray-400">Be the first to share your creation!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl overflow-hidden border-2 border-purple-600/20 hover:border-purple-600 transition-all transform hover:scale-105"
              >
                <div className="aspect-video bg-gradient-to-br from-purple-900 to-black flex items-center justify-center relative">
                  <span className="text-6xl">🎬</span>
                  {post.views_count > 1000 && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-purple-600 rounded-full flex items-center gap-1">
                      <Flame className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-bold">Trending</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-black">
                  <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-semibold">
                        {post.user_profiles?.display_name || post.user_profiles?.username || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">{getTimeAgo(post.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1 ${
                        likedPosts.has(post.id)
                          ? 'bg-purple-600'
                          : 'bg-white/10 hover:bg-purple-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current text-white' : 'text-purple-400'}`} />
                      <span className="text-white text-sm font-semibold">{post.likes_count}</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-purple-600 rounded-lg transition-all">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      <span className="text-white text-sm font-semibold">{post.comments_count}</span>
                    </button>
                  </div>

                  {post.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{post.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-white mb-2">{posts.length}+</h3>
            <p className="text-white/90">Active Creators</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-white mb-2">{posts.reduce((sum, p) => sum + p.views_count, 0).toLocaleString()}</h3>
            <p className="text-white/90">Total Views</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-white mb-2">{posts.reduce((sum, p) => sum + p.likes_count, 0)}</h3>
            <p className="text-white/90">Total Likes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
