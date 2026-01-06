// --- MASTER ENHANCEMENT STUDIO (PAGE 11 ATTACHMENT) ---
const VideoStudio = ({ onClose, duration, setDuration }: any) => (
  <div className="fixed inset-0 bg-black z-[1000] flex flex-col font-sans text-white border-2 border-purple-600 animate-in fade-in duration-300">
    {/* Header */}
    <div className="h-14 bg-zinc-900 flex justify-between items-center px-6 border-b border-purple-500 shadow-lg">
      <span className="text-purple-400 font-black uppercase tracking-[0.3em] text-xs italic">Master Enhancement Studio</span>
      <button onClick={onClose} className="text-white hover:text-purple-400 font-bold text-2xl transition-all">✕</button>
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex p-8 gap-8 bg-black overflow-hidden">
      
      {/* Monitor / Preview View */}
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
         <div className="absolute top-4 left-4 text-[10px] text-purple-500 font-bold uppercase tracking-widest bg-black/80 px-3 py-1 border border-purple-900/50">
           Monitor 01 // Master Render
         </div>
         <p className="text-zinc-800 italic uppercase text-[10px] tracking-[0.4em]">Ready for AI Processing</p>
      </div>

      {/* Side Tools Panel */}
      <div className="w-80 bg-zinc-900 p-6 border border-purple-900 flex flex-col gap-6 shadow-[0_0_50px_rgba(88,28,135,0.2)]">
        <h3 className="text-xs font-black border-b border-purple-900 pb-3 uppercase tracking-widest text-purple-400">Advanced Tools</h3>
        
        {/* Duration Control (0-180 Slider) */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
             <label className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Timeline Duration</label>
             <span className="text-2xl font-black text-white">{duration}<small className="text-[10px] ml-1 text-purple-500">M</small></span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="180" 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))} 
            className="w-full h-1 bg-zinc-800 accent-purple-600 cursor-pointer appearance-none rounded-full" 
          />
          <div className="flex justify-between text-[9px] text-zinc-600 font-black tracking-tighter">
            <span>0 MIN</span>
            <span>90 MIN</span>
            <span>180 MIN</span>
          </div>
        </div>

        {/* Feature Buttons */}
        <div className="flex flex-col gap-2">
          {["✨ AI 4K Upscale", "🎨 Cine-Color LUT", "🔊 Audio Master Pro", "✂️ Auto-Scene Cut"].map(tool => (
            <button 
              key={tool} 
              className="text-[9px] p-3 border border-zinc-800 hover:border-purple-500 bg-black font-black uppercase tracking-widest transition-all hover:bg-zinc-950 text-left"
            >
              {tool}
            </button>
          ))}
        </div>

        {/* Primary Action Button */}
        <button 
          className="mt-auto bg-purple-700 hover:bg-purple-600 py-5 font-black uppercase text-[11px] border border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95" 
          onClick={() => alert(`AI Render Started for ${duration} minutes.`)}
        >
          AI Generate Asset
        </button>
      </div>
    </div>
  </div>
);