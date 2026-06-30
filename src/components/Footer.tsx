import React from 'react';
import { Eye, MapPin, Phone, Mail, Clock, ShieldAlert } from 'lucide-react';
import { HospitalSettings } from '../types';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  settings: HospitalSettings | null;
}

export default function Footer({ setCurrentTab, settings }: FooterProps) {
  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formattedPhone = settings?.phone || '+91 9178005136';
  const formattedEmail = settings?.email || 'info@mitraeyehospital.com';
  const formattedAddress = settings?.address || 'Government Medical Main Road, Paralakhemundi, Odisha – 761200';
  const formattedTimingsWeekdays = settings?.timingsWeekdays || 'Mon–Sat: 8:30 AM – 7:30 PM';
  const formattedTimingsSunday = settings?.timingsSunday || 'Sun: 8:30 AM – 12:30 PM';

  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Hospital Brand Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => handleNavClick('home')}>
            <div className="p-2 bg-blue-600/15 text-blue-400 rounded-lg">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              {settings?.hospitalName || 'Mitra Eye Hospital'}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Caring for your vision, enriching your life. Mitra Eye Hospital is the premier eye care center in Gajapati district, offering advanced diagnostics, modern surgical treatments, and personalized care.
          </p>
          <div className="mt-2 text-xs font-mono text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            GA4 Ready & Mobile Optimized
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About Us' },
              { id: 'services', label: 'Our Services' },
              { id: 'doctors', label: 'Our Doctors' },
              { id: 'gallery', label: 'Gallery' },
              { id: 'contact', label: 'Contact Us' }
            ].map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className="hover:text-blue-400 hover:underline transition-colors text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => handleNavClick('admin')}
                className="hover:text-blue-400 hover:underline transition-colors text-left flex items-center gap-1 text-slate-500 hover:text-slate-300"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Staff Admin Login
              </button>
            </li>
          </ul>
        </div>

        {/* Key Specialties Column */}
        <div>
          <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Key Specialties</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <button onClick={() => handleNavClick('services')} className="hover:text-blue-400 transition-colors text-left">
                Sutureless Cataract (Phaco)
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('services')} className="hover:text-blue-400 transition-colors text-left">
                LASIK Specs Removal
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('services')} className="hover:text-blue-400 transition-colors text-left">
                Glaucoma Screening & Laser
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('services')} className="hover:text-blue-400 transition-colors text-left">
                Pediatric Eye Care & Squint
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('services')} className="hover:text-blue-400 transition-colors text-left">
                Digital Retina Scanning
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Coordinates Column */}
        <div className="flex flex-col gap-4 text-sm">
          <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-1">Get In Touch</h3>
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-300">
              {formattedAddress}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-blue-400 shrink-0" />
            <a href={`tel:${formattedPhone}`} className="hover:text-white transition-colors">{formattedPhone}</a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-blue-400 shrink-0" />
            <a href={`mailto:${formattedEmail}`} className="hover:text-white transition-colors">{formattedEmail}</a>
          </div>
          <div className="flex gap-3">
            <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-300">{formattedTimingsWeekdays}</p>
              <p className="text-xs text-slate-300">{formattedTimingsSunday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Disclaimer and Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 Mitra Eye Hospital, Paralakhemundi. All Rights Reserved.</p>
        <p className="mt-1">
          Developed in compliance with medical clinic standards. All hospital ratings and reviews are verified from authentic sources.
        </p>
      </div>
    </footer>
  );
}
