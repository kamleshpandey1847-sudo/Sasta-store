/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import RoleSelection from './components/RoleSelection';
import UserStore from './components/UserStore';
import CreatorDashboard from './components/CreatorDashboard';
import { Product, UserRole } from './types';

export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [username, setUsername] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Persistent Dark Mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('sasta_store_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('sasta_store_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('sasta_store_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Load role and username on mount
  useEffect(() => {
    const isRememberMe = localStorage.getItem('sasta_store_remember_me') !== 'false';
    const savedRole = isRememberMe 
      ? (localStorage.getItem('sasta_store_role') || sessionStorage.getItem('sasta_store_role'))
      : sessionStorage.getItem('sasta_store_role');
      
    const savedUsername = isRememberMe
      ? (localStorage.getItem('sasta_store_username') || sessionStorage.getItem('sasta_store_username'))
      : sessionStorage.getItem('sasta_store_username');

    if (savedRole === 'user' || savedRole === 'creator') {
      setRole(savedRole as UserRole);
    }
    if (savedUsername) {
      setUsername(savedUsername);
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        // Normalize products to prevent uncaught type errors due to missing fields in DB/JSON backups
        const normalized = Array.isArray(data) ? data.map((p: any) => ({
          ...p,
          name: p.name || 'Unnamed Product',
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
          category: p.category || 'Uncategorized',
          images: Array.isArray(p.images) && p.images.length > 0 
            ? p.images 
            : [p.images && typeof p.images === 'string' ? p.images : "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"],
          description: p.description || '',
          inStock: p.inStock !== false
        })) : [];
        setProducts(normalized);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleSelectRole = (newRole: UserRole, userIdent?: string, remember: boolean = true) => {
    setRole(newRole);
    if (newRole) {
      if (remember) {
        localStorage.setItem('sasta_store_remember_me', 'true');
        localStorage.setItem('sasta_store_role', newRole);
        if (userIdent) {
          setUsername(userIdent);
          localStorage.setItem('sasta_store_username', userIdent);
        }
      } else {
        localStorage.setItem('sasta_store_remember_me', 'false');
        localStorage.removeItem('sasta_store_role');
        localStorage.removeItem('sasta_store_username');
        sessionStorage.setItem('sasta_store_role', newRole);
        if (userIdent) {
          setUsername(userIdent);
          sessionStorage.setItem('sasta_store_username', userIdent);
        }
      }
    } else {
      localStorage.removeItem('sasta_store_role');
      localStorage.removeItem('sasta_store_username');
      sessionStorage.removeItem('sasta_store_role');
      sessionStorage.removeItem('sasta_store_username');
      setUsername('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-emerald-200 transition-colors duration-300">
      
      {/* Role view controller */}
      {role === null ? (
        <RoleSelection onSelectRole={handleSelectRole} isDark={isDark} toggleTheme={toggleTheme} />
      ) : role === 'user' ? (
        <UserStore 
          products={products} 
          refreshProducts={fetchProducts} 
          onLogout={() => handleSelectRole(null)} 
          onSwitchToCreator={() => handleSelectRole('creator', undefined, true)}
          username={username}
          showToast={showToast}
          isDark={isDark}
          toggleTheme={toggleTheme}
          isLoading={loading}
        />
      ) : (
        <CreatorDashboard 
          products={products} 
          refreshProducts={fetchProducts} 
          onLogout={() => handleSelectRole(null)} 
          showToast={showToast}
          isDark={isDark}
          toggleTheme={toggleTheme}
          isLoading={loading}
        />
      )}

      {/* Modern Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-xs w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-lg border text-xs font-bold flex items-center justify-between gap-2.5 animate-bounce-subtle ${
              toast.type === 'success' 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-indigo-600 text-white border-indigo-500'
            }`}
          >
            <span>{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-white/80 hover:text-white font-extrabold cursor-pointer text-sm"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
