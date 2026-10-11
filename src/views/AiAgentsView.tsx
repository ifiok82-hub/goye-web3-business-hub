import React, { useState, useEffect } from 'react';
import { ASSETS } from '../constants/assets';
import {
  Bot,
  Send,
  MessageSquare,
  Sparkles,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  category: string;
  description: string;
  capabilities: string[];
  tierRequired: string;
  defaultModel: string;
  sampleInquiries: string[];
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  source?: 'gemini' | 'rules_engine';
  whatsappHandoffUrl?: string;
}

export const AiAgentsView: React.FC = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  // Live Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Welcome to the GOYE AI Assistant Sandbox. Select any business agent or ask about our enterprise services, pricing models, and trade assurance.',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Lead capture state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadCapturedSuccess, setLeadCapturedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => {
        setAgents(data.agents || []);
        if (data.agents && data.agents.length > 0) {
          setSelectedAgent(data.agents[0]);
        }
      })
      .catch((err) => console.error('Failed to load agents:', err));
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const userText = userInput.trim();
    const newChatHistory: Message[] = [...messages, { role: 'user', text: userText }];
    setMessages(newChatHistory);
    setUserInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: 'GOYE-BIZ-2026-000001',
          userMessage: userText,
          chatHistory: newChatHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.reply,
            source: data.source,
            whatsappHandoffUrl: data.whatsappHandoffUrl,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.error || 'Our AI Assistant is currently unavailable. Please connect via email or WhatsApp.',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Network connection to the AI engine timed out. Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ai/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: 'GOYE-BIZ-2026-000001',
          contactName: leadName,
          contactEmail: leadEmail,
          phone: leadPhone,
          message: leadNotes || 'Inquiry from AI Agent sandbox',
        }),
      });
      if (res.ok) {
        setLeadCapturedSuccess(true);
        setTimeout(() => {
          setShowLeadModal(false);
          setLeadCapturedSuccess(false);
          setLeadName('');
          setLeadEmail('');
          setLeadPhone('');
          setLeadNotes('');
        }, 2000);
      }
    } catch (err) {
      console.error('Lead capture error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Server-Side Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Gemini AI Business Pipeline</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            GOYE AI Business Assistant & Agent Suite
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Deploy specialized 24/7 AI agents tailored to your business catalog, service scope, and operating rules. Securely executed server-side with zero client API key exposure.
          </p>
        </div>

        <button
          onClick={() => setShowLeadModal(true)}
          className="px-5 py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          Capture Inbound Lead Test
        </button>
      </div>

      {/* Split Section: Interactive Sandbox & Image Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Chat Sandbox Console */}
        <div className="lg:col-span-7 bg-[#121620] border border-white/10 rounded-xl overflow-hidden flex flex-col h-[520px]">
          {/* Chat Header */}
          <div className="p-4 bg-[#0B0E14] border-b border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-white">GOYE Concierge Live Sandbox</span>
              <span className="text-slate-500 font-mono text-[11px]">gemini-3.8-flash</span>
            </div>
            <button
              onClick={() => setShowLeadModal(true)}
              className="text-[#D4AF37] hover:underline font-semibold text-xs"
            >
              Log Inquiry Lead
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-lg leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#123B72] text-white'
                      : 'bg-[#0B0E14] text-slate-200 border border-white/10'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  {m.whatsappHandoffUrl && (
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">Escalate to human:</span>
                      <a
                        href={m.whatsappHandoffUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>WhatsApp Chat</span>
                      </a>
                    </div>
                  )}

                  {m.source && (
                    <div className="text-[10px] text-slate-500 mt-1 font-mono text-right">
                      Source: {m.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Business Rules'}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#0B0E14] text-slate-400 p-3 rounded-lg border border-white/10 font-mono text-[11px]">
                  AI Assistant analyzing business scope...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#0B0E14] border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Ask about enterprise web development, digital invoices, or pricing..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 bg-[#121620] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="px-4 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] disabled:opacity-50 rounded-md transition-colors flex items-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right: Architectural Image & Feature Storytelling */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative rounded-xl overflow-hidden border border-white/15 bg-[#121620]">
            <img
              src={ASSETS.aiSuite}
              alt="Autonomous Business AI Suite"
              referrerPolicy="no-referrer"
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-xs text-slate-300">
              <span className="font-bold text-white">Zero-Hallucination Architecture</span>
              <p className="text-[11px] text-slate-400">
                Grounds all answers in verified catalog data, operational hours, and authorized contact channels.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              Sample Prompts to Test
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <button
                onClick={() => setUserInput('What services do you offer for web development and AI?')}
                className="w-full text-left p-2 rounded bg-[#0B0E14] hover:bg-white/5 border border-white/5 truncate"
              >
                "What services do you offer for web development and AI?"
              </button>
              <button
                onClick={() => setUserInput('How does your digital trade assurance and contract system work?')}
                className="w-full text-left p-2 rounded bg-[#0B0E14] hover:bg-white/5 border border-white/5 truncate"
              >
                "How does your digital trade assurance and contract system work?"
              </button>
              <button
                onClick={() => setUserInput('Can I pay with Pi Network or standard bank transfer?')}
                className="w-full text-left p-2 rounded bg-[#0B0E14] hover:bg-white/5 border border-white/5 truncate"
              >
                "Can I pay with Pi Network or standard bank transfer?"
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The 9 Specialized AI Agents Grid */}
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
            Agent Marketplace
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            The 9 Specialized GOYE Business Agents
          </h2>
          <p className="text-xs text-slate-400">
            Activate agents according to your enterprise subscription tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4 hover:border-[#D4AF37]/50 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#D4AF37]">{agent.category}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{agent.tierRequired}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{agent.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{agent.description}</p>

                <div className="space-y-1 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                  {agent.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">{agent.defaultModel}</span>
                <button
                  onClick={() => {
                    setUserInput(agent.sampleInquiries[0] || 'How does this agent assist my business?');
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded transition-colors"
                >
                  Test Sample Query
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Lead Capture */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/15 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Capture Inbound Prospect Lead</h3>
              <button onClick={() => setShowLeadModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {leadCapturedSuccess ? (
              <div className="p-4 rounded bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 text-center font-medium">
                Lead successfully logged in GOYE CRM database.
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Prospect Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Adekunle"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Prospect Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. samuel@lagostech.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +234 803 111 2233"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Project Scope / Inbound Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Needs custom portal and AI receptionist by Q2..."
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="px-3 py-1.5 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-semibold text-[#0B0E14] bg-[#D4AF37] rounded"
                  >
                    Log Lead Entry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
