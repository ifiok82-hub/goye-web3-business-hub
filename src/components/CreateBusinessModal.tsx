import React, { useState } from 'react';
import { Building2, X, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface CreateBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBusiness: any) => void;
}

export const CreateBusinessModal: React.FC<CreateBusinessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('Software & Digital Infrastructure');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('Lagos');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [registrationInfo, setRegistrationInfo] = useState('');
  const [services, setServices] = useState('');
  const [products, setProducts] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tagline,
          category,
          country,
          state,
          address,
          email,
          phone,
          website,
          registrationInfo,
          services: services.split(',').map((s) => s.trim()).filter(Boolean),
          products: products.split(',').map((p) => p.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to register business profile.');
        setLoading(false);
        return;
      }

      onSuccess(data.business);
      onClose();
    } catch (err) {
      setError('Network communication failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121620] border border-white/15 rounded-xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Level 1 Protocol Registration</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Register Official GOYE Business ID
            </h2>
            <p className="text-xs text-slate-400">
              Allocates a unique identifier (e.g. GOYE-BIZ-2026-XXXXXX) and cryptographic profile.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-950/40 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Zenith Tech Solutions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Tagline / Mission</label>
              <input
                type="text"
                placeholder="e.g. Enterprise Cloud & AI Engineering"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Software & Digital Infrastructure">Software & Web3</option>
                <option value="Education & Training">Education & Academy</option>
                <option value="Logistics & Supply Chain">Logistics & Trade</option>
                <option value="Agribusiness & Commodities">Agribusiness</option>
                <option value="Creative & Media Services">Creative & Media</option>
                <option value="Consulting & Advisory">Consulting</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Country *</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">State / Region</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                placeholder="contact@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                placeholder="+234 800 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Headquarters Address</label>
            <input
              type="text"
              placeholder="e.g. 24 Admiralty Way, Lekki Phase 1, Lagos"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Registration Info (CAC RC / BN)
              </label>
              <input
                type="text"
                placeholder="e.g. RC-2089412"
                value={registrationInfo}
                onChange={(e) => setRegistrationInfo(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Primary Services (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Custom Web Development, AI Automation, Digital Marketing"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] disabled:opacity-50 rounded transition-colors shadow-sm"
            >
              {loading ? 'Minting ID...' : 'Register Profile & Mint ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
