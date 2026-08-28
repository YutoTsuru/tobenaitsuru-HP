import Image from 'next/image';
import './globals.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

import BackgroundGears from '../components/BackgroundGears';
import GateIntro from '../components/GateIntro';

export const metadata = {
  title: 'Tobenaitsuru Portfolio',
  description: 'Thinking, Designing, Making - Portfolio of Tobenaitsuru',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <GateIntro />
        <BackgroundGears />
        <header className="site-header">
          <div className="container header-container">
            <div className="logo">
              <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  src="/assets/logo.png"
                  alt="Tobenaitsuru Logo"
                  width={50}
                  height={50}
                  style={{ marginRight: '10px' }}
                />
                Tobenaitsuru
              </a>
            </div>
            <Navigation />
          </div>
        </header>
        <main className="site-main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
