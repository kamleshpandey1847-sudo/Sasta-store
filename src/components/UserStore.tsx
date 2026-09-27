import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductImageSlider } from './ProductImageSlider';
import { 
  ShoppingBag, 
  ShoppingCart, 
  ClipboardList, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Plus, 
  Minus, 
  Check, 
  MapPin, 
  Phone, 
  User, 
  Tag, 
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ArrowUpDown,
  SlidersHorizontal,
  Zap,
  Upload,
  Camera,
  Video,
  Compass,
  Star,
  MessageSquare,
  ThumbsUp,
  Flame,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Truck,
  Bell,
  ZoomIn,
  Copy,
  Clock,
  HelpCircle,
  ChevronUp,
  Calendar,
  AlertCircle,
  Receipt,
  Navigation,
  Shirt,
  Tv,
  Footprints,
  Home,
  Heart,
  Trash2,
  Sun,
  Moon,
  RefreshCw,
  Settings,
  Globe,
  Volume2,
  VolumeX,
  Headphones,
  MessageCircle,
  Instagram,
  Send,
  CheckCircle2,
  PartyPopper,
  PackageCheck,
  Bot,
  Loader2
} from 'lucide-react';
import { Product, Order, CustomerDetails, Notification } from '../types';

interface UserStoreProps {
  products: Product[];
  refreshProducts: () => void;
  onLogout: () => void;
  onSwitchToCreator?: () => void;
  username: string;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  isDark?: boolean;
  toggleTheme?: () => void;
  isLoading?: boolean;
}

const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between animate-pulse">
    {/* Skeleton Image Container */}
    <div className="relative aspect-square bg-slate-200/80 dark:bg-slate-800/90 w-full overflow-hidden">
      <div className="absolute top-2.5 left-2.5 w-14 h-5 bg-slate-300/80 dark:bg-slate-700/70 rounded-lg"></div>
      <div className="absolute top-2.5 right-2.5 w-8 h-8 bg-slate-300/80 dark:bg-slate-700/70 rounded-xl"></div>
      <div className="absolute bottom-2.5 right-2.5 w-16 h-4 bg-slate-300/80 dark:bg-slate-700/70 rounded-lg"></div>
    </div>

    {/* Skeleton Details */}
    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200/90 dark:bg-slate-800 rounded-md w-11/12"></div>
        <div className="h-3.5 bg-slate-200/70 dark:bg-slate-800/60 rounded-md w-3/4"></div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
        <div className="space-y-1.5">
          <div className="h-2.5 w-8 bg-slate-200/80 dark:bg-slate-800 rounded"></div>
          <div className="h-5 w-16 bg-slate-300/90 dark:bg-slate-700/80 rounded-md"></div>
        </div>
        <div className="h-9 w-24 bg-emerald-100/80 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'All':
      return Compass;
    case 'Electronics':
      return Tv;
    case 'Fashion & Clothes':
      return Shirt;
    case 'Footwear':
      return Footprints;
    case 'Home & Kitchen':
      return Home;
    case 'Beauty & Personal Care':
      return Sparkles;
    case 'Groceries':
      return ShoppingBag;
    case 'Toys & Kids':
      return Flame;
    default:
      return Tag;
  }
};

const getDefaultReviewsForProduct = (product: Product) => {
  return [];
};

export const STORE_LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', greeting: 'नमस्ते! सस्ते स्टोर में स्वागत है' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', greeting: 'Welcome to SastaStore' },
  { code: 'hinglish', name: 'Hinglish', native: 'Hinglish', flag: '💬', greeting: 'Welcome! SastaStore me apka swagat hai' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🚩', greeting: 'नमस्कार! स्वस्त स्टोअरमध्ये आपले स्वागत आहे' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🌸', greeting: 'স্বাগতম! সস্তা স্টোরে আপনাকে স্বাগতম' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🏛️', greeting: 'வரவேற்கிறோம்! சஸ்தா கடையில் உங்களை வரவேற்கிறோம்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '📜', greeting: 'స్వాగతం! సస్తా స్టోర్‌కు మీకు స్వాగతం' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🪁', greeting: 'નમસ્તે! સસ્તા સ્ટોરમાં તમારું સ્વાગત છે' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🪕', greeting: 'ਜੀ ਆਇਆਂ ਨੂੰ! ਸਸਤਾ ਸਟੋਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ' },
];

export const playOrderSuccessChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const t0 = ctx.currentTime;

    // Crisp, bright rising pentatonic chime melody (C5 -> E5 -> G5 -> C6)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.2 },     // C5
      { freq: 659.25, time: 0.08, duration: 0.22 },  // E5
      { freq: 783.99, time: 0.16, duration: 0.28 },  // G5
      { freq: 1046.50, time: 0.26, duration: 0.75 }, // C6 bell chime
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, t0 + note.time);
      gain.gain.setValueAtTime(0.4, t0 + note.time);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.time + note.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0 + note.time);
      osc.stop(t0 + note.time + note.duration);
    });

    // Metallic overtone on C6 for sparkling finish
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(2093.00, t0 + 0.26);
    overtoneGain.gain.setValueAtTime(0.25, t0 + 0.26);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.85);
    overtone.connect(overtoneGain);
    overtoneGain.connect(ctx.destination);
    overtone.start(t0 + 0.26);
    overtone.stop(t0 + 0.85);
  } catch (e) {
    console.warn("Audio Context playback disabled or unsupported:", e);
  }
};

export default function UserStore({ products, refreshProducts, onLogout, onSwitchToCreator, username, showToast, isDark, toggleTheme, isLoading = false }: UserStoreProps) {
  const [activeTab, setActiveTab] = useState<'store' | 'cart' | 'orders' | 'notifications' | 'profile' | 'wishlist'>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc'>('featured');

  // Secret 3-tap detection for Creator Portal in UserStore
  const [storeLogoClicks, setStoreLogoClicks] = useState(0);
  const [lastStoreLogoClickTime, setLastStoreLogoClickTime] = useState(0);
  const [showSecretCreatorModal, setShowSecretCreatorModal] = useState(false);
  const [secretPasscode, setSecretPasscode] = useState('');
  const [secretError, setSecretError] = useState('');

  const handleStoreLogoClick = () => {
    const now = Date.now();
    if (now - lastStoreLogoClickTime < 1500) {
      const newClicks = storeLogoClicks + 1;
      setStoreLogoClicks(newClicks);
      if (newClicks >= 3) {
        setStoreLogoClicks(0);
        setShowSecretCreatorModal(true);
        setSecretPasscode('');
        setSecretError('');
      }
    } else {
      setStoreLogoClicks(1);
    }
    setLastStoreLogoClickTime(now);
  };

  const handleSecretCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretPasscode === 'ombro12') {
      setShowSecretCreatorModal(false);
      setSecretPasscode('');
      setSecretError('');
      if (onSwitchToCreator) {
        onSwitchToCreator();
      } else {
        onLogout();
      }
    } else {
      setSecretError('Incorrect secret passcode! / गलत सीक्रेट पासकोड!');
      setSecretPasscode('');
    }
  };

  // Pull-to-refresh feed state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);
  const touchStartYRef = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 15) {
      touchStartYRef.current = e.touches[0].clientY;
    } else {
      touchStartYRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current !== null && window.scrollY <= 15) {
      const currentY = e.touches[0].clientY;
      const dy = currentY - touchStartYRef.current;
      if (dy > 0) {
        const dist = Math.min(dy * 0.4, 90);
        setPullDistance(dist);
      } else {
        setPullDistance(0);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= 50 && !isRefreshingFeed) {
      setIsRefreshingFeed(true);
      setPullDistance(55);
      try {
        await refreshProducts();
        showToast?.("Products updated! / उत्पाद अपडेट हो गए!", "success");
      } catch (e) {
        console.error("Refresh failed", e);
      } finally {
        setTimeout(() => {
          setIsRefreshingFeed(false);
          setPullDistance(0);
        }, 600);
      }
    } else {
      setPullDistance(0);
    }
    touchStartYRef.current = null;
  };

  // Settings, Language & Sound State
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('sasta_user_lang') || 'hi';
    } catch (e) {
      return 'hi';
    }
  });

  // Header scroll direction state (disappears on scroll down, reappears on scroll up)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current + 12 && currentScrollY > 60) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollYRef.current - 6 || currentScrollY <= 20) {
        setIsHeaderVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [lastPlacedOrderDetails, setLastPlacedOrderDetails] = useState<Order | null>(null);

  // Interactive Gemini AI Support Chat state
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: '🙏 **Namaste! I am SastaStore AI Assistant.**\n\nI can answer any questions regarding SastaStore products, order tracking, Cash on Delivery (COD), 7-day free returns, or wholesale creator pricing. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);

  const handleSendAiQuery = async (queryText?: string) => {
    const textToSend = (queryText || aiChatInput).trim();
    if (!textToSend || aiChatLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatMessages(prev => [...prev, userMsg]);
    if (!queryText) setAiChatInput('');
    setAiChatLoading(true);

    try {
      const conversationHistory = aiChatMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/gemini/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          conversationHistory
        })
      });

      const data = await res.json();
      const aiReply = data.reply || "I am SastaStore AI Assistant. I can help answer questions about SastaStore orders, delivery, and products.";

      setAiChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error('AI chat error:', error);
      setAiChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I am having trouble connecting right now. Please try again or reach out on Instagram (@editing_verse_03)!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiChatLoading(false);
    }
  };
  
  // Floating Back to Top state & scroll listener
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Favorites / Wishlist state & functions (persisted to localStorage)
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sasta_store_favorites') || localStorage.getItem('sasta_store_wishlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse favorites from localStorage", e);
    }
    return [];
  });

  const saveFavoritesToStorage = (ids: string[]) => {
    try {
      localStorage.setItem('sasta_store_favorites', JSON.stringify(ids));
      localStorage.setItem('sasta_store_wishlist', JSON.stringify(ids));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  };

  const fetchWishlist = async () => {
    if (!username) return;
    try {
      const res = await fetch(`/api/wishlist?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.productIds)) {
          setWishlistProductIds(prev => {
            const combined = Array.from(new Set([...prev, ...data.productIds]));
            saveFavoritesToStorage(combined);
            return combined;
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch wishlist", e);
    }
  };

  const toggleWishlist = async (productId: string) => {
    let updatedIds: string[] = [];
    const isAlreadyFavorited = wishlistProductIds.includes(productId);

    if (isAlreadyFavorited) {
      updatedIds = wishlistProductIds.filter(id => id !== productId);
      showToast?.("Product removed from favorites / पसंदीदा से हटाया गया", "info");
    } else {
      updatedIds = [...wishlistProductIds, productId];
      showToast?.("Product saved to favorites! / पसंदीदा में जोड़ा गया!", "success");
    }

    setWishlistProductIds(updatedIds);
    saveFavoritesToStorage(updatedIds);

    // Sync to backend if username is logged in
    if (username) {
      try {
        await fetch("/api/wishlist/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, productId })
        });
      } catch (e) {
        console.error("Failed to sync favorites to backend", e);
      }
    }
  };

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`lastReadNotifTime_${username.toLowerCase()}`);
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });

  const fetchUserNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await fetch(`/api/notifications?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    refreshProducts();
    if (username) {
      fetchUserNotifications();
      fetchWishlist();
    }
  }, [username]);

  useEffect(() => {
    if (activeTab === 'store') {
      refreshProducts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      const now = Date.now();
      setLastReadTime(now);
      try {
        localStorage.setItem(`lastReadNotifTime_${username.toLowerCase()}`, String(now));
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeTab, username]);

  const unreadNotifCount = notifications.filter(
    (n) => new Date(n.createdAt).getTime() > lastReadTime
  ).length;

  // Rating state for ordered items
  const [orderRatings, setOrderRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`sasta_product_ratings_${username || 'guest'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleRateProduct = (orderId: string, itemId: string, rating: number, label: string) => {
    const key = `${orderId}-${itemId}`;
    const next = { ...orderRatings, [key]: rating };
    setOrderRatings(next);
    try {
      localStorage.setItem(`sasta_product_ratings_${username || 'guest'}`, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    showToast?.(`Thank you! Rated ${rating}/5 ⭐ (${label}) / धन्यवाद! रेटिंग दर्ज की गई`, "success");
  };

  // Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number; selectedSize?: string }[]>([]);

  // Helper to get size-specific price for a product
  const getProductPriceForSize = (product: Product, selectedSize?: string): number => {
    if (selectedSize && product.sizePrices && product.sizePrices[selectedSize] !== undefined) {
      const customPrice = product.sizePrices[selectedSize];
      const parsed = typeof customPrice === 'string' ? parseFloat(customPrice) : customPrice;
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return product.price;
  };

  // Helper to get price display string for a product card
  const getPriceDisplayForCard = (product: Product): string => {
    const prices = [product.price];
    if (product.sizePrices) {
      Object.values(product.sizePrices).forEach(p => {
        const parsed = typeof p === 'string' ? parseFloat(p) : p;
        if (!isNaN(parsed) && parsed > 0) {
          prices.push(parsed);
        }
      });
    }
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `₹${product.price}`;
    }
    return `₹${minPrice} - ₹${maxPrice}`;
  };

  // Custom confirmation modal state to bypass iframe modal restrictions
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    actionLabel: string;
    onConfirm: () => void;
  } | null>(null);
  
  // Selected product for Details View Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [modalSelectedSize, setModalSelectedSize] = useState<string>('');

  // Lightbox state for product images full screen view
  const [lightboxData, setLightboxData] = useState<{
    images: string[];
    currentIndex: number;
    productName: string;
  } | null>(null);

  // Lightbox zoom and pan states
  const [isZoomed, setIsZoomed] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 50, y: 50 });

  // Reset zoom state when the image changes or lightbox closes
  useEffect(() => {
    setIsZoomed(false);
    setPanPosition({ x: 50, y: 50 });
  }, [lightboxData?.currentIndex, lightboxData?.productName]);

  // Keyboard navigation listener for full screen lightbox
  useEffect(() => {
    if (!lightboxData) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxData(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxData(prev => {
          if (!prev) return null;
          const newIdx = prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1;
          return { ...prev, currentIndex: newIdx };
        });
      } else if (e.key === 'ArrowRight') {
        setLightboxData(prev => {
          if (!prev) return null;
          const newIdx = prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1;
          return { ...prev, currentIndex: newIdx };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxData]);

  // Auto-sync the first size when opening product detail
  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
        setModalSelectedSize(selectedProduct.sizes[0]);
      } else {
        setModalSelectedSize('');
      }
    } else {
      setModalSelectedSize('');
    }
  }, [selectedProduct]);

  // Reviews & Rating states
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Fetch reviews when selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      setLoadingReviews(true);
      fetch(`/api/reviews?productId=${selectedProduct.id}`)
        .then(res => res.json())
        .then(data => {
          const defaults = getDefaultReviewsForProduct(selectedProduct);
          setProductReviews([...data, ...defaults]);
        })
        .catch(err => {
          console.error("Failed to load reviews:", err);
          setProductReviews(getDefaultReviewsForProduct(selectedProduct));
        })
        .finally(() => {
          setLoadingReviews(false);
        });
      setModalQuantity(1);
    } else {
      setProductReviews([]);
      setNewComment('');
      setNewRating(5);
    }
  }, [selectedProduct]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!username) {
      showToast?.("Please log in to submit a review / समीक्षा सबमिट करने के लिए कृपया लॉग इन करें।", "error");
      return;
    }
    if (!newComment.trim()) {
      showToast?.("Please enter a comment / कृपया टिप्पणी दर्ज करें।", "error");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          username: username,
          rating: newRating,
          comment: newComment
        })
      });

      if (res.ok) {
        const addedReview = await res.json();
        // Insert on top of reviews list
        setProductReviews(prev => [addedReview, ...prev]);
        setNewComment('');
        setNewRating(5);
        showToast?.("Review posted successfully! / समीक्षा सफलतापूर्वक पोस्ट की गई!", "success");
      } else {
        const data = await res.json();
        showToast?.(data.error || "Failed to post review.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast?.("Failed to submit review.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Checkout modal & form state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [isAddressHelpOpen, setIsAddressHelpOpen] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<'all' | 'pincode' | 'city' | 'building' | 'colony' | 'landmark'>('all');
  const [formData, setFormData] = useState<CustomerDetails>({
    name: '',
    mobile: '',
    address: '',
    state: '',
    cityVillageTown: '',
    landmark: '',
    villageName: '',
    pincode: '',
    houseNoBuilding: ''
  });

  // Load saved address from localStorage on mount or username change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sasta_saved_address_${username || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setFormData(prev => ({
            ...prev,
            ...parsed
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load saved address:", e);
    }
  }, [username]);

  // Auto-reset step to 1 when checkout opens
  useEffect(() => {
    if (isCheckoutOpen) {
      setCheckoutStep(1);
    }
  }, [isCheckoutOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Local storage for user order tracking
  const [myOrderIds, setMyOrderIds] = useState<string[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'past'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetailModal, setSelectedOrderDetailModal] = useState<Order | null>(null);
  const [photoUploadModalItem, setPhotoUploadModalItem] = useState<{ orderId: string; itemId: string; name: string } | null>(null);
  const [showReturnPolicyModal, setShowReturnPolicyModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [supportOrder, setSupportOrder] = useState<Order | null>(null);
  const [supportCategory, setSupportCategory] = useState<string>('delivery');
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [supportPhone, setSupportPhone] = useState<string>('');
  const [supportSubmitted, setSupportSubmitted] = useState<boolean>(false);
  const [supportTicketId, setSupportTicketId] = useState<string>('');

  // Auto-fill phone and reset state when support opens
  useEffect(() => {
    if (supportOrder) {
      setSupportPhone(supportOrder.customerDetails?.mobile || '');
      setSupportCategory('delivery');
      setSupportMessage('');
      setSupportSubmitted(false);
      setSupportTicketId(`TKT-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [supportOrder]);

  // Load cart and order list from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sasta_store_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }

    const savedOrderIds = localStorage.getItem('sasta_store_order_ids');
    if (savedOrderIds) {
      try {
        setMyOrderIds(JSON.parse(savedOrderIds));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: { product: Product; quantity: number; selectedSize?: string }[]) => {
    setCart(newCart);
    localStorage.setItem('sasta_store_cart', JSON.stringify(newCart));
  };

  // Fetch actual order statuses from backend
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchMyOrders();
    }
  }, [activeTab, username]);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const userOrders: Order[] = await res.json();
        setMyOrders(userOrders);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setConfirmAction({
      message: "Are you sure you want to cancel this order? / क्या आप इस ऑर्डर को रद्द करना चाहते हैं?",
      actionLabel: "Yes, Cancel Order / हाँ, रद्द करें",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Cancelled' })
          });
          if (res.ok) {
            fetchMyOrders();
            showToast?.("Order cancelled successfully / ऑर्डर सफलतापूर्वक रद्द कर दिया गया।", "success");
          } else {
            const data = await res.json();
            showToast?.(data.error || "Failed to cancel order.", "error");
          }
        } catch (err) {
          console.error("Error canceling order:", err);
          showToast?.("Failed to cancel order.", "error");
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  const handleReturnOrder = (orderId: string) => {
    setConfirmAction({
      message: "Are you sure you want to return this order? / क्या आप इस ऑर्डर को वापस करना चाहते हैं?",
      actionLabel: "Yes, Return Order / हाँ, वापस करें",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Returned' })
          });
          if (res.ok) {
            fetchMyOrders();
            showToast?.("Order returned successfully / ऑर्डर सफलतापूर्वक वापस कर दिया गया।", "success");
          } else {
            const data = await res.json();
            showToast?.(data.error || "Failed to return order.", "error");
          }
        } catch (err) {
          console.error("Error returning order:", err);
          showToast?.("Failed to return order.", "error");
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  // Add to cart
  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    const existingIdx = cart.findIndex(
      item => item.product.id === product.id && item.selectedSize === selectedSize
    );
    let newCart = [...cart];
    if (existingIdx > -1) {
      newCart[existingIdx].quantity += quantity;
    } else {
      newCart.push({ product, quantity, selectedSize });
    }
    saveCart(newCart);
  };

  // Update quantity
  const updateQuantity = (productId: string, delta: number, selectedSize?: string) => {
    let newCart = cart.map(item => {
      if (item.product.id === productId && item.selectedSize === selectedSize) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    });
    saveCart(newCart);
  };

  // Remove from cart
  const removeFromCart = (productId: string, selectedSize?: string) => {
    const newCart = cart.filter(
      item => !(item.product.id === productId && item.selectedSize === selectedSize)
    );
    saveCart(newCart);
  };

  // Cart math
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (getProductPriceForSize(item.product, item.selectedSize) * item.quantity), 0);
  const cartOriginalTotal = cart.reduce((acc, item) => {
    const itemPrice = getProductPriceForSize(item.product, item.selectedSize);
    const itemOriginal = item.product.originalPrice && item.product.originalPrice > itemPrice ? item.product.originalPrice : itemPrice;
    return acc + (itemOriginal * item.quantity);
  }, 0);
  const cartSavings = cartOriginalTotal - cartSubtotal;

  // Search & filter & sort
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  // Handle Checkout submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast?.("Please enter receiver name! / कृपया नाम दर्ज करें!", "error");
      return;
    }
    if (!formData.mobile || formData.mobile.length !== 10) {
      showToast?.("Please enter a valid 10-digit contact number! / कृपया 10 अंकों का नंबर दर्ज करें!", "error");
      return;
    }
    if (!formData.pincode || formData.pincode.length !== 6) {
      showToast?.("Please enter a valid 6-digit pincode! / कृपया 6 अंकों का पिनकोड दर्ज करें!", "error");
      return;
    }
    if (!formData.cityVillageTown?.trim()) {
      showToast?.("Please enter city! / कृपया शहर दर्ज करें!", "error");
      return;
    }
    if (!formData.state) {
      showToast?.("Please select state! / कृपया राज्य चुनें!", "error");
      return;
    }
    if (!formData.address?.trim()) {
      showToast?.("Please enter road name, area or colony! / कृपया रोड / एरिया का नाम दर्ज करें!", "error");
      return;
    }

    setIsSubmitting(true);
    const orderPayload = {
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
        priceAtPurchase: getProductPriceForSize(item.product, item.selectedSize),
        quantity: item.quantity,
        selectedSize: item.selectedSize
      })),
      customerDetails: formData,
      username: username
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const orderData: Order = await res.json();
        
        // Save order ID to localStorage
        const updatedOrderIds = [...myOrderIds, orderData.id];
        setMyOrderIds(updatedOrderIds);
        localStorage.setItem('sasta_store_order_ids', JSON.stringify(updatedOrderIds));

        // Clear cart
        saveCart([]);
        setOrderSuccess(orderData.id);
        setLastPlacedOrderDetails(orderData);
        setShowOrderSuccessModal(true);
        setIsCheckoutOpen(false);
        
        // Play celebratory chime sound effect!
        playOrderSuccessChime();
        
        showToast?.("Order placed successfully! / ऑर्डर सफलतापूर्वक स्वीकार कर लिया गया!", "success");
      } else {
        const err = await res.json();
        showToast?.(err.error || "Failed to place order. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast?.("Error submitting order.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="user-store-root" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col pb-24 md:pb-8 transition-colors">
      
      {/* Top Banner & Desktop/Mobile Navigation Header */}
      <header className={`sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-xs px-3 sm:px-4 md:px-6 py-2 flex items-center justify-between transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Logo with Secret 3-Tap Creator Handler */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none group" 
            onClick={() => {
              handleStoreLogoClick();
              setActiveTab('store');
            }}
            title="Sasta Store"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-display text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none block">
                sasta store <span className="text-emerald-500 font-bold">.in</span>
              </span>
              <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wide flex items-center gap-1 leading-none mt-0.5">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Lowest Price Guaranteed
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'store' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'cart' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              Cart
              {cartItemCount > 0 && (
                <span className="bg-emerald-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              My Orders
            </button>
            <button
              id="nav-wishlist-desktop-btn"
              onClick={() => setActiveTab('wishlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wishlist' ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistProductIds.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              Favorites
              {wishlistProductIds.length > 0 && (
                <span className="bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                  {wishlistProductIds.length}
                </span>
              )}
            </button>
            <button
              id="nav-notifications-desktop-btn"
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'notifications' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              Notifs
              {unreadNotifCount > 0 && (
                <span className="bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>
            <button
              id="nav-profile-desktop-btn"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'profile' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Profile
            </button>

            {/* Desktop Help Link */}
            <button
              id="nav-help-desktop-btn"
              onClick={() => setIsHelpOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 text-slate-500 hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
              title="Help & Customer Support / सहायता"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              Help
            </button>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Language Selector Pill */}
          <button
            id="header-lang-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-all border border-slate-200/80 dark:border-slate-700 text-xs font-bold cursor-pointer"
            title="Change Language / भाषा बदलें"
          >
            <span className="text-xs">
              {STORE_LANGUAGES.find(l => l.code === selectedLanguage)?.flag || '🇮🇳'}
            </span>
            <span className="hidden sm:inline font-mono uppercase font-bold text-[10px]">
              {selectedLanguage}
            </span>
            <Globe className="w-3 h-3 text-emerald-600" />
          </button>

          {/* Settings Modal Button */}
          <button
            id="header-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            title="Settings / सेटिंग्स"
          >
            <Settings className="w-4 h-4" />
          </button>

          {toggleTheme && (
            <button
              id="user-store-theme-toggle"
              onClick={toggleTheme}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
          )}

          {/* Top Header Wishlist Button (Set little down & slightly bigger) */}
          <button
            id="header-wishlist-btn"
            onClick={() => setActiveTab('wishlist')}
            className={`relative p-2 mt-1 text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer ${
              activeTab === 'wishlist' ? 'text-rose-500 bg-rose-50 dark:bg-slate-800' : ''
            }`}
            title="Favorites / पसंदीदा"
          >
            <Heart className={`w-5.5 h-5.5 ${wishlistProductIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {wishlistProductIds.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-extrabold text-[9px] min-w-[17px] h-4.5 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                {wishlistProductIds.length}
              </span>
            )}
          </button>

          {/* Top Header Cart Button (Set little down & slightly bigger) */}
          <button
            id="header-cart-btn"
            onClick={() => setActiveTab('cart')}
            className={`relative p-2 mt-1 text-slate-700 dark:text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer ${
              activeTab === 'cart' ? 'text-emerald-600 bg-emerald-50 dark:bg-slate-800' : ''
            }`}
            title="Shopping Cart / कार्ट"
          >
            <ShoppingCart className="w-5.5 h-5.5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white font-extrabold text-[9px] min-w-[17px] h-4.5 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            id="user-logout-btn"
            onClick={onLogout}
            className="text-[11px] font-extrabold px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
            title="Logout / लॉगआउट करें"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Secret Creator Modal Overlay */}
      <AnimatePresence>
        {showSecretCreatorModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 relative text-left"
            >
              <button 
                onClick={() => setShowSecretCreatorModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Secret Creator Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Enter the secret passcode to unlock Creator & Seller management portal.
              </p>
              <form onSubmit={handleSecretCreatorSubmit} className="space-y-4">
                <div>
                  <input 
                    type="password"
                    value={secretPasscode}
                    onChange={(e) => {
                      setSecretPasscode(e.target.value);
                      if (secretError) setSecretError('');
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-center text-lg tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                {secretError && (
                  <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl text-center border border-rose-100 dark:border-rose-900/50">
                    {secretError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center"
                >
                  Verify & Open Creator Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container - fully responsive layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6">

        <AnimatePresence mode="wait">
          
          {/* 1. STORE TAB */}
          {activeTab === 'store' && (
            <motion.div
              key="store-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 relative touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Pull-to-refresh Mobile Gesture Indicator */}
              <AnimatePresence>
                {(pullDistance > 0 || isRefreshingFeed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: isRefreshingFeed ? 52 : pullDistance, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="overflow-hidden flex items-center justify-center w-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 rounded-2xl text-emerald-700 dark:text-emerald-300 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold select-none">
                      {isRefreshingFeed ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                          <span>Updating products... / उत्पाद अपडेट हो रहे हैं...</span>
                        </>
                      ) : pullDistance >= 50 ? (
                        <>
                          <ArrowDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 rotate-180 transition-transform duration-200" />
                          <span>Release to refresh / रीफ्रेश करने के लिए छोड़ें</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown 
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-transform duration-100" 
                            style={{ transform: `rotate(${Math.min((pullDistance / 50) * 180, 180)}deg)` }}
                          />
                          <span>Pull down to refresh / रीफ्रेश करने के लिए नीचे खींचें</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Promotional Hero Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 md:p-8 shadow-lg shadow-teal-100/40 relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20">
                    Grand Sale Live
                  </span>
                  <h3 className="font-display text-2xl md:text-4xl font-extrabold mt-3.5 leading-tight tracking-tight">
                    Double savings on direct store orders!
                  </h3>
                  <p className="text-teal-100 text-xs md:text-sm mt-2 max-w-lg leading-relaxed">
                    Direct products from local creators at unmatchable wholesale rates. No middlemen, no extra charges.
                  </p>
                </div>
                <div className="absolute right-4 md:right-12 bottom-1/2 translate-y-1/2 w-48 h-48 bg-white/5 rounded-full flex items-center justify-center border border-white/5 pointer-events-none">
                  <ShoppingBag className="w-24 h-24 text-white/10" />
                </div>
              </div>

              {/* Search Bar & Category Filter Tabs - Premium, Fully Unified */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs space-y-5">
                {/* Search input with status */}
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-2 pointer-events-none">
                      <Search className="w-5 h-5 text-emerald-600" />
                    </div>
                    <input
                      id="user-search-input"
                      type="text"
                      placeholder="Search sasta products by name, category, description... / उत्पादों को खोजें..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-10 py-3.5 bg-slate-50 hover:bg-slate-50/60 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800 text-sm shadow-inner transition-all placeholder:text-slate-400 placeholder:font-normal animate-fade-in"
                    />
                    {searchQuery && (
                      <button
                        id="clear-search-btn"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <button
                    id="user-refresh-products-btn"
                    onClick={() => {
                      refreshProducts();
                      showToast?.("Products list updated! / उत्पादों की सूची अपडेट की गई!", "success");
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-emerald-600 border border-slate-200/80 rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                    title="Refresh Products / रीफ्रेश करें"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Horizontal Category Filter Tabs */}
                <div className="border-t border-slate-100/80 pt-4">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Filter by Category / श्रेणियाँ
                      </span>
                      {selectedCategory !== 'All' && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100/50">
                          Active: {selectedCategory}
                        </span>
                      )}
                    </div>
                    {selectedCategory !== 'All' && (
                      <button
                        id="reset-category-btn"
                        onClick={() => setSelectedCategory('All')}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        Reset / रीसेट करें
                      </button>
                    )}
                  </div>

                  {/* Wrapped Category Filter Tabs with Icons and counts */}
                  <div className="flex flex-wrap gap-2 pb-1" id="category-tabs-scroll">
                    {categories.map(cat => {
                      const count = cat === 'All' 
                        ? products.length 
                        : products.filter(p => p.category === cat).length;
                      
                      const IconComponent = getCategoryIcon(cat);
                      const isActive = selectedCategory === cat;

                      return (
                        <button
                          id={`category-tab-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`flex items-center gap-2 px-4.5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer relative shrink-0 ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15 scale-[1.02]'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/30'
                          }`}
                        >
                          <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                          <span>{cat}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                            isActive 
                              ? 'bg-emerald-700 text-emerald-100' 
                              : 'bg-slate-200/80 text-slate-500'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time Search Result Statistics */}
                {(searchQuery || selectedCategory !== 'All' || sortBy !== 'featured') && (
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100/30 dark:border-emerald-800/40 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        Found <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{filteredProducts.length}</strong> products matching your filter
                      </span>
                    </div>
                    <button
                      id="clear-all-filters-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSortBy('featured');
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold underline cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Main Content Area: Sidebar + Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Left Sidebar Info Card (Visible only on desktop md+) */}
                <div className="hidden md:block space-y-6">
                  {/* Trust Badges */}
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 space-y-4 shadow-2xs">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Wholesale Prices</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">We source directly from creators to save you up to 70%!</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Local Deliveries</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">Quick shipping directly to villages, towns, & landmarks.</p>
                      </div>
                    </div>
                  </div>

                  {/* Shopping Help card */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Sasta Guarantee
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Every order is backed by direct communication with the creator. Enjoy transparent prices with no surprise processing fees!
                    </p>
                  </div>
                </div>

                {/* Right Area: Product Grid */}
                <div className="md:col-span-3 space-y-5">

                  {/* Filter & Sort Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 p-3.5 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Showing <span className="text-emerald-600 dark:text-emerald-400 font-black">{filteredProducts.length}</span> Products</span>
                    </div>

                    {/* Sorting Dropdown Menu */}
                    <div className="flex items-center gap-2">
                      <label htmlFor="product-sort-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer">
                        <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Sort by / क्रमबद्ध करें:</span>
                      </label>
                      <select
                        id="product-sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer shadow-2xs transition-all"
                      >
                        <option value="featured">Featured / डिफ़ॉल्ट</option>
                        <option value="price-low">Price: Low to High / मूल्य: कम से ज़्यादा</option>
                        <option value="price-high">Price: High to Low / मूल्य: ज़्यादा से कम</option>
                        <option value="name-asc">Name: A to Z / नाम: A से Z</option>
                        <option value="name-desc">Name: Z to A / नाम: Z से A</option>
                      </select>
                    </div>
                  </div>

                  {/* Product Grid */}
                  {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" id="product-grid-skeleton">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <ProductCardSkeleton key={n} />
                      ))}
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4 shadow-xs">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <h3 className="font-bold text-slate-800 text-sm">No products found</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Try checking spelling or exploring other categories.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" id="product-grid">
                      {filteredProducts.map(product => {
                        const discount = product.originalPrice 
                          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                          : 0;

                        return (
                          <div
                            id={`product-card-${product.id}`}
                            key={product.id}
                            onClick={() => {
                              setSelectedProduct(product);
                              setActiveImageIdx(0);
                            }}
                            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/50 transition-all flex flex-col cursor-pointer group"
                          >
                            {/* Image banner with Carousel / Slider */}
                            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800/80 overflow-hidden cursor-zoom-in group/img">
                              <ProductImageSlider
                                images={product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"]}
                                alt={product.name}
                                onImageClick={(idx) => {
                                  setLightboxData({
                                    images: product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"],
                                    currentIndex: idx,
                                    productName: product.name
                                  });
                                }}
                                showDots={true}
                                showBadge={true}
                                showArrows={true}
                                zoomOverlay={true}
                              />
                              {/* Heart Toggle Button (Saved to localStorage) */}
                              <button
                                id={`heart-toggle-${product.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWishlist(product.id);
                                }}
                                className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-xl transition-all shadow-md cursor-pointer ${
                                  wishlistProductIds.includes(product.id)
                                    ? 'bg-rose-500 text-white hover:bg-rose-600 scale-110 shadow-rose-500/30'
                                    : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-400 dark:text-slate-300 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 hover:scale-105'
                                }`}
                                title={wishlistProductIds.includes(product.id) ? "Remove from Favorites / पसंदीदा से हटाएं" : "Save to Favorites / पसंदीदा में जोड़ें"}
                                aria-label={wishlistProductIds.includes(product.id) ? "Remove from Favorites" : "Add to Favorites"}
                              >
                                <Heart className={`w-4 h-4 transition-transform ${wishlistProductIds.includes(product.id) ? 'fill-current text-white scale-110' : ''}`} />
                              </button>
                              {discount > 0 && (
                                <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-xs z-20 pointer-events-none">
                                  {discount}% OFF
                                </span>
                              )}
                              {product.inStock === false && (
                                <span className="absolute top-14 right-2.5 bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-xs animate-pulse z-20 pointer-events-none">
                                  Sold Out
                                </span>
                              )}
                              <span className="absolute bottom-2.5 left-2.5 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-lg z-20 pointer-events-none">
                                {product.category}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div className="space-y-1">
                                <h4 className="font-bold text-slate-800 dark:text-white text-xs md:text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {product.name}
                                </h4>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs md:text-sm font-display">
                                    {getPriceDisplayForCard(product)}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-slate-400 dark:text-slate-500 line-through text-[9px] md:text-xs">
                                      ₹{product.originalPrice}
                                    </span>
                                  )}
                                </div>

                                {product.inStock !== false ? (
                                  <button
                                    id={`add-to-cart-btn-${product.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (product.sizes && product.sizes.length > 0) {
                                        setSelectedProduct(product);
                                        setActiveImageIdx(0);
                                        showToast?.("Please choose a size / कृपया एक आकार चुनें।", "info");
                                      } else {
                                        addToCart(product);
                                        showToast?.("Added to cart! / कार्ट में जोड़ा गया!", "success");
                                      }
                                    }}
                                    className="bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-500 dark:hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white dark:hover:text-white p-2 rounded-xl transition-all cursor-pointer border border-transparent dark:border-emerald-800/60"
                                    title="Add to Cart"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-extrabold px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg select-none">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* 2. CART TAB */}
          {activeTab === 'cart' && (
            <motion.div
              key="cart-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">My Shopping Cart</h2>
                <span className="text-xs text-slate-500 font-medium">({cartItemCount} Items)</span>
              </div>

              {cart.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 space-y-4 shadow-xs max-w-xl mx-auto">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Your cart is empty</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                      Fill your basket with high quality, sasta wholesale products directly from local creators.
                    </p>
                  </div>
                  <button
                    id="cart-start-shopping-btn"
                    onClick={() => setActiveTab('store')}
                    className="inline-flex items-center text-xs font-bold px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Start Shopping <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cart Items List */}
                  <div className="lg:col-span-2 space-y-3.5">
                    {cart.map(item => {
                      const itemKey = `${item.product.id}-${item.selectedSize || 'none'}`;
                      return (
                        <div
                          id={`cart-item-${itemKey}`}
                          key={itemKey}
                          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-all"
                        >
                          <img
                            src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                            }}
                            className="w-20 h-20 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0 animate-fade-in"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-800 truncate">
                              {item.product.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-400">
                                Category: {item.product.category}
                              </span>
                              {item.selectedSize && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold rounded border border-indigo-100 text-[10px]">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-emerald-600 font-extrabold text-sm md:text-base font-display">
                                ₹{getProductPriceForSize(item.product, item.selectedSize)}
                              </span>
                              {(() => {
                                const customPrice = getProductPriceForSize(item.product, item.selectedSize);
                                const origPrice = item.product.originalPrice && item.product.originalPrice > customPrice ? item.product.originalPrice : undefined;
                                return origPrice ? (
                                  <span className="text-slate-400 line-through text-xs">
                                    ₹{origPrice}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </div>

                          {/* Counters & Delete Actions */}
                          <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-2">
                            <button
                              id={`remove-cart-item-btn-${itemKey}`}
                              onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            
                            <div className="flex items-center gap-2.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200/20">
                              <button
                                id={`decrease-qty-btn-${itemKey}`}
                                onClick={() => updateQuantity(item.product.id, -1, item.selectedSize)}
                                className="text-slate-600 hover:text-slate-900 cursor-pointer p-0.5"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-800 min-w-5 text-center font-mono">
                                {item.quantity}
                              </span>
                              <button
                                id={`increase-qty-btn-${itemKey}`}
                                onClick={() => updateQuantity(item.product.id, 1, item.selectedSize)}
                                className="text-slate-600 hover:text-slate-900 cursor-pointer p-0.5"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment Breakdown Sidebar */}
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                        Payment Summary
                      </h3>
                      <div className="space-y-2 text-xs md:text-sm">
                        <div className="flex justify-between text-slate-500">
                          <span>Original Total (MRP)</span>
                          <span className="line-through">₹{cartOriginalTotal}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Sasta Store Discount</span>
                          <span>-₹{cartSavings}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Delivery Fee</span>
                          <span className="text-emerald-600 font-bold">FREE</span>
                        </div>
                        <hr className="border-dashed border-slate-100 my-3" />
                        <div className="flex justify-between text-slate-800 font-extrabold text-sm md:text-base">
                          <span>Total Payable Amount</span>
                          <span className="text-emerald-600 font-display text-base md:text-lg">₹{cartSubtotal}</span>
                        </div>
                      </div>

                      {cartSavings > 0 && (
                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-center font-bold text-xs border border-emerald-100/50">
                          🎉 Super Choice! You are saving ₹{cartSavings} on this order!
                        </div>
                      )}

                      {/* Place Order Trigger */}
                      <button
                        id="open-checkout-modal-btn"
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer text-xs md:text-sm"
                      >
                        Proceed to Order (₹{cartSubtotal}) <ArrowRight className="w-4 h-4 ml-1.5" />
                      </button>
                    </div>

                    {/* Quick Guarantee Badge */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3">
                      <span className="text-emerald-600 mt-0.5">✔</span>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        <strong>Direct and Genuine:</strong> Orders are packaged and shipped directly from certified local creators. Free cancellation allowed until accepted!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 3. ORDERS TAB */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">My Orders / मेरे ऑर्डर</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Track your active deliveries and purchase history / अपने ऑर्डर ट्रैक करें</p>
                </div>
                <button
                  id="refresh-orders-btn"
                  onClick={fetchMyOrders}
                  className="text-xs px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-emerald-100"
                >
                  <RotateCcw className="w-3.5 h-3.5 animate-spin-reverse" />
                  Refresh Status / स्थिति अपडेट करें
                </button>
              </div>

              {/* Search Orders & Filters Bar (Screenshot 1 Style) */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search orders"
                    className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-2xs"
                  />
                  {orderSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setOrderFilter(prev => prev === 'all' ? 'past' : prev === 'past' ? 'active' : 'all')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  <SlidersHorizontal className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Order Tabs switcher */}
              <div className="flex border-b border-slate-100 pb-px gap-6 overflow-x-auto no-scrollbar">
                <button
                  id="order-filter-all"
                  onClick={() => setOrderFilter('all')}
                  className={`pb-3 font-bold text-xs md:text-sm cursor-pointer whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                    orderFilter === 'all' 
                      ? 'border-emerald-500 text-emerald-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>All Orders / सभी ऑर्डर</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    orderFilter === 'all' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {myOrders.length}
                  </span>
                </button>
                <button
                  id="order-filter-active"
                  onClick={() => setOrderFilter('active')}
                  className={`pb-3 font-bold text-xs md:text-sm cursor-pointer whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                    orderFilter === 'active' 
                      ? 'border-emerald-500 text-emerald-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Active Tracker / जारी ऑर्डर
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    orderFilter === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {myOrders.filter(o => ['Pending', 'Accepted', 'Shipped'].includes(o.status)).length}
                  </span>
                </button>
                <button
                  id="order-filter-past"
                  onClick={() => setOrderFilter('past')}
                  className={`pb-3 font-bold text-xs md:text-sm cursor-pointer whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                    orderFilter === 'past' 
                      ? 'border-emerald-500 text-emerald-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" />
                    Past Purchases / पुराने ऑर्डर
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    orderFilter === 'past' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {myOrders.filter(o => ['Delivered', 'Cancelled', 'Returned'].includes(o.status)).length}
                  </span>
                </button>
              </div>

              {orderSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl space-y-1.5 shadow-xs max-w-xl">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[11px]">✓</div>
                    Order Placed Successfully! / ऑर्डर स्वीकृत हुआ!
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Your order <span className="font-mono font-bold bg-white/60 px-1.5 py-0.5 rounded border border-emerald-200">{orderSuccess}</span> has been received. The local creator has been notified to hand-package your item!
                  </p>
                  <button
                    id="dismiss-order-success-btn"
                    onClick={() => setOrderSuccess(null)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline pt-1 block cursor-pointer"
                  >
                    Dismiss Note / बंद करें
                  </button>
                </div>
              )}

              {loadingOrders ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between p-5 space-y-4 animate-pulse">
                      {/* Order Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="space-y-1.5">
                          <div className="h-2.5 w-14 bg-slate-200 rounded"></div>
                          <div className="h-4 w-36 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-6 w-18 bg-slate-200 rounded-full"></div>
                      </div>
                      {/* Items */}
                      <div className="space-y-3 flex-1 py-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0"></div>
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="h-3.5 w-3/4 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-1/3 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="space-y-1.5">
                          <div className="h-2.5 w-10 bg-slate-200 rounded"></div>
                          <div className="h-3.5 w-14 bg-slate-200 rounded"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 w-24 bg-slate-200 rounded-xl"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : myOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 space-y-4 shadow-xs max-w-xl mx-auto">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <ClipboardList className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">No Orders Placed / कोई ऑर्डर नहीं मिला</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Explore our direct-to-creator catalog and place an order to track it here.
                    </p>
                  </div>
                </div>
              ) : myOrders.filter(o => {
                const matchesFilter = orderFilter === 'all' ||
                  (orderFilter === 'active' && ['Pending', 'Accepted', 'Shipped'].includes(o.status)) ||
                  (orderFilter === 'past' && ['Delivered', 'Cancelled', 'Returned'].includes(o.status));
                if (!matchesFilter) return false;
                if (!orderSearchQuery.trim()) return true;
                const q = orderSearchQuery.toLowerCase();
                return o.id.toLowerCase().includes(q) || o.status.toLowerCase().includes(q) || o.items.some(it => it.name.toLowerCase().includes(q));
              }).length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3 shadow-xs max-w-md mx-auto">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm">No orders match this filter / इस श्रेणी में कोई ऑर्डर नहीं है</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Try switching filters above to check active tracking statuses or completed past orders.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {myOrders
                    .filter(order => {
                      const matchesFilter = orderFilter === 'all' ||
                        (orderFilter === 'active' && ['Pending', 'Accepted', 'Shipped'].includes(order.status)) ||
                        (orderFilter === 'past' && ['Delivered', 'Cancelled', 'Returned'].includes(order.status));
                      if (!matchesFilter) return false;
                      if (!orderSearchQuery.trim()) return true;
                      const q = orderSearchQuery.toLowerCase();
                      return order.id.toLowerCase().includes(q) || order.status.toLowerCase().includes(q) || order.items.some(it => it.name.toLowerCase().includes(q));
                    })
                    .map(order => {
                      const isExpanded = expandedOrders.includes(order.id);
                      const isCancelled = order.status === 'Cancelled';
                      const isReturned = order.status === 'Returned';

                      // Timeline configuration for Standard statuses
                      const statusOrder: Order['status'][] = ['Pending', 'Accepted', 'Shipped', 'Delivered'];
                      const currentStepIndex = statusOrder.indexOf(order.status);

                      // Detailed intermediate logs
                      const trackingLogs = (() => {
                        const logs = [];
                        const baseDate = new Date(order.createdAt);
                        
                        logs.push({
                          title: "Order Placed / ऑर्डर किया गया",
                          desc: "Successfully registered on SastaStore. Creator has been notified.",
                          date: baseDate.toLocaleString()
                        });

                        if (order.status !== 'Pending') {
                          logs.push({
                            title: "Creator Accepted / ऑर्डर स्वीकृत",
                            desc: "Handcrafted creator verified stock and began custom packaging.",
                            date: order.updatedAt ? new Date(order.updatedAt).toLocaleString() : new Date(baseDate.getTime() + 3 * 3600 * 1000).toLocaleString()
                          });
                        }

                        if (['Shipped', 'Delivered', 'Returned'].includes(order.status)) {
                          logs.push({
                            title: "Dispatched / मार्ग में",
                            desc: "Package dispatched from local workshop via local shipping agents.",
                            date: order.updatedAt ? new Date(order.updatedAt).toLocaleString() : new Date(baseDate.getTime() + 18 * 3600 * 1000).toLocaleString()
                          });
                        }

                        if (order.status === 'Delivered') {
                          logs.push({
                            title: "Delivered / प्राप्त हुआ",
                            desc: "Package received at delivery address. Thank you for buying direct!",
                            date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : new Date(order.updatedAt || order.createdAt).toLocaleString()
                          });
                        }

                        if (isCancelled) {
                          logs.push({
                            title: "Cancelled / रद्द हुआ",
                            desc: "Order has been cancelled. Any processed payment will be credited back.",
                            date: new Date(order.updatedAt || order.createdAt).toLocaleString()
                          });
                        }

                        if (isReturned) {
                          logs.push({
                            title: "Return Processed / वापसी पूरी",
                            desc: "Returned package verified and delivered back to creator workshop.",
                            date: new Date(order.updatedAt || order.createdAt).toLocaleString()
                          });
                        }

                        return logs.reverse(); // Latest logs first
                      })();

                      return (
                        <div
                          id={`order-card-${order.id}`}
                          key={order.id}
                          className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all flex flex-col justify-between"
                        >
                          {/* 1. Header Area */}
                          <div className="bg-slate-50/85 px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                Order Identifier
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-extrabold text-xs text-slate-800">
                                  {order.id}
                                </span>
                                <button
                                  id={`copy-id-${order.id}`}
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.id);
                                    showToast?.("Order ID copied! / ऑर्डर आईडी कॉपी की गई", "success");
                                  }}
                                  className="text-slate-400 hover:text-emerald-600 transition-colors p-1 hover:bg-slate-200/50 rounded cursor-pointer"
                                  title="Copy Order ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Date display */}
                              <span className="text-[10px] text-slate-500 font-bold bg-white border border-slate-100 px-2 py-1 rounded-lg">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              
                              {/* Color coded status badge */}
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200/60' :
                                order.status === 'Accepted' ? 'bg-blue-50 text-blue-600 border-blue-200/60' :
                                order.status === 'Shipped' ? 'bg-purple-50 text-purple-600 border-purple-200/60' :
                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' :
                                order.status === 'Returned' ? 'bg-zinc-50 text-zinc-600 border-zinc-200/60' :
                                'bg-rose-50 text-rose-600 border-rose-200/60'
                              }`}>
                                {order.status === 'Pending' ? 'Placed / दर्ज' :
                                 order.status === 'Accepted' ? 'Accepted / स्वीकृत' :
                                 order.status === 'Shipped' ? 'In Transit / मार्ग में' :
                                 order.status === 'Delivered' ? 'Delivered / पहुँचा' :
                                 order.status === 'Returned' ? 'Returned / वापस' : 'Cancelled / रद्द'}
                              </span>
                            </div>
                          </div>

                          {/* 2. visual Status Stepper (Active Tracker) */}
                          <div className="px-5 pt-5 pb-2">
                            {isCancelled ? (
                              <div className="bg-rose-50/50 border border-rose-100/80 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <h6 className="text-xs font-black text-rose-800">Order Cancelled / ऑर्डर निरस्त</h6>
                                  <p className="text-[10px] text-rose-600 leading-relaxed">
                                    This purchase has been cancelled. Refunds, if applicable, are dispatched instantly.
                                  </p>
                                </div>
                              </div>
                            ) : isReturned ? (
                              <div className="bg-amber-50/50 border border-amber-100/80 rounded-2xl p-4 flex items-start gap-3">
                                <RotateCcw className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <h6 className="text-xs font-black text-amber-800">Order Returned / वापसी स्वीकृत</h6>
                                  <p className="text-[10px] text-amber-600 leading-relaxed">
                                    The item has been successfully returned and verified at the local creator workshop.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* ETA / Live Status Text */}
                                <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-100 p-3 rounded-2xl text-[11px] text-slate-600">
                                  <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <div className="leading-tight">
                                    <span className="font-extrabold text-slate-800">Tracking:</span>{' '}
                                    {order.status === 'Pending' && 'Direct packing initiated. Awaiting workshop approval.'}
                                    {order.status === 'Accepted' && 'Accepted! Handmade preparation and quality-testing started.'}
                                    {order.status === 'Shipped' && `In Transit. Out for delivery (ETA: ${order.arrivalDate || 'Soon'})`}
                                    {order.status === 'Delivered' && 'Delivered successfully! Support local artisans with a review.'}
                                  </div>
                                </div>

                                {/* Horizontal Stepper line */}
                                <div className="relative py-4 px-1">
                                  {/* Line background */}
                                  <div className="absolute left-[8%] right-[8%] top-[26px] h-1 bg-slate-100 rounded-full z-0">
                                    <div 
                                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                      style={{ width: `${(currentStepIndex / 3) * 100}%` }}
                                    />
                                  </div>

                                  {/* Stepper Steps */}
                                  <div className="relative flex justify-between z-10">
                                    {[
                                      { label: 'Placed', labelHi: 'दर्ज हुआ', icon: ClipboardList },
                                      { label: 'Accepted', labelHi: 'स्वीकृत', icon: Check },
                                      { label: 'Shipped', labelHi: 'भेजा गया', icon: Truck },
                                      { label: 'Delivered', labelHi: 'पहुँच गया', icon: ShoppingBag }
                                    ].map((step, idx) => {
                                      const isCompleted = idx < currentStepIndex;
                                      const isActive = idx === currentStepIndex;
                                      const StepIcon = step.icon;

                                      return (
                                        <div key={idx} className="flex flex-col items-center w-[20%] text-center">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                                            isCompleted 
                                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                                              : isActive 
                                              ? 'bg-white border-emerald-500 text-emerald-600 shadow-md ring-4 ring-emerald-50' 
                                              : 'bg-white border-slate-200 text-slate-300'
                                          }`}>
                                            {isCompleted ? (
                                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            ) : (
                                              <StepIcon className="w-3.5 h-3.5" />
                                            )}
                                          </div>
                                          <div className="mt-2 space-y-0.5">
                                            <span className={`text-[10px] font-extrabold block leading-none ${
                                              isActive ? 'text-emerald-700 font-black scale-105' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                                            }`}>
                                              {step.label}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400 block leading-none">
                                              {step.labelHi}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 3. Items list with screenshot card layout */}
                          <div className="px-5 py-3 border-t border-slate-100 space-y-3">
                            <div className="space-y-3">
                              {order.items.map((item, idx) => {
                                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: 'short'
                                });

                                const isCancelledOrReturned = order.status === 'Cancelled' || order.status === 'Returned';
                                const statusTitle = 
                                  order.status === 'Cancelled' ? 'Order Cancelled' :
                                  order.status === 'Returned' ? 'Refund Successful' :
                                  order.status === 'Delivered' ? 'Order Delivered' :
                                  order.status === 'Shipped' ? 'In Transit' :
                                  order.status === 'Accepted' ? 'Order Accepted' :
                                  'Order Placed';

                                const ratingKey = `${order.id}-${item.id || idx}`;
                                const currentRating = orderRatings[ratingKey] || 0;

                                return (
                                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 transition-all space-y-3.5 shadow-2xs hover:shadow-sm">
                                    <div
                                      onClick={() => setSelectedOrderDetailModal(order)}
                                      className="flex items-start gap-3.5 cursor-pointer relative group"
                                    >
                                      {/* Left product image thumbnail */}
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                                        }}
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0"
                                      />

                                      {/* Middle content details matching Screenshot 1 */}
                                      <div className="flex-1 min-w-0 pr-6 space-y-1">
                                        <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                                          {order.status === 'Cancelled' ? 'Order Cancelled' :
                                           order.status === 'Returned' ? 'Order Returned' :
                                           order.status === 'Delivered' ? 'Delivered Early' :
                                           order.status === 'Shipped' ? 'In Transit' : 'Order Placed'}
                                        </h4>

                                        {order.status === 'Cancelled' ? (
                                          <p className="text-xs font-semibold text-slate-500">
                                            As cash payment is unavailable
                                          </p>
                                        ) : (
                                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                                            <span>{formattedDate}</span>
                                            {order.status === 'Delivered' && (
                                              <span className="text-slate-400 line-through text-[11px] font-normal">
                                                ~Wed, 19 Nov~
                                              </span>
                                            )}
                                          </p>
                                        )}

                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5 flex items-center gap-1.5 flex-wrap">
                                          <span>Size: <strong className="text-slate-800 dark:text-slate-200 font-bold">{item.selectedSize || 'Free Size'}</strong></span>
                                          <span className="text-slate-300">•</span>
                                          <span>Qty: <strong className="text-slate-800 dark:text-slate-200 font-bold">{item.quantity}</strong></span>
                                        </p>
                                      </div>

                                      {/* Right Chevron arrow */}
                                      <div className="absolute right-0 top-1 text-slate-400 group-hover:text-purple-700 transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                      </div>
                                    </div>

                                    {/* Screenshot 1 Feedback & Photos Row for delivered items */}
                                    {order.status === 'Delivered' && (
                                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
                                        <div className="space-y-1">
                                          <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                                            {currentRating > 0 ? "We are glad you loved the product!" : "ADD FEEDBACK"}
                                          </p>
                                          <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((st) => (
                                              <button
                                                key={st}
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleRateProduct(order.id, item.id || String(idx), st, 'Feedback');
                                                }}
                                                className="cursor-pointer"
                                              >
                                                <Star
                                                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform hover:scale-110 ${
                                                    st <= (currentRating || 5)
                                                      ? 'text-emerald-500 fill-emerald-500'
                                                      : 'text-slate-300'
                                                  }`}
                                                />
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPhotoUploadModalItem({ orderId: order.id, itemId: item.id || String(idx), name: item.name });
                                          }}
                                          className="px-3.5 py-1.5 border-2 border-purple-600 text-purple-700 dark:text-purple-300 font-black text-xs rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all flex items-center gap-1.5 relative cursor-pointer"
                                        >
                                          <span>Add Photos/Videos</span>
                                          <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-1 -right-1" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 4. Collapsible full invoices & tracking history details */}
                          <div className="px-5 py-1.5">
                            <button
                              id={`toggle-details-${order.id}`}
                              onClick={() => {
                                setExpandedOrders(prev => 
                                  prev.includes(order.id) 
                                    ? prev.filter(id => id !== order.id) 
                                    : [...prev, order.id]
                                );
                              }}
                              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center justify-between text-[11px] font-bold text-slate-600 cursor-pointer transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                                {isExpanded ? 'Hide Billing & Tracking Details / विवरण छिपाएं' : 'View Billing & Tracking Logs / विवरण और ट्रैकिंग लॉग देखें'}
                              </span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                            </button>

                            {/* Collapsible Content */}
                            {isExpanded && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="border border-slate-100 border-t-0 rounded-b-xl p-4 bg-slate-50/30 space-y-4 text-xs overflow-hidden"
                              >
                                {/* Billing details block */}
                                <div className="space-y-2">
                                  <div className="font-extrabold text-slate-700 flex items-center gap-1 text-[11px]">
                                    <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                                    Billing Summary / बिल विवरण
                                  </div>
                                  <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-1.5">
                                    <div className="flex justify-between text-[11px] text-slate-500">
                                      <span>Items Subtotal</span>
                                      <span className="font-mono">₹{order.totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500">
                                      <span>Direct Shipping fee</span>
                                      <span className="text-emerald-600 font-bold">₹0 (Free / मुफ्त)</span>
                                    </div>
                                    <hr className="border-slate-100 my-1" />
                                    <div className="flex justify-between text-xs font-black text-slate-800">
                                      <span>Paid Amount (Incl. taxes)</span>
                                      <span className="text-emerald-600 font-mono text-sm">₹{order.totalAmount}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Delivery Address Details */}
                                <div className="space-y-2">
                                  <div className="font-extrabold text-slate-700 flex items-center gap-1 text-[11px]">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                    Delivery Destination / पहुंचाने का पता
                                  </div>
                                  <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-1.5 leading-relaxed text-[11px] text-slate-600">
                                    <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                      <span>{order.customerDetails.name}</span>
                                      <span>•</span>
                                      <span className="text-slate-500">{order.customerDetails.mobile}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Address:</span> {order.customerDetails.address}, {order.customerDetails.state} - <span className="font-mono font-bold text-slate-700">{order.customerDetails.pincode}</span>
                                    </div>
                                    {order.customerDetails.villageName && (
                                      <div>
                                        <span className="font-semibold text-slate-500">Village/Town:</span> {order.customerDetails.villageName} • {order.customerDetails.cityVillageTown}
                                      </div>
                                    )}
                                    {order.customerDetails.landmark && (
                                      <div>
                                        <span className="font-semibold text-slate-500">Landmark:</span> {order.customerDetails.landmark}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Tracking Log Milestones */}
                                <div className="space-y-2">
                                  <div className="font-extrabold text-slate-700 flex items-center gap-1 text-[11px]">
                                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                    Status Log Milestones / ट्रैकिंग इतिहास
                                  </div>
                                  <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-4 py-1">
                                    {trackingLogs.map((log, index) => (
                                      <div key={index} className="relative">
                                        {/* Colored Dot */}
                                        <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-white ${
                                          index === 0 ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'
                                        }`} />
                                        <div className="space-y-0.5">
                                          <div className={`text-[11px] font-extrabold ${index === 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                                            {log.title}
                                          </div>
                                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                            {log.desc}
                                          </p>
                                          <span className="text-[9px] text-slate-400 font-mono">
                                            {log.date}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* 5. Footer action triggers (Cancel, Return, Support) */}
                          <div className="px-5 py-4 border-t border-slate-50 mt-2 flex items-center justify-between gap-3 flex-wrap">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Amount: <span className="font-mono text-emerald-600 text-xs font-black">₹{order.totalAmount}</span>
                            </div>

                            <div className="flex gap-2">
                              {/* Support Button */}
                              <button
                                id={`support-order-btn-${order.id}`}
                                onClick={() => setSupportOrder(order)}
                                className="text-[11px] font-bold px-3 py-1.5 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                title="Contact Creator Support"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                Support / सहायता
                              </button>

                              {/* Actionable button (Cancel / Return) */}
                              {order.status === 'Pending' && (
                                <button
                                  id={`cancel-order-btn-${order.id}`}
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="text-[11px] font-black px-4 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                >
                                  ✕ Cancel / रद्द करें
                                </button>
                              )}

                              {order.status === 'Delivered' && (() => {
                                const windowDays = order.returnWindowDays !== undefined && order.returnWindowDays !== null ? order.returnWindowDays : 15;
                                const baseDateStr = order.deliveredAt;
                                const baseTime = baseDateStr ? new Date(baseDateStr).getTime() : Date.now();
                                const diffDays = (Date.now() - baseTime) / (1000 * 60 * 60 * 24);
                                const isEligible = windowDays > 0 && diffDays <= windowDays;
                                const remainingDays = Math.max(0, Math.ceil(windowDays - diffDays));

                                return isEligible ? (
                                  <button
                                    id={`return-order-btn-${order.id}`}
                                    onClick={() => handleReturnOrder(order.id)}
                                    className="text-[11px] font-black px-4 py-1.5 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-xl transition-all cursor-pointer border border-amber-100 hover:border-amber-600 flex items-center gap-1.5"
                                  >
                                    ↺ Return / वापस करें
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                                    Return Window Closed
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>
          )}

          {/* 4. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20">
                    Sasta Store Alerts
                  </span>
                  <h3 className="font-display text-2xl font-extrabold mt-3 tracking-tight">
                    🔔 Notifications Hub / सूचनाएं
                  </h3>
                  <p className="text-teal-100 text-xs mt-1.5 max-w-lg leading-relaxed">
                    Check announcements, updates regarding your orders, special discount notifications, and personal updates from Sasta Store creators.
                  </p>
                </div>
                <div className="absolute right-4 bottom-1/2 translate-y-1/2 w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/5 pointer-events-none">
                  <Bell className="w-16 h-16 text-white/10" />
                </div>
              </div>

              {/* Notification list */}
              <div className="space-y-4">
                {loadingNotifications ? (
                  <div className="space-y-3.5">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-xs relative space-y-3.5 animate-pulse">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
                          <div className="h-3 w-28 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-4.5 w-2/3 bg-slate-200 rounded"></div>
                        <div className="h-10 w-full bg-slate-50 rounded-xl border border-slate-100/50"></div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-slate-500">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-700">All Clear! No Notifications</p>
                    <p className="text-xs text-slate-400 mt-1">When creators send you notifications or order updates, they will show up here.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {notifications.map((notif) => {
                      const isNew = new Date(notif.createdAt).getTime() > lastReadTime;
                      return (
                        <div
                          key={notif.id}
                          className={`bg-white rounded-xl border p-5 shadow-xs relative transition-all ${
                            isNew ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-slate-200/60'
                          }`}
                        >
                          {isNew && (
                            <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              NEW / नया
                            </span>
                          )}

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">📢</span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {new Date(notif.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <h4 className="font-black text-slate-800 text-sm leading-snug">{notif.title}</h4>
                          <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-medium bg-slate-50/50 rounded-xl p-3 border border-slate-100/50 mt-3.5">
                            {notif.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 4.5 MY WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <motion.div
              key="wishlist-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Favorites Header Banner */}
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/25 shrink-0 text-white shadow-inner">
                      <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-rose-400 text-white px-2.5 py-1 rounded-md">
                        Saved Items / पसंदीदा वस्तुएं
                      </span>
                      <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-1.5">
                        My Favorites
                      </h2>
                      <p className="text-xs text-rose-100 mt-1 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
                        {wishlistProductIds.length} items saved in your device storage
                      </p>
                    </div>
                  </div>

                  {wishlistProductIds.length > 0 && (
                    <button
                      id="clear-all-favorites-btn"
                      onClick={() => {
                        setConfirmAction({
                          message: "Are you sure you want to clear your saved favorites? / क्या आप वाकई अपने सभी पसंदीदा उत्पाद हटाना चाहते हैं?",
                          actionLabel: "Clear All Favorites",
                          onConfirm: async () => {
                            const idsToSync = [...wishlistProductIds];
                            setWishlistProductIds([]);
                            saveFavoritesToStorage([]);
                            if (username) {
                              for (const pid of idsToSync) {
                                fetch("/api/wishlist/toggle", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ username, productId: pid })
                                }).catch(() => {});
                              }
                            }
                            showToast?.("All favorites cleared / सभी पसंदीदा उत्पाद हटा दिए गए", "info");
                            setConfirmAction(null);
                          }
                        });
                      }}
                      className="text-xs font-bold bg-white text-rose-600 hover:bg-rose-50 px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-center"
                    >
                      Clear All Favorites
                    </button>
                  )}
                </div>
                
                {/* Visual Backdrop Asset Decoration */}
                <div className="absolute right-4 bottom-0 translate-y-1/3 w-48 h-48 bg-white/5 rounded-full flex items-center justify-center border border-white/5 pointer-events-none">
                  <Heart className="w-24 h-24 text-white/5" />
                </div>
              </div>

              {/* Favorites Grid */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[1, 2, 3, 4].map((n) => (
                      <ProductCardSkeleton key={n} />
                    ))}
                  </div>
                ) : wishlistProductIds.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 p-16 text-center max-w-lg mx-auto shadow-xs">
                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100 dark:border-rose-900/50">
                      <Heart className="w-10 h-10" />
                    </div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">Your Favorites List is Empty / आपकी पसंदीदा सूची खाली है</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                      You haven't saved any items yet. Browse products and tap the heart icon on any card to save it here!
                    </p>
                    <button
                      id="explore-products-empty-favorites-btn"
                      onClick={() => setActiveTab('store')}
                      className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Explore Products / उत्पाद देखें
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products
                      .filter((p) => wishlistProductIds.includes(p.id))
                      .map((product) => {
                        const discount = product.originalPrice 
                          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                          : 0;

                        return (
                          <div
                            key={`wishlist-tab-${product.id}`}
                            onClick={() => {
                              setSelectedProduct(product);
                              setActiveImageIdx(0);
                            }}
                            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all flex flex-col cursor-pointer group relative animate-fade-in"
                          >
                            {/* Remove from favorites button overlay */}
                            <button
                              id={`remove-favorite-${product.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(product.id);
                              }}
                              className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs hover:bg-rose-500 text-rose-500 hover:text-white p-2 rounded-xl transition-all shadow-xs z-10 cursor-pointer"
                              title="Remove from Favorites / पसंदीदा से हटाएं"
                              aria-label="Remove from Favorites"
                            >
                              <Heart className="w-4 h-4 fill-current text-rose-500 group-hover:text-white" />
                            </button>

                            {/* Image banner with Carousel */}
                            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800/80 overflow-hidden shrink-0">
                              <ProductImageSlider
                                images={product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"]}
                                alt={product.name}
                                showDots={true}
                                showBadge={true}
                                showArrows={true}
                              />
                              {discount > 0 && (
                                <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg z-20 pointer-events-none">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>

                            {/* Details */}
                            <div className="p-3.5 flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 block mb-1">
                                  {product.category}
                                </span>
                                <h4 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {product.name}
                                </h4>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs md:text-sm font-display">
                                    {getPriceDisplayForCard(product)}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-slate-400 dark:text-slate-500 line-through text-[10px]">
                                      ₹{product.originalPrice}
                                    </span>
                                  )}
                                </div>

                                {product.inStock !== false ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (product.sizes && product.sizes.length > 0) {
                                        setSelectedProduct(product);
                                        setActiveImageIdx(0);
                                        showToast?.("Please choose a size / कृपया एक आकार चुनें।", "info");
                                      } else {
                                        addToCart(product);
                                        showToast?.("Added to cart! / कार्ट में जोड़ा गया!", "success");
                                      }
                                    }}
                                    className="bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white p-2 rounded-xl transition-all cursor-pointer"
                                    title="Add to Cart"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-[8px] font-bold px-2 py-1 bg-slate-100 text-slate-400 rounded-md">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 5. MY PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Profile Card Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/25 shrink-0 text-white shadow-inner animate-pulse">
                      <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white px-2.5 py-1 rounded-md">
                        Sasta Member / सदस्य
                      </span>
                      <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-1.5 flex items-center gap-1.5">
                        @{username}
                      </h2>
                      <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full"></span>
                        Active Account
                      </p>
                    </div>
                  </div>

                  {/* Profile Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 shrink-0">
                    <div className="text-center px-2">
                      <p className="text-2xl font-black font-display text-white">{wishlistProductIds.length}</p>
                      <p className="text-[10px] text-emerald-100 font-bold uppercase mt-0.5">Wishlist Items</p>
                    </div>
                    <div className="text-center px-2 border-l border-white/15">
                      <p className="text-2xl font-black font-display text-white">{myOrderIds.length}</p>
                      <p className="text-[10px] text-emerald-100 font-bold uppercase mt-0.5">My Orders</p>
                    </div>
                  </div>
                </div>
                
                {/* Visual Backdrop Asset Decoration */}
                <div className="absolute right-4 bottom-0 translate-y-1/3 w-48 h-48 bg-white/5 rounded-full flex items-center justify-center border border-white/5 pointer-events-none">
                  <Sparkles className="w-24 h-24 text-white/5" />
                </div>
              </div>

              {/* Wishlist Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    <span>My Wishlist / मेरी विशलिस्ट</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {wishlistProductIds.length} items
                    </span>
                  </h3>
                  {wishlistProductIds.length > 0 && (
                    <button
                      onClick={() => {
                        setConfirmAction({
                          message: "Are you sure you want to clear your entire wishlist?",
                          actionLabel: "Clear Wishlist",
                          onConfirm: async () => {
                            for (const pid of [...wishlistProductIds]) {
                              await toggleWishlist(pid);
                            }
                            setConfirmAction(null);
                          }
                        });
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <ProductCardSkeleton key={n} />
                    ))}
                  </div>
                ) : wishlistProductIds.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/50 p-12 text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-800">Your wishlist is empty / आपकी विशलिस्ट खाली है</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Bookmark products that you love to save them here for later!
                    </p>
                    <button
                      onClick={() => setActiveTab('store')}
                      className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer animate-bounce-subtle"
                    >
                      Start Shopping / अभी खरीदें
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products
                      .filter((p) => wishlistProductIds.includes(p.id))
                      .map((product) => {
                        const discount = product.originalPrice 
                          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                          : 0;

                        return (
                          <div
                            key={`wishlist-${product.id}`}
                            onClick={() => {
                              setSelectedProduct(product);
                              setActiveImageIdx(0);
                            }}
                            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col cursor-pointer group relative animate-fade-in"
                          >
                            {/* Remove from wishlist button overlay */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(product.id);
                              }}
                              className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs hover:bg-rose-500 text-rose-500 hover:text-white p-2 rounded-xl transition-all shadow-xs z-10 cursor-pointer"
                              title="Remove from Wishlist"
                            >
                              <Heart className="w-4 h-4 fill-current text-rose-500" />
                            </button>

                            {/* Image banner */}
                            <div className="relative aspect-square bg-slate-100 overflow-hidden shrink-0">
                              <img
                                src={product.images && product.images.length > 0 ? product.images[0] : "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              />
                              {discount > 0 && (
                                <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg z-10">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>

                            {/* Details */}
                            <div className="p-3.5 flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-extrabold uppercase tracking-wide text-emerald-600 block mb-1">
                                  {product.category}
                                </span>
                                <h4 className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                                  {product.name}
                                </h4>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-emerald-600 font-extrabold text-xs md:text-sm font-display">
                                    ₹{product.price}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-slate-400 line-through text-[10px]">
                                      ₹{product.originalPrice}
                                    </span>
                                  )}
                                </div>

                                {product.inStock !== false ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (product.sizes && product.sizes.length > 0) {
                                        setSelectedProduct(product);
                                        setActiveImageIdx(0);
                                        showToast?.("Please choose a size / कृपया एक आकार चुनें।", "info");
                                      } else {
                                        addToCart(product);
                                        showToast?.("Added to cart! / कार्ट में जोड़ा गया!", "success");
                                      }
                                    }}
                                    className="bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white p-2 rounded-xl transition-all cursor-pointer"
                                    title="Add to Cart"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-[8px] font-bold px-2 py-1 bg-slate-100 text-slate-400 rounded-md">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Saved Delivery Address Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 space-y-5 shadow-xs mt-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span>Saved Delivery Address</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your saved address auto-fills when placing orders.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receiver Name</span>
                    <p className="text-xs md:text-sm font-extrabold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      {formData.name || 'Not set'}
                      {formData.name && <Check className="w-4 h-4 text-emerald-600" />}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Number</span>
                    <p className="text-xs md:text-sm font-extrabold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      {formData.mobile ? `+91 ${formData.mobile}` : 'Not set'}
                      {formData.mobile && formData.mobile.length === 10 && <Check className="w-4 h-4 text-emerald-600" />}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pincode</span>
                    <p className="text-xs md:text-sm font-extrabold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      {formData.pincode || 'Not set'}
                      {formData.pincode && formData.pincode.length === 6 && <Check className="w-4 h-4 text-emerald-600" />}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">City & State</span>
                    <p className="text-xs md:text-sm font-extrabold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      {formData.cityVillageTown ? `${formData.cityVillageTown}${formData.state ? `, ${formData.state}` : ''}` : 'Not set'}
                      {formData.cityVillageTown && formData.state && <Check className="w-4 h-4 text-emerald-600" />}
                    </p>
                  </div>

                  <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">House No & Road Name / Area / Colony</span>
                    <p className="text-xs md:text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      {[formData.houseNoBuilding, formData.address].filter(Boolean).join(', ') || 'Not set'}
                      {formData.address && <Check className="w-4 h-4 text-emerald-600" />}
                    </p>
                  </div>

                  <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Landmark / Nearby Famous Place</span>
                    <p className="text-xs md:text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      {formData.landmark || 'Not set (Optional)'}
                      {formData.landmark && <Check className="w-4 h-4 text-emerald-600" />}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Settings & Help Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <button
                  type="button"
                  id="profile-settings-lang-card"
                  onClick={() => setIsSettingsOpen(true)}
                  className="bg-white hover:bg-emerald-50/50 p-5 rounded-3xl border border-slate-200/80 shadow-xs transition-all text-left flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-800">App Language</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                        {selectedLanguage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {STORE_LANGUAGES.find(l => l.code === selectedLanguage)?.native || 'Change Language'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </button>

                <button
                  type="button"
                  id="profile-help-support-card"
                  onClick={() => setIsHelpOpen(true)}
                  className="bg-white hover:bg-purple-50/50 p-5 rounded-3xl border border-slate-200/80 shadow-xs transition-all text-left flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-extrabold text-slate-800 block">Help & Support Center</span>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">24x7 Customer Assistant & FAQs</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* 4. PRODUCT DETAIL MODAL (IMMERSIVE FULL-SCREEN EXPERIENCE) */}
      <AnimatePresence>
        {selectedProduct && (() => {
          // Find recommended products of the same category
          const recommended = products
            .filter(p => p.id !== selectedProduct.id && (p.category === selectedProduct.category || selectedProduct.category === 'All'))
            .slice(0, 4);
          
          // In case there aren't enough products in the same category, get others as fallback
          if (recommended.length < 4) {
            const extra = products
              .filter(p => p.id !== selectedProduct.id && !recommended.find(r => r.id === p.id))
              .slice(0, 4 - recommended.length);
            recommended.push(...extra);
          }

          // Calculate average star rating from reviews (or default to 4.5 if empty)
          const validReviews = productReviews.filter(r => r.rating);
          const avgRating = validReviews.length > 0
            ? (validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(1)
            : "4.5";
          const totalCount = validReviews.length;

          // Generate star counts distribution
          const starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          validReviews.forEach(r => {
            const star = Math.round(r.rating) as 5|4|3|2|1;
            if (starDistribution[star] !== undefined) {
              starDistribution[star]++;
            }
          });

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs"
              />

              {/* Immersive Scrollable Content Sheet */}
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                className="relative bg-slate-50 dark:bg-slate-900 w-full max-w-4xl h-full sm:h-[95vh] sm:max-h-[95vh] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800"
              >
                {/* STICKY HEADER */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <button
                      id="close-product-modal-btn"
                      onClick={() => setSelectedProduct(null)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="font-display font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">
                        Product Details / उत्पाद विवरण
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Direct Sasta Deal • ₹{selectedProduct.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Sasta Guarantee Badge */}
                    <span className="hidden sm:flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/50">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" /> Lowest Price Guarantee
                    </span>
                    <button
                      id="detail-close-x-btn"
                      onClick={() => setSelectedProduct(null)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth">
                  
                  {/* Two-Column Top: Left Gallery, Right Order Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* LEFT: Image Gallery */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs space-y-4">
                      <div 
                        className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden cursor-zoom-in group/gallery"
                        onClick={() => {
                          setLightboxData({
                            images: selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"],
                            currentIndex: activeImageIdx,
                            productName: selectedProduct.name
                          });
                        }}
                      >
                        <img
                          src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[activeImageIdx] : "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"}
                          alt={selectedProduct.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                          }}
                          className="w-full h-full object-cover"
                        />
                        {/* Zoom Overlay */}
                        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                          <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-full shadow-md transform scale-90 group-hover/gallery:scale-100 transition-transform duration-200">
                            <ZoomIn className="w-5 h-5 text-slate-800" />
                          </div>
                        </div>
                        
                        {/* Carousel Left/Right indicators & Overlay controls */}
                        {selectedProduct.images && selectedProduct.images.length > 1 && (
                          <>
                            <button
                              id="carousel-prev-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIdx(prev => (prev === 0 ? (selectedProduct.images || []).length - 1 : prev - 1));
                              }}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-900/80 rounded-full text-white cursor-pointer backdrop-blur-xs transition-colors z-20 shadow-md"
                              aria-label="Previous image"
                              title="Previous image"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              id="carousel-next-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIdx(prev => (prev === (selectedProduct.images || []).length - 1 ? 0 : prev + 1));
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-900/80 rounded-full text-white cursor-pointer backdrop-blur-xs transition-colors z-20 shadow-md"
                              aria-label="Next image"
                              title="Next image"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Image Counter Badge */}
                            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/70 text-white text-[10px] font-mono font-bold backdrop-blur-xs z-20 shadow-xs">
                              {activeImageIdx + 1} / {selectedProduct.images.length}
                            </div>

                            {/* Dot indicators */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-slate-900/50 backdrop-blur-xs px-2.5 py-1 rounded-full">
                              {selectedProduct.images.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveImageIdx(idx);
                                  }}
                                  className={`transition-all rounded-full cursor-pointer ${
                                    idx === activeImageIdx
                                      ? 'w-4 h-1.5 bg-emerald-400'
                                      : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                                  }`}
                                  aria-label={`Go to slide ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        {/* Best Deal Tag */}
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 z-10">
                          <Sparkles className="w-3 h-3 text-white fill-white animate-pulse" /> Sasta Special
                        </span>
                      </div>

                      {/* Small Gallery Thumbnails */}
                      {selectedProduct.images && selectedProduct.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {selectedProduct.images.map((imgUrl, idx) => (
                            <button
                              key={idx}
                              id={`gallery-thumb-${idx}`}
                              onClick={() => setActiveImageIdx(idx)}
                              className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                                idx === activeImageIdx ? 'border-emerald-600 scale-105 shadow-xs' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              <img src={imgUrl} alt="Product preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RIGHT: Product Ordering Options */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs space-y-4">
                      {/* Category & Rating */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                          {selectedProduct.category}
                        </span>
                        
                        {/* Rating stars */}
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black text-slate-800 dark:text-white">{avgRating}</span>
                          <span className="text-[10px] text-slate-400">({totalCount} Ratings)</span>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <h1 className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight leading-tight">
                          {selectedProduct.name}
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">Direct wholesale price, direct to customer home delivery / सीधा थोक मूल्य और घर तक डिलीवरी</p>
                      </div>

                      {/* Pricing Layout */}
                      <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wholesale Special Price / थोक विशेष मूल्य</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                              ₹{getProductPriceForSize(selectedProduct, modalSelectedSize)}
                            </span>
                            {(() => {
                              const customPrice = getProductPriceForSize(selectedProduct, modalSelectedSize);
                              const origPrice = selectedProduct.originalPrice && selectedProduct.originalPrice > customPrice ? selectedProduct.originalPrice : undefined;
                              return origPrice ? (
                                <span className="text-slate-400 line-through text-base">
                                  ₹{origPrice}
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </div>

                        {(() => {
                          const customPrice = getProductPriceForSize(selectedProduct, modalSelectedSize);
                          const origPrice = selectedProduct.originalPrice && selectedProduct.originalPrice > customPrice ? selectedProduct.originalPrice : undefined;
                          if (origPrice && origPrice > customPrice) {
                            const discountPercent = Math.round(((origPrice - customPrice) / origPrice) * 100);
                            return (
                              <div className="text-right">
                                <div className="bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-lg shadow-xs animate-bounce inline-block">
                                  {discountPercent}% OFF
                                </div>
                                <div className="text-[9px] text-rose-500 font-bold mt-1">Limited Period Deal / सीमित समय की छूट</div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      {/* Sizes Selection */}
                      {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider flex items-center justify-between">
                            <span>Select Size / आकार चुनें</span>
                            {modalSelectedSize && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50">
                                Selected: {modalSelectedSize}
                              </span>
                            )}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.sizes.map(sz => {
                              const isSelected = modalSelectedSize === sz;
                              return (
                                <button
                                  key={sz}
                                  id={`detail-size-option-${sz}`}
                                  type="button"
                                  onClick={() => setModalSelectedSize(sz)}
                                  className={`h-11 min-w-14 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30'
                                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                  }`}
                                >
                                  <div className="flex flex-col items-center leading-tight">
                                    <span>{sz}</span>
                                    {selectedProduct.sizePrices && selectedProduct.sizePrices[sz] !== undefined && (
                                      <span className={`text-[8px] font-extrabold mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        ₹{selectedProduct.sizePrices[sz]}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Quantity Selector Option */}
                      <div className="space-y-2 pt-1">
                        <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Select Quantity / मात्रा चुनें</h4>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden h-10 shadow-inner">
                            <button
                              id="detail-qty-minus-btn"
                              type="button"
                              onClick={() => setModalQuantity(prev => Math.max(1, prev - 1))}
                              className="w-10 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-xs font-black text-slate-800 dark:text-white select-none">{modalQuantity}</span>
                            <button
                              id="detail-qty-plus-btn"
                              type="button"
                              onClick={() => setModalQuantity(prev => prev + 1)}
                              className="w-10 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">Wholesale limit is up to 50 items per order</span>
                        </div>
                      </div>

                      {/* Action Buttons (Add to Cart / Buy Now) */}
                      <div className="pt-2">
                        {selectedProduct.inStock !== false ? (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              id="add-to-cart-from-modal-btn"
                              onClick={() => {
                                if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !modalSelectedSize) {
                                  showToast?.("Please choose a size! / कृपया एक आकार चुनें!", "error");
                                  return;
                                }
                                addToCart(selectedProduct, modalQuantity, modalSelectedSize);
                                setSelectedProduct(null);
                                showToast?.(`${selectedProduct.name} ${modalSelectedSize ? `(${modalSelectedSize}) ` : ''}added to cart!`, "success");
                              }}
                              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                              <ShoppingCart className="w-4 h-4 text-slate-600 dark:text-slate-300" /> Add to Cart (₹{getProductPriceForSize(selectedProduct, modalSelectedSize) * modalQuantity})
                            </button>
                            <button
                              id="buy-now-from-modal-btn"
                              onClick={() => {
                                if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !modalSelectedSize) {
                                  showToast?.("Please choose a size! / कृपया एक आकार चुनें!", "error");
                                  return;
                                }
                                addToCart(selectedProduct, modalQuantity, modalSelectedSize);
                                setSelectedProduct(null);
                                setActiveTab('cart');
                              }}
                              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              Buy Now (खरीदें)
                            </button>
                            <button
                              onClick={() => toggleWishlist(selectedProduct.id)}
                              className={`p-3.5 rounded-xl border text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                                wishlistProductIds.includes(selectedProduct.id)
                                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-extrabold'
                                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                              title={wishlistProductIds.includes(selectedProduct.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                              <Heart className={`w-4 h-4 ${wishlistProductIds.includes(selectedProduct.id) ? 'fill-current text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                              <span className="sm:hidden">
                                {wishlistProductIds.includes(selectedProduct.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <div className="w-full text-center bg-slate-100 dark:bg-slate-800 text-slate-400 font-extrabold py-4 px-4 rounded-xl text-xs uppercase tracking-wider select-none border border-slate-200/50 dark:border-slate-700">
                              Sold Out / स्टॉक में नहीं है
                            </div>
                            <button
                              onClick={() => toggleWishlist(selectedProduct.id)}
                              className={`w-full py-3.5 px-4 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                wishlistProductIds.includes(selectedProduct.id)
                                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
                                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${wishlistProductIds.includes(selectedProduct.id) ? 'fill-current text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                              <span>
                                {wishlistProductIds.includes(selectedProduct.id) ? "Remove from Wishlist / विशलिस्ट से हटाएं" : "Add to Wishlist / विशलिस्ट में जोड़ें"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Benefits Trust Badges */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        <div className="flex flex-col items-center text-center p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                          <Truck className="w-4 h-4 text-indigo-500 mb-1" />
                          <span>Free Delivery</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                          <span>Cash on Delivery</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                          <RotateCcw className="w-4 h-4 text-amber-500 mb-1" />
                          <span>Easy Return</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* About product Details */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs space-y-3">
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                      About this Product / उत्पाद के बारे में
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {selectedProduct.description || "No product description provided."}
                    </p>
                  </div>

                  {/* REVIEWS & RATINGS SECTION */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">
                        Customer Reviews & Ratings / ग्राहक समीक्षाएं
                      </h4>
                      <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50">
                        100% Real Buyers
                      </div>
                    </div>

                    {/* Grid summary review score */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      
                      {/* Circle Score */}
                      <div className="text-center sm:border-r border-slate-200/80 dark:border-slate-700">
                        <div className="text-4xl font-black text-slate-800 dark:text-white font-display">{avgRating}</div>
                        <div className="flex justify-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= Math.round(Number(avgRating))
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1.5">{totalCount} Customer Ratings</div>
                      </div>

                      {/* Stars Bars */}
                      <div className="col-span-2 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((s) => {
                          const count = starDistribution[s as 5|4|3|2|1] || 0;
                          const percent = totalCount > 0 ? (count / totalCount) * 100 : s === 5 ? 75 : s === 4 ? 20 : 5;
                          return (
                            <div key={s} className="flex items-center gap-2 text-xs">
                              <span className="w-3 text-slate-500 font-bold text-right">{s}</span>
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="w-8 text-slate-400 text-[10px] text-right">{Math.round(percent)}%</span>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Real Review Comments */}
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                      {loadingReviews ? (
                        <div className="space-y-4">
                          {[1, 2].map((n) => (
                            <div key={n} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3 animate-pulse">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-slate-200 rounded-full shrink-0"></div>
                                  <div className="space-y-1.5">
                                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                                    <div className="h-2 w-24 bg-slate-200 rounded"></div>
                                  </div>
                                </div>
                                <div className="h-3.5 w-16 bg-slate-200 rounded"></div>
                              </div>
                              <div className="h-3 w-full bg-slate-200 rounded"></div>
                              <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : productReviews.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 font-medium">No reviews yet. Be the first to review this product! / अभी तक कोई समीक्षा नहीं है।</div>
                      ) : (
                        productReviews.map((rev) => (
                          <div key={rev.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-emerald-100 text-emerald-700 font-black rounded-full flex items-center justify-center text-xs text-center leading-7">
                                  {rev.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">{rev.username}</div>
                                  <div className="text-[9px] text-slate-400 font-medium">Verified Buyer • {new Date(rev.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 bg-emerald-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded">
                                {rev.rating} <Star className="w-2.5 h-2.5 fill-white text-white" />
                              </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed font-medium pl-9">
                              {rev.comment}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Post review form */}
                    {selectedProduct && myOrders.some(order => 
                      ['Delivered', 'Returned'].includes(order.status) && 
                      order.items.some(item => item.productId === selectedProduct.id)
                    ) ? (
                      <form onSubmit={handleAddReview} className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-3.5">
                        <div className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" /> Share Your Review / अपनी समीक्षा साझा करें
                        </div>

                        {/* Stars Rating Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold">Your Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                key={starVal}
                                id={`rating-star-btn-${starVal}`}
                                type="button"
                                onClick={() => setNewRating(starVal)}
                                className="p-1 focus:outline-none transition-transform active:scale-125 cursor-pointer"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    starVal <= newRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-extrabold text-amber-600">
                            {newRating === 5 ? 'Excellent!' : newRating === 4 ? 'Very Good!' : newRating === 3 ? 'Good' : newRating === 2 ? 'Fair' : 'Poor'}
                          </span>
                        </div>

                        {/* Comment */}
                        <div className="space-y-1">
                          <textarea
                            id="review-comment-textarea"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="What did you like or dislike about this sasta deal? Write in Hindi or English..."
                            className="w-full h-18 text-xs p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                          />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-between items-center gap-4 flex-wrap">
                          <p className="text-[10px] text-slate-400 font-bold">Logged in as: <span className="text-slate-600 font-extrabold">@{username}</span></p>
                          <button
                            id="submit-review-btn"
                            type="submit"
                            disabled={isSubmittingReview}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            {isSubmittingReview ? "Posting..." : "Post Review / समीक्षा पोस्ट करें"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-center space-y-2">
                        <MessageSquare className="w-5 h-5 text-slate-400 mx-auto" />
                        <h5 className="text-xs font-extrabold text-slate-700">Write a Review / समीक्षा लिखें</h5>
                        <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
                          Only buyers who have received or returned their orders can write reviews for this product. / केवल वे खरीदार जिनका ऑर्डर डिलीवर या वापस हो चुका है, वे ही इस उत्पाद के लिए समीक्षा लिख सकते हैं।
                        </p>
                      </div>
                    )}

                  </div>

                  {/* RECOMMENDED PRODUCTS SECTION (MEESHO-STYLE BOTTOM SCROLL) */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h4 className="font-display font-black text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                        <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin-slow" /> RECOMMENDED PRODUCTS / आपके लिए अनुशंसित
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold">Customers who viewed this item also loved these direct factory deals!</p>
                    </div>

                    {/* Recommended Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {recommended.map(product => {
                        const recDiscount = product.originalPrice 
                          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                          : 0;
                        return (
                          <div
                            id={`rec-product-card-${product.id}`}
                            key={product.id}
                            onClick={() => {
                              setSelectedProduct(product);
                              setActiveImageIdx(0);
                              // Smooth scroll to top of details body
                              const element = document.getElementById("close-product-modal-btn");
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-sm transition-all flex flex-col cursor-pointer group p-2 space-y-2"
                          >
                            <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/80 rounded-lg overflow-hidden shrink-0">
                              <ProductImageSlider
                                images={product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"]}
                                alt={product.name}
                                showDots={false}
                                showBadge={true}
                                showArrows={true}
                              />
                              {/* Heart Toggle Button */}
                              <button
                                id={`rec-heart-toggle-${product.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWishlist(product.id);
                                }}
                                className={`absolute top-1.5 right-1.5 z-20 p-1.5 rounded-lg transition-all shadow-xs cursor-pointer ${
                                  wishlistProductIds.includes(product.id)
                                    ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105'
                                    : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-400 dark:text-slate-300 hover:text-rose-500'
                                }`}
                                title={wishlistProductIds.includes(product.id) ? "Remove from Favorites" : "Save to Favorites"}
                                aria-label={wishlistProductIds.includes(product.id) ? "Remove from Favorites" : "Save to Favorites"}
                              >
                                <Heart className={`w-3.5 h-3.5 ${wishlistProductIds.includes(product.id) ? 'fill-current text-white' : ''}`} />
                              </button>
                              {recDiscount > 0 && (
                                <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs z-20 pointer-events-none">
                                  {recDiscount}% OFF
                                </span>
                              )}
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                              <h5 className="text-[11px] font-bold text-slate-800 dark:text-white line-clamp-1 leading-tight">
                                {product.name}
                              </h5>
                              <div className="flex items-baseline justify-between gap-1 mt-1 flex-wrap">
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">₹{product.price}</span>
                                {product.originalPrice && (
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 line-through">₹{product.originalPrice}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* STICKY FOOTER ACTION BAR FOR MOBILE COMFORT */}
                <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-5 py-3 flex items-center gap-3 sm:hidden shrink-0 shadow-lg">
                  <div className="text-left">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Total Price</div>
                    <div className="text-lg font-black text-emerald-600 font-display font-black">₹{getProductPriceForSize(selectedProduct, modalSelectedSize) * modalQuantity}</div>
                  </div>
                  
                  {selectedProduct.inStock !== false ? (
                    <button
                      id="mobile-sticky-buy-btn"
                      onClick={() => {
                        if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !modalSelectedSize) {
                          showToast?.("Please choose a size! / कृपया एक आकार चुनें!", "error");
                          return;
                        }
                        addToCart(selectedProduct, modalQuantity, modalSelectedSize);
                        setSelectedProduct(null);
                        setActiveTab('cart');
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs h-11 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Buy Now (अभी खरीदें)
                    </button>
                  ) : (
                    <div className="flex-1 text-center bg-slate-100 text-slate-400 font-bold h-11 flex items-center justify-center rounded-xl text-xs uppercase">
                      Sold Out
                    </div>
                  )}
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* 5. CHECKOUT AND ADDRESS SELECTION MODAL */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Form Drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 md:p-6 overflow-y-auto max-h-[90vh] sm:max-h-[92vh] z-10 border border-slate-100"
            >
              {/* Header with Top Progress bar and Back Navigation */}
              <div className="relative pt-3 pb-3 border-b border-slate-100 flex items-center justify-between mb-2">
                {/* Top Progress Bar Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 rounded-t-3xl overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-500 ease-out"
                    style={{ width: checkoutStep === 1 ? '50%' : '100%' }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (checkoutStep === 2) {
                        setCheckoutStep(1);
                      } else {
                        setIsCheckoutOpen(false);
                      }
                    }}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-full transition-colors cursor-pointer"
                    title="Back / पीछे जाएं"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <h3 className="font-extrabold text-xs md:text-sm text-slate-900 uppercase tracking-wide">
                    ADD DELIVERY ADDRESS
                  </h3>
                </div>

                <button
                  id="close-checkout-modal-btn"
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                {checkoutStep === 1 ? (
                  <div className="space-y-6 pt-2 animate-fade-in">
                    <div className="bg-purple-50/70 border border-purple-100 p-3.5 rounded-2xl flex items-center gap-3">
                      <div className="w-9 h-9 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">Step 1: Contact Details</p>
                        <p className="text-[11px] text-slate-500">Enter name & phone number for delivery / नाम और मोबाइल नंबर</p>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="relative pt-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center border-b-2 border-slate-200 focus-within:border-purple-600 transition-colors pb-1">
                        <input
                          id="checkout-name-input"
                          type="text"
                          required
                          placeholder="Receiver's Full Name"
                          value={formData.name}
                          onChange={(e) => {
                            const next = { ...formData, name: e.target.value };
                            setFormData(next);
                            try { localStorage.setItem(`sasta_saved_address_${username || 'guest'}`, JSON.stringify(next)); } catch(err){}
                          }}
                          className="w-full bg-transparent py-1.5 text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-normal"
                        />
                        {formData.name.trim().length >= 2 && (
                          <Check className="w-5 h-5 text-emerald-600 shrink-0 ml-2 animate-scale-in" />
                        )}
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="relative pt-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Contact Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center border-b-2 border-slate-200 focus-within:border-purple-600 transition-colors pb-1">
                        <span className="text-slate-400 font-bold text-sm mr-2">+91</span>
                        <input
                          id="checkout-mobile-input"
                          type="tel"
                          required
                          placeholder="10-digit Mobile Number"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          value={formData.mobile}
                          onChange={(e) => {
                            const next = { ...formData, mobile: e.target.value.replace(/\D/g, '') };
                            setFormData(next);
                            try { localStorage.setItem(`sasta_saved_address_${username || 'guest'}`, JSON.stringify(next)); } catch(err){}
                          }}
                          className="w-full bg-transparent py-1.5 text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-normal tracking-wide"
                        />
                        {formData.mobile.length === 10 && (
                          <Check className="w-5 h-5 text-emerald-600 shrink-0 ml-2 animate-scale-in" />
                        )}
                      </div>
                    </div>

                    {/* Next step button */}
                    <div className="pt-4">
                      <button
                        id="checkout-next-step-btn"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!formData.name.trim()) {
                            showToast?.("Please enter receiver name! / कृपया प्राप्तकर्ता का नाम दर्ज करें!", "error");
                            return;
                          }
                          if (!formData.mobile || formData.mobile.length !== 10) {
                            showToast?.("Please enter a valid 10-digit contact number! / कृपया 10 अंकों का नंबर भरें!", "error");
                            return;
                          }
                          setCheckoutStep(2);
                        }}
                        className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide active:scale-98"
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-1 animate-fade-in">
                    {/* Step 2 Header Banner */}
                    <div className="bg-purple-50/70 border border-purple-100 p-3.5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-5 h-5 text-purple-600 shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">Step 2: Delivery Address</p>
                          <p className="text-[11px] text-slate-500">Enter delivery address details below</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveHelpTab('all');
                          setIsAddressHelpOpen(true);
                        }}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="View Address Filling Guide"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Address Help Guide</span>
                      </button>
                    </div>

                    {/* Inline Quick Visual Guide Box */}
                    <div className="bg-purple-50/80 border border-purple-200/90 p-3 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="font-bold text-purple-950">Need help filling address? / पता कैसे भरें?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveHelpTab('all');
                          setIsAddressHelpOpen(true);
                        }}
                        className="text-xs font-extrabold text-purple-800 hover:text-purple-950 underline cursor-pointer"
                      >
                        View Images & Guide
                      </button>
                    </div>

                    {/* Address Form Fields */}
                    <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-4">
                      {/* 1. Pincode* */}
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-500">
                            Pincode <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveHelpTab('pincode');
                              setIsAddressHelpOpen(true);
                            }}
                            className="text-[10px] text-purple-700 hover:text-purple-900 font-extrabold flex items-center gap-0.5 cursor-pointer bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100"
                          >
                            <HelpCircle className="w-3 h-3 text-purple-600" />
                            <span>Help / उदहारण</span>
                          </button>
                        </div>
                        <div className="relative flex items-center border-b-2 border-slate-200 focus-within:border-purple-600 transition-colors pb-1">
                          <input
                            id="checkout-pincode-input"
                            type="text"
                            required
                            placeholder="6-digit Pincode (e.g. 834567)"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={formData.pincode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              const next = { ...formData, pincode: val };
                              setFormData(next);
                              try { localStorage.setItem(`sasta_saved_address_${username || 'guest'}`, JSON.stringify(next)); } catch(err){}
                            }}
                            className="w-full bg-transparent py-1 text-sm font-bold text-slate-900 focus:outline-none"
                          />
                          {formData.pincode.length === 6 && (
                            <Check className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                          )}
                        </div>
                      </div>

                      {/* 2. City* & 3. State* 2-Column Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* City* */}
                        <div className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-bold text-slate-500">
                              City <span className="text-rose-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveHelpTab('city');
                                setIsAddressHelpOpen(true);
                              }}
                              className="text-[10px] text-purple-700 hover:text-purple-900 font-extrabold flex items-center gap-0.5 cursor-pointer bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100"
                            >
                              <HelpCircle className="w-3 h-3 text-purple-600" />
                              <span>Help</span>
                            </button>
                          </div>
                          <div className="relative flex items-center border-b-2 border-slate-200 focus-within:border-purple-600 transition-colors pb-1">
                            <input
                              id="checkout-city-input"
                              type="text"
                              required
                              placeholder="City Name (e.g. Surat)"
                              value={formData.cityVillageTown}
                              onChange={(e) => {
                                const next = { ...formData, cityVillageTown: e.target.value };
                                setFormData(next);
                                try { localStorage.setItem(`sasta_saved_address_${username || 'guest'}`, JSON.stringify(next)); } catch(err){}
                              }}
                              className="w-full bg-transparent py-1 text-xs md:text-sm font-bold text-slate-900 focus:outline-none"
                            />
                            {formData.cityVillageTown.trim().length >= 2 && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                            )}
                          </div>
                        </div>

                        {/* State* */}
                        <div className="relative">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">
                            State <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative flex items-center border-b-2 border-slate-200 focus-within:border-purple-600 transition-colors pb-1">
                            <select
                              id="checkout-state-select"
                              required
                              value={formData.state}
                              onChange={(e) => {
                                const next = { ...formData, state: e.target.value };
                                setFormData(next);
                                try { localStorage.setItem(`sasta_saved_address_${username || 'guest'}`, JSON.stringify(next)); } catch(err){}
                              }}
                              className="w-full bg-transparent py-1 text-xs md:text-sm font-bold text-slate-900 focus:outline-none appearance-none cursor-pointer pr-4"
                            >
                              <option value="">Select State</option>
                              {INDIAN_STATES.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                            {formData.state && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 4. House no. / Building Name (optional) */}
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-500">
                            House no. / Building Name <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveHelpTab('building');
                              setIsAddressHelpOpen(true);
                            }}
                            className="text-[10px] text-purple-700 hover:text-purple-900 font-extrabold flex items-center gap-0.5 cursor-pointer bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100"
                          >
                            <HelpCircle className="w-3 h-3 text-purple-600" />
                            <span>Help / उदहारण</span>
                          </button>
                        </div>
                        <div className="relative flex items-center border-b-2 border-slate-200 focus-within:border-purple-600 transition-colors pb-1">
                          <input
                            id="checkout-house-input"
                            type="text"
                            placeholder="Flat no., House no., Building name (e.g. Rajgir Building No. 678)"
                            value={formData.houseNoBuilding || ''}
                            onChange={(e) => {
                              const next = { ...formData, houseNoBuilding: e.target.value };
                              setFormData(next);
                              try { localStorage.setItem(`sasta_saved_address_${username || 'guest'}`, JSON.stringify(next)); } catch(err){}
                            }}
                            className="w-full bg-transparent py-1 text-xs md:text-sm font-bold text-slate-900 focus:outline-none"
                          />
                          {formData.houseNoBuilding && formData.houseNoBuilding.trim().length >= 1 && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                          )}
                        </div>
                      </div>

                      {/* 5. Road Name / Area / Colony* */}
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-500">
                            Road Name / Area / Colony <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveHelpTab('colony');
                              setIsAddressHelpOpen(true);
                            }}
                            className="text-[10px] text-purple-700 hover:text-purple-900 font-extrabold flex items-center gap-0.5 cursor-pointer bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100"
                          >
                            <HelpCircle className="w-3 h-3 text-purple-600" />
                            <span>Help / उदहारण</span>
                          </button>
                        </div>
                        <div className="relative flex items-center border-b-2 border-slate-200 focus-within:border-purple-600 transition-colors pb-1">
                          <input
                            id="checkout-road-input"
                            type="text"
                            required
                            placeholder="Street name, colony, area, district, block or village name"
                            value={formData.address}
                            onChange={(e) => {
                              const next = { ...formData, address: e.target.value };
                              setFormData(next);
                              try { localStorage.setItem(`sasta_saved_address_${username || 'guest'}`, JSON.stringify(next)); } catch(err){}
                            }}
                            className="w-full bg-transparent py-1 text-xs md:text-sm font-bold text-slate-900 focus:outline-none"
                          />
                          {formData.address.trim().length >= 2 && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                          )}
                        </div>
                      </div>

                      {/* 6. Landmark / Nearby Famous Place (Optional) */}
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-500">
                            Landmark / Nearby Place <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveHelpTab('landmark');
                              setIsAddressHelpOpen(true);
                            }}
                            className="text-[10px] text-purple-700 hover:text-purple-900 font-extrabold flex items-center gap-0.5 cursor-pointer bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100"
                          >
                            <HelpCircle className="w-3 h-3 text-purple-600" />
                            <span>Help / उदहारण</span>
                          </button>
                        </div>
                        <div className="relative flex items-center border-b-2 border-slate-200 focus-within:border-purple-600 transition-colors pb-1">
                          <input
                            id="checkout-landmark-input"
                            type="text"
                            placeholder="Nearby landmark (e.g. Near Shiv Temple, Opposite Bus Stand, Behind Govt Hospital)"
                            value={formData.landmark || ''}
                            onChange={(e) => {
                              const next = { ...formData, landmark: e.target.value };
                              setFormData(next);
                              try { localStorage.setItem(`sasta_saved_address_${username || 'guest'}`, JSON.stringify(next)); } catch(err){}
                            }}
                            className="w-full bg-transparent py-1 text-xs md:text-sm font-bold text-slate-900 focus:outline-none"
                          />
                          {formData.landmark && formData.landmark.trim().length >= 1 && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Payable Summary */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-bold">Total Payable Amount (Cash on Delivery):</span>
                      <span className="text-purple-700 font-extrabold text-base">₹{cartSubtotal}</span>
                    </div>

                    {/* Save Address and Continue Button */}
                    <div className="pt-1">
                      <button
                        id="checkout-submit-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide active:scale-98"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Placing COD Order...
                          </>
                        ) : (
                          <>
                            Save Address and Continue <Check className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADDRESS FILLING HELP MODAL GUIDE WITH SCREENSHOT CARDS */}
      <AnimatePresence>
        {isAddressHelpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddressHelpOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden border border-purple-200"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">Address Filling Guide / गाइड</h3>
                    <p className="text-[11px] text-purple-100">Official field instructions with visual examples</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressHelpOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="bg-purple-50 p-2 border-b border-purple-100 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveHelpTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeHelpTab === 'all' ? 'bg-purple-700 text-white shadow-xs' : 'bg-white text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  All (सभी गाइड)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHelpTab('pincode')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeHelpTab === 'pincode' ? 'bg-purple-700 text-white shadow-xs' : 'bg-white text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  1. Pincode
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHelpTab('city')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeHelpTab === 'city' ? 'bg-purple-700 text-white shadow-xs' : 'bg-white text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  2. City
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHelpTab('building')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeHelpTab === 'building' ? 'bg-purple-700 text-white shadow-xs' : 'bg-white text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  3. House / Building
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHelpTab('colony')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeHelpTab === 'colony' ? 'bg-purple-700 text-white shadow-xs' : 'bg-white text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  4. Road / Area / Village
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHelpTab('landmark')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeHelpTab === 'landmark' ? 'bg-purple-700 text-white shadow-xs' : 'bg-white text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  5. Landmark
                </button>
              </div>

              {/* Guide Content Cards */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-6">

                {/* 1. PINCODE IMAGE & GUIDE */}
                {(activeHelpTab === 'all' || activeHelpTab === 'pincode') && (
                  <div className="bg-purple-50/50 border-2 border-purple-200 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-purple-700 text-white font-extrabold text-[10px] rounded-lg tracking-wide uppercase">
                        1. Pincode Instruction
                      </span>
                      <span className="text-xs font-bold text-slate-500">Field 1 of 4</span>
                    </div>

                    {/* Screenshot Mockup Container */}
                    <div className="bg-white border border-purple-200 rounded-2xl p-4 space-y-3 shadow-xs">
                      {/* Black Bubble Note matching Image 1 */}
                      <div className="relative bg-slate-900 text-white p-3.5 rounded-2xl border-2 border-slate-700 flex items-center justify-between gap-3 shadow-md">
                        <div className="space-y-0.5">
                          <p className="font-black text-sm uppercase tracking-wider text-purple-300">ENTER YOUR PINCODE</p>
                          <p className="text-xs font-black text-emerald-300">example .834567</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          📌
                        </div>
                      </div>

                      {/* Mock UI Input */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-extrabold text-purple-700 uppercase">Pincode *</span>
                        <div className="bg-white px-3 py-2 rounded-lg border border-purple-300 text-sm font-black text-slate-900 flex items-center justify-between">
                          <span>834567</span>
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      💡 <strong className="text-purple-900">How to fill:</strong> Enter your area 6-digit postal code. E.g., <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-bold">834567</span>.
                    </p>
                  </div>
                )}

                {/* 2. CITY IMAGE & GUIDE */}
                {(activeHelpTab === 'all' || activeHelpTab === 'city') && (
                  <div className="bg-purple-50/50 border-2 border-purple-200 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-purple-700 text-white font-extrabold text-[10px] rounded-lg tracking-wide uppercase">
                        2. City Instruction
                      </span>
                      <span className="text-xs font-bold text-slate-500">Field 2 of 4</span>
                    </div>

                    {/* Screenshot Mockup Container */}
                    <div className="bg-white border border-purple-200 rounded-2xl p-4 space-y-3 shadow-xs">
                      {/* Black Bubble Note matching Image 2 */}
                      <div className="relative bg-slate-900 text-white p-3.5 rounded-2xl border-2 border-slate-700 flex items-center justify-between gap-3 shadow-md">
                        <div className="space-y-0.5">
                          <p className="font-black text-sm text-purple-300">enter your city name</p>
                          <p className="text-xs font-black text-emerald-300">such as surat</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          🏙️
                        </div>
                      </div>

                      {/* Mock UI Input */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-extrabold text-purple-700 uppercase">City *</span>
                        <div className="bg-white px-3 py-2 rounded-lg border border-purple-300 text-xs sm:text-sm font-extrabold text-slate-900 flex items-center justify-between">
                          <span>Surat</span>
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      💡 <strong className="text-purple-900">How to fill:</strong> Enter your city or main town name. E.g., <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-bold">Surat</span>, Patna, Lucknow.
                    </p>
                  </div>
                )}

                {/* 3. HOUSE NO / BUILDING IMAGE & GUIDE */}
                {(activeHelpTab === 'all' || activeHelpTab === 'building') && (
                  <div className="bg-purple-50/50 border-2 border-purple-200 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-purple-700 text-white font-extrabold text-[10px] rounded-lg tracking-wide uppercase">
                        3. House / Building Instruction
                      </span>
                      <span className="text-xs font-bold text-slate-500">Field 3 of 4</span>
                    </div>

                    {/* Screenshot Mockup Container */}
                    <div className="bg-white border border-purple-200 rounded-2xl p-4 space-y-3 shadow-xs">
                      {/* Black Bubble Note matching Image 3 */}
                      <div className="relative bg-slate-900 text-white p-3.5 rounded-2xl border-2 border-slate-700 flex items-center justify-between gap-3 shadow-md">
                        <div className="space-y-0.5">
                          <p className="font-black text-xs sm:text-sm text-purple-300 leading-snug">
                            enter your building name if you are on rajgir building number 678
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          🏢
                        </div>
                      </div>

                      {/* Mock UI Input */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-extrabold text-purple-700 uppercase">House no. / Building Name (Optional)</span>
                        <div className="bg-white px-3 py-2 rounded-lg border border-purple-300 text-xs sm:text-sm font-extrabold text-slate-900 flex items-center justify-between">
                          <span>Rajgir Building Number 678</span>
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      💡 <strong className="text-purple-900">How to fill:</strong> Enter your building name, flat number or house number (Optional). E.g., <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-bold">Rajgir Building Number 678</span>.
                    </p>
                  </div>
                )}

                {/* 4. ROAD / AREA / COLONY / VILLAGE IMAGE & GUIDE */}
                {(activeHelpTab === 'all' || activeHelpTab === 'colony') && (
                  <div className="bg-purple-50/50 border-2 border-purple-200 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-purple-700 text-white font-extrabold text-[10px] rounded-lg tracking-wide uppercase">
                        4. Road / Area / Colony / Village Instruction
                      </span>
                      <span className="text-xs font-bold text-slate-500">Field 4 of 4</span>
                    </div>

                    {/* Screenshot Mockup Container */}
                    <div className="bg-white border border-purple-200 rounded-2xl p-4 space-y-3 shadow-xs">
                      {/* Black Bubble Note matching Image 4 */}
                      <div className="relative bg-slate-900 text-white p-3.5 rounded-2xl border-2 border-slate-700 flex items-center justify-between gap-3 shadow-md">
                        <div className="space-y-0.5">
                          <p className="font-black text-xs sm:text-sm text-purple-300 leading-snug">
                            you can enter here as your district, block and if you are in a village so enter village name
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          🛣️
                        </div>
                      </div>

                      {/* Mock UI Input */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-extrabold text-purple-700 uppercase">Road Name / Area / Colony *</span>
                        <div className="bg-white px-3 py-2 rounded-lg border border-purple-300 text-xs sm:text-sm font-extrabold text-slate-900 flex items-center justify-between">
                          <span>Main Road, District, Block or Village Name</span>
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      💡 <strong className="text-purple-900">How to fill:</strong> Enter your street, area, colony, district, block or village name.
                    </p>
                  </div>
                )}

                {/* 5. LANDMARK INSTRUCTION & GUIDE */}
                {(activeHelpTab === 'all' || activeHelpTab === 'landmark') && (
                  <div className="bg-purple-50/50 border-2 border-purple-200 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-purple-700 text-white font-extrabold text-[10px] rounded-lg tracking-wide uppercase">
                        5. Landmark Instruction
                      </span>
                      <span className="text-xs font-bold text-slate-500">Field 5 of 5</span>
                    </div>

                    {/* Screenshot Mockup Container */}
                    <div className="bg-white border border-purple-200 rounded-2xl p-4 space-y-3 shadow-xs">
                      {/* Black Bubble Note */}
                      <div className="relative bg-slate-900 text-white p-3.5 rounded-2xl border-2 border-slate-700 flex items-center justify-between gap-3 shadow-md">
                        <div className="space-y-0.5">
                          <p className="font-black text-xs sm:text-sm text-purple-300 leading-snug">
                            enter nearby famous place e.g. Near Shiv Temple, Opposite Post Office, or Behind Govt Hospital
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          📍
                        </div>
                      </div>

                      {/* Mock UI Input */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-extrabold text-purple-700 uppercase">Landmark / Nearby Place (Optional)</span>
                        <div className="bg-white px-3 py-2 rounded-lg border border-purple-300 text-xs sm:text-sm font-extrabold text-slate-900 flex items-center justify-between">
                          <span>Near Shiv Temple, Main Market</span>
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      💡 <strong className="text-purple-900">How to fill:</strong> Enter any famous nearby spot (temple, school, hospital, bank or tower) so courier partners can reach you faster.
                    </p>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 shrink-0 flex items-center justify-between">
                <p className="text-[11px] text-slate-500 font-medium">Click any field in form to fill address</p>
                <button
                  type="button"
                  onClick={() => setIsAddressHelpOpen(false)}
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Got It / समझ आ गया
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TACTILE BOTTOM NAVIGATION (Visible only on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-around h-14 px-1 rounded-t-xl">
        <button
          id="nav-store-btn"
          onClick={() => setActiveTab('store')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
            activeTab === 'store' ? 'text-emerald-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Shop</span>
        </button>

        <button
          id="nav-favorites-btn"
          onClick={() => setActiveTab('wishlist')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative cursor-pointer ${
            activeTab === 'wishlist' ? 'text-rose-600 dark:text-rose-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Heart className={`w-5 h-5 ${wishlistProductIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
          {wishlistProductIds.length > 0 && (
            <span className="absolute top-1.5 right-2 sm:right-3 bg-rose-500 text-white font-extrabold text-[8px] min-w-[15px] h-3.5 px-1 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
              {wishlistProductIds.length}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Favorites</span>
        </button>

        <button
          id="nav-orders-btn"
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
            activeTab === 'orders' ? 'text-emerald-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Orders</span>
        </button>

        <button
          id="nav-notifications-btn"
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative cursor-pointer ${
            activeTab === 'notifications' ? 'text-emerald-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Bell className="w-5 h-5" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1.5 right-2 sm:right-3 bg-rose-500 text-white font-extrabold text-[8px] min-w-[15px] h-3.5 px-1 rounded-full flex items-center justify-center border border-white dark:border-slate-900 animate-pulse">
              {unreadNotifCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Notifs</span>
        </button>

        <button
          id="nav-profile-btn"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative cursor-pointer ${
            activeTab === 'profile' ? 'text-emerald-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </nav>

      {/* 5. LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxData && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md overflow-hidden select-none animate-fade-in">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between text-white bg-gradient-to-b from-black/60 to-transparent z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Product Image / उत्पाद छवि
                </span>
                <span className="text-sm font-black truncate max-w-[200px] sm:max-w-md">
                  {lightboxData.productName}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-700/30">
                  {lightboxData.currentIndex + 1} / {lightboxData.images.length}
                </span>
                <button
                  id="lightbox-close-btn"
                  onClick={() => setLightboxData(null)}
                  className="p-2 bg-slate-800 hover:bg-rose-600 rounded-full text-slate-200 hover:text-white transition-all cursor-pointer shadow-lg"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clickable backdrop area for closing */}
            <div 
              className="absolute inset-0 z-0 cursor-zoom-out" 
              onClick={() => setLightboxData(null)}
            />

            {/* Main Stage */}
            <div 
              className="relative flex-1 w-full flex items-center justify-center p-4 z-10 cursor-zoom-out"
              onClick={() => setLightboxData(null)}
            >
              {/* Previous Button */}
              {lightboxData.images.length > 1 && (
                <button
                  id="lightbox-prev-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxData(prev => {
                      if (!prev) return null;
                      const newIdx = prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1;
                      return { ...prev, currentIndex: newIdx };
                    });
                  }}
                  className="absolute left-4 sm:left-6 p-2.5 bg-slate-900/60 hover:bg-slate-800 text-white rounded-full transition-all cursor-pointer z-20 border border-slate-800/50 backdrop-blur-xs"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Main Image Container with zoom confinement */}
              <div 
                className="relative overflow-hidden flex items-center justify-center max-w-[90vw] max-h-[70vh] sm:max-h-[75vh] rounded-2xl shadow-2xl border border-white/10 bg-slate-900/40 select-none cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  key={lightboxData.images[lightboxData.currentIndex]}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  src={lightboxData.images[lightboxData.currentIndex]}
                  alt={lightboxData.productName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                  }}
                  className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain select-none transition-all"
                  style={{
                    transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                    transformOrigin: isZoomed ? `${panPosition.x}% ${panPosition.y}%` : 'center center',
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                    transition: isZoomed 
                      ? 'transform 0.05s ease-out, transform-origin 0.1s ease-out' 
                      : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(!isZoomed);
                  }}
                  onMouseMove={(e) => {
                    if (!isZoomed) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setPanPosition({ 
                      x: Math.max(0, Math.min(100, x)), 
                      y: Math.max(0, Math.min(100, y)) 
                    });
                  }}
                  onTouchMove={(e) => {
                    if (!isZoomed) return;
                    const touch = e.touches[0];
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((touch.clientX - rect.left) / rect.width) * 100;
                    const y = ((touch.clientY - rect.top) / rect.height) * 100;
                    setPanPosition({ 
                      x: Math.max(0, Math.min(100, x)), 
                      y: Math.max(0, Math.min(100, y)) 
                    });
                  }}
                />

                {/* Helpful status indicator */}
                <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-xs text-[10px] text-slate-300 px-3 py-1.5 rounded-full font-bold shadow-md select-none pointer-events-none transition-opacity duration-300 opacity-80 group-hover:opacity-100 flex items-center gap-1.5 border border-white/5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>
                    {isZoomed 
                      ? "Drag / Move to Inspect details • विवरण देखने के लिए घुमाएं" 
                      : "Click Image to Zoom • ज़ूम करने के लिए क्लिक करें"}
                  </span>
                </div>
              </div>

              {/* Next Button */}
              {lightboxData.images.length > 1 && (
                <button
                  id="lightbox-next-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxData(prev => {
                      if (!prev) return null;
                      const newIdx = prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1;
                      return { ...prev, currentIndex: newIdx };
                    });
                  }}
                  className="absolute right-4 sm:right-6 p-2.5 bg-slate-900/60 hover:bg-slate-800 text-white rounded-full transition-all cursor-pointer z-20 border border-slate-800/50 backdrop-blur-xs"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Strip for easy switching */}
            {lightboxData.images.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto py-2 max-w-lg mx-auto no-scrollbar z-20">
                {lightboxData.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxData(prev => prev ? { ...prev, currentIndex: idx } : null)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      idx === lightboxData.currentIndex 
                        ? 'border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20' 
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. SUPPORT HELP CENTER MODAL */}
        {supportOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-50/90 px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-500" />
                    Help & Creator Support / सहायता केंद्र
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Order ID: <span className="font-mono font-bold text-slate-600">{supportOrder.id}</span></p>
                </div>
                <button
                  id="close-support-btn"
                  onClick={() => setSupportOrder(null)}
                  className="p-1.5 hover:bg-slate-200/65 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {!supportSubmitted ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!supportMessage.trim()) {
                        showToast?.("Please enter details of your concern! / कृपया अपनी समस्या का विवरण लिखें!", "error");
                        return;
                      }
                      if (!supportPhone || supportPhone.length !== 10) {
                        showToast?.("Please enter a valid 10-digit callback phone! / कृपया वैध मोबाइल नंबर दर्ज करें!", "error");
                        return;
                      }
                      setSupportSubmitted(true);
                      showToast?.("Support ticket generated successfully! / टिकट सफलता पूर्वक दर्ज हुआ", "success");
                    }}
                    className="space-y-4"
                  >
                    {/* Select Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Select Support Category / समस्या की श्रेणी चुनें *
                      </label>
                      <div className="relative">
                        <select
                          id="support-category-select"
                          value={supportCategory}
                          onChange={(e) => setSupportCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs appearance-none font-medium text-slate-700 cursor-pointer"
                        >
                          <option value="delivery">Delayed Delivery / डिलीवरी में देरी</option>
                          <option value="product">Defective / Damaged Item / खराब उत्पाद प्राप्त हुआ</option>
                          <option value="size">Size / Measurement Mismatch / गलत आकार (साइज़)</option>
                          <option value="payment">Refund or Return Query / भुगतान और वापसी समस्या</option>
                          <option value="other">Other Artisan Inquiries / अन्य सहायता</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* Order Summary Reference */}
                    <div className="p-3.5 bg-emerald-50/45 border border-emerald-100 rounded-xl space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Support Context / संदर्भ</div>
                      <div className="text-xs text-slate-600 font-medium">
                        Contains <span className="font-bold text-slate-800">{supportOrder.items.length} items</span> total payable <span className="font-bold text-emerald-600">₹{supportOrder.totalAmount}</span> placed on {new Date(supportOrder.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Detailed Message */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700">
                          Describe your concern / अपनी समस्या विस्तार से लिखें *
                        </label>
                        <span className={`text-[10px] font-mono font-bold ${supportMessage.length > 450 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {supportMessage.length}/500
                        </span>
                      </div>
                      <textarea
                        id="support-message-textarea"
                        required
                        maxLength={500}
                        rows={4}
                        placeholder="Write details of delivery delays, damage points, sizing issues, or billing doubts here..."
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 placeholder-slate-400 leading-relaxed"
                      />
                    </div>

                    {/* Callback Phone prefill */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Confirm Callback Mobile / संपर्क के लिए मोबाइल नंबर *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          id="support-phone-input"
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          maxLength={10}
                          placeholder="Callback Mobile Phone"
                          value={supportPhone}
                          onChange={(e) => setSupportPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-slate-700"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Our workshop support managers will reach out to you on this number within 4 business hours.
                      </p>
                    </div>

                    {/* Submit button */}
                    <button
                      id="submit-support-btn"
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Submit Query & Create Ticket / शिकायत दर्ज करें
                    </button>
                  </form>
                ) : (
                  <div className="py-6 text-center space-y-5 animate-fade-in">
                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                      <ShieldCheck className="w-9 h-9" />
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-slate-800 text-lg">Support Ticket Created!</h4>
                      <p className="text-xs text-slate-500">
                        Our local creators have been notified of your inquiry.
                      </p>
                    </div>

                    {/* Ticket Badge */}
                    <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl max-w-sm mx-auto space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                        <span>Ticket Number:</span>
                        <span className="font-mono font-black text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {supportTicketId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>Callback Contact:</span>
                        <span className="font-mono font-bold text-slate-700">
                          +91 {supportPhone}
                        </span>
                      </div>
                    </div>

                    {/* Instant Direct Action Triggers */}
                    <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4.5 space-y-3.5 max-w-sm mx-auto text-left">
                      <div className="font-extrabold text-[11px] text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        Instant Direct Helplines / तुरंत सहायता
                      </div>
                      
                      <div className="space-y-2.5">
                        <a
                          id="support-instagram-link"
                          href="https://www.instagram.com/editing_verse_03?igsh=cHRpZjB5ZGQ5cTBo"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-pink-200 rounded-xl text-xs font-bold text-slate-800 transition-all shadow-xs"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                            <Instagram className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block font-extrabold text-slate-900 text-[11px]">Contact on Instagram (@editing_verse_03)</span>
                            <span className="text-[10px] text-pink-600 block font-semibold">Direct Message / इंस्टाग्राम मैसेज सपोर्ट</span>
                          </div>
                        </a>

                        <button
                          type="button"
                          id="support-ai-chat-btn"
                          onClick={() => {
                            setIsHelpOpen(true);
                            handleSendAiQuery(`I raised support ticket ${supportTicketId} for Order #${supportOrder.id} regarding [${supportCategory.toUpperCase()}]: ${supportMessage}. How will this be processed?`);
                          }}
                          className="w-full flex items-center gap-3 p-2.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-100 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 rounded-xl text-xs font-bold text-slate-800 transition-all shadow-xs cursor-pointer text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block font-extrabold text-slate-900 text-[11px]">Ask Sasta AI Assistant (24x7)</span>
                            <span className="text-[10px] text-purple-600 block font-semibold">Instant resolution guide for Order #{supportOrder.id}</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <button
                      id="close-support-done-btn"
                      onClick={() => setSupportOrder(null)}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer inline-block"
                    >
                      Close Help Center / बंद करें
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* CUSTOM CONFIRMATION MODAL (Iframe Safe) */}
        {confirmAction && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-5"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-extrabold text-slate-800 text-sm">Please Confirm / पुष्टि करें</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {confirmAction.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  id="confirm-modal-cancel-btn"
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-extrabold rounded-xl transition-all text-xs cursor-pointer border border-slate-200"
                >
                  No, Keep It / नहीं
                </button>
                <button
                  id="confirm-modal-action-btn"
                  onClick={confirmAction.onConfirm}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-md shadow-amber-600/15"
                >
                  {confirmAction.actionLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            id="back-to-top-btn"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            title="Back to top / ऊपर जाएँ"
            aria-label="Back to top"
            className="fixed bottom-20 md:bottom-8 right-5 md:right-8 z-50 p-3 md:p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center border border-emerald-500/30 group active:scale-95"
          >
            <ChevronUp className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 1. CELEBRATORY ORDER SUCCESS ANIMATION MODAL */}
      <AnimatePresence>
        {showOrderSuccessModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderSuccessModal(false)}
              className="fixed inset-0 bg-slate-900/85 backdrop-blur-md"
            />

            {/* Confetti Particle Explosion */}
            <div className="fixed inset-0 pointer-events-none z-[81] overflow-hidden flex items-center justify-center">
              {Array.from({ length: 36 }).map((_, i) => {
                const colors = ['bg-emerald-500', 'bg-rose-500', 'bg-amber-400', 'bg-indigo-500', 'bg-sky-400', 'bg-purple-500', 'bg-teal-400'];
                const color = colors[i % colors.length];
                const angle = (i / 36) * 360;
                const distance = 120 + (i % 5) * 40;
                const rad = (angle * Math.PI) / 180;
                const targetX = Math.cos(rad) * distance;
                const targetY = Math.sin(rad) * distance - 30;
                const isCircle = i % 3 === 0;

                return (
                  <motion.div
                    key={`confetti-particle-${i}`}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ 
                      x: targetX, 
                      y: targetY, 
                      scale: [0, 1.5, 0.8], 
                      rotate: [0, 180, 360],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ duration: 1.6, delay: 0.15 + (i % 6) * 0.03, ease: "easeOut" }}
                    className={`absolute ${color} ${isCircle ? 'rounded-full w-3.5 h-3.5' : 'w-3 h-3 rounded-xs'} shadow-xs`}
                  />
                );
              })}
            </div>

            {/* Main Modal Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl z-[82] overflow-hidden border border-emerald-100 dark:border-emerald-900/50 my-auto text-center p-6 md:p-8"
            >
              {/* Top Banner Ribbon */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

              {/* Animated Circle & Checkmark Badge (As shown in reference video) */}
              <div className="relative w-28 h-28 mx-auto mb-5 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#e2e8f0"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#10b981"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray="301.59"
                    initial={{ strokeDashoffset: 301.59 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </svg>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 380, damping: 20 }}
                  className="absolute inset-2 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/40"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.48, type: "spring", stiffness: 450, damping: 18 }}
                  >
                    <Check className="w-12 h-12 stroke-[3.5] text-white" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Title Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-1.5 mb-6"
              >
                <h3 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Order Successful
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  ऑर्डर सफलतापूर्वक स्वीकार कर लिया गया है! Your Cash on Delivery order is assigned for hand-packaging.
                </p>
              </motion.div>

              {/* Delivery Van Animation Card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/60 p-4 rounded-2xl border border-emerald-100 dark:border-slate-700/80 mb-6 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/50 dark:border-slate-700 pb-2.5">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ x: [-3, 3, -3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs"
                    >
                      <Truck className="w-5 h-5" />
                    </motion.div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Delivery Mode
                      </p>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Express Local Dispatch (2-3 Days)
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md shadow-xs">
                    COD Active
                  </span>
                </div>

                {/* Order ID & Address */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Order ID</span>
                    <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200">
                      #{orderSuccess || 'ORDER-LOCAL'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Payable Amount</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                      ₹{lastPlacedOrderDetails?.totalAmount || '0'} (COD)
                    </span>
                  </div>
                </div>

                {/* Receiver Info */}
                <div className="pt-2 border-t border-emerald-100 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 text-left">
                  <span className="font-semibold">Deliver to: <strong className="text-slate-900 dark:text-white">{formData.name || 'Customer'}</strong> ({formData.cityVillageTown || 'Local'}){formData.landmark ? ` • Landmark: ${formData.landmark}` : ''}</span>
                </div>
              </div>

              {/* Modal Action CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  id="order-success-modal-track-btn"
                  onClick={() => {
                    setShowOrderSuccessModal(false);
                    setActiveTab('orders');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <PackageCheck className="w-4 h-4" />
                  Track Order / ऑर्डर देखें
                </button>
                <button
                  id="order-success-modal-shop-btn"
                  onClick={() => {
                    setShowOrderSuccessModal(false);
                    setActiveTab('store');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping / आगे खरीदें
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SETTINGS & LANGUAGE MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl z-[71] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 my-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base md:text-lg">App Settings / सेटिंग्स</h3>
                    <p className="text-xs text-emerald-100">Language, Sound & Display Preferences</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="close-settings-modal-btn"
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-8">
                
                {/* 1. Language Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">
                        Select App Language / भाषा का चयन करें
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full uppercase">
                      Active: {selectedLanguage}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {STORE_LANGUAGES.map((lang) => {
                      const isSelected = selectedLanguage === lang.code;
                      return (
                        <button
                          key={`lang-${lang.code}`}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(lang.code);
                            try { localStorage.setItem('sasta_user_lang', lang.code); } catch(e){}
                            showToast?.(`Language changed to ${lang.name} (${lang.native})`, "success");
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{lang.flag}</span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {lang.native}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                              {lang.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Quick Help & Customer Desk Link */}
                <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-purple-950 dark:text-purple-200">Need Help or Have Order Issues?</h5>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300">Open 24x7 Customer Help desk, Sasta AI Assistant & FAQs</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsHelpOpen(true);
                    }}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Open Help Center
                  </button>
                </div>

                {/* 3. Theme Mode */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-amber-500" />
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">
                        Display Mode / थीम
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isDark && toggleTheme) toggleTheme();
                      }}
                      className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        !isDark 
                          ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-extrabold">Light Mode (लाइट थीम)</p>
                        <p className="text-[10px] text-slate-500">Clean white layout</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isDark && toggleTheme) toggleTheme();
                      }}
                      className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 font-bold shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-xs font-extrabold">Dark Mode (डार्क थीम)</p>
                        <p className="text-[10px] text-slate-500">Eye-safe night canvas</p>
                      </div>
                    </button>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 font-medium">SastaStore Settings v2.4</span>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save & Done / हो गया
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. HELP & CUSTOMER SUPPORT CENTER MODAL */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpOpen(false)}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl z-[71] flex flex-col overflow-hidden border border-purple-200 dark:border-purple-900 my-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base md:text-lg">Help & Customer Support / सहायता केंद्र</h3>
                    <p className="text-xs text-purple-100">24x7 Sasta AI Assistant, Instagram DM & FAQs</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="close-help-modal-btn"
                  onClick={() => setIsHelpOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6">

                {/* Direct Contact Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="https://www.instagram.com/editing_verse_03?igsh=cHRpZjB5ZGQ5cTBo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-pink-950/40 dark:to-purple-950/40 hover:from-pink-100 hover:to-purple-100 text-pink-900 dark:text-pink-300 rounded-2xl border border-pink-200 dark:border-pink-800 flex items-center gap-3 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block">Instagram Direct Message</span>
                      <span className="text-[10px] text-pink-700 dark:text-pink-400 font-semibold">@editing_verse_03</span>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const inputElem = document.querySelector('input[placeholder*="Ask Sasta AI"]') as HTMLInputElement;
                      if (inputElem) inputElem.focus();
                    }}
                    className="p-3.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-800 dark:text-purple-300 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center gap-3 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block">Sasta AI Assistant</span>
                      <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">24x7 Instant Q&A Help</span>
                    </div>
                  </button>
                </div>

                {/* 24x7 SastaStore Gemini AI Help Assistant Chatbot */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-5 rounded-3xl border border-purple-200 dark:border-purple-900 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                          SastaStore AI Help Assistant (24x7)
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold">Online</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Ask any question about SastaStore products, orders, COD & returns</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat History Messages Window */}
                  <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 max-h-72 min-h-48 overflow-y-auto space-y-3 shadow-inner">
                    {aiChatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'ai' && (
                          <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-purple-600 text-white rounded-tr-xs font-medium'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                          <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    ))}

                    {aiChatLoading && (
                      <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 py-1 font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sasta AI is typing answer...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Common Questions / सवाल चुनें:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '🚚 How to track my order?',
                        '💵 Is Cash on Delivery available?',
                        '🔄 How do returns & replacements work?',
                        '🏷️ Why are prices up to 70% cheap?',
                        '📱 How to register with mobile OTP?'
                      ].map((chipText, i) => (
                        <button
                          key={i}
                          type="button"
                          disabled={aiChatLoading}
                          onClick={() => handleSendAiQuery(chipText)}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {chipText}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Chat Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAiQuery();
                    }}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder="Ask Sasta AI anything about SastaStore... / प्रश्न लिखें"
                      disabled={aiChatLoading}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!aiChatInput.trim() || aiChatLoading}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {aiChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Send</span>
                    </button>
                  </form>
                </div>

                {/* Frequently Asked Questions Accordion */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">
                    Frequently Asked Questions (अक्सर पूछे जाने वाले सवाल)
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                      <p className="font-extrabold text-slate-900 dark:text-white">Q. How do I change my delivery address?</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">You can save your address in My Profile, or update it during checkout step before placing order.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                      <p className="font-extrabold text-slate-900 dark:text-white">Q. What if I receive a damaged product?</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Raise a support ticket or ask Sasta AI Assistant to get an instant free replacement shipped within 24 hours.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 font-medium">SastaStore 24x7 Customer Help</span>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Close / बंद करें
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORDER DETAILS MODAL (SCREENSHOT 2 STYLE) */}
      <AnimatePresence>
        {selectedOrderDetailModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderDetailModal(null)}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-slate-50 dark:bg-slate-900 w-full max-w-lg max-h-[92vh] rounded-3xl shadow-2xl z-[81] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 my-auto text-slate-800 dark:text-slate-100"
            >
              {/* Top Bar Header */}
              <div className="bg-white dark:bg-slate-900 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetailModal(null)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-black text-sm sm:text-base tracking-wide uppercase text-slate-900 dark:text-white">
                    ORDER DETAILS
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSupportOrder(selectedOrderDetailModal);
                    setSelectedOrderDetailModal(null);
                  }}
                  className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-black text-xs uppercase tracking-wider hover:underline cursor-pointer bg-purple-50 dark:bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800"
                >
                  <Headphones className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span>HELP</span>
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-4 overflow-y-auto space-y-4">
                {/* 1. Product Summary Card */}
                {selectedOrderDetailModal.items.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-2xs">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                        }}
                        className="w-20 h-20 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold font-mono text-slate-500 truncate max-w-[210px]">
                            Order #{selectedOrderDetailModal.id}
                          </p>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">
                          {item.selectedSize || 'Free Size'} • {selectedOrderDetailModal.paymentMethod === 'cod' ? 'COD' : 'Prepaid'}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                          All issue easy returns
                        </p>
                      </div>
                    </div>

                    {/* Rating row inside card */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star key={st} className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotoUploadModalItem({ orderId: selectedOrderDetailModal.id, itemId: item.id || '0', name: item.name })}
                        className="px-3.5 py-1.5 border-2 border-purple-600 text-purple-700 dark:text-purple-300 font-black text-xs rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all flex items-center gap-1.5 relative cursor-pointer"
                      >
                        <span>Add Photos/Videos</span>
                        <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-1 -right-1" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* 2. Delivery Status Banner Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 fill-emerald-600 stroke-none" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                        {selectedOrderDetailModal.status === 'Delivered' ? 'Delivered Early' :
                         selectedOrderDetailModal.status === 'Cancelled' ? 'Order Cancelled' :
                         selectedOrderDetailModal.status === 'Shipped' ? 'In Transit' : 'Order Placed'}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500">
                        {new Date(selectedOrderDetailModal.createdAt).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  {/* Banner Box */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 fill-emerald-600 stroke-none" />
                    <span>
                      {selectedOrderDetailModal.status === 'Delivered'
                        ? '⚡ Yay! Your order was delivered 3 days earlier.'
                        : selectedOrderDetailModal.status === 'Cancelled'
                        ? 'Order status updated to cancelled.'
                        : 'Order is being dispatched with high priority.'}
                    </span>
                  </div>
                </div>

                {/* 3. Return & Exchange Policy Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between text-xs font-extrabold shadow-2xs">
                  <span className="text-slate-700 dark:text-slate-300">
                    No Return - Exchange available
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowReturnPolicyModal(true)}
                    className="text-purple-700 dark:text-purple-400 font-black uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    KNOW MORE
                  </button>
                </div>

                {/* 4. Delivery Address Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
                    <MapPin className="w-4 h-4 fill-indigo-600 dark:fill-indigo-400 text-white" />
                    <span>Delivery Address</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedOrderDetailModal.customerDetails?.name || 'Customer'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedOrderDetailModal.customerDetails?.address}, {selectedOrderDetailModal.customerDetails?.cityVillageTown}, {selectedOrderDetailModal.customerDetails?.state} - <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedOrderDetailModal.customerDetails?.pincode}</span>
                    </p>
                    {selectedOrderDetailModal.customerDetails?.landmark && (
                      <p className="text-slate-500 text-[11px]">
                        Landmark: {selectedOrderDetailModal.customerDetails.landmark}
                      </p>
                    )}
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200 pt-0.5">
                      {selectedOrderDetailModal.customerDetails?.mobile}
                    </p>
                  </div>
                </div>

                {/* 5. Billing Summary */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-2 shadow-2xs text-xs">
                  <div className="font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                    Order Summary
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Items Total</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{selectedOrderDetailModal.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white font-black text-sm pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span>Total Paid</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">₹{selectedOrderDetailModal.totalAmount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHOTO / VIDEO UPLOAD MODAL */}
      <AnimatePresence>
        {photoUploadModalItem && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPhotoUploadModalItem(null)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full shadow-2xl z-[91] border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-base">Add Photos & Videos</h3>
                <button onClick={() => setPhotoUploadModalItem(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <p className="text-xs text-slate-500 font-medium">Upload photos/videos for <strong>{photoUploadModalItem.name}</strong> to earn reward points & help other buyers!</p>
              <div className="border-2 border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 p-6 rounded-2xl text-center space-y-2 cursor-pointer hover:bg-purple-100/50 transition-all">
                <Upload className="w-8 h-8 text-purple-600 mx-auto" />
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">Click or Drag & Drop Photos / Videos here</p>
                <p className="text-[10px] text-slate-400">PNG, JPG, MP4 up to 50MB</p>
              </div>
              <button onClick={() => { showToast?.("Photos & videos uploaded successfully!", "success"); setPhotoUploadModalItem(null); }} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md cursor-pointer">
                Submit Review Attachments
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RETURN & EXCHANGE POLICY MODAL */}
      <AnimatePresence>
        {showReturnPolicyModal && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReturnPolicyModal(false)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full shadow-2xl z-[91] border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-base">Return & Exchange Policy</h3>
                <button onClick={() => setShowReturnPolicyModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
                <p><strong>1. Easy Exchanges:</strong> You can request an exchange within 7 days of delivery for size mismatch or defective items.</p>
                <p><strong>2. Instant Pickup:</strong> Our delivery partner will collect the product from your address for free.</p>
                <p><strong>3. Support Guarantee:</strong> If you face any issues, click HELP in order details or contact creator support directly.</p>
              </div>
              <button onClick={() => setShowReturnPolicyModal(false)} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md cursor-pointer">
                Got it / समझ गया
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
