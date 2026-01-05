import React, { useState } from 'react';

// --- 1. THE VIDEO EDITOR ATTACHMENT (PAGE 11 EXTENSION) ---
const VideoEditor = ({ onClose, duration, setDuration }) => {
  return (
    <div className="fixed inset-0 bg-black z-[999] flex flex-col font-sans text-white border-2 border-purple-600">
      <div className="h-14 bg-zinc-900 flex justify-between items-center px-6 border-b border-purple-500">
        <span className="text-purple-400 font-bold uppercase tracking-widest text-xs">Cinecraft Master Enhancement Suite</span>
        <button onClick={onClose} className="text-white hover:text-purple-400 font-bold text-2xl transition-all">✕</button>
      </div>

      <div className="flex-1 flex p-8 gap-8 bg-black overflow-hidden">
        {/* Preview Window */}
        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center relative shadow-inner">
           <div className="absolute top-4 left-4 text-[10px] text-purple-500 font-bold uppercase tracking-[0.3em]">Master Render Monitor</div>
           <p className="text-zinc-800 italic uppercase text-xs tracking-widest">Ready for Master Processing</p>
        </div>

        {/* Side Controls */}
        <div className="w-80 bg-zinc-900 p-6 border border-purple-900 flex flex-col gap-6 shadow-[0_0_30px_rgba(88,28,135,0.2)]">
          <h3 className="text-sm font-black border-b border-purple-900 pb-2 uppercase text-purple-400 tracking-tighter">Enhancement Tools</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] uppercase text-zinc-500 font-bold">Duration</label>
              <span className="text-2xl font-black text-white">{duration}<small className="text-xs ml-1 text-purple-500">MIN</small></span>
            </div>
            {/* The 0-180 Slider */}
            <input 
              type="range" min="0" max="180" value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 accent-purple-600 cursor-pointer appearance-none rounded-full"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 font-bold"><span>0M</span><span>90M</span><span>180M</span></div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button className="text-[10px] p-3 border border-zinc-800 hover:border-purple-500 bg-black font-bold uppercase transition-all">🪄 AI 4K Upscale</button>
            <button className="text-[10px] p-3 border border-zinc-800 hover:border-purple-500 bg-black font-bold uppercase transition-all">🎨 Cine-Color LUT</button>
            <button className="text-[10px] p-3 border border-zinc-800 hover:border-purple-500 bg-black font-bold uppercase transition-all">🔊 Audio Master</button>
          </div>

          <button 
            className="mt-auto bg-purple-700 hover:bg-purple-600 py-4 font-black uppercase text-xs border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95 transition-all"
            onClick={() => alert(`AI Generating ${duration} minute cinematic asset...`)}
          >
            AI Generate Asset
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. MAIN APP COMPONENT ---
export default function App() {
  const [page, setPage] = useState(11); // Starting at Page 11 for your testing group
  const [showEditor, setShowEditor] = useState(false);
  const [duration, setDuration] = useState(60);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500">
      
      {/* PAGE 11: MEDIA LIBRARY */}
      {page === 11 && (
        <div className="h-screen flex flex-col p-10 relative animate-in fade-in duration-500">
          <div className="flex justify-between items-center border-b-2 border-purple-900 pb-6 mb-10">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">Media Library</h1>
            
            {/* BUTTON AT TOP RIGHT */}
            <button 
              onClick={() => setShowEditor(true)}
              className="bg-purple-800 hover:bg-purple-700 text-white px-10 py-4 font-black uppercase text-xs border border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all active:scale-95"
            >
              Open Video Editor
            </button>
          </div>

          {/* Library Assets */}
          <div className="grid grid-cols-4 gap-8 flex-1 overflow-y-auto pr-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video bg-zinc-900/40 border border-zinc-800 flex flex-col items-center justify-center hover:border-purple-500 cursor-pointer group transition-all">
                 <span className="text-4xl mb-2 opacity-20 group-hover:opacity-100 transition-opacity">🎬</span>
                 <span className="text-zinc-600 uppercase text-[9px] font-bold tracking-[0.4em] group-hover:text-purple-400">Library_Asset_0{i}.mp4</span>
              </div>
            ))}
          </div>

          {/* Page Navigation */}
          <div className="mt-10 flex justify-between items-center border-t border-zinc-900 pt-6">
            <button onClick={() => setPage(10)} className="text-zinc-600 hover:text-white uppercase text-[10px] font-bold tracking-widest transition-colors">← Back to Page 10</button>
            <button onClick={() => setPage(12)} className="bg-white text-black px-12 py-3 font-black uppercase text-xs hover:bg-purple-500 hover:text-white transition-all">Proceed to Page 12 →</button>
          </div>

          {/* THE EDITOR OVERLAY */}
          {showEditor && <VideoEditor onClose={() => setShowEditor(false)} duration={duration} setDuration={setDuration} />}
        </div>
      )}

      {/* PAGE 12: PLACEHOLDERS FOR SOCIAL MEDIA/TESTING */}
      {page === 12 && (
        <div className="h-screen flex flex-col p-10 animate-in slide-in-from-right duration-500">
           <div className="flex justify-between items-center border-b border-zinc-800 pb-6 mb-10">
             <h1 className="text-4xl font-black uppercase tracking-tighter">Page 12: Master Export</h1>
             <button onClick={() => setPage(11)} className="text-xs uppercase font-bold border border-zinc-700 px-4 py-2">Back to Library</button>
           </div>
           
           <div className="flex-1 grid grid-cols-2 gap-10">
              <div className="border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-10 bg-zinc-900/10">
                <p className="text-zinc-500 uppercase font-bold text-xs mb-4">Placeholder: Cinematic Poster</p>
                <div className="w-48 h-72 bg-zinc-800 rounded shadow-2xl border border-zinc-700"></div>
              </div>
              <div className="border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-10 bg-zinc-900/10">
                <p className="text-zinc-500 uppercase font-bold text-xs mb-4">Placeholder: Social Media Trailer</p>
                <div className="w-full aspect-video bg-zinc-800 rounded shadow-2xl border border-zinc-700"></div>
              </div>
           </div>
        </div>
      )}

      {/* Catch-all for other pages */}
      {page !== 11 && page !== 12 && (
        <div className="h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold uppercase mb-4 text-purple-500">Page {page}</h2>
          <button onClick={() => setPage(11)} className="border border-white px-8 py-2 text-[10px] font-bold uppercase">Return to Studio</button>
        </div>
      )}

    </div>
  );
}