
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    tagline: string;
    description: string;
    ingredients: Array<{ name: string; benefit: string }>;
    usage: Array<{ type: string; instruction: string }>;
    price: string;
    color: string;
  } | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className={`p-8 text-white relative overflow-hidden`} style={{ backgroundColor: product.color }}>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                    <X size={24} />
                </button>
                <h2 className="text-4xl font-bold mb-2">{product.name}</h2>
                <p className="text-xl font-medium opacity-90 italic">{product.tagline}</p>
            </div>

            <div className="p-8 text-brand-night">
                {/* Description */}
                <div className="mb-8">
                    <p className="text-lg font-medium leading-relaxed opacity-80">{product.description}</p>
                </div>

                {/* Usage */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-8" style={{ backgroundColor: product.color }}></span>
                        Usage Rituals
                    </h3>
                    <div className="grid gap-4">
                        {product.usage.map((use, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="font-bold text-sm uppercase tracking-wider block mb-1" style={{ color: product.color }}>{use.type}</span>
                                <span className="font-medium">{use.instruction}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ingredients */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                         <span className="w-2 h-8" style={{ backgroundColor: product.color }}></span>
                        Key Elements
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {product.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: product.color }}></div>
                                <div>
                                    <div className="font-bold text-sm">{ing.name}</div>
                                    <div className="text-xs opacity-70 font-medium">{ing.benefit}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / CTA */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="text-2xl font-bold">{product.price}</div>
                    <button 
                        className="flex items-center gap-2 px-8 py-3 rounded-full text-white font-bold text-lg transition-transform hover:scale-105 shadow-lg"
                        style={{ backgroundColor: product.color }}
                    >
                        <ShoppingBag size={20} />
                        Add to Cart
                    </button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};