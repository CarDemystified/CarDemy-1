import React, { useState, useEffect } from 'react';
import { Car, Lock, Menu, X, Phone } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  navigateTo: (path: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
  companyName: string;
  companyPhone: string;
}

export default function Header({ currentPath, navigateTo, isAdmin, onLogout, companyName, companyPhone }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', path: '#/' },
    { label: 'Car Blog', path: '#/blog' },
    { label: 'About Us', path: '#/about' },
  ];

  const handleNavClick = (path: string) => {
    navigateTo(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-nav-bar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0f1115]/95 backdrop-blur-md border-b border-white/5 py-4 shadow-xl'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            id="logo-wrap"
            onClick={() => handleNavClick('#/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg shadow-lg shadow-gold-500/10 group-hover:scale-105 transition-transform duration-300">
              <Car className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="font-display font-bold text-lg leading-tight block text-white tracking-tight group-hover:text-gold-200 transition-colors">
                {companyName || "Foreclosed Auto Deals"}
              </span>
              <span className="text-[10px] font-mono text-gold-400 font-medium uppercase tracking-[0.2em] block">
                Asset Liquidation Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive =
                item.path === '#/'
                  ? currentPath === 'home'
                  : currentPath === item.path.replace('#/', '');
              return (
                <button
                  key={item.label}
                  id={`nav-${item.label.toLowerCase()}`}
                  onClick={() => handleNavClick(item.path)}
                  className={`text-sm font-medium tracking-wide transition-all uppercase duration-200 hover:text-gold-300 ${
                    isActive ? 'text-gold-400 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Call / Panel CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {companyPhone && (
              <a
                href={`tel:${companyPhone}`}
                id="header-phone-cta"
                className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-white/5 border border-white/10 hover:border-gold-500 hover:text-gold-400 px-4 py-2 rounded-full transition-all duration-300"
              >
                <Phone className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
                {companyPhone}
              </a>
            )}
            
            <button
              id="header-admin-cta"
              onClick={() => handleNavClick('#/admin')}
              className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 ${
                currentPath === 'admin'
                  ? 'bg-gold-500 text-black font-semibold'
                  : isAdmin
                  ? 'bg-emerald-500 text-white font-medium hover:bg-emerald-600'
                  : 'bg-white/10 text-white hover:bg-gold-500 hover:text-black hover:font-medium'
              }`}
            >
              <Lock className="w-3 h-3" />
              {isAdmin ? 'Dashboard' : 'Admin'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              id="mobile-admin-btn"
              onClick={() => handleNavClick('#/admin')}
              className="p-2 text-gray-400 hover:text-gold-400 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div id="mobile-drawer" className="md:hidden bg-[#0a0c0e] border-b border-white/10 shadow-2xl transition-all duration-300">
          <div className="px-4 pt-2 pb-6 space-y-4">
            {navItems.map((item) => {
              const isActive =
                item.path === '#/'
                  ? currentPath === 'home'
                  : currentPath === item.path.replace('#/', '');
              return (
                <button
                  key={item.label}
                  id={`mobile-nav-${item.label.toLowerCase()}`}
                  onClick={() => handleNavClick(item.path)}
                  className={`block w-full text-left py-2.5 px-4 rounded-lg text-base font-medium tracking-wide transition-all uppercase duration-200 ${
                    isActive
                      ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            <div className="pt-4 border-t border-white/5 flex flex-col gap-3 px-4">
              {companyPhone && (
                <a
                  href={`tel:${companyPhone}`}
                  className="flex items-center gap-3 py-2 text-sm text-gray-300 font-mono"
                >
                  <Phone className="w-4 h-4 text-gold-500" />
                  {companyPhone}
                </a>
              )}
              <button
                onClick={() => handleNavClick('#/admin')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-semibold text-sm uppercase tracking-wider py-3 rounded-lg shadow-lg hover:shadow-gold-500/10"
              >
                <Lock className="w-4 h-4" />
                {isAdmin ? 'Admin Dashboard' : 'Admin Portal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
