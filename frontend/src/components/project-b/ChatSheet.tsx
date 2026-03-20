import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLE_PROMPTS = [
  "Are there any critical subjects?",
  "How many bunks can I take overall?",
  "Which subject needs the most attention?"
];

export default function ChatSheet() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { aiConfig, appData } = useAppContext();

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async (overrideInput?: string) => {
    const textToSend = overrideInput ?? input;
    if (!textToSend.trim()) return;
    const userMsg: Message = { role: 'user', content: textToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideInput) setInput('');
    setLoading(true);

    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content, context: appData, config: aiConfig }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Backend unavailable. Connect to http://127.0.0.1:5000.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="absolute bottom-24 right-5 w-14 h-14 rounded-2xl bg-system-blue shadow-lg flex items-center justify-center text-primary-foreground z-40"
      >
        <MessageSquare size={22} fill="currentColor" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-50 flex flex-col bg-background"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
              <h2 className="section-header">B AI Assistant</h2>
              <button onClick={() => setOpen(false)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-10 space-y-6">
                  <p className="text-center text-muted-foreground text-sm font-medium">Ask anything about your attendance data.</p>
                  <div className="flex flex-col w-full gap-2">
                    {EXAMPLE_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(prompt)}
                        className="bg-card hover:bg-secondary border border-border transition-colors text-left px-4 py-3 rounded-2xl text-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                  ? 'ml-auto bg-system-blue text-primary-foreground rounded-br-md'
                  : 'bg-card rounded-bl-md'
                  }`}>
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div className="bg-card p-3 rounded-2xl rounded-bl-md w-16">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse delay-200" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex gap-3 pb-safe">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Message..."
                className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => sendMessage()}
                className="w-11 h-11 rounded-xl bg-system-blue flex items-center justify-center text-primary-foreground shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
