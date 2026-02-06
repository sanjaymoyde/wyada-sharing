import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BLOG_POSTS } from '../constants';
import { ArrowRight } from 'lucide-react';

interface BlogScrollProps {
    isNight: boolean;
}

export const BlogScroll: React.FC<BlogScrollProps> = ({ isNight }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-55%"]);

  const textColor = isNight ? 'text-brand-lime' : 'text-white';
  const cardBg = isNight ? 'bg-white/10' : 'bg-white/20';

  return (
    <section ref={targetRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="absolute top-12 left-12 z-10">
             <h2 className={`text-5xl md:text-7xl font-bold leading-none ${textColor}`}>
                take a step <br/> back and look
             </h2>
        </div>

        <motion.div style={{ x }} className="flex gap-8 px-12 pt-32">
          {BLOG_POSTS.map((post) => (
            <div 
                key={post.id}
                className={`group relative h-[50vh] w-[80vw] md:w-[30vw] flex-shrink-0 overflow-hidden rounded-sm ${cardBg} backdrop-blur-sm transition-colors hover:bg-opacity-30`}
            >
              <img 
                src={post.image} 
                alt={post.title} 
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              <div className="absolute bottom-0 p-8 w-full">
                <span className="text-brand-lime text-xs font-bold uppercase tracking-widest mb-2 block">{post.category}</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">{post.title}</h3>
                <div className="flex items-center gap-2 text-white group-hover:text-brand-lime transition-colors cursor-pointer">
                    <span className="text-sm font-medium">Read Story</span>
                    <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
          <div className="w-[20vw] flex-shrink-0 flex items-center justify-center">
             <button className={`text-xl font-bold underline decoration-2 underline-offset-4 ${textColor}`}>View All Stories</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
