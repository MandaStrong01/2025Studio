import AIToolBoard from '../components/AIToolBoard';
import { generateAITools } from '../data/aiTools';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Page5() {
  const tools = generateAITools(120, 120);
  const navigate = useNavigate();

  const handleToolClick = (tool: string) => {
    const toolSlug = tool.toLowerCase().replace(/\s+/g, '-');
    navigate(`/tool/${toolSlug}`);
  };

  return (
    <AIToolBoard showNavigation={true} prevRoute="/tools" nextRoute="/text-to-video">
      <div className="grid grid-cols-4 gap-4">
        {tools.map((tool, index) => (
          <button
            key={index}
            onClick={() => handleToolClick(tool)}
            className="p-4 bg-gradient-to-b from-white/10 to-white/5 hover:from-purple-600/20 hover:to-purple-700/20 backdrop-blur-xl rounded-xl border border-purple-700/50 hover:border-purple-500 text-white font-semibold transition-all transform hover:scale-105 flex items-center gap-3 text-left group"
          >
            <Sparkles className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors flex-shrink-0" />
            <span className="text-sm truncate">{tool}</span>
          </button>
        ))}
      </div>
    </AIToolBoard>
  );
}
