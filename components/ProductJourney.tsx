
import React, { useState } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { Droplets, Shield, Clock, RefreshCw, ShoppingBag, ChevronRight, ChevronLeft } from 'lucide-react';
import { INGREDIENTS } from '../constants';

interface ProductJourneyProps {
  isNight: boolean;
}

// --- Reusable Card Components ---

const IntroPanel: React.FC<{ title: string; subtitle: string; color: string; visual: React.ReactNode }> = ({ title, subtitle, color, visual }) => (
  <div className="h-screen w-screen flex flex-col items-center justify-center flex-shrink-0 relative overflow-hidden p-6">
    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
    <motion.h3 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-xl md:text-2xl font-medium tracking-[0.3em] uppercase text-white/80 mb-4 z-10"
    >
      Element of
    </motion.h3>
    <motion.h1 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="text-6xl md:text-9xl font-bold text-white mb-8 z-10 text-center"
    >
      {title}
    </motion.h1>
    <div className="z-10 mb-12 scale-125">
        {visual}
    </div>
    <p className="text-white text-xl italic font-medium z-10 max-w-md text-center">"{subtitle}"</p>
  </div>
);

const PhilosophyPanel: React.FC<{ text: string; subtext: string }> = ({ text, subtext }) => (
  <div className="h-screen w-screen flex flex-col items-center justify-center flex-shrink-0 p-12 text-center">
    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 max-w-4xl leading-tight">
      {text}
    </h2>
    <p className="text-lg md:text-2xl text-white/80 max-w-2xl leading-relaxed">
      {subtext}
    </p>
  </div>
);

const IngredientsPanel: React.FC<{ ingredients: typeof INGREDIENTS }> = ({ ingredients }) => (
  <div className="h-screen w-screen flex flex-col items-center justify-center flex-shrink-0 p-6 md:p-12">
    <h3 className="text-3xl md:text-5xl font-bold text-white mb-12">Key Components</h3>
    <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-5xl">
      {ingredients.map((ing, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl flex items-center gap-4 hover:bg-white/20 transition-colors">
          <div className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-xl flex-shrink-0">
            {ing.symbol}
          </div>
          <div>
            <h4 className="text-white font-bold text-lg md:text-xl">{ing.name}</h4>
            <p className="text-white/70 text-sm md:text-base">{ing.benefit}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UsagePanel: React.FC<{ usage: Array<{ icon: any; title: string; desc: string }> }> = ({ usage }) => (
  <div className="h-screen w-screen flex flex-col items-center justify-center flex-shrink-0 p-6 md:p-12">
    <h3 className="text-3xl md:text-5xl font-bold text-white mb-16">The Ritual</h3>
    <div className="flex flex-col md:flex-row gap-8 md:gap-16">
      {usage.map((u, i) => (
        <div key={i} className="flex flex-col items-center text-center max-w-xs">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white mb-6 backdrop-blur-md">
            <u.icon size={40} />
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">{u.title}</h4>
          <p className="text-white/80">{u.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const CTAPanel: React.FC<{ name: string; price: string }> = ({ name, price }) => (
  <div className="h-screen w-screen flex flex-col items-center justify-center flex-shrink-0">
    <h2 className="text-6xl md:text-9xl font-bold text-white/20 mb-8">{name}</h2>
    <div className="text-5xl font-bold text-white mb-12">{price}</div>
    <button className="bg-white text-black px-12 py-6 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-2xl flex items-center gap-4">
      <ShoppingBag />
      Add to Routine
    </button>
  </div>
);


// --- Element Section (Carousel) ---

const ElementSection: React.FC<{ 
    type: 'earth' | 'water'; 
    className?: string;
}> = ({ type, className }) => {
  const [index, setIndex] = useState(0);
  const totalPanels = 5;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && index < totalPanels - 1) {
      setIndex(index + 1);
    } else if (info.offset.x > threshold && index > 0) {
      setIndex(index - 1);
    }
  };

  // Data Assets
  const isEarth = type === 'earth';
  const bgColor = isEarth ? 'bg-brand-mesa' : 'bg-brand-crest';
  
  const EarthVisual = (
    <div className="w-48 h-48 bg-[#D48B5C] rounded-[3rem] relative shadow-2xl border-r-4 border-black/10 flex items-center justify-center overflow-hidden rotate-12 hover:rotate-0 transition-transform duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
        <div className="text-white/30 font-bold text-5xl -rotate-90 tracking-widest">MESA</div>
    </div>
  );

  const WaterVisual = (
     <div className="w-48 h-48 bg-brand-crest/80 rounded-full relative shadow-2xl border border-white/30 backdrop-blur-md flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"></div>
        <div className="text-white/50 font-bold text-4xl tracking-widest">CREST</div>
    </div>
  );

  const title = isEarth ? "MESA" : "CREST";
  const subtitle = isEarth ? "Ground your skin." : "Flow through chaos.";
  
  const philosophyText = isEarth 
    ? "We evolved in mud." 
    : "Water is memory.";
    
  const philosophySub = isEarth
    ? "Volcanic ash pulls the city out of your pores. It doesn't just clean; it resets your electromagnetic charge."
    : "Your skin is 64% water. The city dries it out. Crest puts it back, mimicking your biology to hydrate without weight.";

  const ingredients = isEarth 
    ? INGREDIENTS.filter(i => ['Ka', 'Zn', 'Mg'].includes(i.symbol))
    : INGREDIENTS.filter(i => ['Ha', 'Al', 'Te'].includes(i.symbol));

  const usage = isEarth
    ? [
        { icon: Clock, title: "Wash", desc: "2 Minutes. Daily detox for city grime." },
        { icon: RefreshCw, title: "Mask", desc: "10 Minutes. Deep reset twice a week." }
      ]
    : [
        { icon: Droplets, title: "Hydrate", desc: "Instant absorption. No grease." },
        { icon: Shield, title: "Protect", desc: "Antioxidant barrier against pollution." }
      ];

  return (
    <div className={`h-screen w-full overflow-hidden ${bgColor} ${className}`}>
      <motion.div 
        className="flex h-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
         {/* Panel 1: Intro */}
         <IntroPanel 
            title={isEarth ? "EARTH" : "WATER"} 
            subtitle={subtitle} 
            color={bgColor} 
            visual={isEarth ? EarthVisual : WaterVisual} 
        />

        {/* Panel 2: Philosophy */}
        <PhilosophyPanel text={philosophyText} subtext={philosophySub} />

        {/* Panel 3: Ingredients */}
        <IngredientsPanel ingredients={ingredients} />

        {/* Panel 4: Usage */}
        <UsagePanel usage={usage} />

        {/* Panel 5: CTA */}
        <CTAPanel name={title} price={isEarth ? "₹799" : "₹1299"} />
      </motion.div>

      {/* Pagination Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {Array.from({ length: totalPanels }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === i ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
      
      {/* Swipe Hint (Only visible on first slide) */}
      <AnimatePresence>
        {index === 0 && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-white/40 hidden md:flex flex-col items-center gap-2 pointer-events-none animate-pulse"
             >
                <ChevronRight size={32} />
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ProductJourney: React.FC<ProductJourneyProps> = ({ isNight }) => {
  return (
    <div id="product-journey" className="relative w-full">
        {/* 
            Earth Section
            Logic: sticky top-0 h-screen.
            Z-Index increased to 40 to cover fixed Manifesto content (z-30).
        */}
        <div className="sticky top-0 h-screen z-40">
            <ElementSection type="earth" />
        </div>
        
        {/* 
            Water Section
            Logic: sticky top-0 z-50 h-screen.
            Result: This section slides over Earth (due to being later in DOM) and then STICKS
            so that the NEXT section (PeriodicTable) will slide over IT.
            Added shadow for depth perception.
        */}
        <div className="sticky top-0 h-screen z-50 shadow-[0_-50px_50px_rgba(0,0,0,0.2)]">
            <ElementSection type="water" />
        </div>
    </div>
  );
};
