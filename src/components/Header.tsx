import React, { useState, useEffect } from 'react';
import { Eye, Phone, Clock, Menu, X, Shield } from 'lucide-react';
import { HospitalSettings } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  settings: HospitalSettings | null;
}

export default function Header({ currentTab, setCurrentTab, settings }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'doctors', label: 'Our Doctors' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formattedPhone = settings?.phone || '+91 9178005136';
  const formattedTimings = settings?.timingsWeekdays || 'Mon–Sat: 8:30 AM – 7:30 PM';

  return (
    <header className="w-full sticky top-0 z-50 flex flex-col">
      {/* Top Utility Bar */}
      <div id="header-top-bar" className="w-full bg-slate-900/95 backdrop-blur-sm text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-secondary-teal" />
              Call Support: <a href={`tel:${formattedPhone}`} className="hover:text-white transition-colors">{formattedPhone}</a>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-secondary-teal" />
              {formattedTimings}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1 hover:text-white transition-colors py-0.5 px-2 rounded-md cursor-pointer ${
                currentTab === 'admin' ? 'text-secondary-teal bg-slate-800' : ''
              }`}
              id="btn-admin-portal-access"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <nav
        id="main-navigation-bar"
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md shadow-md py-3 border-b border-slate-100/50'
            : 'bg-white/90 backdrop-blur-md py-4 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo Brand */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            id="logo-container"
          >
            <div className="p-2.5 bg-blue-50 text-primary-blue rounded-xl group-hover:bg-primary-blue group-hover:text-white transition-all duration-300 shadow-sm">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary-blue transition-colors">
                {settings?.hospitalName || 'Mitra Eye Hospital'}
              </span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-medium font-mono">
                {settings?.tagline || 'Caring for Your Vision, Enriching Your Life'}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === item.id
                    ? 'text-primary-blue bg-blue-50/80 font-semibold'
                    : 'text-slate-600 hover:text-primary-blue hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              id="nav-item-book"
              onClick={() => handleNavClick('booking')}
              className="ml-3 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              id="hamburger-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-primary-blue hover:bg-slate-50 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div id="mobile-menu-dropdown" className={`md:hidden absolute top-full left-0 w-full border-b border-slate-100 shadow-lg py-4 px-4 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-5 duration-200 ${
            isScrolled ? 'bg-white/90 backdrop-blur-md' : 'bg-white'
          }`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  currentTab === item.id
                    ? 'text-primary-blue bg-blue-50/50 font-semibold border-l-4 border-primary-blue pl-3'
                    : 'text-slate-600 hover:text-primary-blue hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="h-px bg-slate-100 my-2"></div>
            <button
              id="mobile-nav-book"
              onClick={() => handleNavClick('booking')}
              className="w-full py-3 text-center text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition-colors cursor-pointer"
            >
              Book Appointment
            </button>
            <button
              id="mobile-nav-admin"
              onClick={() => handleNavClick('admin')}
              className="w-full text-center py-2.5 mt-2 text-sm font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              Access Admin Panel
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
