import { useState } from "react";
import { Upload, Film, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProject } from "../contexts/ProjectContext";
import EditorNav from "../components/EditorNav";

export default function MediaLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addMediaFiles, currentProject } = useProject();

  const [assets, setAssets] = useState<any[]>([]);
  const [openStudio, setOpenStudio] = useState(false);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState("Full Enhancement");
  const [aiDuration, setAiDuration] = useState(60);

  /* UPLOAD */
  const handleUpload = (files: FileList | null) => {
    if (!files || !user) return;

    const uploaded = Array.from(files).map((file) => ({
      user_id: user.id,
      project_id: currentProject?.id || "default",
      file_name: file.name,
      file_type: file.type.split("/")[0],
      file_url: "",
      file_size: file.size,
      duration: 0,
      metadata: { mime: file.type }
    }));

    setAssets((p) => [...p, ...uploaded]);
    addMediaFiles(uploaded);
  };

  /* AI GENERATE (ONCE) */
  const generateAiAssets = () => {
    if (!aiPrompt.trim() || !user) return;

    const aiAsset = {
      user_id: user.id,
      project_id: currentProject?.id || "default",
      file_name: `AI Generated Movie (${aiMode})`,
      file_type: "ai",
      file_url: "",
      file_size: 0,
      duration: aiDuration,
      metadata: { prompt: aiPrompt, mode: aiMode }
    };

    setAssets((p) => [...p, aiAsset]);
    addMediaFiles([aiAsset]);
    setAiPrompt("");
    setOpenStudio(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <EditorNav />

      {/* HEADER */}
      <h1 className="text-5xl font-black mb-8">MEDIA LIBRARY</h1>

      {/* UPLOAD */}
      <div className="mb-10 border-2 border-dashed border-purple-600 p-10 rounded-xl text-center">
        <Upload className="mx-auto mb-3 text-purple-400" />
        <p className="mb-2">Click to upload or drag & drop</p>
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* ASSETS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {assets.length === 0 && (
          <p className="text-gray-400 col-span-full">No assets yet.</p>
        )}
        {assets.map((a, i) => (
          <div
            key={i}
            className="border border-purple-700/40 p-4 rounded-lg text-sm"
          >
            <Film className="w-4 h-4 text-purple-400 mb-2" />
            {a.file_name}
          </div>
        ))}
      </div>

      {/* OPEN VIDEO STUDIO BUTTON */}
      <button
        onClick={() => setOpenStudio(true)}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl font-black"
      >
        Open Video Studio
      </button>

      {/* MODAL */}
      {openStudio && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
          <div className="max-w-4xl w-full bg-black border border-purple-700 rounded-2xl p-8 max-h-[90vh] overflow-y-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black flex items-center gap-2">
                <Sparkles className="text-purple-400" />
                Open Video Studio
              </h2>
              <button onClick={() => setOpenStudio(false)}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* MODES */}
            <div className="flex gap-3 mb-4 flex-wrap">
              {["Full Enhancement", "Gap Filling", "Duration Extend", "Custom"].map((m) => (
                <button
                  key={m}
                  onClick={() => setAiMode(m)}
                  className={`px-4 py-2 rounded border ${
                    aiMode === m
                      ? "bg-purple-600 border-purple-500"
                      : "border-purple-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* PROMPT */}
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the movie to generate…"
              className="w-full h-32 bg-black border border-purple-700 p-4 mb-4"
            />

            {/* DURATION */}
            <input
              type="range"
              min={1}
              max={180}
              value={aiDuration}
              onChange={(e) => setAiDuration(Number(e.target.value))}
              className="w-full mb-6"
            />

            {/* ACTION */}
            <button
              onClick={generateAiAssets}
              className="px-8 py-4 bg-purple-700 font-black rounded-xl"
            >
              Generate Movie Assets
            </button>
          </div>
        </div>
      )}

      {/* NEXT */}
      <button
        onClick={() => navigate("/timeline")}
        className="mt-10 block px-10 py-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl font-black"
      >
        Next: Timeline
      </button>
    </div>
  );
}
