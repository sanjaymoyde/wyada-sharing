


import React, { useState } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Mountain, ShoppingBag, Eye, Sparkles, Layers, ArrowRight, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { ELEMENT_ICONS } from '../constants';

import { Product } from '../types';

interface EarthCarouselProps {
    isNight: boolean;
    addToCart: () => void;
    onView: () => void;
    product?: Product | null;
}

export const EarthCarousel: React.FC<EarthCarouselProps> = ({ isNight, addToCart, onView, product }) => {
    const [index, setIndex] = useState(0);
    const [mode, setMode] = useState<'cleanser' | 'mask'>('cleanser');
    const totalSlides = 2;

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Increased threshold to preventing accidental swipes while scrolling vertically
        const threshold = 80;
        if (info.offset.x < -threshold && index < totalSlides - 1) {
            setIndex(index + 1);
        } else if (info.offset.x > threshold && index > 0) {
            setIndex(index - 1);
        }
    };

    const bgColor = isNight ? 'bg-black' : 'bg-brand-mesa';
    const textColor = isNight ? 'text-brand-mesa' : 'text-white';
    const mutedText = isNight ? 'text-brand-mesa/60' : 'text-white/60';
    const cardBg = isNight ? 'bg-brand-mesa/10 border-brand-mesa/20' : 'bg-white/10 border-white/20';
    const btnBase = "flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-6 md:py-2 rounded-full transition-all hover:scale-105";
    const primaryBtn = isNight ? 'bg-brand-mesa text-black' : 'bg-white text-brand-mesa';
    const secondaryBtn = isNight ? 'bg-transparent border border-brand-mesa text-brand-mesa' : 'bg-transparent border border-white text-white';

    const modes = [
        { id: 'cleanser', label: 'CLEANSER (2 Mins)', icon: Sparkles },
        { id: 'mask', label: 'MASK (10 Mins)', icon: Layers }
    ];

    return (
        <section
            id="element-earth"
            className="relative h-[200vh] w-full -mt-[calc(100vh+1px)] snap-start snap-always z-[40]"
        >
            <div className={`sticky top-0 h-[100dvh] w-full ${bgColor} overflow-hidden shadow-[0_-50px_50px_rgba(0,0,0,0.3)] transition-colors duration-700 flex flex-col`}>
                <div className="h-24 md:h-20 shrink-0" />

                <div className="shrink-0 text-center px-6 md:px-12 pb-4 z-10">
                    <span className={`text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-60 ${textColor}`}>
                        Element of Earth
                    </span>
                </div>



                <div className="flex-1 relative w-full overflow-hidden">
                    <motion.div
                        className="flex h-full w-full"
                        drag="x"
                        dragDirectionLock={true}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.05}
                        onDragEnd={handleDragEnd}
                        animate={{ x: `-${index * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ touchAction: "pan-y" }}
                    >
                        <div className="w-full h-full flex-shrink-0 flex flex-col md:flex-row items-center justify-start md:justify-between gap-2 md:gap-0 px-2 md:px-6 pb-2 pt-0 md:pt-0 md:pl-12 md:pr-12 relative">
                            {/* Icon Container - Desktop: Right (Order 2) */}
                            <div className="w-full md:w-1/2 shrink-0 flex items-center justify-center min-h-0 order-1 md:order-2">
                                <div className="relative h-[40vh] md:h-[70vh] w-auto aspect-square flex items-center justify-center p-4">
                                    <img
                                        src={product?.images?.[0]?.src || ELEMENT_ICONS.EARTH}
                                        alt="Mesa Product"
                                        className={`w-full h-full object-contain select-none ${(!product?.images?.[0] && isNight) ? 'filter-brand-mesa' : ''}`}
                                        referrerPolicy="no-referrer"
                                    />
                                    <Mountain size={128} strokeWidth={0.8} className={`hidden w-full h-full ${textColor}`} />
                                </div>
                            </div>
                            {/* Text Container - Desktop: Left (Order 1) */}
                            <div className="w-full md:w-1/2 shrink-0 flex flex-col items-start z-10 gap-1 order-2 md:order-1 -mt-4 md:mt-0">
                                <h2 className={`text-4xl md:text-6xl font-bold leading-none ${textColor}`}>{product?.title || 'mesa'}</h2>
                                <h3 className={`text-lg md:text-2xl font-medium opacity-80 ${textColor} mb-2 md:mb-4`}>cleansing mud</h3>
                                <p className={`text-sm md:text-xl font-medium leading-relaxed max-w-lg italic ${textColor} md:line-clamp-none`}>
                                    {product?.body_html ? product.body_html.replace(/<[^>]*>/g, '') : "Ground your skin. Cleanse. Calm. Restore."}
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-full flex-shrink-0 flex flex-col items-start justify-between p-6 md:pl-12 pb-4 relative">
                            {/* Modes - Left (Mirrored from WaterCarousel) */}
                            <div className="flex-1 w-full flex items-start pt-20 md:pt-0 justify-start min-h-0 md:absolute md:left-[8%] md:top-[16%] md:-translate-y-1/2 md:w-auto md:justify-start z-20">
                                <div className="relative flex flex-col items-start justify-center py-4 w-full md:w-auto">
                                    <div className={`text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-60 mb-6 ${textColor}`}>Adapts to your rhythm</div>
                                    <div className="pl-[7.5%] border-l border-white/10 relative">
                                        <div className="flex flex-col gap-6">
                                            {modes.map((t) => {
                                                const isActive = mode === t.id;
                                                return (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setMode(t.id as any)}
                                                        className="group flex items-center gap-4 relative z-10"
                                                    >
                                                        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                                                            <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${isNight ? 'bg-brand-mesa/30' : 'bg-white/30'} ${isActive ? 'opacity-0' : 'opacity-100 group-hover:bg-current'}`} />
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="active-indicator-earth"
                                                                    className="absolute inset-0 flex items-center justify-center"
                                                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                                >
                                                                    <img src={ELEMENT_ICONS.ORIGIN} alt="Active" className={`w-full h-full object-contain ${isNight ? 'filter-brand-mesa' : ''}`} />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? `${textColor} scale-105 origin-left` : mutedText}`}>{t.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section: Flex Row of [Text] + [Image] */}
                            <div className="absolute right-0 top-0 w-full md:w-[90%] h-full flex flex-row items-center justify-end gap-2 md:gap-12 md:pr-12 pointer-events-none z-10">

                                {/* Text Content - Pushed Left by Image */}
                                <div className="flex-1 flex flex-col items-center text-right self-center md:self-center pb-12 md:pb-0 translate-y-4 md:translate-y-0 px-6 md:px-0 md:-translate-x-36">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={mode}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex flex-col items-end gap-2 md:gap-4"
                                        >
                                            <h2 className={`text-4xl md:text-6xl font-bold leading-none ${textColor}`}>{mode === 'cleanser' ? 'cleanse' : 'restore'}</h2>
                                            <h3 className={`text-lg md:text-2xl font-medium ${textColor} mb-2 md:mb-6 whitespace-nowrap`}>{mode === 'cleanser' ? 'the daily wash' : 'the deep reset'}</h3>
                                            <p className={`text-sm md:text-lg font-medium leading-relaxed ${textColor} w-full md:max-w-xl ml-auto`}>
                                                {mode === 'cleanser' ? "Transforms from mud to milk to melt away makeup and city grime without stripping your natural barrier." : "Draws out impurities, while Aloe and Ayurvedic Botanicals calm inflammation and restore natural balance."}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Product Image - Sits on Right */}
                                <div className="hidden md:!flex relative h-[25vh] md:h-[45vh] w-auto aspect-square flex-shrink-0 items-center justify-center p-4 -translate-y-24 md:-translate-y-20 mr-4 md:mr-10 md:-translate-x-[100px]">
                                    <img
                                        src={ELEMENT_ICONS.EARTH}
                                        alt="Mesa Logo"
                                        className={`w-full h-full object-contain select-none ${isNight ? 'filter-brand-mesa' : ''}`}
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                            </div>
                        </div>


                    </motion.div>
                </div>

                {/* Bottom Actions - Price, Nav, Buttons (Mirrored from WaterCarousel) */}
                <div className="absolute bottom-32 md:bottom-36 left-0 w-full px-6 md:px-12 z-40 pointer-events-none">
                    <div className="flex justify-between items-center w-full h-full relative">
                        {/* Price - Left */}
                        <div className={`text-xl md:text-4xl font-bold ${textColor} drop-shadow-md`}>₹{product?.variants[0]?.price ? Number(product.variants[0].price) : 799}</div>

                        {/* Navigation - Center */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 w-auto pointer-events-none md:pointer-events-auto">
                            <button
                                onClick={() => setIndex(index === 0 ? 1 : 0)}
                                className={`flex items-center justify-center gap-2 text-[9px] md:text-xs font-bold uppercase tracking-widest md:tracking-[0.2em] ${textColor} drop-shadow-md transition-opacity duration-300 opacity-60 cursor-pointer pointer-events-auto mb-0`}
                            >
                                {index === 0 ? (
                                    <>
                                        <span>Swipe to know more</span>
                                        <motion.div
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <ChevronsRight size={20} strokeWidth={2} />
                                        </motion.div>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            animate={{ x: [0, -4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <ChevronsLeft size={20} strokeWidth={2} />
                                        </motion.div>
                                        <span>Swipe to know more</span>
                                    </>
                                )}
                            </button>

                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-max mt-2 flex justify-center items-center gap-4 pointer-events-auto">
                                <button onClick={() => index > 0 && setIndex(index - 1)} disabled={index === 0} className={`transition-opacity p-2 ${index === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${textColor}`}>
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="flex gap-2">
                                    {Array.from({ length: totalSlides }).map((_, i) => (
                                        <div key={i} className={`rounded-full transition-all duration-300 ${index === i ? `w-2 h-2 ${isNight ? 'bg-brand-mesa' : 'bg-white'}` : `w-2 h-2 ${isNight ? 'bg-brand-mesa/30' : 'bg-white/30'}`}`} />
                                    ))}
                                </div>
                                <button onClick={() => index < totalSlides - 1 && setIndex(index + 1)} disabled={index === totalSlides - 1} className={`transition-opacity p-2 ${index === totalSlides - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${textColor}`}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Buttons - Right */}
                        <div className="flex justify-end gap-3 md:gap-4 z-40 pointer-events-auto mr-4 md:mr-32 md:-translate-x-[96px]">
                            <button
                                onClick={onView}
                                className={`w-10 h-10 md:!w-auto md:!h-auto p-0 md:!px-6 md:!py-2 rounded-full border flex items-center justify-center md:gap-2 transition-transform hover:scale-105 ${secondaryBtn}`}
                            >
                                <Eye size={16} />
                                <span className="hidden md:!block text-sm font-bold uppercase tracking-wider">View</span>
                            </button>
                            <button
                                onClick={addToCart}
                                className={`w-10 h-10 md:!w-auto md:!h-auto p-0 md:!px-6 md:!py-2 rounded-full flex items-center justify-center md:gap-2 transition-transform hover:scale-105 shadow-lg ${primaryBtn}`}
                            >
                                <ShoppingBag size={16} />
                                <span className="hidden md:!block text-sm font-bold uppercase tracking-wider">Add</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-20 shrink-0" />

                <div className="h-20 shrink-0" />
            </div>
        </section>
    );
};
