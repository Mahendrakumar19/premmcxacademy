'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: number;
  fullname: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (course: CartItem) => void;
  removeFromCart: (courseId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  isInCart: (courseId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lms_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lms_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (course: CartItem) => {
    setItems((prevItems) => {
      // Check if course already exists
      if (prevItems.some((item) => item.id === course.id)) {
        return prevItems;
      }
      return [...prevItems, course];
    });
  };

  const removeFromCart = (courseId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== courseId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  const isInCart = (courseId: number) => {
    return items.some((item) => item.id === courseId);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getItemCount,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
