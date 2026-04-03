import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Mic, Volume2, X, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Bonjour Marc ! Je suis Douly CFO. Comment puis-je optimiser vos finances aujourd'hui ?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const newMessages = [...messages, { role: 'user', text: messageText }];
    setMessages(newMessages as any);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }))
        }),
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'model', text: data.text }] as any);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'model', text: "Désolé Marc, j'ai rencontré une erreur lors de l'analyse de vos données." }] as any);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.start();
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="bg-doulia-midnight w-[320px] h-[480px] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-doulia-border mb-3 ai-glow"
          >
            {/* Header */}
            <div className="bg-doulia-card p-3 text-white flex justify-between items-center border-b border-doulia-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center border border-neon-green/30">
                  <Bot className="text-neon-green" size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-xs">Douly CFO</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
                    <p className="text-[8px] text-neon-green uppercase tracking-widest font-black">IA Active</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/5 p-1 rounded transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-doulia-midnight/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-2.5 rounded-xl text-xs ${
                    msg.role === 'user' 
                      ? 'bg-neon-green text-doulia-midnight font-bold rounded-tr-none' 
                      : 'bg-doulia-card text-white border border-doulia-border rounded-tl-none shadow-lg'
                  }`}>
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    {msg.role === 'model' && (
                      <button 
                        onClick={() => speak(msg.text)}
                        className="mt-1.5 text-neon-green hover:opacity-80 transition-opacity"
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-doulia-card p-2 rounded-xl border border-doulia-border flex gap-1">
                    <span className="w-1 h-1 bg-neon-green rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-neon-green rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-neon-green rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-doulia-card border-t border-doulia-border flex items-center gap-2">
              <button 
                onClick={startListening}
                className={`p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <Mic size={16} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Analyse financière..."
                className="flex-1 bg-doulia-midnight border border-doulia-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-neon-green transition-colors"
              />
              <button 
                onClick={() => handleSend()}
                className="bg-neon-green text-doulia-midnight p-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-neon-green rounded-xl shadow-[0_0_20px_rgba(50,205,50,0.3)] flex items-center justify-center text-doulia-midnight relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
        <MessageSquare size={24} className="relative z-10" />
      </motion.button>
    </div>
  );
}
