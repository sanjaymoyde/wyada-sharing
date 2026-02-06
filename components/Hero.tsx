// import React, { useRef, useEffect } from 'react';
// import { motion, useScroll, useTransform, Variants } from 'framer-motion';
// import { ChevronDown } from 'lucide-react';

// interface HeroProps {
//   isNight: boolean;
// }

// interface Point3D {
//     x: number;
//     y: number;
//     z: number;
//     ox: number;
//     oy: number;
//     oz: number;
//     vx: number;
//     vy: number;
//     vz: number;
// }

// export const Hero: React.FC<HeroProps> = ({ isNight }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const { scrollY } = useScroll();
  
//   // Exit animation: Text scales down (goes back), blurs out, and fades.
//   const scaleExit = useTransform(scrollY, [0, 350], [1, 0.8]);
//   const blurExit = useTransform(scrollY, [0, 350], ["0px", "10px"]);
//   const opacityExit = useTransform(scrollY, [0, 350], [1, 0]);
//   const pointerEvents = useTransform(scrollY, [0, 350], ["auto", "none"]);

//   // Canvas Logic (3D Perspective Grid)
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const container = containerRef.current;
//     if (!canvas || !container) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     let width = container.offsetWidth;
//     let height = container.offsetHeight;
    
//     // Camera / Grid Settings
//     const fov = 400; // Field of view
//     const viewDist = 100; // Distance to viewing plane
//     const gridWidth = 6000; // Wide enough to cover screen at bottom
//     const gridDepth = 6000; // Deep enough
//     const cols = 50; // Increased density for better terrain detail
//     const rows = 50;
    
//     // Position the floor
//     const floorY = 350; 
//     const camY = 0; 

//     const points: Point3D[] = [];
//     const mouse = { x: -1000, y: -1000 };

//     // Pre-calculate heights for "Forest" vs "City"
//     const forestMap: number[] = [];
//     const cityMap: number[] = [];

//     // Initialize 3D Points (Floor Plane)
//     const initGrid = () => {
//         points.length = 0;
//         forestMap.length = 0;
//         cityMap.length = 0;
        
//         const spacingX = gridWidth / cols;
//         const spacingZ = gridDepth / rows;
//         // Start Z slightly negative to pull grid closer to camera (covering bottom of screen)
//         const zStart = -200;

//         for (let r = 0; r <= rows; r++) {
//             for (let c = 0; c <= cols; c++) {
//                 const x = (c * spacingX) - (gridWidth / 2);
//                 const z = r * spacingZ + zStart;
//                 const y = floorY;

//                 // 1. Natural Landscape (Uneven, rolling terrain)
//                 // Using lower frequency waves for hills and higher frequency for texture
//                 const landscapeNoise = Math.sin(x * 0.004) * 60 + 
//                                      Math.cos(z * 0.005) * 50 + 
//                                      Math.sin(x * 0.015 + z * 0.01) * 15;
//                 const forestY = y + landscapeNoise; // Natural variation around floor level

//                 // 2. City Blocks (Hard Extrusions)
//                 // Quantize to blocks to create rectangular shapes
//                 const blockSize = 5; // Grid cells per building block
//                 const bx = Math.floor(c / blockSize);
//                 const bz = Math.floor(r / blockSize);
                
//                 // Deterministic random hash based on block coordinates
//                 const blockSeed = Math.abs(Math.sin(bx * 12.9898 + bz * 78.233));
                
//                 const isBuilding = blockSeed > 0.65; // 35% chance of building
//                 // Extrude UP: Subtracting from y moves point up in this perspective
//                 const buildHeight = isBuilding ? (blockSeed * 300 + 50) : 0; 
                
//                 // City state: either a building roof or flat street level
//                 const cityY = y - buildHeight;

//                 points.push({
//                     x, y, z,
//                     ox: x, oy: y, oz: z,
//                     vx: 0, vy: 0, vz: 0
//                 });
                
//                 forestMap.push(forestY);
//                 cityMap.push(cityY);
//             }
//         }
//     };

//     const handleResize = () => {
//         width = container.offsetWidth;
//         height = container.offsetHeight;
//         canvas.width = width;
//         canvas.height = height;
//     };
    
//     handleResize();
//     initGrid();
//     window.addEventListener('resize', handleResize);

//     // Mouse Interaction
//     const handleMouseMove = (e: MouseEvent) => {
//         const rect = canvas.getBoundingClientRect();
//         mouse.x = e.clientX - rect.left;
//         mouse.y = e.clientY - rect.top;
//     };

//     // Gyroscope Interaction
//     const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
//         // Only proceed if we have sensor data
//         if (e.gamma === null || e.beta === null) return;

//         // Adjust these values to tune sensitivity
//         // gamma: left/right tilt (-90 to 90)
//         // beta: front/back tilt (-180 to 180)
        
//         // Normalizing Gamma (Left/Right)
//         // Range: -25deg to +25deg maps to full screen width
//         const tiltX = Math.min(25, Math.max(-25, e.gamma));
//         const normalizedX = (tiltX + 25) / 50; 

//         // Normalizing Beta (Front/Back)
//         // Assuming holding phone around 45deg
//         // Range: 20deg to 70deg maps to full screen height
//         const tiltY = Math.min(70, Math.max(20, e.beta));
//         const normalizedY = (tiltY - 20) / 50;

//         mouse.x = normalizedX * width;
//         mouse.y = normalizedY * height;
//     };

//     window.addEventListener('mousemove', handleMouseMove);
//     window.addEventListener('deviceorientation', handleDeviceOrientation);

//     let animationFrameId: number;

//     const animate = () => {
//         ctx.clearRect(0, 0, width, height);
        
//         // GRADIENT STROKE
//         // From bottom (height) to slightly above center (height * 0.4)
//         const gradient = ctx.createLinearGradient(0, height, 0, height * 0.4);
//         const r = isNight ? 196 : 255;
//         const g = isNight ? 205 : 255;
//         const b = isNight ? 80 : 255;
        
//         gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
//         gradient.addColorStop(0.33, `rgba(${r}, ${g}, ${b}, 0.3)`); // Solid until 20% screen height
//         gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`); // Transparent at top

//         ctx.strokeStyle = gradient;
//         ctx.lineWidth = 1;

//         const cx = width / 2;
//         const cy = height / 2;

//         for (let i = 0; i < points.length; i++) {
//             const p = points[i];
//             const forestY = forestMap[i];
//             const cityY = cityMap[i];

//             // Perspective Projection for Interaction Check
//             const scale = fov / (fov + p.z + viewDist);
//             const sx = p.x * scale + cx;
//             const sy = (p.y + camY) * scale + cy;

//             // Morph Logic based on Mouse/Gyro Distance
//             const dx = mouse.x - sx;
//             const dy = mouse.y - sy;
//             const dist = Math.sqrt(dx * dx + dy * dy);
//             const maxDist = 350; // Radius of city effect

//             // Target Height (Lerp between Forest and City)
//             let targetY = forestY;
//             if (dist < maxDist) {
//                 const t = 1 - (dist / maxDist); // 0 at edge, 1 at center
//                 // Smoothstep for nicer transition
//                 const smoothT = t * t * (3 - 2 * t);
                
//                 // Make it subtle: multiply by a low intensity factor (e.g., 0.15)
//                 // This means it only transforms 15% towards the city shape
//                 const intensity = 0.15; 
//                 const blendedT = smoothT * intensity;
                
//                 targetY = forestY * (1 - blendedT) + cityY * blendedT;
//             }

//             // Smoothly animate Y
//             p.y += (targetY - p.y) * 0.08;

//             // Final Projection for Rendering
//             const renderScale = fov / (fov + p.z + viewDist);
//             const renderX = p.x * renderScale + cx;
//             const renderY = (p.y + camY) * renderScale + cy;

//             ctx.beginPath();

//             // Draw Horizontal Line
//             if (i % (cols + 1) < cols) {
//                 const nextP = points[i + 1];
//                 const nextScale = fov / (fov + nextP.z + viewDist);
//                 const nextX = nextP.x * nextScale + cx;
//                 const nextY = (nextP.y + camY) * nextScale + cy;
                
//                 ctx.moveTo(renderX, renderY);
//                 ctx.lineTo(nextX, nextY);
//             }
            
//             // Draw Vertical Line
//             if (i < points.length - (cols + 1)) {
//                 const belowP = points[i + (cols + 1)];
//                 const belowScale = fov / (fov + belowP.z + viewDist);
//                 const belowX = belowP.x * belowScale + cx;
//                 const belowY = (belowP.y + camY) * belowScale + cy;

//                 ctx.moveTo(renderX, renderY);
//                 ctx.lineTo(belowX, belowY);
//             }
            
//             ctx.stroke();
//         }
        
//         animationFrameId = requestAnimationFrame(animate);
//     };

//     animate();

//     return () => {
//         window.removeEventListener('resize', handleResize);
//         window.removeEventListener('mousemove', handleMouseMove);
//         window.removeEventListener('deviceorientation', handleDeviceOrientation);
//         cancelAnimationFrame(animationFrameId);
//     };
//   }, [isNight]);

//   // Animation Variants
//   const containerVariants: Variants = {
//     hidden: {},
//     visible: {
//       transition: {
//         staggerChildren: 0.2,
//         delayChildren: 0.2 
//       }
//     }
//   };

//   const wordVariants: Variants = {
//     hidden: { 
//       opacity: 0, 
//       scale: 1.5, 
//       filter: "blur(12px)" 
//     },
//     visible: { 
//       opacity: 1, 
//       scale: 1, 
//       filter: "blur(0px)",
//       transition: { 
//         duration: 1, 
//         ease: [0.16, 1, 0.3, 1] 
//       }
//     }
//   };

//   const secondaryTextVariant1: Variants = {
//     hidden: { opacity: 0, filter: "blur(10px)" },
//     visible: { 
//         opacity: 1, 
//         filter: "blur(0px)",
//         transition: { delay: 1.5, duration: 1.2, ease: "easeOut" }
//     }
//   };

//   const secondaryTextVariant2: Variants = {
//     hidden: { opacity: 0, filter: "blur(10px)" },
//     visible: { 
//         opacity: 1, 
//         filter: "blur(0px)",
//         transition: { delay: 2.0, duration: 1.2, ease: "easeOut" }
//     }
//   };

//   const promptVariant: Variants = {
//       hidden: { opacity: 0, y: 20 },
//       visible: { 
//           opacity: 1, 
//           y: 0,
//           transition: { delay: 3.0, duration: 1 }
//       }
//   };

//   const titleWords = ["Cities", "are", "evolving."];

//   return (
//     <section id="section-origin" ref={containerRef} className="relative w-full h-screen sticky top-0 z-0 overflow-hidden snap-start">
//       {/* Canvas for Perspective Grid */}
//       <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
//       <motion.div 
//         style={{ 
//             scale: scaleExit, 
//             filter: blurExit, 
//             opacity: opacityExit,
//             pointerEvents: pointerEvents
//         }}
//         className="relative z-10 w-full h-full flex flex-col items-start justify-center pl-6 md:pl-12 pr-32"
//       >
//         <div className="text-left w-full max-w-7xl flex flex-col items-start gap-4 -mt-20">
//             {/* Primary Headline */}
//             <motion.div 
//                 className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight ${isNight ? 'text-brand-lime' : 'text-white'}`}
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//             >
//                 {titleWords.map((word, i) => (
//                     <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.2em]">
//                         {word}
//                     </motion.span>
//                 ))}
//             </motion.div>

//             {/* Secondary Text Group */}
//             <div className={`flex flex-wrap justify-start gap-[0.3em] text-lg md:text-2xl font-bold tracking-tight ${isNight ? 'text-white/80' : 'text-white/90'}`}>
//                  <motion.span 
//                     variants={secondaryTextVariant1}
//                     initial="hidden"
//                     animate="visible"
//                  >
//                     Your body...
//                  </motion.span>
//                  <motion.span 
//                     variants={secondaryTextVariant2}
//                     initial="hidden"
//                     animate="visible"
//                  >
//                     not so much.
//                  </motion.span>
//             </div>
//         </div>

//         {/* Scroll Prompt - Positioned just above floating bar, centered relative to screen though */}
//         <motion.div 
//             variants={promptVariant}
//             initial="hidden"
//             animate="visible"
//             className={`absolute bottom-24 left-0 right-0 flex flex-col items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] font-medium ${isNight ? 'text-white/40' : 'text-white/60'}`}
//         >
//             <span>Scroll to adapt</span>
            
//             <motion.div
//                  animate={{ y: [0, 5, 0] }}
//                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
//             >
//                 <ChevronDown size={20} />
//             </motion.div>
//         </motion.div>

//       </motion.div>
//     </section>
//   );
// };








import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  isNight: boolean;
}

interface Point3D {
    x: number;
    y: number;
    z: number;
    ox: number;
    oy: number;
    oz: number;
    vx: number;
    vy: number;
    vz: number;
}

export const Hero: React.FC<HeroProps> = ({ isNight }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Faster exit animation to prevent blank screens
  const scaleExit = useTransform(scrollY, [0, 200], [1, 0.8]);
  const blurExit = useTransform(scrollY, [0, 200], ["0px", "10px"]);
  const opacityExit = useTransform(scrollY, [0, 200], [1, 0]);
  const pointerEvents = useTransform(scrollY, [0, 200], ["auto", "none"]);

  // Canvas Logic (3D Perspective Grid)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.offsetWidth;
    let height = container.offsetHeight;
    
    // Camera / Grid Settings
    const fov = 400;
    const viewDist = 100;
    const gridWidth = 6000;
    const gridDepth = 6000;
    const cols = 50;
    const rows = 50;
    
    const floorY = 350; 
    const camY = 0; 

    const points: Point3D[] = [];
    const mouse = { x: -1000, y: -1000 };

    const forestMap: number[] = [];
    const cityMap: number[] = [];

    const initGrid = () => {
        points.length = 0;
        forestMap.length = 0;
        cityMap.length = 0;
        
        const spacingX = gridWidth / cols;
        const spacingZ = gridDepth / rows;
        const zStart = -200;

        for (let r = 0; r <= rows; r++) {
            for (let c = 0; c <= cols; c++) {
                const x = (c * spacingX) - (gridWidth / 2);
                const z = r * spacingZ + zStart;
                const y = floorY;

                const landscapeNoise = Math.sin(x * 0.004) * 60 + 
                                     Math.cos(z * 0.005) * 50 + 
                                     Math.sin(x * 0.015 + z * 0.01) * 15;
                const forestY = y + landscapeNoise;

                const blockSize = 5;
                const bx = Math.floor(c / blockSize);
                const bz = Math.floor(r / blockSize);
                
                const blockSeed = Math.abs(Math.sin(bx * 12.9898 + bz * 78.233));
                
                const isBuilding = blockSeed > 0.65;
                const buildHeight = isBuilding ? (blockSeed * 300 + 50) : 0; 
                
                const cityY = y - buildHeight;

                points.push({
                    x, y, z,
                    ox: x, oy: y, oz: z,
                    vx: 0, vy: 0, vz: 0
                });
                
                forestMap.push(forestY);
                cityMap.push(cityY);
            }
        }
    };

    const handleResize = () => {
        width = container.offsetWidth;
        height = container.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    };
    
    handleResize();
    initGrid();
    window.addEventListener('resize', handleResize);

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

    let animationFrameId: number;

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

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const forestY = forestMap[i];
            const cityY = cityMap[i];

            const scale = fov / (fov + p.z + viewDist);
            const sx = p.x * scale + cx;
            const sy = (p.y + camY) * scale + cy;

            const dx = mouse.x - sx;
            const dy = mouse.y - sy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 350;

            let targetY = forestY;
            if (dist < maxDist) {
                const t = 1 - (dist / maxDist);
                const smoothT = t * t * (3 - 2 * t);
                const intensity = 0.15; 
                const blendedT = smoothT * intensity;
                
                targetY = forestY * (1 - blendedT) + cityY * blendedT;
            }

            p.y += (targetY - p.y) * 0.08;

            const renderScale = fov / (fov + p.z + viewDist);
            const renderX = p.x * renderScale + cx;
            const renderY = (p.y + camY) * renderScale + cy;

            ctx.beginPath();

            if (i % (cols + 1) < cols) {
                const nextP = points[i + 1];
                const nextScale = fov / (fov + nextP.z + viewDist);
                const nextX = nextP.x * nextScale + cx;
                const nextY = (nextP.y + camY) * nextScale + cy;
                
                ctx.moveTo(renderX, renderY);
                ctx.lineTo(nextX, nextY);
            }
            
            if (i < points.length - (cols + 1)) {
                const belowP = points[i + (cols + 1)];
                const belowScale = fov / (fov + belowP.z + viewDist);
                const belowX = belowP.x * belowScale + cx;
                const belowY = (belowP.y + camY) * belowScale + cy;

                ctx.moveTo(renderX, renderY);
                ctx.lineTo(belowX, belowY);
            }
            
            ctx.stroke();
        }
        
        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
        cancelAnimationFrame(animationFrameId);
    };
  }, [isNight]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2 
      }
    }
  };

  const wordVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 1.5, 
      filter: "blur(12px)" 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { 
        duration: 1, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  const secondaryTextVariant1: Variants = {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { 
        opacity: 1, 
        filter: "blur(0px)",
        transition: { delay: 1.5, duration: 1.2, ease: "easeOut" }
    }
  };

  const secondaryTextVariant2: Variants = {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { 
        opacity: 1, 
        filter: "blur(0px)",
        transition: { delay: 2.0, duration: 1.2, ease: "easeOut" }
    }
  };

  const promptVariant: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
          opacity: 1, 
          y: 0,
          transition: { delay: 3.0, duration: 1 }
      }
  };

  const titleWords = ["Cities", "are", "evolving."];

  return (
    <section id="section-origin" ref={containerRef} className="relative w-full h-screen sticky top-0 z-0 overflow-hidden snap-start">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      <motion.div 
        style={{ 
            scale: scaleExit, 
            filter: blurExit, 
            opacity: opacityExit,
            pointerEvents: pointerEvents
        }}
        className="relative z-10 w-full h-full flex flex-col items-start justify-center px-6 md:pl-12 md:pr-32"
      >
        <div className="text-left w-full max-w-7xl flex flex-col items-start gap-3 md:gap-4 -mt-20">
            <motion.div 
                className={`text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight ${isNight ? 'text-brand-lime' : 'text-white'}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {titleWords.map((word, i) => (
                    <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.2em]">
                        {word}
                    </motion.span>
                ))}
            </motion.div>

            <div className={`flex flex-wrap justify-start gap-[0.3em] text-base sm:text-lg md:text-2xl font-bold tracking-tight ${isNight ? 'text-white/80' : 'text-white/90'}`}>
                 <motion.span 
                    variants={secondaryTextVariant1}
                    initial="hidden"
                    animate="visible"
                 >
                    Your body...
                 </motion.span>
                 <motion.span 
                    variants={secondaryTextVariant2}
                    initial="hidden"
                    animate="visible"
                 >
                    not so much.
                 </motion.span>
            </div>
        </div>

        <motion.div 
            variants={promptVariant}
            initial="hidden"
            animate="visible"
            className={`absolute bottom-20 md:bottom-24 left-0 right-0 flex flex-col items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] font-medium ${isNight ? 'text-white/40' : 'text-white/60'}`}
        >
            <span>Scroll to adapt</span>
            
            <motion.div
                 animate={{ y: [0, 5, 0] }}
                 transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
                <ChevronDown size={20} />
            </motion.div>
        </motion.div>

      </motion.div>
    </section>
  );
};