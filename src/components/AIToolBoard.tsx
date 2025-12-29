import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, Home, Image, Video, Edit3, Mic, FileText, Clock, FolderOpen, Upload, BarChart, Settings, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface AIToolBoardProps {
  children: ReactNode;
  currentTool?: string;
  showNavigation?: boolean;
  prevRoute?: string;
  nextRoute?: string;
}

export default function AIToolBoard({ children, showNavigation = false, prevRoute, nextRoute }: AIToolBoardProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const tools = [
    { name: 'Text to Image', path: '/text-to-image', icon: Image },
    { name: 'Text to Video', path: '/text-to-video', icon: Video },
    { name: 'Image Editor', path: '/image-editor', icon: Edit3 },
    { name: 'Voice Generator', path: '/voice-generator', icon: Mic },
    { name: 'Script Writer', path: '/script-writer', icon: FileText },
  ];

  const quickLinks = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'All Tools', path: '/tools', icon: Menu },
    { name: 'Timeline', path: '/timeline', icon: Clock },
    { name: 'Media Library', path: '/media', icon: FolderOpen },
    { name: 'Export', path: '/export', icon: Upload },
    { name: 'Analytics', path: '/analytics', icon: BarChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/10" />

      <div className="relative z-10">
        <div className="border-b border-purple-900/50 bg-black/50 backdrop-blur-md sticky top-0 z-20">
          <div className="max-w-[1920px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search AI tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-purple-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {searchQuery && filteredTools.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 border border-purple-700/50 rounded-xl overflow-hidden shadow-2xl">
                    {filteredTools.map((tool) => (
                      <button
                        key={tool.path}
                        onClick={() => {
                          navigate(tool.path);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-600/20 transition-colors text-left"
                      >
                        <tool.icon className="w-5 h-5 text-purple-400" />
                        <span className="text-white">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600 bg-clip-text">
                AI TOOL BOARD
              </h1>

              <div className="flex-1 flex justify-end">
                <button
                  onClick={() => setShowQuickMenu(!showQuickMenu)}
                  className="relative px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  {showQuickMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  Quick Access
                </button>
              </div>
            </div>
          </div>
        </div>

        {showQuickMenu && (
          <div className="fixed top-20 right-6 w-80 bg-black/95 border border-purple-700/50 rounded-xl shadow-2xl z-30 overflow-hidden">
            <div className="p-4 border-b border-purple-700/50">
              <h3 className="text-xl font-bold text-white">Quick Access Menu</h3>
            </div>
            <div className="p-2">
              {quickLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setShowQuickMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-600/20 rounded-lg transition-colors text-left"
                >
                  <link.icon className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">{link.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-[1920px] mx-auto px-6 py-8">
          {showNavigation && (prevRoute || nextRoute) && (
            <div className="flex justify-between items-center mb-6">
              {prevRoute ? (
                <button
                  onClick={() => navigate(prevRoute)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-900/50 hover:bg-purple-800 text-white font-bold rounded-lg transition-all border border-purple-600/50"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              ) : (
                <div />
              )}
              {nextRoute ? (
                <button
                  onClick={() => navigate(nextRoute)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div />
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
