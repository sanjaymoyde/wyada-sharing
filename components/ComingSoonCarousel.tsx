import React from 'react';
import { motion } from 'framer-motion';
import { ELEMENT_ICONS } from '../constants';

interface ComingSoonCarouselProps {
  isNight: boolean;
}

export const ComingSoonCarousel: React.FC<ComingSoonCarouselProps> = ({ isNight }) => {
  const bgColor = isNight ? 'bg-black' : 'bg-gray-900';

  const items = [
    { name: 'Fire', icon: ELEMENT_ICONS.FIRE },
    { name: 'Air', icon: ELEMENT_ICONS.AIR },
    { name: 'Ether', icon: ELEMENT_ICONS.ETHER },
  ];

  return (
    <section
      id="element-future"
      className="relative w-full z-[60]"
      style={{ height: 'calc(var(--app-vh) * 2)', marginTop: 'calc(var(--app-vh) * -1)' }}
    >
      <motion.div
        style={{ height: 'var(--app-vh)' }}
        className={`sticky top-0 w-full ${bgColor} overflow-hidden shadow-none transition-colors duration-700 block z-50 snap-start snap-always`}
      >
        {/* Inner Content Wrapper tied to stable svh */}
        <div className="w-full relative h-[var(--app-vh)] supports-[height:100svh]:!h-[100svh] flex flex-col items-start justify-center">
          <motion.div
            className="flex h-full w-full relative"
            style={{ touchAction: "pan-y" }}
          >
            <div className="flex flex-col md:flex-row items-center justify-end pb-64 md:justify-between md:pb-0 w-full h-full px-8 md:px-16 md:pt-0">
              {/* Text Section - Left */}
              <div className="flex flex-col items-start justify-center text-left max-w-xl z-20 md:h-full md:translate-y-20">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">coming soon.</h2>
                <p className="text-base md:text-lg text-white/60 leading-relaxed">We're crafting the remaining elements to complete the system.</p>
              </div>

              {/* Icons Section - Right (Pyramid Layout) */}
              <div className="flex flex-col items-center justify-center gap-6 md:pr-48 z-20 mt-12 md:mt-0">
                {/* DESKTOP ICONS: Pyramid Layout */}
                <div className="max-md:hidden flex flex-col items-center gap-6">
                  {/* Top of Pyramid: Fire (Center) */}
                  <div className="flex flex-col items-center gap-4 group">
                    <div className="w-[74px] h-[74px] relative flex items-center justify-center">
                      <motion.img
                        src={items[0].icon} // Fire
                        alt={items[0].name}
                        className="w-full h-full object-contain brightness-0 invert select-none opacity-60"
                        initial={{ opacity: 0.4, scale: 0.9 }}
                        animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.0, 0.9] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 group-hover:text-white transition-colors">{items[0].name}</span>
                  </div>

                  {/* Bottom of Pyramid: Air & Ether */}
                  <div className="flex items-center gap-24">
                    {[items[1], items[2]].map((item, i) => (
                      <div key={item.name} className="flex flex-col items-center gap-4 group">
                        <div className="w-[74px] h-[74px] relative flex items-center justify-center">
                          <motion.img
                            src={item.icon}
                            alt={item.name}
                            className="w-full h-full object-contain brightness-0 invert select-none opacity-60"
                            initial={{ opacity: 0.4, scale: 0.9 }}
                            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.0, 0.9] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 group-hover:text-white transition-colors">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MOBILE ICONS: Bottom Row */}
                <div className="absolute bottom-48 left-0 w-full flex justify-center gap-10 md:hidden z-20 px-4">
                  {items.map((item, i) => (
                    <div key={item.name} className="flex flex-col items-center gap-3 opacity-60">
                      <div className="w-[50px] h-[50px] relative flex items-center justify-center">
                        <motion.img
                          src={item.icon}
                          alt={item.name}
                          className="w-full h-full object-contain brightness-0 invert select-none"
                          initial={{ opacity: 0.4, scale: 0.9 }}
                          animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.0, 0.9] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* bottom mask to hide minor gap during viewport resizing */}
        <div className="absolute bottom-0 left-0 w-full h-12 pointer-events-none" style={{ background: 'linear-gradient(0deg, #111827, transparent)' }} />
      </motion.div>
    </section>
  );
};
