import React, { useState, useEffect } from 'react';
import { Bot, X, Send, PhoneCall, Sparkles } from 'lucide-react';

interface AiAssistantWidgetProps {
  businessId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({
  businessId,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; whatsappHandoffUrl?: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState('GOYE Enterprise');

  useEffect(() => {
    if (isOpen) {
      const activeId = businessId || 'GOYE-BIZ-2026-000001';
      fetch(`/api/business/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.business) {
            setBusinessName(data.business.name);
            setMessages([
              {
                role: 'assistant',
                text:
                  data.business.aiAssistantConfig?.greeting ||
                  `Hello, welcome to ${data.business.name}. How can our team assist your project requirements?`,
              },
            ]);
          }
        })
        .catch(() => {
          setMessages([
            {
              role: 'assistant',
              text: 'Welcome to GOYE Business Hub Concierge. How can we assist you today?',
            },
          ]);
        });
    }
  }, [isOpen, businessId]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const history = [...messages, { role: 'user' as const, text: userText }];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: businessId || 'GOYE-BIZ-2026-000001',
          userMessage: userText,
          chatHistory: history,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.reply,
            whatsappHandoffUrl: data.whatsappHandoffUrl,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.error || 'AI Assistant is currently offline. Please try again.',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Network error connecting to AI engine.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#121620] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[480px]">
      <div className="p-3.5 bg-[#0B0E14] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-bold text-white truncate max-w-[200px]">
            {businessName} Assistant
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] p-3 rounded-lg leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#123B72] text-white'
                  : 'bg-[#0B0E14] text-slate-200 border border-white/10'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>
              {m.whatsappHandoffUrl && (
                <div className="mt-2.5 pt-2 border-t border-white/10">
                  <a
                    href={m.whatsappHandoffUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>WhatsApp Escalation</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-[11px] text-slate-500 font-mono">
            Formulating response...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-2.5 bg-[#0B0E14] border-t border-white/10 flex gap-2">
        <input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#121620] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] rounded"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
