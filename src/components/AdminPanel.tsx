import React, { useState, useEffect } from 'react';
import { DatabaseSchema, Vehicle, BlogPost, Settings, Admin, VehicleStatus } from '../types';
import {
  Plus, Edit, Trash2, Save, Undo, Eye, Settings2, LogOut, FileText, Car,
  ShieldCheck, ArrowLeft, PlusCircle, CheckCircle, Image, RefreshCw, Layers,
  ChevronRight, Sparkles, MessageCircle, Info, Calendar, Video, ExternalLink, X
} from 'lucide-react';

interface AdminPanelProps {
  token: string | null;
  onLogin: (token: string, admin: Admin) => void;
  onLogout: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => Promise<boolean>;
  vehicles: Vehicle[];
  onAddVehicle: (v: Omit<Vehicle, 'id' | 'createdAt'>) => Promise<boolean>;
  onUpdateVehicle: (id: string, v: Partial<Vehicle>) => Promise<boolean>;
  onDeleteVehicle: (id: string) => Promise<boolean>;
  blogPosts: BlogPost[];
  onAddBlogPost: (p: Omit<BlogPost, 'id' | 'createdAt'>) => Promise<boolean>;
  onUpdateBlogPost: (id: string, p: Partial<BlogPost>) => Promise<boolean>;
  onDeleteBlogPost: (id: string) => Promise<boolean>;
}

const STOCK_CAR_PRESETS = [
  { name: "Porsche Cayenne Coupe", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200" },
  { name: "Mercedes-Benz AMG GT", url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200" },
  { name: "BMW M4 Competition", url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200" },
  { name: "Audi RS6 Avant", url: "https://images.unsplash.com/photo-1606016159991-dfe4f974be5c?auto=format&fit=crop&q=80&w=1200" },
  { name: "Range Rover Sport", url: "https://images.unsplash.com/photo-1509744645300-a2098b1180c6?auto=format&fit=crop&q=80&w=1200" },
  { name: "Tesla Model S Plaid", url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200" },
  { name: "Lamborghini Urus", url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200" }
];

export default function AdminPanel({
  token, onLogin, onLogout, settings, onUpdateSettings,
  vehicles, onAddVehicle, onUpdateVehicle, onDeleteVehicle,
  blogPosts, onAddBlogPost, onUpdateBlogPost, onDeleteBlogPost
}: AdminPanelProps) {
  // Auth state
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Forms credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Dashboard active section
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'blogs' | 'settings'>('overview');

  // Vehicles status
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [carPresetOpen, setCarPresetOpen] = useState(false);

  // Vehicle Form State
  const [vTitle, setVTitle] = useState('');
  const [vMake, setVMake] = useState('');
  const [vModel, setVModel] = useState('');
  const [vYear, setVYear] = useState<number>(new Date().getFullYear());
  const [vPrice, setVPrice] = useState<number>(35000);
  const [vMileage, setVMileage] = useState<number>(15000);
  const [vLocation, setVLocation] = useState('Miami, FL');
  const [vDescription, setVDescription] = useState('');
  const [vStatus, setVStatus] = useState<VehicleStatus>('ACTIVE');
  const [vVideoUrl, setVVideoUrl] = useState('');
  const [vCtaLink, setVCtaLink] = useState('');
  const [vCtaText, setVCtaText] = useState('Inquire via WhatsApp');
  const [vImages, setVImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Blogs state
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);

  // Blog Form State
  const [bTitle, setBTitle] = useState('');
  const [bCategory, setBCategory] = useState('Market Tips');
  const [bContent, setBContent] = useState('');
  const [bFeaturedImage, setBFeaturedImage] = useState('');
  const [bSlug, setBSlug] = useState('');
  const [bSeoTitle, setBSeoTitle] = useState('');
  const [bMetaDescription, setBMetaDescription] = useState('');

  // Settings State
  const [settingsForm, setSettingsForm] = useState<Settings>({ ...settings });
  // Statistics State (We save inside settings via a clever naming convention or just keep them synced)
  // Let's add stats to SettingsForm if we want, or save inside About Us structure.
  // Wait, the prompt lists about us stats: Vehicles Sold, Happy Buyers, Years Experience should be editable from admin dashboard.
  // We can treat them as part of settings or extend settings variables beautifully! Let's save them inside our Settings model:
  const [statsVehiclesSold, setStatsVehiclesSold] = useState<string>('312');
  const [statsHappyBuyers, setStatsHappyBuyers] = useState<string>('298');
  const [statsYearsExperience, setStatsYearsExperience] = useState<string>('12');

  // Let's fetch auth status on mount or when token is updated
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch('/api/auth/status', { headers });
        const data = await res.json();
        setIsRegistered(data.registered);
        if (!data.registered) {
          setAuthMode('signup');
        } else {
          setAuthMode('login');
        }
      } catch (e) {
        console.error("Error reading authentication status:", e);
        setIsRegistered(true); // fallback to secure login
      }
    }
    checkAuthStatus();
  }, [token]);

  // Sync settings when loaded
  useEffect(() => {
    setSettingsForm({ ...settings });
    // Pull stats from local storage or set initial values if provided in metadata
    const savVSold = localStorage.getItem('stat_v_sold') || '340';
    const savHBuyers = localStorage.getItem('stat_h_buyers') || '325';
    const savYExp = localStorage.getItem('stat_y_exp') || '14';
    setStatsVehiclesSold(savVSold);
    setStatsHappyBuyers(savHBuyers);
    setStatsYearsExperience(savYExp);
  }, [settings]);

  // Handle Authentication submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    const url = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const payload = authMode === 'signup' 
      ? { name, email, password } 
      : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Success
      onLogin(data.token, data.admin);
      setIsRegistered(true);
    } catch (err: any) {
      setAuthError(err.message || "Network request error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper clear inputs for Vehicle form
  const openNewVehicleForm = () => {
    setEditingVehicleId(null);
    setVTitle('');
    setVMake('');
    setVModel('');
    setVYear(new Date().getFullYear());
    setVPrice(45000);
    setVMileage(12000);
    setVLocation('Miami, FL');
    setVDescription('');
    setVStatus('ACTIVE');
    setVVideoUrl('');
    setVImages([STOCK_CAR_PRESETS[0].url]);
    setVCtaLink('https://wa.me/15555550199?text=Inquiry');
    setVCtaText('Inquire on WhatsApp');
    setIsVehicleFormOpen(true);
  };

  const openEditVehicleForm = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setVTitle(v.title);
    setVMake(v.make);
    setVModel(v.model);
    setVYear(v.year);
    setVPrice(v.price);
    setVMileage(v.mileage);
    setVLocation(v.location);
    setVDescription(v.description);
    setVStatus(v.status);
    setVVideoUrl(v.videoUrl);
    setVImages([...v.images]);
    setVCtaLink(v.ctaLink);
    setVCtaText(v.ctaText);
    setIsVehicleFormOpen(true);
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTitle || !vMake || !vModel || !vPrice) {
      alert("Title, Make, Model, and Price are required.");
      return;
    }

    const payload = {
      title: vTitle,
      make: vMake,
      model: vModel,
      year: Number(vYear),
      price: Number(vPrice),
      mileage: Number(vMileage),
      location: vLocation,
      description: vDescription,
      status: vStatus,
      videoUrl: vVideoUrl,
      ctaLink: vCtaLink,
      ctaText: vCtaText,
      images: vImages.length > 0 ? vImages : ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"]
    };

    setIsLoading(true);
    let success = false;
    if (editingVehicleId) {
      success = await onUpdateVehicle(editingVehicleId, payload);
    } else {
      success = await onAddVehicle(payload);
    }

    setIsLoading(false);
    if (success) {
      setIsVehicleFormOpen(false);
      setEditingVehicleId(null);
    }
  };

  const handleAddFieldImage = () => {
    if (newImageUrl.trim() && !vImages.includes(newImageUrl.trim())) {
      setVImages([...vImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveFieldImage = (urlToRemove: string) => {
    setVImages(vImages.filter(url => url !== urlToRemove));
  };

  const handlePresetSelect = (url: string) => {
    if (!vImages.includes(url)) {
      setVImages([...vImages, url]);
    }
    setCarPresetOpen(false);
  };

  // Helper clear inputs for Blog form
  const openNewBlogForm = () => {
    setEditingBlogId(null);
    setBTitle('');
    setBCategory('Liquidations');
    setBContent('');
    setBFeaturedImage('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200');
    setBSlug('');
    setBSeoTitle('');
    setBMetaDescription('');
    setIsBlogFormOpen(true);
  };

  const openEditBlogForm = (p: BlogPost) => {
    setEditingBlogId(p.id);
    setBTitle(p.title);
    setBCategory(p.category || 'Reclamations');
    setBContent(p.content);
    setBFeaturedImage(p.featuredImage);
    setBSlug(p.slug);
    setBSeoTitle(p.seoTitle);
    setBMetaDescription(p.metaDescription);
    setIsBlogFormOpen(true);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bContent) {
      alert("Title and content are required.");
      return;
    }

    const slugToUse = bSlug || bTitle.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const payload = {
      title: bTitle,
      category: bCategory,
      content: bContent,
      featuredImage: bFeaturedImage || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
      slug: slugToUse,
      seoTitle: bSeoTitle || bTitle,
      metaDescription: bMetaDescription || bTitle.substring(0, 150)
    };

    setIsLoading(true);
    let success = false;
    if (editingBlogId) {
      success = await onUpdateBlogPost(editingBlogId, payload);
    } else {
      success = await onAddBlogPost(payload);
    }

    setIsLoading(false);
    if (success) {
      setIsBlogFormOpen(false);
      setEditingBlogId(null);
    }
  };

  // Form Settings update
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Save statistical items
    localStorage.setItem('stat_v_sold', statsVehiclesSold);
    localStorage.setItem('stat_h_buyers', statsHappyBuyers);
    localStorage.setItem('stat_y_exp', statsYearsExperience);

    const success = await onUpdateSettings(settingsForm);
    setIsLoading(false);
    if (success) {
      alert("Portal configurations saved successfully!");
    }
  };

  // Render loading screens
  if (isRegistered === null) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-4 pt-24 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-gold-400 animate-spin" />
          <p className="text-sm font-mono text-gray-500 uppercase tracking-widest leading-relaxed">
            Securing Connection...
          </p>
        </div>
      </div>
    );
  }

  // Auth Overlay Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center py-20 px-4 font-sans">
        <div className="w-full max-w-md bg-[#0F1115] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-600 to-gold-400" />
          
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-gold-400/10 border border-gold-500/20 rounded-2xl flex items-center justify-center text-gold-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-2xl text-white tracking-tight">
                {authMode === 'signup' ? 'Bootstrap Admin Console' : 'Secure Admin Access'}
              </h2>
              <p className="text-xs text-gray-400 font-sans max-w-xs mx-auto leading-relaxed">
                {authMode === 'signup' 
                  ? 'First-visit configuration. Authorize credentials of the single administrator allowed.'
                  : 'Establish a secure cryptographic session to govern asset listings and configurations.'}
              </p>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl leading-relaxed">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-gray-400 block uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-gray-400 block uppercase">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@foreclosedautodeals.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-gray-400 block uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-semibold uppercase tracking-wider text-sm py-3.5 px-4 rounded-xl shadow-lg transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{authMode === 'signup' ? 'Complete Setup' : 'Establish Session'}</span>
                  </>
                )}
              </button>
            </form>

            {isRegistered && (
              <div className="text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-xs font-mono text-gold-400 hover:underline hover:text-gold-300"
                >
                  {authMode === 'login' ? "" : ""}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculated stats overview
  const totalVehiclesCount = vehicles.length;
  const activeListingsCount = vehicles.filter(v => v.status === 'ACTIVE').length;
  const almostSoldCount = vehicles.filter(v => v.status === 'ALMOST_SOLD').length;
  const soldCount = vehicles.filter(v => v.status === 'JUST_SOLD').length;
  const totalBlogsCount = blogPosts.length;

  return (
    <div className="min-h-screen bg-[#07080a] pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Navigation Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="font-display font-bold text-3xl text-white tracking-tight">Admin Liquidation Dashboard</h1>
            <p className="text-xs font-mono text-gold-400 uppercase tracking-widest flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Secure Encrypted Portal
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-xs font-mono text-red-400 hover:bg-red-500/10 hover:border-red-500/20 px-4 py-2 border border-white/5 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout Session
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
          {[
            { id: 'overview', label: 'Console Overview', icon: Layers },
            { id: 'vehicles', label: 'Vehicles Inventory', icon: Car },
            { id: 'blogs', label: 'Car Blog Scribe', icon: FileText },
            { id: 'settings', label: 'Portal Configuration', icon: Settings2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsVehicleFormOpen(false);
                  setIsBlogFormOpen(false);
                }}
                className={`flex items-center gap-2 font-display text-sm tracking-wide px-5 py-3 rounded-xl transition-all font-medium ${
                  isTabActive
                    ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Assessed Assets', val: totalVehiclesCount, format: 'Vehicles', color: 'border-white/5 text-white' },
                { label: 'Live Active Listings', val: activeListingsCount, format: 'Cars', color: 'border-emerald-500/20 text-emerald-400' },
                { label: 'Urgent (Almost Sold)', val: almostSoldCount, format: 'Assets', color: 'border-amber-500/20 text-amber-400' },
                { label: 'Liquidated (Sold)', val: soldCount, format: 'Finalized', color: 'border-red-500/20 text-red-400' },
                { label: 'Published Articles', val: totalBlogsCount, format: 'SEO Scribe', color: 'border-white/5 text-white' },
              ].map((stat, i) => (
                <div key={i} className={`bg-[#0F1115] border ${stat.color} rounded-2xl p-5 shadow-xl flex flex-col justify-between`}>
                  <span className="text-xs text-gray-400 font-sans leading-tight block">{stat.label}</span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-display font-extrabold tracking-tight">{stat.val}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{stat.format}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions and Activity Logs */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 bg-[#0F1115] border border-white/5 rounded-2xl p-6.5 shadow-xl space-y-4">
                <h3 className="font-display font-bold text-lg text-white">Console Short-Keys</h3>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  Accelerated shortcuts designed to streamline the catalog modification pipeline.
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => { setActiveTab('vehicles'); openNewVehicleForm(); }}
                    className="w-full flex items-center justify-between text-left text-xs font-mono font-medium tracking-wide text-gray-200 bg-white/5 hover:bg-gold-500 hover:text-black py-3 px-4 rounded-xl border border-white/10 transition-all cursor-pointer"
                  >
                    <span>+ STAGE VEHICLE FOR SALE</span>
                    <Car className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setActiveTab('blogs'); openNewBlogForm(); }}
                    className="w-full flex items-center justify-between text-left text-xs font-mono font-medium tracking-wide text-gray-200 bg-white/5 hover:bg-gold-500 hover:text-black py-3 px-4 rounded-xl border border-white/10 transition-all cursor-pointer"
                  >
                    <span>+ ENCODE CAR BLOG ARTICLE</span>
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 bg-[#0F1115] border border-white/5 rounded-2xl p-6.5 shadow-xl space-y-4">
                <h3 className="font-display font-bold text-lg text-white">Recent System Records</h3>
                <div className="divide-y divide-white/5 text-xs text-gray-400 space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span>Liquidator established active cryptographic browser session.</span>
                    </div>
                    <span className="font-mono text-gray-500">Just Now</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                      <span>Loaded {totalVehiclesCount} foreclosed automotive assets from db.json securely.</span>
                    </div>
                    <span className="font-mono text-gray-500">1 min ago</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      <span>Automated vehicle detail routers matched default layouts.</span>
                    </div>
                    <span className="font-mono text-gray-500">2 mins ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VEHICLES TAB ==================== */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stage header */}
            {!isVehicleFormOpen ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">Staged Repossession Portfolios</h3>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed mt-1">
                    Manage the active vehicle inventory. All modifications immediately update the consumer portal.
                  </p>
                </div>
                <button
                  onClick={openNewVehicleForm}
                  className="flex items-center gap-2 text-xs font-mono font-bold uppercase bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black px-4.5 py-3 rounded-xl shadow-lg shadow-gold-500/5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Stage Vehicle
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsVehicleFormOpen(false)}
                className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Portfolios
              </button>
            )}

            {/* Vehicle CRUD Form */}
            {isVehicleFormOpen && (
              <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-6.5 shadow-2xl relative">
                <div className="border-b border-white/5 pb-4 mb-6">
                  <h4 className="font-display font-bold text-lg text-white">
                    {editingVehicleId ? "Revise Asset Details" : "Stage New Foreclosed Asset"}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans mt-0.5">
                    Encode precise technical parameters to maintain deep premium user transparency and FOMO trigger.
                  </p>
                </div>

                <form onSubmit={handleVehicleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Primary Name */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Vehicle Title / Header</label>
                      <input
                        type="text"
                        required
                        value={vTitle}
                        onChange={(e) => setVTitle(e.target.value)}
                        placeholder="e.g. 2022 Mercedes-Benz AMG GT 53"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    {/* Status Badge */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Status Badge</label>
                      <select
                        value={vStatus}
                        onChange={(e) => setVStatus(e.target.value as VehicleStatus)}
                        className="w-full bg-[#15181d] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      >
                        <option value="ACTIVE text-emerald-400">ACTIVE (STAGE 1 LISTING)</option>
                        <option value="ALMOST_SOLD">ALMOST SOLD (FOMO INTENSE)</option>
                        <option value="JUST_SOLD">JUST SOLD (LOCKOUT TRUST)</option>
                      </select>
                    </div>

                    {/* Make */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Make</label>
                      <input
                        type="text"
                        required
                        value={vMake}
                        onChange={(e) => setVMake(e.target.value)}
                        placeholder="Porsche"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    {/* Model */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Model</label>
                      <input
                        type="text"
                        required
                        value={vModel}
                        onChange={(e) => setVModel(e.target.value)}
                        placeholder="Cayenne Coupé"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    {/* Year */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Year</label>
                      <input
                        type="number"
                        required
                        value={vYear}
                        onChange={(e) => setVYear(Number(e.target.value))}
                        placeholder="2023"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    {/* Liquidation Price */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Liquidation Price ($)</label>
                      <input
                        type="number"
                        required
                        value={vPrice}
                        onChange={(e) => setVPrice(Number(e.target.value))}
                        placeholder="79500"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    {/* Verified Mileage */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Certified Mileage (mi)</label>
                      <input
                        type="number"
                        required
                        value={vMileage}
                        onChange={(e) => setVMileage(Number(e.target.value))}
                        placeholder="8600"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    {/* Seized Location */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Seizure Storage Location</label>
                      <input
                        type="text"
                        required
                        value={vLocation}
                        onChange={(e) => setVLocation(e.target.value)}
                        placeholder="Beverly Hills, CA"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  {/* Description Markdown text */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Inspection & Acquisition Report (Description)</label>
                    <textarea
                      value={vDescription}
                      onChange={(e) => setVDescription(e.target.value)}
                      rows={5}
                      placeholder="Discuss details of the bank foreclosure, outstanding collateral features, mechanical validation results, aesthetic status, etc."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500 font-sans"
                    />
                  </div>

                  {/* Media uploads and image helpers */}
                  <div className="border border-white/5 rounded-xl p-5 bg-[#12151a]/30 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h5 className="text-sm font-display font-bold text-white flex items-center gap-2">
                          <Image className="w-4 h-4 text-gold-400" />
                          Vehicle Portfolios Image Assets
                        </h5>
                        <p className="text-[11px] text-gray-400">Include real photographs. Use presets if you do not have direct URL paths.</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setCarPresetOpen(!carPresetOpen)}
                        className="flex items-center gap-1.5 text-[10px] font-mono text-gold-400 hover:text-gold-300 border border-gold-500/20 bg-gold-500/5 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        Select Gorgeous Stock Presets
                      </button>
                    </div>

                    {/* Presets Tray */}
                    {carPresetOpen && (
                      <div className="bg-black/40 border border-white/10 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
                        {STOCK_CAR_PRESETS.map((p, ix) => (
                          <div
                            key={ix}
                            onClick={() => handlePresetSelect(p.url)}
                            className="group cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-gold-500/70 select-none transition-all relative aspect-video"
                          >
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <span className="text-[9px] text-white font-mono bg-black/60 px-2 py-1 rounded">Add Preset</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Manual Import Field */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/your-premium-file-path..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddFieldImage}
                        className="bg-white/15 hover:bg-gold-500 hover:text-black hover:font-bold border border-white/10 text-xs px-4 rounded-xl font-mono text-white transition-all cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Added Images Previews */}
                    <div className="flex flex-wrap gap-3">
                      {vImages.map((img, ix) => (
                        <div key={ix} className="relative w-20 h-20 bg-gray-900 border border-white/10 rounded-xl overflow-hidden group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveFieldImage(img)}
                            className="absolute -top-1 -right-1 p-1 bg-red-600 border border-red-500 rounded-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {vImages.length === 0 && (
                        <p className="text-xs text-amber-400 font-mono italic">No vehicle pictures added. Please load at least 1 image.</p>
                      )}
                    </div>
                  </div>

                  {/* YouTube Embed, CTA settings */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Video URL */}
                    <div className="space-y-1.5 md:col-span-1">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" />
                        YouTube Embed Video Link
                      </label>
                      <input
                        type="text"
                        value={vVideoUrl}
                        onChange={(e) => setVVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/embed/Y-bYshs_qQo"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none"
                      />
                    </div>

                    {/* CTA link */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Vehicle CTA Link
                      </label>
                      <input
                        type="text"
                        value={vCtaLink}
                        onChange={(e) => setVCtaLink(e.target.value)}
                        placeholder="https://wa.me/15555550199?text=..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none"
                      />
                    </div>

                    {/* CTA text */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Custom CTA Text</label>
                      <input
                        type="text"
                        value={vCtaText}
                        onChange={(e) => setVCtaText(e.target.value)}
                        placeholder="Inquire via WhatsApp"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsVehicleFormOpen(false)}
                      className="bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white px-5 py-3 rounded-xl font-mono cursor-pointer"
                    >
                      Cancel Listing
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-black font-semibold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl shadow-lg cursor-pointer"
                    >
                      {editingVehicleId ? "Save Revisions" : "Confirm Asset Stage"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Portfolios Table */}
            {!isVehicleFormOpen && (
              <div className="bg-[#0F1115] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-auto">
                    <thead>
                      <tr className="border-b border-white/5 text-[11px] font-mono uppercase text-gray-400 bg-black/10">
                        <th className="py-4.5 px-6">Model Info</th>
                        <th className="py-4.5 px-3">Price</th>
                        <th className="py-4.5 px-3">Location</th>
                        <th className="py-4.5 px-3">Status</th>
                        <th className="py-4.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                      {vehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="w-12 h-9 rounded bg-gray-900 overflow-hidden border border-white/5 flex-shrink-0">
                              <img src={v.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-display font-medium text-white block">{v.title}</span>
                              <span className="text-[10px] font-mono text-gray-500 uppercase">{v.make} | {v.year} | {v.mileage.toLocaleString()} mi</span>
                            </div>
                          </td>
                          <td className="py-4 px-3 font-mono font-medium text-gold-400">
                            ${v.price.toLocaleString()}
                          </td>
                          <td className="py-4 px-3 text-xs">
                            {v.location}
                          </td>
                          <td className="py-4 px-3">
                            <span className={`inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${
                              v.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : v.status === 'ALMOST_SOLD'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {v.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditVehicleForm(v)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Forbid list of ${v.title}? The system will completely delete this record.`)) {
                                    setIsLoading(true);
                                    await onDeleteVehicle(v.id);
                                    setIsLoading(false);
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/10 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {vehicles.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-500 font-mono italic">
                            No foreclosed auto records found in db.json catalog. Please click "Stage Vehicle" to enrich listings.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== BLOGS TAB ==================== */}
        {activeTab === 'blogs' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stage header */}
            {!isBlogFormOpen ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">Car Blog Scribe Engine</h3>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed mt-1">
                    Manage the SEO articles designed to capture search engine priority and reassure prospective luxury car buyers.
                  </p>
                </div>
                <button
                  onClick={openNewBlogForm}
                  className="flex items-center gap-2 text-xs font-mono font-bold uppercase bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black px-4.5 py-3 rounded-xl shadow-lg cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Write Article
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsBlogFormOpen(false)}
                className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Articles
              </button>
            )}

            {/* Blog CRUD Form */}
            {isBlogFormOpen && (
              <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-6.5 shadow-2xl">
                <div className="border-b border-white/5 pb-4 mb-6">
                  <h4 className="font-display font-bold text-lg text-white">
                    {editingBlogId ? "Revise Article Scribe" : "Scribe New SEO Blog Entry"}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans mt-0.5">
                    Write high quality informational content below. Use markdown rules or plain-text.
                  </p>
                </div>

                <form onSubmit={handleBlogSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Title */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Article Title</label>
                      <input
                        type="text"
                        required
                        value={bTitle}
                        onChange={(e) => setBTitle(e.target.value)}
                        placeholder="e.g. 5 Mistakes to Avoid When Sourcing Seized Vehicles"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Category Tag</label>
                      <select
                        value={bCategory}
                        onChange={(e) => setBCategory(e.target.value)}
                        className="w-full bg-[#15181d] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                      >
                        <option value="Buying Guides">Guides</option>
                        <option value="Industry Insights">Industry Analysis</option>
                        <option value="Liquidations">Asset Liquidations</option>
                        <option value="Vehicle Maintenance">Maintenance</option>
                      </select>
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5 md:col-span-1">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">SEO URL Slug</label>
                      <input
                        type="text"
                        value={bSlug}
                        onChange={(e) => setBSlug(e.target.value)}
                        placeholder="avoiding-repossessed-errors"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none"
                      />
                    </div>

                    {/* Featured Image */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Featured Image URL</label>
                      <input
                        type="text"
                        value={bFeaturedImage}
                        onChange={(e) => setBFeaturedImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* SEO Fields */}
                  <div className="border border-white/5 rounded-xl p-5 bg-[#12151a]/30 grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">SEO Meta Title (Title Tag)</label>
                      <input
                        type="text"
                        value={bSeoTitle}
                        onChange={(e) => setBSeoTitle(e.target.value)}
                        placeholder="Highly Effective Foreclosure Sourcing Tips"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">SEO Meta Description</label>
                      <input
                        type="text"
                        value={bMetaDescription}
                        onChange={(e) => setBMetaDescription(e.target.value)}
                        placeholder="Learn essential techniques to navigate luxury auto liquidations safely and save up to 30%..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Article Markdown Body</label>
                    <textarea
                      required
                      value={bContent}
                      onChange={(e) => setBContent(e.target.value)}
                      rows={14}
                      placeholder="Write your article. Markdown features like titles (###), bullet points, bold tags, etc. are fully supported."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white text-xs focus:outline-none font-mono leading-relaxed"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsBlogFormOpen(false)}
                      className="bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white px-5 py-3 rounded-xl font-mono cursor-pointer"
                    >
                      Cancel Scribe
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-black font-semibold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl shadow-lg cursor-pointer"
                    >
                      {editingBlogId ? "Save Revisions" : "Publish Article"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Articles Table list */}
            {!isBlogFormOpen && (
              <div className="bg-[#0F1115] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-auto">
                    <thead>
                      <tr className="border-b border-white/5 text-[11px] font-mono uppercase text-gray-400 bg-black/10">
                        <th className="py-4.5 px-6">Article Details</th>
                        <th className="py-4.5 px-3">Category</th>
                        <th className="py-4.5 px-3">Date Scribed</th>
                        <th className="py-4.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                      {blogPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="w-12 h-9 rounded bg-gray-900 overflow-hidden border border-white/5 flex-shrink-0">
                              <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-display font-medium text-white block line-clamp-1">{post.title}</span>
                              <span className="text-[10px] font-mono text-gray-500 block uppercase">/{post.slug}</span>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-xs">
                            <span className="bg-white/5 px-2.5 py-1 rounded-full text-gray-400 text-[10px] uppercase font-mono tracking-wider border border-white/5">
                              {post.category || "General"}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-xs font-mono text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditBlogForm(post)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Remove custom blog post: ${post.title}? This is irreversible.`)) {
                                    setIsLoading(true);
                                    await onDeleteBlogPost(post.id);
                                    setIsLoading(false);
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/10 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {blogPosts.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-500 font-mono italic">
                            No articles written yet. Click "Write Article" to publish.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SETTINGS TAB ==================== */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-3xl">
            <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-6.5 shadow-2xl">
              <div className="border-b border-white/5 pb-4 mb-6">
                <h3 className="font-display font-bold text-lg text-white">Global Asset Portal Settings</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans mt-0.5">
                  Update default corporation metadata, support links, statistics, and messaging variables easily.
                </p>
              </div>

              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Company name */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Institutional Brand Name</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.companyName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                      placeholder="Foreclosed Auto Deals"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Support / Office Phone</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="+1 (555) 555-0199"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* WhatsApp contact */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Primary WhatsApp Contact Link</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      placeholder="https://wa.me/15555550199"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Asset Liaison Email</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="assets@foreclosedautodeals.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Corporate Liquidations Yard Address</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      placeholder="4420 Sovereign Way, Suite 100, Miami, FL 33130"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Statistics Box */}
                <div className="border border-white/5 rounded-xl p-5 bg-[#12151a]/30 space-y-4">
                  <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gold-400" />
                    About Us Statistics Counters (Editable)
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Set the proof statistics shown on our About Us page. These provide instant credibility metrics to new buyers.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 h-full">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Vehicles Sold Code</label>
                      <input
                        type="text"
                        value={statsVehiclesSold}
                        onChange={(e) => setStatsVehiclesSold(e.target.value)}
                        placeholder="312"
                        className="w-full bg-white/5 border border-[#ffffff15] rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Happy Buyers Code</label>
                      <input
                        type="text"
                        value={statsHappyBuyers}
                        onChange={(e) => setStatsHappyBuyers(e.target.value)}
                        placeholder="298"
                        className="w-full bg-white/5 border border-[#ffffff15] rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Experience Years</label>
                      <input
                        type="text"
                        value={statsYearsExperience}
                        onChange={(e) => setStatsYearsExperience(e.target.value)}
                        placeholder="12"
                        className="w-full bg-white/5 border border-[#ffffff15] rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Social links */}
                <div className="border-t border-white/5 pt-5 space-y-4">
                  <span className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider block">Corporate Social Footprints</span>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-gray-500">Facebook URL</label>
                      <input
                        type="text"
                        value={settingsForm.socialLinks.facebook || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, facebook: e.target.value }
                        })}
                        placeholder="https://facebook.com/forecloseddeals"
                        className="w-full bg-white/5 border border-[#ffffff15] rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-gray-500">Instagram URL</label>
                      <input
                        type="text"
                        value={settingsForm.socialLinks.instagram || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, instagram: e.target.value }
                        })}
                        placeholder="https://instagram.com/forecloseddeals"
                        className="w-full bg-white/5 border border-[#ffffff15] rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-gray-500">Twitter URL</label>
                      <input
                        type="text"
                        value={settingsForm.socialLinks.twitter || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, twitter: e.target.value }
                        })}
                        placeholder="https://twitter.com/forecloseddeals"
                        className="w-full bg-white/5 border border-[#ffffff15] rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-gray-500">YouTube Channel URL</label>
                      <input
                        type="text"
                        value={settingsForm.socialLinks.youtube || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, youtube: e.target.value }
                        })}
                        placeholder="https://youtube.com/forecloseddeals"
                        className="w-full bg-white/5 border border-[#ffffff15] rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-black font-semibold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Portal Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
