import React, { useEffect, useMemo, useRef } from 'react';
import { motion, MotionValue, Variants, useScroll, useSpring, useTransform, useMotionValueEvent, animate } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ManifestoProps {
    isNight: boolean;
}

const CONFIG = {
    screens: 5,
    scrollIndexMax: 5,
    lineRanges: {
        pollution: [0.11, 0.39] as [number, number],
        blueLight: [0.35, 0.63] as [number, number],
        stress: [0.59, 0.87] as [number, number],
    },
};

interface Point3D {
    x: number; y: number; z: number; originalZ: number;
}

const GridCanvas: React.FC<{ isNight: boolean; progress: MotionValue<number> }> = ({ isNight, progress }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef(0);

    useMotionValueEvent(progress, "change", (latest) => {
        scrollRef.current = latest;
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const fov = 400;
        const viewDist = 100;
        const gridWidth = 6000;
        const gridDepth = 6000;
        const cols = 50;
        const rows = 50;
        const floorY = 350;
        const camY = 0;
        const spacingZ = gridDepth / rows;

        const points: Point3D[] = [];
        const forestMap: number[] = [];
        const cityMap: number[] = [];
        let mouse = { x: -1000, y: -1000 };

        const initGrid = () => {
            points.length = 0;
            forestMap.length = 0;
            cityMap.length = 0;
            const spacingX = gridWidth / cols;
            const zStart = -200;

            for (let r = 0; r <= rows; r++) {
                for (let c = 0; c <= cols; c++) {
                    const x = (c * spacingX) - (gridWidth / 2);
                    const z = r * spacingZ + zStart;
                    const y = floorY;

                    const landscapeNoise = Math.sin(x * 0.004) * 60 + Math.cos(z * 0.005) * 50 + Math.sin(x * 0.015 + z * 0.01) * 15;
                    const forestY = y + landscapeNoise;

                    const blockSize = 5;
                    const bx = Math.floor(c / blockSize);
                    const bz = Math.floor(r / blockSize);
                    const blockSeed = Math.abs(Math.sin(bx * 12.9898 + bz * 78.233));
                    const isBuilding = blockSeed > 0.65;
                    const buildHeight = isBuilding ? (blockSeed * 300 + 50) : 0;
                    const cityY = y - buildHeight;

                    points.push({ x, y, z, originalZ: z });
                    forestMap.push(forestY);
                    cityMap.push(cityY);
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma === null || e.beta === null) return;
            const tiltX = Math.min(25, Math.max(-25, e.gamma));
            const normalizedX = (tiltX + 25) / 50;
            const tiltY = Math.min(70, Math.max(20, e.beta));
            const normalizedY = (tiltY - 20) / 50;
            mouse.x = normalizedX * width;
            mouse.y = normalizedY * height;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('deviceorientation', handleDeviceOrientation);

        initGrid();

        let animationFrameId: number;
        const startTime = Date.now();

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const gradient = ctx.createLinearGradient(0, height, 0, height * 0.4);
            const r = isNight ? 196 : 255;
            const g = isNight ? 205 : 255;
            const b = isNight ? 80 : 255;

            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
            gradient.addColorStop(0.33, `rgba(${r}, ${g}, ${b}, 0.3)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;

            const cx = width / 2;
            const cy = height / 2;

            const scrollZ = scrollRef.current * 5000;

            const now = Date.now();
            const elapsed = now - startTime;
            const morphDelay = 500;
            const morphDuration = 2500;
            const rawMorph = Math.min(1, Math.max(0, (elapsed - morphDelay) / morphDuration));
            const morph = rawMorph * rawMorph * (3 - 2 * rawMorph);

            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                const forestY = forestMap[i];
                const cityY = cityMap[i];

                let z = (p.originalZ + scrollZ);
                const totalDepth = gridDepth + 200;
                z = ((z % totalDepth) + totalDepth) % totalDepth;
                z -= 200;

                const scale = fov / (fov + z + viewDist);
                const sx = p.x * scale + cx;
                const sy = (p.y + camY) * scale + cy;

                const dx = mouse.x - sx;
                const dy = mouse.y - sy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 350;

                const effectiveForestY = floorY + (forestY - floorY) * morph;
                const effectiveCityY = floorY + (cityY - floorY) * morph;

                let targetY = effectiveForestY;

                if (dist < maxDist) {
                    const t = 1 - (dist / maxDist);
                    const smoothT = t * t * (3 - 2 * t);
                    const intensity = 0.15;
                    const blendedT = smoothT * intensity;
                    targetY = effectiveForestY * (1 - blendedT) + effectiveCityY * blendedT;
                }

                p.y += (targetY - p.y) * 0.08;

                const renderX = sx;
                const renderY = (p.y + camY) * scale + cy;

                ctx.beginPath();

                if (i % (cols + 1) < cols) {
                    const nextP = points[i + 1];
                    const nextOriginalZ = nextP.originalZ;
                    let nextZ = (nextOriginalZ + scrollZ);
                    nextZ = ((nextZ % totalDepth) + totalDepth) % totalDepth;
                    nextZ -= 200;

                    if (Math.abs(nextZ - z) < spacingZ * 2) {
                        const nextScale = fov / (fov + nextZ + viewDist);
                        ctx.moveTo(renderX, renderY);
                        ctx.lineTo(nextP.x * nextScale + cx, (nextP.y + camY) * nextScale + cy);
                    }
                }

                if (i < points.length - (cols + 1)) {
                    const belowP = points[i + (cols + 1)];
                    const belowOriginalZ = belowP.originalZ;
                    let belowZ = (belowOriginalZ + scrollZ);
                    belowZ = ((belowZ % totalDepth) + totalDepth) % totalDepth;
                    belowZ -= 200;

                    if (Math.abs(belowZ - z) < spacingZ * 2) {
                        const belowScale = fov / (fov + belowZ + viewDist);
                        ctx.moveTo(renderX, renderY);
                        ctx.lineTo(belowP.x * belowScale + cx, (belowP.y + camY) * belowScale + cy);
                    }
                }
                ctx.stroke();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initGrid();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('deviceorientation', handleDeviceOrientation);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isNight]);

    const maskClass = isNight
        ? 'from-[#020408] via-[#020408]/90 to-transparent'
        : 'from-[#c4cd50] via-[#c4cd50]/90 to-transparent';

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className={`absolute top-0 left-0 w-full h-[55%] bg-gradient-to-b ${maskClass}`} />
        </div>
    );
};

const AnimatedChar: React.FC<{
    char: string;
    progress: MotionValue<number>;
    letterStart: number;
    letterDuration: number;
}> = ({ char, progress, letterStart, letterDuration }) => {
    const letterEnd = letterStart + letterDuration;
    const toNumber = (value: string | number) => (typeof value === 'number' ? value : Number(value) || 0);

    const opacity = useTransform(progress, (p: string | number) => {
        const pv = toNumber(p);
        if (pv <= letterStart || pv >= letterEnd) return 0;
        const t = (pv - letterStart) / letterDuration;
        if (t < 0.10) return t / 0.10;
        if (t > 0.90) return (1 - t) / 0.10;
        return 1;
    });

    const y = useTransform(progress, (p: string | number) => {
        const pv = toNumber(p);
        if (pv <= letterStart || pv >= letterEnd) return 0;
        const t = (pv - letterStart) / letterDuration;
        if (t < 0.25) {
            const nt = t / 0.25;
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const easeOutBack = 1 + c3 * Math.pow(nt - 1, 3) + c1 * Math.pow(nt - 1, 2);
            return 40 * (1 - easeOutBack);
        }
        if (t > 0.85) {
            const nt = (t - 0.85) / 0.15;
            return -40 * (nt * nt * nt);
        }
        return 0;
    });

    return (
        <motion.span style={{ opacity, y, willChange: 'transform, opacity' }} className="inline-block">
            {char === ' ' ? '\u00A0' : char}
        </motion.span>
    );
};

const ScrollText: React.FC<{
    text: string;
    progress: MotionValue<number>;
    range: [number, number];
    textClassName?: string;
    wrapperClassName?: string;
}> = ({ text, progress, range, textClassName, wrapperClassName }) => {
    const [start, end] = range;
    const duration = end - start;
    const chars = useMemo(() => Array.from(text), [text]);
    const totalChars = Math.max(chars.length, 1);

    const containerY = useTransform(progress, [start, end], ['30vh', '-30vh']);
    const staggerMax = duration * 0.3;
    const letterActiveDuration = duration * 0.7;

    return (
        <motion.div className="absolute inset-0 flex items-center justify-start pointer-events-none px-6 md:px-12 lg:px-24" style={{ y: containerY }}>
            <div className={`max-w-3xl text-left ${wrapperClassName || ''}`}>
                <h2 className={`font-bold tracking-tight text-white leading-tight ${textClassName || 'text-2xl md:text-3xl lg:text-4xl'}`}>
                    {chars.map((char, index) => {
                        const stagger = staggerMax * (index / totalChars);
                        return (
                            <AnimatedChar
                                key={`${text}-${index}`}
                                char={char}
                                progress={progress}
                                letterStart={start + stagger}
                                letterDuration={letterActiveDuration}
                            />
                        );
                    })}
                </h2>
            </div>
        </motion.div>
    );
};

const Hero: React.FC<{
    isNight: boolean;
    opacity: MotionValue<number>;
    y: MotionValue<number>;
}> = ({ isNight, opacity, y }) => {
    const text1 = 'Cities are evolving.';
    const text2 = 'Your body... not so much.';
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03,
                delayChildren: 0.2,
            },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
        show: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                type: 'spring',
                stiffness: 150,
                damping: 10,
                mass: 0.8,
            },
        },
    };

    return (
        <motion.div style={{ opacity, y }} className="absolute inset-0 z-20 pointer-events-none">
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="absolute top-1/2 -translate-y-1/2 left-6 md:left-12 lg:left-24 flex flex-col items-start gap-1 md:gap-2 text-left max-w-4xl"
            >
                <div className="flex flex-wrap justify-start gap-x-2 md:gap-x-3">
                    {words1.map((word, i) => (
                        <div key={`w1-${i}`} className="flex">
                            {Array.from(word).map((char, cIndex) => (
                                <motion.span
                                    key={cIndex}
                                    variants={item}
                                    className={`text-3xl md:text-5xl lg:text-[55px] font-bold tracking-tight leading-none ${isNight ? 'text-brand-lime' : 'text-white'}`}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap justify-start gap-x-1 md:gap-x-2 mt-1 md:mt-2">
                    {words2.map((word, i) => (
                        <div key={`w2-${i}`} className="flex">
                            {Array.from(word).map((char, cIndex) => (
                                <motion.span key={cIndex} variants={item} className="text-base md:text-2xl lg:text-[20px] font-bold text-white tracking-tight">
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

const Outro: React.FC<{ opacity: MotionValue<number>; y: MotionValue<number> }> = ({ opacity, y }) => (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex items-center justify-start z-20 pointer-events-none px-6 md:px-12">
        <div className="max-w-3xl text-left flex flex-col gap-2 md:gap-4">
            <h2 className="text-2xl md:text-3xl lg:text-[36px] font-bold text-white tracking-tight leading-tight">
                Your body didn&apos;t evolve for the world we&apos;ve built.
            </h2>
            <p className="text-2xl md:text-3xl lg:text-[36px] font-black text-white tracking-tight">
                But your way&apos;da is.
            </p>
        </div>
    </motion.div>
);

export const Manifesto: React.FC<ManifestoProps> = ({ isNight }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 25,
        restDelta: 0.001,
    });

    const heroOpacity = useTransform(smoothProgress, [0.0, 0.07, 0.17], [1, 1, 0]);
    const heroY = useTransform(smoothProgress, [0.0, 0.22], [0, -220]);

    const outroOpacity = useTransform(smoothProgress, [0.81, 0.92, 1.0], [0, 1, 1]);
    const outroY = useTransform(smoothProgress, [0.81, 0.92], [40, 0]);

    const scrollPromptOpacity = useTransform(smoothProgress, [0.0, 0.80, 0.90], [1, 1, 0]);
    const scrollPromptY = useTransform(smoothProgress, [0.0, 0.80, 0.90], [0, 0, -50]);
    const elementsPromptOpacity = useTransform(smoothProgress, [0.93, 0.97, 1.0], [0, 1, 1]);

    useEffect(() => {
        let isNavigating = false;
        let lastWheelTime = 0;
        let scrollAccumulator = 0;

        const scrollToFast = (targetY: number, customDuration: number = 0.5) => {
            // Instantly kill native scroll momentum on mobile so there's no stutter/delay
            document.documentElement.style.overflow = 'hidden';

            const startY = window.scrollY;

            animate(startY, targetY, {
                duration: customDuration,
                ease: [0.33, 1, 0.68, 1], // snappy easing
                onUpdate: (latest) => window.scrollTo(0, latest),
                onComplete: () => {
                    document.documentElement.style.overflow = '';
                    isNavigating = false;
                    scrollAccumulator = 0;
                }
            });
        };

        const handleWheel = (e: WheelEvent) => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            if (rect.top <= 10 && rect.bottom >= window.innerHeight - 10) {
                if (isNavigating) {
                    e.preventDefault();
                    return;
                }

                const now = Date.now();
                if (now - lastWheelTime > 150) {
                    scrollAccumulator = 0;
                }
                lastWheelTime = now;
                scrollAccumulator += e.deltaY;

                if (scrollAccumulator > 650 && rect.bottom > window.innerHeight + 10) {
                    e.preventDefault();
                    isNavigating = true;
                    scrollToFast(window.scrollY + rect.bottom - window.innerHeight);
                } else if (scrollAccumulator < -650 && rect.top < -10) {
                    e.preventDefault();
                    isNavigating = true;
                    scrollToFast(window.scrollY + rect.top);
                }
            }
        };

        // --- Touch Logic (Mobile) ---
        let touchStartY = 0;
        let touchStartTime = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            if (rect.top <= 10 && rect.bottom >= window.innerHeight - 10) {
                if (isNavigating) return;

                const touchEndY = e.changedTouches[0].clientY;
                const touchEndTime = Date.now();
                const deltaY = touchStartY - touchEndY; // positive -> swipe up -> scroll down
                const deltaTime = Math.max(1, touchEndTime - touchStartTime);
                const velocity = Math.abs(deltaY) / deltaTime;

                // Typical swipe velocity is 0.2 - 1.2px/ms. 
                // A strong, intentional hard flick is > 1.8px/ms
                const isHardSwipe = velocity > 1.8 && Math.abs(deltaY) > 80;

                if (isHardSwipe) {
                    if (deltaY > 0 && rect.bottom > window.innerHeight + 10) {
                        isNavigating = true;
                        if (e.cancelable) e.preventDefault();
                        scrollToFast(window.scrollY + rect.bottom - window.innerHeight);
                    } else if (deltaY < 0 && rect.top < -10) {
                        isNavigating = true;
                        if (e.cancelable) e.preventDefault();
                        scrollToFast(window.scrollY + rect.top);
                    }
                } else if (Math.abs(deltaY) > 30) {
                    // NORMAL SWIPE: One swipe = one text
                    const currentOffset = -rect.top;
                    const vh = window.innerHeight;
                    const currentIndex = Math.round(currentOffset / vh);
                    
                    let targetIndex = currentIndex + (deltaY > 0 ? 1 : -1);
                    // clamp inside manifesto
                    targetIndex = Math.max(0, Math.min(CONFIG.screens - 1, targetIndex));
                    
                    const targetScrollY = Math.round(window.scrollY + rect.top + (targetIndex * vh));
                    // Keep normal swipes snappy; slightly faster when swipe velocity is higher.
                    const normalSwipeSpeedFactor = Math.min(1, velocity / 1.8);
                    const normalSwipeDuration = 0.36 - (normalSwipeSpeedFactor * 0.08);
                    
                    isNavigating = true;
                    if (e.cancelable) e.preventDefault();
                    scrollToFast(targetScrollY, normalSwipeDuration);
                }
            }
        };

        const wheelOptions = { passive: false } as const;
        window.addEventListener('wheel', handleWheel, wheelOptions);
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return (
        <section
            id="manifesto-section"
            ref={containerRef}
            className="relative w-full bg-transparent z-20 touch-pan-y snap-start"
            style={{ height: `calc(var(--app-vh) * ${CONFIG.scrollIndexMax})` }}
        >
            <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
                {Array.from({ length: CONFIG.screens }).map((_, i) => (
                    <div key={i} className={i === CONFIG.screens - 1 ? '' : 'snap-start'} style={{ height: 'var(--app-vh)' }} />
                ))}
            </div>

            <div className="sticky top-0 h-[var(--app-vh)] overflow-hidden z-10 w-full relative">
                <div className="w-full relative h-[var(--app-vh)] supports-[height:100svh]:!h-[100svh]">
                    <GridCanvas isNight={isNight} progress={smoothProgress} />

                    <Hero isNight={isNight} opacity={heroOpacity} y={heroY} />

                    <ScrollText text="Pollution your nose can't smell." progress={smoothProgress} range={CONFIG.lineRanges.pollution} />
                    <ScrollText text="Blue light that steals your sleep." progress={smoothProgress} range={CONFIG.lineRanges.blueLight} />
                    <ScrollText text="Stress that sticks." progress={smoothProgress} range={CONFIG.lineRanges.stress} />

                    <Outro opacity={outroOpacity} y={outroY} />

                    <motion.div
                        style={{ opacity: scrollPromptOpacity, y: scrollPromptY }}
                        className="absolute bottom-20 md:bottom-24 left-0 right-0 flex flex-col items-center gap-2 text-white z-30 pointer-events-none"
                    >
                        <span className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold">Scroll to adapt</span>
                        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
                            <ChevronDown className="w-5 h-5 opacity-70" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        style={{ opacity: elementsPromptOpacity }}
                        className="absolute bottom-20 md:bottom-24 left-0 right-0 flex flex-col items-center gap-2 text-white z-30 pointer-events-none"
                    >
                        <span className="text-xs md:text-sm font-extrabold uppercase tracking-widest opacity-90 scale-90 drop-shadow-md">
                            MEET THE ELEMENTS
                        </span>
                        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
                            <ChevronDown size={20} />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
