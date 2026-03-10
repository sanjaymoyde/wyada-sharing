import { useState, useEffect, useRef, useCallback } from 'react';
import { HomeElement } from '../constants';
import { getAppViewportHeight } from '../utils/viewport';

interface UseScrollSnapProps {
    isMenuOpen: boolean;
    isCartOpen: boolean;
    isArticleOpen: boolean;
}

const MANIFESTO_SCREENS = 5;
const TOTAL_ORIGIN_STEPS = 5;
const VIEWPORT_DELTA_EPSILON_PX = 30;
const VIEWPORT_REALIGN_EPSILON_PX = 30;
const AUTO_SCROLL_TARGET_EPSILON_PX = 10;
const SNAP_LOCK_TIMEOUT_MS = 1000;

export const useScrollSnap = ({ isMenuOpen, isCartOpen, isArticleOpen }: UseScrollSnapProps) => {
    const [activeElement, setActiveElement] = useState<HomeElement | null>('origin');
    const [snappedElement, setSnappedElement] = useState<HomeElement | null>('origin');
    const [originStep, setOriginStep] = useState<number>(0);

    const viewportHeightRef = useRef(1);
    const isAutoScrolling = useRef(false);
    const autoScrollTargetRef = useRef(0);
    const autoScrollTimeoutRef = useRef<number | null>(null);
    const isUserInteracting = useRef(false);

    const getVh = useCallback(() => {
        if (typeof window === 'undefined') return 1;
        return Math.max(viewportHeightRef.current, 1);
    }, []);

    const setSnapLocked = useCallback((locked: boolean) => {
        if (typeof document === 'undefined') return;
        if (locked) {
            document.documentElement.classList.add('no-snap');
            document.body.classList.add('no-snap');
        } else {
            document.documentElement.classList.remove('no-snap');
            document.body.classList.remove('no-snap');
        }
    }, []);

    const clearAutoScrollTimer = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (autoScrollTimeoutRef.current !== null) {
            window.clearTimeout(autoScrollTimeoutRef.current);
            autoScrollTimeoutRef.current = null;
        }
    }, []);

    const unlockSnap = useCallback(() => {
        isAutoScrolling.current = false;
        setSnapLocked(false);
        clearAutoScrollTimer();
    }, [clearAutoScrollTimer, setSnapLocked]);

    const handleNavigate = useCallback((index: number) => {
        if (typeof window === 'undefined') return;
        if (isMenuOpen || isCartOpen || isArticleOpen) return;

        const target = index * getVh();
        autoScrollTargetRef.current = target;
        isAutoScrolling.current = true;
        setSnapLocked(true);

        clearAutoScrollTimer();
        autoScrollTimeoutRef.current = window.setTimeout(() => {
            unlockSnap();
        }, SNAP_LOCK_TIMEOUT_MS);

        window.scrollTo({ top: target, behavior: 'smooth' });
    }, [clearAutoScrollTimer, getVh, isArticleOpen, isCartOpen, isMenuOpen, setSnapLocked, unlockSnap]);

    const getElementAtScroll = useCallback((screenIndex: number): HomeElement => {
        if (screenIndex >= 9.8) return 'bigpicture';
        if (screenIndex >= 8.8) return 'circle';
        if (screenIndex >= 7.8) return 'future';
        if (screenIndex >= 6.8) return 'water';
        if (screenIndex >= 5.8) return 'earth';
        if (screenIndex >= 4.8) return 'elements';
        return 'origin';
    }, []);

    const applyViewportHeight = useCallback((allowRealign: boolean) => {
        if (isAutoScrolling.current) return;
        const next = getAppViewportHeight();
        if (!Number.isFinite(next) || next <= 0) return;

        const prev = Math.max(viewportHeightRef.current, 1);
        const hasPreviousViewport = prev > 1;
        const currentScrollY = window.scrollY;
        const shouldRealign = allowRealign && !isUserInteracting.current && hasPreviousViewport && Math.abs(next - prev) >= VIEWPORT_DELTA_EPSILON_PX;

        // Always keep the ref updated so scrollIndex math stays consistent.
        viewportHeightRef.current = next;

        if (!hasPreviousViewport) {
            // when viewport changes, compute our current logical screen index
            return;
        }

        if (shouldRealign) {
            // Only realign for explicit resizes (e.g. rotation), not during normal touch scroll.
            const screenIndex = currentScrollY / prev;
            const roundedIndex = Math.round(screenIndex);
            const targetScrollY = Math.max(0, roundedIndex * next);
            if (Math.abs(targetScrollY - currentScrollY) >= VIEWPORT_REALIGN_EPSILON_PX) {
                setSnapLocked(true);
                window.scrollTo({ top: targetScrollY, behavior: 'auto' });
                requestAnimationFrame(() => setSnapLocked(false));
            }
        }
    }, [setSnapLocked]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let rafId: number | null = null;
        let unlockSnapRafId: number | null = null;

        const unlockSnapNextFrame = () => {
            if (unlockSnapRafId !== null) cancelAnimationFrame(unlockSnapRafId);
            unlockSnapRafId = requestAnimationFrame(() => {
                setSnapLocked(false);
                unlockSnapRafId = null;
            });
        };

        const onResize = () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => applyViewportHeight(true));
        };

        applyViewportHeight(true);

        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);
        const visualViewport = window.visualViewport;
        visualViewport?.addEventListener('resize', onResize);

        const handleStart = () => {
            isUserInteracting.current = true;
        };
        const handleEnd = () => {
            isUserInteracting.current = false;
        };

        window.addEventListener('touchstart', handleStart, { passive: true });
        window.addEventListener('touchend', handleEnd, { passive: true });
        window.addEventListener('mousedown', handleStart, { passive: true });
        window.addEventListener('mouseup', handleEnd, { passive: true });

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
            visualViewport?.removeEventListener('resize', onResize);
            window.removeEventListener('touchstart', handleStart);
            window.removeEventListener('touchend', handleEnd);
            window.removeEventListener('mousedown', handleStart);
            window.removeEventListener('mouseup', handleEnd);
            if (rafId !== null) cancelAnimationFrame(rafId);
            if (unlockSnapRafId !== null) cancelAnimationFrame(unlockSnapRafId);
        };
    }, [applyViewportHeight, setSnapLocked]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            // ensure viewport height is up-to-date before computing any indices
            applyViewportHeight(false);
            const scrollY = window.scrollY;
            const screenIndex = scrollY / getVh();

            if (isAutoScrolling.current) {
                if (Math.abs(scrollY - autoScrollTargetRef.current) < AUTO_SCROLL_TARGET_EPSILON_PX) {
                    unlockSnap();
                } else {
                    return;
                }
            }
            const mappedStep = Math.floor((screenIndex / MANIFESTO_SCREENS) * TOTAL_ORIGIN_STEPS);
            const clampedStep = Math.max(0, Math.min(mappedStep, TOTAL_ORIGIN_STEPS - 1));
            setOriginStep(clampedStep);
            setActiveElement(getElementAtScroll(screenIndex));
        };

        const handleScrollEnd = () => {
            applyViewportHeight(false);
            const screenIndex = window.scrollY / getVh();

            if (isAutoScrolling.current) {
                if (Math.abs(window.scrollY - autoScrollTargetRef.current) < AUTO_SCROLL_TARGET_EPSILON_PX) {
                    unlockSnap();
                }
                return;
            }

            setSnappedElement(getElementAtScroll(screenIndex));
        };
        const win = window as any;
        win.addEventListener('scroll', handleScroll, { passive: true });
        win.addEventListener('scrollend', handleScrollEnd);

        let scrollEndTimer: number | null = null;
        const scrollFallback = () => {
            if (scrollEndTimer !== null) window.clearTimeout(scrollEndTimer);
            scrollEndTimer = window.setTimeout(handleScrollEnd, 100);
        };

        const hasNativeScrollEnd = 'onscrollend' in window;
        if (!hasNativeScrollEnd) {
            win.addEventListener('scroll', scrollFallback, { passive: true });
        }

        handleScroll();
        handleScrollEnd();

        return () => {
            win.removeEventListener('scroll', handleScroll);
            win.removeEventListener('scrollend', handleScrollEnd);
            if (!hasNativeScrollEnd) {
                win.removeEventListener('scroll', scrollFallback);
            }
            if (scrollEndTimer !== null) window.clearTimeout(scrollEndTimer);
        };
    }, [applyViewportHeight, getElementAtScroll, getVh, unlockSnap]);

    useEffect(() => {
        return () => {
            clearAutoScrollTimer();
            isAutoScrolling.current = false;
            setSnapLocked(false);
        };
    }, [clearAutoScrollTimer, setSnapLocked]);

    return {
        activeElement,
        snappedElement,
        originStep,
        handleNavigate,
        viewportHeightRef,
        isAutoScrolling,
        getVh
    };
};
