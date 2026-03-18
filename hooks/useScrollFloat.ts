import { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';

interface ScrollFloatOptions {
    /** The motion value to track (e.g. scrollIndex). */
    scrollY: MotionValue<number>;
    /** The value at which the parallax offset should be 0. (e.g. start of section). Default 0. */
    baseValue?: number;
    /** Speed factor. Positive = moves up as input increases. Default 0.1 */
    speed?: number;
    /** Lerp factor (0-1). Lower = smoother/delay. Default 0.1 */
    lerp?: number;
    /** Enable opacity fading based on movement. Default false. */
    enableOpacity?: boolean;
}

/**
 * A hook that adds smooth floating parallax driven by a MotionValue.
 * Essential for virtualized or sticky scroll sections where window.scrollY is misleading or not granular enough.
 */
export const useScrollFloat = (options: ScrollFloatOptions) => {
    const { scrollY, baseValue = 0, speed = 0.15, lerp = 0.1, enableOpacity = false } = options;
    const ref = useRef<HTMLDivElement>(null);
    const state = useRef({
        targetY: 0,
        currentY: 0
    });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let rafId: number | null = null;
        let isVisible = false;

        const update = () => {
            if (!isVisible) return;

            const currentScroll = scrollY.get();
            const delta = currentScroll - baseValue;
            const vh = window.innerHeight;
            const targetOffset = -delta * vh * speed;

            state.current.targetY = targetOffset;

            const diff = state.current.targetY - state.current.currentY;
            if (Math.abs(diff) > 0.05) {
                state.current.currentY += diff * lerp;
            } else {
                state.current.currentY = state.current.targetY;
            }

            element.style.transform = `translate3d(0, ${state.current.currentY}px, 0)`;

            rafId = requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible) {
                // Start the loop when element comes into view
                rafId = requestAnimationFrame(update);
            } else {
                // Stop the loop when element leaves the viewport
                if (rafId !== null) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            }
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
            if (rafId !== null) cancelAnimationFrame(rafId);
            element.style.transform = '';
        };
    }, [scrollY, baseValue, speed, lerp, enableOpacity]);

    return ref;
};

export default useScrollFloat;
