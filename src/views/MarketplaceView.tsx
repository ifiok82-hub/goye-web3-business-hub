import React, { useState, useEffect } from 'react';
import { executePiPayment, detectPiEnvironment } from '../utils/piSdk';
import {
  Search,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  CreditCard,
  Building2,
  AlertCircle,
  X,
  Smartphone,
} from 'lucide-react';

interface MarketplaceItem {
  id: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  sellerVerificationLevel: number;
  title: string;
  description: string;
  category: string;
  priceNGN: number;
  priceUSD: number;
  pricePi?: number;
  deliverables: string[];
  deliveryTimeDays: number;
  ratingAverage: number;
  totalCompletedDeals: number;
  status: string;
  createdAt: string;
}

interface MarketplaceViewProps {
  onOpenBusinessProfile: (businessId: string) => void;
  onOpenCreateBusiness: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onOpenBusinessProfile,
  onOpenCreateBusiness,
}) => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currency, setCurrency] = useState<'NGN' | 'USD' | 'PI'>('NGN');

  // Checkout modal
  const [activeItem, setActiveItem] = useState<MarketplaceItem | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<'bank_transfer' | 'pi' | 'paystack'>('bank_transfer');
  const [paymentStatusText, setPaymentStatusText] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState<any | null>(null);

  const categories = [
    'All',
    'Websites',
    'Web Apps',
    'AI Assistants',
    'AI Automation',
    'Digital Marketing',
    'Business Services',
    'Digital Products',
    'Templates',
    'Business Documents',
    'Web3 Services',
    'Education',
    'Consulting',
    'Software/SaaS',
    'Creative Services',
  ];

  const VERIFICATION_LEVEL_LABELS: Record<number, string> = {
    1: 'Registered Profile',
    2: 'Documents Submitted',
    3: 'GOYE Reviewed',
    4: 'Identity Confirmed',
    5: 'Payment Enabled',
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = '/api/marketplace/items?';
      if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load marketplace items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const formatPrice = (item: MarketplaceItem) => {
    if (currency === 'PI' && item.pricePi) {
      return `${item.pricePi.toLocaleString()} π`;
    }
    if (currency === 'USD') {
      return `$${item.priceUSD.toLocaleString()}`;
    }
    return `₦${item.priceNGN.toLocaleString()}`;
  };

  const handleStartOrder = (item: MarketplaceItem) => {
    setActiveItem(item);
    setPaymentStatusText(null);
    setPaymentError(null);
    setOrderComplete(null);
  };

  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !buyerName || !buyerEmail) return;

    setPaymentError(null);
    setPaymentStatusText('Generating order reference...');

    const orderRef = `ORD-${Date.now()}`;

    if (selectedPaymentProvider === 'pi') {
      const piEnv = detectPiEnvironment();
      if (!piEnv.isPiBrowser) {
        setPaymentError(
          'Pi payment verification requires the official Pi Browser. Please open this page inside Pi Browser, or choose Bank Transfer / Web2 Payment.'
        );
        setPaymentStatusText(null);
        return;
      }

      executePiPayment({
        amount: activeItem.pricePi || Math.round(activeItem.priceUSD / 10),
        memo: `Order ${orderRef} - ${activeItem.title}`,
        internalOrderId: orderRef,
        onStatusChange: (status) => setPaymentStatusText(status),
        onSuccess: (payment) => {
          setOrderComplete({
            orderRef,
            paymentMethod: 'Pi Platform API (Verified)',
            transactionId: payment.txid,
            verified: true,
          });
          setPaymentStatusText(null);
        },
        onError: (err) => {
          setPaymentError(err);
          setPaymentStatusText(null);
        },
      });
      return;
    }

    if (selectedPaymentProvider === 'bank_transfer') {
      // Conventional Web2 bank settlement with verifiable transfer instructions & invoice record
      try {
        const invRes = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sellerBusinessId: activeItem.sellerBusinessId,
            buyerName,
            buyerEmail,
            items: [
              {
                description: activeItem.title,
                quantity: 1,
                unitPrice: activeItem.priceNGN,
              },
            ],
            currency: 'NGN',
            paymentMethod: 'Direct Bank Wire (NGN)',
            notes: `Marketplace Order Reference: ${orderRef}`,
          }),
        });
        const invData = await invRes.json();
        setOrderComplete({
          orderRef,
          invoiceId: invData.invoice?.id || 'INV-PENDING',
          paymentMethod: 'Direct Bank Transfer',
          amount: activeItem.priceNGN,
          instructions:
            'Please transfer to GOYE Trade Settlement Account (Wema Bank: 0124892019 / Acct: GOYE Tech) using your Invoice Reference.',
        });
        setPaymentStatusText(null);
      } catch (err) {
        setPaymentError('Failed to generate official settlement invoice. Please try again.');
        setPaymentStatusText(null);
      }
      return;
    }

    if (selectedPaymentProvider === 'paystack') {
      setPaymentError(
        'Paystack gateway is currently in test staging. Please select Direct Bank Wire for instant settlement.'
      );
      setPaymentStatusText(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <span>Enterprise Commerce</span>
            <span aria-hidden="true">·</span>
            <span>Verified Sellers Only</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            GOYE Enterprise Marketplace
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Discover production-ready websites, AI automation assistants, digital legal contracts, and enterprise software. Every seller is verified through their GOYE Business ID.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 p-1 bg-[#121620] border border-white/10 rounded-lg text-xs font-medium">
          <button
            onClick={() => setCurrency('NGN')}
            className={`px-3 py-1.5 rounded transition-colors ${
              currency === 'NGN' ? 'bg-[#D4AF37] text-[#0B0E14] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            NGN (₦)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1.5 rounded transition-colors ${
              currency === 'USD' ? 'bg-[#D4AF37] text-[#0B0E14] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('PI')}
            className={`px-3 py-1.5 rounded transition-colors ${
              currency === 'PI' ? 'bg-[#D4AF37] text-[#0B0E14] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pi (π)
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search solutions, deliverables, or sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121620] border border-white/10 text-white text-xs rounded-md pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#D4AF37]"
          />
        </form>

        {/* Horizontal Category Filter Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'bg-[#121620] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 font-mono">
          Loading catalog solutions...
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#121620] border border-white/10 space-y-2">
          <Tag className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="text-sm font-semibold text-white">No items found in this category</div>
          <p className="text-xs text-slate-400">Try choosing another category or clearing your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-xl bg-[#121620] border border-white/10 flex flex-col justify-between space-y-5 hover:border-[#D4AF37]/50 transition-colors"
            >
              <div className="space-y-3">
                {/* Clean unboxed category & ID */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-[#D4AF37]">{item.category}</span>
                  <span className="font-mono text-slate-500">{item.id}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Seller attribution with GOYE Business ID */}
                <div className="pt-2 pb-1 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <button
                      onClick={() => onOpenBusinessProfile(item.sellerBusinessId)}
                      className="hover:text-[#D4AF37] transition-colors font-medium truncate max-w-[150px]"
                    >
                      {item.sellerBusinessName}
                    </button>
                  </div>
                  <span
                    className="text-[11px] font-mono text-[#D4AF37] flex items-center gap-1 shrink-0"
                    title={`Seller Status: Level ${item.sellerVerificationLevel} - ${VERIFICATION_LEVEL_LABELS[item.sellerVerificationLevel] || 'Registered Profile'}`}
                  >
                    <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                    <span>L{item.sellerVerificationLevel}: {VERIFICATION_LEVEL_LABELS[item.sellerVerificationLevel] || 'Registered'}</span>
                  </span>
                </div>

                {/* Key Deliverables Bullet Points */}
                <div className="space-y-1 pt-1 text-[11px] text-slate-400">
                  {item.deliverables.slice(0, 2).map((d, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and CTA */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500">Starting Price</div>
                  <div className="text-lg font-bold text-white font-mono tabular-nums">
                    {formatPrice(item)}
                  </div>
                </div>

                <button
                  onClick={() => handleStartOrder(item)}
                  className="px-4 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors"
                >
                  Order / Inquire
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order & Checkout Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/15 rounded-xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-mono text-[#D4AF37]">{activeItem.id}</span>
                <h3 className="text-lg font-bold text-white">{activeItem.title}</h3>
                <p className="text-xs text-slate-400">
                  Seller: <strong className="text-white">{activeItem.sellerBusinessName}</strong> ({activeItem.sellerBusinessId}) ·{' '}
                  <span className="text-[#D4AF37] font-medium">
                    Level {activeItem.sellerVerificationLevel}: {VERIFICATION_LEVEL_LABELS[activeItem.sellerVerificationLevel] || 'Registered Profile'}
                  </span>
                </p>
              </div>
              <button onClick={() => setActiveItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderComplete ? (
              <div className="p-6 rounded-lg bg-[#0B0E14] border border-[#D4AF37]/40 space-y-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#D4AF37] mx-auto" />
                <h4 className="text-base font-bold text-white">Order Reference Generated</h4>
                <div className="text-xs font-mono text-slate-300 bg-white/5 p-2 rounded">
                  Ref: {orderComplete.orderRef}
                </div>
                {orderComplete.invoiceId && (
                  <div className="text-xs text-[#D4AF37]">
                    Invoice Issued: <strong>{orderComplete.invoiceId}</strong>
                  </div>
                )}
                <p className="text-xs text-slate-400 leading-relaxed">
                  {orderComplete.instructions || 'Transaction verified through official server gateway.'}
                </p>
                <button
                  onClick={() => setActiveItem(null)}
                  className="w-full py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] rounded-md"
                >
                  Close & View Invoices
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecuteCheckout} className="space-y-4">
                <div className="p-3 rounded-lg bg-[#0B0E14] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Settlement Amount:</span>
                  <span className="text-base font-bold text-white font-mono">
                    {formatPrice(activeItem)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Full Name / Entity
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amina Bello"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Corporate Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. amina@enterprise.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Modular Payment Provider Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Select Verified Settlement Method
                  </label>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 p-2.5 rounded border border-white/10 bg-[#0B0E14] cursor-pointer hover:border-white/20">
                      <input
                        type="radio"
                        name="payment_provider"
                        value="bank_transfer"
                        checked={selectedPaymentProvider === 'bank_transfer'}
                        onChange={() => setSelectedPaymentProvider('bank_transfer')}
                        className="text-[#D4AF37] focus:ring-0"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-white">Direct Bank Wire / NIP Transfer (NGN)</div>
                        <div className="text-[11px] text-slate-400">Verifiable bank invoice and cryptographic audit receipt.</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded border border-white/10 bg-[#0B0E14] cursor-pointer hover:border-white/20">
                      <input
                        type="radio"
                        name="payment_provider"
                        value="pi"
                        checked={selectedPaymentProvider === 'pi'}
                        onChange={() => setSelectedPaymentProvider('pi')}
                        className="text-[#D4AF37] focus:ring-0"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Pi Network Platform API (Testnet)</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Official Pi SDK required. Strict zero-mock enforcement.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {paymentStatusText && (
                  <div className="p-2.5 rounded bg-[#123B72]/40 border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-mono">
                    {paymentStatusText}
                  </div>
                )}

                {paymentError && (
                  <div className="p-3 rounded bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-md transition-colors"
                  >
                    Confirm & Settle Order
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
