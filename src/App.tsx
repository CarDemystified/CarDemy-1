import React, { useState, useEffect } from 'react';
import { Vehicle, BlogPost, Settings, Admin, VehicleStatus } from './types';
import Header from './components/Header';
import FAQ from './components/FAQ';
import BlogCard from './components/BlogCard';
import AdminPanel from './components/AdminPanel';
import CarListingsGrid from './components/CarListingsGrid';
import { ScrollReveal } from './components/ScrollReveal';
import { supabase } from './lib/supabase';
import {
  Car, Calendar, Clock, MapPin, Eye, Phone, MessageCircle, AlertCircle, Share2, RefreshCw,
  ExternalLink, Filter, ArrowLeft, ShieldCheck, Award, Zap, ChevronRight,
  TrendingUp, Users, Copy, Check, Facebook, Twitter, Mail, HelpCircle, ChevronLeft, Video
} from 'lucide-react';

type Route =
  | { path: 'home' }
  | { path: 'blog'; slug?: string }
  | { path: 'about' }
  | { path: 'admin' }
  | { path: 'car-grid' }
  | { path: 'vehicle'; id: string };

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>({ path: 'home' });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<Settings>({
    companyName: "Foreclosed Auto Deals",
    phone: "+1 (555) 555-0199",
    whatsapp: "https://wa.me/15555550199",
    email: "assets@foreclosedautodeals.com",
    address: "4420 Sovereign Way, Suite  Miami, FL",
    socialLinks: {}
  });

  // Auth session
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [adminUser, setAdminUser] = useState<Admin | null>(null);

  // Filter conditions
  const [searchFilter, setSearchFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('ALL');
  const [priceMaxFilter, setPriceMaxFilter] = useState<number>(150000);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Blog Search and Filter
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('ALL');

  // Vehicle Detail main image state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Social share copy state
  const [copiedLink, setCopiedLink] = useState(false);

  // App loading and failures
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);
  const [useBypassMode, setUseBypassMode] = useState<boolean>(() => {
    return sessionStorage.getItem('bypass_supabase') === 'true';
  });

  const handleLoadSimulatedClientMode = () => {
    sessionStorage.setItem('bypass_supabase', 'true');
    setUseBypassMode(true);
    setAppError(null);
    setAppLoading(false);

    const activeToken = localStorage.getItem('admin_token');
    if (activeToken) {
      setAdminUser({
        id: 'simulated-admin-id',
        name: 'Demo Admin',
        email: 'admin@foreclosedautodeals.com',
        createdAt: new Date().toISOString()
      });
    } else {
      setAdminUser(null);
    }
    
    // Seed high-quality simulated records so components render beautifully
    setVehicles([
      {
        id: "demo-porsche",
        title: "Porsche 911 GT3 RS",
        make: "Porsche",
        model: "911 GT3 RS",
        year: 2023,
        mileage: 1850,
        price: 275000,
        location: "Miami Sovereign Yard",
        description: "Repossessed high-performance collector assets. Liquidating under liquidation license protocol guidelines catalog with carbon ceramic brakes pack.",
        status: "AVAILABLE",
        videoUrl: "",
        ctaLink: "",
        ctaText: "",
        images: ["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800"],
        createdAt: new Date().toISOString()
      },
      {
        id: "demo-audi",
        title: "Audi R8 V10 Plus",
        make: "Audi",
        model: "R8 V10 Plus",
        year: 2021,
        mileage: 8400,
        price: 189000,
        location: "Tampa Secured Yard",
        description: "Certified bank repossessed asset from collateral asset recovery division. Naturally aspirated V10 performance coupe with original catalog.",
        status: "AVAILABLE",
        videoUrl: "",
        ctaLink: "",
        ctaText: "",
        images: ["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800"],
        createdAt: new Date().toISOString()
      },
      {
        id: "demo-corvette",
        title: "Chevrolet Corvette Z06",
        make: "Chevrolet",
        model: "Corvette Z06",
        year: 2023,
        mileage: 1200,
        price: 115000,
        location: "Miami Sovereign Yard",
        description: "Liquidator collateral deal on high performance muscle asset, under strict legal compliance. Mint condition, clean recovery documentation.",
        status: "AVAILABLE",
        videoUrl: "",
        ctaLink: "",
        ctaText: "",
        images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"],
        createdAt: new Date().toISOString()
      },
      {
        id: "demo-mustang",
        title: "Ford Mustang Shelby GT500",
        make: "Ford",
        model: "Mustang Shelby GT500",
        year: 2022,
        mileage: 4500,
        price: 89000,
        location: "Tallahassee Repo Lot",
        description: "Lender collateral foreclosure default asset. Supercharged V8 performance with dynamic launch specs package.",
        status: "AVAILABLE",
        videoUrl: "",
        ctaLink: "",
        ctaText: "",
        images: ["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800"],
        createdAt: new Date().toISOString()
      }
    ]);

    setBlogPosts([
      {
        id: "demo-b1",
        title: "Understanding Foreclosed Car Markets & Collateral Auctions",
        slug: "understanding-foreclosed-car-markets",
        content: "Collateral recovery is the core practice of reclaiming financial assets after loan default events. Repo auctions offer unique opportunities to secure high equity luxury vehicles at deep discounts. When banks are forced to liquidate, speed is valued over peak margins.",
        featuredImage: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
        category: "Liquidations",
        seoTitle: "Understanding Foreclosed Car Markets & Collateral Auctions",
        metaDescription: "Guide on bank repossession liquidations and asset recovery procedures.",
        createdAt: new Date().toISOString()
      },
      {
        id: "demo-b2",
        title: "Top 5 Repossessed Vehicles to Target for Maximum Equity",
        slug: "top-repossessed-vehicles-maximum-equity",
        content: "Luxury sports cars like the Porsche 911 GT3 and muscle cars represent the highest equity margins because their resale price remains extremely resilient in the secondary markets.",
        featuredImage: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800",
        category: "Market Reports",
        seoTitle: "Top 5 Repossessed Vehicles to Target for Maximum Equity",
        metaDescription: "Analysis of the strongest-performing sports car liquidation valuations.",
        createdAt: new Date().toISOString()
      }
    ]);
  };

  // Listen to hash routes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/vehicle/')) {
        const id = hash.replace('#/vehicle/', '');
        setCurrentRoute({ path: 'vehicle', id });
        setActiveImageIndex(0); // Reset gallery focus
        window.scrollTo(0, 0);
      } else if (hash.startsWith('#/blog/')) {
        const slug = hash.replace('#/blog/', '');
        setCurrentRoute({ path: 'blog', slug });
        window.scrollTo(0, 0);
      } else if (hash === '#/blog') {
        setCurrentRoute({ path: 'blog' });
        window.scrollTo(0, 0);
      } else if (hash === '#/car-grid') {
        setCurrentRoute({ path: 'car-grid' });
        window.scrollTo(0, 0);
      } else if (hash === '#/about') {
        setCurrentRoute({ path: 'about' });
        window.scrollTo(0, 0);
      } else if (hash === '#/admin') {
        setCurrentRoute({ path: 'admin' });
        window.scrollTo(0, 0);
      } else {
        setCurrentRoute({ path: 'home' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // trigger trigger

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Helper to run promises with a timeout
  const withTimeout = async (promise: Promise<any>, timeoutMs: number = 2000): Promise<any> => {
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Database connection timed out"));
      }, timeoutMs);
    });
    try {
      const result = await Promise.race([promise, timeoutPromise]);
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Sync data on startup
  const fetchAllData = async () => {
    if (useBypassMode) {
      handleLoadSimulatedClientMode();
      return;
    }
    try {
      setAppError(null);
      
      // 1. Fetch Company Settings
      const { data: sData, error: sErr } = await withTimeout(
        supabase
          .from('settings')
          .select('*')
          .eq('id', 'global_settings')
          .maybeSingle(),
        2000
      );
        
      if (sData) {
        setSettings({
          companyName: sData.company_name,
          phone: sData.phone,
          whatsapp: sData.whatsapp,
          email: sData.email,
          address: sData.address,
          logoUrl: sData.logo_url || undefined,
          socialLinks: sData.social_links || {},
          footerContent: sData.footer_content || undefined
        });
      } else {
        // Seed default settings row if it's completely missing in DB
        await withTimeout(
          supabase.from('settings').insert({
            id: 'global_settings',
            company_name: 'Foreclosed Auto Deals',
            whatsapp: 'https://wa.me/15555550199',
            phone: '+1 (555) 555-0199',
            email: 'assets@foreclosedautodeals.com',
            address: '4420 Sovereign Way, Suite 100, Miami, FL 33130',
            social_links: {
              facebook: 'https://facebook.com',
              instagram: 'https://instagram.com',
              twitter: 'https://twitter.com',
              youtube: 'https://youtube.com'
            }
          }),
          2000
        );
      }

      // 2. Fetch Vehicles & nested images
      const { data: vData, error: vErr } = await withTimeout(
        supabase
          .from('vehicles')
          .select('*, vehicle_images(*)')
      );

      if (vErr) throw vErr;

      const formattedVehicles: Vehicle[] = (vData || []).map((v: any) => {
        const sortedImages = (v.vehicle_images || [])
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((img: any) => img.image_url);

        return {
          id: v.id,
          title: v.title,
          make: v.make,
          model: v.model,
          year: v.year,
          mileage: Number(v.mileage || 0),
          price: Number(v.price || 0),
          location: v.location,
          description: v.description || '',
          status: v.status as VehicleStatus,
          videoUrl: v.video_url || '',
          ctaLink: v.cta_link || '',
          ctaText: v.cta_text || '',
          images: sortedImages.length > 0 ? sortedImages : [v.featured_image].filter(Boolean),
          createdAt: v.created_at
        };
      });
      setVehicles(formattedVehicles);

      // 3. Fetch Blog Posts
      const { data: bData, error: bErr } = await withTimeout(
        supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (bErr) throw bErr;

      const formattedBlogs: BlogPost[] = (bData || []).map((b: any) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        content: b.content,
        featuredImage: b.featured_image || '',
        category: b.category || 'Liquidations',
        seoTitle: b.seo_title || b.title,
        metaDescription: b.meta_description || '',
        createdAt: b.created_at
      }));
      setBlogPosts(formattedBlogs);

      // 4. Resolve Active Session
      const { data: { session } } = await withTimeout(supabase.auth.getSession());
      if (session?.user) {
        const { data: adminData } = await withTimeout(
          supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
        );

        if (adminData) {
          setAdminUser({
            id: adminData.id,
            name: adminData.name || adminData.email.split('@')[0],
            email: adminData.email,
            createdAt: adminData.created_at
          });
          setToken(session.access_token);
        } else {
          setAdminUser(null);
          setToken(null);
        }
      } else {
        setAdminUser(null);
        setToken(null);
      }

    } catch (err: any) {
      console.warn("Supabase connection issue detected. Automatically falling back to secure simulated demo mode.", err);
      handleLoadSimulatedClientMode();
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token, useBypassMode]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setToken(session.access_token);
        localStorage.setItem('admin_token', session.access_token);
      } else {
        setToken(null);
        setAdminUser(null);
        localStorage.removeItem('admin_token');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle successful login
  const handleLoginSuccess = (newToken: string, newAdmin: Admin) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setAdminUser(newAdmin);
    fetchAllData();
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdminUser(null);
    window.location.hash = '#/';
  };

  // Settings updating
  const handleUpdateSettings = async (newSettings: Settings): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          company_name: newSettings.companyName,
          phone: newSettings.phone,
          whatsapp: newSettings.whatsapp,
          email: newSettings.email,
          address: newSettings.address,
          logo_url: newSettings.logoUrl,
          social_links: newSettings.socialLinks,
          footer_content: newSettings.footerContent
        })
        .eq('id', 'global_settings');

      if (error) throw error;
      await fetchAllData();
      return true;
    } catch (e) {
      console.error('Error updating settings in Supabase:', e);
    }
    return false;
  };

  // Vehicles CRUD wrappers
  const handleAddVehicle = async (v: Omit<Vehicle, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      // 1. Insert into vehicles table
      const { data: vData, error: vErr } = await supabase
        .from('vehicles')
        .insert({
          title: v.title,
          make: v.make,
          model: v.model,
          year: v.year,
          mileage: v.mileage,
          price: v.price,
          location: v.location,
          description: v.description,
          status: v.status,
          featured_image: v.images[0] || '',
          video_url: v.videoUrl,
          cta_link: v.ctaLink,
          cta_text: v.ctaText
        })
        .select()
        .single();

      if (vErr) throw vErr;
      const vehicleId = vData.id;

      // 2. Insert into vehicle_images table
      if (v.images && v.images.length > 0) {
        const imageRows = v.images.map((url, index) => ({
          vehicle_id: vehicleId,
          image_url: url,
          sort_order: index
        }));
        const { error: imgErr } = await supabase
          .from('vehicle_images')
          .insert(imageRows);
        if (imgErr) throw imgErr;
      }

      await fetchAllData();
      return true;
    } catch (e) {
      console.error('Error adding vehicle to Supabase:', e);
    }
    return false;
  };

  const handleUpdateVehicle = async (id: string, v: Partial<Vehicle>): Promise<boolean> => {
    try {
      // 1. Update general vehicle properties
      const updatePayload: any = {};
      if (v.title !== undefined) updatePayload.title = v.title;
      if (v.make !== undefined) updatePayload.make = v.make;
      if (v.model !== undefined) updatePayload.model = v.model;
      if (v.year !== undefined) updatePayload.year = v.year;
      if (v.mileage !== undefined) updatePayload.mileage = v.mileage;
      if (v.price !== undefined) updatePayload.price = v.price;
      if (v.location !== undefined) updatePayload.location = v.location;
      if (v.description !== undefined) updatePayload.description = v.description;
      if (v.status !== undefined) updatePayload.status = v.status;
      if (v.videoUrl !== undefined) updatePayload.video_url = v.videoUrl;
      if (v.ctaLink !== undefined) updatePayload.cta_link = v.ctaLink;
      if (v.ctaText !== undefined) updatePayload.cta_text = v.ctaText;
      if (v.images && v.images.length > 0) {
        updatePayload.featured_image = v.images[0];
      }

      const { error: vErr } = await supabase
        .from('vehicles')
        .update(updatePayload)
        .eq('id', id);

      if (vErr) throw vErr;

      // 2. Manage images in vehicle_images table
      if (v.images && v.images.length >= 0) {
        const { error: deleteErr } = await supabase
          .from('vehicle_images')
          .delete()
          .eq('vehicle_id', id);
        
        if (deleteErr) throw deleteErr;

        if (v.images.length > 0) {
          const imageRows = v.images.map((url, index) => ({
            vehicle_id: id,
            image_url: url,
            sort_order: index
          }));
          const { error: insertErr } = await supabase
            .from('vehicle_images')
            .insert(imageRows);
          if (insertErr) throw insertErr;
        }
      }

      await fetchAllData();
      return true;
    } catch (e) {
      console.error('Error updating vehicle in Supabase:', e);
    }
    return false;
  };

  const handleDeleteVehicle = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAllData();
      return true;
    } catch (e) {
      console.error('Error deleting vehicle from Supabase:', e);
    }
    return false;
  };

  // Blogs CRUD wrappers
  const handleAddBlogPost = async (p: Omit<BlogPost, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: p.title,
          slug: p.slug,
          content: p.content,
          featured_image: p.featuredImage,
          category: p.category,
          seo_title: p.seoTitle,
          meta_description: p.metaDescription
        });

      if (error) throw error;
      await fetchAllData();
      return true;
    } catch (e) {
      console.error('Error adding blog post to Supabase:', e);
    }
    return false;
  };

  const handleUpdateBlogPost = async (id: string, p: Partial<BlogPost>): Promise<boolean> => {
    try {
      const updatePayload: any = {};
      if (p.title !== undefined) updatePayload.title = p.title;
      if (p.slug !== undefined) updatePayload.slug = p.slug;
      if (p.content !== undefined) updatePayload.content = p.content;
      if (p.featuredImage !== undefined) updatePayload.featured_image = p.featuredImage;
      if (p.category !== undefined) updatePayload.category = p.category;
      if (p.seoTitle !== undefined) updatePayload.seo_title = p.seoTitle;
      if (p.metaDescription !== undefined) updatePayload.meta_description = p.metaDescription;

      const { error } = await supabase
        .from('blog_posts')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
      await fetchAllData();
      return true;
    } catch (e) {
      console.error('Error updating blog post in Supabase:', e);
    }
    return false;
  };

  const handleDeleteBlogPost = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAllData();
      return true;
    } catch (e) {
      console.error('Error deleting blog post from Supabase:', e);
    }
    return false;
  };

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Render Custom Content formatting helper (no external markdown reader dependency)
  const renderFormattedBlogContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={index} className="font-display font-bold text-xl sm:text-2xl text-white pt-6 pb-2 tracking-tight leading-tight">
            {trimmed.substring(4)}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={index} className="font-display font-semibold text-lg text-gold-400 pt-4 pb-2 tracking-tight">
            {trimmed.substring(5)}
          </h4>
        );
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <ul key={index} className="list-disc pl-5 my-2 text-gray-400 space-y-1 text-sm sm:text-base leading-relaxed">
            <li>{trimmed.substring(2)}</li>
          </ul>
        );
      } else if (trimmed === '') {
        return <div key={index} className="h-4" />;
      } else {
        return (
          <p key={index} className="text-gray-300 font-sans text-sm sm:text-base leading-relaxed mb-4 text-justify">
            {trimmed}
          </p>
        );
      }
    });
  };

  // Render loading state
  if (appLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg shadow-gold-500/10">
            <Car className="w-6 h-6 text-black animate-pulse" />
          </div>
          <div>
            <span className="font-display font-extrabold text-slate-900 text-lg tracking-tight block">Foreclosed Auto Deals</span>
            <span className="text-[10px] font-mono text-gold-600 uppercase tracking-widest block mt-1 font-semibold">
              Synchronizing Asset Ledgers...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render major Error block
  if (appError) {
    return (
      <div className="min-h-screen bg-slate-55 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-xl" id="db-error-panel">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200 mx-auto">
              <AlertCircle className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-slate-900 tracking-tight">Database Connection Pending</h2>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
                Unable to query your cloud database nodes. This is common when configuration parameters are missing or incorrect.
              </p>
            </div>
          </div>

          {/* Diagnostics Error Alert Section */}
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-left space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              <span>Exception Log / Error Signature</span>
            </div>
            <p className="text-[11px] font-mono text-slate-650 bg-white border border-slate-200 rounded-lg p-2.5 break-all max-h-24 overflow-y-auto">
              {appError === "TypeError: Failed to fetch" 
                ? "TypeError: Failed to fetch (Likely missing or empty VITE_SUPABASE_URL)" 
                : appError}
            </p>
          </div>

          {/* Simple Step-by-step developer tutorial */}
          <div className="space-y-3 pt-1 text-left">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
              🔧 Quick Integration Guide:
            </span>
            <ul className="text-xs text-slate-600 space-y-2.5 list-none pl-0">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-100 border border-gold-300 text-gold-700 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">1</span>
                <div>
                  <strong className="text-slate-850">Establish Supabase Database</strong>: Visit your Supabase workspace, register a project, and fetch your API URL & Anon Key under Project Settings.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-100 border border-gold-300 text-gold-700 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">2</span>
                <div>
                  <strong className="text-slate-850">Assign Platform Secrets</strong>: Open <strong className="text-slate-850 border-b border-dashed border-slate-400">Settings</strong> inside the Google AI Studio top-bar panel, find the secrets menu, and supply the value for:
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <span className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-700 truncate">VITE_SUPABASE_URL</span>
                    <span className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-700 truncate">VITE_SUPABASE_ANON_KEY</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-100 border border-gold-300 text-gold-700 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">3</span>
                <div>
                  <strong className="text-slate-850">Run Bootstrapping SQL</strong>: Copy and run the <strong className="text-slate-850 border-b border-dashed border-slate-400">/supabase_cars_schema.sql</strong> file inside Supabase's SQL Editor command window.
                </div>
              </li>
            </ul>
          </div>

          {/* Action Footer bar */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-150">
            <button
              onClick={() => { setAppLoading(true); fetchAllData(); }}
              className="w-full bg-slate-900 shadow-sm hover:bg-slate-850 text-white px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-check Link
            </button>
            <button
              onClick={handleLoadSimulatedClientMode}
              className="w-full bg-[#f8f9fa] border border-slate-205 hover:bg-slate-100 hover:border-slate-350 text-slate-700 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Bypass / Demo Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Common distinct makes list for filtration
  const selectUniqueMakes: string[] = ['ALL', ...vehicles.map((v) => v.make).filter((item, idx, self) => self.indexOf(item) === idx)];

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans leading-normal overflow-x-hidden antialiased">
      {/* Structural sticky navigation header */}
      <Header
        currentPath={currentRoute.path}
        navigateTo={navigateTo}
        isAdmin={!!adminUser}
        onLogout={handleLogout}
        companyName={settings.companyName}
        companyPhone={settings.phone}
        logoUrl={settings.logoUrl}
      />

      {/* ========================================================= */}
      {/* ======================= HOME VIEW ======================= */}
      {/* ========================================================= */}
      {currentRoute.path === 'home' && (
        <main className="flex-grow">
          {/* Immersive Static Hero banner with explicit text blur background */}
          <section id="hero-showcase" className="relative min-h-[85vh] flex items-center pt-24 pb-12 overflow-hidden bg-white">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 bg-slate-50">
              <img
                src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=2000"
                alt="Repossessed luxury Porsche coupe dashboard and silhouette"
                className="w-full h-full object-cover opacity-20 object-center scale-102 filter blur-[1px] brightness-125 scale-x-[-1]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold-300 px-3.5 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-gold-600 uppercase">
                    Immediate Asset Liquidations
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.1]">
                  Discounted Vehicles <span className="text-gold-600">Don't Stay</span> Available For Long
                </h1>

                <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed font-sans max-w-2xl">
                  Browse verified repossessed and foreclosed vehicles offered below market value. Every listing is updated in real time and availability changes quickly. Miss today's deal, pay more tomorrow.
                </p>

                {/* Simulated trust items banner (No Button as requested!) */}
                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
                  {[
                    { label: "Bank Repossessions", sub: "Verified Sourcing" },
                    { label: "Deep Value", sub: "Below Market Prices" },
                    { label: "Locked Listings", sub: "100% Secure Admin" },
                    { label: "Fast Title Signoff", sub: "Immediate Transfer" }
                  ].map((item, i) => (
                    <div key={i} className="border-l border-gold-500/45 pl-4 py-1">
                      <span className="text-xs font-mono text-gold-600 font-bold block uppercase tracking-wide leading-none">{item.label}</span>
                      <span className="text-[10px] text-slate-500 font-sans block mt-1">{item.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Real-time Ticker banner */}
          <section id="real-time-ticker" className="bg-white border-y border-slate-200 py-4 overflow-hidden relative shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-xs text-slate-600 uppercase tracking-widest font-medium">
                  Ledger Alert: <span className="text-slate-900 font-bold">{vehicles.filter(v => v.status === 'ACTIVE').length} Active</span> repossessed listings staged for clearing this hour.
                </span>
              </div>
              <span className="text-[10px] font-mono text-gold-600 uppercase tracking-widest bg-gold-50 border border-gold-300 px-3 py-1 rounded-full font-bold">
                PRICES SUBJECT TO HOURLY RE-LIQUIDATION
              </span>
            </div>
          </section>

          {/* Featured Listings Section */}
          <section id="listings-section" className="py-20 bg-[#f8f9fa]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              
              {/* Header block with count metrics */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
                <div>
                  <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-800 tracking-tight">
                    Verified Repo Repositories
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-sans leading-relaxed">
                    Sourced exclusively from commercial auctions, debtor reclamation claims, and private bank releases.
                  </p>
                </div>

                <div className="text-xs font-mono text-slate-500 uppercase">
                  ACTIVE LEDGER STATIONS: <span className="text-gold-600 font-bold">{vehicles.length} VEHICLES TOTAL</span>
                </div>
              </div>

              {/* Dynamic Filter Controls Panel */}
              <div id="filter-bar" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                {/* Search query box */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Search Models</label>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="e.g. Mercedes, Porsche Coupe..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                {/* Make selector dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Manufacturer</label>
                  <select
                    value={makeFilter}
                    onChange={(e) => setMakeFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-gold-500"
                  >
                    {selectUniqueMakes.map((m, idx) => (
                      <option key={idx} value={m} className="bg-white text-slate-800">{m === 'ALL' ? 'ALL MANUFACTURERS' : m.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Pricing limit slider */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 flex justify-between block uppercase">
                    <span>Pricing ceiling</span>
                    <span className="text-gold-600 font-bold">${priceMaxFilter.toLocaleString()}</span>
                  </label>
                  <div className="pt-2">
                    <input
                      type="range"
                      min={10000}
                      max={150000}
                      step={5000}
                      value={priceMaxFilter}
                      onChange={(e) => setPriceMaxFilter(Number(e.target.value))}
                      className="w-full accent-gold-500 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Staged status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Listing status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-gold-500"
                  >
                    <option value="ALL" className="bg-white text-slate-800">ALL PORTFOLIOS</option>
                    <option value="ACTIVE" className="bg-white text-slate-800">ACTIVE STAGING</option>
                    <option value="ALMOST_SOLD" className="bg-white text-slate-800">ALMOST SOLD (URGENT)</option>
                    <option value="JUST_SOLD" className="bg-white text-slate-800">JUST SOLD (LOCKOUT)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Vehicle Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles
                  .filter((v) => {
                    // Search matches Name, model, location
                    const searchStr = `${v.title} ${v.make} ${v.model} ${v.location}`.toLowerCase();
                    const matchesSearch = searchStr.includes(searchFilter.toLowerCase());

                    const matchesMake = makeFilter === 'ALL' || v.make.toLowerCase() === makeFilter.toLowerCase();
                    const matchesPrice = v.price <= priceMaxFilter;
                    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

                    return matchesSearch && matchesMake && matchesPrice && matchesStatus;
                  })
                  .map((vehicle, index) => {
                    return (
                      <ScrollReveal key={vehicle.id} delay={(index % 3) * 60}>
                        <div
                          id={`vehicle-card-wrapper-${vehicle.id}`}
                          onClick={() => navigateTo(`#/vehicle/${vehicle.id}`)}
                          className="group bg-white border border-slate-200 hover:border-gold-500/20 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer relative"
                        >
                          {/* Status Badge options: JUST SOLD & ALMOST SOLD */}
                          {vehicle.status !== 'ACTIVE' && (
                            <div className="absolute top-4 left-4 z-20">
                              <span className={`inline-block text-[9px] font-mono uppercase tracking-[0.15em] font-extrabold px-3 py-1.5 rounded-lg shadow-lg ${
                                vehicle.status === 'JUST_SOLD'
                                  ? 'bg-red-600 text-white border border-red-500/30'
                                  : 'bg-amber-500 text-black border border-amber-400/30'
                              }`}>
                                {vehicle.status === 'JUST_SOLD' ? 'JUST SOLD' : 'ALMOST SOLD'}
                              </span>
                            </div>
                          )}

                          {/* Staged gallery snapshot */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                            <img
                              src={vehicle.images[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'}
                              alt={vehicle.title}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-90" />
                            
                            {/* Sourcing identifier */}
                            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 border border-slate-100 px-2.5 py-1 rounded text-[10px] font-mono text-slate-700 shadow-sm">
                              <MapPin className="w-3 h-3 text-gold-650" />
                              <span>{vehicle.location}</span>
                            </div>
                          </div>

                          {/* Particulars */}
                          <div className="p-6 space-y-4">
                            <div className="space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-display font-semibold text-lg text-slate-800 group-hover:text-gold-600 transition-colors tracking-tight line-clamp-1">
                                  {vehicle.title}
                                </h3>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                                Year: {vehicle.year} • Certified Mileage: {vehicle.mileage.toLocaleString()} mi
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                              <div>
                                  <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">PREVAILING CLEARING COST</span>
                                <span className="text-xl font-mono font-bold text-gold-600">${vehicle.price.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest group-hover:text-gold-600 transition-all">
                                <span>AUDIT ASSET</span>
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                {vehicles.length === 0 && (
                  <div className="col-span-full text-center py-20 border border-slate-200 rounded-3xl bg-white shadow-sm">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-base text-slate-500 font-display">No vehicle portfolios staged currently.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Trust assurances block */}
          <section id="trust-details" className="py-20 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">Institutional Integrity Safeguards</h2>
                <p className="text-slate-600 text-xs sm:text-sm font-sans max-w-md mx-auto leading-relaxed">
                  Every asset clearance transaction is backed by stringent corporate audits, legal documentation trails, and physical release certification.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-8">
                {[
                  {
                    title: "Rigorous 110-Point Technical Certification",
                    desc: "Sourced assets must pass strenuous electronic and physical checklists before listing clearance. We document structural parameters, electrical harnesses, powertrain integrity, and cosmetic alignment.",
                    icon: ShieldCheck
                  },
                  {
                    title: "Corporate Debt Settlement Transparency",
                    desc: "Our vehicles come entirely pre-cleared of outstanding auto loan default structures, bank lien declarations, and legal hold coordinates. Clean, unencumbered title releases are synchronized instantly.",
                    icon: Award
                  },
                  {
                    title: "Escrow-Protected Clearing Procedures",
                    desc: "Ensure complete transaction alignment. Deposits and reserve wire transfers are handled via certified escrow frameworks. If independent inspection fails, commitments are fully refunded.",
                    icon: Zap
                  }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 shadow-sm">
                      <div className="w-10 h-10 bg-gold-50 border border-gold-300 rounded-xl flex items-center justify-center text-gold-600">
                        <Icon className="w-5 h-5 animate-pulse" />
                      </div>
                      <h4 className="font-display font-bold text-base text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================= */}
      {/* ======================== BLOG VIEW ====================== */}
      {/* ========================================================= */}
      {currentRoute.path === 'blog' && (
        <main className="flex-grow pt-24 bg-[#f8f9fa]">
          {!currentRoute.slug ? (
            /* BLOG LIST VIEW */
            <section id="blog-search-listings" className="py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                  <div>
                    <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">The Scribe Car Blog</h1>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed mt-1">
                      Professional guides, reclamation mechanics analysis, and educational resources for sourcing discounted automotive assets.
                    </p>
                  </div>
                  
                  {/* Category Pills and Search box */}
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      placeholder="Search articles..."
                      className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-gold-500 font-mono w-56 shadow-sm"
                    />
                  </div>
                </div>

                {/* Staggered Grid list of Blog Articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogPosts
                    .filter(post => {
                      const textToMatch = `${post.title} ${post.category} ${post.content}`.toLowerCase();
                      const matchesSearch = textToMatch.includes(blogSearch.toLowerCase());
                      const matchesCategory = blogCategoryFilter === 'ALL' || post.category === blogCategoryFilter;
                      return matchesSearch && matchesCategory;
                    })
                    .map((post) => (
                      <BlogCard
                        key={post.id}
                        post={post}
                        onClick={(slug) => navigateTo(`#/blog/${slug}`)}
                      />
                    ))}
                  {blogPosts.length === 0 && (
                    <div className="col-span-full text-center py-20 border border-slate-200 rounded-3xl bg-white shadow-sm">
                      <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-base text-slate-500 font-display">No articles published yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : (
            /* BLOG ARTICLE DETAIL VIEW */
            (() => {
              const post = blogPosts.find(p => p.slug === currentRoute.slug);
              if (!post) {
                return (
                  <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-gold-500 mx-auto" />
                    <h2 className="font-display font-bold text-xl text-slate-900">Article Not Located</h2>
                    <button onClick={() => navigateTo('#/blog')} className="text-xs font-mono text-gold-600 hover:underline">
                      Return to Articles
                    </button>
                  </div>
                );
              }

              // Filter out current post for related posts
              const related = blogPosts.filter(p => p.id !== post.id).slice(0, 2);

              return (
                <section id="blog-article-detail" className="py-12">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Return link */}
                    <button
                      onClick={() => navigateTo('#/blog')}
                      className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-900 group transition-colors cursor-pointer uppercase font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                      Back to blog
                    </button>

                    {/* Header Details */}
                    <div className="space-y-4">
                      <div className="inline-block bg-[#f0f4f8] border border-slate-200 px-2.5 py-1 rounded-full text-gold-600 font-mono text-[9px] uppercase tracking-widest leading-none font-bold">
                        {post.category}
                      </div>

                      <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-slate-900 tracking-tight leading-snug">
                        {post.title}
                      </h1>

                      {/* Reading variables */}
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-500 border-b border-slate-200 pb-6">
                        <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span className="w-1.5 h-1.5 bg-gold-400/30 rounded-full" />
                        <span>Sourced: Clearing Scribe Office</span>
                      </div>
                    </div>

                    {/* Featured Image */}
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Main content split */}
                    <div className="grid md:grid-cols-4 gap-8">
                      {/* Left: sharing utilities */}
                      <div className="md:col-span-1 space-y-6 pt-4 md:sticky md:top-28 h-fit">
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 text-center sm:text-left shadow-sm">
                          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Share Asset Guide</span>
                          
                          <div className="flex justify-center sm:justify-start gap-3">
                            {/* Copy URL trigger */}
                            <button
                              onClick={copyUrlToClipboard}
                              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                                copiedLink
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:text-gold-600 hover:bg-gold-50 hover:border-gold-300'
                              }`}
                              title="Copy URL"
                            >
                              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>

                            {/* Share widgets */}
                            <a
                              href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-full bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 border border-slate-100 transition"
                              title="Share on Facebook"
                            >
                              <Facebook className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-full bg-slate-50 text-slate-600 hover:text-sky-600 hover:bg-sky-50/50 hover:border-sky-200 border border-slate-100 transition"
                              title="Share on Twitter"
                            >
                              <Twitter className="w-4 h-4" />
                            </a>
                            <a
                              href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}`}
                              className="p-2.5 rounded-full bg-slate-50 text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 hover:border-amber-200 border border-slate-100 transition"
                              title="Email link"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Right: article content */}
                      <div className="md:col-span-3 prose prose-slate prose-gold max-w-none">
                        <div id={`blog-article-content-${post.id}`} className="space-y-4">
                          {renderFormattedBlogContent(post.content)}
                        </div>
                      </div>
                    </div>

                    {/* Related Posts */}
                    {related.length > 0 && (
                      <div className="border-t border-slate-200 pt-12 mt-16 space-y-6">
                        <h3 className="font-display font-bold text-xl text-slate-900">Recommended Asset Scribes</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                          {related.map(p => (
                            <BlogCard
                              key={p.id}
                              post={p}
                              onClick={(slug) => navigateTo(`#/blog/${slug}`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })()
          )}
        </main>
      )}

      {/* ========================================================= */}
      {/* ======================= CARS GRID VIEW ================== */}
      {/* ========================================================= */}
      {currentRoute.path === 'car-grid' && (
        <main className="flex-grow pt-28 bg-[#f8f9fa]">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <CarListingsGrid />
          </section>
        </main>
      )}

      {/* ========================================================= */}
      {/* ======================= ABOUT US VIEW =================== */}
      {/* ========================================================= */}
      {currentRoute.path === 'about' && (
        <main className="flex-grow pt-24 bg-[#f8f9fa]">
          {/* Hero details */}
          <section id="about-hero" className="py-16 sm:py-24 relative overflow-hidden bg-white border-b border-slate-200">
            <div className="absolute inset-0 z-0 opacity-15">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format"
                alt=""
                className="w-full h-full object-cover filter blur-[2px]"
              />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
              <span className="text-[10px] font-mono tracking-[0.25em] text-gold-650 uppercase font-bold bg-gold-50 border border-gold-300 px-3 py-1.5 rounded-full inline-block">
                Giving Great Vehicles a Second Chance
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-snug">
                Verified Asset Reclamation & Quick Liquidation Experts
              </h1>
              <p className="text-slate-600 font-sans text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                We bridge the gap between institutional debtor recovery and premium retail buyers, specializing in the rapid liquidation of high-end, bank-foreclosed, and repossessed luxury automobiles.
              </p>
            </div>
          </section>

          {/* Strategic stats section */}
          <section id="about-stats" className="py-12 bg-slate-100 relative border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Assets Cleared", value: `${localStorage.getItem('stat_v_sold') || '340'}+` },
                  { label: "Satisfied Buyers", value: `${localStorage.getItem('stat_h_buyers') || '325'}+` },
                  { label: "Recovery Experience", value: `${localStorage.getItem('stat_y_exp') || '14'} Yrs` },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-2xl sm:text-4xl font-display font-extrabold text-gold-600 block tracking-tight">{stat.value}</span>
                    <span className="text-[9px] sm:text-xs font-mono uppercase text-slate-500 tracking-wider block font-bold">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Core Content - why buy from us, process */}
          <section id="about-why-us" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            {/* Why buy details */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight">Why Settle Transactions With Us</h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans">
                  Unlike traditional used car brokers, we do not markup vehicles based on emotional marketing structures. Our business framework is built purely on administrative speed and speed-to-liquidate. Lenders desire asset recovery, and we operate as the clearing node.
                </p>
                
                <div className="space-y-3 pt-2">
                  {[
                    "Strenuous title risk audit (100% lien cleared)",
                    "Substantial market price discounts (no intermediate markup)",
                    "Comprehensive structural and electrical diagnostics",
                    "Immediate legal release signature & transfer"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex gap-3 text-xs sm:text-sm text-slate-700 font-sans items-center">
                      <span className="text-gold-600 font-bold font-mono">✔️</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aspect-[16/10] bg-[#f8f9fa] border border-slate-200 rounded-2xl overflow-hidden relative shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format"
                  alt=""
                  className="w-full h-full object-cover scale-102 filter brightness-95"
                />
              </div>
            </div>

            {/* How our process works roadmap */}
            <div id="process-blueprint" className="space-y-10 border-t border-slate-200 pt-16">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight">Efficient Acquisition Steps</h2>
                <p className="text-slate-500 text-xs sm:text-sm font-sans">Our clearance process is designed to be lean, fast, and secure.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: "01",
                    title: "Identify Potential Asset",
                    desc: "Analyze listings for available Porsche Coupe, AMG GT, or Audi RS wagons, reviewing mechanical status logs."
                  },
                  {
                    step: "02",
                    title: "Transmit Direct Inquiry",
                    desc: "Coordinate immediately via WhatsApp or direct liaison call to confirm prevailing clearing availability."
                  },
                  {
                    step: "03",
                    title: "Secure Verification Deposit",
                    desc: "Post a 10% refundable hold deposit to lock listing priority while arranging physical vehicle audit."
                  },
                  {
                    step: "04",
                    title: "Execute Signoff & Release",
                    desc: "Settle balance via cashier bank wire, sign default court release deeds, and take possession of vehicle."
                  }
                ].map((p, ix) => (
                  <div key={ix} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 relative overflow-hidden group shadow-sm">
                    <span className="absolute top-2 right-4 font-display font-extrabold text-[#00000003] text-7xl group-hover:text-gold-600/[0.04] transition-colors">{p.step}</span>
                    <span className="text-gold-600 font-mono text-xs font-bold block">{p.step}.</span>
                    <h4 className="font-display font-extrabold text-base text-slate-800 tracking-tight">{p.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ segment */}
            <div id="about-faqs" className="border-t border-slate-200 pt-16 space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight">Frequently Answered Queries</h2>
                <p className="text-slate-500 text-xs sm:text-sm">Critical legal and logistics information for prospective purchasers.</p>
              </div>
              <FAQ />
            </div>
          </section>
        </main>
      )}

      {/* ========================================================= */}
      {/* ======================= DETAIL VIEW ===================== */}
      {/* ========================================================= */}
      {currentRoute.path === 'vehicle' && (
        (() => {
          const vehicle = vehicles.find((v) => v.id === currentRoute.id);
          if (!vehicle) {
            return (
              <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-gold-500 mx-auto" />
                <h2 className="font-display font-bold text-xl text-slate-900">Asset Listing Not Located</h2>
                <button onClick={() => navigateTo('#/')} className="text-xs font-mono text-gold-600 hover:underline">
                  Return to Home
                </button>
              </div>
            );
          }

          // Calculate immediate comparison savings (e.g. 50k below regular retail)
          const estimatedRetailValue = Math.round(vehicle.price * 1.32);
          const equityProfit = estimatedRetailValue - vehicle.price;

          return (
            <main className="flex-grow pt-24 bg-[#f8f9fa]">
              <section id="vehicle-particulars" className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  {/* Return navigations */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <button
                      onClick={() => navigateTo('#/')}
                      className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-900 group uppercase font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                      Back to listings
                    </button>

                    {/* Quick timestamp staging */}
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                      Asset Added: {new Date(vehicle.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Title and Badge row */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-block text-[9px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-lg border font-bold ${
                        vehicle.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : vehicle.status === 'ALMOST_SOLD'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                      {vehicle.title}
                    </h1>
                  </div>

                  {/* Split Image and Specifications layout */}
                  <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left: Gallery pictures */}
                    <div className="lg:col-span-3 space-y-4">
                      {/* Big Main Active View */}
                      <div className="aspect-[16/10] bg-slate-150 rounded-2xl overflow-hidden border border-slate-200 relative shadow-sm">
                        <img
                          src={vehicle.images[activeImageIndex] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70'}
                          alt={vehicle.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-all"
                        />
                      </div>

                      {/* Thumbnails rail (If multi image) */}
                      {vehicle.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {vehicle.images.map((imgUrl, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveImageIndex(index)}
                              className={`w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden bg-white border transition-all ${
                                activeImageIndex === index
                                  ? 'border-gold-500 opacity-100 shadow-md shadow-gold-500/20'
                                  : 'border-slate-200 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Direct Pricing Box & CTA action points */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg space-y-6">
                        
                        {/* High Convert price highlights with direct instant equity estimations */}
                        <div className="space-y-1 border-b border-slate-100 pb-4.5">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                            RECOVERY CLEARING SETTLEMENT:
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-mono font-bold text-gold-600">
                              ${vehicle.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-emerald-600 font-mono font-semibold">
                              (Below Market)
                            </span>
                          </div>
                          
                          {/* Financial equity builder */}
                          <div className="pt-2 flex justify-between text-[11px] font-mono text-slate-500">
                            <span>Est. Market Retail: ${estimatedRetailValue.toLocaleString()}</span>
                            <span className="text-emerald-600 font-bold">Instant Equity: +${equityProfit.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Staged Location & mileage specifics */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Yard Location</span>
                            <span className="text-slate-800 font-semibold block mt-1">{vehicle.location}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Certified Mileage</span>
                            <span className="text-slate-800 font-semibold block mt-1">{vehicle.mileage.toLocaleString()} mi</span>
                          </div>
                        </div>

                        {/* CTA Priority (Only shown if Status is not JUST_SOLD, otherwise shows lockout template) */}
                        {vehicle.status !== 'JUST_SOLD' ? (
                          <div className="space-y-3 pt-2">
                            {/* Call CTA */}
                            <a
                              href={`tel:${settings.phone}`}
                              className="w-full flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-mono uppercase text-xs tracking-wider py-4.5 rounded-xl border border-slate-200 transition-all font-bold"
                            >
                              <Phone className="w-4 h-4 text-gold-601" />
                              <span>Call Asset Manager</span>
                            </a>

                            {/* WhatsApp link priority */}
                            <a
                              href={vehicle.ctaLink || `https://wa.me/15555550199?text=Inquiry%20regarding%20${encodeURIComponent(vehicle.title)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-semibold uppercase tracking-wider text-xs py-4.5 rounded-xl shadow-lg hover:shadow-gold-500/10 transition-all cursor-pointer"
                            >
                              <MessageCircle className="w-4 h-4 text-black animate-pulse" />
                              <span>{vehicle.ctaText || "Inquire via WhatsApp"}</span>
                            </a>
                            
                            <p className="text-[10px] font-mono text-amber-600 text-center uppercase tracking-wider block mt-1 animate-pulse font-bold">
                              🔥 Reserve hold queue closes upon next verification.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-xl text-center space-y-2">
                            <span className="text-xs font-mono font-bold text-red-650 block uppercase">LOCKOUT: This vehicle has cleared.</span>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                              Sourcing settlement closed. Title assigned to final debtor purchaser on {new Date().toLocaleDateString()}. Register backup queries if deal fails escrow.
                            </p>
                            <a
                              href={`tel:${settings.phone}`}
                              className="inline-block text-xs font-mono text-gold-650 hover:underline pt-1 font-semibold"
                            >
                              Register Backup Inquiry
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Video section + Specifications Bento-Box Grid */}
                  <div className="grid lg:grid-cols-5 gap-8 border-t border-slate-200 pt-12">
                    
                    {/* Specifications and descriptive details */}
                    <div className="lg:col-span-3 space-y-8">
                      <div className="space-y-4">
                        <h3 className="font-display font-bold text-xl text-slate-800">Acquisition & Structural Diagnostics</h3>
                        
                        {/* Technical Specifications Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[
                            { label: "Asset Manufacturer", val: vehicle.make },
                            { label: "Asset Model", val: vehicle.model },
                            { label: "Production Year", val: vehicle.year },
                            { label: "Certified Mileage", val: `${vehicle.mileage.toLocaleString()} mi` },
                            { label: "Seizure Depot", val: vehicle.location },
                            { label: "Prevailing Title", val: "Clean Repo Release" },
                          ].map((spec, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                              <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wide font-bold">{spec.label}</span>
                              <span className="text-slate-800 font-display font-semibold block mt-1.5 text-sm sm:text-base">{spec.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Core description text */}
                      <div className="space-y-4">
                        <h3 className="font-display font-bold text-xl text-slate-800">Asset Description</h3>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans text-justify bg-white p-5 border border-slate-200 rounded-2xl whitespace-pre-line shadow-sm">
                          {vehicle.description || "Foreclosed asset condition passed standard mechanical audit. Title released and ready for ownership reassignment."}
                        </p>
                      </div>
                    </div>

                    {/* YouTube Video Embed Preview Panel */}
                    <div className="lg:col-span-2 space-y-6">
                      {vehicle.videoUrl ? (
                        <div className="space-y-4">
                          <h3 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
                            <Video className="w-5 h-5 text-gold-600 animate-pulse" />
                            Staged Walk-around & Exhaust Accent
                          </h3>
                          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-lg relative">
                            <iframe
                              src={vehicle.videoUrl}
                              title="Staged Walk-around Exhaust Drive Video"
                              className="absolute inset-0 w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3 shadow-sm">
                          <Video className="w-10 h-10 text-slate-400 mx-auto" />
                          <div className="text-sm font-semibold text-slate-600">Walk-around exhaust video is pending.</div>
                          <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-xs mx-auto">
                            The on-field reclamation engineer has pass-checked the exhaust stream, but real-time walkaround recordings are currently only available on-demand via WhatsApp.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </main>
          );
        })()
      )}

      {/* ========================================================= */}
      {/* ======================= ADMIN VIEW ====================== */}
      {/* ========================================================= */}
      {currentRoute.path === 'admin' && (
        <main className="flex-grow">
          <AdminPanel
            token={token}
            onLogin={handleLoginSuccess}
            onLogout={handleLogout}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            vehicles={vehicles}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            blogPosts={blogPosts}
            onAddBlogPost={handleAddBlogPost}
            onUpdateBlogPost={handleUpdateBlogPost}
            onDeleteBlogPost={handleDeleteBlogPost}
          />
        </main>
      )}

      {/* ========================================================= */}
      {/* ======================= FOOTER VIEW ===================== */}
      {/* ========================================================= */}
      <footer id="global-portal-footer" className="bg-[#f0f2f5] border-t border-slate-200 py-16 text-slate-500 text-xs sm:text-sm font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Description brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg">
                  <Car className="w-5 h-5 text-black" />
                </div>
                <span className="font-display font-bold text-slate-800 text-base tracking-tight uppercase">
                  {settings.companyName}
                </span>
              </div>
              <p className="text-slate-650 text-xs leading-relaxed max-w-sm">
                {settings.footerContent || "A licensed collateral reclamation & legal vehicle liquidation enterprise. Sourcing high equity repossessions, foreclosures, and loan default assets since 2012."}
              </p>
              <div className="pt-2 flex items-center gap-1 text-[10px] text-gold-650 uppercase font-mono font-bold tracking-widest">
                <span>SECURED CORE ASSET CLEARING ENGINE</span>
              </div>
            </div>

            {/* Quick routes links */}
            <div className="space-y-4">
              <span className="font-display font-bold text-slate-800 uppercase tracking-wider text-xs block">Portal Sections</span>
              <nav id="footer-routes" className="flex flex-col gap-2.5">
                <button onClick={() => navigateTo('#/')} className="text-left text-slate-550 hover:text-gold-650 transition-colors uppercase font-mono text-[11px] tracking-wide font-semibold">Staged Cars</button>
                <button onClick={() => navigateTo('#/blog')} className="text-left text-slate-550 hover:text-gold-650 transition-colors uppercase font-mono text-[11px] tracking-wide font-semibold">SEO Blog Articles</button>
                <button onClick={() => navigateTo('#/about')} className="text-left text-slate-550 hover:text-gold-650 transition-colors uppercase font-mono text-[11px] tracking-wide font-semibold">Trust & Process</button>
                <button onClick={() => navigateTo('#/admin')} className="text-left text-slate-550 hover:text-gold-650 transition-colors uppercase font-mono text-[11px] tracking-wide font-semibold">Admin Portal</button>
              </nav>
            </div>

            {/* Coordinates */}
            <div className="space-y-4">
              <span className="font-display font-bold text-slate-800 uppercase tracking-wider text-xs block">Liquidation Hub</span>
              <div className="space-y-3 leading-relaxed text-xs text-slate-650">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gold-600" />
                  <span>{settings.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gold-600" />
                  <span>{settings.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>© {new Date().getFullYear()} {settings.companyName}. All rights and ownership titles reserved.</span>
            <div className="flex gap-4">
              <button onClick={() => navigateTo('#/admin')} className="hover:text-gold-600 transition">Secure Admin</button>
              <span>•</span>
              <span>Federal Seizures Clearing Node</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
