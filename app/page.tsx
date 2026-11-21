import PiSignIn from '../components/PiSignIn';
import LockedProducts from '../components/LockedProducts';
import FooterWithAdminTap from '../components/FooterWithAdminTap';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#060B18] text-slate-100 flex flex-col">
        {/* Single Top Header */}
        <header className="sticky top-0 z-40 bg-[#0A1128] border-b border-slate-800/90">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <a href="#top" className="flex items-center gap-3 shrink-0">
              <img
                src="/logo.png"
                alt="GOYE Web3 Business Hub"
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-700/70"
              />
              <div className="leading-snug text-left">
                <div className="text-sm sm:text-base font-extrabold text-white">
                  GOYE <span className="text-[#F5D061]">Web3</span> Business Hub
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Build Your Business. Take It Online. Add AI.
                </div>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="#top" className="hover:text-[#F5D061] transition-colors">
                Ecosystem
              </a>
              <a href="#products" className="hover:text-[#F5D061] transition-colors">
                15 Products
              </a>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <PiSignIn />
            </div>
          </div>
        </header>

        <main id="top" className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 text-center space-y-12">
          <section className="space-y-6">
            <img
              src="/logo.png"
              alt="GOYE Web3 Business Hub"
              width={200}
              height={200}
              className="w-full max-w-[200px] h-auto object-contain mx-auto rounded-2xl shadow-2xl border border-slate-800/80"
            />
            <div className="max-w-2xl mx-auto space-y-4">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Build the Business of Tomorrow
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                AI + Web3 Business Infrastructure for the Global Digital Economy. Unlock all 15 modular enterprise products via Pi Testnet.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="#products"
                className="bg-[#D4AF37] hover:bg-[#e5c14b] text-[#0A1128] px-6 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                Explore 15 Flagship Products
              </a>
            </div>
          </section>

          <section id="products" className="pt-8 border-t border-slate-800/80">
            <LockedProducts />
          </section>
        </main>

        <FooterWithAdminTap />
      </div>
    </ErrorBoundary>
  );
}
