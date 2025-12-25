import { Home, ArrowLeft, BookOpen, Play } from 'lucide-react';

interface PageProps {
  onNavigate: (page: number) => void;
}

const EXTERNAL_URLS = {
  guide: '/guide.html',
  store: import.meta.env.VITE_ETSY_STORE_URL || 'https://MandaStrong1.Etsy.com',
};

const VIDEO_PATH = import.meta.env.VITE_OUTRO_VIDEO_PATH || '/static/video/thatsallfolks.mp4';

export default function Page21({ onNavigate }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900/20 via-black to-green-900/20 text-white flex flex-col">
      <button className="fixed top-6 right-6 z-50 w-12 h-12 bg-gradient-to-br from-red-500 to-green-600 hover:from-red-400 hover:to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 transition-all hover:scale-110">
        <Play className="w-6 h-6 text-white" />
      </button>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full text-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 mb-8">
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-red-500/30 mb-6">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={VIDEO_PATH} type="video/mp4" />
              </video>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-8 tracking-tight text-red-400">
              THAT'S ALL FOLKS!
            </h1>

            <div className="max-w-4xl mx-auto mb-8 text-center bg-gradient-to-br from-red-900/40 to-black/40 rounded-2xl p-12 border-2 border-red-400/50 shadow-2xl">
              <h2 className="text-3xl text-red-300 font-bold mb-6">A Special Thank You</h2>
              <p className="text-xl text-white font-semibold mb-6 leading-relaxed">
                To all current and future creators, dreamers, and storytellers...
              </p>
              <p className="text-lg text-white/90 leading-relaxed mb-4">
                Your creativity and passion inspire positive change in the world. Through your films and stories,
                you have the power to educate, inspire, and bring awareness to critical issues like bullying prevention,
                social skills development, and humanity's collective growth.
              </p>
              <p className="text-lg text-white/90 leading-relaxed mb-4">
                Every piece of content you create has the potential to touch hearts, change minds, and make our world
                a better place. Thank you for being part of this mission to combine creative expression with meaningful impact.
              </p>
              <p className="text-lg text-red-300 font-semibold leading-relaxed">
                Together, we are building a community of creators who use their talents to spread kindness,
                understanding, and hope. Your impact matters more than you know.
              </p>
            </div>

            <button
              onClick={() => window.open(EXTERNAL_URLS.guide, '_blank')}
              className="w-full max-w-2xl mx-auto mb-6 bg-black/50 hover:bg-red-900/40 rounded-xl p-6 border border-red-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <BookOpen className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold text-red-400">Full User Guide To MandaStrong Studio</h2>
              </div>
              <p className="text-sm text-white/60">Click to access the complete guide</p>
            </button>

            <div className="max-w-3xl mx-auto mb-8 bg-gradient-to-br from-black/50 to-red-900/30 rounded-2xl p-8 border-2 border-red-500/40 shadow-xl">
              <h3 className="text-2xl font-bold text-red-300 mb-6 text-center">About Our Mission</h3>
              <div className="space-y-4 text-white/90 leading-relaxed">
                <p className="text-lg">
                  <span className="font-bold text-red-300">MandaStrong Studio</span> is more than a filmmaking platform.
                  It's part of a comprehensive educational initiative designed to bring awareness and action to schools
                  regarding bullying prevention, social skills development, and the cultivation of humanity in our communities.
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-red-300">Fundraiser: Educational Program on Bullying Prevention & Social Skills</span>
                  {' '}~ Through this comprehensive program, we provide educational resources and movie-based content to help schools
                  address these critical issues. Our goal is to create safe, supportive environments where every student can thrive.
                </p>
                <div className="bg-red-900/40 rounded-xl p-6 border border-red-400/30 mt-6">
                  <p className="text-xl font-semibold text-red-200 mb-3 text-center">Supporting Our Heroes</p>
                  <p className="text-lg text-center">
                    <span className="font-bold text-white">All Etsy Store Proceeds Benefit Veterans Mental Health Services</span>
                    {' '}~ 100% of all proceeds from our Etsy Store fundraiser
                    are donated directly to <span className="font-bold text-red-200">Veterans Mental Health Services</span>,
                    supporting those who have sacrificed so much for our freedom.
                  </p>
                </div>
                <p className="text-lg text-center mt-6">
                  Visit our fundraiser and learn more at{' '}
                  <a
                    href={EXTERNAL_URLS.store}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-300 hover:text-red-200 underline font-bold transition-colors"
                  >
                    MandaStrong1.Etsy.com
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-black/50 rounded-2xl p-8 border border-red-500/30 mb-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-red-400" />
                <h2 className="text-3xl font-bold text-red-400">Full User Guide To MandaStrong Studio</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <h3 className="font-bold text-red-400 mb-2">Navigation</h3>
                  <p className="text-white/80 text-sm">• Use Back and Next buttons to navigate between pages</p>
                  <p className="text-white/80 text-sm">• Pages 1-3: Welcome, Story & Concept, Login/Register</p>
                  <p className="text-white/80 text-sm">• Pages 4-9: AI Tool Board with 720 creative tools</p>
                  <p className="text-white/80 text-sm">• Page 10: Upload your existing movie</p>
                  <p className="text-white/80 text-sm">• Page 11: Media Box with all generated assets</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-red-400 mb-2">Editing & Export</h3>
                  <p className="text-white/80 text-sm">• Pages 12-16: Professional editing tools with timeline</p>
                  <p className="text-white/80 text-sm">• Page 17: Full screen preview of your finished film</p>
                  <p className="text-white/80 text-sm">• Page 18: Terms of Service and Disclaimer</p>
                  <p className="text-white/80 text-sm">• Page 19: Agent Grok 24/7 Help Desk</p>
                  <p className="text-white/80 text-sm">• Page 20: Community Hub to share your work</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-red-400 mb-2">Tools & Features</h3>
                  <p className="text-white/80 text-sm">• Search Bar: Find specific AI tools quickly</p>
                  <p className="text-white/80 text-sm">• Upload/Create buttons: Generate or import assets</p>
                  <p className="text-white/80 text-sm">• Timeline: 4 tracks (SRT, VIDEO, AUDIO, TEXT)</p>
                  <p className="text-white/80 text-sm">• Maximum duration: 180 minutes (3 hours)</p>
                  <p className="text-white/80 text-sm">• All assets auto-save to Media Box on Page 11</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-red-400 mb-2">Subscription Plans</h3>
                  <p className="text-white/80 text-sm">• BASIC ($10/mo): 30-minute films</p>
                  <p className="text-white/80 text-sm">• PRO ($20/mo): 1-hour films</p>
                  <p className="text-white/80 text-sm">• STUDIO ($30/mo): 2.5-hour films</p>
                  <p className="text-white/80 text-sm">• All plans include access to 720 AI tools</p>
                  <p className="text-white/80 text-sm">• Cancel anytime with 30-day refund policy</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onNavigate(19)}
              className="flex items-center gap-2 bg-black text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-red-900 transition-all border border-red-500"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={() => onNavigate(0)}
              className="flex items-center gap-2 bg-red-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-red-500 transition-all"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
