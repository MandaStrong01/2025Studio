import { HashRouter, Routes, Route } from "react-router-dom";

/* REAL PAGES */
import Page1 from "./pages/Page1";
import MediaLibrary from "./pages/MediaLibrary";
import Page11 from "./pages/Page11";
/*
  IMPORTANT:
  - HashRouter is REQUIRED for Bolt / StackBlitz deploy
  - No placeholder Page components
  - No fake /page1–/page21 routes
*/

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* ENTRY */}
        <Route path="/" element={<Page1 />} />

        {/* MEDIA LIBRARY (YOUR DESIGN) */}
        <Route path="/media" element={<MediaLibrary />} />

        {/* OPEN VIDEO STUDIO → EDITOR SUITE */}
        <Route path="/editor" element={<Page11 />} />
      </Routes>
    </HashRouter>
  );
}

