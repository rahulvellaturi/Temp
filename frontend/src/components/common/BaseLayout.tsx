import React from 'react';
import UserMenu from '@/components/common/UserMenu';
import { ParallaxBackground, ClientParallaxBackground } from '@/components/common/Parallax';
import { AnimatedOutlet } from '@/components/common/PageTransition';

interface BaseLayoutProps {
  title: string;
  subtitle?: string;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  /** When provided, renders a fixed parallax background image behind the page. */
  backgroundImage?: string;
  /** Use client-style 3D wallpaper (teal gradient + motion orbs). */
  clientWallpaper?: boolean;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  title,
  navigation,
  actions,
  backgroundImage,
  clientWallpaper = false,
}) => {
  const hasBackground = Boolean(backgroundImage);

  return (
    <div className={`relative min-h-screen ${hasBackground ? 'bg-transparent' : 'bg-neutral-50'}`}>
      {hasBackground &&
        (clientWallpaper ? (
          <ClientParallaxBackground image={backgroundImage as string} />
        ) : (
          <ParallaxBackground image={backgroundImage as string} />
        ))}

      <header
        className={`sticky top-0 z-40 border-b ${
          hasBackground
            ? 'border-white/40 bg-white/70 backdrop-blur-md'
            : 'border-neutral-200 bg-white shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-heading font-bold text-neutral-800">{title}</h1>
              {navigation}
            </div>
            <div className="flex items-center space-x-4">
              {actions}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main
        className="relative max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
        style={hasBackground ? { perspective: 1200 } : undefined}
      >
        <AnimatedOutlet />
      </main>
    </div>
  );
};

export default BaseLayout;
