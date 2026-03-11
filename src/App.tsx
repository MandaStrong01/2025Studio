import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Menu, X, ChevronLeft, ChevronRight, Play, Upload, Film, Mic,
  Zap, Shield, Music, Sliders, Database, FileVideo, Clock,
  ThumbsUp, Heart, Plus, Eye, Download, Save, Wand2, Trash2,
  Share2, Search, AlertCircle, Loader, CheckCircle, Sparkles,
  MessageCircle, Send, User, Lock, CreditCard, LogOut, Settings,
  Volume2, Layers, Scissors, BarChart2, Globe, Star, Award,
  Camera, Monitor, HardDrive, Cpu, Activity, BookOpen
} from 'lucide-react';

// ===================== VIDEOS =====================
const OCEAN_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-ocean-waves-loop-1196-large.mp4";

// ===================== TYPES =====================
interface Asset {
  id: number;
  name: string;
  type: string;
  size: string;
  url: string;
  timestamp: string;
  aiGenerated?: boolean;
  enhanced?: boolean;
}

interface TimelineState {
  video: Asset[];
  audio: Asset[];
  text: Asset[];
}

interface Toast {
  id: number;
  msg: string;
  type: string;
}

// ===================== AI TOOLS DATA =====================
const AI_TOOLS: Record<string, string[]> = {
  Writing: [
    "Script to Cinema","Cinematic Beat Architect","Natural Dialogue Engine","Character Depth Matrix",
    "Three Act Structure","Scene Reality Builder","Subtext Weaver","Documentary Arc Engine",
    "Narrative Physics Solver","Backstory Generator","Plot Tension Engine","World Bible Creator",
    "Character Voice Lab","Pacing Analyzer","Logline Generator","Synopsis Writer","Treatment Formatter",
    "Coverage Writer","Scene Heading Tool","Action Line Optimizer","Parenthetical Generator",
    "Script Timer","Format Checker","Character Interview","Scene Setting Engine","Emotional Arc Map",
    "Story Question Builder","Inciting Incident Finder","Midpoint Architect","Dark Night Designer",
    "Plot Device Generator","Opening Hook Creator","Climax Designer","Character Mapper",
    "Flashback Creator","Foreshadowing Tool","Beat Sheet Builder","Character Arc Tracker",
    "Subplot Generator","MacGuffin Creator","Plot Hole Detector","Continuity Checker",
    "Trope Finder","Cliche Detector","Originality Scorer","Genre Analyzer","Tone Checker",
    "POV Analyzer","Tense Checker","Readability Meter","Engagement Scorer","Word Counter",
    "Sprint Timer","Version Control","Revision Tracker","Research Helper","Fact Checker",
    "Theme Generator","Plot Twist Creator","Scene Analyzer","Magic System Builder","Tech Inventor",
    "Culture Creator","Language Builder","Religion Designer","Government Tool","Economy Builder",
    "Geography Mapper","History Timeline","Mythology Builder","Legend Writer","Prophecy Creator",
    "Quest Designer","Story Consultant","Character Flaw Finder","Story Goal Setter",
    "Grammar Polish","Spell Check","Name Generator","Location Database","Prop List","Costume Designer",
    "Scene Number","Page Counter","Reading Timer","Pitch Deck Builder","Character Bio",
    "Grammar Analyzer","Dialogue Tightener","Voice Consistency","Narrative Flow","Story Arc Map",
    "Network Graph","Distribution Chart","Collab Hub","Comment System","Story Outliner","Plot Generator"
  ],
  Voice: [
    "Neural Vocal Clone","Text to Speech Natural","Voice Narrator Pro","Voice Actor Generator",
    "Multi Voice Generator","Voice Maker Studio","Premium Voice Engine","Emotion Voice Synth",
    "Natural Voice Creator","Accent Generator","Pitch Controller","Tone Adjuster","Lip Sync AI",
    "Audiobook Creator","Commercial Voice","Trailer Voice","Documentary Voice","News Anchor Voice",
    "Radio DJ Voice","Sports Cast Voice","Meditation Voice","ASMR Creator","Whisper Generator",
    "Range Finder","Articulation Engine","Diction Drill","Vocal Workout","Range Expander",
    "Stamina Builder","Quality Enhancer","Clarity Boost","Richness Amplifier","Warmth Adder",
    "Brightness Mixer","Raspy Tool","Smooth Filter","Texture Designer","Timbre Modifier",
    "Resonance Tuner","Projection Booster","Volume Expander","Dynamic Range Engine","Compression Tool",
    "EQ Voice Studio","De-esser","Pop Filter","Noise Gate","Reverb Voice","Echo Voice",
    "Delay Voice","Chorus FX","Flanger FX","Phaser FX","Distortion FX","Lo-fi Voice",
    "Radio Effect","Phone Effect","Megaphone Effect","Robot Voice","Alien Voice","Monster Voice",
    "Deep Voice","High Voice","Child Voice","Elderly Voice","Speed Modifier","Volume Normalizer",
    "Breathing Coach","Vocal Coach","Voice Health Monitor","Strain Detector","Rest Reminder",
    "Hydration Alert","Posture Guide","Voice Warm-up","Subsurface Vocal Resonance",
    "Human Scale Dialect","Studio Grade Clarity","Natural Breathing Logic","Linguistic Micro Fluency",
    "Dynamic Timbre Synth","Atmospheric Room Tone","Voice Consistency Checker","Dialogue Synth",
    "Character Voice Lab","Narrator Optimizer","Pitch Training","Endurance Trainer","Voice Recorder"
  ],
  Image: [
    "Photoreal Texture Mapper","8K Asset Architect","Global Illumination AI","Subsurface Scattering Pro",
    "Optical Displacement Lab","Physical Material Shader","Cinematic Plate Synthesis","Environment Reality Synth",
    "Image Generator Pro","Background Generator","Character Design Engine","Lighting Designer",
    "Scene Compositor","Photo Enhancer","Image Upscaler","Style Transfer Engine","Text to Image",
    "Color Grading Studio","Tone Mapper","Film Grain Synth","Bokeh Generator","Sky Replacer",
    "Cloud Generator","Prop Creator","Depth Map Engine","Normal Map Generator","Albedo Map Tool",
    "Roughness Map","Metallic Map","Emission Map","Ambient Occlusion","Shadow Generator",
    "Highlight Creator","Rim Light Tool","Fill Light Engine","Key Light Studio","3 Point Light",
    "Studio Light","Natural Light","Golden Hour","Blue Hour","Night Scene","Sunrise FX",
    "Sunset FX","Moonlight","Starlight","Fire Light","Candle Light","Neon Light","LED Effect",
    "LUT Creator","Contrast Adjuster","Brightness Tool","Saturation Engine","Hue Shift",
    "Temperature Control","Tint Controller","Exposure Fixer","HDR Merger","Panorama Stitcher",
    "360 Image Creator","Fisheye Corrector","Lens Distorter","Chromatic Aberration","Vignette Tool",
    "Noise Adder","Scratch Creator","Dust Particles","Light Leaks","Depth of Field Engine",
    "Motion Blur","Radial Blur","Zoom Blur","Gaussian Blur","Smart Blur","Sharpener",
    "Edge Enhancer","Detail Booster","Clarity Tool","Structure Builder","Dehaze Engine",
    "Weather FX","Rain Creator","Snow Effect","Fog Generator","Mist Tool","Haze Creator",
    "Smoke FX","Steam Generator","Fire Creator","Explosion FX","Spark Generator","Lightning FX",
    "Aurora Effect","Rainbow Creator","Lens Flare","God Rays","Volumetric Light","Caustics Engine"
  ],
  Video: [
    "Video Upscaler 4K","Video Upscaler 8K","Frame Rate Booster","60FPS Converter",
    "Slow Motion Generator","Video Extender","Scene Generator","Motion Video Maker",
    "Avatar Generator","Video Synthesizer","Image to Motion","Dynamic Pan","Tilt Shot",
    "Tracking Shot","Crane Movement","Steadycam Engine","Shot Transition","Close Up Creator",
    "Wide Shot Builder","POV Shot","Zoom Controller","Dolly In","Dolly Out","Time Lapse Creator",
    "Speed Ramp Engine","Flow Generator","Style Transfer Video","Temporal Flow","Frame Blender",
    "Handheld FX","Establishing Shot","Medium Shot","Over Shoulder","Dutch Angle","Whip Pan",
    "Swish Pan","Truck Movement","Pedestal Control","Arc Shot","Orbit Shot","Boom Movement",
    "Jib Shot","Drone Shot","Aerial View","Birds Eye","Ground Level","Low Angle","High Angle",
    "Eye Level","Worm's Eye","Canted Frame","Symmetry Tool","Rule of Thirds","Golden Ratio",
    "Leading Lines","Frame in Frame","Negative Space","Depth Layers","Video Stabilizer",
    "Color Grading Pro","Background Remover","Film Restorer","Black White Colorizer",
    "Cinematic Camera Tracking","Optical Flow Master","Dynamic Exposure Link",
    "Photorealistic Frame Synth","Dolly Zoom Physics","Lens Distortion Logic",
    "Natural Light Interaction","Temporal Motion Physics","Video Creator Pro",
    "Video Studio Suite","Scene Reality Engine","Motion Controller","Shot Designer",
    "Clip Optimizer","Sequence Builder","Transition Library","Effect Stack","Color Match"
  ],
  Motion: [
    "Particle Effect Generator","VFX Generator","Style Transfer Motion","Motion Tracker Pro",
    "Mocap Logic Engine","Physics Engine","Cloth Dynamics","Skeleton Animator","Facial Rigging",
    "Body Movement Engine","Camera Tracker","Particle System","Fluid Dynamics","Spring System",
    "Keyframe Tool","Graph Editor","Ease In","Ease Out","Bounce Effect","Elastic Motion",
    "Anticipation Engine","Follow Through","Object Physics","Gravity Simulator","Collision Detector",
    "Soft Body Physics","Rigid Body Engine","Fluid Dynamic Sim","Smoke Simulator","Fire Dynamic",
    "Water Physics","Wind Effect","Force Field","Turbulence Engine","Vortex Creator",
    "Attraction Field","Repulsion Engine","Gravity Well","Rope Physics","Chain Dynamic",
    "Hair Simulator","Fur Dynamic","Cloth Draper","Flag Wave","Curtain Motion","Dress Physics",
    "Muscle System","Skin Deformer","Explosion Effect","Fire Effect","Smoke Effect","Water Effect",
    "Lightning Effect","Magic Effect","Energy Beam","Glitch Effect","Hologram Effect",
    "Portal Effect","Teleportation FX","Invisibility Effect","Laser Effect","Plasma Effect",
    "Shockwave Creator","Dust Effect","Neural Muscle Dynamics","Fluid Sim Realism",
    "Facial Micro Expression","Anatomic Accuracy Lab","Gravity Linked Movement",
    "Biometric Logic Sync","Skeleton Physics Tracker","Motion Capture Solver","Timeline Editor",
    "Keyframe Optimizer","Curve Editor","Path Animator","Constraint Solver","IK Rig Builder"
  ],
  Enhancement: [
    "AI 8K Upscaling","Video Denoiser","Audio Enhancer","Noise Cancellation","Face Enhancement",
    "Cinematic Grain","Motion Stabilization","Deep HDR Boost","Face Retouch Pro",
    "Neural Noise Reduction","Auto Color Balance","Dynamic Range Expansion","Lens Flare Synth",
    "Shadow Recovery","Highlight Rolloff","Skin Tone Uniformity","Optical Flow Smooth",
    "Atmospheric Haze","Sharpen Intelligence","De-Banding Pro","Moire Removal",
    "Color Space Transform","Anamorphic Stretch","Flicker Reduction","Low Light Clarity",
    "Texture Enhancement","Micro Contrast Adjust","Vignette Pro","Film Stock Emulation",
    "Glow Synthesis","Edge Refinement","Smart Saturation","Tone Mapping Pro","Gamma Correction",
    "Black Point Calibration","White Balance AI","Color Match Pro","Temporal Denoise",
    "Digital Intermediate","Chromatic Correction","Film Grain Advanced","Halation Effect",
    "Bloom Control","Light Wrap","Contrast Enhancer","Brightness Optimizer","Saturation Booster",
    "HDR Video Creator","Night Video Enhancer","Quality Optimizer","Resolution Multiplier",
    "Detail Enhancer","Clarity Booster","Sharpness Enhancer","Blur Remover","Artifact Remover",
    "Scratch Remover","Flicker Fixer","Sky Replacement","Background Replacer","Object Remover",
    "Watermark Remover","Echo Remover","Reverb Remover","Hum Remover","Pop Remover",
    "Click Remover","Breath Remover","Room Tone Remover","Photoreal Upscale 8K",
    "HDR Luma Mapping","Optical Lens Flare","Atmospheric Volume","Physical Grain Synth",
    "Chromatic Accuracy","Raw Film Stock Pro","Color Space Conform","Luma Chroma Balance",
    "Deep Black Stability","Depth of Field Solve","Edge Detail Recovery","Anamorphic Correction",
    "Gamma Curve Reality","Neural Skin Shader","Lens Blur Synthesis","Light Wrap Realism",
    "Motion Path Physics","Ray Traced Shadows","Surface Reflection","Human Skin Neural"
  ]
};

// ===================== PRICING PLANS =====================
const PLANS = [
  {
    name: 'Creator',
    price: 20,
    features: ['HD Export 1080p', '100 AI Tools', '10GB Storage', 'Email Support', 'Basic Timeline'],
    stripe: 'https://buy.stripe.com/test_basic',
    color: '#374151'
  },
  {
    name: 'Pro',
    price: 30,
    features: ['4K Export', '300 AI Tools', '100GB Storage', 'Priority Support', 'Full Timeline', 'Commercial License'],
    stripe: 'https://buy.stripe.com/test_pro',
    color: '#4C1D95',
    popular: true
  },
  {
    name: 'Studio',
    price: 50,
    features: ['8K Export', '600+ AI Tools', '1TB Storage', '24/7 Support', 'Full Rights', 'API Access', 'Collaboration'],
    stripe: 'https://buy.stripe.com/test_studio',
    color: '#1F2937'
  }
];

// ===================== TOAST =====================
function Toast({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded border pointer-events-auto min-w-64 max-w-sm
          ${t.type === 'success' ? 'bg-[#0a0a0a] border-[#16a34a] text-[#4ade80]' :
            t.type === 'error' ? 'bg-[#0a0a0a] border-[#dc2626] text-[#f87171]' :
            t.type === 'warning' ? 'bg-[#0a0a0a] border-[#ca8a04] text-[#facc15]' :
            'bg-[#0a0a0a] border-[#6B21A8] text-[#c084fc]'}`}
          style={{ animation: 'slideInRight 0.2s ease' }}>
          <span className="text-sm font-mono flex-1 tracking-wide">{t.msg}</span>
          <button onClick={() => removeToast(t.id)} className="text-zinc-600 hover:text-white ml-1 text-xs">✕</button>
        </div>
      ))}
    </div>
  );
}

// ===================== MAIN APP =====================
export default function App() {
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [duration, setDuration] = useState(90);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Writing');
  const [selectedEnhancement, setSelectedEnhancement] = useState<string | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<Asset[]>([]);
  const [timeline, setTimeline] = useState<TimelineState>({ video: [], audio: [], text: [] });
  const [draggedItem, setDraggedItem] = useState<Asset | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Asset | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [audioLevels, setAudioLevels] = useState({ music: 75, voice: 60, sfx: 50, master: 85 });
  const [enhancementSettings, setEnhancementSettings] = useState({ intensity: 75, clarity: 80, color: 70, brightness: 65 });
  const [exportSettings, setExportSettings] = useState({ quality: '8K', format: 'MP4' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toolSearch, setToolSearch] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [grokMessage, setGrokMessage] = useState('');
  const [grokChat, setGrokChat] = useState([
    { role: 'agent', text: "I'm Agent Grok — your 24/7 production assistant. Ask me anything about uploads, AI generation, timeline editing, enhancements, audio mixing, rendering, or exports." }
  ]);
  const [communityPosts] = useState([
    { id: 1, title: 'Epic Action Feature', user: 'Sarah J.', emoji: '🎬', likes: 2847, loves: 1923 },
    { id: 2, title: 'Family Documentary', user: 'Mike Chen', emoji: '📹', likes: 1256, loves: 892 },
    { id: 3, title: 'Short Film Entry', user: 'Emily R.', emoji: '🏆', likes: 3421, loves: 2156 },
    { id: 4, title: 'Music Video Cut', user: 'Alex T.', emoji: '🎵', likes: 5234, loves: 4012 }
  ]);
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  // Examples page state
  const [exIsAdmin, setExIsAdmin] = useState(false);
  const [exShowLogin, setExShowLogin] = useState(false);
  const [exEmail, setExEmail] = useState('');
  const [exPassword, setExPassword] = useState('');
  const [exError, setExError] = useState('');
  const [exActiveVideo, setExActiveVideo] = useState<number | null>(null);
  const [exVideos, setExVideos] = useState([
    { id: 0, url: null as string | null, name: '', title: 'Example Film 01' },
    { id: 1, url: null as string | null, name: '', title: 'Example Film 02' },
    { id: 2, url: null as string | null, name: '', title: 'Feature Showcase' },
  ]);
  const exRef0 = useRef<HTMLInputElement>(null);
  const exRef1 = useRef<HTMLInputElement>(null);
  const exRef2 = useRef<HTMLInputElement>(null);
  const exRefs = [exRef0, exRef1, exRef2];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const oceanRef = useRef<HTMLVideoElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = useCallback((msg: string, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const goTo = useCallback((p: number) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); }, []);

  // Auto-save
  useEffect(() => {
    if (page >= 5) {
      autoSaveRef.current = setInterval(() => {
        setAutoSaveStatus('saving');
        try {
          localStorage.setItem('ms_save', JSON.stringify({ mediaLibrary, timeline, audioLevels, duration, exportSettings }));
          setAutoSaveStatus('saved');
          setLastSaved(new Date());
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } catch { setAutoSaveStatus('error'); }
      }, 15000);
      return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
    }
  }, [page, mediaLibrary, timeline, audioLevels, duration, exportSettings]);

  // Ocean video autoplay on pages 1-2
  useEffect(() => {
    if (oceanRef.current && (page === 1 || page === 2)) {
      oceanRef.current.muted = true;
      oceanRef.current.play().catch(() => {});
    }
  }, [page]);

  // Load saved
  useEffect(() => {
    const saved = localStorage.getItem('ms_save');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setMediaLibrary(d.mediaLibrary || []);
        setTimeline(d.timeline || { video: [], audio: [], text: [] });
        setAudioLevels(d.audioLevels || { music: 75, voice: 60, sfx: 50, master: 85 });
        setDuration(d.duration || 90);
        setExportSettings(d.exportSettings || { quality: '8K', format: 'MP4' });
      } catch {}
    }
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadProgress(0);
    let completed = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        completed++;
        const asset: Asset = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
          size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
          url: ev.target?.result as string,
          timestamp: new Date().toISOString()
        };
        setMediaLibrary(prev => [...prev, asset]);
        setUploadProgress(Math.round((completed / files.length) * 100));
        if (completed === files.length) {
          setTimeout(() => { setUploadProgress(null); addToast(`${files.length} file(s) uploaded`, 'success'); }, 600);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [addToast]);

  const handleAIGenerate = useCallback(() => {
    if (!aiPrompt.trim() || !selectedTool) return;
    setGenerating(true);
    addToast(`Generating: ${selectedTool}...`, 'info');
    setTimeout(() => {
      const asset: Asset = {
        id: Date.now(),
        name: `AI_${selectedTool.replace(/\s+/g, '_')}_${Date.now()}.mp4`,
        type: 'video',
        size: (Math.random() * 500 + 100).toFixed(2) + 'MB',
        url: 'data:video/mp4;base64,SIMULATED',
        aiGenerated: true,
        timestamp: new Date().toISOString()
      };
      setMediaLibrary(prev => [...prev, asset]);
      setGenerating(false);
      setAiPrompt('');
      setSelectedTool(null);
      addToast(`Generated: ${selectedTool}`, 'success');
    }, 2500);
  }, [aiPrompt, selectedTool, addToast]);

  const handleRender = useCallback(() => {
    if (!timeline.video.length && !timeline.audio.length) {
      addToast('Add clips to timeline first', 'error'); return;
    }
    setRendering(true);
    setRenderProgress(0);
    addToast('Render started...', 'info');
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const rendered: Asset = {
            id: Date.now(),
            name: `render_${Date.now()}.${exportSettings.format.toLowerCase()}`,
            type: 'video',
            size: (Math.random() * 1000 + 500).toFixed(2) + 'MB',
            url: 'data:video/mp4;base64,RENDERED',
            timestamp: new Date().toISOString()
          };
          setMediaLibrary(prev => [...prev, rendered]);
          setCurrentVideo(rendered);
          setRendering(false);
          addToast('Render complete!', 'success');
          setTimeout(() => goTo(17), 800);
          return 100;
        }
        return prev + 3;
      });
    }, 120);
  }, [timeline, exportSettings, addToast, goTo]);

  const sendGrokMessage = useCallback(() => {
    if (!grokMessage.trim()) return;
    const userMsg = grokMessage;
    setGrokChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setGrokMessage('');
    setTimeout(() => {
      const responses: Record<string, string> = {
        upload: "Go to Page 10 — Upload Media. Drag files or click Browse. Supports MP4, MOV, AVI, MP3, WAV, JPG, PNG.",
        tool: "Navigate to Pages 4–9 for AI Tool Boards. Search 600+ tools by category. Click any tool to open the generation panel.",
        timeline: "Page 12 — Timeline Editor. Drag assets from your Media Library onto Video, Audio, or Text tracks.",
        render: "Page 15 — Render Film. Set quality (up to 8K) and format, then hit Render. Your finished film goes to Page 16.",
        audio: "Page 14 — Audio Mixer. Four channels: Music, Voice, SFX, Master. Adjust levels with the faders.",
        export: "Page 17 — Export. Choose 8K, 4K, HD or SD. Download locally or share to Community Hub.",
      };
      const key = Object.keys(responses).find(k => userMsg.toLowerCase().includes(k));
      const reply = key ? responses[key] : "I can help with any part of MandaStrong Studio — uploads, AI tools, timeline, rendering, audio mixing, or export. What specifically do you need?";
      setGrokChat(prev => [...prev, { role: 'agent', text: reply }]);
    }, 1000);
  }, [grokMessage]);

  // ==================== STYLES ====================
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Barlow:ital,wght@0,300;0,400;0,700;1,300;1,700&display=swap');
    
    :root {
      --void: #060608;
      --deep: #0c0c10;
      --panel: #111116;
      --border: rgba(255,255,255,0.06);
      --border-active: rgba(139,92,246,0.5);
      --purple: #6B21A8;
      --purple-mid: #7C3AED;
      --purple-bright: #A78BFA;
      --silver: #94A3B8;
      --silver-bright: #CBD5E1;
      --text: #E2E8F0;
      --text-dim: #64748B;
      --purple-alt: #A78BFA;
      --red: #EF4444;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    html, body { 
      background: var(--void); 
      color: var(--text); 
      font-family: 'Barlow', sans-serif;
      overflow-x: hidden;
    }

    /* Film grain overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9998;
      opacity: 0.4;
    }

    .font-display { font-family: 'Bebas Neue', sans-serif; }
    .font-mono { font-family: 'DM Mono', monospace; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--void); }
    ::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 2px; }

    /* Animations */
    @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes scanline {
      0% { top: -10%; }
      100% { top: 110%; }
    }
    @keyframes flicker { 0%,100%{opacity:1} 50%{opacity:0.97} 75%{opacity:0.99} }

    .fade-up { animation: fadeUp 0.5s ease both; }
    .animate-pulse { animation: pulse 2s ease-in-out infinite; }
    .animate-spin { animation: spin 1s linear infinite; }
    .animate-flicker { animation: flicker 4s ease-in-out infinite; }

    input[type=range] {
      -webkit-appearance: none;
      background: rgba(255,255,255,0.05);
      border-radius: 2px;
      height: 3px;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px; height: 14px;
      border-radius: 50%;
      background: var(--purple-mid);
      border: 2px solid var(--purple-bright);
      cursor: pointer;
    }

    /* Panel style */
    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
    }
    .panel-active {
      border-color: var(--border-active);
    }

    /* Btn primary */
    .btn-primary {
      background: var(--purple);
      color: white;
      border: 1px solid rgba(139,92,246,0.3);
      font-family: 'DM Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 0.6rem 1.5rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-primary:hover { background: var(--purple-mid); }
    .btn-secondary {
      background: transparent;
      color: var(--text-dim);
      border: 1px solid var(--border);
      font-family: 'DM Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 0.6rem 1.5rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-secondary:hover { border-color: var(--purple-bright); color: var(--text); }

    /* Tool card */
    .tool-card {
      background: var(--deep);
      border: 1px solid var(--border);
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all 0.15s;
      text-align: left;
    }
    .tool-card:hover {
      border-color: rgba(139,92,246,0.4);
      background: rgba(107,33,168,0.1);
    }

    /* Scanline effect */
    .scanline::after {
      content: '';
      position: absolute;
      left: 0; right: 0;
      height: 2px;
      background: linear-gradient(to right, transparent, rgba(139,92,246,0.15), transparent);
      animation: scanline 6s linear infinite;
      pointer-events: none;
    }

    /* Track */
    .track-bar {
      height: 28px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      position: relative;
      overflow: hidden;
    }

    /* Clip on timeline */
    .timeline-clip {
      position: absolute;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 0.5rem;
      font-family: 'DM Mono', monospace;
      font-size: 0.6rem;
      color: white;
      overflow: hidden;
    }
  `;

  // ==================== NAV MENU ====================
  const NAV_ITEMS = [
    { label: '01 — Home', p: 1 },
    { label: '02 — About', p: 2 },
    { label: '03 — Examples', p: 3 },
    { label: '04 — Login & Access', p: 4 },
    { label: '05 — Writing Tools', p: 5 },
    { label: '06 — Voice Tools', p: 6 },
    { label: '07 — Image Tools', p: 7 },
    { label: '08 — Video Tools', p: 8 },
    { label: '09 — Motion Tools', p: 9 },
    { label: '10 — Enhancement', p: 10 },
    { label: '11 — Upload Media', p: 11 },
    { label: '12 — Editor Suite', p: 12 },
    { label: '13 — Timeline', p: 13 },
    { label: '14 — Enhancements', p: 14 },
    { label: '15 — Audio Mixer', p: 15 },
    { label: '16 — Render', p: 16 },
    { label: '17 — Preview', p: 17 },
    { label: '18 — Export', p: 18 },
    { label: '19 — Tutorials', p: 19 },
    { label: '20 — Terms', p: 20 },
    { label: '21 — Agent Grok', p: 21 },
    { label: '22 — Community', p: 22 },
    { label: '23 — Thank You', p: 23 },
  ];

  const toolCategories = ['Writing', 'Voice', 'Image', 'Video', 'Motion', 'Enhancement'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--text)', position: 'relative' }}>
      <style>{css}</style>
      <input ref={fileInputRef} type="file" multiple accept="video/*,audio/*,image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

      {/* TOAST */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* AUTO-SAVE */}
      {page >= 5 && (
        <div style={{ position: 'fixed', bottom: '4rem', right: '1rem', zIndex: 100 }}>
          <div className="panel font-mono" style={{ padding: '0.3rem 0.75rem', fontSize: '0.6rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {autoSaveStatus === 'saving' && <><Loader size={10} className="animate-spin" style={{ color: '#facc15' }} /><span style={{ color: '#facc15' }}>SAVING</span></>}
            {autoSaveStatus === 'saved' && <><CheckCircle size={10} style={{ color: 'var(--purple-bright)' }} /><span style={{ color: 'var(--purple-bright)' }}>SAVED</span></>}
            {autoSaveStatus === 'idle' && lastSaved && <><span style={{ color: 'var(--text-dim)' }}>AUTOSAVE ON</span></>}
          </div>
        </div>
      )}

      {/* MENU BUTTON */}
      <div style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', zIndex: 1000 }}>
        <button onClick={() => setMenuOpen(!menuOpen)} className="btn-primary" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {menuOpen && (
          <div className="panel" style={{ position: 'absolute', top: '3rem', left: 0, width: '240px', maxHeight: '80vh', overflowY: 'auto', padding: '1rem 0' }}>
            <div style={{ padding: '0.5rem 1rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
              <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>STUDIO PLAN — ADMIN</div>
              <div className="font-display" style={{ fontSize: '1rem', color: 'var(--purple-bright)' }}>MANDASTRONG</div>
            </div>
            {NAV_ITEMS.map(item => (
              <button key={item.p} onClick={() => goTo(item.p)}
                className="font-mono"
                style={{
                  display: 'block', width: '100%', padding: '0.5rem 1rem', textAlign: 'left',
                  fontSize: '0.65rem', letterSpacing: '0.1em', background: page === item.p ? 'rgba(107,33,168,0.2)' : 'transparent',
                  color: page === item.p ? 'var(--purple-bright)' : 'var(--text-dim)',
                  border: 'none', cursor: 'pointer', borderLeft: page === item.p ? '2px solid var(--purple-bright)' : '2px solid transparent',
                  transition: 'all 0.1s'
                }}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GROK BUTTON */}
      {page !== 21 && (
        <button onClick={() => goTo(21)}
          style={{ position: 'fixed', bottom: '4rem', left: '1.25rem', zIndex: 100, background: 'var(--purple)', border: '1px solid rgba(139,92,246,0.3)', color: 'white', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span className="font-display" style={{ fontSize: '1rem' }}>G</span>
        </button>
      )}

      {/* FOOTER */}
      {page >= 2 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50, borderTop: '1px solid var(--border)', background: 'rgba(6,6,8,0.95)', padding: '0.4rem', textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>
            MANDASTRONG STUDIO 2026 &nbsp;•&nbsp; PROFESSIONAL CINEMA SYNTHESIS &nbsp;•&nbsp; MandaStrong1.Etsy.com
          </span>
        </div>
      )}

      {/* NAV ARROWS */}
      {page > 1 && page < 23 && (
        <div style={{ position: 'fixed', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => goTo(page - 1)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ChevronLeft size={12} /> BACK
          </button>
          <button onClick={() => goTo(page + 1)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            NEXT <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* ======================== PAGES ======================== */}
      <main style={{ minHeight: '100vh', paddingBottom: '5rem' }}>

        {/* PAGE 1 — LANDING */}
        {page === 1 && (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Ocean video background */}
            <video ref={oceanRef} autoPlay loop muted playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18, pointerEvents: 'none' }}>
              <source src={OCEAN_VIDEO} type="video/mp4" />
            </video>
            {/* Dark overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,6,8,0.6), rgba(6,6,8,0.75))', pointerEvents: 'none' }} />
            {/* Grid lines */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />

            <div className="font-mono fade-up" style={{ position: 'relative', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--purple-bright)', marginBottom: '2rem', opacity: 0.85 }}>
              CINEMA INTELLIGENCE PLATFORM v2.0
            </div>

            <h1 className="font-display animate-flicker" style={{ position: 'relative', fontSize: 'clamp(5rem,16vw,13rem)', lineHeight: 0.85, letterSpacing: '-0.02em', color: 'white', marginBottom: '1rem', textShadow: '0 0 80px rgba(139,92,246,0.5)' }}>
              MANDA<br />STRONG<br />STUDIO
            </h1>

            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.6),transparent)', margin: '2rem 0' }} />

            <p className="font-mono fade-up" style={{ position: 'relative', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--silver)', marginBottom: '0.75rem' }}>
              600+ AI TOOLS &nbsp;•&nbsp; 8K EXPORT &nbsp;•&nbsp; UNLIMITED CREATIVITY
            </p>
            <p style={{ position: 'relative', fontSize: '1.1rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--text-dim)', marginBottom: '3rem' }}>
              The All-In-One Professional Movie Creation Platform
            </p>

            <div style={{ position: 'relative', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => goTo(2)} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.85rem 2.5rem' }}>
                START CREATING
              </button>
              <button onClick={() => goTo(4)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.85rem 2.5rem' }}>
                LOGIN / REGISTER
              </button>
            </div>

            {/* Corner marker */}
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
              <div className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--text-dim)', textAlign: 'right' }}>
                <div style={{ color: 'var(--purple-bright)', marginBottom: '0.2rem' }}>● SYSTEM ONLINE</div>
                <div>BUILD 2026.03.05</div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2 — ABOUT */}
        {page === 2 && (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem 8rem', position: 'relative', overflow: 'hidden' }}>
            {/* Ocean video background */}
            <video ref={oceanRef} autoPlay loop muted playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, pointerEvents: 'none' }}>
              <source src={OCEAN_VIDEO} type="video/mp4" />
            </video>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,6,8,0.7), rgba(6,6,8,0.85))', pointerEvents: 'none' }} />
            <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }}>
              <div className="font-mono fade-up" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '1.5rem' }}>ABOUT THE PLATFORM</div>
              <h1 className="font-display fade-up" style={{ fontSize: 'clamp(3rem,10vw,8rem)', lineHeight: 0.85, marginBottom: '3rem' }}>
                MAKE AWESOME<br /><span style={{ color: 'var(--purple-bright)' }}>FAMILY MOVIES</span><br />OR TURN YOUR<br />DREAMS INTO REALITY
              </h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1px', background: 'var(--border)', marginTop: '3rem' }}>
                {[
                  { icon: Zap, label: '600+', sub: 'AI Tools Across 6 Categories' },
                  { icon: Monitor, label: '8K', sub: 'Maximum Export Quality' },
                  { icon: Clock, label: '3 Hours', sub: 'Maximum Movie Duration' },
                  { icon: HardDrive, label: '1TB', sub: 'Storage on Studio Plan' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <Icon size={24} style={{ color: 'var(--purple-bright)', marginBottom: '1rem' }} />
                    <div className="font-display" style={{ fontSize: '2.5rem', color: 'white', lineHeight: 1 }}>{label}</div>
                    <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--text-dim)', marginTop: '0.5rem' }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3 — EXAMPLES */}
        {page === 3 && (
          <div style={{ minHeight: '100vh', padding: '5rem 2rem 8rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Hidden file inputs — admin only */}
            <input ref={exRef0} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (!f) return; const u = URL.createObjectURL(f); setExVideos(prev => prev.map((v,i) => i===0 ? {...v, url:u, name:f.name} : v)); }} />
            <input ref={exRef1} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (!f) return; const u = URL.createObjectURL(f); setExVideos(prev => prev.map((v,i) => i===1 ? {...v, url:u, name:f.name} : v)); }} />
            <input ref={exRef2} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (!f) return; const u = URL.createObjectURL(f); setExVideos(prev => prev.map((v,i) => i===2 ? {...v, url:u, name:f.name} : v)); }} />

            {/* Admin login modal */}
            {exShowLogin && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="panel" style={{ maxWidth: '380px', width: '100%', padding: '2.5rem', border: '1px solid rgba(139,92,246,0.4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <Shield size={18} style={{ color: 'var(--purple-bright)' }} />
                    <div>
                      <div className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>RESTRICTED ACCESS</div>
                      <div className="font-display" style={{ fontSize: '1.5rem' }}>ADMIN LOGIN</div>
                    </div>
                    <button onClick={() => { setExShowLogin(false); setExError(''); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                  <input type="email" value={exEmail} onChange={e => setExEmail(e.target.value)} placeholder="Admin email" style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 1rem', fontFamily: 'DM Mono', fontSize: '0.7rem', marginBottom: '0.75rem', outline: 'none' }} />
                  <input type="password" value={exPassword} onChange={e => setExPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { if (exEmail === 'amanda@mandastrong.com' && exPassword === 'MandaStrong2026!') { setExIsAdmin(true); setExShowLogin(false); setExError(''); setExEmail(''); setExPassword(''); addToast('Admin access granted', 'success'); } else { setExError('Invalid credentials'); } } }} placeholder="Admin password" style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 1rem', fontFamily: 'DM Mono', fontSize: '0.7rem', marginBottom: '0.5rem', outline: 'none' }} />
                  {exError && <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--red)', marginBottom: '0.5rem' }}>✕ {exError}</div>}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                    <button onClick={() => { setExShowLogin(false); setExError(''); }} className="btn-secondary" style={{ flex: 1 }}>CANCEL</button>
                    <button onClick={() => { if (exEmail === 'amanda@mandastrong.com' && exPassword === 'MandaStrong2026!') { setExIsAdmin(true); setExShowLogin(false); setExError(''); setExEmail(''); setExPassword(''); addToast('Admin access granted', 'success'); } else { setExError('Invalid credentials'); } }} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Lock size={12} /> ENTER ADMIN
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <div className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.4em', color: 'var(--purple-bright)', marginBottom: '0.5rem' }}>SHOWCASE</div>
                <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,7rem)', lineHeight: 0.85 }}>EXAMPLES MADE BY<br /><span style={{ color: 'var(--purple-bright)' }}>MANDASTRONG STUDIO</span></h1>
              </div>
              {exIsAdmin ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'DM Mono', fontSize: '0.6rem', color: 'var(--purple-bright)', letterSpacing: '0.1em' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--purple-bright)' }} className="animate-pulse" /> ADMIN ACTIVE
                  <button onClick={() => setExIsAdmin(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginLeft: '0.25rem' }}><X size={12} /></button>
                </div>
              ) : (
                <button onClick={() => setExShowLogin(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.6rem' }}>
                  <Lock size={10} /> ADMIN
                </button>
              )}
            </div>

            <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.3),transparent)', marginBottom: '2rem' }} />

            {/* TOP ROW — 2 viewers side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.04)', marginBottom: '1px' }}>
              {[0, 1].map(i => (
                <div key={i} style={{ position: 'relative', aspectRatio: '16/9', background: '#000', border: `1px solid ${exActiveVideo === i ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.06)'}`, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }} onClick={() => setExActiveVideo(exActiveVideo === i ? null : i)}>
                  <div className="font-mono" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '0.2rem 0.6rem', fontSize: '0.55rem', letterSpacing: '0.2em', color: exActiveVideo === i ? 'var(--purple-bright)' : 'rgba(255,255,255,0.4)' }}>
                    VIEWER {String(i+1).padStart(2,'0')} — {exVideos[i].title.toUpperCase()}
                  </div>
                  {exVideos[i].url ? (
                    <>
                      <video src={exVideos[i].url!} controls={exActiveVideo === i} autoPlay={exActiveVideo === i} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {exIsAdmin && <button onClick={e => { e.stopPropagation(); exRefs[i].current?.click(); }} className="btn-primary" style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', zIndex: 20, padding: '0.2rem 0.6rem', fontSize: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Upload size={10} /> REPLACE</button>}
                    </>
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'linear-gradient(135deg,rgba(107,33,168,0.05),#000)' }}>
                      <Film size={28} style={{ color: 'rgba(139,92,246,0.25)' }} />
                      <div className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)' }}>COMING SOON</div>
                      {exIsAdmin && <button onClick={e => { e.stopPropagation(); exRefs[i].current?.click(); }} className="btn-primary" style={{ fontSize: '0.6rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Upload size={10} /> UPLOAD</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* BOTTOM ROW — 1 full-width viewer */}
            <div style={{ position: 'relative', height: '480px', background: '#000', border: `1px solid ${exActiveVideo === 2 ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.06)'}`, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s', marginBottom: '2rem' }} onClick={() => setExActiveVideo(exActiveVideo === 2 ? null : 2)}>
              <div className="font-mono" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '0.2rem 0.6rem', fontSize: '0.55rem', letterSpacing: '0.2em', color: exActiveVideo === 2 ? 'var(--purple-bright)' : 'rgba(255,255,255,0.4)' }}>
                VIEWER 03 — FEATURE SHOWCASE — {exVideos[2].title.toUpperCase()}
              </div>
              {exVideos[2].url ? (
                <>
                  <video src={exVideos[2].url!} controls={exActiveVideo === 2} autoPlay={exActiveVideo === 2} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {exIsAdmin && <button onClick={e => { e.stopPropagation(); exRefs[2].current?.click(); }} className="btn-primary" style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', zIndex: 20, padding: '0.3rem 0.75rem', fontSize: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Upload size={10} /> REPLACE FEATURE</button>}
                </>
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'linear-gradient(135deg,rgba(107,33,168,0.05),#000)', backgroundImage: 'linear-gradient(rgba(139,92,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px' }}>
                  <Film size={48} style={{ color: 'rgba(139,92,246,0.2)' }} />
                  <div className="font-display" style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.08)', letterSpacing: '0.1em' }}>FEATURE SHOWCASE</div>
                  {exIsAdmin ? <button onClick={e => { e.stopPropagation(); exRefs[2].current?.click(); }} className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.6rem 2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Upload size={14} /> UPLOAD FEATURE FILM</button> : <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Eye size={12} /> EXAMPLE FILM COMING SOON</div>}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="panel" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>READY TO CREATE YOUR OWN?</div>
                <div className="font-display" style={{ fontSize: '1.5rem' }}>START WITH 600+ AI TOOLS TODAY</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => goTo(4)} className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>LOGIN / REGISTER</button>
                <button onClick={() => goTo(5)} className="btn-secondary" style={{ padding: '0.65rem 1.5rem' }}>BROWSE TOOLS →</button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 4 — ACCESS / LOGIN / PRICING */}
        {page === 4 && (
          <div style={{ minHeight: '100vh', padding: '5rem 1.5rem 8rem', maxWidth: '1100px', margin: '0 auto' }}>
            <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '1rem' }}>ACCESS PORTAL</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,6rem)', marginBottom: '3rem' }}>LOGIN & SUBSCRIBE</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1px', background: 'var(--border)', marginBottom: '4rem' }}>
              {/* Login */}
              <div className="panel" style={{ padding: '2rem' }}>
                <div className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>EXISTING USER</div>
                <h3 className="font-display" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>LOGIN</h3>
                <input type="email" placeholder="your@email.com" style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 1rem', fontFamily: 'DM Mono', fontSize: '0.75rem', marginBottom: '0.75rem', outline: 'none' }} />
                <input type="password" placeholder="••••••••" style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 1rem', fontFamily: 'DM Mono', fontSize: '0.75rem', marginBottom: '1.5rem', outline: 'none' }} />
                <button onClick={() => { addToast('Welcome back!', 'success'); setTimeout(() => goTo(5), 800); }} className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                  LOGIN & ENTER
                </button>
              </div>

              {/* Register */}
              <div className="panel" style={{ padding: '2rem' }}>
                <div className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>NEW USER</div>
                <h3 className="font-display" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>REGISTER</h3>
                <input type="text" placeholder="Director Name" style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 1rem', fontFamily: 'DM Mono', fontSize: '0.75rem', marginBottom: '0.75rem', outline: 'none' }} />
                <input type="email" placeholder="your@email.com" style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 1rem', fontFamily: 'DM Mono', fontSize: '0.75rem', marginBottom: '1.5rem', outline: 'none' }} />
                <button onClick={() => { addToast('Account created! Welcome.', 'success'); setTimeout(() => goTo(5), 800); }} className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                  CREATE ACCOUNT
                </button>
              </div>

              {/* Guest */}
              <div className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <Eye size={32} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
                <div className="font-display" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>BROWSE FIRST</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem', fontStyle: 'italic' }}>Explore all 600+ tools before subscribing</p>
                <button onClick={() => goTo(5)} className="btn-secondary" style={{ width: '100%', padding: '0.85rem' }}>
                  EXPLORE AS GUEST
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>SUBSCRIPTION PLANS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1px', background: 'var(--border)' }}>
              {PLANS.map(plan => (
                <div key={plan.name} className="panel" style={{ padding: '2rem', position: 'relative', borderTop: plan.popular ? '2px solid var(--purple-bright)' : '2px solid transparent' }}>
                  {plan.popular && <div className="font-mono" style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--purple)', padding: '0.15rem 0.75rem', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'white', whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                  <div className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>{plan.name.toUpperCase()} TIER</div>
                  <div className="font-display" style={{ fontSize: '3rem', lineHeight: 1 }}>${plan.price}<span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/mo</span></div>
                  <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        <CheckCircle size={12} style={{ color: 'var(--purple-bright)', flexShrink: 0 }} /> {f}
                      </div>
                    ))}
                  </div>
                  <a href={plan.stripe} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.85rem' }}>
                    SUBSCRIBE NOW
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGES 5–10 — AI TOOL BOARDS */}
        {page >= 5 && page <= 10 && (() => {
          const cat = toolCategories[page - 5];
          const allTools = AI_TOOLS[cat] || [];
          const filtered = toolSearch.trim() ? allTools.filter(t => t.toLowerCase().includes(toolSearch.toLowerCase())) : allTools;
          const catIcons: Record<string, any> = { Writing: BookOpen, Voice: Mic, Image: Camera, Video: Film, Motion: Activity, Enhancement: Sparkles };
          const CatIcon = catIcons[cat] || Zap;
          return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '4rem', paddingBottom: '6rem' }}>
              {/* Header */}
              <div className="panel" style={{ padding: '1.5rem 2rem', borderLeft: 0, borderRight: 0, borderTop: 0, marginBottom: '1px', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CatIcon size={20} style={{ color: 'var(--purple-bright)' }} />
                  <div>
                    <div className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.3em', color: 'var(--text-dim)' }}>AI WORKSTATION 0{page - 3}</div>
                    <div className="font-display" style={{ fontSize: '1.8rem', lineHeight: 1 }}>{cat.toUpperCase()} TOOLS</div>
                  </div>
                </div>

                {/* Category tabs */}
                <div style={{ display: 'flex', gap: '1px', background: 'var(--border)', marginLeft: 'auto', flexWrap: 'wrap' }}>
                  {toolCategories.map((c, i) => (
                    <button key={c} onClick={() => goTo(5 + i)}
                      className="font-mono"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.6rem', letterSpacing: '0.1em', background: c === cat ? 'var(--purple)' : 'var(--panel)', color: c === cat ? 'white' : 'var(--text-dim)', border: 'none', cursor: 'pointer' }}>
                      {c.slice(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <Search size={12} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="text" value={toolSearch} onChange={e => setToolSearch(e.target.value)}
                    placeholder={`Search ${filtered.length} tools...`}
                    className="font-mono"
                    style={{ background: 'var(--deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.4rem 0.5rem 0.4rem 2rem', fontSize: '0.65rem', width: '200px', outline: 'none' }} />
                </div>

                <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--purple-bright)' }}>{filtered.length} TOOLS</div>
              </div>

              {/* Tools grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1px', background: 'var(--border)', alignContent: 'start' }}>
                {filtered.map((tool, i) => (
                  <button key={i} onClick={() => setSelectedTool(tool)} className="tool-card" style={{ minHeight: '70px' }}>
                    <div className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>TOOL {String(i + 1).padStart(3, '0')}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{tool}</div>
                  </button>
                ))}
              </div>

              {/* Tool Modal */}
              {selectedTool && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                  <div className="panel" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div>
                        <div className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--purple-bright)', marginBottom: '0.25rem' }}>{cat.toUpperCase()} TOOL</div>
                        <h2 className="font-display" style={{ fontSize: '2rem' }}>{selectedTool}</h2>
                      </div>
                      <button onClick={() => { setSelectedTool(null); setAiPrompt(''); }} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '0.3rem', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>

                    {/* Upload */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>UPLOAD SOURCE MEDIA</div>
                      <button onClick={() => fileInputRef.current?.click()}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(139,92,246,0.3)', color: 'var(--text-dim)', padding: '1rem', cursor: 'pointer', fontFamily: 'DM Mono', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                        + BROWSE FILES
                      </button>
                    </div>

                    {/* Prompt */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>AI GENERATION PROMPT</div>
                      <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                        placeholder={`Describe what you want to generate with ${selectedTool}...`}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 1rem', fontFamily: 'Barlow', fontSize: '0.85rem', height: '100px', resize: 'none', outline: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setSelectedTool(null); setAiPrompt(''); }} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>CANCEL</button>
                      <button onClick={handleAIGenerate} disabled={!aiPrompt.trim() || generating} className="btn-primary" style={{ flex: 2, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (!aiPrompt.trim() || generating) ? 0.4 : 1 }}>
                        {generating ? <><Loader size={14} className="animate-spin" /> GENERATING...</> : <><Zap size={14} /> GENERATE & SAVE</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* PAGE 11 — UPLOAD MEDIA */}
        {page === 11 && (
          <div style={{ minHeight: '100vh', padding: '5rem 2rem 8rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '0.75rem' }}>ASSET INGESTION</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,6rem)', marginBottom: '0.5rem' }}>UPLOAD MEDIA</h1>
            <p className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '3rem', letterSpacing: '0.1em' }}>{mediaLibrary.length} ASSETS IN LIBRARY</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1px', background: 'var(--border)', marginBottom: '3rem' }}>
              {[
                { icon: Upload, label: 'BROWSE FILES', sub: 'Video • Audio • Images', action: () => fileInputRef.current?.click(), color: 'var(--purple-bright)' },
                { icon: FileVideo, label: 'RECORD SCREEN', sub: 'Capture your desktop', action: () => addToast('Screen recorder — use your OS tool', 'info'), color: 'var(--silver)' },
                { icon: Globe, label: 'IMPORT URL', sub: 'YouTube • Vimeo • Direct', action: () => addToast('Paste URL in AI Tool panel', 'info'), color: 'var(--silver)' },
              ].map(({ icon: Icon, label, sub, action, color }) => (
                <div key={label} onClick={action}
                  style={{ padding: '2.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--panel)', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,33,168,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--panel)')}>
                  <Icon size={32} style={{ color, marginBottom: '1rem' }} />
                  <div className="font-mono" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--text)', marginBottom: '0.3rem' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>UPLOADING...</span>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--purple-bright)' }}>{uploadProgress}%</span>
                </div>
                <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', background: 'var(--purple-mid)', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {/* Media library */}
            {mediaLibrary.length > 0 && (
              <div>
                <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: '1rem' }}>MEDIA LIBRARY</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                  {mediaLibrary.map(asset => (
                    <div key={asset.id} className="panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <FileVideo size={14} style={{ color: 'var(--purple-bright)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</div>
                        <div className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>{asset.type.toUpperCase()} • {asset.size}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => {
                          setTimeline(prev => ({ ...prev, video: [...prev.video, asset] }));
                          addToast('Added to timeline', 'success');
                        }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.55rem' }}>+ TIMELINE</button>
                        <button onClick={() => setMediaLibrary(prev => prev.filter(a => a.id !== asset.id))}
                          style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '0.2rem 0.4rem', cursor: 'pointer' }}>
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAGE 12 — EDITOR SUITE */}
        {page === 12 && (
          <div style={{ minHeight: '100vh', padding: '5rem 2rem 8rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '0.75rem' }}>PRODUCTION HUB</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,6rem)', marginBottom: '3rem' }}>EDITOR SUITE</h1>

            {/* Duration */}
            <div className="panel" style={{ padding: '2rem', marginBottom: '1px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>MOVIE DURATION</div>
                <div className="font-display" style={{ fontSize: '3rem', color: 'var(--purple-bright)', lineHeight: 1 }}>{duration} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>MIN</span></div>
              </div>
              <input type="range" min="0" max="180" value={duration} onChange={e => setDuration(Number(e.target.value))} style={{ width: '100%', marginBottom: '0.75rem' }} />
              <div style={{ display: 'flex', gap: '1px', background: 'var(--border)' }}>
                {[30, 60, 90, 120, 180].map(m => (
                  <button key={m} onClick={() => setDuration(m)} className="font-mono"
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.6rem', background: duration === m ? 'var(--purple)' : 'var(--deep)', color: duration === m ? 'white' : 'var(--text-dim)', border: 'none', cursor: 'pointer' }}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Suite links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1px', background: 'var(--border)' }}>
              {[
                { icon: Database, label: 'MEDIA LIBRARY', sub: `${mediaLibrary.length} assets`, p: 11 },
                { icon: Layers, label: 'TIMELINE EDITOR', sub: 'Multi-track editing', p: 13 },
                { icon: Wand2, label: 'ENHANCEMENT STUDIO', sub: '60+ tools', p: 14 },
                { icon: Volume2, label: 'AUDIO MIXER', sub: '4-channel mixing', p: 15 },
                { icon: Zap, label: 'RENDER ENGINE', sub: 'Up to 8K output', p: 16 },
                { icon: Eye, label: 'PREVIEW PLAYER', sub: 'Full-screen playback', p: 17 },
              ].map(({ icon: Icon, label, sub, p }) => (
                <button key={label} onClick={() => goTo(p)} className="panel"
                  style={{ padding: '1.5rem', textAlign: 'left', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--panel)', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <Icon size={20} style={{ color: 'var(--purple-bright)', marginBottom: '0.75rem' }} />
                  <div className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--text)', marginBottom: '0.2rem' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 13 — TIMELINE */}
        {page === 13 && (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '4rem', paddingBottom: '5rem' }}>
            <div className="panel" style={{ padding: '1rem 1.5rem', borderLeft: 0, borderRight: 0, borderTop: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="font-display" style={{ fontSize: '1.5rem' }}>TIMELINE EDITOR</div>
              <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>{duration} MIN PROJECT</div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Media panel */}
              <div className="panel" style={{ width: '200px', flexShrink: 0, overflowY: 'auto', borderTop: 0, borderBottom: 0, padding: '1rem' }}>
                <div className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>MEDIA POOL</div>
                {mediaLibrary.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>No media</div>
                    <button onClick={() => goTo(11)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.55rem' }}>UPLOAD</button>
                  </div>
                ) : mediaLibrary.map(asset => (
                  <div key={asset.id} draggable onDragStart={() => setDraggedItem(asset)}
                    style={{ padding: '0.5rem', marginBottom: '1px', background: 'var(--deep)', border: '1px solid var(--border)', cursor: 'grab', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileVideo size={10} style={{ color: 'var(--purple-bright)', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.6rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</div>
                  </div>
                ))}
              </div>

              {/* Timeline tracks */}
              <div style={{ flex: 1, overflowX: 'auto', padding: '1rem' }}>
                {(['video', 'audio', 'text'] as const).map(track => (
                  <div key={track} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="font-mono" style={{ width: '50px', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--text-dim)', flexShrink: 0 }}>{track.toUpperCase()}</div>
                    <div className="track-bar" style={{ flex: 1 }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => {
                        if (draggedItem) {
                          setTimeline(prev => ({ ...prev, [track]: [...prev[track], { ...draggedItem }] }));
                          setDraggedItem(null);
                          addToast(`Added to ${track} track`, 'success');
                        }
                      }}>
                      {timeline[track].map((clip, i) => (
                        <div key={i} className="timeline-clip"
                          style={{ left: `${i * 12}%`, width: '100px', background: track === 'video' ? 'rgba(107,33,168,0.6)' : track === 'audio' ? 'rgba(16,185,129,0.6)' : 'rgba(245,158,11,0.6)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                          {clip.name.slice(0, 12)}
                        </div>
                      ))}
                      {timeline[track].length === 0 && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="font-mono" style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.1)', letterSpacing: '0.2em' }}>DROP CLIPS HERE</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: '2rem' }}>
                  <button onClick={() => goTo(16)} className="btn-primary" style={{ marginRight: '0.5rem' }}>
                    → RENDER
                  </button>
                  <button onClick={() => { setTimeline({ video: [], audio: [], text: [] }); addToast('Timeline cleared', 'warning'); }} className="btn-secondary">
                    CLEAR ALL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 14 — ENHANCEMENT STUDIO */}
        {page === 14 && (
          <div style={{ minHeight: '100vh', padding: '5rem 2rem 8rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '0.75rem' }}>NEURAL OPTIMIZATION</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,6rem)', marginBottom: '0.5rem' }}>ENHANCEMENT STUDIO</h1>
            <p className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '2.5rem', letterSpacing: '0.1em' }}>{AI_TOOLS.Enhancement.length} PROFESSIONAL TOOLS</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '1px', background: 'var(--border)', marginBottom: '2rem' }}>
              {AI_TOOLS.Enhancement.map((tool, i) => (
                <button key={i} onClick={() => setSelectedEnhancement(tool)} className="tool-card" style={{ minHeight: '60px' }}>
                  <Wand2 size={10} style={{ color: 'var(--purple-bright)', marginBottom: '0.3rem' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text)', lineHeight: 1.2 }}>{tool}</div>
                </button>
              ))}
            </div>

            {selectedEnhancement && (
              <div className="panel panel-active" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div className="font-display" style={{ fontSize: '1.5rem', color: 'var(--purple-bright)' }}>{selectedEnhancement}</div>
                  <button onClick={() => setSelectedEnhancement(null)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
                {Object.entries(enhancementSettings).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{key}</span>
                      <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--purple-bright)' }}>{value}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={value}
                      onChange={e => setEnhancementSettings(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      style={{ width: '100%' }} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button onClick={() => { addToast(`Applying ${selectedEnhancement}...`, 'info'); setTimeout(() => { setSelectedEnhancement(null); addToast('Enhancement applied!', 'success'); }, 2000); }}
                    className="btn-primary" style={{ flex: 2, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={14} /> APPLY ENHANCEMENT
                  </button>
                  <button onClick={() => setEnhancementSettings({ intensity: 75, clarity: 80, color: 70, brightness: 65 })} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>RESET</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAGE 15 — AUDIO MIXER */}
        {page === 15 && (
          <div style={{ minHeight: '100vh', padding: '5rem 2rem 8rem', maxWidth: '900px', margin: '0 auto' }}>
            <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '0.75rem' }}>MIXING CONSOLE</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,6rem)', marginBottom: '3rem' }}>AUDIO MIXER</h1>

            <div className="panel" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }}>
                {[
                  { key: 'music', label: 'MUSIC', color: '#8B5CF6' },
                  { key: 'voice', label: 'VOICE', color: '#A78BFA' },
                  { key: 'sfx', label: 'SFX', color: '#F59E0B' },
                  { key: 'master', label: 'MASTER', color: '#EF4444' },
                ].map(ch => (
                  <div key={ch.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--text-dim)' }}>{ch.label}</div>
                    {/* VU Meter */}
                    <div style={{ width: '24px', height: '140px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', background: `linear-gradient(to top, ${ch.color}, ${ch.color}aa)`, height: `${audioLevels[ch.key as keyof typeof audioLevels]}%`, transition: 'height 0.1s' }} />
                    </div>
                    <input type="range" min="0" max="100" value={audioLevels[ch.key as keyof typeof audioLevels]}
                      onChange={e => setAudioLevels(prev => ({ ...prev, [ch.key]: Number(e.target.value) }))}
                      style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '30px', height: '120px', cursor: 'pointer' }} />
                    <div className="font-display" style={{ fontSize: '1.5rem', color: ch.color }}>{audioLevels[ch.key as keyof typeof audioLevels]}</div>
                    <div className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>%</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <button onClick={() => { setAudioLevels({ music: 75, voice: 60, sfx: 50, master: 85 }); addToast('Levels reset', 'info'); }} className="btn-secondary" style={{ flex: 1, padding: '0.65rem' }}>RESET LEVELS</button>
                <button onClick={() => addToast('Audio preset saved!', 'success')} className="btn-primary" style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Save size={12} /> SAVE PRESET
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 16 — RENDER */}
        {page === 16 && (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem' }}>
            <div style={{ maxWidth: '700px', width: '100%' }}>
              <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '0.75rem' }}>FINAL OUTPUT</div>
              <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,6rem)', marginBottom: '2rem' }}>RENDER FILM</h1>

              <div className="panel" style={{ padding: '2.5rem', marginBottom: '1px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>EXPORT QUALITY</div>
                    <select value={exportSettings.quality} onChange={e => setExportSettings(p => ({ ...p, quality: e.target.value }))}
                      style={{ width: '100%', background: 'var(--deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.6rem 0.75rem', fontFamily: 'DM Mono', fontSize: '0.7rem', outline: 'none' }}>
                      <option value="8K">8K — 4320p</option>
                      <option value="4K">4K — 2160p</option>
                      <option value="1080p">HD — 1080p</option>
                      <option value="720p">SD — 720p</option>
                    </select>
                  </div>
                  <div>
                    <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>FORMAT</div>
                    <select value={exportSettings.format} onChange={e => setExportSettings(p => ({ ...p, format: e.target.value }))}
                      style={{ width: '100%', background: 'var(--deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.6rem 0.75rem', fontFamily: 'DM Mono', fontSize: '0.7rem', outline: 'none' }}>
                      <option>MP4</option><option>MOV</option><option>AVI</option><option>WebM</option>
                    </select>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)', marginBottom: '2rem' }}>
                  {[
                    { label: 'DURATION', value: `${duration} MIN` },
                    { label: 'VIDEO CLIPS', value: timeline.video.length },
                    { label: 'AUDIO TRACKS', value: timeline.audio.length },
                  ].map(({ label, value }) => (
                    <div key={label} className="panel" style={{ padding: '1rem', textAlign: 'center' }}>
                      <div className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>{label}</div>
                      <div className="font-display" style={{ fontSize: '1.8rem', color: 'var(--purple-bright)' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {rendering ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>RENDERING {exportSettings.quality} {exportSettings.format}...</span>
                      <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--purple-bright)' }}>{renderProgress}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--purple),var(--purple-bright))', width: `${renderProgress}%`, transition: 'width 0.3s', boxShadow: '0 0 10px var(--purple)' }} />
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center' }}>Processing {duration} minutes of cinema...</div>
                  </div>
                ) : (
                  <button onClick={handleRender} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Zap size={16} /> START RENDER — {exportSettings.quality} {exportSettings.format}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAGE 17 — PREVIEW */}
        {page === 17 && (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '4rem', paddingBottom: '5rem' }}>
            <div className="panel" style={{ padding: '1rem 1.5rem', borderLeft: 0, borderRight: 0, borderTop: 0, display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="font-display" style={{ fontSize: '1.5rem' }}>PREVIEW PLAYER</div>
              {currentVideo && <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--purple-bright)' }}>● {currentVideo.name}</div>}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative' }}>
              {currentVideo ? (
                <video controls style={{ maxWidth: '100%', maxHeight: '100%' }} src={currentVideo.url} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Play size={48} style={{ color: 'rgba(139,92,246,0.3)', marginBottom: '1rem' }} />
                  <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>NO RENDER AVAILABLE</div>
                  <button onClick={() => goTo(16)} className="btn-primary" style={{ marginTop: '1.5rem' }}>GO TO RENDER</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAGE 18 — EXPORT */}
        {page === 18 && (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem' }}>
            <div style={{ maxWidth: '700px', width: '100%' }}>
              <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '0.75rem' }}>DISTRIBUTION</div>
              <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,6rem)', marginBottom: '2rem' }}>EXPORT</h1>

              {currentVideo ? (
                <div className="panel" style={{ padding: '2rem', marginBottom: '1rem', borderColor: 'rgba(16,185,129,0.3)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <CheckCircle size={24} style={{ color: 'var(--purple-bright)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{currentVideo.name}</div>
                      <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{currentVideo.size} • {exportSettings.quality} • {exportSettings.format} • READY</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="panel" style={{ padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>No render ready — <button onClick={() => goTo(16)} style={{ background: 'none', border: 'none', color: 'var(--purple-bright)', cursor: 'pointer', fontFamily: 'DM Mono', fontSize: '0.65rem' }}>go render first</button></div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                {[
                  { icon: Download, label: 'DOWNLOAD TO DEVICE', color: 'var(--purple)', action: () => { if (currentVideo) { const a = document.createElement('a'); a.href = currentVideo.url; a.download = currentVideo.name; a.click(); } else addToast('No render available', 'error'); } },
                  { icon: Save, label: 'SAVE TO CLOUD', color: '#A78BFA', action: () => addToast('Saving to cloud storage...', 'info') },
                  { icon: Share2, label: 'SHARE TO COMMUNITY HUB', color: '#3B82F6', action: () => { addToast('Shared to Community!', 'success'); setTimeout(() => goTo(22), 800); } },
                ].map(({ icon: Icon, label, color, action }) => (
                  <button key={label} onClick={action}
                    className="panel"
                    style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--panel)', transition: 'all 0.15s', opacity: currentVideo ? 1 : 0.4 }}>
                    <Icon size={18} style={{ color }} />
                    <span className="font-mono" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>{label}</span>
                    <ChevronRight size={14} style={{ color: 'var(--text-dim)', marginLeft: 'auto' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGE 19 — TUTORIALS */}
        {page === 19 && (
          <div style={{ minHeight: '100vh', padding: '5rem 2rem 8rem', maxWidth: '900px', margin: '0 auto' }}>
            <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '0.75rem' }}>LEARNING CENTER</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,6rem)', marginBottom: '3rem' }}>TUTORIALS</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
              {[
                { title: 'Getting Started — Platform Overview', time: '5:30', level: 'BEGINNER', p: '01' },
                { title: 'Importing & Managing Media Assets', time: '8:15', level: 'BEGINNER', p: '02' },
                { title: 'Multi-Track Timeline Editing', time: '12:45', level: 'INTERMEDIATE', p: '03' },
                { title: 'AI Tool Board — 600+ Tools Explained', time: '18:20', level: 'INTERMEDIATE', p: '04' },
                { title: 'Professional Color Grading with AI', time: '22:00', level: 'ADVANCED', p: '05' },
                { title: 'Audio Mixing & Enhancement', time: '15:10', level: 'INTERMEDIATE', p: '06' },
                { title: 'Enhancement Studio Deep Dive', time: '20:30', level: 'ADVANCED', p: '07' },
                { title: 'Render Settings & Export Optimization', time: '8:15', level: 'BEGINNER', p: '08' },
              ].map((tut, i) => (
                <button key={i} onClick={() => addToast(`Playing: ${tut.title}`, 'info')}
                  className="panel"
                  style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--panel)', textAlign: 'left', transition: 'all 0.15s' }}>
                  <Play size={16} style={{ color: 'var(--purple-bright)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{tut.title}</div>
                    <div className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>TUTORIAL {tut.p} &nbsp;•&nbsp; {tut.time}</div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.55rem', padding: '0.2rem 0.5rem', background: tut.level === 'ADVANCED' ? 'rgba(239,68,68,0.15)' : tut.level === 'INTERMEDIATE' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: tut.level === 'ADVANCED' ? '#EF4444' : tut.level === 'INTERMEDIATE' ? '#F59E0B' : '#A78BFA', letterSpacing: '0.1em' }}>{tut.level}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 20 — TERMS */}
        {page === 20 && (
          <div style={{ minHeight: '100vh', padding: '5rem 2rem 8rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '0.75rem' }}>LEGAL</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,5rem)', marginBottom: '0.5rem' }}>TERMS OF SERVICE</h1>
            <p className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '3rem' }}>LAST UPDATED: FEBRUARY 2026</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', marginBottom: '2rem' }}>
              {[
                { t: 'Acceptance of Terms', b: 'By accessing MandaStrong Studio, you agree to be bound by these Terms of Service. These constitute a legally binding agreement between you and MandaStrong Studio.' },
                { t: 'Service Description', b: 'MandaStrong Studio provides cloud-based AI video editing and content creation tools. The service is provided as-is and we reserve the right to modify any aspect with reasonable notice.' },
                { t: 'User Accounts & Subscriptions', b: 'You are responsible for maintaining confidentiality of your account. Subscriptions bill monthly and auto-renew unless cancelled. Refunds within 30 days of initial purchase only.' },
                { t: 'Intellectual Property & Content Rights', b: 'Studio plan subscribers receive full commercial rights. Basic and Pro plans receive personal use licenses. You retain ownership of content you upload.' },
                { t: 'Acceptable Use Policy', b: 'You agree not to create or distribute content that violates laws, infringes IP rights, contains malicious code, promotes hate speech, or violates rights of minors.' },
                { t: 'Privacy & Data Protection', b: 'We collect and process data per our Privacy Policy and applicable laws. Content is encrypted at rest and in transit. We do not sell personal data.' },
                { t: 'Limitation of Liability', b: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, MANDASTRONG STUDIO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.' },
                { t: 'Social Mission', b: 'MandaStrong Studio supports anti-bullying education and veterans mental health services. A portion of revenue is donated to these causes.' },
                { t: 'Contact & Support', b: 'For questions contact MandaStrong1.Etsy.com or use Agent Grok support (Page 20) available 24/7 within the application.' },
              ].map(s => (
                <div key={s.t} className="panel" style={{ padding: '1.5rem' }}>
                  <div className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--purple-bright)', marginBottom: '0.5rem' }}>{s.t.toUpperCase()}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>{s.b}</p>
                </div>
              ))}
            </div>

            <button onClick={() => { addToast('Terms accepted', 'success'); goTo(5); }} className="btn-primary" style={{ padding: '0.85rem 3rem' }}>
              ACCEPT TERMS & ENTER
            </button>
          </div>
        )}

        {/* PAGE 21 — AGENT GROK */}
        {page === 21 && (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '4rem', paddingBottom: '5rem' }}>
            <div className="panel" style={{ padding: '1rem 1.5rem', borderLeft: 0, borderRight: 0, borderTop: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--purple-bright)' }} className="animate-pulse" />
              <div className="font-display" style={{ fontSize: '1.5rem' }}>AGENT GROK</div>
              <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>24/7 PRODUCTION SUPPORT</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {grokChat.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%', padding: '0.75rem 1rem',
                    background: msg.role === 'user' ? 'var(--purple)' : 'var(--panel)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(139,92,246,0.3)' : 'var(--border)'}`,
                    fontSize: '0.85rem', lineHeight: 1.5
                  }}>
                    {msg.role === 'agent' && <div className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--purple-bright)', marginBottom: '0.3rem', letterSpacing: '0.1em' }}>AGENT GROK</div>}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="panel" style={{ padding: '1rem', borderLeft: 0, borderRight: 0, borderBottom: 0, display: 'flex', gap: '0.5rem' }}>
              <input type="text" value={grokMessage} onChange={e => setGrokMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendGrokMessage()}
                placeholder="Ask anything about MandaStrong Studio..."
                style={{ flex: 1, background: 'var(--deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.6rem 1rem', fontFamily: 'Barlow', fontSize: '0.85rem', outline: 'none' }} />
              <button onClick={sendGrokMessage} className="btn-primary" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Send size={14} /> SEND
              </button>
            </div>
          </div>
        )}

        {/* PAGE 22 — COMMUNITY HUB */}
        {page === 22 && (
          <div style={{ minHeight: '100vh', padding: '5rem 2rem 8rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--purple-bright)', marginBottom: '0.75rem' }}>CREATOR NETWORK</div>
                <h1 className="font-display" style={{ fontSize: 'clamp(3rem,8vw,6rem)' }}>COMMUNITY HUB</h1>
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}>
                <Upload size={14} /> UPLOAD YOUR MOVIE
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1px', background: 'var(--border)' }}>
              {communityPosts.map(post => (
                <div key={post.id} className="panel" style={{ padding: '1.5rem' }}>
                  <div style={{ aspectRatio: '16/9', background: 'var(--deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                    {post.emoji}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{post.title}</div>
                  <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>BY {post.user.toUpperCase()}</div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button onClick={() => addToast('Liked!', 'success')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontFamily: 'DM Mono' }}>
                      <ThumbsUp size={12} style={{ color: '#3B82F6' }} /> {post.likes.toLocaleString()}
                    </button>
                    <button onClick={() => addToast('Loved!', 'success')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontFamily: 'DM Mono' }}>
                      <Heart size={12} style={{ color: '#EF4444' }} /> {post.loves.toLocaleString()}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" value={newComment[post.id] || ''} onChange={e => setNewComment(p => ({ ...p, [post.id]: e.target.value }))}
                      placeholder="Comment..." style={{ flex: 1, background: 'var(--deep)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.4rem 0.6rem', fontSize: '0.75rem', outline: 'none' }} />
                    <button onClick={() => { addToast('Comment posted!', 'success'); setNewComment(p => ({ ...p, [post.id]: '' })); }} className="btn-primary" style={{ padding: '0.4rem 0.75rem' }}>POST</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 23 — THANK YOU */}
        {page === 23 && (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
            <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: 'var(--purple-bright)', marginBottom: '2rem' }}>THAT'S ALL FOLKS</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(4rem,15vw,12rem)', lineHeight: 0.85, marginBottom: '2rem', textShadow: '0 0 80px rgba(139,92,246,0.5)' }}>
              MANDA<br />STRONG<br />STUDIO
            </h1>
            <blockquote style={{ maxWidth: '600px', fontSize: '1.1rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: '3rem' }}>
              "Amanda's thank you to creators now and in the future.<br />Supporting cinematic innovation through our Veteran Fundraiser mission."
            </blockquote>
            <a href="https://MandaStrong1.Etsy.com" target="_blank" rel="noopener noreferrer"
              className="font-display"
              style={{ fontSize: 'clamp(1.5rem,5vw,3.5rem)', color: 'var(--purple-bright)', textDecoration: 'none', borderBottom: '2px solid var(--purple)', paddingBottom: '0.25rem', marginBottom: '3rem', display: 'block', transition: 'all 0.2s' }}>
              MandaStrong1.Etsy.com
            </a>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => goTo(1)} className="btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '0.8rem' }}>← HOME</button>
              <button onClick={() => goTo(5)} className="btn-secondary" style={{ padding: '0.85rem 2.5rem', fontSize: '0.8rem' }}>BACK TO TOOLS</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
