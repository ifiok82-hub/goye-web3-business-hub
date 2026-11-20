import PiSignIn from '../components/PiSignIn';

export default function Home() {
  return (
    <main style={{ background: '#0A1128', color: '#fff', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <img src="/logo.png" alt="GOYE" style={{ width: '120px', height: '120px', objectFit: 'contain', margin: '20px auto' }} />
        <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '10px 0' }}>GOYEWEB3 Business Hub</h1>
        <p style={{ fontSize: '18px', opacity: 0.8 }}>AI + Web3 Infrastructure - Build the Business of Tomorrow</p>
        <div style={{ maxWidth: '400px', margin: '24px auto' }}>
          <PiSignIn />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
          <a href="/admin" style={{ background: '#F59E0B', color: '#000', padding: '12px 20px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>Create Business Profile</a>
          <a href="#products" style={{ background: '#1E293B', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>15 Flagship Products</a>
        </div>
        <div id="products" style={{ marginTop: '40px', padding: '24px', background: '#111C3A', borderRadius: '16px' }}>
          <h2>15 Flagship Products</h2>
          <p>Verifiable Business ID - Services and Marketplace - Trade Assurance Hub - Pi System Audit</p>
          <p style={{ opacity: 0.6, fontSize: '14px' }}>Testnet Only - Pi Verified Testnet</p>
        </div>
        <footer style={{ marginTop: '40px', opacity: 0.6, fontSize: '14px' }}>
          <img src="/logo.png" alt="GOYE" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          <p>GOYE Web3 Business Hub - Build Your Business. Take It Online. Add AI.</p>
        </footer>
      </div>
    </main>
  );
}
