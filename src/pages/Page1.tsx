import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Page1() {
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
        <source src="/static/video/background.mp4" type="video/mp4" />
      </video>

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
            onClick={() => navigate('/intro')}
            className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl flex items-center gap-3"
          >
            Next
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="px-10 py-5 bg-purple-900/30 hover:bg-purple-800/40 backdrop-blur-md border-2 border-purple-600/50 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/auth')}
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
