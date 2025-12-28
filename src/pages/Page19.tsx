import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageCircle, Send, Bot, HelpCircle, Zap } from 'lucide-react';
import { useState } from 'react';

export default function Page19() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'grok',
      text: 'Hello! I\'m Agent Grok, your 24/7 AI assistant for MandaStrong Studio. How can I help you today?',
      time: 'Just now'
    }
  ]);

  const faqQuestions = [
    'How do I export my video?',
    'What video formats are supported?',
    'How do I add text to my video?',
    'Can I use custom fonts?',
    'How do I adjust audio levels?',
    'What are the render quality options?'
  ];

  const sendMessage = () => {
    if (message.trim()) {
      const userMsg = { sender: 'user', text: message, time: 'Just now' };
      setChatMessages([...chatMessages, userMsg]);

      // Simulate AI response
      setTimeout(() => {
        const responses = [
          'Great question! Let me help you with that. In MandaStrong Studio, you can easily accomplish this by navigating to the appropriate section in the editor.',
          'I understand what you\'re looking for. The feature you need is available in the professional editor suite. Would you like me to guide you through the process?',
          'That\'s a common request! Here\'s what you need to do: First, select your clip on the timeline, then use the properties panel to make your adjustments.',
          'Excellent! I can help you with that. MandaStrong Studio offers several options for this. Let me break down the best approach for your needs.'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setChatMessages(prev => [...prev, {
          sender: 'grok',
          text: randomResponse,
          time: 'Just now'
        }]);
      }, 1000);

      setMessage('');
    }
  };

  const handleFaqClick = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4 px-4 py-3 bg-white/5 border border-purple-600/30 rounded-lg">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-8 h-8 text-purple-400" />
            AGENT GROK - 24/7 HELP DESK
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/tos')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate('/community')}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Main Chat Interface */}
          <div className="flex-1 bg-white/5 border border-purple-600/30 rounded-lg flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Agent Grok</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white/90 text-sm">Online & Ready to Help</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm">Instant Responses</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/30">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-end gap-2">
                      {msg.sender === 'grok' && (
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            msg.sender === 'user'
                              ? 'bg-purple-600 text-white rounded-br-none'
                              : 'bg-white text-black rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white/5 border-t border-purple-600/30">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask Agent Grok anything..."
                  className="flex-1 px-4 py-3 bg-black border border-purple-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold transition-all flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - FAQ & Quick Actions */}
          <div className="w-96 space-y-4 overflow-y-auto">
            {/* FAQ Section */}
            <div className="bg-white/5 border border-purple-600/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {faqQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleFaqClick(question)}
                    className="w-full p-3 bg-black/50 hover:bg-purple-600/20 border border-purple-600/20 hover:border-purple-600 rounded-lg text-left text-white text-sm transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Common Topics */}
            <div className="bg-white/5 border border-purple-600/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-purple-400 mb-4">Common Topics</h3>
              <div className="space-y-2">
                <button className="w-full p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-white font-semibold text-sm transition-all">
                  Video Editing Basics
                </button>
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold text-sm transition-all">
                  Audio & Music
                </button>
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold text-sm transition-all">
                  Effects & Transitions
                </button>
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold text-sm transition-all">
                  Export & Rendering
                </button>
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold text-sm transition-all">
                  Troubleshooting
                </button>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 text-center">
              <MessageCircle className="w-12 h-12 text-white mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Need Human Support?</h3>
              <p className="text-white/90 text-sm mb-4">
                Our support team is available 24/7 for complex issues
              </p>
              <button className="w-full px-4 py-2 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all">
                Contact Support Team
              </button>
            </div>

            {/* Status */}
            <div className="bg-white/5 border border-purple-600/30 rounded-lg p-4">
              <h3 className="text-sm font-bold text-purple-400 mb-3">Service Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white">API Services</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Render Queue</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">File Storage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
