
import React, { useState } from 'react';
import { ThemeProps } from '../types';
import { LOGO_URL } from '../constants';

interface NavbarProps extends Pick<ThemeProps, 'isNight'> {
  hideLogo?: boolean;
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isNight, hideLogo = false, onLogoClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex flex-col justify-center items-center pointer-events-none">
      <div className={`transition-opacity duration-300 ${hideLogo ? 'opacity-0 duration-0' : 'opacity-100'}`}>
        {!imgError ? (
          <img
            src={LOGO_URL}
            alt="way'da"
            onClick={onLogoClick}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              setImgError(true);
            }}
            draggable="false"
            referrerPolicy="no-referrer"
            className={`h-11 w-auto object-contain pointer-events-auto transition-all duration-500 select-none cursor-pointer ${isNight ? 'filter-brand-lime' : ''}`}
          />
        ) : (
          <div
            onClick={onLogoClick}
            className={`text-4xl font-bold tracking-tighter pointer-events-auto transition-colors duration-500 cursor-pointer ${isNight ? 'text-brand-lime' : 'text-white'}`}
          >
            way'da
          </div>
        )}
      </div>
    </nav>
  );
};
