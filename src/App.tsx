import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import GrokChat from './components/GrokChat';
import Page0 from './pages/Page0';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import Page4 from './pages/Page4';
import Page5 from './pages/Page5';
import Page6 from './pages/Page6';
import Page7 from './pages/Page7';
import Page8 from './pages/Page8';
import Page9 from './pages/Page9';
import Page10 from './pages/Page10';
import Page11 from './pages/Page11';
import Page12 from './pages/Page12';
import Page13 from './pages/Page13';
import Page14 from './pages/Page14';
import Page15 from './pages/Page15';
import Page16 from './pages/Page16';
import Page17 from './pages/Page17';
import Page18 from './pages/Page18';
import Page19 from './pages/Page19';
import Page20 from './pages/Page20';
import Page21 from './pages/Page21';
import ToolWorkspace from './pages/ToolWorkspace';
import MediaLibrary from './pages/MediaLibrary';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/splash" replace />} />
          <Route path="/splash" element={<Page0 />} />
          <Route path="/home" element={<Page1 />} />
          <Route path="/intro" element={<Page2 />} />
          <Route path="/auth" element={<Page3 />} />
          <Route path="/tools" element={<Page4 />} />
          <Route path="/text-to-image" element={<Page5 />} />
          <Route path="/text-to-video" element={<Page6 />} />
          <Route path="/image-editor" element={<Page7 />} />
          <Route path="/voice-generator" element={<Page8 />} />
          <Route path="/script-writer" element={<Page9 />} />
          <Route path="/timeline" element={<Page10 />} />
          <Route path="/media" element={<Page11 />} />
          <Route path="/export" element={<Page12 />} />
          <Route path="/analytics" element={<Page13 />} />
          <Route path="/settings" element={<Page14 />} />
          <Route path="/tutorials" element={<Page15 />} />
          <Route path="/community" element={<Page16 />} />
          <Route path="/marketplace" element={<Page17 />} />
          <Route path="/collaboration" element={<Page18 />} />
          <Route path="/templates" element={<Page19 />} />
          <Route path="/support" element={<Page20 />} />
          <Route path="/profile" element={<Page21 />} />
          <Route path="/media-library" element={<MediaLibrary />} />
          <Route path="/tool/:toolName" element={<ToolWorkspace />} />
          <Route path="/pricing" element={<Page21 />} />
        </Routes>
        <GrokChat />
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
