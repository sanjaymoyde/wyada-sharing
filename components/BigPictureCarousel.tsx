
import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { BLOG_POSTS } from '../constants';

interface BigPictureCarouselProps {
  isNight: boolean;
}

export const BigPictureCarousel: React.FC<BigPictureCarouselProps> = ({ isNight }) => {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const totalSlides = BLOG_POSTS.length;

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && index < totalSlides - 1) {
      setIndex(index + 1);
    } else if (info.offset.x > threshold && index > 0) {
      setIndex(index - 1);
    }
  };

  const bgColor = isNight ? 'bg-black' : 'bg-[#dcdcdc]';
  const textColor = isNight ? 'text-white' : 'text-black';
  const cardBg = isNight ? 'bg-white/10 border-white/10' : 'bg-black border-none';

  return (
    <section
      id="element-bigpicture"
      className="relative h-[200vh] w-full -mt-[calc(100vh+1px)] snap-start snap-always z-[80]"
    >
      <div className={`sticky top-0 h-[100dvh] w-full ${bgColor} overflow-hidden shadow-[0_-50px_50px_rgba(0,0,0,0.3)] transition-colors duration-700 flex flex-col-reverse md:flex-col`}>

        {/* TOP: CAROUSEL */}
        <div className="w-full md:max-w-[calc(100%-6rem)] h-[65vh] relative flex flex-col justify-start -mt-20 md:mt-0 md:pt-14 overflow-hidden pl-4 ">
          <div className="w-full overflow-visible flex items-center justify-start">
            <motion.div
              className="flex"
              drag="x"
              dragDirectionLock={true}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              animate={{
                x: `${isMobile
                  ? -(Math.min(index, totalSlides - 1) * 85)
                  : -(Math.min(index, totalSlides - 2) * 38)}vw`
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ touchAction: "pan-y" }}
            >
              {BLOG_POSTS.map((post, i) => (
                <div key={post.id} className="w-[85vw] md:w-[38vw] flex-shrink-0 flex items-center justify-center p-2">
                  <div className={`relative w-full h-[48vh] md:h-[38vh] rounded-[2rem] overflow-hidden border flex flex-col group ${cardBg}`}>
                    {/* Image Container - Full Card */}
                    <div className="w-full h-full relative overflow-hidden shrink-0">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                      <div className="absolute top-6 left-6">
                        <span className="bg-white/90 text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                          {post.category}
                        </span>
                      </div>
                      {/* Text Overlay for content since layout is simplified */}
                      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                        <h3 className="text-xl md:text-2xl font-bold leading-tight mb-1">{post.title}</h3>
                        <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mt-2 border-b border-white/30 hover:border-white pb-0.5 w-max">
                          Read Article <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="w-full flex justify-center items-center gap-4 z-30 ">
            <button onClick={() => index > 0 && setIndex(index - 1)} disabled={index === 0} className={`transition-opacity p-2 ${index === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${textColor}`}>
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-300 ${index === i ? `w-2 h-2 ${isNight ? 'bg-white' : 'bg-black'}` : `w-2 h-2 ${isNight ? 'bg-white/30' : 'bg-black/20'}`}`} />
              ))}
            </div>
            <button onClick={() => index < totalSlides - 1 && setIndex(index + 1)} disabled={index === totalSlides - 1} className={`transition-opacity p-2 ${index === totalSlides - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${textColor}`}>
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Vertical Divider / Shadow Overlay - Simulating 'coming from right' panel */}
          <div className="hidden md:block absolute right-0 top-0 h-full w-[2px] bg-black/30 z-40" style={{ boxShadow: '-15px 0 30px rgba(0,0,0,0.3)' }}></div>
        </div>

        {/* COMMUNITY STORIES Label - Mobile Only - Above Menu */}
        <div className="md:hidden absolute bottom-20 left-0 right-0 w-full px-4 py-2 flex items-center justify-center gap-2 z-50 pointer-events-none pb-2">
          <Users size={14} className="text-gray-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Community Stories</span>
        </div>

        {/* BOTTOM: TEXT */}
        <div className="shrink-0 w-full h-[41vh] text-left pl-4 pr-16 md:px-16 z-10 flex flex-col items-start justify-start pt-24 md:pt-4 relative">
          <p className={`text-sm md:text-xl leading-relaxed ${textColor} max-w-2xl mb-2`}>
            Urban wellness is bigger than a product and a brand. So join us, as we take a step back to look at the...
          </p>
          <h2 className={`text-4xl md:text-7xl font-black tracking-tight ${textColor} leading-none`}>big picture.</h2>
        </div>

      </div>
    </section>
  );
};
