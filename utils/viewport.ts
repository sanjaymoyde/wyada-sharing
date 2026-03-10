type ViewportMode = 'dynamic' | 'stable';

const isIOSDevice = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isIPhoneIPadIPod = /iP(hone|ad|od)/i.test(ua);
    const isIPadOSDesktopUA = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isIPhoneIPadIPod || isIPadOSDesktopUA;
};

const shouldPreferStableViewport = (): boolean => {
    // iOS browser chrome (top/bottom bars) expands/collapses during scroll.
    // For full-screen snap layouts this causes visible jumps with dynamic units.
    return isIOSDevice();
};

const ensureViewportReference = (): HTMLDivElement | null => {
    if (typeof document === 'undefined' || !document.body) return null;

    let referenceInfo = document.getElementById('vh-reference') as HTMLDivElement | null;
    if (referenceInfo) return referenceInfo;

    const div = document.createElement('div');
    div.id = 'vh-reference';
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '1px';
    div.style.visibility = 'hidden';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '-1';
    document.body.appendChild(div);
    return div;
};

const supportsHeight = (value: string): boolean => {
    try {
        return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('height', value);
    } catch {
        return false;
    }
};

const readReferenceHeight = (reference: HTMLDivElement, candidates: string[]): number => {
    for (const candidate of candidates) {
        if (!supportsHeight(candidate)) continue;
        reference.style.height = candidate;
        const measured = reference.getBoundingClientRect().height;
        if (Number.isFinite(measured) && measured > 0) return measured;
    }

    // Last-chance fallback: try a legacy value even if CSS.supports is missing/lying.
    reference.style.height = '100vh';
    const measured = reference.getBoundingClientRect().height;
    return Number.isFinite(measured) ? measured : 0;
};

const resolveViewportMode = (mode?: ViewportMode): ViewportMode => {
    if (mode) return mode;
    return shouldPreferStableViewport() ? 'stable' : 'dynamic';
};

export const getAppViewportHeight = (options?: { mode?: ViewportMode }): number => {
    if (typeof window === 'undefined') return 1;

    const mode = resolveViewportMode(options?.mode);

    if (mode === 'dynamic') {
        const visualViewportHeight = window.visualViewport?.height;
        if (typeof visualViewportHeight === 'number' && Number.isFinite(visualViewportHeight) && visualViewportHeight > 0) {
            return Math.max(Math.round(visualViewportHeight), 1);
        }
    }

    const reference = ensureViewportReference();
    if (reference) {
        const measured = readReferenceHeight(
            reference,
            mode === 'stable'
                ? ['100svh', '100vh', '100dvh']
                : ['100dvh', '100svh', '100vh']
        );
        if (Number.isFinite(measured) && measured > 0) {
            return Math.max(Math.round(measured), 1);
        }
    }

    return Math.max(Math.round(window.innerHeight || 1), 1);
};

export const setAppViewportHeight = (heightPx: number): void => {
    if (typeof document === 'undefined') return;
    const safe = Math.max(Math.round(heightPx), 1);
    document.documentElement.style.setProperty('--app-vh', `${safe}px`);
};

export const initAppViewport = (): void => {
    if (typeof window === 'undefined') return;

    const mode: ViewportMode = shouldPreferStableViewport() ? 'stable' : 'dynamic';

    // Modern browsers (Chrome/Firefox/Edge, newer Safari) support `dvh` reliably.
    // In that case we keep `--app-vh` as a CSS unit (set in `index.css`) and avoid
    // overriding it with a JS pixel value, which can introduce scroll-snap jitter.
    if (mode !== 'stable' && supportsHeight('100dvh')) return;

    let rafId: number | null = null;
    let lastAppliedHeight = 0;

    const update = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            rafId = null;
            const next = getAppViewportHeight({ mode });
            if (Math.abs(next - lastAppliedHeight) < 1) return;
            lastAppliedHeight = next;
            setAppViewportHeight(next);
        });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    if (mode === 'dynamic') {
        window.visualViewport?.addEventListener('scroll', update);
    }
};
