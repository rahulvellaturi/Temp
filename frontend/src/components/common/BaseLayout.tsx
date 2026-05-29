import React from 'react';
import { Outlet } from 'react-router-dom';
import UserMenu from '@/components/common/UserMenu';
import { ParallaxBackground } from '@/components/common/Parallax';

interface BaseLayoutProps {
  title: string;
  subtitle?: string;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  /** When provided, renders a fixed parallax background image behind the page. */
  backgroundImage?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  title,
  navigation,
  actions,
  backgroundImage,
}) => {
  const hasBackground = Boolean(backgroundImage);

  return (
    <div className={`relative min-h-screen ${hasBackground ? 'bg-transparent' : 'bg-neutral-50'}`}>
      {hasBackground && <ParallaxBackground image={backgroundImage as string} />}

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
        <Outlet />
      </main>
    </div>
  );
};

export default BaseLayout;
