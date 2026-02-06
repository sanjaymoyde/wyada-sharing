
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { INGREDIENTS } from '../constants';
import { Ingredient } from '../types';

interface PeriodicTableProps {
    isNight: boolean;
}

export const PeriodicTable: React.FC<PeriodicTableProps> = ({ isNight }) => {
  const [hoveredElement, setHoveredElement] = useState<Ingredient | null>(null);

  const borderColor = isNight ? 'border-brand-lime' : 'border-white';
  const textColor = isNight ? 'text-brand-lime' : 'text-white';
  const hoverBg = isNight ? 'bg-brand-lime text-black' : 'bg-white text-brand-lime';
  // Dynamic background needed to cover sticky sections below (like Water)
  const bgColor = isNight ? 'bg-brand-night' : 'bg-brand-lime';

  return (
    <section className={`py-24 px-4 w-full flex flex-col items-center justify-center relative z-60 transition-colors duration-700 ${bgColor} shadow-[0_-50px_50px_rgba(0,0,0,0.1)]`}>
      <h2 className={`text-4xl font-bold mb-16 text-center ${textColor}`}>Elemental Transparency</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
        {INGREDIENTS.map((el) => (
          <motion.div
            key={el.symbol}
            className={`relative aspect-square border ${borderColor} p-4 cursor-pointer transition-all duration-300 group overflow-hidden`}
            onMouseEnter={() => setHoveredElement(el)}
            onMouseLeave={() => setHoveredElement(null)}
            whileHover={{ scale: 1.05 }}
          >
            {/* Default View */}
            <div className="flex flex-col justify-between h-full transition-opacity duration-300 group-hover:opacity-0">
                <span className={`text-xs font-mono ${textColor} opacity-60`}>{el.number}</span>
                <div className={`text-5xl font-bold ${textColor}`}>{el.symbol}</div>
                <div className={`text-sm ${textColor}`}>{el.name}</div>
            </div>

            {/* Hover Overlay */}
            <div className={`absolute inset-0 p-4 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${hoverBg}`}>
                <h4 className="font-bold text-lg mb-2">{el.name}</h4>
                <p className="text-sm leading-tight">{el.benefit}</p>
                <span className="mt-3 text-[10px] uppercase tracking-widest border border-current px-2 py-1 rounded-full">{el.category}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
