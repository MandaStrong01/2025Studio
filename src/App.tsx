import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import SubscriptionGuard from './components/SubscriptionGuard';
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
import VideoManager from './pages/VideoManager';
import VideoStudio from './pages/VideoStudio';

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
          <Route path="/tools" element={<SubscriptionGuard><Page4 /></SubscriptionGuard>} />
          <Route path="/text-to-image" element={<SubscriptionGuard><Page5 /></SubscriptionGuard>} />
          <Route path="/text-to-video" element={<SubscriptionGuard><Page6 /></SubscriptionGuard>} />
          <Route path="/image-editor" element={<SubscriptionGuard><Page7 /></SubscriptionGuard>} />
          <Route path="/voice-generator" element={<SubscriptionGuard><Page8 /></SubscriptionGuard>} />
          <Route path="/script-writer" element={<SubscriptionGuard><Page9 /></SubscriptionGuard>} />
          <Route path="/timeline" element={<SubscriptionGuard><Page10 /></SubscriptionGuard>} />
          <Route path="/media" element={<SubscriptionGuard><Page11 /></SubscriptionGuard>} />
          <Route path="/export" element={<SubscriptionGuard><Page12 /></SubscriptionGuard>} />
          <Route path="/analytics" element={<SubscriptionGuard><Page13 /></SubscriptionGuard>} />
          <Route path="/settings" element={<SubscriptionGuard><Page14 /></SubscriptionGuard>} />
          <Route path="/tutorials" element={<SubscriptionGuard><Page15 /></SubscriptionGuard>} />
          <Route path="/render" element={<SubscriptionGuard><Page16 /></SubscriptionGuard>} />
          <Route path="/marketplace" element={<SubscriptionGuard><Page17 /></SubscriptionGuard>} />
          <Route path="/tos" element={<SubscriptionGuard><Page18 /></SubscriptionGuard>} />
          <Route path="/helpdesk" element={<SubscriptionGuard><Page19 /></SubscriptionGuard>} />
          <Route path="/community" element={<SubscriptionGuard><Page20 /></SubscriptionGuard>} />
          <Route path="/profile" element={<SubscriptionGuard><Page21 /></SubscriptionGuard>} />
          <Route path="/media-library" element={<SubscriptionGuard><MediaLibrary /></SubscriptionGuard>} />
          <Route path="/video-manager" element={<SubscriptionGuard><VideoManager /></SubscriptionGuard>} />
          <Route path="/video-studio" element={<SubscriptionGuard><VideoStudio /></SubscriptionGuard>} />
          <Route path="/tool/:toolName" element={<SubscriptionGuard><ToolWorkspace /></SubscriptionGuard>} />
          <Route path="/pricing" element={<Page21 />} />
        </Routes>
        <GrokChat />
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
