import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Film, 
  Scissors, 
  Music, 
  Sliders, 
  Layers, 
  Sparkles, 
  Clock,
  Play,
  Pause,
  Volume2,
  ChevronRight
} from 'lucide-react';

/* =========================
   PAGE 1 - YOUR DESIGN
========================= */
function Page1() {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState<string>('/background.mp4');

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {videoUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="mb-6 text-center">
          <div className="inline-block px-6 py-2 bg-purple-600/20 backdrop-blur-sm border border-purple-600/50 rounded-full mb-6">
            <span className="text-purple-400 font-bold tracking-wider text-sm">PROFESSIONAL MOVIE MAKING</span>
          </div>
        </div>

        <h1 className="text-8xl md:text-9xl font-black text-white mb-6 text-center drop-shadow-2xl tracking-tighter bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          MANDASTRONG'S
        </h1>
        <h2 className="text-6xl md:text-7xl font-black text-purple-600 mb-6 text-center drop-shadow-2xl tracking-tight">
          STUDIO
        </h2>
        <p className="text-2xl md:text-3xl text-gray-300 mb-12 text-center font-light tracking-wide max-w-3xl">
          Welcome To The All-In-One Make-A-Movie App!
        </p>

        <div className="flex flex-wrap gap-6 justify-center">
          <button
            onClick={() => navigate('/page2')}
            className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl flex items-center gap-3"
          >
            Next
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/page3')}
            className="px-10 py-5 bg-purple-900/30 hover:bg-purple-800/40 backdrop-blur-md border-2 border-purple-600/50 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/page3')}
            className="px-10 py-5 bg-purple-900/30 hover:bg-purple-800/40 backdrop-blur-md border-2 border-purple-600/50 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl"
          >
            Register
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent"></div>
    </div>
  );
}

/* =========================
   PAGE 2 - WELCOME
========================= */
function Page2() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-8xl md:text-9xl font-black text-white mb-6 text-center drop-shadow-2xl tracking-tighter bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          MANDASTRONG'S
        </h1>
        <h2 className="text-6xl md:text-7xl font-black text-purple-600 mb-6 text-center drop-shadow-2xl tracking-tight">
          STUDIO
        </h2>
        <p className="text-2xl md:text-3xl text-gray-300 mb-12 text-center font-light tracking-wide max-w-3xl">
          Make Awesome Family Videos Or Make Your Movie Dreams A Reality! Enjoy!
        </p>

        <div className="flex flex-wrap gap-6 justify-center">
          <button
            onClick={() => navigate('/page1')}
            className="px-10 py-5 bg-purple-900/30 hover:bg-purple-800/40 backdrop-blur-md border-2 border-purple-600/50 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl flex items-center gap-3"
          >
            <ArrowLeft className="w-6 h-6" />
            Back
          </button>
          <button
            onClick={() => navigate('/page3')}
            className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl flex items-center gap-3"
          >
            Continue
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent"></div>
    </div>
  );
}

/* =========================
   PAGE TEMPLATE
========================= */
function Page({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-black text-purple-600 mb-4">{title}</h1>
      <h2 className="text-3xl text-gray-300 mb-8">{subtitle}</h2>
      <p className="text-gray-400">This section is part of the complete 21-page MandaStrong Studio workflow.</p>
    </div>
  );
}

/* =========================
   MEDIA LIBRARY
========================= */
function MediaLibrary() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-black text-purple-600 mb-8">MEDIA LIBRARY</h1>
      
      <div className="border-2 border-dashed border-purple-600/50 rounded-xl p-12 text-center mb-8 bg-purple-900/10">
        <p className="text-xl text-gray-300 mb-2">Click to upload or drag & drop</p>
        <small className="text-gray-500">Images • Video • Audio</small>
      </div>

      <p className="text-gray-400 mb-8">No assets yet.</p>

      <button 
        onClick={() => navigate('/video-studio')}
        className="px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl"
      >
        Open Video Studio
      </button>
    </div>
  );
}

/* =========================
   PAGE 11 - EDITOR SUITE
========================= */
function Page11() {
  const navigate = useNavigate();
  const [movieDuration, setMovieDuration] = useState(6

