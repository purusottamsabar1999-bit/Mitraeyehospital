import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';
import { HospitalSettings } from '../types';
import { api } from '../lib/api';

interface ContactViewProps {
  settings: HospitalSettings | null;
}

export default function ContactView({ settings }: ContactViewProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formattedPhone = settings?.phone || '+91 9178005136';
  const formattedEmail = settings?.email || 'info@mitraeyehospital.com';
  const formattedAddress = settings?.address || 'Government Medical Main Road, Paralakhemundi, Odisha – 761200';
  const formattedTimingsWeekdays = settings?.timingsWeekdays || 'Mon–Sat: 8:30 AM – 7:30 PM';
  const formattedTimingsSunday = settings?.timingsSunday || 'Sun: 8:30 AM – 12:30 PM';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
      setStatusMsg({ type: 'error', text: 'Please fill in all required fields marked with *' });
      setIsLoading(false);
      return;
    }

    try {
      await api.submitContact(formData);
      setStatusMsg({ type: 'success', text: 'Thank you! Your message has been submitted. Our team will contact you shortly.' });
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to submit enquiry. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col py-12 px-4 bg-slate-50" id="contact-view-container">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Intro header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">Contact Us</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Get In Touch With Us
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Have questions about clinical procedures, consultation timings, or eye camp schedules? Fill in our enquiry form or call us directly.
          </p>
        </div>

        {/* Contact info cards + form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Coordinates cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Hospital Coordinates</h2>

            {/* Address Card */}
            <div className="bg-white border border-slate-150 p-5 rounded-2xl flex gap-4 shadow-xs">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Address Location</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {formattedAddress}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  Opposite Catholic Church, Near Swaraj Tractor Showroom, Friends Colony
                </p>
              </div>
            </div>

            {/* Calling Card */}
            <div className="bg-white border border-slate-150 p-5 rounded-2xl flex gap-4 shadow-xs">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Emergency & Consulting Contacts</h4>
                <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                  OPD Line: <a href={`tel:${formattedPhone}`} className="hover:text-blue-600 text-slate-800 underline">{formattedPhone}</a>
                </p>
                <p className="text-xs text-slate-400">
                  Call for appointments, blocked dates, or general eye health inquiries.
                </p>
              </div>
            </div>

            {/* Mail Card */}
            <div className="bg-white border border-slate-150 p-5 rounded-2xl flex gap-4 shadow-xs">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Support Mail ID</h4>
                <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                  Email: <a href={`mailto:${formattedEmail}`} className="hover:text-blue-600 text-slate-800 underline">{formattedEmail}</a>
                </p>
                <p className="text-xs text-slate-400">
                  We answer hospital support queries within 24 working hours.
                </p>
              </div>
            </div>

            {/* Consulting timings card */}
            <div className="bg-white border border-slate-150 p-5 rounded-2xl flex gap-4 shadow-xs">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Hospital Consulting Hours</h4>
                <p className="text-slate-600 text-xs sm:text-sm font-semibold">{formattedTimingsWeekdays}</p>
                <p className="text-slate-600 text-xs sm:text-sm font-semibold">{formattedTimingsSunday}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form panel */}
          <div className="lg:col-span-7 bg-white border border-slate-150 p-6 sm:p-8 rounded-2xl shadow-sm text-left">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Send Ocular Inquiry</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Fill in the form below. Our support administrators will review your message and reach back.
            </p>

            {statusMsg && (
              <div
                className={`p-4 rounded-xl border flex gap-3 items-start mb-6 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-150'
                    : 'bg-rose-50 text-rose-800 border-rose-150'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="text-xs sm:text-sm font-medium">{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="contact-enquiry-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    id="name-inp"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label htmlFor="phone-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone-inp"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                    placeholder="e.g. +91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  id="email-inp"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label htmlFor="subject-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject-inp"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                  placeholder="e.g. Inquiry about Cataract surgery"
                />
              </div>

              <div>
                <label htmlFor="msg-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Message / Symptoms *
                </label>
                <textarea
                  id="msg-inp"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none resize-none"
                  placeholder="Describe your ocular symptoms or question"
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all duration-200 shadow hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  id="submit-contact-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Enquiry...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Enquiry Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dynamic map widget details */}
        <div className="h-[380px] rounded-3xl overflow-hidden border border-slate-150 shadow-sm">
          <iframe
            src={settings?.mapsEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.082987515286!2d84.0947889!3d18.7719411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3cf7e6f4c60abd%3A0x3f9b9001acedefe3!2sMITRA%20EYE%20HOSPITAL-%20PARALAKHEMUNDI!5e0!3m2!1sen!2sin!4v1719660000000!5m2!1sen!2sin"}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mitra Eye Hospital Map Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
