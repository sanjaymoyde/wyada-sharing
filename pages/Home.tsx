import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Manifesto } from '../components/Manifesto';
import { Toast } from '../components/Toast';
import { FloatingBar } from '../components/FloatingBar';
import { ElementsIntro } from '../components/ElementsIntro';
import { EarthCarousel } from '../components/EarthCarousel';
import { WaterCarousel } from '../components/WaterCarousel';
import { ComingSoonCarousel } from '../components/ComingSoonCarousel';
import { CircleIntro } from '../components/CircleIntro';
import { BigPictureCarousel } from '../components/BigPictureCarousel';
import { motion } from 'framer-motion';
import { ElementIndicator } from '../components/ElementIndicator';
import { CartItem, Product } from '../types';

interface HomeProps {
    isNight: boolean;
    toggleTheme: () => void;
    cartItems: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: string) => void;
    updateCartQuantity: (id: string, quantity: number) => void;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    earthProduct: Product | null;
    waterProduct: Product | null;
    allProducts: Product[];
    showToast: boolean;
    setShowToast: (show: boolean) => void;
    initialSection?: 'origin' | 'elements' | 'earth' | 'water' | 'future' | 'circle' | 'bigpicture';
    initialMenuOpen?: boolean;
    initialCartOpen?: boolean;
}

export const Home: React.FC<HomeProps> = ({
    isNight,
    toggleTheme,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    isCartOpen,
    setIsCartOpen,
    isMenuOpen,
    setIsMenuOpen,
    earthProduct,
    waterProduct,
    allProducts,
    showToast,
    setShowToast,
    initialSection,
    initialMenuOpen,
    initialCartOpen
}) => {
    const navigate = useNavigate();
    const [activeElement, setActiveElement] = useState<'origin' | 'elements' | 'earth' | 'water' | 'future' | 'circle' | 'bigpicture' | null>('origin');
    const [snappedElement, setSnappedElement] = useState<'origin' | 'elements' | 'earth' | 'water' | 'future' | 'circle' | 'bigpicture' | null>('origin');
    const [originStep, setOriginStep] = useState<number>(0);
    const [hideLogo, setHideLogo] = useState(false);

    const isAutoScrolling = useRef(false);
    const autoScrollTarget = useRef(0);
    const autoScrollListener = useRef<any>(null);
    const autoScrollTimer = useRef<any>(null);

    const handleNavigate = useCallback((index: number) => {
        let target = 0;
        const vh = window.innerHeight;

        const getOffset = (id: string) => {
            const el = document.getElementById(id);
            return el ? el.offsetTop : null;
        };

        if (index >= 10.0) target = (getOffset('element-bigpicture') ?? (10 * vh));
        else if (index >= 9.0) target = (getOffset('section-circle') ?? (9 * vh));
        else if (index >= 8.0) target = (getOffset('element-future') ?? (8 * vh));
        else if (index >= 7.0) target = (getOffset('element-water') ?? (7 * vh));
        else if (index >= 6.0) target = (getOffset('element-earth') ?? (6 * vh));
        else if (index >= 5.0) target = (getOffset('section-elements') ?? (5 * vh));
        else target = index * vh;

        isAutoScrolling.current = true;
        autoScrollTarget.current = target;

        document.documentElement.classList.add('no-snap');

        if (autoScrollListener.current) {
            window.removeEventListener('scroll', autoScrollListener.current);
        }
        if (autoScrollTimer.current) {
            clearTimeout(autoScrollTimer.current);
        }

        const scrollHandler = () => {
            if (autoScrollTimer.current) clearTimeout(autoScrollTimer.current);
            autoScrollTimer.current = setTimeout(() => {
                document.documentElement.classList.remove('no-snap');
                isAutoScrolling.current = false;
                if (autoScrollListener.current) {
                    window.removeEventListener('scroll', autoScrollListener.current);
                }
                autoScrollListener.current = null;
                autoScrollTimer.current = null;
            }, 800);
        };

        autoScrollListener.current = scrollHandler;
        window.addEventListener('scroll', scrollHandler, { passive: true });
        window.scrollTo({ top: target, behavior: 'smooth' });
    }, []);

    const getElementAtScroll = (screenIndex: number) => {
        if (screenIndex >= 10.0) return 'bigpicture';
        if (screenIndex >= 9.0) return 'circle';
        if (screenIndex >= 8.0) return 'future';
        if (screenIndex >= 7.0) return 'water';
        if (screenIndex >= 6.0) return 'earth';
        if (screenIndex >= 5.0) return 'elements';
        return 'origin';
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (isAutoScrolling.current) return;
        const vh = window.innerHeight;
        const direction = e.deltaY > 0 ? 1 : -1;
        const currentIndex = Math.round(window.scrollY / vh);
        const nextIndex = Math.max(0, Math.min(10, currentIndex + direction)); // Max index is 10 for bigpicture

        if (nextIndex !== currentIndex) {
            handleNavigate(nextIndex);
        }
    };

    const touchStart = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (isAutoScrolling.current) return;
        const touchEnd = e.changedTouches[0].clientY;
        const delta = touchStart.current - touchEnd;
        const vh = window.innerHeight;

        if (Math.abs(delta) > 50) {
            const direction = delta > 0 ? 1 : -1;
            const currentIndex = Math.round(window.scrollY / vh);
            const nextIndex = Math.max(0, Math.min(10, currentIndex + direction)); // Max index is 10 for bigpicture
            handleNavigate(nextIndex);
        }
    };

    useEffect(() => {
        const handleUpdate = () => {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const screenIndex = scrollY / vh;

            const originIndex = Math.round(screenIndex);
            const clampedStep = Math.max(0, Math.min(originIndex, 4));

            const newActive = getElementAtScroll(screenIndex);

            // console.log('Scroll Debug:', { scrollY, vh, screenIndex, newActive, activeElement });

            setOriginStep(prev => prev === clampedStep ? prev : clampedStep);
            setActiveElement(prev => prev === newActive ? prev : newActive);
            setSnappedElement(prev => prev === newActive ? prev : newActive);
        };

        window.addEventListener('scroll', handleUpdate, { passive: true });
        handleUpdate();

        return () => {
            window.removeEventListener('scroll', handleUpdate);
        };
    }, []);

    useEffect(() => {
        // Handle path-based initial deep links
        if (!initialSection || initialSection === 'origin') return;

        // Small timeout to ensure DOM is ready and layout is stable
        setTimeout(() => {
            let targetId = '';
            switch (initialSection) {
                case 'water': targetId = 'element-water'; break;
                case 'future': targetId = 'element-future'; break;
                case 'circle': targetId = 'section-circle'; break;
                case 'bigpicture': targetId = 'element-bigpicture'; break;
            }

            const el = document.getElementById(targetId);
            if (el) {
                window.scrollTo({ top: el.offsetTop, behavior: 'instant' });
            }
        }, 100);
    }, [initialSection]);

    // Handle Initial Menu Open
    useEffect(() => {
        if (initialMenuOpen) {
            setIsMenuOpen(true);
        }
    }, [initialMenuOpen, setIsMenuOpen]);

    // Handle Initial Cart Open
    useEffect(() => {
        if (initialCartOpen) {
            setIsCartOpen(true);
        }
    }, [initialCartOpen, setIsCartOpen]);

    // Update URL on Scroll or Menu/Cart State
    useEffect(() => {
        // Priority 1: Cart
        if (isCartOpen) {
            if (window.location.pathname !== '/cart') {
                window.history.replaceState(null, '', '/cart');
            }
            return;
        }

        // Priority 2: Menu
        if (isMenuOpen) {
            if (window.location.pathname !== '/menu') {
                window.history.replaceState(null, '', '/menu');
            }
            return;
        }

        if (!activeElement) return;

        let path = '/';
        switch (activeElement) {
            case 'elements': path = '/element-intro'; break;
            case 'earth': path = '/mesa'; break;
            case 'water': path = '/crest'; break;
            case 'future': path = '/upcoming'; break;
            case 'circle': path = '/community'; break;
            case 'bigpicture': path = '/bigpicture'; break;
            case 'origin': path = '/'; break;
        }

        // Use replaceState to update URL without adding to history stack
        if (window.location.pathname !== path) {
            window.history.replaceState(null, '', path);
        }
    }, [activeElement, isMenuOpen, isCartOpen]);

    // Dynamic Theme Color for Browser Address Bar
    useEffect(() => {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        let color = isNight ? '#020408' : '#D1E231'; // Default Origin Color

        switch (activeElement) {
            case 'origin':
                color = isNight ? '#020408' : '#D1E231';
                break;
            case 'elements':
                color = '#bca2d1';
                break;
            case 'earth':
                color = isNight ? '#000000' : '#d99058'; // brand-mesa approx
                break;
            case 'water':
                color = isNight ? '#000000' : '#73a5d3'; // brand-crest approx
                break;
            case 'future':
                color = isNight ? '#000000' : '#111827';
                break;
            case 'circle':
                color = '#94b8b4';
                break;
            case 'bigpicture':
                color = isNight ? '#000000' : '#e0e0e0';
                break;
        }

        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', color);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = color;
            document.head.appendChild(meta);
        }
    }, [activeElement, isNight]);

    const handleViewProduct = (type: 'mesa' | 'crest') => {
        navigate(`/product/${type}`);
    };

    const bgClass = isNight ? 'bg-brand-night' : 'bg-brand-lime';

    return (
        <div
            className={`app relative min-h-screen w-full transition-colors duration-700 ease-in-out ${bgClass} font-sans font-medium`}
        >
            <Navbar isNight={isNight} hideLogo={hideLogo} onLogoClick={() => handleNavigate(0)} />
            <ElementIndicator
                isNight={isNight}
                active={activeElement}
                snapped={snappedElement}
                originStep={originStep}
                onNavigate={handleNavigate}
                onViewProduct={handleViewProduct}
            />
            <Toast show={showToast} message="Blue light reduced." onClose={() => setShowToast(false)} />

            <main className="w-full relative">
                <Manifesto isNight={isNight} />
                <ElementsIntro setLogoHidden={setHideLogo} products={allProducts} />
                <EarthCarousel
                    isNight={isNight}
                    addToCart={() => addToCart({
                        id: 'mesa',
                        variantId: earthProduct?.variants?.[0]?.id || 0,
                        name: earthProduct?.title || 'mesa',
                        price: earthProduct?.variants[0]?.price ? Number(earthProduct.variants[0].price) : 799,
                        color: '#E89C6C'
                    })}
                    onView={() => handleViewProduct('mesa')}
                    product={earthProduct}
                />
                <WaterCarousel
                    isNight={isNight}
                    addToCart={() => addToCart({
                        id: 'crest',
                        variantId: waterProduct?.variants?.[0]?.id || 0,
                        name: waterProduct?.title || 'crest',
                        price: waterProduct?.variants[0]?.price ? Number(waterProduct.variants[0].price) : 1299,
                        color: '#5D9BCE'
                    })}
                    onView={() => handleViewProduct('crest')}
                    product={waterProduct}
                />
                <ComingSoonCarousel isNight={isNight} />
                <CircleIntro setLogoHidden={setHideLogo} />
                <BigPictureCarousel isNight={isNight} />
            </main>

            <FloatingBar
                isNight={isNight}
                toggleTheme={toggleTheme}
                cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                cartItems={cartItems}
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                onRemoveItem={removeFromCart}
                addToCart={addToCart}
                onViewProduct={handleViewProduct}
                earthProduct={earthProduct}
                waterProduct={waterProduct}
                updateCartQuantity={updateCartQuantity}
            />

            <footer className={`relative z-[90] py-10 text-center text-sm ${isNight ? 'bg-black text-brand-lime/40' : 'bg-brand-lime text-white/40'}`}>
                &copy; {new Date().getFullYear()} way'da wellness.
            </footer>
        </div>
    );
};
