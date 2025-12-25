import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { generateAITools } from '../data/aiTools';
import { useState } from 'react';

interface AIToolsPageProps {
  pageNumber: number;
  prevPage: number;
  nextPage: number;
}

export default function AIToolsPage({ pageNumber, prevPage, nextPage }: AIToolsPageProps) {
  const navigate = useNavigate();
  const startIndex = (pageNumber - 4) * 120;
  const tools = generateAITools(startIndex, 120);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-black text-white">AI TOOLS - PAGE {pageNumber}</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/page${prevPage}`)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-900/50 hover:bg-purple-800 text-white font-bold rounded-lg transition-all border border-purple-600/50"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={() => navigate(`/page${nextPage}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {tools.map((tool, index) => (
            <button
              key={index}
              onClick={() => setSelectedTool(tool)}
              className="p-4 bg-purple-900/20 hover:bg-purple-800/40 backdrop-blur-lg rounded-lg border border-purple-600/30 text-white font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm truncate">{tool}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedTool && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/50 to-black rounded-2xl p-8 max-w-2xl w-full border-2 border-purple-600/50">
            <h2 className="text-3xl font-bold text-white mb-4">{selectedTool}</h2>
            <p className="text-purple-100 mb-6">
              Launch this AI tool to create or edit content. You can upload existing files or generate new content from scratch using AI.
              All generated content is automatically saved to your media library.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/tool/${selectedTool.toLowerCase().replace(/\s+/g, '-')}`)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all"
              >
                Launch Tool
              </button>
              <button
                onClick={() => setSelectedTool(null)}
                className="px-6 py-3 bg-purple-900/50 hover:bg-purple-800 text-white font-bold rounded-lg transition-all border border-purple-600/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
