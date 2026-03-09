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

const readReferenceHeight = (reference: HTMLDivElement): number => {
    reference.style.height = '100dvh';
    let measured = reference.getBoundingClientRect().height;

    if (!Number.isFinite(measured) || measured <= 0) {
        reference.style.height = '100svh';
        measured = reference.getBoundingClientRect().height;
    }

    if (!Number.isFinite(measured) || measured <= 0) {
        reference.style.height = '100vh';
        measured = reference.getBoundingClientRect().height;
    }

    return measured;
};

export const getAppViewportHeight = (): number => {
    if (typeof window === 'undefined') return 1;

    const visualViewportHeight = window.visualViewport?.height;
    if (typeof visualViewportHeight === 'number' && Number.isFinite(visualViewportHeight) && visualViewportHeight > 0) {
        return Math.max(Math.round(visualViewportHeight), 1);
    }

    const reference = ensureViewportReference();
    if (reference) {
        const measured = readReferenceHeight(reference);
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
    let rafId: number | null = null;

    const update = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            rafId = null;
            setAppViewportHeight(getAppViewportHeight());
        });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
};
