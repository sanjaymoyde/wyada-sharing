
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { ELEMENT_ICONS, LOGO_URL } from '../constants';

import { Product } from '../types';

interface ProductPageProps {
    productType: 'mesa' | 'crest';
    onClose: () => void;
    onAddToCart: () => void;
    isNight: boolean;
    productData?: Product | null;
}

export const ProductPage: React.FC<ProductPageProps> = ({ productType, onClose, onAddToCart, isNight, productData }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const isMesa = productType === 'mesa';

    // Brand Data
    const color = isMesa ? '#E89C6C' : '#5D9BCE'; // Mesa / Crest
    const bgColor = isMesa ? 'bg-brand-mesa' : 'bg-brand-crest';
    const icon = isMesa ? ELEMENT_ICONS.EARTH : ELEMENT_ICONS.WATER;
    const elementName = isMesa ? 'Earth' : 'Water';

    // Use real images from API if available, otherwise fallback to mock
    // CHANGE: Automatically replace .heic with .jpg in URL string for browser compatibility
    // Shopify usually supports format conversion via URL parameters, but replacing extension is a safe basic check
    const productImages = productData?.images?.length
        ? productData.images.map(img => {
            if (img.src.toLowerCase().includes('.heic')) {
                // Shopify CDN often supports format=jpg query param or replacing extension
                // Simple attempt: replace extension. If that fails, we might need to rely on Shopify's 'format' param.
                // Better approach with Shopify CDN: append `&format=jpg` if query string exists, or `?format=jpg`
                const urlObj = new URL(img.src);
                urlObj.searchParams.set('format', 'jpg');
                return urlObj.toString();
            }
            return img.src;
        })
        : [
            `https://picsum.photos/seed/${productType}1/600/800`,
            `https://picsum.photos/seed/${productType}2/600/800`,
            `https://picsum.photos/seed/${productType}3/600/800`,
        ];

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);

    const dynamicPrice = productData?.variants?.[0]?.price ? `₹${Number(productData.variants[0].price)}` : (isMesa ? '₹799' : '₹1299');
    // Keep HTML content for rich rendering
    const dynamicDescription = productData?.body_html || "";

    const product = isMesa ? {
        name: productData?.title || 'mesa',
        subtitle: 'cleansing mud',
        shortDesc: 'Ground your skin. Cleanse. Calm. Restore.',
        price: dynamicPrice,
        description: dynamicDescription || "A volcanic clay cleanser that pulls the city out of your pores. It doesn't just clean; it resets your electromagnetic charge, calming inflammation instantly.",
        story: "We evolved in mud. But modern life is sterile concrete. Mesa brings the earth back to your routine using Kaolin Clay and Zinc Oxide to detoxify without stripping.",
        ingredients: [
            { name: 'Kaolin Clay', role: 'Magnetic absorption' },
            { name: 'Zinc Oxide', role: 'Calms inflammation' },
            { name: 'Magnesium', role: 'Cell repair' },
            { name: 'Ayurvedic Base', role: 'Balancing' }
        ],
        ritual: [
            { title: 'Wash', time: '2 Mins', desc: 'Daily detox. Massage into damp skin.' },
            { title: 'Mask', time: '10 Mins', desc: 'Deep reset. Leave on until dry.' }
        ]
    } : {
        name: productData?.title || 'crest',
        subtitle: 'skin sorbet',
        shortDesc: 'Flow through chaos. Hydrate. Protect. Balance.',
        price: dynamicPrice,
        description: dynamicDescription || "A biomimetic gel moisturizer that mimics your biology to hydrate without weight. Green tea antioxidants provide an invisible shield against urban pollution.",
        story: "Your skin is 64% water. The city dries it out. Crest puts it back. It forms a breathable, invisible layer that keeps the bad out and the good in.",
        ingredients: [
            { name: 'Hyaluronic Acid', role: 'Deep hydration' },
            { name: 'Green Tea', role: 'Antioxidant shield' },
            { name: 'Aloe Vera', role: 'Instant cooling' },
            { name: 'Ceramides', role: 'Barrier builder' }
        ],
        ritual: [
            { title: 'Hydrate', time: 'Daily', desc: 'Apply morning & night after cleansing.' },
            { title: 'Protect', time: 'Layer', desc: 'Wear under SPF for city armor.' }
        ]
    };

    // Liquid Glass Style for Floating Footer
    const glassPanelClass = isNight
        ? 'bg-black/40 backdrop-blur-3xl border-white/10 text-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]'
        : 'bg-white/40 backdrop-blur-3xl border-white/40 text-brand-night shadow-[0_20px_60px_-10px_rgba(31,38,135,0.15)]';

    // Details Card Background
    const detailsBg = isNight ? 'bg-brand-night text-white' : 'bg-white text-brand-night';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`min-h-screen w-full relative flex flex-col ${isNight ? 'text-brand-lime' : 'text-black'}`}
            style={{ backgroundColor: isNight ? '#0a0a0a' : '#ffffff' }}
        >
            {/* HEADER - Logo Home Button */}
            <div className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-center items-center pointer-events-none">
                <button
                    onClick={onClose}
                    className="pointer-events-auto transition-transform hover:scale-105 active:scale-95"
                >
                    <img
                        src={LOGO_URL}
                        alt="way'da"
                        className={`h-8 w-auto object-contain select-none ${isNight ? 'filter-brand-lime' : 'filter brightness-0 invert'}`}
                        referrerPolicy="no-referrer"
                    />
                </button>
            </div>

            {/* MAIN SCROLL CONTAINER */}
            <div className="flex-1 w-full relative" ref={containerRef}>

                {/* HERO SECTION (Sticky) */}
                <div className={`sticky top-0 h-screen w-full ${bgColor} flex flex-col text-white overflow-hidden z-10`}>

                    {/* Top Right: Element Icon */}
                    <Link
                        to={isMesa ? '/mesa' : '/crest'}
                        className="absolute top-24 right-8 flex flex-col items-end gap-2 z-20 hover:scale-105 transition-transform cursor-pointer"
                    >
                        <div className="w-12 h-12 relative">
                            <img
                                src={icon}
                                alt={elementName}
                                className={`w-full h-full object-contain select-none ${isNight ? (isMesa ? 'filter-brand-mesa' : 'filter-brand-crest') : ''}`}
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">Element of {elementName}</span>
                    </Link>

                    {/* Center: Product Carousel */}
                    <div className="absolute inset-0 flex flex-col items-center justify-start md:justify-center z-10 pt-[12vh] md:pt-8 pb-32 px-8 pointer-events-none">
                        <div className="relative w-full max-w-[340px] md:w-[30vw] md:max-w-[400px] aspect-[3/4] pointer-events-auto">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIndex}
                                    src={productImages[currentImageIndex]}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full object-cover rounded-3xl"
                                />
                            </AnimatePresence>

                            {/* Controls */}
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-2 rounded-full hover:bg-black/40 text-white transition-colors scale-75"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-2 rounded-full hover:bg-black/40 text-white transition-colors scale-75"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Left: Info */}
                    <div className="absolute bottom-32 left-8 max-w-md z-20 text-left">
                        <h1 className="text-6xl font-bold mb-1 tracking-tighter">{product.name}</h1>
                        <p className="text-lg font-medium uppercase tracking-widest opacity-80 mb-4">{product.subtitle}</p>
                        <p className="text-base font-medium opacity-90 leading-relaxed max-w-xs">{product.shortDesc}</p>
                    </div>
                </div>

                {/* DETAILS CARD (Scrolls Over) */}
                {/* No margin needed; it naturally follows the sticky hero in DOM flow, starting at 100vh */}
                <div className={`relative z-20 w-full rounded-t-[3rem] -mt-12 pt-12 pb-32 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] ${detailsBg}`}>

                    {/* Drag Handle Visual */}
                    <div className="w-full flex justify-center mb-8">
                        <div className="w-12 h-1.5 bg-current opacity-10 rounded-full" />
                    </div>

                    <div className="max-w-4xl mx-auto px-6 flex flex-col gap-24">
                        {/* Description & Story */}
                        <div className="grid md:grid-cols-2 gap-12 items-start">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] opacity-50 mb-6">The Philosophy</h3>
                                <div
                                    className="text-2xl md:text-3xl font-bold leading-tight mb-6 [&>p]:mb-4 last:[&>p]:mb-0"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                            <div className="pt-8 border-t border-current/10 md:border-t-0 md:pt-0">
                                <p className="text-lg leading-relaxed opacity-80">
                                    {product.story}
                                </p>
                            </div>
                        </div>

                        {/* Ingredients Grid */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] opacity-50 mb-8 flex items-center gap-4">
                                <span className="h-px flex-1 bg-current opacity-20"></span>
                                Formulation
                                <span className="h-px flex-1 bg-current opacity-20"></span>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {product.ingredients.map((ing, i) => (
                                    <div key={i} className={`p-6 rounded-2xl border border-current/10 flex flex-col justify-between h-40 ${isNight ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                                        <div>
                                            <h4 className="font-bold text-lg leading-none mb-2">{ing.name}</h4>
                                            <p className="text-xs opacity-60 uppercase tracking-wider">{ing.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ritual */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] opacity-50 mb-8 flex items-center gap-4">
                                <span className="h-px flex-1 bg-current opacity-20"></span>
                                The Ritual
                                <span className="h-px flex-1 bg-current opacity-20"></span>
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {product.ritual.map((step, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 rounded-3xl border border-current/10">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg`} style={{ backgroundColor: color }}>
                                            {i === 0 ? <Clock size={24} /> : <RefreshCw size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl mb-1" style={{ color }}>{step.title}</h4>
                                            <span className="text-xs font-bold border border-current/20 px-2 py-0.5 rounded-md mb-2 inline-block opacity-60">{step.time}</span>
                                            <p className="text-sm opacity-80">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING FOOTER (Liquid Glass) */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className={`pointer-events-auto max-w-md w-[90%] md:w-auto min-w-[320px] flex items-center justify-between gap-8 px-6 py-3 rounded-full border ${glassPanelClass}`}
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{product.name}</span>
                        <span className="text-2xl font-bold">{product.price}</span>
                    </div>
                    <button
                        onClick={() => {
                            onAddToCart();
                            onClose();
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm md:text-base transition-transform hover:scale-105 shadow-lg"
                        style={{ backgroundColor: color }}
                    >
                        <ShoppingBag size={18} />
                        <span>Add to Cart</span>
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};
