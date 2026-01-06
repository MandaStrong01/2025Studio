import React, { useState } from 'react';

// --- THE ENHANCEMENT SUITE (OPEN VIDEO STUDIO ATTACHMENT) ---
const VideoStudio = ({ onClose, duration, setDuration }: any) => (
  <div className="fixed inset-0 bg-black z-[1000] flex flex-col font-sans text-white border-2 border-purple-600 animate-in fade-in duration-300">
    <div className="h-14 bg-zinc-900 flex justify-between items-center px-6 border-b border-purple-500 shadow-lg">
      <span className="text-purple-400 font-black uppercase tracking-[0.3em] text-xs italic">Master Enhancement Studio</span>
      <button onClick={onClose} className="text-white hover:text-purple-400 font-bold text-2xl transition-all">✕</button>
    </div>
    <div className="flex-1 flex p-8 gap-8 bg-black overflow-hidden">
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
         <div className="absolute top-4 left-4 text-[10px] text-purple-500 font-bold uppercase tracking-widest bg-black/80 px-3 py-1 border border-purple-900/50">Monitor 01 // Master Render</div>
         <p className="text-zinc-800 italic uppercase text-[10px] tracking-[0.4em]">Ready for AI Processing</p>
      </div>
      <div className="w-80 bg-zinc-900 p-6 border border-purple-900 flex flex-col gap-6 shadow-[0_0_50px_rgba(88,28,135,0.2)]">
        <h3 className="text-xs font-black border-b border-purple-900 pb-3 uppercase tracking-widest text-purple-400">Advanced Tools</h3>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
             <label className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Timeline Duration</label>
             <span className="text-2xl font-black text-white">{duration}<small className="text-[10px] ml-1">M</small></span>
          </div>
          <input type="range" min="0" max="180" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full h-1 bg-zinc-800 accent-purple-600 cursor-pointer appearance-none rounded-full" />
          <div className="flex justify-between text-[9px] text-zinc-600 font-black tracking-tighter"><span>0 MIN</span><span>90 MIN</span><span>180 MIN</span></div>
        </div>
        <div className="flex flex-col gap-2">
          {["✨ AI 4K Upscale", "🎨 Cine-Color LUT", "🔊 Audio Master Pro", "✂️ Auto-Scene Cut"].map(tool => (
            <button key={tool} className="text-[9px] p-3 border border-zinc-800 hover:border-purple-500 bg-black font-black uppercase tracking-widest transition-all hover:bg-zinc-950 text-left">{tool}</button>
          ))}
        </div>
        <button className="mt-auto bg-purple-700 hover:bg-purple-600 py-5 font-black uppercase text-[11px] border border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95" onClick={() => alert(`AI Render Started: ${duration}m`)}>AI Generate Asset</button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [page, setPage] = useState(11);
  const [showStudio, setShowStudio] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [duration, setDuration] = useState(60);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500">
      
      {/* PAGE 11: EDITOR SUITE PRIMARY VIEW */}
      {page === 11 && (
        <div className="h-screen flex flex-col p-8 relative animate-in fade-in duration-700">
          
          {/* TOP NAVIGATION BOXES AREA */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Editor Suite</h1>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Studio v2.0 // Processing Hub</p>
            </div>
            
            <div className="flex gap-2">
              {["Timeline", "Assets", "Effects"].map(box => (
                <div key={box} className="w-24 h-20 border border-zinc-800 bg-zinc-900/30 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-zinc-500">{box}</div>
              ))}
              <button 
                onClick={() => setShowAdvancedTools(true)}
                className="w-24 h-20 border-2 border-purple-900 bg-purple-900/10 hover:bg-purple-600 hover:border-purple-400 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                Media Library
              </button>
            </div>
          </div>

          <div className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-2xl flex items-center justify-center border-dashed">
            <span className="text-zinc-800 font-black text-6xl uppercase tracking-tighter opacity-20 italic">Main Workspace</span>
          </div>

          {showAdvancedTools && (
            <div className="fixed inset-0 bg-black/95 z-50 p-10 animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center border-b-2 border-purple-900 pb-6 mb-10">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Viewer Advanced Tools</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowStudio(true)}
                    className="bg-purple-800 hover:bg-purple-700 text-white px-10 py-4 font-black uppercase text-xs border border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all"
                  >
                    Open Video Studio
                  </button>
                  <button onClick={() => setShowAdvancedTools(false)} className="bg-zinc-800 px-6 py-4 font-black uppercase text-xs border border-zinc-600">Close Viewer</button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-video bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-purple-500 cursor-pointer group transition-all">
                    <span className="text-zinc-700 uppercase text-[9px] font-bold tracking-[0.4em] group-hover:text-purple-400 transition-colors italic">Studio_Asset_0{i}.mp4</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-between items-center border-t border-zinc-900 pt-8">
            <button onClick={() => setPage(10)} className="text-zinc-600 hover:text-white uppercase text-[11px] font-black tracking-[0.2em] transition-colors italic">← Back</button>
            <button onClick={() => setPage(12)} className="bg-white text-black px-16 py-4 font-black uppercase text-xs hover:bg-purple-500 hover:text-white transition-all tracking-widest shadow-xl">Proceed to Page 12 →</button>
          </div>

          {showStudio && <VideoStudio onClose={() => setShowStudio(false)} duration={duration} setDuration={setDuration} />}
        </div>
      )}

      {/* PAGE 12: EXPORT */}
      {page === 12 && (
        <div className="h-screen flex flex-col p-10 bg-zinc-950">
           <div className="flex justify-between items-center border-b border-zinc-800 pb-6 mb-10 text-zinc-500 font-black uppercase text-xs tracking-widest">
             <span>Export Protocol Active</span>
             <button onClick={() => setPage(11)} className="border border-zinc-800 px-4 py-1">Return</button>
           </div>
           <div className="flex-1 border-2 border-dashed border-zinc-900 rounded-3xl flex items-center justify-center italic text-zinc-800 uppercase tracking-widest font-black text-2xl">Final Master Export Interface</div>
        </div>
      )}
    </div>
  );
}