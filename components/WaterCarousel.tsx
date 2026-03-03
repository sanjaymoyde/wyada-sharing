

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, PanInfo, AnimatePresence, MotionValue } from 'framer-motion';
import { ChevronRight, ChevronLeft, Waves, ShoppingBag, Eye, Sun, CloudSun, Moon, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { ELEMENT_ICONS } from '../constants';

import { Product } from '../types';

interface WaterCarouselProps {
    isNight: boolean;
    addToCart: () => void;
    onView: () => void;
    product?: Product | null;
    progress?: MotionValue<number>;
}

export const WaterCarousel: React.FC<WaterCarouselProps> = ({ isNight, addToCart, onView, product, progress }) => {
    const [index, setIndex] = useState(0);
    const [mode, setMode] = useState<'sunlight' | 'twilight' | 'midnight'>('sunlight');
    const productImageSrc = product?.images?.[0]?.src || '';
    const hasProductImage = productImageSrc.trim().length > 0;
    const [isProductImageReady, setIsProductImageReady] = useState(false);

    useEffect(() => {
        setIsProductImageReady(false);
        if (!hasProductImage) return;

        const img = new Image();
        img.onload = () => setIsProductImageReady(true);
        img.onerror = () => setIsProductImageReady(false);
        img.src = productImageSrc;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [hasProductImage, productImageSrc]);

    const totalSlides = 2;

    const navPrice = product?.variants?.[0]?.price ? Number(product.variants[0].price) : 1299;


    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 80;
        if (info.offset.x < -threshold && index < totalSlides - 1) {
            setIndex(index + 1);
        } else if (info.offset.x > threshold && index > 0) {
            setIndex(index - 1);
        }
    };

    const lastWheelTime = React.useRef(0);
    const accumulatedDeltaX = React.useRef(0);

    const handleWheel = (e: React.WheelEvent) => {
        const now = Date.now();

        // Cooldown period after a successful slide
        if (now - lastWheelTime.current < 600) {
            accumulatedDeltaX.current = 0;
            return;
        }

        // Allow mostly vertical scrolling to pass through smoothly
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX) + 5) {
            accumulatedDeltaX.current = 0;
            return;
        }

        // Accumulate horizontal deltas (trackpads send multiple small deltas)
        accumulatedDeltaX.current += e.deltaX;

        if (Math.abs(accumulatedDeltaX.current) > 40) {
            if (accumulatedDeltaX.current > 0) {
                if (index < totalSlides - 1) setIndex(index + 1);
            } else {
                if (index > 0) setIndex(index - 1);
            }
            accumulatedDeltaX.current = 0;
            lastWheelTime.current = now;
        }
    };

    const bgColor = isNight ? 'bg-black' : 'bg-brand-crest';
    const textColor = isNight ? 'text-brand-crest' : 'text-white';
    const mutedText = isNight ? 'text-brand-crest/60' : 'text-white/60';
    const cardBg = isNight ? 'bg-brand-crest/10 border-brand-crest/20' : 'bg-white/10 border-white/20';
    const btnBase = "flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-6 md:py-2 rounded-full transition-all hover:scale-105";
    const primaryBtn = isNight ? 'bg-brand-crest text-black' : 'bg-white text-brand-crest';
    const secondaryBtn = isNight ? 'bg-transparent border border-brand-crest text-brand-crest' : 'bg-transparent border border-white text-white';

    const getContent = (mode: string) => {
        switch (mode) {
            case 'sunlight': return { title: 'protect', sub: 'invisible armor', desc: 'A breathable triple-layer grid that locks UV, blue light and pollution out, without suffocating your pores.' };
            case 'twilight': return { title: 'balance', sub: 'barrier & biome reset', desc: 'Antioxidants, Barrier Builders, and Prebiotics repair the wall and reset your natural ecosystem.' };
            case 'midnight': return { title: 'hydrate', sub: 'the deep dive', desc: 'Smart liposomes shuttle moisture past the surface to feed the deep cells that need it most.' };
            default: return { title: '', sub: '', desc: '' };
        }
    };

    const modes = [
        { id: 'sunlight', label: 'SUNLIGHT ZONE', icon: Sun },
        { id: 'twilight', label: 'TWILIGHT ZONE', icon: CloudSun },
        { id: 'midnight', label: 'MIDNIGHT ZONE', icon: Moon }
    ];

    return (
        <section
            id="element-water"
            className="relative w-full snap-start snap-always z-[50]"
            style={{ height: 'calc(var(--app-vh) * 2)', marginTop: 'calc(var(--app-vh) * -1)' }}
        >
            <motion.div
                style={{ height: 'var(--app-vh)' }}
                className={`sticky top-0 w-full ${bgColor} overflow-hidden shadow-none transition-colors duration-700`}
            >
                {/* Inner Content Wrapper tied to stable svh */}
                <div className="w-full relative flex flex-col" style={{ height: 'var(--app-vh)' }}>
                    <div className="h-24 md:h-20 shrink-0" />

                    <div className="shrink-0 text-center px-6 md:px-12 pb-4 z-10">
                        <span className={`text-xs md:text-sm font-extrabold tracking-[0.3em] uppercase  ${textColor}`}>
                            Element of Water
                        </span>
                    </div>

                    <div className="flex-1 relative w-full overflow-hidden">
                        <motion.div
                            className="flex h-full w-full"
                            drag="x"
                            dragDirectionLock={false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.05}
                            onDragEnd={handleDragEnd}
                            onWheel={handleWheel}
                            animate={{ x: `-${index * 100}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{ touchAction: "pan-y", userSelect: 'none', WebkitUserSelect: 'none' }}
                        >
                            <Link
                                to="/product/crest"
                                className="w-full h-full flex-shrink-0 flex flex-col md:flex-row items-center justify-start md:justify-between gap-2 md:gap-0 px-2 md:px-6 pb-2 pt-0 md:pt-0 md:pl-12 md:pr-12 relative cursor-pointer"
                            >
                                {/* Icon Container - Desktop: Right (Order 2) */}
                                <div className="w-full md:w-1/2 shrink-0 flex items-center justify-center min-h-0 order-1 md:order-2">
                                    <div className="relative h-[40vh] md:h-[70vh] w-auto aspect-square flex items-center justify-center p-4">
                                        {hasProductImage && (
                                            <img
                                                src={productImageSrc}
                                                alt="Crest Product"
                                                className={`w-full h-full object-contain select-none transition-opacity duration-300 ${isProductImageReady ? 'opacity-100' : 'opacity-0'}`}
                                                referrerPolicy="no-referrer"
                                                draggable="false"
                                            />
                                        )}
                                        {!isProductImageReady && (
                                            <div className={`absolute inset-0 m-auto w-[42%] h-[42%] rounded-3xl border flex items-center justify-center ${isNight ? 'border-brand-crest/40 bg-brand-crest/10' : 'border-white/40 bg-white/20'} animate-pulse`}>
                                                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] ${textColor}`}>crest</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Text Container - Desktop: Left (Order 1) */}
                                <div
                                    className="w-full md:w-1/2 shrink-0 flex flex-col items-start z-10 gap-1 order-2 md:order-1 -mt-4 md:mt-0 cursor-default"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                >
                                    <h2 className={`text-4xl md:text-6xl font-bold leading-none ${textColor}`}>{product?.title || 'crest'}</h2>
                                    <h3 className={`text-lg md:text-2xl font-medium opacity-80 ${textColor} mb-2 md:mb-4`}>skin sorbet</h3>
                                    <p className={`text-sm md:text-xl font-medium leading-relaxed max-w-lg italic ${textColor} line-clamp-2 md:line-clamp-none`}>
                                        {product?.body_html ? product.body_html.replace(/<[^>]*>/g, '') : "Flow through chaos. Hydrate. Protect. Balance."}
                                    </p>
                                </div>
                            </Link>

                            <div className="w-full h-full flex-shrink-0 flex flex-col items-start justify-between p-6 md:pl-12 pb-4 relative">
                                {/* Modes - Left (Swapped) work on every level section */}
                                <div className="flex-1 w-full flex items-start pt-4 md:pt-0 justify-start min-h-0 md:absolute md:left-[8%] md:top-[16%] md:-translate-y-1/2 md:w-auto md:justify-start z-20">
                                    <div className="relative flex flex-col items-start justify-center py-4 w-full md:w-auto">
                                        <div className={`text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-60 mb-6 ${textColor}`}>Works on every level</div>
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
                                                                <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${isNight ? 'bg-brand-crest/30' : 'bg-white/30'} ${isActive ? 'opacity-0' : 'opacity-100 group-hover:bg-current'}`} />
                                                                {isActive && (
                                                                    <motion.div
                                                                        layoutId="active-indicator-water"
                                                                        className="absolute inset-0 flex items-center justify-center"
                                                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                                    >
                                                                        <img src={ELEMENT_ICONS.ORIGIN} alt="Active" className={`w-full h-full object-contain ${isNight ? 'filter-brand-crest' : ''}`} />
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                            <span className={`text-[10px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? `${textColor} scale-105 origin-left` : mutedText}`}>{t.label}</span>
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
                                    <div
                                        className="flex-1 flex flex-col items-center text-right self-center md:self-center pb-12 md:pb-0 translate-y-32 md:translate-y-0 px-6 md:px-0 md:-translate-x-36 pointer-events-auto cursor-default"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={mode}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="flex flex-col items-end gap-2 md:gap-4"
                                            >
                                                <h2 className={`text-4xl md:text-6xl font-bold leading-none ${textColor}`}>{getContent(mode).title}</h2>
                                                <h3 className={`text-lg md:text-2xl font-medium ${textColor} mb-2 md:mb-6 whitespace-nowrap`}>{getContent(mode).sub.replace('armor', 'armour')}</h3>
                                                <p className={`text-sm md:text-lg font-medium leading-relaxed ${textColor} w-full md:max-w-xl ml-auto`}>
                                                    {getContent(mode).desc}
                                                </p>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Product Image - Sits on Right */}
                                    <div className="hidden md:!flex relative h-[25vh] md:h-[45vh] w-auto aspect-square flex-shrink-0 items-center justify-center p-4 -translate-y-24 md:-translate-y-20 mr-4 md:mr-10 md:-translate-x-[100px]">
                                        <img
                                            src={ELEMENT_ICONS.WATER}
                                            alt="Crest Logo"
                                            className={`w-full h-full object-contain select-none ${isNight ? 'filter-brand-crest' : ''}`}
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                </div>
                            </div>


                        </motion.div>
                    </div>

                    {/* Bottom Actions - Price, Nav, Buttons */}
                    <div className="absolute bottom-32 md:bottom-36 left-0 w-full px-6 max-[390px]:px-3 md:px-12 z-40 pointer-events-none">
                        <div className="flex justify-between items-center w-full h-full relative max-[430px]:gap-1 max-[390px]:gap-2">
                            {/* Price - Left */}
                            <div
                                className={`text-xl md:text-4xl font-bold ${textColor} drop-shadow-md pointer-events-auto cursor-default`}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            >
                                ₹{navPrice}
                            </div>

                            {/* Navigation - Center */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 max-[430px]:gap-1 w-auto pointer-events-none md:pointer-events-auto max-[430px]:w-[40%] max-[390px]:w-[44%]">
                                <button
                                    onClick={() => setIndex(index === 0 ? 1 : 0)}
                                    className={`flex items-center justify-center gap-1 max-[430px]:gap-0.5 max-[390px]:gap-0.5 text-[9px] max-[430px]:text-[6px] max-[390px]:text-[7px] md:text-xs font-bold uppercase tracking-widest max-[430px]:tracking-[0.04em] max-[390px]:tracking-[0.06em] md:tracking-[0.2em] ${textColor} drop-shadow-md transition-opacity duration-300 opacity-60 cursor-pointer pointer-events-auto mb-0 max-[430px]:w-full max-[390px]:w-full`}
                                >
                                    <div className="w-8 max-[430px]:w-3 max-[390px]:w-3.5 flex justify-center">
                                        {index !== 0 && (
                                            <motion.div
                                                animate={{ x: [0, -4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <ChevronsLeft size={20} strokeWidth={2} className="max-[430px]:w-3 max-[430px]:h-3 max-[390px]:w-3.5 max-[390px]:h-3.5" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <span className="whitespace-nowrap">Swipe to know more</span>
                                    <div className="w-8 max-[430px]:w-3 max-[390px]:w-3.5 flex justify-center">
                                        {index === 0 && (
                                            <motion.div
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <ChevronsRight size={20} strokeWidth={2} className="max-[430px]:w-3 max-[430px]:h-3 max-[390px]:w-3.5 max-[390px]:h-3.5" />
                                            </motion.div>
                                        )}
                                    </div>
                                </button>

                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-max mt-2 max-[430px]:mt-1.5 flex justify-center items-center gap-4 max-[430px]:gap-1.5 max-[390px]:gap-2 pointer-events-auto">
                                    <button onClick={() => index > 0 && setIndex(index - 1)} disabled={index === 0} className={`transition-opacity p-2 max-[430px]:p-1 max-[390px]:p-1 ${index === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${textColor}`}>
                                        <ChevronLeft size={16} className="max-[430px]:w-3 max-[430px]:h-3 max-[390px]:w-3.5 max-[390px]:h-3.5" />
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: totalSlides }).map((_, i) => (
                                            <div key={i} className={`rounded-full transition-all duration-300 ${index === i ? `w-2 h-2 ${isNight ? 'bg-brand-crest' : 'bg-white'}` : `w-2 h-2 ${isNight ? 'bg-brand-crest/30' : 'bg-white/30'}`}`} />
                                        ))}
                                    </div>
                                    <button onClick={() => index < totalSlides - 1 && setIndex(index + 1)} disabled={index === totalSlides - 1} className={`transition-opacity p-2 max-[430px]:p-1 max-[390px]:p-1 ${index === totalSlides - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${textColor}`}>
                                        <ChevronRight size={16} className="max-[430px]:w-3 max-[430px]:h-3 max-[390px]:w-3.5 max-[390px]:h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Buttons - Right */}
                            <div className="flex justify-end gap-3 max-[430px]:gap-1.5 max-[390px]:gap-2 md:gap-4 z-40 pointer-events-auto mr-1 max-[430px]:mr-0 max-[390px]:mr-0 md:mr-32 md:-translate-x-[96px]">
                                <button
                                    onClick={onView}
                                    className={`w-10 h-10 max-[430px]:w-9 max-[430px]:h-9 md:!w-auto md:!h-auto p-0 md:!px-6 md:!py-2 rounded-full border flex items-center justify-center md:gap-2 transition-transform hover:scale-105 ${secondaryBtn}`}
                                >
                                    <Eye size={16} className="max-[430px]:w-3.5 max-[430px]:h-3.5" />
                                    <span className="hidden md:!block text-sm font-bold uppercase tracking-wider">View</span>
                                </button>
                                <button
                                    onClick={addToCart}
                                    className={`w-10 h-10 max-[430px]:w-9 max-[430px]:h-9 md:!w-auto md:!h-auto p-0 md:!px-6 md:!py-2 rounded-full flex items-center justify-center md:gap-2 transition-transform hover:scale-105 shadow-lg ${primaryBtn}`}
                                >
                                    <ShoppingBag size={16} className="max-[430px]:w-3.5 max-[430px]:h-3.5" />
                                    <span className="hidden md:!block text-sm font-bold uppercase tracking-wider">Add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-20 shrink-0" />
                    <div className="h-20 shrink-0" />
                </div>
            </motion.div>
        </section >
    );
};
