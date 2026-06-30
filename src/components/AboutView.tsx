import React, { useState } from 'react';
import { Eye, ShieldCheck, Award, Heart, Check, X, Calendar } from 'lucide-react';
import { HospitalSettings, Doctor } from '../types';

interface AboutViewProps {
  settings: HospitalSettings | null;
  doctors: Doctor[];
  setCurrentTab: (tab: string) => void;
}

export default function AboutView({ settings, doctors, setCurrentTab }: AboutViewProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const stats = [
    { label: 'Cataract Surgeries', value: '4,000+' },
    { label: 'Refractive (LASIK)', value: '1,500+' },
    { label: 'Outreach Camps', value: '120+' },
    { label: 'Happy Families', value: '15,000+' }
  ];

  const coreValues = [
    {
      title: 'Clinical Precision',
      desc: 'Deploying state-of-the-art computerised diagnostics and high-precision laser setups to guarantee excellent surgical accuracy.'
    },
    {
      title: 'Compassionate Care',
      desc: 'Treating every patient like a member of our family. Patient comfort and satisfaction are our absolute priority.'
    },
    {
      title: 'Rural Accessibility',
      desc: 'Bridging the urban-rural medical divide with regular, free vision camps and highly subsidized cataract surgeries for the needy.'
    },
    {
      title: 'Complete Integrity',
      desc: 'Providing honest, transparent consulting and pricing. No hidden fees or unneeded test recommendations.'
    }
  ];

  return (
    <div className="w-full flex flex-col py-12 px-4 bg-slate-50" id="about-view-container">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* About Intro Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">Our Story</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            About Mitra Eye Hospital
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            A decade of restoring vision, fighting preventable blindness, and bringing state-of-the-art medical sciences to Paralakhemundi.
          </p>
        </div>

        {/* History / Mission segments */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Our Journey of Visionary Excellence
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Founded in 2012 in Paralakhemundi, Mitra Eye Hospital was established with a singular, clear mission: to provide the people of Gajapati district and surrounding blocks with world-class ophthalmic care locally, removing the need to travel long distances for critical eye surgeries.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              What started as a single computerized checkup clinic has today blossomed into a comprehensive diagnostic and day-care surgical center, equipped with modern cold-phacoemulsification devices, optical scan rooms, and premium lens options. We remain deeply committed to our founding values: clinical excellence, patient warmth, and rural social responsibility.
            </p>
            <div className="border-l-4 border-blue-600 pl-4 py-1.5 italic text-slate-600 text-sm bg-blue-50/50 rounded-r-lg">
              "We measure our success not by the number of checkups we run, but by the smiles on our patients' faces when their sight is successfully restored."
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {stats.map((st, idx) => (
              <div key={idx} className="bg-white border border-slate-150 p-6 rounded-2xl text-center shadow-xs">
                <span className="block text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">{st.value}</span>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mission & Vision segment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-150 p-8 rounded-2xl text-left space-y-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To be the most trusted, comprehensive, and compassionate eye care provider in Southern Odisha. We strive to set new benchmarks in surgical outcomes, clinical safety, and patient experience, ensuring that premium eye care is a right, not a luxury.
            </p>
          </div>

          <div className="bg-white border border-slate-150 p-8 rounded-2xl text-left space-y-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To preserve, restore, and enrich vision across all communities of Gajapati District. We are committed to achieving this through continuous investment in modern diagnostics, implementing strict sterilization standards, and fostering an empathetic care culture.
            </p>
          </div>
        </div>

        {/* Core Values section */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Our Core Pillars</h2>
            <p className="text-slate-500 text-sm">The four foundational values that guide our hospital day-to-day.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => (
              <div key={idx} className="bg-white border border-slate-150 p-6 rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-500">0{idx + 1}</span>
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">{val.title}</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Clinicians list */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Our Senior Specialists</h2>
            <p className="text-slate-500 text-sm">Our surgeons are highly qualified clinicians with fellowships in sub-specialties.</p>
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

        {/* Accolades & Safety Standards */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="lg:col-span-8 space-y-4">
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-lg uppercase tracking-wider">
              Quality & Safety Standards
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              A Sterile, Suture-Free Environment
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              Patient safety is paramount. Our modern operation theatres feature strict positive-pressure sterile air systems to prevent post-surgical infections. We only use certified premium intraocular lenses and FDA-approved laser machines for all vision corrections.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <span className="block text-sm font-bold">100% Sterile OT</span>
                <span className="block text-xs text-slate-400">Class 100 infection controls</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
              <Award className="w-6 h-6 text-yellow-400" />
              <div>
                <span className="block text-sm font-bold">NABH-ready protocols</span>
                <span className="block text-xs text-slate-400">Strict clinical guidelines</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biography Modal */}
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
