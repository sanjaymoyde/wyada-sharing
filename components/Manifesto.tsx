import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// --- Types ---
interface ManifestoProps {
    isNight: boolean;
}

interface Point3D {
    x: number; y: number; z: number; originalZ: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    phase: number;
}

// --- Configuration ---
// Centralized config for easier control over timing and content
const CONFIG = {
    scrollHeightVh: 500,
    screens: 5,
    scrollIndexMax: 4, // 500vh total, 0-1 maps to 0-4 indexes
    // Ranges: [enterStart, enterEnd, exitStart, exitEnd]
    // Sequential ranges to ensure only one heading visible at a time
    slides: [
        {
            id: 'pollution',
            content: "Pollution your nose can't smell.",
            range: [0.5, 0.9, 1.1, 1.5] as [number, number, number, number],
            size: 'normal'
        },
        {
            id: 'stress',
            content: "Stress that sticks.",
            range: [1.5, 1.9, 2.1, 2.5] as [number, number, number, number],
            size: 'normal'
        },
        {
            id: 'blue-light',
            content: "Blue light that steals your sleep.",
            range: [2.5, 2.9, 3.1, 3.5] as [number, number, number, number],
            size: 'normal'
        },
        {
            id: 'resolution',
            content: "Your senses weren't designed for this world.",
            subContent: "But your routine can be.",
            range: [3.5, 3.9, 4.1, 4.6] as [number, number, number, number],
            size: 'large'
        }
    ],
    // Removed separate finalText entry as it's merged above
    heroExit: [0, 0.5] as [number, number]
};

// --- Components ---

const GridCanvas: React.FC<{ isNight: boolean; scrollProgress: MotionValue<number> }> = ({ isNight, scrollProgress }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef(0);

    useMotionValueEvent(scrollProgress, "change", (latest) => {
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

            ctx.beginPath(); // Start ONE path for all lines
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
            }
            ctx.stroke(); // Draw EVERYTHING in one go
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

    return < canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

const ManifestoParticles: React.FC<{ scrollProgress: MotionValue<number> }> = ({ scrollProgress }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const scrollRef = useRef(0);
    const physicsState = useRef({ alpha: 0, smog: 0, glare: 0, noise: 0 });

    useMotionValueEvent(scrollProgress, "change", (latest) => {
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

        const particleCount = width < 768 ? 60 : 120;
        for (let i = 0; i < particleCount; i++) {
            particlesRef.current.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                phase: Math.random() * Math.PI * 2,
            });
        }

        const animate = () => {
            const p = scrollRef.current;

            const getWeight = (peak: number, width: number = 3) => {
                const dist = Math.abs(p - peak);
                return Math.max(0, 1 - (dist / width));
            };

            const targetSmog = getWeight(5, 3);
            const targetNoise = getWeight(11, 3);
            const targetGlare = getWeight(17, 3);
            const targetResolution = getWeight(25, 3);

            const targetAlpha = (p > 2 && p < 29.5) ? 0.6 + (targetGlare * 0.4) + (targetResolution * 0.3) : 0;

            const ease = 0.1;
            physicsState.current.alpha += (targetAlpha - physicsState.current.alpha) * ease;
            physicsState.current.smog += (targetSmog - physicsState.current.smog) * ease;
            physicsState.current.glare += (targetGlare - physicsState.current.glare) * ease;
            physicsState.current.noise += (targetNoise - physicsState.current.noise) * ease;

            const { alpha, glare, noise } = physicsState.current;
            ctx.clearRect(0, 0, width, height);

            if (alpha > 0.01) {
                ctx.fillStyle = 'white';
                const freezeFactor = Math.max(glare, noise);
                const moveSpeed = (1 - freezeFactor);

                particlesRef.current.forEach(pt => {
                    if (moveSpeed > 0.01) {
                        pt.x += pt.vx * moveSpeed;
                        pt.y += pt.vy * moveSpeed;
                        if (pt.x < 0) pt.x = width;
                        if (pt.x > width) pt.x = 0;
                        if (pt.y < 0) pt.y = height;
                        if (pt.y > height) pt.y = 0;
                    }

                    let renderX = pt.x, renderY = pt.y;
                    if (noise > 0.01) {
                        const jitter = 15 * noise;
                        renderX += (Math.random() - 0.5) * jitter;
                        renderY += (Math.random() - 0.5) * jitter;
                    }

                    let size = pt.size;
                    let blur = 0;
                    if (glare > 0.01) {
                        const pulse = Math.sin(Date.now() * 0.002 + pt.phase);
                        size += size * pulse * 0.5 * glare;
                        blur = (60 + (pulse * 20)) * glare;
                    }

                    ctx.shadowColor = 'white';
                    ctx.shadowBlur = blur;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(renderX, renderY, size, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            requestAnimationFrame(animate);
        };
        animate();
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />;
};

// Vertical offset: incoming text starts near bottom of screen, rises into place
const SLIDE_OFFSET_PX = 250;

const ScrollFadeText: React.FC<{
    children: React.ReactNode;
    progress: MotionValue<number>;
    range: [number, number, number, number];
    className?: string;
}> = ({ children, progress, range, className }) => {
    // Opacity: fade in during enter, fade out during exit
    const opacity = useTransform(progress,
        [range[0], range[1], range[2], range[3]],
        [0, 1, 1, 0]
    );

    // Y transform: enter from bottom (+offset → 0), hold, exit upward (0 → -offset)
    const rawY = useTransform(progress,
        [range[0], range[1], range[2], range[3]],
        [SLIDE_OFFSET_PX, 0, 0, -SLIDE_OFFSET_PX]
    );
    const transform = useTransform(rawY, (v) => `translate3d(0, ${v}px, 0)`);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            style={{
                opacity,
                transform,
                backfaceVisibility: "hidden",
                willChange: "transform"
            }}
            className={className}
        >
            {/* STATIC WRAPPER — TEXT NEVER REPAINTS */}
            <div className="manifesto-text-static">
                {children}
            </div>
        </motion.div>
    );

};





export const Manifesto: React.FC<ManifestoProps> = ({ isNight }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Logic
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Remap 0-1 to 0-CONFIG.scrollIndexMax for tighter pacing, damped and clamped
    const scrollIndex = useTransform(scrollYProgress, [0, 1], [0, CONFIG.scrollIndexMax], { clamp: true });
    const textColor = 'text-white';

    // Animation Variants
    const heroContainerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const wordVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const subheadVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 0.9, y: 0,
            transition: { delay: 1.0, duration: 1.2, ease: "easeOut" }
        }
    };

    const promptVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 0.7, y: 0,
            transition: { delay: 1.4, duration: 1.0, ease: "easeOut" }
        }
    };

    // Hero Exit (retains fast exit)
    // Hero Exit (retains fast exit)
    const rawHeroExitOpacity = useTransform(scrollIndex, CONFIG.heroExit, [1, 0]);
    const heroExitOpacity = useTransform(rawHeroExitOpacity, (v) => Number(v.toFixed(2)));
    const rawHeroExitY = useTransform(scrollIndex, CONFIG.heroExit, [0, -20]);
    const heroExitTransform = useTransform(rawHeroExitY, (v) => `translate3d(0, ${Math.round(v)}px, 0)`);

    return (
        <section id="manifesto-section" ref={containerRef} className={`relative h-[${CONFIG.scrollHeightVh}vh] w-full bg-transparent z-20 touch-pan-y`}
            style={{ height: `${CONFIG.scrollHeightVh}vh` }}>

            <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
                {Array.from({ length: CONFIG.screens }).map((_, i) => (
                    <div
                        key={i}
                        className="h-screen snap-start"
                        style={i >= CONFIG.screens - 2 ? { scrollSnapStop: 'always' } : undefined}
                    />
                ))}
            </div>

            <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex flex-col items-start justify-center px-6 md:pl-12 md:pr-32 z-10">

                <motion.div className="absolute inset-0 z-0">
                    <GridCanvas isNight={isNight} scrollProgress={scrollIndex} />
                </motion.div>
                <ManifestoParticles scrollProgress={scrollIndex} />

                <div className="relative z-30 w-full max-w-5xl text-left flex flex-col items-start justify-center min-h-[60vh]">

                    {/* HERO SECTION */}
                    <motion.div
                        style={{
                            opacity: heroExitOpacity,
                            transform: heroExitTransform
                        }}
                        className="absolute top-[35%] -translate-y-1/2 left-0 w-full pointer-events-none"
                    >
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="flex flex-col items-start gap-4 md:gap-6"
                        >
                            <motion.div
                                variants={heroContainerVariants}
                                className={`text-3xl sm:text-4xl md:text-7xl font-bold leading-tight flex flex-wrap gap-[0.2em] ${isNight ? 'text-brand-lime' : 'text-white'}`}
                            >
                                {["Cities", "are", "evolvings."].map((word, i) => (
                                    <motion.span
                                        key={i}
                                        variants={wordVariants}
                                        className="inline-block"
                                    >
                                        <span className="inline-block">{word}</span>
                                    </motion.span>
                                ))}
                            </motion.div>
                            <motion.div
                                variants={subheadVariants}
                                className="flex flex-wrap justify-start gap-[0.3em] text-base sm:text-lg md:text-2xl font-bold tracking-tight text-white/90"
                            >
                                <span>Your body...</span>
                                <span>not so much.</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* GENERATED SLIDES */}
                    {CONFIG.slides.map((slide: any) => (
                        <ScrollFadeText
                            key={slide.id}
                            progress={scrollIndex}
                            range={slide.range}
                            className={`absolute top-[35%] -translate-y-1/2 left-0 w-full ${slide.size === 'large' ? 'pl-6 md:pl-20' : ''}`}
                        >
                            <div className="flex flex-col items-start gap-4">
                                <div className={`${slide.size === 'large' ? 'text-2xl sm:text-3xl md:text-5xl' : 'text-xl sm:text-2xl md:text-4xl'} font-bold leading-tight ${textColor}`}>
                                    {slide.content}
                                </div>
                                {slide.subContent && (
                                    <div className="text-base sm:text-lg md:text-2xl font-bold tracking-tight text-white/90">
                                        {slide.subContent}
                                    </div>
                                )}
                            </div>
                        </ScrollFadeText>
                    ))}

                    {/* FINAL TEXT REMOVED - merged into last slide above */}
                </div>

                {/* SCROLL PROMPTS - Adjust opacity for 8 screens (max index 7) */}
                <motion.div
                    style={{ opacity: useTransform(scrollIndex, [0, 6.2, 6.6], [1, 1, 0]) }}
                    className={`absolute bottom-20 md:bottom-24 left-0 right-0 flex flex-col items-center gap-2 ${textColor} pointer-events-none`}
                >
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={promptVariants}
                        className="flex flex-col items-center gap-2"
                    >
                        <span className="uppercase tracking-[0.2em] text-xs md:text-sm font-bold opacity-80">Scroll to adapt</span>
                        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <ChevronDown size={20} />
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.div
                    style={{ opacity: useTransform(scrollIndex, [6.6, 7.0], [0, 1]) }}
                    className={`absolute bottom-20 md:bottom-24 left-0 right-0 flex flex-col items-center gap-2 ${textColor} pointer-events-none`}
                >
                    <span className="uppercase tracking-[0.2em] text-xs md:text-sm font-bold opacity-80">Meet the Elements</span>
                    <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <ChevronDown size={20} />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
