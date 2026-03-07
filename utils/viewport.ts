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
    // overlay used to mask any gap while the viewport height is changing
    let overlay: HTMLDivElement | null = null;
    const ensureOverlay = () => {
        if (overlay) return overlay;
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.bottom = '0';
        div.style.left = '0';
        div.style.width = '100%';
        div.style.height = '50px';
        div.style.backgroundColor = '#111827';
        div.style.zIndex = '9999';
        div.style.pointerEvents = 'none';
        div.style.transition = 'opacity 120ms';
        div.style.opacity = '0';
        document.body.appendChild(div);
        overlay = div;
        return div;
    };

    // start with a measured baseline
    let prevHeight = getAppViewportHeight();
    const update = () => {
        const h = getAppViewportHeight();
        if (h === prevHeight) return;

        const scrollY = window.scrollY;
        const screenIndex = prevHeight > 0 ? Math.round(scrollY / prevHeight) : 0;

        setAppViewportHeight(h);

        const ol = ensureOverlay();
        ol.style.opacity = '1';

        requestAnimationFrame(() => {
            // always snap to the nearest section boundary when height changes
            window.scrollTo({ top: screenIndex * h, behavior: 'auto' });
            prevHeight = h;

            // extra resnap in case the toolbar animation kicks in later
            setTimeout(() => {
                const sy = window.scrollY;
                const idx = Math.round(sy / h);
                const target = idx * h;
                if (Math.abs(sy - target) > 1) {
                    window.scrollTo({ top: target, behavior: 'auto' });
                }
                ol.style.opacity = '0';
            }, 120);
        });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
};
