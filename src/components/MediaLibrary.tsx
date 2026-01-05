import React, { useState } from 'react';
import VideoEditor from './VideoEditor';

export default function MediaLibrary() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="w-full h-screen bg-black text-white p-8 font-cinematic relative">
      <div className="flex justify-between items-center border-b-2 border-purple-900 pb-4 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Media Library</h1>

        {/* This button opens the new Video Editor Studio */}
        <button 
          onClick={() => setShowEditor(true)}
          className="bg-purple-800 hover:bg-purple-700 text-white px-8 py-3 font-bold uppercase text-xs border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
        >
          Open Video Editor
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="aspect-video bg-zinc-900 border border-zinc-800 flex items-center justify-center">
           <span className="text-zinc-700 uppercase text-[10px] font-bold tracking-widest">Master Asset</span>
        </div>
      </div>

      {/* The Attachment Extension */}
      {showEditor && <VideoEditor onClose={() => setShowEditor(false)} />}
    </div>
  );
}