
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronUp, ShoppingBag, Sun, Moon, X, Trash2, BookOpen, Beaker, Users, Map, Plus, Minus } from 'lucide-react';
import { ThemeProps, CartItem } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';

interface FloatingBarProps extends ThemeProps {
    cartCount?: number;
    cartItems: CartItem[];
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
    onRemoveItem: (id: string) => void;
    addToCart: (product: { id: string; variantId: number; name: string; price: number; color: string }) => void;
    onViewProduct: (type: 'mesa' | 'crest') => void;
    earthProduct?: any; // strict type comes from import but any is easier for now to avoid circular deps if types not exported perfectly
    waterProduct?: any;
    updateCartQuantity: (id: string, quantity: number) => void;
}

export const FloatingBar: React.FC<FloatingBarProps> = ({
    isNight,
    toggleTheme,
    cartCount = 0,
    cartItems,
    isCartOpen,
    setIsCartOpen,
    isMenuOpen,
    setIsMenuOpen,
    onRemoveItem,
    addToCart,
    onViewProduct,
    earthProduct,
    waterProduct,
    updateCartQuantity
}) => {
    const mesaPrice = earthProduct?.variants?.[0]?.price ? Number(earthProduct.variants[0].price) : 799;
    const crestPrice = waterProduct?.variants?.[0]?.price ? Number(waterProduct.variants[0].price) : 1299;
    const pairPrice = (mesaPrice + crestPrice) - 299; // Keeping similar discount ratio
    const pairOriginalPrice = mesaPrice + crestPrice;

    // Local state for Tabs
    const [activeTab, setActiveTab] = useState<'tools' | 'knowledge'>('tools');
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const cartButtonRef = useRef<HTMLButtonElement>(null);

    useClickOutside(menuRef, () => setIsMenuOpen(false), menuButtonRef);
    useClickOutside(cartRef, () => setIsCartOpen(false), cartButtonRef);

    // Grouping Logic: Automatically group mesa (799) and crest (1299) into "the pair" (1799)
    const groupedItems = useMemo(() => {
        const mesaItem = cartItems.find(i => i.id === 'mesa');
        const crestItem = cartItems.find(i => i.id === 'crest');

        const mesaQty = mesaItem?.quantity || 0;
        const crestQty = crestItem?.quantity || 0;
        const bundleCount = Math.min(mesaQty, crestQty);

        const items: any[] = [];

        // Add Bundled Pairs
        if (bundleCount > 0) {
            items.push({
                id: 'bundle-pair',
                name: 'the pair',
                price: pairPrice,
                quantity: bundleCount,
                color: 'linear-gradient(to right, #E89C6C, #5D9BCE)',
                isBundle: true
            });
        }

        // Add Excess Mesa
        if (mesaQty > bundleCount) {
            items.push({
                ...mesaItem!,
                quantity: mesaQty - bundleCount
            });
        }

        // Add Excess Crest
        if (crestQty > bundleCount) {
            items.push({
                ...crestItem!,
                quantity: crestQty - bundleCount
            });
        }

        // Add everything else
        cartItems.forEach(item => {
            if (item.id !== 'mesa' && item.id !== 'crest') {
                items.push(item);
            }
        });

        return items;
    }, [cartItems]);

    const finalTotal = useMemo(() => {
        return groupedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [groupedItems]);

    const glassPanelClass = isNight
        ? 'bg-black/40 backdrop-blur-3xl border-white/10 text-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]'
        : 'bg-white/40 backdrop-blur-3xl border-white/40 text-brand-night shadow-[0_20px_60px_-10px_rgba(31,38,135,0.15)]';

    const pillClass = isNight
        ? 'bg-gray-900/40 border-white/10 text-brand-lime shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)]'
        : 'bg-white/30 border-white/40 text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]';

    const buttonHoverClass = isNight ? 'hover:bg-white/10' : 'hover:bg-white/20';

    const toggleMenu = () => {
        if (isMenuOpen) setIsMenuOpen(false);
        else { setIsMenuOpen(true); setIsCartOpen(false); }
    };

    const toggleCart = () => {
        if (isCartOpen) setIsCartOpen(false);
        else { setIsCartOpen(true); setIsMenuOpen(false); }
    };

    const handleAddBundle = () => {
        addToCart({
            id: 'mesa',
            variantId: earthProduct?.variants?.[0]?.id || 0,
            name: 'mesa',
            price: mesaPrice,
            color: '#E89C6C'
        });
        addToCart({
            id: 'crest',
            variantId: waterProduct?.variants?.[0]?.id || 0,
            name: 'crest',
            price: crestPrice,
            color: '#5D9BCE'
        });
    };

    const handleScrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    const handleRemove = (id: string) => {
        if (id === 'bundle-pair') {
            // Removes the underlying individual products
            onRemoveItem('mesa');
            onRemoveItem('crest');
        } else {
            onRemoveItem(id);
        }
    };

    const handleUpdateQty = (id: string, newQty: number) => {
        if (newQty < 1) return; // Prevent going below 1 (use remove for that)

        if (id === 'bundle-pair') {
            const currentMesa = cartItems.find(i => i.id === 'mesa')?.quantity || 0;
            const currentCrest = cartItems.find(i => i.id === 'crest')?.quantity || 0;
            const delta = newQty - (Math.min(currentMesa, currentCrest)); // Difference from current bundle count

            // Apply delta to both
            updateCartQuantity('mesa', currentMesa + delta);
            updateCartQuantity('crest', currentCrest + delta);
        } else {
            // FIX: If we are updating an individual item (Mesa/Crest) and a bundle exists, 
            // the 'newQty' corresponds only to the "Excess" amount shown in the UI.
            // We must add the hidden 'bundleCount' to this to set the correct TOTAL quantity.

            const mesaQty = cartItems.find(i => i.id === 'mesa')?.quantity || 0;
            const crestQty = cartItems.find(i => i.id === 'crest')?.quantity || 0;
            const bundleCount = Math.min(mesaQty, crestQty);

            if ((id === 'mesa' || id === 'crest') && bundleCount > 0) {
                updateCartQuantity(id, newQty + bundleCount);
            } else {
                updateCartQuantity(id, newQty);
            }
        }
    };

    const handleCheckout = async () => {
        setIsCheckoutLoading(true);

        const isMobile = window.innerWidth < 768; // Simple check for mobile logic
        let popup: Window | null = null;

        // 1. Desktop: Open popup immediately (Trusted User Action) to bypass blockers
        if (!isMobile) {
            const width = 1000;
            const height = 800;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;

            popup = window.open(
                '',
                'ShopifyCheckout',
                `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
            );

            // Styling the loading state in the popup
            if (popup) {
                popup.document.write(`
                    <html>
                        <head>
                            <title>Securing Checkout...</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9f9f9; }
                                .loader { width: 40px; height: 40px; border: 4px solid #ddd; border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
                                @keyframes spin { to { transform: rotate(360deg); } }
                                p { color: #666; font-size: 16px; font-weight: 500; }
                            </style>
                        </head>
                        <body>
                            <div class="loader"></div>
                            <p>Connecting to secure checkout...</p>
                        </body>
                    </html>
                `);
            }
        }

        const checkoutItems = cartItems.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity
        }));

        try {
            // Determine API URL based on environment or configuration
            const getBaseUrl = () => {
                if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
                return import.meta.env.DEV ? 'http://localhost:5000' : '';
            };

            const currentApiUrl = `${getBaseUrl()}/api/shopify/checkout`;

            const response = await fetch(currentApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: checkoutItems })
            });

            const data = await response.json();

            if (data.success && data.checkoutUrl) {
                if (popup && !popup.closed) {
                    // Desktop: Redirect the popup
                    popup.location.href = data.checkoutUrl;
                } else {
                    // Mobile (or Desktop Fallback): Redirect the main window
                    window.location.href = data.checkoutUrl;
                }
                setIsCartOpen(false);
            } else {
                popup?.close();
                alert('Checkout failed. Please try again.');
            }
        } catch (error) {
            console.error("Error during checkout", error);
            popup?.close();
            alert('Unable to connect to checkout. Please check your connection.');
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const drawerVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" },
        visible: {
            opacity: 1, y: -16, scale: 1, filter: "blur(0px)",
            transition: { duration: 0.4, type: "spring", bounce: 0.3 }
        },
        exit: { opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.3 } }
    };

    const tabContentVariants: Variants = {
        hidden: (direction: number) => ({ opacity: 0, x: direction > 0 ? 20 : -20, filter: "blur(5px)" }),
        visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 30 } },
        exit: (direction: number) => ({ opacity: 0, x: direction < 0 ? 20 : -20, filter: "blur(5px)", transition: { duration: 0.2 } })
    };

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-[200] pointer-events-none">
            <div className="relative flex flex-col items-center">

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            ref={menuRef}
                            variants={drawerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={`pointer-events-auto absolute bottom-full mb-2 w-[90vw] max-w-xl rounded-3xl border flex flex-col overflow-hidden max-h-[60vh] ${glassPanelClass}`}
                        >
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <motion.div key="tools" custom={-1} variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 gap-2">
                                    <h3 className={`text-[10px] uppercase font-bold tracking-widest ml-1 ${isNight ? 'text-white/50' : 'text-black/50'}`}>Products</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div onClick={() => { onViewProduct('mesa'); setIsMenuOpen(false); }} className="bg-brand-mesa/80 rounded-2xl p-3 flex flex-col justify-between border border-white/10 hover:brightness-110 transition-all group cursor-pointer relative">
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart({
                                                    id: 'mesa',
                                                    variantId: earthProduct?.variants?.[0]?.id || 0,
                                                    name: 'mesa',
                                                    price: mesaPrice,
                                                    color: '#E89C6C'
                                                });
                                            }} className="absolute top-3 right-3 bg-white text-brand-mesa w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10">
                                                <ShoppingBag size={14} />
                                            </button>
                                            <div className="flex justify-between items-start pr-8">
                                                <div className="flex flex-col justify-start">
                                                    <h3 className="text-2xl font-bold text-white tracking-tight leading-none">mesa</h3>
                                                    <p className="text-[10px] text-white/90 font-medium leading-tight mt-0.5">cleansing mud</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-white font-bold text-lg">₹{mesaPrice}</div>
                                        </div>
                                        <div onClick={() => { onViewProduct('crest'); setIsMenuOpen(false); }} className="bg-brand-crest/80 rounded-2xl p-3 flex flex-col justify-between border border-white/10 hover:brightness-110 transition-all group cursor-pointer relative">
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart({
                                                    id: 'crest',
                                                    variantId: waterProduct?.variants?.[0]?.id || 0,
                                                    name: 'crest',
                                                    price: crestPrice,
                                                    color: '#5D9BCE'
                                                });
                                            }} className="absolute top-3 right-3 bg-white text-brand-crest w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10">
                                                <ShoppingBag size={14} />
                                            </button>
                                            <div className="flex justify-between items-start pr-8">
                                                <div className="flex flex-col justify-start">
                                                    <h3 className="text-2xl font-bold text-white tracking-tight leading-none">crest</h3>
                                                    <p className="text-[10px] text-white/90 font-medium leading-tight mt-0.5">skin sorbet</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-white font-bold text-lg">₹{crestPrice}</div>
                                        </div>
                                    </div>

                                    {/* Bundle Section Moved Up */}
                                    <div className="bg-black/20 rounded-2xl p-3 flex items-center justify-between border border-white/10 hover:bg-black/30 transition-all relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-mesa/20 to-brand-crest/20 opacity-50 group-hover:opacity-80 transition-opacity" />
                                        <div className="relative z-10 flex flex-col">
                                            <span className="text-[9px] uppercase font-bold text-brand-lime tracking-wider mb-1">Complete Set</span>
                                            <h3 className="text-xl font-bold text-white">the pair</h3>
                                        </div>
                                        <div className="relative z-10 flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-bold text-white text-lg">₹{pairPrice}</div>
                                                <div className="text-xs text-white/40 line-through">₹{pairOriginalPrice}</div>
                                            </div>
                                            <button onClick={handleAddBundle} className="bg-brand-lime text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-sm">Add</button>
                                        </div>
                                    </div>

                                    <h3 className={`text-[10px] uppercase font-bold tracking-widest ml-1 mt-2 mb-1 ${isNight ? 'text-white/50' : 'text-black/50'}`}>Knowledge</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { icon: Map, title: "The Way", sub: "Origin", color: "text-brand-lime" },
                                            { icon: BookOpen, title: "Ingredients", sub: "Index", color: "text-brand-mesa" },
                                            { icon: Beaker, title: "Labs", sub: "Future", color: "text-sky-400", action: () => handleScrollTo('element-future') },
                                            { icon: Users, title: "Big Picture", sub: "Community", color: "text-purple-400" }
                                        ].map((item, idx) => (
                                            <div key={idx} onClick={item.action} className={`rounded-xl p-2 flex flex-row items-center gap-3 transition-all cursor-pointer group ${isNight ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}>
                                                <item.icon className={`${item.color} group-hover:scale-110 transition-transform flex-shrink-0`} size={20} strokeWidth={2.5} />
                                                <div className="flex flex-col items-start gap-0.5 min-w-0">
                                                    <h4 className="font-bold text-sm leading-none">{item.title}</h4>
                                                    <p className="text-[10px] opacity-60 uppercase tracking-wider leading-none">{item.sub}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isCartOpen && (
                        <motion.div
                            ref={cartRef}
                            variants={drawerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={`pointer-events-auto absolute bottom-full mb-2 w-80 rounded-3xl p-6 border flex flex-col max-h-[60vh] ${glassPanelClass}`}
                        >
                            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isNight ? 'border-white/10' : 'border-black/10'}`}>
                                <h3 className="font-bold text-lg">Your Routine</h3>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-brand-lime text-black">{cartCount}</span>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="py-12 text-center opacity-50 text-sm flex flex-col items-center gap-3">
                                    <ShoppingBag size={32} strokeWidth={1} />
                                    <span>Your cart is empty.</span>
                                </div>
                            ) : (
                                <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2">
                                    {groupedItems.map(item => (
                                        <div key={item.id} className={`flex items-center gap-4 mb-4 last:mb-0 p-3 rounded-xl ${isNight ? 'bg-white/5' : 'bg-black/5'}`}>
                                            <div
                                                className="w-12 h-12 rounded-lg flex-shrink-0 shadow-sm"
                                                style={{ background: item.color }}
                                            ></div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-sm">{item.name}</h4>
                                                    <span className="font-bold text-sm">₹{item.price * item.quantity}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <div className={`flex items-center rounded-lg ${isNight ? 'bg-white/10' : 'bg-black/5'}`}>
                                                        <button
                                                            onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                                                            className={`p-1.5 hover:bg-black/10 rounded-l-lg transition-colors ${item.quantity <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus size={10} strokeWidth={3} />
                                                        </button>
                                                        <span className="text-[10px] font-bold px-2 min-w-[20px] text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                                                            className="p-1.5 hover:bg-black/10 rounded-r-lg transition-colors"
                                                        >
                                                            <Plus size={10} strokeWidth={3} />
                                                        </button>
                                                    </div>

                                                    <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-500 transition-colors p-1 hover:bg-red-500/10 rounded">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={`pt-4 mt-4 border-t ${isNight ? 'border-white/10' : 'border-black/10'}`}>
                                <div className="flex justify-between items-center mb-4 font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{finalTotal}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckoutLoading}
                                    className="w-full bg-brand-lime text-black py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-colors shadow-lg shadow-brand-lime/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCheckoutLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        "Checkout"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`pointer-events-auto group relative flex items-center gap-1 px-2 py-2 rounded-full backdrop-blur-2xl border transition-all duration-500 z-50 ${pillClass}`}
                >
                    <button onClick={toggleTheme} className={`p-2.5 rounded-full transition-colors duration-300 ${buttonHoverClass}`} aria-label="Toggle Theme">
                        <div className="relative w-4 h-4 overflow-hidden">
                            <motion.div initial={false} animate={{ y: isNight ? -16 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                                <div className="h-4 flex items-center justify-center"><Sun size={16} /></div>
                                <div className="h-4 flex items-center justify-center"><Moon size={16} /></div>
                            </motion.div>
                        </div>
                    </button>
                    <div className="w-px h-5 bg-current opacity-20 mx-1"></div>
                    <button ref={menuButtonRef} onClick={toggleMenu} className={`relative px-5 py-1.5 rounded-full cursor-pointer flex items-center gap-2 transition-colors duration-300 ${buttonHoverClass} ${isMenuOpen ? 'bg-white/20' : ''}`}>
                        <span className="font-bold tracking-widest text-xs uppercase">MENU</span>
                        <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                            {isMenuOpen ? <X size={14} /> : <ChevronUp size={14} />}
                        </motion.div>
                    </button>
                    <div className="w-px h-5 bg-current opacity-20 mx-1"></div>
                    <button ref={cartButtonRef} onClick={toggleCart} className={`p-2.5 rounded-full transition-colors duration-300 flex items-center gap-2 ${buttonHoverClass} ${isCartOpen ? 'bg-white/20' : ''}`}>
                        <ShoppingBag size={16} />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-lime rounded-full border border-black/20"></span>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
