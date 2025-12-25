import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, MessageSquare, Upload, TrendingUp, Clock, Flame, User } from 'lucide-react';
import { useState } from 'react';

export default function Page20() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('recent');

  const communityPosts = [
    {
      id: 1,
      user: 'Sarah Johnson',
      avatar: 'SJ',
      title: 'Epic Action Montage',
      thumbnail: '🎬',
      likes: 1247,
      loved: 823,
      comments: 156,
      timeAgo: '2 hours ago',
      trending: true
    },
    {
      id: 2,
      user: 'Mike Chen',
      avatar: 'MC',
      title: 'Cinematic Travel Vlog',
      thumbnail: '✈️',
      likes: 892,
      loved: 634,
      comments: 89,
      timeAgo: '5 hours ago',
      trending: false
    },
    {
      id: 3,
      user: 'Emily Rodriguez',
      avatar: 'ER',
      title: 'Product Showcase Video',
      thumbnail: '📦',
      likes: 2156,
      loved: 1423,
      comments: 267,
      timeAgo: '1 day ago',
      trending: true
    },
    {
      id: 4,
      user: 'Alex Thompson',
      avatar: 'AT',
      title: 'Music Video Edit',
      thumbnail: '🎵',
      likes: 3421,
      loved: 2789,
      comments: 445,
      timeAgo: '1 day ago',
      trending: true
    },
    {
      id: 5,
      user: 'Jessica Kim',
      avatar: 'JK',
      title: 'Wedding Highlights',
      thumbnail: '💍',
      likes: 567,
      loved: 456,
      comments: 78,
      timeAgo: '3 days ago',
      trending: false
    },
    {
      id: 6,
      user: 'David Brown',
      avatar: 'DB',
      title: 'Gaming Montage',
      thumbnail: '🎮',
      likes: 1890,
      loved: 1234,
      comments: 234,
      timeAgo: '4 days ago',
      trending: false
    }
  ];

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
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

        {/* Upload & Sort Bar */}
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

          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold transition-all transform hover:scale-105 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Your Creation
          </button>
        </div>

        {/* Community Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl overflow-hidden border-2 border-purple-600/20 hover:border-purple-600 transition-all transform hover:scale-105"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-purple-900 to-black flex items-center justify-center relative">
                <span className="text-6xl">{post.thumbnail}</span>
                {post.trending && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-purple-600 rounded-full flex items-center gap-1">
                    <Flame className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-bold">Trending</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 bg-black">
                <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>

                {/* User Info */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{post.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold">{post.user}</p>
                    <p className="text-xs text-gray-500">{post.timeAgo}</p>
                  </div>
                </div>

                {/* Interaction Buttons */}
                <div className="flex items-center gap-3 mb-3">
                  <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-purple-600 rounded-lg transition-all flex-1">
                    <Heart className="w-5 h-5 text-purple-400" />
                    <span className="text-white text-sm font-semibold">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-purple-600 rounded-lg transition-all">
                    <span className="text-xl">❤️</span>
                    <span className="text-white text-sm font-semibold">{post.loved}</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-purple-600 rounded-lg transition-all">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <span className="text-white text-sm font-semibold">{post.comments}</span>
                  </button>
                </div>

                {/* Comment Preview */}
                <div className="border-t border-purple-600/20 pt-3">
                  <p className="text-xs text-gray-400 mb-2">Recent comments:</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-purple-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white"><strong>User123:</strong> Amazing work!</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-purple-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white"><strong>Creator456:</strong> Love the editing style!</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-semibold transition-all">
                    View All Comments
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold transition-all transform hover:scale-105">
            Load More Content
          </button>
        </div>

        {/* Community Stats */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-white mb-2">12,458</h3>
            <p className="text-white/90">Active Creators</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-white mb-2">45,892</h3>
            <p className="text-white/90">Videos Shared</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-white mb-2">2.3M</h3>
            <p className="text-white/90">Total Views</p>
          </div>
        </div>
      </div>
    </div>
  );
}
