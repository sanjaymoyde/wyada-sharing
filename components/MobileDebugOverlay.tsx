import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

type MeasuredItem = {
    label: string;
    top: number;
    bottom: number;
    height: number;
    gapToBar: number | null;
};

type DebugSnapshot = {
    path: string;
    search: string;
    scrollY: number;
    innerHeight: number;
    visualViewportHeight: number | null;
    visualViewportOffsetTop: number | null;
    appVh: string;
    floatingBarHeight: number | null;
    floatingBarTop: number | null;
    snapped: string;
    measured: MeasuredItem[];
};

const DEBUG_SELECTORS: Array<{ label: string; selector: string }> = [
    { label: 'elements-icons', selector: '[data-debug-id="elements-mobile-icons"]' },
    { label: 'elements-prompt', selector: '[data-debug-id="elements-mobile-prompt"]' },
    { label: 'circle-cta', selector: '[data-debug-id="circle-mobile-cta"]' },
    { label: 'bigpicture-label', selector: '[data-debug-id="bigpicture-mobile-label"]' },
    { label: 'indicator', selector: '[data-debug-id="element-indicator"]' },
    { label: 'product-footer', selector: '[data-debug-id="product-footer"]' },
];

const round = (value: number | null): string => {
    if (value === null || !Number.isFinite(value)) return '-';
    return Math.round(value).toString();
};

export const MobileDebugOverlay: React.FC = () => {
    const location = useLocation();
    const enabled = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return new URLSearchParams(window.location.search).get('mobileDebug') === '1';
    }, [location.search]);

    const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null);

    useEffect(() => {
        if (!enabled || typeof window === 'undefined') {
            setSnapshot(null);
            return;
        }

        let rafId: number | null = null;

        const update = () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                rafId = null;

                const floatingBar = document.querySelector('[data-debug-id="floating-bar"]') as HTMLElement | null;
                const floatingBarRect = floatingBar?.getBoundingClientRect() ?? null;
                const snapped = document.querySelector('main')?.getAttribute('data-snapped') || 'none';

                const measured = DEBUG_SELECTORS.map(({ label, selector }) => {
                    const element = document.querySelector(selector) as HTMLElement | null;
                    if (!element) return null;

                    const rect = element.getBoundingClientRect();
                    return {
                        label,
                        top: rect.top,
                        bottom: rect.bottom,
                        height: rect.height,
                        gapToBar: floatingBarRect ? (floatingBarRect.top - rect.bottom) : null,
                    };
                }).filter((item): item is MeasuredItem => item !== null);

                setSnapshot({
                    path: window.location.pathname,
                    search: window.location.search,
                    scrollY: window.scrollY,
                    innerHeight: window.innerHeight,
                    visualViewportHeight: window.visualViewport?.height ?? null,
                    visualViewportOffsetTop: window.visualViewport?.offsetTop ?? null,
                    appVh: getComputedStyle(document.documentElement).getPropertyValue('--app-vh').trim(),
                    floatingBarHeight: floatingBarRect?.height ?? null,
                    floatingBarTop: floatingBarRect?.top ?? null,
                    snapped,
                    measured,
                });
            });
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        window.addEventListener('orientationchange', update);
        window.visualViewport?.addEventListener('resize', update);
        window.visualViewport?.addEventListener('scroll', update);

        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            window.removeEventListener('orientationchange', update);
            window.visualViewport?.removeEventListener('resize', update);
            window.visualViewport?.removeEventListener('scroll', update);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [enabled, location.key]);

    if (!enabled || !snapshot) return null;

    return (
        <div className="fixed left-2 top-2 z-[500] max-w-[calc(100vw-1rem)] rounded-xl bg-black/80 px-3 py-2 text-[10px] leading-tight text-lime-200 shadow-2xl backdrop-blur-md pointer-events-none">
            <div className="font-bold uppercase tracking-[0.2em] text-lime-100">Mobile Debug</div>
            <div>path: {snapshot.path}{snapshot.search}</div>
            <div>snapped: {snapshot.snapped}</div>
            <div>scrollY: {round(snapshot.scrollY)}</div>
            <div>innerH: {round(snapshot.innerHeight)}</div>
            <div>vvH: {round(snapshot.visualViewportHeight)}</div>
            <div>vvTop: {round(snapshot.visualViewportOffsetTop)}</div>
            <div>appVh: {snapshot.appVh || '-'}</div>
            <div>barTop: {round(snapshot.floatingBarTop)}</div>
            <div>barH: {round(snapshot.floatingBarHeight)}</div>
            {snapshot.measured.length > 0 && <div className="mt-1 border-t border-lime-200/20 pt-1" />}
            {snapshot.measured.map((item) => (
                <div key={item.label}>
                    {item.label}: t{round(item.top)} b{round(item.bottom)} h{round(item.height)} gap{round(item.gapToBar)}
                </div>
            ))}
        </div>
    );
};
