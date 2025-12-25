import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';

export default function Page0() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-black to-black opacity-50"></div>

      <div className="relative z-10 text-center">
        <Film className="w-32 h-32 text-purple-600 mx-auto mb-8 animate-fade-in" />
        <h1 className="text-white text-7xl font-black tracking-wider mb-4 animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
          MANDASTRONG STUDIO
        </h1>
        <p className="text-purple-400 text-2xl font-light tracking-widest animate-fade-in" style={{ animationDelay: '1s', opacity: 0, animationFillMode: 'forwards' }}>
          PRESENTS
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent animate-pulse"></div>
    </div>
  );
}
