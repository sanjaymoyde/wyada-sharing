import React, { useState, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { fetchProducts } from './services/products';
import { CartItem, Product } from './types';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { MobileDebugOverlay } from './components/MobileDebugOverlay';

const App: React.FC = () => {
  const [isNight, setIsNight] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse cart items", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [earthProduct, setEarthProduct] = useState<Product | null>(null);
  const [waterProduct, setWaterProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchProducts();
        setAllProducts(products);
        const earth = products.find(p => p.handle === 'mesa-re-balance-cleansing-clay');
        const water = products.find(p => p.handle === 'crest-all-defence-skin-sorbet');
        if (earth) setEarthProduct(earth);
        if (water) setWaterProduct(water);
      } catch (error) {
        console.error("Failed to load products", error);
      }
    };
    loadProducts();
  }, []);

  const toggleTheme = () => {
    setIsNight((prev) => {
      const newState = !prev;
      if (newState) setShowToast(true);
      return newState;
    });
  };

  const addToCart = (product: { id: string; variantId: number; name: string; price: number; color: string }) => {
    if (!Number.isFinite(product.variantId) || product.variantId <= 0) {
      console.warn(`Skipping addToCart for "${product.id}" because no valid Shopify variant is loaded yet.`);
      return;
    }
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    setCartItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  // Shared props passed to every Home route
  const homeProps = {
    isNight,
    toggleTheme,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    isCartOpen,
    setIsCartOpen,
    isMenuOpen,
    setIsMenuOpen,
    earthProduct,
    waterProduct,
    allProducts,
    showToast,
    setShowToast,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home {...homeProps} initialSection="origin" />} />
        <Route path="/menu" element={<Home {...homeProps} initialMenuOpen={true} />} />
        <Route path="/cart" element={<Home {...homeProps} initialCartOpen={true} />} />
        <Route path="/element-intro" element={<Home {...homeProps} initialSection="elements" />} />
        <Route path="/mesa" element={<Home {...homeProps} initialSection="earth" />} />
        <Route path="/crest" element={<Home {...homeProps} initialSection="water" />} />
        <Route path="/upcoming" element={<Home {...homeProps} initialSection="future" />} />
        <Route path="/community" element={<Home {...homeProps} initialSection="circle" />} />
        <Route path="/bigpicture" element={<Home {...homeProps} initialSection="bigpicture" />} />
        <Route
          path="/product/:handle"
          element={
            <ProductDetails
              isNight={isNight}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              addToCart={addToCart}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <MobileDebugOverlay />
    </BrowserRouter>
  );
};

export default App;
