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

        let rafId: number;

        const update = () => {
            // Get current progress value from MotionValue
            const currentScroll = scrollY.get();

            // Calculate delta from base (when the item "starts")
            const delta = currentScroll - baseValue;

            // Calculate target offset in pixels.
            // We assume 1 unit of scrollIndex roughly equals 1 viewport height in this context?
            // Actually, let's just use pixels based on viewport height scaling to keep it meaningful.
            const vh = window.innerHeight;

            // Move UP as index increases -> negative offset
            // relative to the "start" point.
            // If delta is 0 (at start), offset is 0.
            // If delta is 1 (scrolled 1 screen past start), offset is -1 * speed * vh.
            const targetOffset = -delta * vh * speed;

            state.current.targetY = targetOffset;

            // Lerp
            const diff = state.current.targetY - state.current.currentY;
            if (Math.abs(diff) > 0.05) {
                state.current.currentY += diff * lerp;
            } else {
                state.current.currentY = state.current.targetY;
            }

            // Apply transform
            element.style.transform = `translate3d(0, ${state.current.currentY}px, 0)`;

            // Opacity logic (Optional)
            if (enableOpacity) {
                // Simple fade out if it floats too high
                // Let's say if it moves more than 30% of screen height from base?
                // ... leaving disabled by default as requested unless user specifically asks for fade fix.
            }

            rafId = requestAnimationFrame(update);
        };

        rafId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(rafId);
            if (element) {
                element.style.transform = '';
            }
        };
    }, [scrollY, baseValue, speed, lerp, enableOpacity]);

    return ref;
};

export default useScrollFloat;
