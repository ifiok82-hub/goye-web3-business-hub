import PiSignIn from '../components/PiSignIn';
import LockedProducts from '../components/LockedProducts';
import FooterWithAdminTap from '../components/FooterWithAdminTap';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0A1128] text-white flex flex-col">
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10 text-center space-y-10">
          <div className="space-y-4">
            <img
              src="/logo.png"
              alt="GOYE Web3 Business Hub"
              width={120}
              height={120}
              className="w-[120px] h-[120px] object-contain mx-auto rounded-2xl"
            />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              GOYEWEB3 Business Hub
            </h1>
            <p className="text-base sm:text-lg text-slate-300">
              AI + Web3 Infrastructure - Build the Business of Tomorrow
            </p>
            <div className="max-w-[400px] mx-auto pt-2 flex justify-center">
              <PiSignIn />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="/admin"
                className="bg-[#F59E0B] hover:bg-amber-400 text-black px-5 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                Admin Console
              </a>
              <a
                href="#products"
                className="bg-[#1E293B] hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                15 Flagship Products
              </a>
            </div>
          </div>

          <section id="products" className="pt-6 border-t border-slate-800/80">
            <LockedProducts />
          </section>
        </main>

        <FooterWithAdminTap />
      </div>
    </ErrorBoundary>
  );
}
