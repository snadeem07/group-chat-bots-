import React, { useState, useRef, useEffect } from 'react';
import { BotId, Message, AppSettings, DEFAULT_SYSTEM_PROMPT } from './types';
import { BOTS } from './constants';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import { generateBotResponse } from './services/geminiService';
import { Send, Paperclip, X, Image as ImageIcon, Bot, Loader2, Sparkles } from 'lucide-react';

// --- Utility: File to Base64 ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g. "data:image/png;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  // --- State ---
  const [activeBots, setActiveBots] = useState<BotId[]>([BotId.GEMINI, BotId.CLAUDE]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Welcome to OmniChat! Select your AI agents and start the discussion. You can upload images and configure specific models in settings.",
      timestamp: Date.now(),
      senderId: BotId.GEMINI, // Initial greeting from Gemini
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<{ file: File; preview: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [processingBots, setProcessingBots] = useState<BotId[]>([]);
  
  // Initialize settings with placeholders
  const [settings, setSettings] = useState<AppSettings>({
    apiKeys: {} as Record<BotId, string>,
    models: Object.keys(BOTS).reduce((acc, key) => ({ ...acc, [key]: BOTS[key as BotId].defaultModel }), {} as Record<BotId, string>),
    systemPrompts: Object.keys(BOTS).reduce((acc, key) => ({ ...acc, [key]: DEFAULT_SYSTEM_PROMPT }), {} as Record<BotId, string>),
    activeBots: [],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, processingBots]);

  // --- Handlers ---

  const handleToggleBot = (botId: BotId) => {
    setActiveBots(prev => 
      prev.includes(botId) ? prev.filter(id => id !== botId) : [...prev, botId]
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newAttachments = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file as File)
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && attachments.length === 0) || isProcessing || activeBots.length === 0) return;

    const currentText = inputValue;
    const currentAttachments = [...attachments];
    
    // Clear input
    setInputValue('');
    setAttachments([]);
    setIsProcessing(true);

    // Convert attachments for API
    const apiAttachments = await Promise.all(currentAttachments.map(async (att) => ({
      type: 'image' as const,
      data: await fileToBase64(att.file),
      mimeType: att.file.type
    })));

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: currentText,
      timestamp: Date.now(),
      attachments: apiAttachments
    };
    setMessages(prev => [...prev, userMsg]);

    // Trigger Bots
    setProcessingBots([...activeBots]);

    // We process bots concurrently
    await Promise.all(activeBots.map(async (botId) => {
      try {
        const responseText = await generateBotResponse(
          botId,
          currentText,
          messages, // Passing history (though service currently simplified)
          settings.models[botId],
          settings.systemPrompts[botId],
          apiAttachments.length > 0 ? apiAttachments.map(a => ({ data: a.data, mimeType: a.mimeType })) : undefined,
          settings.apiKeys[BotId.GEMINI] // Pass Gemini API key (used for all bots)
        );

        setMessages(prev => [...prev, {
          id: Date.now() + Math.random().toString(),
          senderId: botId,
          text: responseText,
          timestamp: Date.now()
        }]);
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, {
            id: Date.now() + Math.random().toString(),
            senderId: botId,
            text: "Sorry, I encountered an error responding.",
            isError: true,
            timestamp: Date.now()
          }]);
      } finally {
        setProcessingBots(prev => prev.filter(id => id !== botId));
      }
    }));

    setIsProcessing(false);
  };

  // --- Render Helpers ---

  const renderMessage = (msg: Message) => {
    const isUser = msg.senderId === 'user';
    const bot = !isUser ? BOTS[msg.senderId as BotId] : null;

    return (
      <div key={msg.id} className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className="flex-shrink-0 mt-1">
            {isUser ? (
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                <span className="font-bold text-xs md:text-sm">YOU</span>
              </div>
            ) : (
              <div className="relative group cursor-pointer" onClick={() => setSettingsOpen(true)} title="Click to configure bot">
                <img 
                  src={bot?.avatar} 
                  alt={bot?.name} 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm p-0.5 object-cover" 
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-white shadow-sm`}>
                   <div className={`w-2 h-2 rounded-full ${bot?.id === BotId.GEMINI ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                </div>
              </div>
            )}
          </div>

          {/* Bubble */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-xs font-semibold text-gray-500">
                 {isUser ? 'You' : bot?.name}
               </span>
               {!isUser && (
                 <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                    {settings.models[bot?.id as BotId] || bot?.defaultModel}
                 </span>
               )}
            </div>

            <div className={`
              rounded-2xl px-5 py-3 shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap
              ${isUser 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : msg.isError 
                  ? 'bg-red-50 border-red-200 border text-red-800 rounded-tl-none'
                  : `${bot?.bgColor || 'bg-white'} ${bot?.borderColor || 'border-gray-200'} border text-gray-800 rounded-tl-none`
              }
            `}>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {msg.attachments.map((att, i) => (
                    <img 
                      key={i} 
                      src={`data:${att.mimeType};base64,${att.data}`} 
                      alt="attachment" 
                      className="max-h-48 rounded-lg border border-white/20" 
                    />
                  ))}
                </div>
              )}
              {msg.text}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar 
        activeBots={activeBots} 
        onToggleBot={handleToggleBot} 
        onOpenSettings={() => setSettingsOpen(true)} 
      />

      <main className="flex-1 flex flex-col h-full relative">
        {/* Top Bar (Mobile mostly) */}
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium text-sm">Active Agents:</span>
            <div className="flex -space-x-2">
               {activeBots.map(botId => (
                 <img 
                   key={botId} 
                   src={BOTS[botId].avatar} 
                   className="w-8 h-8 rounded-full border-2 border-white bg-white p-0.5" 
                   title={BOTS[botId].name}
                 />
               ))}
               {activeBots.length === 0 && <span className="text-sm text-gray-400 italic ml-2">None</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles size={14} className="text-yellow-500" />
            <span>AI Powered Group Chat</span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
          <div className="max-w-4xl mx-auto">
            {messages.map(renderMessage)}
            
            {/* Thinking Indicators */}
            {processingBots.map(botId => (
              <div key={`thinking-${botId}`} className="flex w-full mb-6 justify-start">
                 <div className="flex max-w-[75%] gap-3 flex-row">
                    <div className="flex-shrink-0 mt-1">
                      <img src={BOTS[botId].avatar} className="w-10 h-10 rounded-full bg-white shadow-sm p-0.5 opacity-80" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-semibold text-gray-400 mb-1">{BOTS[botId].name}</span>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                           <Loader2 size={16} className="animate-spin text-gray-400" />
                           <span className="text-gray-400 text-sm italic">Thinking...</span>
                        </div>
                    </div>
                 </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 z-20">
          <div className="max-w-4xl mx-auto">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="flex gap-3 mb-3 overflow-x-auto py-2">
                {attachments.map((att, i) => (
                  <div key={i} className="relative group">
                    <img src={att.preview} className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                    <button 
                      onClick={() => removeAttachment(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gray-100 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
               <button 
                 type="button" 
                 onClick={() => fileInputRef.current?.click()}
                 className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all"
                 title="Attach images"
               >
                 <ImageIcon size={20} />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleFileSelect} 
                 multiple 
               />

               <textarea
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSubmit(e);
                   }
                 }}
                 placeholder={activeBots.length > 0 ? "Message the group..." : "Select bots from sidebar to start..."}
                 className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 max-h-32 text-gray-800 placeholder-gray-400 scrollbar-hide"
                 rows={1}
                 disabled={isProcessing || activeBots.length === 0}
                 style={{ minHeight: '44px' }}
               />

               <button 
                 type="submit" 
                 disabled={(!inputValue.trim() && attachments.length === 0) || isProcessing || activeBots.length === 0}
                 className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center
                   ${(!inputValue.trim() && attachments.length === 0) || isProcessing || activeBots.length === 0
                     ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                     : 'bg-blue-600 text-white shadow-lg hover:bg-blue-500 hover:scale-105 active:scale-95'
                   }
                 `}
               >
                 {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
               </button>
            </form>
            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">
                    AI models can make mistakes. Check important info.
                </span>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        settings={settings} 
        onUpdateSettings={setSettings} 
      />
    </div>
  );
};

export default App;