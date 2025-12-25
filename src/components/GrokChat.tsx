import { useState } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function GrokChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: 'grok', text: 'Hi! I\'m Agent Grok. How can I assist you today?' }
  ]);

  if (!user) return null;

  const getGrokResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('text to image') || msg.includes('generate image') || msg.includes('create image')) {
      return 'To generate images, go to Tools > Text to Image. Enter a detailed description of what you want to create, and our AI will generate a stunning image in seconds. All generated images are automatically saved to your Media Library.';
    }

    if (msg.includes('text to video') || msg.includes('generate video') || msg.includes('create video')) {
      return 'You can create videos using our Text to Video tool. Simply describe your scene, and our AI will generate a professional video for you. Access it from Tools > Text to Video.';
    }

    if (msg.includes('subscription') || msg.includes('plan') || msg.includes('pricing')) {
      return 'We offer 3 plans: Basic ($10/mo) with 720p export, Pro ($20/mo) with 1080p export and 50GB storage, and Studio ($30/mo) with 4K export and unlimited storage. Upgrade anytime from your Settings page.';
    }

    if (msg.includes('media') || msg.includes('library') || msg.includes('assets')) {
      return 'Your Media Library stores all generated content. Access it by clicking Media in the Quick Access menu or navigating to /media. You can view, download, and manage all your created assets there.';
    }

    if (msg.includes('export') || msg.includes('download') || msg.includes('render')) {
      return 'To export your movie, go to the Export page from the Quick Access menu. Choose your quality settings and export format. Export quality depends on your subscription plan.';
    }

    if (msg.includes('tool') || msg.includes('feature')) {
      return 'MandaStrong Studio includes: Text to Image, Text to Video, Image Editor, Voice Generator, Script Writer, Timeline Editor, and more. Access all tools from the AI Tool Board.';
    }

    if (msg.includes('help') || msg.includes('how') || msg.includes('tutorial')) {
      return 'I can help you with any feature! Try asking about specific tools like "How do I use text to image?" or "What is the timeline editor?" You can also check our Tutorials page for video guides.';
    }

    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
      return 'Hello! I\'m Agent Grok, your AI assistant. I\'m here 24/7 to help you with MandaStrong Studio. What would you like to create today?';
    }

    return `I understand you're asking about "${userMessage}". MandaStrong Studio has powerful AI tools for content creation. Try asking about specific features like text-to-image, video generation, or check the Quick Access menu to explore all available tools!`;
  };

  const sendMessage = () => {
    if (message.trim()) {
      const userMsg = message;
      setMessages([...messages, { sender: 'user', text: userMsg }]);
      setMessage('');

      setTimeout(() => {
        const response = getGrokResponse(userMsg);
        setMessages(prev => [...prev, {
          sender: 'grok',
          text: response
        }]);
      }, 500);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-full flex items-center justify-center shadow-2xl z-50 transition-all transform hover:scale-110"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg px-6 py-3 text-white font-bold shadow-2xl flex items-center gap-2 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          Agent Grok
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-96 bg-black rounded-2xl shadow-2xl border-2 border-purple-600 overflow-hidden z-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-white" />
          <div>
            <h3 className="text-white font-bold">Agent Grok</h3>
            <p className="text-purple-100 text-sm">AI Assistant</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20 p-2 rounded transition-all"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 p-2 rounded transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-3 bg-purple-900/20">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/50 text-white border border-purple-600/30'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-black border-t border-purple-600/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 px-3 py-2 bg-purple-900/30 border border-purple-600/50 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
