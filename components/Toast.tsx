import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, CheckCircle } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ show, message, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-4 left-1/2 z-[100] bg-brand-night text-brand-lime px-6 py-3 rounded-full shadow-2xl border border-brand-lime/20 flex items-center gap-3 backdrop-blur-md"
        >
          <Moon size={18} className="fill-brand-lime" />
          <span className="text-sm font-medium whitespace-nowrap">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};