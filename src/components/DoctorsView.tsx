import React, { useState } from 'react';
import { Stethoscope, Calendar, Clock, Star, ShieldCheck, X } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorsViewProps {
  doctors: Doctor[];
  setCurrentTab: (tab: string) => void;
}

export default function DoctorsView({ doctors, setCurrentTab }: DoctorsViewProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  return (
    <div className="w-full flex flex-col py-12 px-4 bg-slate-50" id="doctors-view-container">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">Our Faculty</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Meet Our Senior Ophthalmologists
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Our surgical staff hold post-graduate specializations with fellowships in premium cataract phaco, LASIK cornea correction, pediatric squint, and advanced retinal health.
          </p>
        </div>

        {/* Doctors Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left hover:border-blue-200 group"
            >
              {/* Doctor Avatar */}
              <div className="relative shrink-0">
                <img
                  src={doc.photo}
                  alt={doc.name}
                  className="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-2xl border border-slate-100 shadow-xs group-hover:scale-[1.02] transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg border border-white text-xs font-bold flex items-center gap-1 shadow-sm font-mono">
                  Active
                </span>
              </div>

              {/* Doctor Profile info */}
              <div className="flex flex-col justify-between flex-grow text-slate-900">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-xl font-bold">{doc.name}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      <Star className="w-3 h-3 fill-amber-500" />
                      4.9
                    </div>
                  </div>
                  <span className="block text-xs font-bold font-mono uppercase tracking-widest text-blue-600">
                    {doc.designation}
                  </span>
                  <p className="text-sm font-semibold text-slate-600">{doc.specialty}</p>
                  <p className="text-xs text-slate-400 font-medium font-mono">{doc.qualification}</p>
                  <p className="text-xs text-slate-500 font-semibold font-mono">
                    Experience: {doc.experienceYears} Years
                  </p>
                </div>

                <div className="h-px bg-slate-100 my-4"></div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    View Biography & Hours
                  </button>
                  <button
                    onClick={() => setCurrentTab('booking')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Consultation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* OPD consulting hours notice card */}
        <div className="bg-white border border-slate-150 p-6 sm:p-8 rounded-2xl max-w-3xl mx-auto text-left flex flex-col sm:flex-row gap-6 items-center">
          <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl shrink-0">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-lg">Hospital consulting times</h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Our OPD works from Monday to Saturday, <strong>8:30 AM to 7:30 PM</strong>. Sunday services run from <strong>8:30 AM to 12:30 PM</strong>. Please book your appointment slots in advance or verify doctor-specific holiday notifications on our scheduler page before visiting.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 font-mono">
              <ShieldCheck className="w-4 h-4" />
              Emergency trauma support is active 24/7.
            </span>
          </div>
        </div>
      </div>

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
