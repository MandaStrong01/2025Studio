import React, { useState, useEffect, useRef } from 'react';
import { Upload, Library, Wand2, Play, Sparkles, FileVideo, FileAudio, Cpu, MessageSquare } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState(1);
  const [assets, setAssets] = useState([]); 
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (page <= 2) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [page]);

  const Navigation = () => (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-[100]">
      <button onClick={() => setPage(Math.max(1, page - 1))} className="bg-black text-white px-8 py-3 rounded-full font-black uppercase text-[10px] border border-white/20 hover:bg-white hover:text-black transition-all">← BACK</button>
      <button onClick={() => setPage(Math.min(21, page + 1))} className="bg-black text-white px-8 py-3 rounded-full font-black uppercase text-[10px] border border-white/20 hover:bg-white hover:text-black transition-all">NEXT →</button>
    </div>
  );

  return (
    <div className="h-screen bg-black overflow-hidden relative font-black italic">
      <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${page <= 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} src="background.mp4" loop playsInline />

      {/* NODE 1 & 2: THE SPLASH */}
      {(page === 1 || page === 2) && (
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-7xl md:text-9xl text-black uppercase leading-none font-black tracking-tighter">MANDASTRONG'S STUDIO</h1>
          <p className="text-xl text-black uppercase mt-4 font-black">{page === 1 ? "All-In-One Movie App" : "Make Your Dreams Reality"}</p>
          <button onClick={() => setPage(page + 1)} className="absolute bottom-20 bg-black text-white px-12 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all">Next</button>
        </div>
      )}

      {/* NODE 3: PRICING ($20, $40, $80) */}
      {page === 3 && (
        <div className="h-full bg-black flex flex-col items-center p-8 border-[15px] border-zinc-900 overflow-y-auto pb-32">
          <div className="grid grid-cols-2 gap-6 w-full max-w-5xl mb-10">
            <div className="bg-[#1a0b2e] p-8 rounded-3xl border-2 border-purple-500/30 text-white text-center font-black"><h2>LOGIN</h2></div>
            <div className="bg-[#1a0b2e] p-8 rounded-3xl border-2 border-purple-500/30 text-white text-center font-black"><h2>REGISTER</h2></div>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full max-w-6xl">
            {[{t:"Basic", p:"20"}, {t:"Pro", p:"40"}, {t:"Studio", p:"80"}].map((plan, i) => (
              <div key={i} className="bg-[#0d0517] p-6 rounded-2xl border-2 border-purple-500/10 text-white text-center font-black">
                <h3 className="text-xl uppercase">{plan.t}</h3>
                <div className="text-6xl font-black tracking-tighter">${plan.p}</div>
                <button onClick={() => setPage(4)} className="w-full bg-purple-600 mt-4 py-3 rounded-xl uppercase tracking-widest hover:bg-purple-500">SELECT</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NODE 11: MEDIA LIBRARY */}
      {page === 11 && (
        <div className="h-full bg-[#050505] text-white flex flex-col border-[20px] border-zinc-900 italic font-black">
          <div className="flex-1 p-10 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-5xl uppercase tracking-tighter font-black font-black">Library ({assets.length})</h2>
              <button onClick={() => window.open('https://mandastrong-studio-global-enhancement.ai/engine-v2', '_blank')} className="bg-purple-600 px-8 py-3 rounded-xl font-black border border-white/20 uppercase shadow-2xl hover:scale-105 transition-all">Enhancement Suite</button>
            </div>
            <div className="flex-1 border-4 border-dashed border-zinc-900 rounded-[4rem] flex items-center justify-center text-zinc-800 text-3xl uppercase font-black italic text-center px-10">
              Media assets empty. Generate assets in the AI tool board.
            </div>
          </div>
        </div>
      )}

      {/* NODE 21: FINALE */}
      {page === 21 && (
        <div className="h-full bg-black border-[20px] border-zinc-900 flex flex-col items-center justify-center relative italic font-black p-20 text-center">
          <h1 className="text-7xl md:text-[10rem] text-purple-500 uppercase tracking-tighter mb-12 leading-none font-black">THAT'S ALL FOLKS!</h1>
          <button onClick={() => setPage(1)} className="bg-white text-black px-16 py-6 rounded-full uppercase text-xl font-black hover:bg-purple-600 hover:text-white transition-all shadow-2xl">Restart Engine</button>
        </div>
      )}

      {/* GENERIC NODES 4-20 */}
      {![1,2,3,11,21].includes(page) && (
        <div className="h-full bg-black border-[20px] border-zinc-900 flex flex-col items-center justify-center text-white italic font-black opacity-10 uppercase text-8xl md:text-9xl">
          Node {page}
        </div>
      )}
      
      <Navigation />
    </div>
  );
}