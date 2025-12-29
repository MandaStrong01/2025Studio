import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, Film, Trash2, Eye, EyeOff, Star, X, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface Movie {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_minutes: number;
  genre: string;
  release_year: number | null;
  rating: string;
  views_count: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export default function Page10() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    genre: 'general',
    release_year: new Date().getFullYear(),
    rating: 'NR',
    duration_minutes: 0,
    is_featured: false,
    is_published: true,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMovies(data);
      }
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadMovie = async () => {
    if (!user || !isAdmin || !videoFile || !newMovie.title) {
      alert('Please fill in all required fields and select a video file');
      return;
    }

    setIsUploading(true);

    try {
      let videoUrl = '';
      let thumbnailUrl = '';

      const videoExt = videoFile.name.split('.').pop();
      const videoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${videoExt}`;
      const videoPath = `movies/${videoFileName}`;

      const { data: videoData, error: videoError } = await supabase.storage
        .from('media')
        .upload(videoPath, videoFile);

      if (videoError || !videoData) {
        alert('Failed to upload video');
        setIsUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(videoPath);
      videoUrl = publicUrl;

      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${thumbExt}`;
        const thumbPath = `thumbnails/${thumbFileName}`;

        const { data: thumbData } = await supabase.storage
          .from('media')
          .upload(thumbPath, thumbnailFile);

        if (thumbData) {
          const { data: { publicUrl: thumbUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(thumbPath);
          thumbnailUrl = thumbUrl;
        }
      }

      const { data: insertData, error: insertError } = await supabase
        .from('public_movies')
        .insert([{
          uploaded_by: user.id,
          title: newMovie.title,
          description: newMovie.description,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration_minutes: newMovie.duration_minutes,
          genre: newMovie.genre,
          release_year: newMovie.release_year,
          rating: newMovie.rating,
          is_featured: newMovie.is_featured,
          is_published: newMovie.is_published,
        }])
        .select();

      if (insertError) {
        console.error('Database insert error:', insertError);
        alert(`Failed to save movie to database: ${insertError.message}\n\nDetails: ${JSON.stringify(insertError, null, 2)}`);
      } else if (!insertData || insertData.length === 0) {
        console.error('No data returned from insert');
        alert('Movie upload succeeded but no data was returned. Please refresh the page.');
        loadMovies();
      } else {
        console.log('Movie inserted successfully:', insertData);
        alert('Movie uploaded successfully!');
        setShowUploadModal(false);
        setNewMovie({
          title: '',
          description: '',
          genre: 'general',
          release_year: new Date().getFullYear(),
          rating: 'NR',
          duration_minutes: 0,
          is_featured: false,
          is_published: true,
        });
        setVideoFile(null);
        setThumbnailFile(null);
        loadMovies();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const togglePublishStatus = async (movieId: string, currentStatus: boolean) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from('public_movies')
      .update({ is_published: !currentStatus })
      .eq('id', movieId);

    if (!error) {
      loadMovies();
    }
  };

  const toggleFeaturedStatus = async (movieId: string, currentStatus: boolean) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from('public_movies')
      .update({ is_featured: !currentStatus })
      .eq('id', movieId);

    if (!error) {
      loadMovies();
    }
  };

  const deleteMovie = async (movieId: string) => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this movie?')) return;

    const { error } = await supabase
      .from('public_movies')
      .delete()
      .eq('id', movieId);

    if (!error) {
      loadMovies();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/30 to-black p-8 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-20 h-20 text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to view movies</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/30 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Movie Library</h1>
            <p className="text-gray-400">
              {isAdmin ? 'Upload and manage movies for users to enjoy' : 'Browse available movies'}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/script-writer')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900/50 hover:bg-blue-800 text-white font-bold rounded-lg transition-all border border-blue-600/50"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={() => navigate('/media')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload New Movie
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-black/50 border border-blue-600/30 rounded-xl p-4 animate-pulse">
                <div className="h-48 bg-blue-900/20 rounded-lg mb-4"></div>
                <div className="h-6 bg-blue-900/20 rounded mb-2"></div>
                <div className="h-4 bg-blue-900/20 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 bg-black/50 border border-blue-600/30 rounded-xl">
            <Film className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Movies Yet</h3>
            <p className="text-gray-500 mb-6">
              {isAdmin ? 'Upload your first movie to get started' : 'Check back soon for new content'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-black/50 border border-blue-600/30 hover:border-blue-600 rounded-xl overflow-hidden transition-all transform hover:scale-105"
              >
                <div className="relative h-48 bg-blue-900/20">
                  {movie.thumbnail_url ? (
                    <img
                      src={movie.thumbnail_url}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-16 h-16 text-blue-400" />
                    </div>
                  )}
                  {movie.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                  {!movie.is_published && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Unpublished
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{movie.description}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span>{movie.duration_minutes} min</span>
                    <span>•</span>
                    <span>{movie.genre}</span>
                    <span>•</span>
                    <span>{movie.rating}</span>
                    {movie.release_year && (
                      <>
                        <span>•</span>
                        <span>{movie.release_year}</span>
                      </>
                    )}
                  </div>

                  {isAdmin ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePublishStatus(movie.id, movie.is_published)}
                        className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                        title={movie.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {movie.is_published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {movie.is_published ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => toggleFeaturedStatus(movie.id, movie.is_featured)}
                        className={`flex-1 p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          movie.is_featured ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                        title={movie.is_featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star className="w-3 h-3" />
                        {movie.is_featured ? 'Featured' : 'Feature'}
                      </button>
                      <button
                        onClick={() => deleteMovie(movie.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all"
                        title="Delete movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPlayingMovie(movie)}
                      className="block w-full p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white text-sm font-bold text-center transition-all"
                    >
                      Watch Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showUploadModal && isAdmin && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-blue-900 to-black border-2 border-blue-600 rounded-2xl p-8 max-w-2xl w-full my-8">
              <h2 className="text-3xl font-bold text-white mb-6">Upload New Movie</h2>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    Movie Title *
                  </label>
                  <input
                    type="text"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    placeholder="Enter movie title"
                    className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newMovie.description}
                    onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                    placeholder="Movie description"
                    rows={3}
                    className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      Genre
                    </label>
                    <select
                      value={newMovie.genre}
                      onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="general">General</option>
                      <option value="action">Action</option>
                      <option value="comedy">Comedy</option>
                      <option value="drama">Drama</option>
                      <option value="horror">Horror</option>
                      <option value="sci-fi">Sci-Fi</option>
                      <option value="documentary">Documentary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      Rating
                    </label>
                    <select
                      value={newMovie.rating}
                      onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="NR">Not Rated</option>
                      <option value="G">G</option>
                      <option value="PG">PG</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                      <option value="NC-17">NC-17</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={newMovie.duration_minutes}
                      onChange={(e) => setNewMovie({ ...newMovie, duration_minutes: parseInt(e.target.value) || 0 })}
                      placeholder="90"
                      className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      Release Year
                    </label>
                    <input
                      type="number"
                      value={newMovie.release_year}
                      onChange={(e) => setNewMovie({ ...newMovie, release_year: parseInt(e.target.value) || new Date().getFullYear() })}
                      placeholder={new Date().getFullYear().toString()}
                      className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    Video File *
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-bold hover:file:bg-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    Thumbnail (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-black border border-blue-600/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-bold hover:file:bg-blue-700"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMovie.is_featured}
                      onChange={(e) => setNewMovie({ ...newMovie, is_featured: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">Mark as Featured</span>
                  </label>

                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMovie.is_published}
                      onChange={(e) => setNewMovie({ ...newMovie, is_published: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setNewMovie({
                      title: '',
                      description: '',
                      genre: 'general',
                      release_year: new Date().getFullYear(),
                      rating: 'NR',
                      duration_minutes: 0,
                      is_featured: false,
                      is_published: true,
                    });
                    setVideoFile(null);
                    setThumbnailFile(null);
                  }}
                  disabled={isUploading}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadMovie}
                  disabled={isUploading || !newMovie.title || !videoFile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload Movie'}
                </button>
              </div>
            </div>
          </div>
        )}

        {playingMovie && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-6xl">
              <button
                onClick={() => setPlayingMovie(null)}
                className="absolute -top-12 right-0 p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all flex items-center gap-2 z-10"
              >
                <X className="w-5 h-5" />
                Close
              </button>

              <div className="bg-black rounded-xl overflow-hidden border-2 border-blue-600">
                <div className="bg-gradient-to-r from-blue-900 to-black p-4 border-b border-blue-600">
                  <h2 className="text-2xl font-bold text-white">{playingMovie.title}</h2>
                  <p className="text-gray-400 text-sm mt-1">{playingMovie.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span>{playingMovie.duration_minutes} min</span>
                    <span>•</span>
                    <span>{playingMovie.genre}</span>
                    <span>•</span>
                    <span>{playingMovie.rating}</span>
                    {playingMovie.release_year && (
                      <>
                        <span>•</span>
                        <span>{playingMovie.release_year}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                  <video
                    key={playingMovie.id}
                    className="w-full h-full"
                    controls
                    autoPlay
                    controlsList="nodownload"
                    onLoadedMetadata={(e) => {
                      e.currentTarget.currentTime = 0;
                    }}
                  >
                    <source src={playingMovie.video_url} type="video/mp4" />
                    <source src={playingMovie.video_url} type="video/webm" />
                    <source src={playingMovie.video_url} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div className="bg-gradient-to-r from-black to-blue-900/30 p-4 border-t border-blue-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Play className="w-4 h-4" />
                      <span className="text-sm">Now Playing</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Views: {playingMovie.views_count}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
