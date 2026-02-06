import React, { useState, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { fetchProducts } from './services/products';
import { CartItem, Product } from './types';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';

const App: React.FC = () => {
  const [isNight, setIsNight] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false); // Lifted state for Toast
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
      if (newState) {
        setShowToast(true);
      }
      return newState;
    });
  };

  const addToCart = (product: { id: string; variantId: number; name: string; price: number; color: string }) => {
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
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    }));
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Base Route */}
        <Route
          path="/"
          element={
            <Home
              isNight={isNight}
              toggleTheme={toggleTheme}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              allProducts={allProducts}
              showToast={showToast}
              setShowToast={setShowToast}
              initialSection="origin"
            />
          }
        />

        {/* Menu Route */}
        <Route
          path="/menu"
          element={
            <Home
              isNight={isNight}
              toggleTheme={toggleTheme}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              allProducts={allProducts}
              showToast={showToast}
              setShowToast={setShowToast}
              initialMenuOpen={true}
            />
          }
        />

        {/* Cart Route */}
        <Route
          path="/cart"
          element={
            <Home
              isNight={isNight}
              toggleTheme={toggleTheme}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              allProducts={allProducts}
              showToast={showToast}
              setShowToast={setShowToast}
              initialCartOpen={true}
            />
          }
        />

        {/* Deep Link Routes */}
        <Route
          path="/element-intro"
          element={
            <Home
              isNight={isNight}
              toggleTheme={toggleTheme}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              allProducts={allProducts}
              showToast={showToast}
              setShowToast={setShowToast}
              initialSection="elements"
            />
          }
        />
        <Route
          path="/mesa"
          element={
            <Home
              isNight={isNight}
              toggleTheme={toggleTheme}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              allProducts={allProducts}
              showToast={showToast}
              setShowToast={setShowToast}
              initialSection="earth"
            />
          }
        />
        <Route
          path="/crest"
          element={
            <Home
              isNight={isNight}
              toggleTheme={toggleTheme}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              allProducts={allProducts}
              showToast={showToast}
              setShowToast={setShowToast}
              initialSection="water"
            />
          }
        />
        <Route
          path="/upcoming"
          element={
            <Home
              isNight={isNight}
              toggleTheme={toggleTheme}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              allProducts={allProducts}
              showToast={showToast}
              setShowToast={setShowToast}
              initialSection="future"
            />
          }
        />
        <Route
          path="/community"
          element={
            <Home
              isNight={isNight}
              toggleTheme={toggleTheme}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              allProducts={allProducts}
              showToast={showToast}
              setShowToast={setShowToast}
              initialSection="circle"
            />
          }
        />
        <Route
          path="/bigpicture"
          element={
            <Home
              isNight={isNight}
              toggleTheme={toggleTheme}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              earthProduct={earthProduct}
              waterProduct={waterProduct}
              allProducts={allProducts}
              showToast={showToast}
              setShowToast={setShowToast}
              initialSection="bigpicture"
            />
          }
        />
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
    </BrowserRouter>
  );
};

export default App;
