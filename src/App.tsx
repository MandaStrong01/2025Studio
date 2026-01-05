import React, { useState } from 'react';
import MediaLibrary from './components/MediaLibrary';
import VideoEditor from './components/VideoEditor';

// Mock function for the 600 tools logic
import { getToolsForPage } from './data/tools'; 

export default function App() {
  // 1. ALL STATES (FIXED LINE 186-188)
  const [page, setPage] = useState(1);
  const [movieDuration, setMovieDuration] = useState(60); 
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // 2. NAVIGATION HELPER
  const nextPage = () => setPage((prev) => Math.min(prev + 1, 21));
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-black text-white font-cinematic selection:bg-purple-500">
      
      {/* PAGE 1: CINEMATIC INTRO */}
      {page === 1 && (
        <div className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
          <video autoPlay loop muted={isMuted} className="fixed inset-0 w-full h-full object-cover -z-10 opacity-60">
            <source src="/video/background.mp4" type="video/mp4" />
          </video>
          <h1 className="text-white text-7xl font-black uppercase mb-4 tracking-tighter">MandaStrong Studio</h1>
          <p className="text-zinc-400 text-xl tracking-[0.3em] mb-12 uppercase">Make-A-Movie AI Studio</p>
          <button onClick={() => setPage(2)} className="border-2 border-white px-16 py-4 hover:bg-white hover:text-black transition-all font-bold uppercase">Enter Studio</button>
        </div>
      )}

      {/* PAGES 4-9: 600 AI TOOL BOARDS */}
      {page >= 4 && page <= 9 && (
        <div className="p-10 flex flex-col h-screen">
          <h2 className="text-4xl font-black mb-8 uppercase text-center border-b border-zinc-800 pb-4">AI Tools Board - Page {page}</h2>
          <div className="grid grid-cols-5 gap-4 overflow-y-auto flex-1 pr-4">
            {getToolsForPage(page).map((tool) => (
              <button 
                key={tool} 
                onClick={() => setActiveTool(tool)}
                className="bg-zinc-900 border border-zinc-800 p-6 hover:border-purple-500 transition-all uppercase text-[10px] font-bold tracking-widest"
              >
                {tool}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={prevPage} className="border border-zinc-700 px-8 py-2 uppercase text-xs">Back</button>
            <button onClick={nextPage} className="border border-zinc-700 px-8 py-2 uppercase text-xs">Next</button>
          </div>
        </div>
      )}

      {/* PAGE 11: MEDIA LIBRARY & ENHANCEMENT SUITE */}
      {page === 11 && (
        <div className="h-screen relative bg-black">
          <MediaLibrary />
          {/* This logic connects the button in MediaLibrary to the state here */}
          {showVideoEditor && (
            <VideoEditor onClose={() => setShowVideoEditor(false)} />
          )}
          {/* Global Next/Back for Page 11 */}
          <div className="fixed bottom-4 right-8 flex gap-4 z-50">
            <button onClick={prevPage} className="bg-zinc-900 px-6 py-2 text-[10px] border border-zinc-700 uppercase">Back</button>
            <button onClick={nextPage} className="bg-white text-black px-6 py-2 text-[10px] border border-white uppercase font-bold">Next Page</button>
          </div>
        </div>
      )}

      {/* PAGE 21: FINALE */}
      {page === 21 && (
        <div className="h-screen flex flex-col items-center justify-center bg-black">
          <video autoPlay className="w-full max-w-4xl shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <source src="/video/thatsallfolks.mp4" type="video/mp4" />
          </video>
          <button onClick={() => setPage(1)} className="mt-12 text-zinc-500 hover:text-white uppercase tracking-widest text-xs">Restart Experience</button>
        </div>
      )}

      {/* DEFAULT NAVIGATION FOR OTHER PAGES */}
      {page !== 1 && page !== 11 && page !== 21 && (page < 4 || page > 9) && (
        <div className="h-screen flex flex-col items-center justify-center p-20">
          <h2 className="text-5xl font-black uppercase mb-10">Page {page}</h2>
          <div className="flex gap-10">
            <button onClick={prevPage} className="border border-white px-10 py-3 uppercase text-xs">Back</button>
            <button onClick={nextPage} className="border border-white px-10 py-3 uppercase text-xs font-black">Proceed</button>
          </div>
        </div>
      )}

    </div>
  );
}