import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleBackground from './ParticleBackground';

interface LayoutProps {
  children: ReactNode;
  showParticles?: boolean;
}

export default function Layout({ children, showParticles = true }: LayoutProps) {
  return (
    <div className="relative min-h-[100dvh] flex flex-col">
      {showParticles && <ParticleBackground />}
      <Navbar />
      <main className="relative z-10 flex-1 flex flex-col">
        {children}
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
