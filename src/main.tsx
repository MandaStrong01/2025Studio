import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// [BOLT DEPLOY FIX] Removed StrictMode to ensure error-free playback
createRoot(document.getElementById('root')!).render(<App />)