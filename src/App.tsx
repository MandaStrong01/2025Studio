import React, { useState } from 'react';

// --- 1. THE EDITOR ---
const VideoEditor = ({ onClose, duration, setDuration }) => (
  <div className="fixed inset-0 bg-black z-[999] flex flex-col font-sans text-white border-2 border-purple-600">
    <div className="h-12 bg-zinc-900 flex justify-between items-center px-6 border-b border-purple-500">
      <span className="text-purple-400 font-bold uppercase text-xs">Cinecraft Master Editor</span>
      <button onClick={onClose} className="text-white hover:text-purple-400 font-bold text-xl">✕</button>
    </div>
    <div className="flex-1 flex p-8 gap-8 bg-black">
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center italic text-zinc-700">Preview Monitor</div>
      <div className="w-80 bg-zinc-900 p-6 border border-purple-900 flex flex-col gap-6">
        <h3 className="text-sm font-bold border-b border-purple-900 pb-2 uppercase text-purple-400">Enhancement Suite</h3>
        <label className="text-xs font-bold">Duration: {duration} Min</label>
        <input type="range" min="0" max="180" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full h-1 bg-zinc-800 accent-purple-600 cursor-pointer" />
        <button className="mt-auto bg-purple-700 py-4 font-black uppercase text-xs border border-purple-300" onClick={() => alert('Processing AI Render...')}>AI Generate Asset</button>
      </div>
    </div>
  </div>
);

// --- 2. THE APP ---
export default function App() {
  const [page, setPage] = useState(11);
  const [showEditor, setShowEditor] = useState(false);
  const [duration, setDuration] = useState(60);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {page === 11 && (
        <div className="h-full relative">
          <div className="flex justify-between items-center border-b-2 border-purple-900 pb-6 mb-8">
            <h1 className="text-4xl font-black uppercase italic">Media Library</h1>
            <button onClick={() => setShowEditor(true)} className="bg-purple-800 text-white px-8 py-3 font-black uppercase text-xs border border-purple-400">Open Video Editor</button>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div className="aspect-video bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] text-zinc-500 uppercase font-bold">Asset_01.mp4</div>
          </div>
          {showEditor && <VideoEditor onClose={() => setShowEditor(false)} duration={duration} setDuration={setDuration} />}
          <div className="mt-20 flex gap-4">
            <button onClick={() => setPage(10)} className="border border-zinc-800 px-6 py-2 text-xs uppercase">Back</button>
            <button onClick={() => setPage(12)} className="bg-white text-black px-6 py-2 text-xs font-bold uppercase">Next</button>
          </div>
        </div>
      )}
      {page !== 11 && (
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-4xl font-black uppercase mb-8">Page {page}</h2>
          <button onClick={() => setPage(11)} className="border border-purple-500 px-8 py-3 uppercase text-xs">Back to Editor</button>
        </div>
      )}
    </div>
  );
}