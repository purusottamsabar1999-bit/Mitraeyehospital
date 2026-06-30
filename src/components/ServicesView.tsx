import React, { useState } from 'react';
import {
  Eye,
  Sparkles,
  Zap,
  HeartPulse,
  Activity,
  Smile,
  MapPin,
  Glasses,
  Stethoscope,
  X,
  ArrowRight,
  ShieldCheck,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { Service } from '../types';

interface ServicesViewProps {
  services: Service[];
  setCurrentTab: (tab: string) => void;
}

export default function ServicesView({ services, setCurrentTab }: ServicesViewProps) {
  const [activeService, setActiveService] = useState<Service | null>(null);

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

  // Static list of procedural expectations & FAQs mapping to services
  const getExpectationsAndFaqs = (srvTitle: string) => {
    const defaultData = {
      expectations: [
        'Detailed initial visual acuity check and computerised scanning.',
        'Friendly counselling regarding surgical options or prescription types.',
        'Surgical procedures conducted in class-100 sterile operating theatres.',
        'Comprehensive post-operative follow-up visits included.'
      ],
      faqs: [
        { q: 'Is the procedure painful?', a: 'No. Most checkups are non-invasive. Surgical options like LASIK and Cataract are done under topical anaesthetic eye drops and are virtually painless.' },
        { q: 'How long does the appointment take?', a: 'A standard comprehensive checkup takes about 30 to 45 minutes, while advanced diagnostics might take up to 1.5 hours.' },
        { q: 'Do I need a prior referral?', a: 'No, direct walk-ins and automated bookings are welcome. You do not need a physician’s referral letter.' }
      ]
    };

    if (srvTitle.includes('Cataract')) {
      return {
        expectations: [
          'Pre-operative lens power measurement (Biometry) using state-of-the-art diagnostic instruments.',
          'Sutureless cold Phacoemulsification surgery lasting only 10 to 15 minutes.',
          'Implantation of premium foldable lenses (Monofocal, Multifocal, or Toric).',
          'Immediate discharge with eye shield; quick recovery of clear vision within 24 hours.'
        ],
        faqs: [
          { q: 'What is Cataract (Motia Bindu)?', a: 'A cataract is the gradual clouding of the natural crystalline lens of the eye, usually associated with aging. It causes blurred vision, glare, and faded colors.' },
          { q: 'How long does Cataract surgery take?', a: 'The modern Phacoemulsification procedure is suture-free and takes only 10–15 minutes. It is performed on a day-care basis, so you can go home the same day.' },
          { q: 'What are the lens options available?', a: 'We offer high-quality Monofocal (clear vision for distance), Multifocal (clear vision for both distance and near), and Toric lenses (to correct astigmatism).' }
        ]
      };
    } else if (srvTitle.includes('LASIK') || srvTitle.includes('Specs')) {
      return {
        expectations: [
          'Detailed corneal thickness and map scans (Pentacam/Topography) to confirm eligibility.',
          'Painless, blade-free laser procedure conducted in less than 10 minutes per eye.',
          'Immediate visual improvement noticed within a few hours of procedure.',
          'Minor scratchy feeling resolved within 1-2 days with prescription drops.'
        ],
        faqs: [
          { q: 'Am I a candidate for LASIK?', a: 'If you are over 18 years old, have had a stable eye prescription for at least one year, and have healthy corneas, you are likely a good candidate.' },
          { q: 'Is the laser specs removal permanent?', a: 'Yes. LASIK permanently reshapes the cornea to correct your prescription. The visual correction is permanent.' },
          { q: 'What is the recovery time?', a: 'Most patients return to school or light work within 24 to 48 hours. Clear vision is achieved almost instantly.' }
        ]
      };
    } else if (srvTitle.includes('Glaucoma')) {
      return {
        expectations: [
          'Non-contact computerised pressure checking (Tonometry).',
          'Optic nerve scan (OCT) and automated Visual Field analyzer checks.',
          'Personalized treatment plans including protective eye drops or laser peripheral iridotomy.',
          'Periodic pressure and nerve monitoring every 3 to 6 months.'
        ],
        faqs: [
          { q: 'Why is Glaucoma called the silent thief of sight?', a: 'Glaucoma slowly damages the optic nerve due to high eye pressure. It often has no symptoms or pain until significant, irreversible peripheral vision is lost.' },
          { q: 'Can vision lost to Glaucoma be restored?', a: 'No. Any damage caused by glaucoma is permanent. However, early detection and treatment can successfully prevent further vision loss.' },
          { q: 'Who is at risk?', a: 'People over 40, individuals with a family history of glaucoma, diabetics, or those with highly negative eye numbers.' }
        ]
      };
    }

    return defaultData;
  };

  return (
    <div className="w-full flex flex-col py-12 px-4 bg-slate-50" id="services-view-container">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Intro header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">Our Services</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Specialized Eye Care Treatments
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Delivering advanced clinical diagnostics, modern micro-incision surgeries, and professional vision checkups locally in Paralakhemundi.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col group h-full text-left"
            >
              {/* Service Visual Banner */}
              <div className="w-full aspect-video bg-slate-100 overflow-hidden relative">
                {srv.image ? (
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                    <Eye className="w-12 h-12" />
                  </div>
                )}
                {/* Float Icon */}
                <div className="absolute top-4 left-4 p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                  {getServiceIcon(srv.iconClass)}
                </div>
              </div>

              {/* Service Content Details */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-blue transition-colors leading-snug">
                  {srv.title}
                </h3>
                <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed flex-grow">
                  {srv.shortDescription}
                </p>
                <div className="h-px bg-slate-100 my-4"></div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setActiveService(srv)}
                    className="text-xs font-bold text-primary-blue hover:text-blue-800 flex items-center gap-1 group/btn cursor-pointer"
                  >
                    View Procedure Details
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                  {srv.isFeatured && (
                    <span className="text-[10px] bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded-md border border-sky-100 font-mono uppercase">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Diagnostic Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 text-left relative overflow-hidden border border-slate-800">
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-lg uppercase tracking-wider">
              High Precision Technology
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pre-Surgical Visual Profiling
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every surgical case undergoes advanced digital ocular scanning before we begin. This mapping provides our surgeons with a hyper-accurate map of your cornea and optic pathways, allowing them to customize the procedure to your exact physiology and deliver perfect visual clarity.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Computerised Refractometer
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Ultrasonic Biometer (A-Scan)
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                OCT Retinal Scanner
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Clinical Details Modal */}
      {activeService && (() => {
        const details = getExpectationsAndFaqs(activeService.title);
        return (
          <div id="service-details-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white border border-slate-150 rounded-2xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl flex flex-col gap-6 text-left my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    {getServiceIcon(activeService.iconClass)}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{activeService.title}</h3>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Clinical Treatment Details</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveService(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-6">
                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Treatment Overview</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {activeService.fullDescription}
                  </p>
                </div>

                {/* What to Expect */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">What to Expect</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {details.expectations.map((exp, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* FAQs */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Frequently Asked Questions</h4>
                  <div className="space-y-3">
                    {details.faqs.map((faq, idx) => (
                      <div key={idx} className="border border-slate-150 p-4 rounded-xl bg-blue-50/20 text-left">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                          <HelpCircle className="w-4 h-4 text-blue-500" />
                          {faq.q}
                        </span>
                        <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed pl-5">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveService(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setActiveService(null);
                    setCurrentTab('booking');
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Slot
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
