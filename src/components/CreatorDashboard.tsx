import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductImageSlider } from './ProductImageSlider';
import { 
  Plus, 
  Trash2, 
  Edit,
  Package, 
  TrendingUp, 
  ShoppingBag, 
  Check,
  CheckCircle, 
  Clock, 
  Image as ImageIcon, 
  Upload, 
  X, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  User, 
  Phone, 
  MapPin, 
  AlertCircle,
  Undo2,
  ListOrdered,
  Lock,
  Search,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Bell,
  Send,
  Sun,
  Moon,
  Eye,
  MessageSquare,
  BarChart2,
  RotateCcw,
  DollarSign,
  PieChart,
  Users,
  Star,
  RefreshCw,
  FileText,
  Download,
  Filter,
  ShieldAlert
} from 'lucide-react';
import { Product, Order, PRODUCT_CATEGORIES, Notification } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface CreatorDashboardProps {
  products: Product[];
  refreshProducts: () => void;
  onLogout: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  isDark?: boolean;
  toggleTheme?: () => void;
  isLoading?: boolean;
}

const CreatorProductCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between animate-pulse">
    {/* Image preview skeleton */}
    <div className="relative aspect-square bg-slate-200/80 dark:bg-slate-800 w-full overflow-hidden">
      <div className="absolute top-2.5 right-2.5 flex gap-1.5">
        <div className="w-7 h-7 bg-slate-300/80 dark:bg-slate-700/70 rounded-lg"></div>
        <div className="w-7 h-7 bg-slate-300/80 dark:bg-slate-700/70 rounded-lg"></div>
      </div>
      <div className="absolute bottom-2.5 left-2.5 w-16 h-4 bg-slate-300/80 dark:bg-slate-700/70 rounded-lg"></div>
    </div>

    {/* Content skeleton */}
    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200/90 dark:bg-slate-800 rounded-md w-11/12"></div>
        <div className="h-3.5 bg-slate-200/70 dark:bg-slate-800/60 rounded-md w-2/3"></div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="h-2.5 w-8 bg-slate-200/80 dark:bg-slate-800 rounded"></div>
          <div className="h-5 w-16 bg-indigo-100/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40 rounded-md"></div>
        </div>
        <div className="h-6 w-16 bg-slate-200/80 dark:bg-slate-800 rounded-lg"></div>
      </div>
    </div>
  </div>
);

interface CreatorUser {
  username: string;
  password: string;
  names: string[];
  mobiles: string[];
  ordersCount: number;
}

export default function CreatorDashboard({ products, refreshProducts, onLogout, showToast, isDark, toggleTheme, isLoading = false }: CreatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'returns' | 'products' | 'add' | 'users' | 'notifications'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [expandedOrderItems, setExpandedOrderItems] = useState<Record<string, boolean>>({});

  // States for Analytics tab
  const [analyticsTimeFilter, setAnalyticsTimeFilter] = useState<'7days' | '30days' | 'all'>('all');

  // States for Returns tab
  const [returnSearchQuery, setReturnSearchQuery] = useState<string>('');
  const [returnFilterStatus, setReturnFilterStatus] = useState<string>('all');
  const [returnNotes, setReturnNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('sasta_creator_return_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleSaveReturnNote = (orderId: string, note: string) => {
    const updated = { ...returnNotes, [orderId]: note };
    setReturnNotes(updated);
    try {
      localStorage.setItem('sasta_creator_return_notes', JSON.stringify(updated));
      showToast?.("Return note saved successfully! / नोट सहेजा गया", "success");
    } catch (e) {
      console.error(e);
    }
  };

  // States for updating estimated arrival dates
  const [editingArrivalOrderId, setEditingArrivalOrderId] = useState<string | null>(null);
  const [tempArrivalDate, setTempArrivalDate] = useState<string>('');

  // States for updating return window days
  const [editingReturnOrderId, setEditingReturnOrderId] = useState<string | null>(null);
  const [tempReturnDays, setTempReturnDays] = useState<string>('');

  // States for sending notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifMessage, setNewNotifMessage] = useState('');
  const [newNotifTargetType, setNewNotifTargetType] = useState<'all' | 'user'>('all');
  const [newNotifTargetUser, setNewNotifTargetUser] = useState('');

  // Users lookup state
  const [creatorUsers, setCreatorUsers] = useState<CreatorUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Add Product form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [imageUrlInputs, setImageUrlInputs] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inStock, setInStock] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizePrices, setSizePrices] = useState<Record<string, string>>({});

  // Custom confirmation modal state to bypass iframe modal restrictions
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    actionLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const startNewProductForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setCategory(PRODUCT_CATEGORIES[0]);
    setImageUrlInputs(['']);
    setInStock(true);
    setSelectedSizes([]);
    setSizePrices({});
    setActiveTab('add');
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        if (selectedOrderModal) {
          const updated = data.find((o: Order) => o.id === selectedOrderModal.id);
          if (updated) setSelectedOrderModal(updated);
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/creator/users');
      if (res.ok) {
        const data = await res.json();
        setCreatorUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    refreshProducts();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  // Handle image files selection and convert to Base64 with high-efficiency canvas compression
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      
      filesArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const rawBase64 = reader.result;
            // Create an image to compress using canvas
            const img = new Image();
            img.src = rawBase64;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              const MAX_HEIGHT = 800;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.75 quality for lightweight but clear previews
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
                setImageUrlInputs(prev => {
                  if (prev.length === 1 && prev[0].trim() === "") {
                    return [compressedBase64];
                  }
                  return [...prev, compressedBase64];
                });
              }
            };
          }
        };
        reader.readAsDataURL(file);
      });
      // Reset file input element value so that uploading the same file triggers onChange correctly next time
      e.target.value = '';
    }
  };

  // Move an image forward or backward (left or right)
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const updated = [...imageUrlInputs];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx >= 0 && targetIdx < updated.length) {
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      setImageUrlInputs(updated);
    }
  };

  // Handle URL input changes
  const handleUrlInputChange = (index: number, val: string) => {
    const updated = [...imageUrlInputs];
    updated[index] = val;
    setImageUrlInputs(updated);
  };

  const addUrlInputField = () => {
    setImageUrlInputs([...imageUrlInputs, '']);
  };

  const removeUrlInputField = (index: number) => {
    setImageUrlInputs(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.length === 0 ? [''] : filtered;
    });
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    setConfirmAction({
      message: "Are you sure you want to delete this product? / क्या आप वाकई इस उत्पाद को हटाना चाहते हैं?",
      actionLabel: "Yes, Delete / हाँ, हटाएं",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            refreshProducts();
            showToast?.("Product deleted successfully / उत्पाद सफलतापूर्वक हटा दिया गया।", "success");
          } else {
            showToast?.("Failed to delete product.", "error");
          }
        } catch (e) {
          console.error(e);
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  // Toggle product stock status
  const handleToggleStock = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !currentStatus })
      });
      if (res.ok) {
        refreshProducts();
        showToast?.(`Product marked as ${!currentStatus ? 'In Stock / उपलब्ध' : 'Out of Stock / अनुपलब्ध'}!`, "success");
      } else {
        showToast?.("Failed to update stock status.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast?.("Error updating stock status.", "error");
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
        showToast?.(`Order status updated to ${status} / ऑर्डर की स्थिति बदल दी गई है।`, "success");
      } else {
        showToast?.("Failed to update status", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update order arrival date
  const handleUpdateOrderArrivalDate = async (orderId: string, arrivalDate: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arrivalDate })
      });
      if (res.ok) {
        setEditingArrivalOrderId(null);
        fetchOrders();
        showToast?.("Estimated arrival date updated / अनुमानित आगमन की तारीख सेट कर दी गई है।", "success");
      } else {
        showToast?.("Failed to update arrival date", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update order return window days
  const handleUpdateOrderReturnWindow = async (orderId: string, returnWindowDaysStr: string) => {
    try {
      const returnWindowDays = returnWindowDaysStr.trim() === '' ? null : Number(returnWindowDaysStr);
      if (returnWindowDays !== null && (isNaN(returnWindowDays) || returnWindowDays < 0)) {
        showToast?.("Please enter a valid number of days / कृपया दिनों की सही संख्या दर्ज करें।", "error");
        return;
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnWindowDays })
      });
      if (res.ok) {
        setEditingReturnOrderId(null);
        fetchOrders();
        showToast?.("Return window updated successfully / वापसी अवधि अपडेट कर दी गई है।", "success");
      } else {
        showToast?.("Failed to update return window", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await fetch('/api/notifications');
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

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifTitle.trim() || !newNotifMessage.trim()) {
      showToast?.("Please enter title and message / कृपया शीर्षक और संदेश दर्ज करें।", "error");
      return;
    }

    try {
      const payload = {
        title: newNotifTitle,
        message: newNotifMessage,
        targetType: newNotifTargetType,
        targetUser: newNotifTargetType === 'user' ? newNotifTargetUser : ''
      };

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast?.("Notification sent successfully! / अधिसूचना सफलतापूर्वक भेजी गई!", "success");
        setNewNotifTitle('');
        setNewNotifMessage('');
        setNewNotifTargetUser('');
        fetchNotifications();
      } else {
        showToast?.("Failed to send notification", "error");
      }
    } catch (e) {
      console.error(e);
      showToast?.("Error sending notification", "error");
    }
  };

  const handleDeleteNotification = (id: string) => {
    setConfirmAction({
      message: "Are you sure you want to delete this notification? / क्या आप वाकई इस सूचना को हटाना चाहते हैं?",
      actionLabel: "Yes, Delete / हाँ, हटाएं",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/notifications/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            showToast?.("Notification deleted successfully / अधिसूचना हटा दी गई है।", "success");
            fetchNotifications();
          } else {
            showToast?.("Failed to delete notification", "error");
          }
        } catch (e) {
          console.error(e);
        } finally {
          setConfirmAction(null);
        }
      }
    });
  };

  // Submit Product
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      showToast?.("Please fill in Name and Price! / कृपया नाम और मूल्य दर्ज करें!", "error");
      return;
    }

    setIsSubmitting(true);

    // Combine uploaded files (base64) and filled URL inputs
    const combinedImages = imageUrlInputs.filter(url => url.trim() !== "");

    // Process size prices
    const cleanSizePrices: Record<string, number> = {};
    Object.entries(sizePrices).forEach(([sz, pr]) => {
      const prStr = String(pr);
      if (prStr && prStr.trim() !== "") {
        const parsed = parseFloat(prStr);
        if (!isNaN(parsed) && parsed > 0) {
          cleanSizePrices[sz] = parsed;
        }
      }
    });

    const payload = {
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      images: combinedImages,
      inStock,
      sizes: selectedSizes,
      sizePrices: cleanSizePrices
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Reset form
        setName('');
        setDescription('');
        setPrice('');
        setOriginalPrice('');
        setCategory(PRODUCT_CATEGORIES[0]);
        setImageUrlInputs(['']);
        setInStock(true);
        setSelectedSizes([]);
        setSizePrices({});
        setEditingProduct(null);
        
        refreshProducts();
        showToast?.(editingProduct ? "Product updated successfully! / उत्पाद सफलतापूर्वक अपडेट किया गया!" : "Product added successfully! / उत्पाद सफलतापूर्वक जोड़ा गया!", "success");
        setActiveTab('products');
      } else {
        const err = await res.json();
        showToast?.(err.error || "Failed to save product", "error");
      }
    } catch (err) {
      console.error(err);
      showToast?.(editingProduct ? "Error updating product" : "Error adding product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dashboard calculations
  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter !== 'all' && order.status.toLowerCase() !== orderStatusFilter.toLowerCase()) {
      return false;
    }
    if (orderSearchQuery.trim() !== '') {
      const q = orderSearchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customerDetails?.name?.toLowerCase().includes(q) ?? false;
      const matchMobile = order.customerDetails?.mobile?.includes(q) ?? false;
      const matchCity = order.customerDetails?.cityVillageTown?.toLowerCase().includes(q) ?? false;
      const matchUsername = order.username?.toLowerCase().includes(q) ?? false;
      return matchId || matchName || matchMobile || matchCity || matchUsername;
    }
    return true;
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled' && o.status !== 'Returned')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Returned').length;

  // Process orders data for Recharts summary chart
  const chartData = React.useMemo(() => {
    if (!orders || orders.length === 0) {
      // If there are no orders, return last 7 days with 0 values
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        data.push({
          date: dateStr,
          revenue: 0,
          orders: 0,
          units: 0,
        });
      }
      return data;
    }

    // Sort orders by createdAt
    const sortedOrders = [...orders]
      .filter(o => o.createdAt)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (sortedOrders.length === 0) {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        data.push({
          date: dateStr,
          revenue: 0,
          orders: 0,
          units: 0,
        });
      }
      return data;
    }

    // Group by date
    const groups: { [key: string]: { revenue: number; orders: number; units: number } } = {};

    sortedOrders.forEach(order => {
      if (order.status === 'Cancelled' || order.status === 'Returned') {
        return;
      }
      const date = new Date(order.createdAt);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const unitsCount = order.items ? order.items.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;

      if (!groups[dateStr]) {
        groups[dateStr] = { revenue: 0, orders: 0, units: 0 };
      }
      groups[dateStr].revenue += order.totalAmount || 0;
      groups[dateStr].orders += 1;
      groups[dateStr].units += unitsCount;
    });

    const keys = Object.keys(groups);
    if (keys.length === 0) {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        data.push({
          date: dateStr,
          revenue: 0,
          orders: 0,
          units: 0,
        });
      }
      return data;
    }

    // Let's create a beautiful continuous range from the first order to today
    const firstOrderDate = new Date(sortedOrders[0].createdAt);
    const lastOrderDate = new Date(); // default to today
    
    const timeDiff = lastOrderDate.getTime() - firstOrderDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const dataList = [];
    
    // Limit continuous filling to a reasonable 30 days to keep the chart legible
    if (daysDiff <= 30 && daysDiff >= 0) {
      for (let i = 0; i <= daysDiff; i++) {
        const d = new Date(firstOrderDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dayData = groups[dateStr] || { revenue: 0, orders: 0, units: 0 };
        dataList.push({
          date: dateStr,
          revenue: dayData.revenue,
          orders: dayData.orders,
          units: dayData.units,
        });
      }
    } else {
      // If the range is longer, just output dates that have data
      keys.forEach((dateStr) => {
        dataList.push({
          date: dateStr,
          revenue: groups[dateStr].revenue,
          orders: groups[dateStr].orders,
          units: groups[dateStr].units,
        });
      });
    }

    return dataList;
  }, [orders]);

  return (
    <div id="creator-dashboard-root" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col pb-24 md:pb-8 transition-colors">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-100 shrink-0">
              C
            </div>
            <div>
              <span className="font-display text-xl font-extrabold text-slate-900 tracking-tight">
                sasta store <span className="text-indigo-600 font-bold">Creator</span>
              </span>
              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                Admin Control Center
              </div>
            </div>
          </div>

          {/* Desktop Tab Selector */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Orders</span>
            </button>
            <button
              id="creator-nav-analytics-desktop-btn"
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analytics / एनालिटिक्स</span>
            </button>
            <button
              id="creator-nav-returns-desktop-btn"
              onClick={() => setActiveTab('returns')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'returns' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Returns / रिटर्न्स</span>
              {orders.filter(o => o.status === 'Returned').length > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-extrabold">
                  {orders.filter(o => o.status === 'Returned').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'products' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Products</span>
            </button>
            <button
              onClick={startNewProductForm}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'add' && !editingProduct ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
            {editingProduct && (
              <button
                onClick={() => setActiveTab('add')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'add' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                ✏️ Edit Product
              </button>
            )}
            <button
              id="creator-nav-users-desktop-btn"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button
              id="creator-nav-notifications-desktop-btn"
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifs</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {toggleTheme && (
            <button
              id="creator-theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-100 dark:border-slate-700 shadow-xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
          )}

          <button
            id="creator-switch-role-btn"
            onClick={onLogout}
            className="text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-transparent dark:border-slate-700"
          >
            <Undo2 className="w-3.5 h-3.5" /> Back to Exit
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6">

        {/* STATS OVERVIEW - Grid of 4 beautifully designed metrics cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Revenue</span>
              <span className="font-display text-xl md:text-2xl font-extrabold text-slate-800">
                ₹{totalRevenue}
              </span>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Pending Orders</span>
              <span className="font-display text-xl md:text-2xl font-extrabold text-slate-800">
                {pendingOrders}
              </span>
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Deliveries</span>
              <span className="font-display text-xl md:text-2xl font-extrabold text-slate-800">
                {activeOrdersCount}
              </span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Products</span>
              <span className="font-display text-xl md:text-2xl font-extrabold text-slate-800">
                {products.length}
              </span>
            </div>
          </div>
        </div>

        {/* SUMMARY CHART CARD - Visualizes Daily Sales Volume and Revenue using Recharts */}
        <div id="dashboard-chart-card" className="bg-white rounded-2xl border border-slate-100 p-4 md:p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-display font-extrabold text-slate-800 text-lg">
                  Sales & Revenue Performance / बिक्री और राजस्व प्रदर्शन
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 pl-10">
                Daily analysis of sales volume (units sold) and total revenue generated (excluding cancelled & returned orders).
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block"></span>
                <span>Units Sold</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                <span>Revenue (₹)</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] md:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => `${value} u`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const rev = payload.find(p => p.dataKey === 'revenue')?.value ?? 0;
                      const units = payload.find(p => p.dataKey === 'units')?.value ?? 0;
                      const ords = payload.find(p => p.dataKey === 'orders')?.value ?? 0;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1.5 font-medium min-w-[150px]">
                          <p className="font-bold border-b border-slate-800 pb-1 text-slate-400">{label}</p>
                          <p className="flex justify-between gap-4 text-emerald-400">
                            <span>Revenue:</span>
                            <span className="font-mono font-bold">₹{rev}</span>
                          </p>
                          <p className="flex justify-between gap-4 text-indigo-300">
                            <span>Units Sold:</span>
                            <span className="font-mono font-bold">{units}</span>
                          </p>
                          <p className="flex justify-between gap-4 text-slate-300">
                            <span>Orders:</span>
                            <span className="font-mono font-bold">{ords}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="units" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* 1. ORDERS TAB */}
          {activeTab === 'orders' && (
            <motion.div
              key="creator-orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Header & Search / Filter Controls */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center gap-2">
                      <ListOrdered className="w-5 h-5 text-indigo-600" />
                      <span>Incoming Orders / ग्राहक ऑर्डर्स</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                        {filteredOrders.length} of {orders.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      View checkout customer details and toggle order status directly
                    </p>
                  </div>
                  <button
                    id="creator-refresh-orders-btn"
                    onClick={fetchOrders}
                    className="text-xs px-3.5 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Refresh Orders
                  </button>
                </div>

                {/* Search Bar & Filter Pills */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Search input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search name, phone, city, or order ID..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    {orderSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setOrderSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'accepted', label: 'Accepted' },
                      { id: 'shipped', label: 'Shipped' },
                      { id: 'delivered', label: 'Delivered' },
                      { id: 'cancelled', label: 'Cancelled' },
                      { id: 'returned', label: 'Returned' }
                    ].map(tab => {
                      const isActive = orderStatusFilter === tab.id;
                      const count = tab.id === 'all' 
                        ? orders.length 
                        : orders.filter(o => o.status.toLowerCase() === tab.id).length;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          id={`order-filter-tab-${tab.id}`}
                          onClick={() => setOrderStatusFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer whitespace-nowrap text-xs flex items-center gap-1 ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {loadingOrders ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-white rounded-2xl overflow-hidden border border-slate-100/80 shadow-xs flex flex-col justify-between p-5 space-y-4 animate-pulse">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="space-y-2">
                          <div className="h-3 w-16 bg-slate-200 rounded"></div>
                          <div className="h-4 w-32 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                      </div>
                      <div className="space-y-3 flex-1 py-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-3/4 bg-slate-200 rounded"></div>
                            <div className="h-3 w-1/4 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-3 w-12 bg-slate-200 rounded"></div>
                          <div className="h-4 w-16 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-8 w-24 bg-slate-200 rounded-xl"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4 shadow-xs max-w-xl mx-auto my-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <ListOrdered className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">No orders found</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {orderSearchQuery || orderStatusFilter !== 'all' 
                        ? "Try resetting your search query or status filter."
                        : "Customer orders will appear here automatically when they buy your products!"}
                    </p>
                  </div>
                  {(orderSearchQuery || orderStatusFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderSearchQuery('');
                        setOrderStatusFilter('all');
                      }}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Reset Filters / फ़िल्टर हटाएं
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(showAllOrders ? filteredOrders : filteredOrders.slice(0, 6)).map(order => {
                      const isItemsExpanded = expandedOrderItems[order.id] || false;
                      const itemsToRender = isItemsExpanded ? order.items : order.items.slice(0, 2);

                      return (
                        <div
                          id={`creator-order-card-${order.id}`}
                          key={order.id}
                          className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-200/50 transition-all"
                        >
                          {/* Order Details Header */}
                          <div className="bg-slate-50/80 px-4 py-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider block">
                                ORDER ID • {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              <span className="font-mono font-extrabold text-xs md:text-sm text-slate-800 block">{order.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs ${
                                order.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                order.status === 'Accepted' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                order.status === 'Shipped' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                order.status === 'Returned' ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' :
                                'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                {order.status}
                              </span>
                              <span className="font-extrabold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                ₹{order.totalAmount}
                              </span>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="p-4 space-y-4 flex-1">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                  Items Ordered ({order.items?.length || 0}):
                                </span>
                                {order.items.length > 2 && (
                                  <button
                                    type="button"
                                    id={`creator-toggle-order-items-${order.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedOrderItems(prev => ({ ...prev, [order.id]: !isItemsExpanded }));
                                    }}
                                    className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50/80 px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    {isItemsExpanded ? (
                                      <>
                                        <span>Show Less Items / कम दिखाएं</span>
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </>
                                    ) : (
                                      <>
                                        <span>See More Items (+{order.items.length - 2} more) / अन्य सामान देखें</span>
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              {itemsToRender.map((item, idx) => {
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

                                return (
                                  <div
                                    key={idx}
                                    onClick={() => setSelectedOrderModal(order)}
                                    className="bg-slate-50/70 hover:bg-indigo-50/50 rounded-2xl p-3.5 border border-slate-200/80 transition-all flex items-start gap-3.5 cursor-pointer relative group"
                                  >
                                    {/* Left product thumbnail image */}
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                                      }}
                                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-slate-200/80 shadow-2xs shrink-0"
                                    />

                                    {/* Middle content details */}
                                    <div className="flex-1 min-w-0 pr-6 space-y-0.5">
                                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {statusTitle}
                                      </h4>
                                      <p className="text-xs sm:text-sm font-semibold text-slate-600">
                                        {isCancelledOrReturned ? (
                                          `₹${item.priceAtPurchase * item.quantity} refunded on ${formattedDate}`
                                        ) : (
                                          `₹${item.priceAtPurchase * item.quantity} • ${formattedDate}`
                                        )}
                                      </p>
                                      <p className="text-xs text-slate-500 font-medium pt-0.5 flex items-center gap-1.5 flex-wrap">
                                        <span>Size: <strong className="text-slate-800 font-bold">{item.selectedSize || 'Free Size'}</strong></span>
                                        <span className="text-slate-300">•</span>
                                        <span>Qty: <strong className="text-slate-800 font-bold">{item.quantity}</strong></span>
                                      </p>
                                    </div>

                                    {/* Right Chevron arrow */}
                                    <div className="absolute right-3 top-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                      <ChevronRight className="w-5 h-5" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <hr className="border-slate-100" />

                            {/* Customer Checkout Information */}
                            <div 
                              onClick={() => setSelectedOrderModal(order)}
                              className="bg-indigo-50/30 p-3.5 rounded-xl text-xs text-slate-600 border border-indigo-100/60 space-y-2.5 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/60 transition-all group"
                            >
                              <div className="font-extrabold text-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-indigo-900">
                                  <User className="w-4 h-4 text-indigo-600" />
                                  <span>Checkout User Details:</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {order.username && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-mono font-extrabold">
                                      @{order.username}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold text-indigo-600 group-hover:underline flex items-center gap-0.5">
                                    <Eye className="w-3 h-3" /> Expand
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
                                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Customer Name & Phone</span>
                                  <p className="font-extrabold text-slate-900 text-sm">
                                    {order.customerDetails?.name || 'N/A'}
                                  </p>
                                  <p className="font-extrabold text-indigo-600 flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" />
                                    <a href={`tel:${order.customerDetails?.mobile}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                                      {order.customerDetails?.mobile || 'N/A'}
                                    </a>
                                  </p>
                                </div>

                                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
                                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Location Details</span>
                                  <p className="font-extrabold text-slate-800 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                    <span>Pincode: <span className="font-mono font-extrabold text-slate-900">{order.customerDetails?.pincode}</span></span>
                                  </p>
                                  <p className="font-bold text-slate-700">
                                    City: <span className="text-slate-900">{order.customerDetails?.cityVillageTown}</span> {order.customerDetails?.state ? `, ${order.customerDetails.state}` : ''}
                                  </p>
                                </div>

                                <div className="sm:col-span-2 bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
                                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Detailed Address</span>
                                  {order.customerDetails?.houseNoBuilding && (
                                    <p className="font-semibold text-slate-800">
                                      <strong className="text-indigo-900">House / Building:</strong> {order.customerDetails.houseNoBuilding}
                                    </p>
                                  )}
                                  <p className="font-semibold text-slate-800">
                                    <strong className="text-indigo-900">Road / Area / Colony:</strong> {order.customerDetails?.address || 'N/A'}
                                  </p>
                                  {order.customerDetails?.villageName && (
                                    <p className="font-semibold text-slate-800">
                                      <strong className="text-indigo-900">Village:</strong> {order.customerDetails.villageName}
                                    </p>
                                  )}
                                  {order.customerDetails?.landmark && (
                                    <p className="font-semibold text-slate-800">
                                      <strong className="text-indigo-900">Landmark:</strong> {order.customerDetails.landmark}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                id={`creator-expand-order-btn-${order.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderModal(order);
                                }}
                                className="w-full mt-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Click to Expand Full Address & Order Details / विवरण देखें</span>
                              </button>
                            </div>

                            {/* Estimated Arrival Date Section */}
                            <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-xl p-3 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                  <Calendar className="w-4 h-4 text-indigo-500" />
                                  <span>Estimated Arrival / आगमन तिथि:</span>
                                </div>
                                {editingArrivalOrderId !== order.id && (
                                  <button
                                    id={`edit-arrival-btn-${order.id}`}
                                    onClick={() => {
                                      setEditingArrivalOrderId(order.id);
                                      setTempArrivalDate(order.arrivalDate || '');
                                    }}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline decoration-dotted cursor-pointer"
                                  >
                                    {order.arrivalDate ? 'Update Date / बदलें' : 'Set Date / तिथि तय करें'}
                                  </button>
                                )}
                              </div>

                              {editingArrivalOrderId === order.id ? (
                                <div className="mt-2 space-y-2">
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      value={tempArrivalDate}
                                      onChange={(e) => setTempArrivalDate(e.target.value)}
                                      placeholder="e.g. 2 Days, 30 June, or Tomorrow"
                                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      autoFocus
                                    />
                                    <button
                                      id={`save-arrival-btn-${order.id}`}
                                      onClick={() => handleUpdateOrderArrivalDate(order.id, tempArrivalDate)}
                                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button
                                      id={`cancel-arrival-btn-${order.id}`}
                                      onClick={() => setEditingArrivalOrderId(null)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Write delivery date or duration freely.</span>
                                    {order.arrivalDate && (
                                      <button
                                        id={`clear-arrival-btn-${order.id}`}
                                        onClick={() => handleUpdateOrderArrivalDate(order.id, '')}
                                        className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                                      >
                                        Clear Date / हटाएँ
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1.5 pl-5.5 font-bold text-slate-800">
                                  {order.arrivalDate ? (
                                    <span className="text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100/40 text-[11px] inline-block">
                                      {order.arrivalDate}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-normal italic">Not set yet / अभी तय नहीं है</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Return Window Section */}
                            <div className="bg-amber-50/40 border border-amber-100/60 rounded-xl p-3 text-xs mt-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                  <span className="text-sm">↺</span>
                                  <span>Return Window Days / वापसी की समय सीमा (दिन):</span>
                                </div>
                                {editingReturnOrderId !== order.id && (
                                  <button
                                    id={`edit-return-btn-${order.id}`}
                                    onClick={() => {
                                      setEditingReturnOrderId(order.id);
                                      setTempReturnDays(order.returnWindowDays !== undefined && order.returnWindowDays !== null ? String(order.returnWindowDays) : '7');
                                    }}
                                    className="text-[10px] font-bold text-amber-700 hover:text-amber-900 underline decoration-dotted cursor-pointer"
                                  >
                                    {order.returnWindowDays !== undefined && order.returnWindowDays !== null ? 'Update Days / बदलें' : 'Set Days / दिन तय करें'}
                                  </button>
                                )}
                              </div>

                              {editingReturnOrderId === order.id ? (
                                <div className="mt-2 space-y-2">
                                  <div className="flex gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      value={tempReturnDays}
                                      onChange={(e) => setTempReturnDays(e.target.value)}
                                      placeholder="e.g. 7, 10, or 0 (no returns)"
                                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                      autoFocus
                                    />
                                    <button
                                      id={`save-return-btn-${order.id}`}
                                      onClick={() => handleUpdateOrderReturnWindow(order.id, tempReturnDays)}
                                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button
                                      id={`cancel-return-btn-${order.id}`}
                                      onClick={() => setEditingReturnOrderId(null)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Enter days allowed or 0 to disallow returns.</span>
                                    {order.returnWindowDays !== undefined && order.returnWindowDays !== null && (
                                      <button
                                        id={`clear-return-btn-${order.id}`}
                                        onClick={() => handleUpdateOrderReturnWindow(order.id, '')}
                                        className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                                      >
                                        Reset to Default (7 days) / हटाएँ
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1.5 pl-5.5 font-bold text-slate-800">
                                  {order.returnWindowDays === 0 ? (
                                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 text-[11px] inline-block">
                                      No returns allowed / वापसी बंद है
                                    </span>
                                  ) : order.returnWindowDays !== undefined && order.returnWindowDays !== null ? (
                                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100/40 text-[11px] inline-block">
                                      {order.returnWindowDays} Days / {order.returnWindowDays} दिन
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-block font-normal">
                                      Default (7 Days) / डिफ़ॉल्ट (7 दिन)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Interactive Status Toggle Buttons */}
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                                Toggle Order Status / स्थिति बदलें:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { label: 'Pending', color: 'amber' },
                                  { label: 'Accepted', color: 'blue' },
                                  { label: 'Shipped', color: 'purple' },
                                  { label: 'Delivered', color: 'emerald' },
                                  { label: 'Cancelled', color: 'rose' },
                                  { label: 'Returned', color: 'zinc' }
                                ].map(({ label, color }) => {
                                  const isCurrentStatus = order.status === label;
                                  return (
                                    <button
                                      key={label}
                                      type="button"
                                      id={`creator-status-toggle-${order.id}-${label.toLowerCase()}`}
                                      onClick={() => handleUpdateOrderStatus(order.id, label)}
                                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                                        isCurrentStatus
                                          ? color === 'amber' ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300' :
                                            color === 'blue' ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300' :
                                            color === 'purple' ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300' :
                                            color === 'emerald' ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300' :
                                            color === 'rose' ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300' :
                                            'bg-zinc-700 text-white shadow-md ring-2 ring-zinc-300'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
                                      }`}
                                    >
                                      {isCurrentStatus && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                      <span>{label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!showAllOrders && filteredOrders.length > 6 && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        id="creator-see-more-orders-btn"
                        onClick={() => setShowAllOrders(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>See More Orders ({filteredOrders.length - 6} remaining) / और ऑर्डर देखें</span>
                        <ChevronDown className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  )}

                  {showAllOrders && filteredOrders.length > 6 && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        id="creator-show-less-orders-btn"
                        onClick={() => setShowAllOrders(false)}
                        className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>Show Less Orders / कम दिखाएं</span>
                        <ChevronUp className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* 2. ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div
              key="creator-analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Analytics Header & Date Filter Bar */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-extrabold shrink-0">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Sales Analytics & Business Intelligence</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Live Data
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Comprehensive analysis of revenue, units sold, order fulfillment & category breakdown
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time range selector pills */}
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
                  {[
                    { id: '7days', label: 'Last 7 Days' },
                    { id: '30days', label: 'Last 30 Days' },
                    { id: 'all', label: 'All Time' }
                  ].map(period => (
                    <button
                      key={period.id}
                      type="button"
                      onClick={() => setAnalyticsTimeFilter(period.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                        analyticsTimeFilter === period.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comprehensive KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Net Sales</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-black text-slate-900">
                    ₹{totalRevenue}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Excludes returned & cancelled orders
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Orders</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-black text-slate-900">
                    {orders.length}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Avg Order Value: <strong className="text-slate-800">₹{orders.length ? Math.round(totalRevenue / orders.length) : 0}</strong>
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fulfillment Rate</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-black text-slate-900">
                    {orders.length ? Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100) : 0}%
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    <strong className="text-emerald-600">{orders.filter(o => o.status === 'Delivered').length}</strong> delivered successfully
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Return / Cancel Rate</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-black text-slate-900">
                    {orders.length ? Math.round((orders.filter(o => o.status === 'Returned' || o.status === 'Cancelled').length / orders.length) * 100) : 0}%
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    <strong className="text-rose-600">{orders.filter(o => o.status === 'Returned' || o.status === 'Cancelled').length}</strong> orders returned/cancelled
                  </p>
                </div>
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Daily Revenue & Units Trend */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>Revenue & Sales Volume Trend</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">Daily Breakdown</span>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                        <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} />
                        <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => `${val} u`} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const rev = payload.find(p => p.dataKey === 'revenue')?.value ?? 0;
                              const units = payload.find(p => p.dataKey === 'units')?.value ?? 0;
                              return (
                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-medium">
                                  <p className="font-bold border-b border-slate-800 pb-1 text-slate-400">{label}</p>
                                  <p className="text-emerald-400 flex justify-between gap-4">
                                    <span>Revenue:</span>
                                    <span className="font-bold">₹{rev}</span>
                                  </p>
                                  <p className="text-indigo-300 flex justify-between gap-4">
                                    <span>Units:</span>
                                    <span className="font-bold">{units}</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar yAxisId="right" dataKey="units" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={18} />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, stroke: '#10b981', fill: '#fff' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Order Status Breakdown Grid */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-purple-600" />
                      <span>Order Status Breakdown</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Distribution across status lifecycle</p>
                  </div>

                  <div className="space-y-3 my-auto">
                    {[
                      { label: 'Pending', count: orders.filter(o => o.status === 'Pending').length, color: 'bg-amber-500' },
                      { label: 'Accepted', count: orders.filter(o => o.status === 'Accepted').length, color: 'bg-blue-500' },
                      { label: 'Shipped', count: orders.filter(o => o.status === 'Shipped').length, color: 'bg-purple-500' },
                      { label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, color: 'bg-emerald-500' },
                      { label: 'Returned', count: orders.filter(o => o.status === 'Returned').length, color: 'bg-zinc-500' },
                      { label: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length, color: 'bg-rose-500' },
                    ].map(st => {
                      const pct = orders.length ? Math.round((st.count / orders.length) * 100) : 0;
                      return (
                        <div key={st.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${st.color}`}></span>
                              {st.label}
                            </span>
                            <span className="text-slate-900">{st.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className={`h-full ${st.color}`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Selling Products List */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <span>Top Performing Products / सर्वाधिक बिकने वाले उत्पाद</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Ranked by units sold</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {products.slice(0, 6).map((prod, idx) => {
                    const totalUnits = orders.reduce((acc, ord) => {
                      if (ord.status === 'Cancelled' || ord.status === 'Returned') return acc;
                      const itemMatch = ord.items?.find(it => it.name === prod.name || it.id === prod.id);
                      return acc + (itemMatch ? itemMatch.quantity : 0);
                    }, 0);

                    const totalRevenueProd = totalUnits * prod.price;

                    return (
                      <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                            idx === 0 ? 'bg-amber-100 text-amber-800' :
                            idx === 1 ? 'bg-slate-200 text-slate-700' :
                            idx === 2 ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-500'
                          }`}>
                            #{idx + 1}
                          </span>
                          <img
                            src={prod.images?.[0] || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                            }}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate">{prod.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              Category: <strong className="text-slate-800">{prod.category}</strong> • Price: <strong className="text-indigo-600">₹{prod.price}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900 block">{totalUnits} units sold</span>
                          <span className="text-xs font-bold text-emerald-600">₹{totalRevenueProd} total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. RETURNS & REFUNDS MANAGEMENT TAB */}
          {activeTab === 'returns' && (
            <motion.div
              key="creator-returns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Returns Header & Filter Bar */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-rose-600" />
                      <span>Return & Refund Management / रिटर्न और रिफंड</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-extrabold text-xs border border-rose-200">
                        {orders.filter(o => o.status === 'Returned').length} Returned Items
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Process customer return requests, inspect items, and handle refunds efficiently
                    </p>
                  </div>

                  <button
                    id="refresh-returns-btn"
                    onClick={fetchOrders}
                    className="text-xs px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Returns
                  </button>
                </div>

                {/* Sub-Filters & Search Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Search input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={returnSearchQuery}
                      onChange={(e) => setReturnSearchQuery(e.target.value)}
                      placeholder="Search customer name, order ID, phone..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                    {returnSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setReturnSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {[
                      { id: 'all', label: 'All Returned Orders / सभी वापसी ऑर्डर्स' },
                      { id: 'Returned', label: 'Returned Only' }
                    ].map(pill => {
                      const isActive = returnFilterStatus === pill.id;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setReturnFilterStatus(pill.id)}
                          className={`px-3.5 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Returns Summary Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Returned Orders</span>
                    <span className="font-display text-2xl font-black text-slate-900">
                      {orders.filter(o => o.status === 'Returned').length}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-700 shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Refund Value</span>
                    <span className="font-display text-2xl font-black text-rose-600">
                      ₹{orders
                        .filter(o => o.status === 'Returned')
                        .reduce((acc, o) => acc + o.totalAmount, 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Return Policy Window</span>
                    <span className="font-display text-xl font-extrabold text-slate-900">
                      7 Days Default / 7 दिन
                    </span>
                  </div>
                </div>
              </div>

              {/* List of Returned Orders */}
              {(() => {
                const returnOrdersList = orders.filter(o => {
                  if (o.status !== 'Returned') {
                    return false;
                  }
                  if (returnFilterStatus !== 'all' && o.status !== returnFilterStatus) {
                    return false;
                  }
                  if (returnSearchQuery.trim()) {
                    const q = returnSearchQuery.toLowerCase();
                    const matchId = o.id.toLowerCase().includes(q);
                    const matchName = o.customerDetails?.name?.toLowerCase().includes(q) ?? false;
                    const matchMobile = o.customerDetails?.mobile?.includes(q) ?? false;
                    return matchId || matchName || matchMobile;
                  }
                  return true;
                });

                if (returnOrdersList.length === 0) {
                  return (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3 shadow-xs">
                      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                        <RotateCcw className="w-8 h-8" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-lg">No Returned Orders Found / कोई वापसी ऑर्डर नहीं मिला</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        When customer return requests are marked as Returned, they will automatically appear here with complete refund and customer details.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {returnOrdersList.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${
                              order.status === 'Returned' ? 'bg-zinc-800 text-white' : 'bg-rose-600 text-white'
                            }`}>
                              {order.status}
                            </span>
                            <span className="font-mono font-extrabold text-slate-900 text-sm">
                              Order #{order.id}
                            </span>
                            <span className="text-xs text-slate-400">
                              Placed: {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold">Total Amount:</span>
                            <span className="font-black text-slate-900 text-base">₹{order.totalAmount}</span>
                          </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Customer Info</span>
                            <p className="font-extrabold text-slate-900 text-sm">{order.customerDetails?.name || 'N/A'}</p>
                            <p className="font-bold text-indigo-600 mt-0.5 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              <a href={`tel:${order.customerDetails?.mobile}`} className="hover:underline">{order.customerDetails?.mobile || 'N/A'}</a>
                            </p>
                            {order.customerDetails?.mobile && (
                              <a
                                href={`https://wa.me/91${order.customerDetails.mobile.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(order.customerDetails.name || '')},%20regarding%20your%20sasta%20store%20return%20for%20order%20%23${order.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white font-extrabold text-[10px] rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                <MessageSquare className="w-3 h-3" /> WhatsApp Customer
                              </a>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Return Delivery Address</span>
                            <p className="font-bold text-slate-800">{order.customerDetails?.address || 'N/A'}</p>
                            <p className="text-slate-600 mt-0.5">
                              {order.customerDetails?.cityVillageTown} {order.customerDetails?.state} - <strong className="font-mono text-slate-900">{order.customerDetails?.pincode}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Returned Items */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Items in Return</span>
                          <div className="space-y-2">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                <img
                                  src={it.image}
                                  alt={it.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                                  }}
                                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-extrabold text-xs text-slate-900 truncate">{it.name}</h5>
                                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                    Qty: <strong className="text-slate-800">{it.quantity}</strong> • Size: <strong className="text-slate-800">{it.selectedSize || 'Free Size'}</strong> • Price: <strong className="text-slate-800">₹{it.priceAtPurchase}</strong>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Return Notes Input */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                            Return Reason / Creator Note (रीज़न / नोट दर्ज करें):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={returnNotes[order.id] || ''}
                              onChange={(e) => setReturnNotes({ ...returnNotes, [order.id]: e.target.value })}
                              placeholder="e.g. Size mismatch, Customer refunded on GooglePay..."
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveReturnNote(order.id, returnNotes[order.id] || '')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>

                        {/* Order Status Manager */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-extrabold text-slate-600">Change Status / स्थिति बदलें:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, st)}
                                className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                                  order.status === st
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* 4. PRODUCTS TAB */}
          {activeTab === 'products' && (
            <motion.div
              key="creator-products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold text-slate-800">My Listed Products ({products.length})</h2>
                <button
                  id="creator-go-add-btn"
                  onClick={startNewProductForm}
                  className="text-xs px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> List New Product
                </button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" id="creator-products-skeleton">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <CreatorProductCardSkeleton key={n} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 space-y-4 shadow-xs max-w-xl mx-auto">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Package className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">No products listed</h3>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Publish your first product to display it directly inside Sasta Store!
                    </p>
                  </div>
                  <button
                    id="creator-empty-add-btn"
                    onClick={startNewProductForm}
                    className="inline-flex items-center text-xs font-bold px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Add Product Now <Plus className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {products.map(product => {
                    const discount = product.originalPrice 
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                      : 0;

                    return (
                      <div
                        id={`creator-product-card-${product.id}`}
                        key={product.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200/50 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
                      >
                        {/* Image Preview with Carousel / Slider */}
                        <div className="relative aspect-square bg-slate-50 dark:bg-slate-800/80 overflow-hidden">
                          <ProductImageSlider
                            images={product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"]}
                            alt={product.name}
                            showDots={true}
                            showBadge={true}
                            showArrows={true}
                          />
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                            <button
                              id={`creator-edit-product-btn-${product.id}`}
                                onClick={() => {
                                  setEditingProduct(product);
                                  setName(product.name);
                                  setDescription(product.description || '');
                                  setPrice(String(product.price));
                                  setOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
                                  setCategory(product.category);
                                  setInStock(product.inStock !== false);
                                  setImageUrlInputs(product.images && product.images.length > 0 ? product.images : ['']);
                                  setSelectedSizes(product.sizes || []);
                                  
                                  const editingPrices: Record<string, string> = {};
                                  if (product.sizePrices) {
                                    Object.entries(product.sizePrices).forEach(([sz, pr]) => {
                                      editingPrices[sz] = String(pr);
                                    });
                                  }
                                  setSizePrices(editingPrices);
                                  
                                  setActiveTab('add');
                                }}
                              className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white text-indigo-600 dark:text-indigo-400 rounded-xl shadow-xs transition-all cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              id={`creator-delete-product-btn-${product.id}`}
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white dark:hover:text-white text-rose-600 dark:text-rose-400 rounded-xl shadow-xs transition-all cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {discount > 0 && (
                            <span className="absolute bottom-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-lg">
                              {discount}% OFF
                            </span>
                          )}
                          {!product.inStock && (
                            <span className="absolute bottom-2.5 right-2.5 bg-slate-800/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Title & Category Details */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              {product.category}
                            </span>
                            <h4 className="font-bold text-slate-800 dark:text-white text-xs md:text-sm line-clamp-2 leading-snug">
                              {product.name}
                            </h4>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-baseline justify-between">
                            <div className="flex flex-col">
                              <span className="text-slate-800 dark:text-white font-extrabold text-sm md:text-base font-display">
                                ₹{product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="text-slate-400 dark:text-slate-500 line-through text-[10px] md:text-xs">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stock Quick Toggle */}
                        <div className="px-4 pb-3.5 pt-2.5 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Stock / स्थिति
                          </span>
                          <button
                            id={`creator-toggle-stock-btn-${product.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStock(product.id, product.inStock !== false);
                            }}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                              product.inStock !== false
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${product.inStock !== false ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                            {product.inStock !== false ? "In Stock / उपलब्ध" : "Sold Out / अनुपलब्ध"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* 3. ADD PRODUCT TAB */}
          {activeTab === 'add' && (
            <motion.div
              key="creator-add-product"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {editingProduct ? (
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Edit Product Info / उत्पाद संपादित करें</h2>
                    <p className="text-indigo-600 font-bold text-xs mt-0.5">Editing: {editingProduct.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={startNewProductForm}
                    className="text-xs px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel Edit / रद्द करें
                  </button>
                </div>
              ) : (
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-xl font-bold text-slate-800">Publish New Product Listing</h2>
                  <p className="text-slate-400 text-xs mt-0.5">List products directly for Sasta Store shoppers to view and purchase instantly.</p>
                </div>
              )}

              {/* Two Column Form on Desktop, standard grid on mobile */}
              <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs">
                {/* Left Column: Basic text info */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="product-name" className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                      Product Name / उत्पाद का नाम
                    </label>
                    <input
                      id="product-name"
                      type="text"
                      required
                      placeholder="e.g. Fresh Organic Potatoes (ताजा आलू)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label htmlFor="product-desc" className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                      Product Description / विवरण
                    </label>
                    <textarea
                      id="product-desc"
                      placeholder="Enter detailed description (e.g., benefits, weight, dimensions, packaging details)"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs resize-none"
                    />
                  </div>

                  {/* Pricing Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="product-price" className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                        Sale Price / बिक्री मूल्य (₹)
                      </label>
                      <input
                        id="product-price"
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 25"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label htmlFor="product-orig-price" className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                        Original MRP / मूल मूल्य (₹)
                      </label>
                      <input
                        id="product-orig-price"
                        type="number"
                        min="1"
                        placeholder="e.g. 50"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="product-category" className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                      Category Selection / श्रेणी
                    </label>
                    <select
                      id="product-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold cursor-pointer"
                    >
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                      Available Sizes / उपलब्ध आकार (Optional)
                    </label>
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3">
                      <p className="text-[10px] text-slate-400 font-medium">
                        Select one or more sizes or type any custom text / खरीदारों के लिए आकार के विकल्प चुनें या टाइप करें:
                      </p>
                      
                      {/* S, M, L, XL, XXL presets */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Standard Sizes / मानक आकार:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {['S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                            const isSelected = selectedSizes.includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSizes(selectedSizes.filter(s => s !== sz));
                                  } else {
                                    setSelectedSizes([...selectedSizes, sz]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Kids / Age Group Presets (visible if Fashion or Kids category is selected, or as a helpful addition) */}
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Kids Age-Group Sizes / बच्चों के आकार (उम्र):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {['2-3 Years', '4-5 Years', '6-7 Years', '8-9 Years', '10-11 Years', '12-13 Years', '14-15 Years'].map(sz => {
                            const isSelected = selectedSizes.includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSizes(selectedSizes.filter(s => s !== sz));
                                  } else {
                                    setSelectedSizes([...selectedSizes, sz]);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-3xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Size Addition */}
                      <div className="space-y-1 pt-1.5 border-t border-slate-200/50">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Type Custom Size (e.g. 10-12 years, 32, Free Size) / अपना मनपसंद आकार लिखें:
                        </p>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            id="custom-size-input"
                            placeholder="Type custom size (e.g. 12-13 years, 10-12 years)..."
                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-700 flex-1 min-w-0"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const target = e.currentTarget;
                                const val = target.value.trim();
                                if (val && !selectedSizes.includes(val)) {
                                  setSelectedSizes([...selectedSizes, val]);
                                  target.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('custom-size-input') as HTMLInputElement | null;
                              const val = input?.value.trim();
                              if (val && !selectedSizes.includes(val)) {
                                setSelectedSizes([...selectedSizes, val]);
                                if (input) input.value = '';
                              }
                            }}
                            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl transition-all cursor-pointer shrink-0"
                          >
                            + Add Size
                          </button>
                        </div>
                      </div>

                      {/* List of currently selected sizes with price override inputs */}
                      {selectedSizes.length > 0 ? (
                        <div className="space-y-2.5 pt-2 border-t border-slate-200/50">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            Set Different Money / Price for each size (Optional) / विभिन्न आकारों के लिए अलग-अलग मूल्य दर्ज करें (वैकल्पिक):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedSizes.map(sz => {
                              const priceVal = sizePrices[sz] || '';
                              return (
                                <div key={sz} className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-slate-200 shadow-3xs hover:border-indigo-100 transition-colors">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-md border border-indigo-100 truncate">
                                      {sz}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[10px] text-slate-400 font-bold">₹</span>
                                    <input
                                      type="number"
                                      placeholder={`${price ? `Base: ${price}` : 'Price / मूल्य'}`}
                                      value={priceVal}
                                      onChange={(e) => {
                                        setSizePrices({
                                          ...sizePrices,
                                          [sz]: e.target.value
                                        });
                                      }}
                                      className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSizes(selectedSizes.filter(s => s !== sz));
                                        const updatedPrices = { ...sizePrices };
                                        delete updatedPrices[sz];
                                        setSizePrices(updatedPrices);
                                      }}
                                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition-all font-bold text-sm leading-none"
                                      title="Remove Size"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSizes([]);
                                setSizePrices({});
                              }}
                              className="text-[10px] text-slate-400 hover:text-rose-500 hover:underline font-semibold"
                            >
                              Clear All Sizes / सभी हटाएं
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic text-center pt-1 border-t border-slate-200/50">
                          No sizes selected (customers will purchase without a size option)
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                      Availability Status / उपलब्धता स्थिति
                    </label>
                    <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">
                          {inStock ? "In Stock / उपलब्ध है" : "Out of Stock / स्टॉक में नहीं है"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          {inStock ? "Customers can purchase this item" : "Hidden from active store listings"}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Right Column: Unified product gallery with image reordering */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Product Gallery / उत्पाद की तस्वीरें
                      </label>
                      <button
                        id="add-image-url-btn"
                        type="button"
                        onClick={addUrlInputField}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Paste Web Link
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      First image is cover photo. You can drag-upload or paste URLs, and reorder them below / पहली फोटो मुख्य फोटो होगी।
                    </p>

                    {/* Unified Drag-Upload / Click Selection area */}
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-3 pb-3 px-4 text-center">
                          <Upload className="w-7 h-7 text-indigo-500 mb-1.5 animate-bounce-subtle" />
                          <p className="text-xs text-slate-600 font-bold">Upload Photos / फ़ोटो अपलोड करें</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Click to choose image files (JPG, PNG, WEBP)</p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageFileChange}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Configured Images Grid List */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Manage & Reorder Images ({imageUrlInputs.filter(url => url.trim() !== "").length} Added)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="creator-image-grid">
                      {imageUrlInputs.map((url, idx) => {
                        const isBase64 = url.startsWith("data:");
                        const hasImage = url.trim() !== "";
                        return (
                          <div
                            key={idx}
                            className={`relative border rounded-2xl p-2.5 flex flex-col gap-2 transition-all bg-white shadow-3xs hover:shadow-2xs ${
                              idx === 0 ? "border-indigo-200 ring-2 ring-indigo-500/5" : "border-slate-200"
                            }`}
                          >
                            {/* Visual Thumbnail Preview Container */}
                            <div className="relative w-full aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center group-image-preview">
                              {hasImage ? (
                                <img
                                  src={url}
                                  alt=""
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                                  }}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="text-[10px] text-slate-400 font-medium flex flex-col items-center gap-1.5 p-3 text-center">
                                  <ImageIcon className="w-5 h-5 text-slate-300" />
                                  Paste link below or upload file
                                </div>
                              )}

                              {/* Overlay Badge with Index Position */}
                              <span className={`absolute bottom-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm ${
                                idx === 0 
                                  ? "bg-indigo-600 text-white" 
                                  : "bg-slate-800/80 text-white backdrop-blur-xs"
                              }`}>
                                #{idx + 1} {idx === 0 ? "★ MAIN COVER" : ""}
                              </span>

                              {/* Remove image button */}
                              <button
                                type="button"
                                onClick={() => removeUrlInputField(idx)}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500/95 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                                title="Delete Image"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Source URL Field / Label */}
                            <div className="text-left w-full">
                              {isBase64 ? (
                                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                  ✓ Uploaded Photo / अपलोड की गई फोटो
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <input
                                    id={`image-url-input-${idx}`}
                                    type="url"
                                    placeholder="Paste Image URL / इमेज लिंक डालें..."
                                    value={url}
                                    onChange={(e) => handleUrlInputChange(idx, e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-700"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Reorder/Move Action buttons */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-auto">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                Order / आगे-पीछे सेट करें:
                              </span>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveImage(idx, "left")}
                                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 disabled:opacity-30 border border-slate-200 hover:border-indigo-200 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 disabled:hover:border-slate-200 rounded-lg shadow-3xs transition-all cursor-pointer disabled:cursor-not-allowed text-[10px] font-bold flex items-center gap-1"
                                  title="Move Left (Aage)"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" /> Left
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === imageUrlInputs.length - 1}
                                  onClick={() => moveImage(idx, "right")}
                                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 disabled:opacity-30 border border-slate-200 hover:border-indigo-200 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 disabled:hover:border-slate-200 rounded-lg shadow-3xs transition-all cursor-pointer disabled:cursor-not-allowed text-[10px] font-bold flex items-center gap-1"
                                  title="Move Right (Piche)"
                                >
                                  Right <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Dynamic Repeatable Image Input Add Button */}
                    <button
                      id="add-another-image-url-btn"
                      type="button"
                      onClick={addUrlInputField}
                      className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs mt-2"
                    >
                      <Plus className="w-4 h-4" /> Add Another Image URL / एक और फोटो लिंक जोड़ें
                    </button>
                  </div>

                  <hr className="border-slate-100 my-4" />

                  {/* Submit product button */}
                  <button
                    id="add-product-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer text-xs md:text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        {editingProduct ? 'Updating Product...' : 'Saving Product...'}
                      </>
                    ) : (
                      <>
                        {editingProduct ? 'Save Changes / बदलाव सहेजें' : 'Save and Publish Listing'} <Plus className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-black tracking-tight">🔑 Password Recovery & User Lookup</h2>
                <p className="text-slate-300 text-xs mt-1">
                  Search registered customers by name, mobile number, or username to securely retrieve their passwords if they forget them.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Username, Real Name, or Mobile Number..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 text-sm"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                {userSearchQuery && (
                  <button
                    onClick={() => setUserSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {loadingUsers ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-24 bg-slate-200 rounded-lg"></div>
                        <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                        <div className="h-2.5 w-24 bg-slate-200 rounded"></div>
                        <div className="h-5 w-32 bg-slate-200 rounded"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 flex-1 bg-slate-200 rounded-lg"></div>
                        <div className="h-8 flex-1 bg-slate-200 rounded-lg"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const filtered = creatorUsers.filter(u => {
                      const query = userSearchQuery.toLowerCase().trim();
                      if (!query) return true;
                      
                      const matchUsername = u.username.toLowerCase().includes(query);
                      const matchNames = u.names.some(name => name.toLowerCase().includes(query));
                      const matchMobiles = u.mobiles.some(mob => mob.toLowerCase().includes(query));
                      
                      return matchUsername || matchNames || matchMobiles;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-12 text-center text-slate-500">
                          <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="font-bold text-slate-700">No users found</p>
                          <p className="text-xs text-slate-400 mt-1">Try searching with a different name, mobile, or username.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {filtered.map(user => (
                          <div key={user.username} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
                                  @{user.username}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                  {user.ordersCount} {user.ordersCount === 1 ? 'order' : 'orders'}
                                </span>
                              </div>

                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 flex items-center justify-between">
                                <div>
                                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Saved Password</div>
                                  <div className="font-mono text-base font-bold text-indigo-900 tracking-wider select-all">
                                    {user.password}
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(user.password);
                                      showToast?.(`Password "@${user.username}" copied to clipboard!`, "info");
                                    }}
                                    className="text-[10px] font-bold px-2.5 py-1.5 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg border border-indigo-100 hover:border-indigo-600 transition-colors cursor-pointer"
                                  >
                                    Copy
                                  </button>
                                  <button
                                    onClick={() => {
                                      setNewNotifTargetType('user');
                                      setNewNotifTargetUser(user.username);
                                      setActiveTab('notifications');
                                      showToast?.(`Selected @${user.username} for notification!`, "info");
                                    }}
                                    className="text-[10px] font-bold px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg border border-indigo-100 hover:border-indigo-600 transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    🔔 Notify
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Customer Name(s):</span>
                                  {user.names.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {user.names.map((n, i) => (
                                        <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                          {n}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">No checkout orders yet</span>
                                  )}
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mobile Number(s):</span>
                                  {user.mobiles.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {user.mobiles.map((mob, i) => (
                                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold">
                                          📞 {mob}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">No checkout orders yet</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                              <span>Registered Account</span>
                              <span className="font-medium">Direct Recovery Support</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Header Box */}
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <span>🔔</span> Notifications Center / सूचना केंद्र
                  </h2>
                  <p className="text-slate-200 text-xs mt-1">
                    Send important announcements, sale notices, or custom private messages directly to Sasta Store customers.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-5">
                {/* Send Notification Form */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4 h-fit">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <span className="text-lg">✉️</span> Send New Notification / नया संदेश भेजें
                  </h3>

                  <form onSubmit={handleSendNotification} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Target Audience / लक्षित ग्राहक
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewNotifTargetType('all');
                            setNewNotifTargetUser('');
                          }}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            newNotifTargetType === 'all'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          All Customers / सभी को
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNotifTargetType('user')}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            newNotifTargetType === 'user'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Specific User / किसी एक को
                        </button>
                      </div>
                    </div>

                    {newNotifTargetType === 'user' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1.5"
                      >
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Target Username / यूजरनेम
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g. kamlesh, ram..."
                            value={newNotifTargetUser}
                            onChange={(e) => setNewNotifTargetUser(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 italic">
                          Enter the registered username of the customer (lowercase).
                        </p>
                      </motion.div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Notification Title / शीर्षक (हिंदी/English)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Order delayed / आर्डर में देरी"
                        value={newNotifTitle}
                        onChange={(e) => setNewNotifTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Message Content / संदेश
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Type notification message here... / यहाँ अपना संदेश लिखें..."
                        value={newNotifMessage}
                        onChange={(e) => setNewNotifMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Notification / सूचना भेजें
                    </button>
                  </form>
                </div>

                {/* Notification Logs */}
                <div className="md:col-span-3 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">📜</span> Notification History / भेजी गई सूचनाएं
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {notifications.length} Sent
                    </span>
                  </h3>

                  {loadingNotifications ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-xs space-y-3 animate-pulse">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="h-5 w-20 bg-slate-200 rounded"></div>
                              <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            </div>
                            <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                          </div>
                          <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                          <div className="h-10 w-full bg-slate-50 rounded-lg border border-slate-100/50"></div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-slate-500">
                      <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="font-bold text-slate-700">No Notifications Sent Yet</p>
                      <p className="text-xs text-slate-400 mt-1">Your sent notifications history will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-xs relative hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                {notif.targetType === 'all' ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-bold uppercase tracking-wider">
                                    All Users / सभी को
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[9px] font-bold font-mono uppercase tracking-wider">
                                    @{notif.targetUser}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">
                                  {new Date(notif.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-slate-800 text-sm">{notif.title}</h4>
                            </div>

                            <button
                              id={`delete-notif-${notif.id}`}
                              onClick={() => handleDeleteNotification(notif.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-medium bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                            {notif.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}





        </AnimatePresence>

      </main>

      {/* CREATOR BOTTOM NAVIGATION (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-xl flex items-center justify-around h-16 px-2 rounded-t-2xl">
        <button
          id="creator-nav-orders-btn"
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
            activeTab === 'orders' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Orders</span>
        </button>

        <button
          id="creator-nav-analytics-btn"
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Analytics</span>
        </button>

        <button
          id="creator-nav-returns-btn"
          onClick={() => setActiveTab('returns')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer relative ${
            activeTab === 'returns' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Returns</span>
          {orders.filter(o => o.status === 'Returned' || o.status === 'Cancelled').length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
          )}
        </button>

        <button
          id="creator-nav-products-btn"
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
            activeTab === 'products' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Listings</span>
        </button>

        <button
          id="creator-nav-add-btn"
          onClick={startNewProductForm}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
            activeTab === 'add' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Add</span>
        </button>

        <button
          id="creator-nav-users-btn"
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
            activeTab === 'users' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Users</span>
        </button>

        <button
          id="creator-nav-notifications-btn"
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
            activeTab === 'notifications' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Notifs</span>
        </button>
      </nav>

      {/* DETAILED EXPANDED ORDER MODAL */}
      <AnimatePresence>
        {selectedOrderModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderModal(null)}
              className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden border border-indigo-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/10 shrink-0">
                    <Package className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-mono font-extrabold text-sm sm:text-base text-white">
                        Order #{selectedOrderModal.id}
                      </h3>
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        selectedOrderModal.status === 'Pending' ? 'bg-amber-400 text-slate-950' :
                        selectedOrderModal.status === 'Accepted' ? 'bg-blue-400 text-slate-950' :
                        selectedOrderModal.status === 'Shipped' ? 'bg-purple-300 text-slate-950' :
                        selectedOrderModal.status === 'Delivered' ? 'bg-emerald-400 text-slate-950' :
                        selectedOrderModal.status === 'Returned' ? 'bg-zinc-300 text-slate-950' :
                        'bg-rose-400 text-slate-950'
                      }`}>
                        {selectedOrderModal.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-200 mt-0.5">
                      Placed on {new Date(selectedOrderModal.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="close-order-modal-top-btn"
                  onClick={() => setSelectedOrderModal(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-6">
                {/* Total Value & Quick Contact Banner */}
                <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">Total Amount Paid</span>
                    <span className="text-2xl font-black text-slate-900">₹{selectedOrderModal.totalAmount}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedOrderModal.customerDetails?.mobile && (
                      <>
                        <a
                          href={`tel:${selectedOrderModal.customerDetails.mobile}`}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Customer</span>
                        </a>
                        <a
                          href={`https://wa.me/91${selectedOrderModal.customerDetails.mobile.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Full Customer Address & Contact Details Card */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>Customer Contact & Complete Delivery Address</span>
                    </h4>
                    {selectedOrderModal.username && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-mono font-extrabold">
                        @{selectedOrderModal.username}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Full Name</span>
                      <p className="font-extrabold text-slate-900 text-sm">
                        {selectedOrderModal.customerDetails?.name || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Mobile Number</span>
                      <p className="font-extrabold text-indigo-600 text-sm flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${selectedOrderModal.customerDetails?.mobile}`} className="hover:underline">
                          {selectedOrderModal.customerDetails?.mobile || 'N/A'}
                        </a>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pincode</span>
                      <p className="font-mono font-black text-slate-900 text-sm flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        {selectedOrderModal.customerDetails?.pincode || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">City / Town & State</span>
                      <p className="font-extrabold text-slate-900 text-sm">
                        {selectedOrderModal.customerDetails?.cityVillageTown || 'N/A'}
                        {selectedOrderModal.customerDetails?.state ? `, ${selectedOrderModal.customerDetails.state}` : ''}
                      </p>
                    </div>

                    {selectedOrderModal.customerDetails?.houseNoBuilding && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">House No. / Building Name</span>
                        <p className="font-bold text-slate-800 text-xs">
                          {selectedOrderModal.customerDetails.houseNoBuilding}
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1 sm:col-span-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Road Name / Area / Colony</span>
                      <p className="font-bold text-slate-800 text-xs">
                        {selectedOrderModal.customerDetails?.address || 'N/A'}
                      </p>
                    </div>

                    {selectedOrderModal.customerDetails?.villageName && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Village Name</span>
                        <p className="font-bold text-slate-800 text-xs">
                          {selectedOrderModal.customerDetails.villageName}
                        </p>
                      </div>
                    )}

                    {selectedOrderModal.customerDetails?.landmark && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Landmark</span>
                        <p className="font-bold text-slate-800 text-xs">
                          {selectedOrderModal.customerDetails.landmark}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Ordered */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                    Items Ordered ({selectedOrderModal.items?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrderModal.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";
                          }}
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-extrabold text-sm text-slate-900 truncate">{item.name}</h5>
                          <div className="text-xs text-slate-600 font-medium flex items-center gap-2 mt-1 flex-wrap">
                            <span>Qty: <strong className="text-slate-900">{item.quantity}</strong></span>
                            <span>•</span>
                            <span>Price: <strong className="text-slate-900">₹{item.priceAtPurchase}</strong></span>
                            {item.selectedSize && (
                              <>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold rounded-md text-[11px]">
                                  Size: {item.selectedSize}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-semibold">Subtotal</span>
                          <span className="font-black text-sm text-slate-900">₹{item.quantity * item.priceAtPurchase}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Toggle Bar in Modal */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-extrabold text-slate-700 block">
                    Update Order Status / स्थिति बदलें:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Pending', color: 'amber' },
                      { label: 'Accepted', color: 'blue' },
                      { label: 'Shipped', color: 'purple' },
                      { label: 'Delivered', color: 'emerald' },
                      { label: 'Cancelled', color: 'rose' },
                      { label: 'Returned', color: 'zinc' }
                    ].map(({ label, color }) => {
                      const isCurrentStatus = selectedOrderModal.status === label;
                      return (
                        <button
                          key={label}
                          type="button"
                          id={`modal-status-toggle-${selectedOrderModal.id}-${label.toLowerCase()}`}
                          onClick={() => handleUpdateOrderStatus(selectedOrderModal.id, label)}
                          className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                            isCurrentStatus
                              ? color === 'amber' ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300' :
                                color === 'blue' ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300' :
                                color === 'purple' ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300' :
                                color === 'emerald' ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300' :
                                color === 'rose' ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300' :
                                'bg-zinc-700 text-white shadow-md ring-2 ring-zinc-300'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {isCurrentStatus && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 shrink-0 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-semibold font-mono">ID: {selectedOrderModal.id}</p>
                <button
                  type="button"
                  id="close-order-modal-bottom-btn"
                  onClick={() => setSelectedOrderModal(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Close / बंद करें
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
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
                Cancel / निरस्त करें
              </button>
              <button
                id="confirm-modal-action-btn"
                onClick={confirmAction.onConfirm}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-md shadow-indigo-600/15"
              >
                {confirmAction.actionLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
