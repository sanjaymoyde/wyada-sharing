import React, { useEffect, useMemo, useRef, ReactNode, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
    children: ReactNode;
    scrollContainerRef?: RefObject<HTMLElement>;
    containerClassName?: string;
    textClassName?: string;
    animationDuration?: number;
    ease?: string;
    scrollStart?: string;
    scrollEnd?: string;
    scrollExitStart?: string;
    scrollExitEnd?: string;
    stagger?: number;
    triggerElement?: HTMLElement | null;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
    children,
    scrollContainerRef,
    containerClassName = '',
    textClassName = '',
    animationDuration = 1,
    ease = 'back.inOut(2)',
    scrollStart = 'center bottom+=50%',
    scrollEnd = 'bottom bottom-=40%',
    scrollExitStart,
    scrollExitEnd,
    stagger = 0.03,
    triggerElement
}) => {
    const containerRef = useRef<HTMLHeadingElement>(null);

    const splitText = useMemo(() => {
        const text = typeof children === 'string' ? children : '';
        const words = text.split(' ');

        return words.map((word, wIndex) => (
            // Flex block for the word to prevent letters wrapping, allowing words to wrap cleanly
            <span key={wIndex} className="inline-flex whitespace-nowrap mr-[0.3em] last:mr-0">
                {word.split('').map((char, index) => (
                    <span className="inline-block animate-char will-change-transform" key={index}>
                        {char}
                    </span>
                ))}
            </span>
        ));
    }, [children]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const scroller = scrollContainerRef?.current || window;
        const trigger = triggerElement || el;

        const charElements = el.querySelectorAll('.animate-char');

        const ctx = gsap.context(() => {
            // ENTRANCE ANIMATION: Smoothly float and fade up from below
            gsap.fromTo(charElements,
                {
                    willChange: 'opacity, transform',
                    opacity: 0,
                    yPercent: 80,
                    transformOrigin: '50% 0%'
                },
                {
                    duration: animationDuration,
                    ease: ease,
                    opacity: 1,
                    yPercent: 0,
                    stagger: stagger,
                    scrollTrigger: {
                        trigger: trigger,
                        scroller,
                        start: scrollStart,
                        end: scrollEnd,
                        scrub: true,
                        fastScrollEnd: true,
                        preventOverlaps: true
                    }
                }
            );

            // EXIT ANIMATION: Float up to the top and fade out
            if (scrollExitStart && scrollExitEnd) {
                gsap.fromTo(charElements,
                    {
                        opacity: 1,
                        yPercent: 0,
                    },
                    {
                        duration: animationDuration,
                        ease: ease,
                        opacity: 0,
                        yPercent: -80,
                        stagger: stagger,
                        immediateRender: false,
                        scrollTrigger: {
                            trigger: trigger,
                            scroller,
                            start: scrollExitStart,
                            end: scrollExitEnd,
                            scrub: true,
                            fastScrollEnd: true,
                            preventOverlaps: true
                        }
                    }
                );
            }
        }, el);

        return () => ctx.revert();
    }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, scrollExitStart, scrollExitEnd, stagger, triggerElement]);

    return (
        <h2 ref={containerRef} className={`w-full overflow-hidden ${containerClassName}`}>
            <span className={`flex flex-wrap gap-y-1 text-[clamp(1.6rem,4vw,3rem)] leading-[1.3] ${textClassName}`}>
                {splitText}
            </span>
        </h2>
    );
};

export default ScrollFloat;
