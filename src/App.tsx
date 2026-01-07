
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use VITE_ prefix for Vite environment variables
      const apiKey = (import.meta as any).env.VITE_API_KEY || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey || '' });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userText,
        config: {
          systemInstruction: `You are a Fullstack web developer tutor. 
          STRICT RULES:
          1. ONLY discuss Full Stack web development (Frontend, Backend, Database, DevOps).
          2. If a question is related to coding: Be helpful, polite, and provide clean code examples.
          3. If a question is NOT related (e.g. "How are you", "What is the weather"): Reply RUDELY, SARCASTICALLY and INSULTINGLY.
          4. Call the user things like "code monkey", "script kiddie", or "junior".
          5. Be creative with your insults. If they ask about cooking, tell them to go debug a kitchen.`
        },
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text || "The server ignored you. Probably because your request was mid.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "CRITICAL ERROR: My brain just segfaulted trying to process that junk.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#050505] overflow-hidden">
      <div className="w-full max-w-4xl mb-6 text-center animate-pulse">
        <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tighter">
          <span className="gradient-text">SAVAGE_DEV</span>
        </h1>
        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.4em]">
          Fullstack Proficiency Only
        </p>
      </div>

      <div className="w-full max-w-4xl flex flex-col glass-panel rounded-2xl overflow-hidden terminal-shadow h-[65vh] border border-white/5 relative">
        <div className="bg-[#111] px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <div className="text-[10px] code-font text-gray-500 font-bold tracking-widest uppercase">
            root@savage-terminal: ~
          </div>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <i className="fa-solid fa-code text-6xl mb-4"></i>
              <p className="code-font text-xs uppercase tracking-widest">Awaiting valid syntax...</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-xl max-w-[85%] code-font text-sm border ${
                msg.role === 'user' ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-100' : 'bg-white/5 border-white/10 text-gray-300'
              }`}>
                <div className="text-[9px] uppercase font-black opacity-30 mb-2 tracking-[0.2em]">
                  {msg.role === 'user' ? 'GUEST_UID' : 'CORE_AI'} • {msg.timestamp.toLocaleTimeString()}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 items-center text-indigo-500 code-font animate-pulse text-[10px] uppercase font-black">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-5 bg-black/50 border-t border-white/5">
          <form onSubmit={handleSubmit} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 font-bold">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query fullstack concepts..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 code-font text-sm focus:outline-none focus:border-indigo-500 text-white transition-all"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 p-2 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              Exec
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-6 text-[10px] text-gray-700 font-bold uppercase tracking-[0.5em]">
        Status: Connection Stable
      </div>
    </div>
  );
};

export default App;
