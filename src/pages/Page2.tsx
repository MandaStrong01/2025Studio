import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export default function Page2() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source src="/static/video/background.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/50 to-black" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <Sparkles className="w-20 h-20 text-purple-500 mx-auto mb-8 animate-pulse" />

        <h1 className="text-7xl md:text-8xl font-black text-white mb-8 text-center drop-shadow-2xl tracking-tight">
          MANDASTRONG'S STUDIO
        </h1>

        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-3xl md:text-4xl text-center font-bold text-transparent bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600 bg-clip-text mb-6">
            Make Amazing Family Movies
          </p>
          <p className="text-3xl md:text-4xl text-center font-bold text-transparent bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text">
            & Bring Dreams To Life!
          </p>
        </div>

        <div className="flex gap-8">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 px-10 py-5 bg-purple-900/30 hover:bg-purple-800/40 backdrop-blur-md border-2 border-purple-600/50 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl"
          >
            <ArrowLeft className="w-6 h-6" />
            Back
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl"
          >
            Next
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent"></div>
    </div>
  );
}
