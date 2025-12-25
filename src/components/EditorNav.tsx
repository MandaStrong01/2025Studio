import { useNavigate, useLocation } from 'react-router-dom';
import { Film, FolderOpen, Music, Settings, Home } from 'lucide-react';

export default function EditorNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const editorPages = [
    { path: '/media', icon: Home, label: 'Editor Home' },
    { path: '/media-library', icon: FolderOpen, label: 'Media Library' },
    { path: '/export', icon: Film, label: 'Timeline' },
    { path: '/analytics', icon: Music, label: 'Audio Mixer' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="bg-black/50 backdrop-blur-xl border-b border-purple-600/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <h2 className="text-xl font-bold text-white">Editor Suite</h2>
          <div className="flex gap-2">
            {editorPages.map((page) => {
              const Icon = page.icon;
              const isActive = location.pathname === page.path;
              return (
                <button
                  key={page.path}
                  onClick={() => navigate(page.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{page.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
