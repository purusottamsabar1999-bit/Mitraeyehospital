import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Loader2, PhoneCall } from 'lucide-react';

import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import ServicesView from './components/ServicesView';
import DoctorsView from './components/DoctorsView';
import GalleryView from './components/GalleryView';
import ContactView from './components/ContactView';
import BookingView from './components/BookingView';
import AdminPanel from './components/AdminPanel';

import { HospitalSettings, Service, Doctor, GalleryItem, Testimonial } from './types';
import { api } from './lib/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Core public databases loaded on boot
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial public parameters
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [settData, srvData, docData, galData, testData] = await Promise.all([
          api.getSettings(),
          api.getServices(),
          api.getDoctors(),
          api.getGallery(),
          api.getApprovedTestimonials()
        ]);

        setSettings(settData);
        setServices(srvData);
        setDoctors(docData);
        setGallery(galData);
        setTestimonials(testData);
      } catch (err) {
        console.error('Error fetching clinic variables:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Sync scroll on tab transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl border border-blue-100 shadow-md animate-pulse">
          <Eye className="w-10 h-10" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm font-mono">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          CONNECTING TO MITRA CLINIC...
        </div>
      </div>
    );
  }

  // Active view router
  const renderActiveView = () => {
    const transitionProps = {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -12 },
      transition: { duration: 0.28, ease: 'easeOut' }
    };

    switch (currentTab) {
      case 'home':
        return (
          <motion.div {...transitionProps} key="home">
            <HomeView
              setCurrentTab={setCurrentTab}
              doctors={doctors.filter(d => d.isActive)}
              services={services.filter(s => s.isActive)}
              testimonials={testimonials.filter(t => t.isApproved)}
              settings={settings}
            />
          </motion.div>
        );
      case 'about':
        return (
          <motion.div {...transitionProps} key="about">
            <AboutView settings={settings} doctors={doctors.filter(d => d.isActive)} setCurrentTab={setCurrentTab} />
          </motion.div>
        );
      case 'services':
        return (
          <motion.div {...transitionProps} key="services">
            <ServicesView services={services.filter(s => s.isActive)} setCurrentTab={setCurrentTab} />
          </motion.div>
        );
      case 'doctors':
        return (
          <motion.div {...transitionProps} key="doctors">
            <DoctorsView doctors={doctors.filter(d => d.isActive)} setCurrentTab={setCurrentTab} />
          </motion.div>
        );
      case 'gallery':
        return (
          <motion.div {...transitionProps} key="gallery">
            <GalleryView gallery={gallery} />
          </motion.div>
        );
      case 'contact':
        return (
          <motion.div {...transitionProps} key="contact">
            <ContactView settings={settings} />
          </motion.div>
        );
      case 'booking':
        return (
          <motion.div {...transitionProps} key="booking">
            <BookingView
              settings={settings}
              services={services.filter(s => s.isActive)}
              doctors={doctors.filter(d => d.isActive)}
            />
          </motion.div>
        );
      case 'admin':
        return (
          <motion.div {...transitionProps} key="admin" className="min-h-screen">
            <AdminPanel
              settings={settings}
              setSettings={setSettings}
              services={services}
              setServices={setServices}
              doctors={doctors}
              setDoctors={setDoctors}
              gallery={gallery}
              setGallery={setGallery}
              onLogout={() => setCurrentTab('home')}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const isAdminView = currentTab === 'admin';
  const whatsAppNumberRaw = settings?.whatsAppNumber || '+91 91780 05136';
  const whatsAppMessage = 'Hello Mitra Eye Hospital! I would like to schedule an eye examination appointment. Kindly share available times.';
  
  // Format to standard WhatsApp API format (e.g. 919178005136)
  const getCleanNumberForWhatsApp = (num: string) => {
    const clean = num.replace(/[^0-9]/g, '');
    // If the clean number is exactly 9178005136 (10-digit Indian mobile starting with 91),
    // then to make a valid WhatsApp international format, we prepend country code '91'
    if (clean === '9178005136') {
      return '919178005136';
    }
    return clean;
  };

  const whatsAppChatURL = `https://wa.me/${getCleanNumberForWhatsApp(whatsAppNumberRaw)}?text=${encodeURIComponent(whatsAppMessage)}`;

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Stick Header */}
      {!isAdminView && (
        <Header currentTab={currentTab} setCurrentTab={setCurrentTab} settings={settings} />
      )}

      {/* 2. Main Content Stage */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {renderActiveView()}
        </AnimatePresence>
      </main>

      {/* 3. Footer */}
      {!isAdminView && (
        <Footer setCurrentTab={setCurrentTab} settings={settings} />
      )}

      {/* 4. Floating WhatsApp CTA speed dial */}
      {!isAdminView && (
        <a
          href={whatsAppChatURL}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 p-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl hover:shadow-emerald-500/20 hover:scale-105 transition-all duration-300 z-[90] border border-white/10 flex items-center gap-2 group cursor-pointer"
          title="Chat on WhatsApp"
        >
          <PhoneCall className="w-5 h-5 animate-bounce" />
          <span className="text-xs font-bold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap">
            WhatsApp Consulting
          </span>
        </a>
      )}
    </div>
  );
}
