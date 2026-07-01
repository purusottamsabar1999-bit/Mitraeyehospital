import React, { useState } from 'react';
import {
  Eye,
  Calendar,
  Phone,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  Star,
  Activity,
  HeartPulse,
  Sparkles,
  Zap,
  Smile,
  MapPin,
  Glasses,
  Plus,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  MapPinIcon,
  X
} from 'lucide-react';
import { HospitalSettings, Service, Doctor, Testimonial } from '../types';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
  settings: HospitalSettings | null;
  services: Service[];
  doctors: Doctor[];
  testimonials: Testimonial[];
}

export default function HomeView({ setCurrentTab, settings, services, doctors, testimonials }: HomeViewProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  const formattedPhone = settings?.phone || '+91 9178005136';
  const formattedAddress = settings?.address || 'Government Medical Main Road, Paralakhemundi, Odisha – 761200';

  // Get active doctors & services
  const featuredServices = services.filter(s => s.isFeatured).slice(0, 3);
  const remainingServices = services.filter(s => !s.isFeatured).slice(0, 3);

  // Quick icon selector
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return <Eye className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      case 'HeartPulse': return <HeartPulse className="w-6 h-6" />;
      case 'Activity': return <Activity className="w-6 h-6" />;
      case 'Smile': return <Smile className="w-6 h-6" />;
      case 'MapPin': return <MapPin className="w-6 h-6" />;
      case 'Glasses': return <Glasses className="w-6 h-6" />;
      default: return <Stethoscope className="w-6 h-6" />;
    }
  };

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setActiveTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setActiveTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  // Quick list of 6 quick service icons
  const quickServices = [
    { label: 'Cataract Surgery', icon: <Sparkles className="w-5 h-5 text-sky-400" /> },
    { label: 'LASIK', icon: <Zap className="w-5 h-5 text-sky-400" /> },
    { label: 'Glaucoma', icon: <HeartPulse className="w-5 h-5 text-sky-400" /> },
    { label: 'Retina Care', icon: <Activity className="w-5 h-5 text-sky-400" /> },
    { label: 'Child Eye Care', icon: <Smile className="w-5 h-5 text-sky-400" /> },
    { label: 'Eye Camps', icon: <MapPin className="w-5 h-5 text-sky-400" /> }
  ];

  return (
    <div className="w-full flex flex-col" id="home-view-container">
      {/* 2. HERO SECTION */}
      <section
        id="hero-banner-section"
        className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pt-20 pb-28 md:pt-28 md:pb-36 px-4 border-b border-slate-800 z-10"
      >
        {/* Isolated overflow-hidden container for background elements to prevent clipping the floating stats */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] -ml-24 -mb-24"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Left Copy */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mx-auto lg:mx-0 w-fit">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              Gajapati’s Leading Eye Care Center
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Expert Eye Care in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-300">Paralakhemundi</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Serving Gajapati District since 2012. Combining state-of-the-art diagnostic technology with compassionate, affordable eye surgery and vision care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
              <button
                onClick={() => setCurrentTab('booking')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                id="hero-cta-book-appt"
              >
                <Calendar className="w-5 h-5" />
                Book Appointment
              </button>
              <a
                href={`tel:${formattedPhone}`}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-200 flex items-center justify-center gap-2"
                id="hero-cta-call-us"
              >
                <Phone className="w-5 h-5 text-cyan-400" />
                Call Us Now
              </a>
            </div>
          </div>

          {/* Hero Right Visual */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 group">
              <img
                src="https://lh3.googleusercontent.com/d/15DhBQitbJICQIHGx1Z47nFI4WHluy-5A"
                alt="Eye Examination Clinic"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
              {/* Overlay rating */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-800/65 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-sm font-semibold text-white">Mitra Eye Hospital</span>
                  <span className="block text-xs text-slate-400">Paralakhemundi Branch</span>
                </div>
                <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-yellow-500/30">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  4.8★ rating
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats Strip */}
        <div id="hero-floating-stats" className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90%] max-w-6xl bg-white border border-slate-100 shadow-xl rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 py-6 text-center text-slate-900 z-30 justify-center justify-items-center items-center">
          <div className="py-0 px-4 w-full h-full flex flex-col items-center justify-center text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tracking-tight">15,000+</span>
            <span className="block text-xs sm:text-sm font-medium text-slate-500 mt-1">Patients Treated</span>
          </div>
          <div className="py-0 px-4 w-full h-full flex flex-col items-center justify-center text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tracking-tight">14+ Years</span>
            <span className="block text-xs sm:text-sm font-medium text-slate-500 mt-1">Experience</span>
          </div>
          <div className="py-0 px-4 w-full h-full flex flex-col items-center justify-center text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tracking-tight">5,000+</span>
            <span className="block text-xs sm:text-sm font-medium text-slate-500 mt-1">Surgeries Completed</span>
          </div>
          <div className="py-0 px-4 w-full h-full flex flex-col items-center justify-center text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tracking-tight">4.8 ★</span>
            <span className="block text-xs sm:text-sm font-medium text-slate-500 mt-1">Justdial Rating</span>
          </div>
        </div>
      </section>

      {/* 3. QUICK SERVICES STRIP */}
      <section id="quick-services-strip" className="bg-slate-50 pt-20 pb-12 px-4 border-b border-slate-100 flex flex-col items-center justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Our Specialties At A Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-center justify-items-center items-center">
            {quickServices.map((qs, i) => (
              <div
                key={i}
                className="bg-white border border-slate-150 p-5 rounded-xl flex flex-col items-center justify-center text-center gap-3 shadow-xs hover:shadow-md hover:border-cyan-400 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer select-none w-full h-full"
                onClick={() => setCurrentTab('services')}
              >
                <div className="p-3 bg-slate-50 rounded-xl shrink-0 border border-slate-100 flex items-center justify-center">
                  {qs.icon}
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">{qs.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ABOUT SNIPPET */}
      <section id="about-snippet-section" className="bg-white py-20 px-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Doctor Photo & Badges */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[360px]">
              {/* Back border effect */}
              <div className="absolute inset-0 border-2 border-dashed border-blue-200 translate-x-4 translate-y-4 rounded-2xl pointer-events-none"></div>
              {/* Doctor Container */}
              <div className="relative bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden shadow-lg p-3">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop"
                  alt="Dr. Soumya Mitra"
                  className="w-full aspect-[4/5] object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-4 px-2 text-center">
                  <span className="block font-bold text-slate-900 text-lg">Dr. Soumya Mitra, MS</span>
                  <span className="block text-xs font-semibold text-blue-600 font-mono mt-0.5">CHIEF EYE SURGEON</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy highlights */}
          <div className="lg:col-span-7 flex flex-col gap-5 text-left">
            <div className="w-fit px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg uppercase tracking-wider">
              About Our Hospital
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Restoring Vision, Elevating Lives Since 2012
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              At Mitra Eye Hospital, we understand that vision is your most precious sense. Guided by <strong>Dr. Soumya Mitra</strong> and our senior clinical teams, we have spent over a decade delivering excellent ophthalmic treatments to the families of Paralakhemundi, Swaraj, and nearby rural villages in the Gajapati region.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Advanced Diagnostic Labs</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Fully digital scan scanners & computerised checks.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Premium IOL Implants</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Monofocal, Multifocal, and Toric premium lenses.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Dedicated Pediatric Unit</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Specialist care for children with squint & lazy eye.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Rural Vision Camps</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Free screening & subsidized surgeries for poor patients.</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setCurrentTab('about')}
                className="px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm rounded-xl transition-all duration-200 flex items-center gap-1.5 group cursor-pointer"
              >
                Learn More About Us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SERVICES SECTION (dynamic from DB) */}
      <section id="services-section" className="bg-slate-50 py-20 px-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Clinical Excellence</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-3">Comprehensive Eye Specialties</h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              We offer advanced medical and surgical eye therapies backed by digital tracking and computerised monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col group h-full"
              >
                {/* Service Image */}
                <div className="w-full aspect-video bg-slate-100 overflow-hidden relative">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <Eye className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                    {getServiceIcon(service.iconClass)}
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-6 flex flex-col flex-grow text-left">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-blue transition-colors leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed flex-grow">
                    {service.shortDescription}
                  </p>
                  <div className="h-px bg-slate-100 my-4"></div>
                  <div>
                    <button
                      onClick={() => setCurrentTab('services')}
                      className="text-xs font-bold text-primary-blue hover:text-blue-800 flex items-center gap-1 group/btn cursor-pointer"
                    >
                      Read Clinical Details
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setCurrentTab('services')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              View All 8 Specialties
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section id="why-choose-us-section" className="bg-white py-20 px-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Block info */}
          <div className="lg:col-span-7 text-left flex flex-col gap-5">
            <span className="text-xs uppercase font-bold tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full w-fit">Patient Centric Care</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Why Gajapati Trusts Mitra Eye Hospital
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              For more than a decade, patients across Paralakhemundi, Swaraj Tractor Colony, Friends Colony, and neighbouring blocks have chosen Mitra for exceptional, safe, and cost-effective eye health support.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
                <span className="block text-2xl font-bold text-slate-900">Modern Infrastructure</span>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Sutureless cold Phacoemulsification, computerised refraction, and optical scans.</p>
              </div>
              <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
                <span className="block text-2xl font-bold text-slate-900">Experienced Surgeons</span>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Led by MS and DNB specialists who have completed thousands of premium surgeries.</p>
              </div>
              <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
                <span className="block text-2xl font-bold text-slate-900">Affordable & Clear Pricing</span>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Subsidized lens implants and free medical camps to support poor families.</p>
              </div>
              <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
                <span className="block text-2xl font-bold text-slate-900">Sunday Consultations</span>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Open on Sundays 8:30 AM – 12:30 PM for emergency checkups and working staff.</p>
              </div>
            </div>
          </div>

          {/* Right Counters block */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-md text-center flex flex-col justify-center min-h-[140px]">
              <span className="block text-3xl font-extrabold font-mono tracking-tight">100%</span>
              <span className="block text-xs font-semibold uppercase tracking-wider mt-1 text-blue-100">Sterility Checked</span>
            </div>
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-md text-center flex flex-col justify-center min-h-[140px]">
              <span className="block text-3xl font-extrabold font-mono tracking-tight">24/7</span>
              <span className="block text-xs font-semibold uppercase tracking-wider mt-1 text-slate-400">Emergency Support</span>
            </div>
            <div className="bg-slate-100 border border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xs text-center flex flex-col justify-center min-h-[140px]">
              <span className="block text-3xl font-extrabold font-mono tracking-tight">4.8 ★</span>
              <span className="block text-xs font-semibold uppercase tracking-wider mt-1 text-slate-500">Justdial Rated</span>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-2xl shadow-md text-center flex flex-col justify-center min-h-[140px]">
              <span className="block text-3xl font-extrabold font-mono tracking-tight">10k+</span>
              <span className="block text-xs font-semibold uppercase tracking-wider mt-1 text-cyan-100">Specs Removed</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DOCTORS SECTION */}
      <section id="doctors-carousel-section" className="bg-slate-50 py-20 px-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Expert Staff</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-3">Meet Our Medical Team</h2>
            <p className="text-slate-500 text-sm mt-2">
              Our clinicians hold specialized certifications and surgical fellowships with years of active hospital experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left hover:border-blue-200"
              >
                <img
                  src={doc.photo}
                  alt={doc.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-2xl border border-slate-100 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col h-full justify-between items-center sm:items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs font-bold font-mono uppercase tracking-wider text-blue-600 mt-0.5">{doc.designation}</p>
                    <p className="text-sm font-semibold text-slate-600 mt-2">{doc.specialty}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1 font-mono">{doc.qualification}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    View Biography & Hours
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section id="testimonials-carousel" className="bg-white py-20 px-4 border-b border-slate-100">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Real Stories</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-3 mb-10">What Our Patients Say</h2>

            {/* Testimonial Active Display */}
            <div className="relative bg-slate-50 border border-slate-100 p-8 rounded-2xl shadow-xs min-h-[220px] flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {Array.from({ length: testimonials[activeTestimonialIdx].rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-slate-600 italic text-sm sm:text-base leading-relaxed">
                  "{testimonials[activeTestimonialIdx].review}"
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div>
                  <span className="block font-bold text-slate-900 text-sm sm:text-base">{testimonials[activeTestimonialIdx].patientName}</span>
                  <span className="block text-xs text-slate-400">Verified Patient Review</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prevTestimonial}
                    className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors focus:outline-none cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors focus:outline-none cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Google Review Badge Linking to Maps */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <a
                href="https://maps.app.goo.gl/bm9xt9ycrdgoxAa9A"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all duration-200 border border-slate-200"
              >
                <MapPinIcon className="w-4 h-4 text-rose-500" />
                Find Us on Google Maps & Reviews
              </a>
              <span className="text-xs text-slate-400 font-semibold font-mono">
                OVERALL RATING: 4.8 / 5.0 (38 Verified reviews)
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 9. APPOINTMENT CTA BANNER */}
      <section id="appointment-cta-banner" className="bg-gradient-to-r from-blue-700 to-sky-600 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none -mt-10 -ml-10"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none -mb-12 -mr-12"></div>

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center gap-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Book Your Comprehensive Eye Checkup Today
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            Secure your slot in 2 minutes. Our automated slot assistant will verify availability instantly.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setCurrentTab('booking')}
              className="px-8 py-4 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-xl shadow-lg hover:shadow-white/10 transition-colors cursor-pointer"
            >
              Book My Appointment Now
            </button>
            <a
              href={`tel:${formattedPhone}`}
              className="px-8 py-4 bg-blue-800/50 hover:bg-blue-800/70 border border-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-cyan-300" />
              Call Front Desk
            </a>
          </div>
        </div>
      </section>

      {/* 10. GOOGLE MAP */}
      <section id="google-map-section" className="bg-white pt-16 pb-20 px-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Address Details card */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50 border border-slate-150 p-6 rounded-2xl text-left">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Our Location</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2 mb-4 leading-tight">Mitra Eye Hospital</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {formattedAddress}
              </p>
              <div className="h-px bg-slate-200 my-4"></div>
              <p className="text-xs text-slate-500 font-medium">
                <strong>Opposite:</strong> Catholic Church<br />
                <strong>Near:</strong> Swaraj Tractor Showroom, Friends Colony
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <span className="block text-xs font-bold text-slate-400 uppercase">Consulting Hours:</span>
              <span className="block text-sm font-semibold text-slate-800">Mon–Sat: 8:30 AM – 7:30 PM</span>
              <span className="block text-sm font-semibold text-slate-800">Sun: 8:30 AM – 12:30 PM</span>
            </div>
          </div>

          {/* Map iframe */}
          <div className="lg:col-span-8 h-[380px] rounded-2xl overflow-hidden border border-slate-150 shadow-sm relative">
            <iframe
              src={settings?.mapsEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.082987515286!2d84.0947889!3d18.7719411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3cf7e6f4c60abd%3A0x3f9b9001acedefe3!2sMITRA%20EYE%20HOSPITAL-%20PARALAKHEMUNDI!5e0!3m2!1sen!2sin!4v1719660000000!5m2!1sen!2sin"}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mitra Eye Hospital Map"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Biography and Availability Modal */}
      {selectedDoctor && (
        <div id="doctor-details-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-in fade-in duration-200">
          <div className="bg-white border border-slate-150 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl flex flex-col gap-5 text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img
                  src={selectedDoctor.photo}
                  alt={selectedDoctor.name}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedDoctor.name}</h3>
                  <span className="text-xs font-semibold font-mono text-blue-600 uppercase tracking-widest">{selectedDoctor.designation}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Specialty</span>
                <span className="block text-sm font-semibold text-slate-800 mt-1">{selectedDoctor.specialty}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Education & Fellowships</span>
                <span className="block text-sm font-semibold text-slate-800 mt-1">{selectedDoctor.qualification}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Biography</span>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">
                  {selectedDoctor.bio}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">OPD / Consulting Hours</span>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                  <div>
                    <strong>Available Days:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDoctor.availableDays.map((d, idx) => (
                        <span key={idx} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-slate-600">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>Timings:</strong>
                    <span className="block text-xs mt-1 text-slate-600 font-mono">
                      {selectedDoctor.availableTimeStart} AM – {selectedDoctor.availableTimeEnd} PM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setCurrentTab('booking');
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Schedule Consult
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
