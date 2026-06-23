import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchCars, fetchDistinctMakes, FetchCarsFilters } from '../lib/cars';
import { Car as CarType } from '../types';
import { 
  Search, SlidersHorizontal, Sliders, RefreshCw, AlertCircle, 
  MapPin, Gauge, Calendar, DollarSign, ArrowRight, MessageSquare, 
  X, CheckCircle, Info, Tag, Layers, ChevronRight, Bookmark
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CarListingsGrid() {
  // Query Filters & States
  const [cars, setCars] = useState<CarType[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // App UI states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModalCar, setActiveModalCar] = useState<CarType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDemoSeeded, setIsDemoSeeded] = useState<boolean>(false);

  // Load distinct makes & cars
  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    // Dynamic bypass implementation for seamless local evaluation
    const localBypass = sessionStorage.getItem('bypass_supabase') === 'true';
    if (localBypass) {
      const demoCars: CarType[] = [
        { id: '1', make: 'Porsche', model: '911 GT3 RS', year: 2023, price: 275000, mileage: 1850, image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800', created_at: new Date().toISOString() },
        { id: '2', make: 'Audi', model: 'R8 V10 Plus', year: 2021, price: 189000, mileage: 8400, image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800', created_at: new Date().toISOString() },
        { id: '3', make: 'Chevrolet', model: 'Corvette Z06', year: 2023, price: 115000, mileage: 1200, image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800', created_at: new Date().toISOString() },
        { id: '4', make: 'Ford', model: 'Mustang Shelby GT500', year: 2022, price: 89000, mileage: 4500, image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800', created_at: new Date().toISOString() },
        { id: '5', make: 'BMW', model: 'M4 Competition', year: 2022, price: 83500, mileage: 12400, image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800', created_at: new Date().toISOString() },
        { id: '6', make: 'Mercedes-Benz', model: 'AMG GT C', year: 2021, price: 142000, mileage: 6200, image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800', created_at: new Date().toISOString() }
      ];

      const makeFiltered = selectedMake === 'All' ? demoCars : demoCars.filter(c => c.make === selectedMake);
      const priceFiltered = makeFiltered.filter(c => c.price <= maxPrice);

      setCars(priceFiltered);
      setMakes(['Porsche', 'Audi', 'Chevrolet', 'Ford', 'BMW', 'Mercedes-Benz']);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      // 1. Fetch available cars
      const filters: FetchCarsFilters = {
        make: selectedMake === 'All' ? undefined : selectedMake,
        maxPrice: maxPrice,
      };

      const fetchedCars = await fetchCars(filters);
      setCars(fetchedCars);

      // 2. Fetch all unique makes for drop-down population
      const fetchedMakes = await fetchDistinctMakes();
      setMakes(fetchedMakes);

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to connect to the database. Ensure Supabase credentials are set up.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Reload listings when filters are updated
  useEffect(() => {
    loadData();
  }, [selectedMake, maxPrice]);

  // Seed standard assets if table has no records
  const handleSeedMockData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const demoCars = [
        { make: 'Porsche', model: '911 GT3 RS', year: 2023, price: 275000, mileage: 1850, image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800' },
        { make: 'Audi', model: 'R8 V10 Plus', year: 2021, price: 189000, mileage: 8400, image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800' },
        { make: 'Chevrolet', model: 'Corvette Z06', year: 2023, price: 115000, mileage: 1200, image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800' },
        { make: 'Ford', model: 'Mustang Shelby GT500', year: 2022, price: 89000, mileage: 4500, image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800' },
        { make: 'BMW', model: 'M4 Competition', year: 2022, price: 83500, mileage: 12400, image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800' },
        { make: 'Mercedes-Benz', model: 'AMG GT C', year: 2021, price: 142000, mileage: 6200, image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800' }
      ];

      const { error: seedErr } = await supabase
        .from('cars')
        .insert(demoCars);

      if (seedErr) throw seedErr;

      setIsDemoSeeded(true);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Unable to seed diagnostic records. Make sure the SQL table "cars" exists.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter client-side matching search text (on model/make keywords)
  const filteredCars = cars.filter(car => {
    if (!searchTerm) return true;
    const searchString = `${car.make} ${car.model} ${car.year}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Calculate statistics for filter helper
  const totalListings = filteredCars.length;
  const lowestPrice = filteredCars.length > 0 ? Math.min(...filteredCars.map(c => c.price)) : 0;
  const averagePrice = filteredCars.length > 0 ? Math.round(filteredCars.reduce((acc, c) => acc + c.price, 0) / filteredCars.length) : 0;

  return (
    <div className="w-full text-slate-800" id="car-listing-module">
      {/* 1. Header Hero Panel */}
      <div className="relative border border-slate-150 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-8 sm:p-12 mb-8 shadow-sm">
        <div className="absolute right-0 bottom-0 top-0 w-2/3 opacity-30 bg-cover bg-center pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200")' }}></div>
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-gold-500 uppercase tracking-widest bg-gold-500/10 py-1.5 px-3 rounded-full border border-gold-500/20 inline-block">
            First Core Feature Portfolio
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Asset Inventory Grid <br className="hidden sm:block" />& Dynamic Filters
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
            Direct real-time binding to your Supabase cloud backend database with high speed indexed query routines, layout animations, and manual overrides.
          </p>
        </div>
      </div>

      {/* 2. Control center & Dashboard Filters */}
      <div className="grid lg:grid-cols-4 gap-8 items-start">
        {/* Filters Panel sidebar */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-6 shadow-sm sticky top-24" id="filters-desktop-sidebar">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gold-650" />
              <span className="font-display font-bold text-slate-900 text-sm">Query Criteria</span>
            </div>
            {(selectedMake !== 'All' || maxPrice < 300000 || searchTerm) && (
              <button 
                onClick={() => {
                  setSelectedMake('All');
                  setMaxPrice(300000);
                  setSearchTerm('');
                }}
                className="text-[10px] font-mono font-bold text-red-650 hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Search filter input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Search Vehicle & Year</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Porsche 2023..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-sans placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-350 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Make Selective Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Manufacturer / Make</label>
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-slate-350 cursor-pointer"
            >
              <option value="All">All Manufacturers ({makes.length})</option>
              {makes.map((make) => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              <span>Budget Ceiling</span>
              <span className="text-gold-650 font-bold">${maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="300000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>$20k</span>
              <span>$160k</span>
              <span>$300k+</span>
            </div>
          </div>

          {/* Sidebar Stats Summary widgets */}
          {filteredCars.length > 0 && (
            <div className="border-t border-slate-100 pt-4 mt-2 space-y-2.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Inventory Metrics</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                  <p className="text-[9px] font-mono text-slate-400 uppercase">Avg Cost</p>
                  <p className="text-[11px] font-mono font-bold text-slate-800">${averagePrice.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                  <p className="text-[9px] font-mono text-slate-400 uppercase">Low Entry</p>
                  <p className="text-[11px] font-mono font-bold text-slate-800">${lowestPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Grid representation container */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Quick status bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-150 rounded-xl px-5 py-3.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gold-650" />
              <span>Showing <strong>{totalListings}</strong> matching results in database</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-slate-500 hover:text-gold-650 transition font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold-500' : ''}`} />
                {isRefreshing ? 'Syncing...' : 'Force Sync'}
              </button>
            </div>
          </div>

          {/* Database Alert Warning for users */}
          {error && (
            <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-850 font-sans">Database Query Offline or Empty</h4>
                <p className="text-[11px] text-amber-700 leading-relaxed font-mono">
                  {error}. <br />You must execute the <strong className="text-amber-900 border-b border-dashed border-amber-400">/supabase_cars_schema.sql</strong> script in your Supabase SQL Editor.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button 
                    onClick={handleSeedMockData} 
                    className="text-white bg-amber-600 hover:bg-amber-750 transition px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    Auto-Seed Cars Table
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Component Loader overlay skeleton */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="bg-slate-100 h-44 w-full"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-100 rounded w-4/5"></div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="h-3 bg-slate-100 rounded"></div>
                      <div className="h-3 bg-slate-100 rounded"></div>
                      <div className="h-3 bg-slate-100 rounded"></div>
                    </div>
                    <div className="h-10 bg-slate-100 rounded-xl mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Dynamic listings grid */}
              <AnimatePresence mode="popLayout">
                {filteredCars.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    id="cars-active-grid"
                  >
                    {filteredCars.map((car) => {
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          key={car.id}
                          className="bg-white border border-slate-200 hover:border-gold-500/55 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative"
                        >
                          {/* Image panel & Tags */}
                          <div className="h-44 bg-slate-50 overflow-hidden relative">
                            <img
                              src={car.image_url || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"}
                              alt={`${car.make} ${car.model}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Year tag floating badge */}
                            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md border border-white/10 text-white rounded-lg px-2.5 py-1 text-[10px] font-mono font-extrabold tracking-wider">
                              {car.year}
                            </div>

                            {/* Badge floating right (Price status) */}
                            <div className="absolute top-3 right-3 bg-gold-650 text-black font-mono font-bold rounded-lg px-2.5 py-1 text-[10px] shadow-sm uppercase tracking-wide">
                              Liquidating
                            </div>
                          </div>

                          {/* Technical vehicle card data */}
                          <div className="p-4 flex-grow flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono font-bold text-gold-650 uppercase tracking-widest">{car.make}</span>
                              <h3 className="font-display font-black text-slate-800 text-sm tracking-tight truncate group-hover:text-gold-750 transition-colors">
                                {car.model}
                              </h3>

                              {/* Specs dynamic list row */}
                              <div className="flex items-center gap-3 pt-2 pb-1 text-[10px] font-mono text-slate-500 border-b border-slate-50">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-450" /> {car.year}
                                </span>
                                <span className="w-1 h-1 bg-slate-350 rounded-full"></span>
                                <span className="flex items-center gap-1">
                                  <Gauge className="w-3 h-3 text-slate-450" /> {car.mileage.toLocaleString()} mi
                                </span>
                              </div>
                            </div>

                            {/* Actions & pricing row */}
                            <div className="pt-4 space-y-3 mt-auto">
                              <div className="flex items-end justify-between">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Foreclosure Valuation</span>
                                <span className="text-sm font-mono font-black text-slate-900 group-hover:text-gold-650 transition-colors">
                                  ${car.price.toLocaleString()}
                                </span>
                              </div>

                              {/* Action buttons */}
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                  onClick={() => setActiveModalCar(car)}
                                  className="border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition rounded-xl py-2 px-3 text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer text-slate-600"
                                >
                                  <Info className="w-3.5 h-3.5 text-slate-400" /> Specs
                                </button>
                                <a
                                  href={`https://wa.me/15555550199?text=Hello%2c%20I%20am%20inquiring%20about%20the%20${car.year}%20${car.make}%20${car.model}%20listed%20for%20%24${car.price.toLocaleString()}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-slate-900 hover:bg-gold-650 hover:text-black text-white text-[10px] font-mono font-bold rounded-xl py-2 px-3 uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" /> Liquidate
                                </a>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  // Empty results state
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto"
                  >
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <Sliders className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-extrabold text-slate-805 text-sm">No listings found matching criteria</h4>
                      <p className="text-[11px] font-sans text-slate-500 max-w-sm mx-auto">
                        We couldn't find any assets under the current filters (<strong>Make: {selectedMake}</strong>, <strong>Max Budget: ${maxPrice.toLocaleString()}</strong>). Try adjusting sliders.
                      </p>
                    </div>
                    {(selectedMake !== 'All' || maxPrice < 300000 || searchTerm) && (
                      <button 
                        onClick={() => {
                          setSelectedMake('All');
                          setMaxPrice(300000);
                          setSearchTerm('');
                        }}
                        className="bg-slate-800 text-white rounded-xl px-4 py-2 text-[10px] font-mono font-extrabold uppercase hover:bg-gold-650 hover:text-black transition cursor-pointer"
                      >
                        Reset Search Parameters
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* 4. Specs inspection overlay modal */}
      <AnimatePresence>
        {activeModalCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalCar(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden relative z-10 border border-slate-150"
            >
              {/* Image Banner */}
              <div className="h-48 bg-slate-100 relative">
                <img 
                  src={activeModalCar.image_url} 
                  alt={activeModalCar.model} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setActiveModalCar(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-xl transition cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4 bg-slate-950/85 text-white py-1 px-2.5 rounded-lg text-[10px] font-mono font-bold tracking-wider">
                  MODEL SPECIFICATION
                </div>
              </div>

              {/* Specs detailed overview */}
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-gold-650 uppercase tracking-widest">{activeModalCar.make}</span>
                  <h3 className="font-display font-black text-slate-800 text-lg leading-tight">{activeModalCar.model}</h3>
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                  <div className="grid grid-cols-2 p-3 text-[11px] font-mono text-slate-700 bg-slate-50/50">
                    <span className="text-slate-450 uppercase">Manufacturer</span>
                    <span className="text-right font-bold">{activeModalCar.make}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 text-[11px] font-mono text-slate-700">
                    <span className="text-slate-450 uppercase">Model Edition</span>
                    <span className="text-right font-bold">{activeModalCar.model}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 text-[11px] font-mono text-slate-700 bg-slate-50/50">
                    <span className="text-slate-450 uppercase">Build Year</span>
                    <span className="text-right font-bold">{activeModalCar.year}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 text-[11px] font-mono text-slate-700">
                    <span className="text-slate-450 uppercase">Mileage Logged</span>
                    <span className="text-right font-bold">{activeModalCar.mileage.toLocaleString()} miles</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 text-[11px] font-mono text-slate-700 bg-slate-50/50">
                    <span className="text-slate-450 uppercase">Liquidating Price</span>
                    <span className="text-right font-black text-gold-700">${activeModalCar.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setActiveModalCar(null)}
                    className="border border-slate-205 text-slate-500 rounded-xl px-4 py-2.5 text-xs font-mono font-bold uppercase transition hover:bg-slate-50 w-1/3 text-center cursor-pointer"
                  >
                    Close
                  </button>
                  <a
                    href={`https://wa.me/15555550199?text=Hello%2c%20I%2527m%20very%20interested%20in%20depositing%20on%20the%20${activeModalCar.year}%20${activeModalCar.make}%20${activeModalCar.model}%20listed%20at%20%24${activeModalCar.price.toLocaleString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow bg-slate-900 hover:bg-gold-650 hover:text-black cursor-pointer text-white text-xs font-mono font-bold rounded-xl py-2.5 px-4 uppercase text-center transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Deposit Reserve
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
