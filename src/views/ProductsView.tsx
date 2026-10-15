import React, { useState, useEffect } from 'react';
import { executePiPayment, detectPiEnvironment } from '../utils/piSdk';
import { GoyeLogo } from '../components/GoyeLogo';
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
  Sparkles,
  Layers,
  Star,
  Filter,
  Check,
  Package,
  ExternalLink,
  PlusCircle,
  Cpu,
} from 'lucide-react';

export interface ProductItem {
  id: string;
  businessId: string;
  sellerBusinessName?: string;
  sellerVerificationLevel?: number;
  title: string;
  description: string;
  category: string;
  priceNGN: number;
  priceUSD: number;
  pricePi?: number;
  deliverables?: string[];
  features?: string[];
  deliveryTimeDays?: number;
  ratingAverage?: number;
  completedDeals?: number;
  badge?: string;
  status: string;
  createdAt: string;
}

interface ProductsViewProps {
  onOpenBusinessProfile?: (businessId: string) => void;
  onNavigate?: (view: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenBusinessProfile,
  onNavigate,
}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currency, setCurrency] = useState<'NGN' | 'USD' | 'PI'>('NGN');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Detail Modal
  const [activeProduct, setActiveProduct] = useState<ProductItem | null>(null);

  // Checkout Modal
  const [checkoutProduct, setCheckoutProduct] = useState<ProductItem | null>(null);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<'bank_transfer' | 'pi' | 'paystack'>('bank_transfer');
  const [paymentStatusText, setPaymentStatusText] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Register New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Websites');
  const [newPriceNGN, setNewPriceNGN] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newDeliverables, setNewDeliverables] = useState<string>('');
  const [newDeliveryDays, setNewDeliveryDays] = useState<string>('5');
  const [addProductSuccess, setAddProductSuccess] = useState<string | null>(null);
  const [addProductError, setAddProductError] = useState<string | null>(null);

  const CATEGORIES = [
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
    'Trade Assurance',
  ];

  const VERIFICATION_LEVEL_LABELS: Record<number, string> = {
    1: 'Registered Profile',
    2: 'Documents Submitted',
    3: 'GOYE Reviewed',
    4: 'Identity Confirmed',
    5: 'Payment Enabled',
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products?';
      if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (sortBy) url += `sort=${encodeURIComponent(sortBy)}&`;
      if (currency) url += `currency=${encodeURIComponent(currency)}&`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, currency]);

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct) return;
    if (!buyerName.trim() || !buyerEmail.trim()) {
      setPaymentError('Please enter your full name and corporate email address.');
      return;
    }

    setPaymentError(null);
    setPaymentStatusText('Creating formal order record in GOYE Registry...');
    setIsSubmitting(true);

    try {
      // 1. Create order in PENDING status (Strict Payment Integrity)
      const res = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: checkoutProduct.id,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim(),
          paymentProvider: selectedPaymentProvider,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initialize order.');
      }

      const createdOrder = orderData.order;

      // 2. If Pi Network payment selected, trigger real Pi payment flow
      if (selectedPaymentProvider === 'pi') {
        const env = detectPiEnvironment();
        if (!env.isPiBrowser) {
          setPaymentStatusText(null);
          setPaymentError(
            'Pi Network payments require the official Pi Browser mobile app. You can switch to Bank Wire or open this link inside Pi Browser.'
          );
          setIsSubmitting(false);
          return;
        }

        setPaymentStatusText('Opening Pi Wallet for Testnet authorization...');
        const piAmount = checkoutProduct.pricePi || Number((checkoutProduct.priceNGN / 15000).toFixed(2));

        await executePiPayment({
          amount: piAmount,
          memo: `GOYE Web3: ${checkoutProduct.title.slice(0, 32)} (${createdOrder.orderReference})`,
          internalOrderId: createdOrder.id,
          onStatusChange: (status) => setPaymentStatusText(status),
          onSuccess: (payment) => {
            setOrderComplete({
              ...createdOrder,
              status: 'UNDER_REVIEW',
              paymentReference: payment.txid || payment.paymentId,
              evidenceNotes: 'Official Pi Platform payment completed and pending node settlement verification.',
            });
            setIsSubmitting(false);
          },
          onError: (errMsg) => {
            setPaymentError(errMsg || 'Pi payment was cancelled or failed to approve.');
            setIsSubmitting(false);
          },
        });
      } else {
        // Bank transfer / Direct settlement
        setOrderComplete(createdOrder);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment pipeline failure. Please retry.');
    } finally {
      setIsSubmitting(false);
      setPaymentStatusText(null);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPriceNGN) {
      setAddProductError('Product title and price (NGN) are required.');
      return;
    }

    setAddProductError(null);
    setAddProductSuccess(null);

    try {
      const deliverablesList = newDeliverables
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: 'GOYE-BIZ-2026-000001', // Default hub merchant
          title: newTitle.trim(),
          category: newCategory,
          priceNGN: Number(newPriceNGN),
          description: newDescription.trim(),
          deliverables: deliverablesList,
          deliveryTimeDays: Number(newDeliveryDays) || 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to list product.');
      }

      setAddProductSuccess('Product successfully registered and published in GOYE catalog.');
      setNewTitle('');
      setNewPriceNGN('');
      setNewDescription('');
      setNewDeliverables('');
      fetchProducts();
      setTimeout(() => {
        setShowAddProductModal(false);
        setAddProductSuccess(null);
      }, 2000);
    } catch (err: any) {
      setAddProductError(err.message || 'Error listing product.');
    }
  };

  const formatPrice = (p: ProductItem) => {
    if (currency === 'PI') {
      const piVal = p.pricePi ?? Number((p.priceNGN / 15000).toFixed(2));
      return `${piVal} π`;
    }
    if (currency === 'USD') {
      return `$${p.priceUSD.toLocaleString()}`;
    }
    return `₦${p.priceNGN.toLocaleString()}`;
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Banner */}
      <section className="relative rounded-2xl bg-gradient-to-br from-[#121620] via-[#0B0E14] to-[#121620] border border-white/10 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <GoyeLogo size="sm" subtitle="15 Flagship Products" />
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <span className="px-2.5 py-1 rounded bg-[#D4AF37]/10 text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/30">
              15 Comprehensive Solutions
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Enterprise Solutions & Verified Web3 Products
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Explore 15 production-grade digital solutions engineered for African enterprises and global founders.
            From high-conversion websites and custom cloud SaaS to autonomous AI workflows, legal smart contracts,
            and server-verified Pi Network settlements.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-white font-medium">15 Verified Catalog Products</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-medium">Level 4 Verified Merchants</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-white font-medium">Dual Settlement (NGN, USD & Pi Testnet)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Controls & Filter Bar */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search across all 15 solutions, features, or deliverables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#121620] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Currency + Sort + Add Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-[#121620] border border-white/10 rounded-lg p-1 text-xs">
              <button
                onClick={() => setCurrency('NGN')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  currency === 'NGN' ? 'bg-[#D4AF37] text-[#0B0E14] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                NGN (₦)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  currency === 'USD' ? 'bg-[#D4AF37] text-[#0B0E14] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('PI')}
                className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                  currency === 'PI' ? 'bg-[#D4AF37] text-[#0B0E14] font-bold' : 'text-[#D4AF37] hover:text-white'
                }`}
                title="Pi Network Settlement"
              >
                <span>Pi (π)</span>
              </button>
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#121620] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="featured">Featured Order</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rating</option>
              <option value="deals">Most Completed Deals</option>
            </select>

            {/* Add Product Button */}
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-lg transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Product</span>
            </button>
          </div>
        </div>

        {/* 15-Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#0B0E14] font-bold shadow'
                    : 'bg-[#121620] text-slate-300 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Product Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading GOYE 15-Product Infrastructure Catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <Package className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No products found matching criteria</h3>
          <p className="text-xs text-slate-400">Try adjusting your category filter or search query.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-[#D4AF37] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="group rounded-xl bg-[#121620] border border-white/10 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl"
            >
              {/* Card Top */}
              <div className="p-6 space-y-4">
                {/* Header: Badge & Category */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-[#D4AF37]">
                    {p.category}
                  </span>
                  {p.badge && (
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {p.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>

                {/* Feature Tags */}
                {p.features && p.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.features.slice(0, 3).map((feat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#0B0E14] text-[10px] text-slate-300 border border-white/5"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Verified Merchant & SLA Row */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{p.sellerBusinessName || 'GOYE Verified'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300 shrink-0">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    <span>{p.deliveryTimeDays || 3}d SLA</span>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="font-semibold">{p.ratingAverage || 5.0}</span>
                  </div>
                  <span className="text-slate-500">{p.completedDeals || 0} completed orders</span>
                </div>
              </div>

              {/* Card Bottom: Price & Actions */}
              <div className="p-6 pt-0 space-y-3">
                <div className="p-3 rounded-lg bg-[#0B0E14] border border-white/5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Fixed Price</span>
                    <span className="text-lg font-extrabold text-white font-mono">{formatPrice(p)}</span>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-mono">
                    {currency === 'NGN' && <span>≈ ${(p.priceUSD).toLocaleString()}</span>}
                    {currency === 'USD' && <span>≈ ₦{(p.priceNGN).toLocaleString()}</span>}
                    {currency === 'PI' && <span>≈ ${(p.priceUSD).toLocaleString()}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveProduct(p)}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-center cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutProduct(p);
                      setOrderComplete(null);
                      setPaymentError(null);
                    }}
                    className="w-full py-2 px-3 text-xs font-bold text-[#0B0E14] bg-[#D4AF37] hover:bg-[#e0bc46] rounded-lg transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Product Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121620] border border-white/15 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-mono font-bold">
                  {activeProduct.category}
                </span>
                {activeProduct.badge && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-semibold">
                    {activeProduct.badge}
                  </span>
                )}
                <span className="text-xs text-slate-500 font-mono">ID: {activeProduct.id}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{activeProduct.title}</h2>
            </div>

            {/* Pricing Card */}
            <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Standard Fixed Price</span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {formatPrice(activeProduct)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  ₦{activeProduct.priceNGN.toLocaleString()} · ${activeProduct.priceUSD.toLocaleString()} · {activeProduct.pricePi || (activeProduct.priceNGN / 15000).toFixed(2)} π
                </div>
              </div>
              <button
                onClick={() => {
                  setCheckoutProduct(activeProduct);
                  setActiveProduct(null);
                  setOrderComplete(null);
                  setPaymentError(null);
                }}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <span>Initiate Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Solution Overview</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeProduct.description}
              </p>
            </div>

            {/* Deliverables List */}
            {activeProduct.deliverables && activeProduct.deliverables.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  Included Contract Deliverables
                </h4>
                <ul className="space-y-2">
                  {activeProduct.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Seller & Verification Details */}
            <div className="p-4 rounded-xl bg-[#0B0E14]/60 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verified Seller:</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {activeProduct.sellerBusinessName || 'GOYE Tech Innovations'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verification Level:</span>
                <span className="font-mono text-[#D4AF37]">
                  Level {activeProduct.sellerVerificationLevel || 4}: {VERIFICATION_LEVEL_LABELS[activeProduct.sellerVerificationLevel || 4]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Delivery SLA:</span>
                <span className="text-white font-mono">{activeProduct.deliveryTimeDays || 3} business days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Checkout / Multi-Rail Payment Modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121620] border border-white/15 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setCheckoutProduct(null);
                setOrderComplete(null);
                setPaymentError(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {orderComplete ? (
              <div className="text-center space-y-5 py-4">
                <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-700 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Order Registered Successfully</h3>
                  <p className="text-xs font-mono text-[#D4AF37]">
                    Order Reference: {orderComplete.orderReference}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#0B0E14] border border-white/10 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-semibold text-amber-400">{orderComplete.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Item:</span>
                    <span className="font-semibold text-white truncate max-w-[200px]">{orderComplete.itemTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-mono text-white font-bold">
                      {orderComplete.amount} {orderComplete.currency}
                    </span>
                  </div>
                  {orderComplete.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Ref:</span>
                      <span className="font-mono text-emerald-400 truncate max-w-[180px]">
                        {orderComplete.paymentReference}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict payment integrity policy enforced: Formal invoice and order records are queued for compliance reconciliation. 
                  Receipt sent to <span className="text-white font-medium">{buyerEmail}</span>.
                </p>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setCheckoutProduct(null);
                      setOrderComplete(null);
                      if (onNavigate) onNavigate('contracts-invoices');
                    }}
                    className="flex-1 py-2.5 px-4 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-bold text-xs rounded-lg transition-colors"
                  >
                    View Invoices Ledger
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutProduct(null);
                      setOrderComplete(null);
                    }}
                    className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                    Multi-Rail Checkout
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Order: {checkoutProduct.title}
                  </h3>
                  <div className="text-sm font-mono font-bold text-white pt-1">
                    Amount: {formatPrice(checkoutProduct)}
                  </div>
                </div>

                {paymentError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {paymentStatusText && (
                  <div className="p-3 rounded-lg bg-[#123B72]/40 border border-[#D4AF37]/40 text-xs text-slate-200 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>{paymentStatusText}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amina Bello"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Business Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. amina@enterprise.ng"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">WhatsApp / Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +234 803 219 4401"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Payment Rail Options */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-semibold block">Select Settlement Rail</label>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Bank Wire */}
                    <label
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedPaymentProvider === 'bank_transfer'
                          ? 'bg-[#123B72]/30 border-[#D4AF37]'
                          : 'bg-[#0B0E14] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="paymentProvider"
                          value="bank_transfer"
                          checked={selectedPaymentProvider === 'bank_transfer'}
                          onChange={() => setSelectedPaymentProvider('bank_transfer')}
                          className="text-[#D4AF37] focus:ring-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">Direct Bank Wire / NIP (₦ NGN)</span>
                          <span className="text-[10px] text-slate-400">Corporate invoice with verifiable account reference</span>
                        </div>
                      </div>
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </label>

                    {/* Pi Network */}
                    <label
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedPaymentProvider === 'pi'
                          ? 'bg-[#123B72]/30 border-[#D4AF37]'
                          : 'bg-[#0B0E14] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="paymentProvider"
                          value="pi"
                          checked={selectedPaymentProvider === 'pi'}
                          onChange={() => setSelectedPaymentProvider('pi')}
                          className="text-[#D4AF37] focus:ring-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1">
                            Pi Network Platform API (π Pi)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Server-to-server approval in Pi Browser ({checkoutProduct.pricePi || (checkoutProduct.priceNGN / 15000).toFixed(2)} π)
                          </span>
                        </div>
                      </div>
                      <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                    </label>

                    {/* Paystack / Card */}
                    <label
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedPaymentProvider === 'paystack'
                          ? 'bg-[#123B72]/30 border-[#D4AF37]'
                          : 'bg-[#0B0E14] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="paymentProvider"
                          value="paystack"
                          checked={selectedPaymentProvider === 'paystack'}
                          onChange={() => setSelectedPaymentProvider('paystack')}
                          className="text-[#D4AF37] focus:ring-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">Card / Paystack Gateway</span>
                          <span className="text-[10px] text-slate-400">Debit card, USSD, Apple Pay & bank checkout</span>
                        </div>
                      </div>
                      <CreditCard className="w-4 h-4 text-slate-400" />
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-[#D4AF37] hover:bg-[#e0bc46] disabled:opacity-50 text-[#0B0E14] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Confirm Order & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutProduct(null)}
                    className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. Register New Product Modal (Merchant Portal) */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121620] border border-white/15 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                Merchant Portal
              </span>
              <h3 className="text-lg font-bold text-white">List New Product or Service</h3>
              <p className="text-xs text-slate-400">
                Register a new commercial solution in the GOYE catalog with verified business ID linkage.
              </p>
            </div>

            {addProductSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{addProductSuccess}</span>
              </div>
            )}

            {addProductError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{addProductError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Product / Solution Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise DeFi Invoicing Gateway"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Price (NGN ₦) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 250000"
                    value={newPriceNGN}
                    onChange={(e) => setNewPriceNGN(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline technical capabilities, architecture, and who this solution serves..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Deliverables (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Production source code&#10;Architecture documentation&#10;30-day warranty"
                  value={newDeliverables}
                  onChange={(e) => setNewDeliverables(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Delivery Time (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newDeliveryDays}
                  onChange={(e) => setNewDeliveryDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#D4AF37] hover:bg-[#e0bc46] text-[#0B0E14] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Publish Product Listing
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
