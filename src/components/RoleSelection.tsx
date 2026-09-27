import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ShieldCheck, UserCheck, Eye, EyeOff, Store, ArrowRight, ArrowLeft, User, Lock, MessageSquare, Smartphone, CheckCircle2, Send, MessageCircle, Sun, Moon, Camera, Download, Copy, Check, Sparkles, X } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole, username?: string, rememberMe?: boolean) => void;
  isDark?: boolean;
  toggleTheme?: () => void;
}

type StepType = 'select' | 'creator-login' | 'user-enter-username' | 'user-choose-otp-channel' | 'user-enter-otp' | 'user-set-password' | 'user-enter-password';

export default function RoleSelection({ onSelectRole, isDark, toggleTheme }: RoleSelectionProps) {
  const [step, setStep] = useState<StepType>('user-enter-username');
  
  // Creator login state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Secret 3-tap detection for Creator Access
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretPasscode, setSecretPasscode] = useState('');
  const [secretError, setSecretError] = useState('');

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 1500) {
      const newClicks = logoClicks + 1;
      setLogoClicks(newClicks);
      if (newClicks >= 3) {
        setLogoClicks(0);
        setShowSecretModal(true);
        setSecretPasscode('');
        setSecretError('');
      }
    } else {
      setLogoClicks(1);
    }
    setLastClickTime(now);
  };

  const handleSecretPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretPasscode === 'ombro12') {
      setShowSecretModal(false);
      setSecretPasscode('');
      setSecretError('');
      if (rememberMe) {
        localStorage.setItem('sasta_store_saved_creator_passcode', secretPasscode);
      }
      onSelectRole('creator', undefined, rememberMe);
    } else {
      setSecretError('Incorrect secret passcode! / गलत सीक्रेट पासकोड!');
      setSecretPasscode('');
    }
  };

  // Customer login state
  const [customerUsername, setCustomerUsername] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // OTP Verification States
  const [otpChannel, setOtpChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [simulatedNotification, setSimulatedNotification] = useState<{ message: string; visible: boolean; channel: 'SMS' | 'WhatsApp' } | null>(null);

  // Remember me & Screenshot Modal state
  const [rememberMe, setRememberMe] = useState(true);
  // Screenshot modal & newly created user state
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [pendingSuccessUsername, setPendingSuccessUsername] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCloseScreenshotModal = () => {
    setShowScreenshotModal(false);
    if (pendingSuccessUsername) {
      onSelectRole('user', pendingSuccessUsername);
      setPendingSuccessUsername(null);
    }
  };

  const handleCopyCredentials = () => {
    const text = `SastaStore Login Credentials\nMobile / User ID: +91 ${customerUsername}\nPassword: ${customerPassword}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const downloadCredentialCardImage = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 650;
      canvas.height = 380;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 650, 380);
      grad.addColorStop(0, '#065f46'); // emerald-800
      grad.addColorStop(0.5, '#047857'); // emerald-700
      grad.addColorStop(1, '#0f172a'); // slate-900
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 650, 380);

      // Card Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('sasta store .in', 40, 55);

      ctx.fillStyle = '#34d399'; // emerald-400
      ctx.font = 'extrabold 12px sans-serif';
      ctx.fillText('OFFICIAL USER LOGIN CREDENTIALS CARD', 40, 80);

      // Divider line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 100);
      ctx.lineTo(610, 100);
      ctx.stroke();

      // Mobile No
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('MOBILE NUMBER / USER ID', 40, 140);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`+91 ${customerUsername || 'XXXXXXXXXX'}`, 40, 175);

      // Password
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('YOUR PASSWORD', 40, 225);

      ctx.fillStyle = '#fde047'; // yellow-300
      ctx.font = 'bold 24px monospace';
      ctx.fillText(customerPassword || '••••••••', 40, 260);

      // Footer
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText('Take a screenshot or save this image to remember your login details.', 40, 310);

      ctx.fillStyle = '#34d399';
      ctx.fillText('✓ Verified Customer Account • SastaStore.in', 40, 335);

      // Trigger Download
      const link = document.createElement('a');
      link.download = `SastaStore_ID_Password_${customerUsername || 'User'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  // Load saved credentials on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('sasta_store_saved_username');
    const savedCreatorPass = localStorage.getItem('sasta_store_saved_creator_passcode');
    const savedRemember = localStorage.getItem('sasta_store_remember_me');

    if (savedUser) setCustomerUsername(savedUser);
    if (savedCreatorPass) setPassword(savedCreatorPass);
    if (savedRemember !== null) {
      setRememberMe(savedRemember === 'true');
    }
  }, []);

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ombro12') {
      setError('');
      if (rememberMe) {
        localStorage.setItem('sasta_store_saved_creator_passcode', password);
        localStorage.setItem('sasta_store_remember_me', 'true');
      } else {
        localStorage.removeItem('sasta_store_saved_creator_passcode');
      }
      onSelectRole('creator');
    } else {
      setError('Incorrect Password! Please enter the correct creator passcode.');
      setPassword('');
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customerUsername.trim();
    // Validate 10-digit Indian Mobile Number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(trimmed)) {
      setError('Please enter a valid 10-digit mobile number / कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    setCheckingUser(true);
    setError('');

    try {
      // Check if user is a normal new user or an existing one
      const checkRes = await fetch('/api/users/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed })
      });

      if (!checkRes.ok) {
        throw new Error('Verification check failed');
      }

      const checkData = await checkRes.json();

      if (checkData.exists) {
        // Existing user - prompt them to enter their password
        setStep('user-enter-password');
        setCustomerPassword('');
      } else {
        // Normal New User - OTP Verification required!
        setStep('user-choose-otp-channel');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setCheckingUser(false);
    }
  };

  const handleSendOtp = async () => {
    const trimmed = customerUsername.trim();
    setIsSendingOtp(true);
    setError('');

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed, channel: otpChannel })
      });

      const data = await res.json();
      if (res.ok) {
        setSimulatedOtp(data.otp);
        setStep('user-enter-otp');
        setEnteredOtp('');
        
        // Show realistic notification popup in UI representing physical phone receiving SMS/WhatsApp!
        setSimulatedNotification({
          channel: otpChannel === 'sms' ? 'SMS' : 'WhatsApp',
          message: `SastaStore verification OTP: ${data.otp}. Do not share this code.`,
          visible: true
        });

        // Hide notification automatically after 12 seconds
        setTimeout(() => {
          setSimulatedNotification(prev => prev ? { ...prev, visible: false } : null);
        }, 12000);
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.length !== 6) {
      setError('Please enter the 6-digit OTP / कृपया 6 अंकों का ओटीपी दर्ज करें।');
      return;
    }

    setIsVerifyingOtp(true);
    setError('');

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: customerUsername.trim(), otp: enteredOtp })
      });

      const data = await res.json();
      if (res.ok) {
        // Clean up simulated notification
        setSimulatedNotification(null);
        
        // Move to the step where they set their secure password
        setStep('user-set-password');
        setCustomerPassword('');
      } else {
        setError(data.error || 'Invalid OTP! Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPass = customerPassword.trim();
    if (trimmedPass.length < 4) {
      setError('Password must be at least 4 characters long / पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: customerUsername.trim(), password: trimmedPass })
      });

      const data = await res.json();
      if (res.ok) {
        if (rememberMe) {
          localStorage.setItem('sasta_store_saved_username', customerUsername.trim());
          localStorage.setItem('sasta_store_remember_me', 'true');
        } else {
          localStorage.removeItem('sasta_store_saved_username');
          localStorage.setItem('sasta_store_remember_me', 'false');
        }
        setPendingSuccessUsername(data.username);
        setShowScreenshotModal(true);
      } else {
        setError(data.error || 'Failed to complete registration. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please check your network and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLoginWithPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPass = customerPassword.trim();
    if (!trimmedPass) {
      setError('Please enter your password / कृपया अपना पासवर्ड दर्ज करें।');
      return;
    }

    setIsLoggingIn(true);
    setError('');

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: customerUsername.trim(), password: trimmedPass })
      });

      const data = await res.json();
      if (res.ok) {
        if (rememberMe) {
          localStorage.setItem('sasta_store_saved_username', customerUsername.trim());
          localStorage.setItem('sasta_store_remember_me', 'true');
        } else {
          localStorage.removeItem('sasta_store_saved_username');
          localStorage.setItem('sasta_store_remember_me', 'false');
        }
        onSelectRole('user', data.username);
      } else {
        setError(data.error || 'Incorrect password! Please try again. / गलत पासवर्ड! कृपया दोबारा प्रयास करें।');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your network and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div id="role-selection-screen" className="flex flex-col items-center justify-center min-h-[90vh] p-4 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 p-6 md:p-8 relative transition-colors duration-300">
        
        {/* Persistent Dark Mode Toggle */}
        {toggleTheme && (
          <button
            id="role-selection-theme-toggle"
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 fill-indigo-50" />
            )}
          </button>
        )}

        {/* Brand Header with Secret 3-Tap Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            onClick={handleLogoClick}
            className="w-20 h-20 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 cursor-pointer select-none active:scale-95 transition-transform group"
            title="Sasta Store (Tap 3 times for secret option)"
          >
            <Store className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
          </motion.div>
          <h1 
            onClick={handleLogoClick}
            className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white cursor-pointer select-none"
          >
            sasta store <span className="text-emerald-500 font-medium">.in</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping inline-block"></span>
            India's Most Affordable Direct Marketplace
          </p>
        </div>

        {/* Secret Creator Modal */}
        <AnimatePresence>
          {showSecretModal && (
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
                  onClick={() => setShowSecretModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Secret Creator Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Enter secret passcode to access Creator & Seller management tools.
                </p>
                <form onSubmit={handleSecretPasscodeSubmit} className="space-y-4">
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
                    Verify & Unlock Creator Portal <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">
                Welcome to SastaStore
              </h2>

              {/* User / Customer Option */}
              <button
                id="select-user-role-btn"
                onClick={() => {
                  setStep('user-enter-username');
                  setError('');
                }}
                className="w-full flex items-center p-5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 dark:from-emerald-950/20 dark:to-teal-950/20 dark:hover:from-emerald-950/45 dark:hover:to-teal-950/45 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 transition-all text-left group shadow-sm cursor-pointer"
              >
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-emerald-600 dark:text-emerald-400 mr-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">Continue as Customer</span>
                    <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Browse affordable products, add to cart, and place orders.
                  </p>
                </div>
              </button>
            </motion.div>
          ) : step === 'creator-login' ? (
            <motion.div
              key="creator-login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                id="back-to-selection-btn"
                onClick={() => {
                  setStep('select');
                  setError('');
                  setPassword('');
                }}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back / पीछे जाएँ
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-1">
                Creator Verification
              </h2>
              <p className="text-slate-500 text-xs mb-6">
                Please enter your private passcode to access the listing dashboard.
              </p>

              <form onSubmit={handleCreatorSubmit} className="space-y-4">
                <div>
                  <label htmlFor="passcode-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Enter Hidden Pin Code
                  </label>
                  <div className="relative">
                    <input
                      id="passcode-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-center text-lg tracking-widest font-mono"
                      autoFocus
                    />
                    <button
                      id="toggle-password-visibility-btn"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Toggle */}
                <div className="flex items-center gap-2 py-1 select-none">
                  <input
                    id="creator-remember-me-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer"
                  />
                  <label htmlFor="creator-remember-me-checkbox" className="text-xs text-slate-500 font-medium cursor-pointer">
                    Remember Me on this device / इस डिवाइस पर मुझे याद रखें
                  </label>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-xs font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  id="submit-passcode-btn"
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer"
                >
                  Verify Pin <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </form>
            </motion.div>
          ) : step === 'user-enter-username' ? (
            <motion.div
              key="user-enter-username"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button
                id="back-to-select-from-username"
                onClick={() => {
                  setStep('select');
                  setError('');
                  setCustomerUsername('');
                }}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back / पीछे जाएँ
              </button>

              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                Customer Login / ग्राहक लॉगिन
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                Enter your 10-digit mobile number to login or register instantly.
              </p>

              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div>
                  <label htmlFor="customer-username-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
                    Mobile Number / मोबाइल नंबर दर्ज करें
                  </label>
                  <div className="relative">
                    <input
                      id="customer-username-input"
                      type="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={customerUsername}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, ''); // only allow digits
                        setCustomerUsername(val);
                        if (error) setError('');
                      }}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-lg tracking-wider"
                      autoFocus
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Remember Me Toggle */}
                <div className="flex items-center gap-2 py-1 select-none">
                  <input
                    id="user-remember-me-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="user-remember-me-checkbox" className="text-xs text-slate-500 font-medium cursor-pointer">
                    Remember Me on this device / इस डिवाइस पर मुझे याद रखें
                  </label>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-xs font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  id="submit-username-btn"
                  type="submit"
                  disabled={checkingUser}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 text-base"
                >
                  {checkingUser ? "Checking number..." : "Proceed / आगे बढ़ें"} <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </form>
            </motion.div>
          ) : step === 'user-choose-otp-channel' ? (
            <motion.div
              key="user-choose-otp-channel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button
                id="back-to-username-from-channel"
                onClick={() => {
                  setStep('user-enter-username');
                  setError('');
                }}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back / पीछे जाएँ
              </button>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 mb-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">New User / नया ग्राहक</span>
                  <h3 className="font-extrabold text-slate-800 text-sm mt-1">Verify Mobile Number</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Please confirm your phone number (+91 {customerUsername}) to register.</p>
                </div>
              </div>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Choose Verification Channel</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* WhatsApp Channel Card */}
                <button
                  type="button"
                  onClick={() => setOtpChannel('whatsapp')}
                  className={`w-full flex items-center p-4 rounded-xl border transition-all text-left cursor-pointer ${
                    otpChannel === 'whatsapp'
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-3 ${
                    otpChannel === 'whatsapp' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-bold text-xs text-slate-800">WhatsApp (व्हाट्सएप)</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">Receive verification code on WhatsApp messenger</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    otpChannel === 'whatsapp' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {otpChannel === 'whatsapp' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* SMS Channel Card */}
                <button
                  type="button"
                  onClick={() => setOtpChannel('sms')}
                  className={`w-full flex items-center p-4 rounded-xl border transition-all text-left cursor-pointer ${
                    otpChannel === 'sms'
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-3 ${
                    otpChannel === 'sms' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-bold text-xs text-slate-800">SMS Message (एसएमएस संदेश)</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">Receive verification code via cellular text message</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    otpChannel === 'sms' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {otpChannel === 'sms' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-500 text-xs font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100"
                >
                  {error}
                </motion.p>
              )}

              <button
                id="send-otp-channel-btn"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 text-base gap-2"
              >
                {isSendingOtp ? "Sending OTP..." : "Send OTP Verification Code"} <Send className="w-4 h-4" />
              </button>
            </motion.div>
          ) : step === 'user-enter-otp' ? (
            <motion.div
              key="user-enter-otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button
                id="back-to-channel-from-otp"
                onClick={() => {
                  setStep('user-choose-otp-channel');
                  setError('');
                }}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back / पीछे जाएँ
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-1">
                Enter Verification Code
              </h2>
              <p className="text-slate-500 text-xs mb-6">
                A 6-digit OTP has been sent via <span className="font-bold text-emerald-600">{otpChannel === 'sms' ? 'SMS' : 'WhatsApp'}</span> to <span className="font-mono text-slate-800 font-bold">+91 {customerUsername}</span>.
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Enter 6-Digit OTP / ओटीपी दर्ज करें
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={enteredOtp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, ''); // only allow digits
                      setEnteredOtp(val);
                      if (error) setError('');
                    }}
                    placeholder="e.g. 123456"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-center text-2xl tracking-widest font-mono font-extrabold text-slate-800"
                    autoFocus
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 py-1">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="text-emerald-600 hover:text-emerald-700 font-extrabold disabled:opacity-50 cursor-pointer hover:underline"
                  >
                    Resend Code / दोबारा भेजें
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-xs font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  id="submit-otp-verification-btn"
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 text-base"
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify & Continue"} <CheckCircle2 className="w-4 h-4 ml-2" />
                </button>
              </form>
            </motion.div>
          ) : step === 'user-set-password' ? (
            <motion.div
              key="user-set-password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button
                id="back-to-otp-from-password"
                onClick={() => {
                  setStep('user-enter-otp');
                  setError('');
                }}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back / पीछे जाएँ
              </button>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 mb-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">Verified / सत्यापित</span>
                  <h3 className="font-extrabold text-slate-800 text-sm mt-1">Number Verified Successfully</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Please set a password to complete registration.</p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-1">
                Create Secure Password
              </h2>
              <p className="text-slate-500 text-xs mb-6">
                Choose a password to secure your account. You will use this password to sign in next time.
              </p>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label htmlFor="customer-set-password-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    New Password / नया पासवर्ड बनाएं
                  </label>
                  <div className="relative">
                    <input
                      id="customer-set-password-input"
                      type={showCustomerPassword ? 'text' : 'password'}
                      value={customerPassword}
                      onChange={(e) => {
                        setCustomerPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="At least 4 characters"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium"
                      autoFocus
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <button
                      id="toggle-set-password-visibility"
                      type="button"
                      onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Screenshot & Credentials Preview Card */}
                <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-emerald-700/60 my-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-700/60 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase text-emerald-300 tracking-wider">
                          Screenshot / Save Card
                        </p>
                        <p className="text-xs font-extrabold text-white">ID & Password Pass</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                      className="text-[11px] font-extrabold bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-emerald-600/40"
                    >
                      {showCustomerPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showCustomerPassword ? 'Hide' : 'Show'} Password
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-black/30 p-2.5 rounded-xl border border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">User ID / Mobile</span>
                      <span className="font-mono font-extrabold text-emerald-200">+91 {customerUsername || 'XXXXXXXXXX'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Password</span>
                      <span className="font-mono font-extrabold text-yellow-300 tracking-wider">
                        {showCustomerPassword ? (customerPassword || '••••••••') : '••••••••'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowScreenshotModal(true)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" /> 📸 Take Screenshot Card
                    </button>
                    <button
                      type="button"
                      onClick={downloadCredentialCardImage}
                      className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 p-2 rounded-xl transition-all cursor-pointer"
                      title="Download Image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 p-2 rounded-xl transition-all cursor-pointer"
                      title="Copy Credentials"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-xs font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  id="finalize-registration-btn"
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 text-base"
                >
                  {isRegistering ? "Saving Password..." : "Complete Registration"} <CheckCircle2 className="w-4 h-4 ml-2" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="user-enter-password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button
                id="back-to-username-from-login-pass"
                onClick={() => {
                  setStep('user-enter-username');
                  setError('');
                }}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back / पीछे जाएँ
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-1">
                Enter Password
              </h2>
              <p className="text-slate-500 text-xs mb-6">
                Your mobile number <span className="font-mono text-slate-800 font-bold">+91 {customerUsername}</span> is already registered. Please enter your password to sign in.
              </p>

              <form onSubmit={handleLoginWithPasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="customer-login-password-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Password / पासवर्ड दर्ज करें
                  </label>
                  <div className="relative">
                    <input
                      id="customer-login-password-input"
                      type={showCustomerPassword ? 'text' : 'password'}
                      value={customerPassword}
                      onChange={(e) => {
                        setCustomerPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium"
                      autoFocus
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <button
                      id="toggle-login-password-visibility"
                      type="button"
                      onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Screenshot & Credentials Preview Card */}
                <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-emerald-700/60 my-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-700/60 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase text-emerald-300 tracking-wider">
                          Screenshot / View Card
                        </p>
                        <p className="text-xs font-extrabold text-white">ID & Password Pass</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                      className="text-[11px] font-extrabold bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-emerald-600/40"
                    >
                      {showCustomerPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showCustomerPassword ? 'Hide' : 'Show'} Password
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-black/30 p-2.5 rounded-xl border border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">User ID / Mobile</span>
                      <span className="font-mono font-extrabold text-emerald-200">+91 {customerUsername || 'XXXXXXXXXX'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Password</span>
                      <span className="font-mono font-extrabold text-yellow-300 tracking-wider">
                        {showCustomerPassword ? (customerPassword || '••••••••') : '••••••••'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowScreenshotModal(true)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" /> 📸 Take Screenshot Card
                    </button>
                    <button
                      type="button"
                      onClick={downloadCredentialCardImage}
                      className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 p-2 rounded-xl transition-all cursor-pointer"
                      title="Download Image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 p-2 rounded-xl transition-all cursor-pointer"
                      title="Copy Credentials"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-xs font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  id="submit-password-login-btn"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 text-base"
                >
                  {isLoggingIn ? "Logging in..." : "Login / लॉगिन करें"} <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center text-center gap-1.5 text-slate-400 text-xs">
          <span>🛡️ Secured Connection</span>
          <span>•</span>
          <span>Made for Mobile Browser</span>
        </div>

      </div>

      {/* Full-Screen Screenshot-Friendly ID Card Modal */}
      <AnimatePresence>
        {showScreenshotModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseScreenshotModal}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl z-[10001] border-2 border-emerald-500/50 text-white my-auto text-center"
            >
              <button
                type="button"
                id="close-screenshot-modal-btn"
                onClick={handleCloseScreenshotModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30 mb-3">
                <Camera className="w-4 h-4 text-emerald-400" /> SCREENSHOT-READY CARD
              </div>

              <h3 className="text-xl font-extrabold text-white mb-1">
                📸 Save Credentials & Take Screenshot
              </h3>
              <p className="text-xs text-slate-300 mb-5">
                Your account is ready! Capture this screen or download the image to remember your login details.
              </p>

              {/* The Card to Screenshot */}
              <div className="bg-gradient-to-tr from-emerald-900 via-teal-900 to-slate-950 rounded-2xl p-6 border-2 border-emerald-400/80 shadow-2xl text-left space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3">
                  <div>
                    <h4 className="font-display font-extrabold text-lg text-white tracking-tight">sasta store .in</h4>
                    <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">OFFICIAL USER LOGIN PASS</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-md uppercase">Verified ID</span>
                </div>

                <div className="space-y-3 py-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile No / User ID</span>
                    <p className="font-mono text-xl font-extrabold text-white tracking-wider">+91 {customerUsername || 'XXXXXXXXXX'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Password / पासवर्ड</span>
                    <p className="font-mono text-2xl font-black text-yellow-300 tracking-wider">
                      {customerPassword || '••••••••'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>SastaStore Customer Security</span>
                  <span className="text-emerald-400 font-bold">✓ Ready for Screenshot</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  type="button"
                  id="screenshot-modal-download-png"
                  onClick={downloadCredentialCardImage}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button
                  type="button"
                  id="screenshot-modal-copy-text"
                  onClick={handleCopyCredentials}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? "Copied!" : "Copy Details"}
                </button>
              </div>

              {/* Big Continue Button to Enter Store */}
              <button
                type="button"
                id="screenshot-modal-continue-btn"
                onClick={handleCloseScreenshotModal}
                className="w-full mt-3 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-all active:scale-98"
              >
                Continue to SastaStore / स्टोर में जाएं <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Phone WhatsApp/SMS Notification Toast Overlay */}
      <AnimatePresence>
        {simulatedNotification?.visible && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl z-[10000] border border-slate-800 pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                simulatedNotification.channel === 'WhatsApp' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {simulatedNotification.channel === 'WhatsApp' ? <MessageCircle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    {simulatedNotification.channel === 'WhatsApp' ? '💬 WhatsApp (SastaStore)' : '📲 SMS (SastaStore)'}
                  </span>
                  <span className="text-[10px] text-slate-500">Just now</span>
                </div>
                <p className="text-sm font-semibold mt-1 text-white">
                  {simulatedNotification.message}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEnteredOtp(simulatedOtp);
                      // Auto-dismiss the notification
                      setSimulatedNotification(prev => prev ? { ...prev, visible: false } : null);
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Auto-Fill OTP / ऑटो-फ़िल करें
                  </button>
                  <button
                    onClick={() => setSimulatedNotification(prev => prev ? { ...prev, visible: false } : null)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
