import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Printer,
  ChevronRight,
  Stethoscope,
  ChevronLeft,
  Share2
} from 'lucide-react';
import { HospitalSettings, Service, Doctor } from '../types';
import { api } from '../lib/api';

interface BookingViewProps {
  settings: HospitalSettings | null;
  services: Service[];
  doctors: Doctor[];
}

export default function BookingView({ settings, services, doctors }: BookingViewProps) {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    serviceId: '',
    doctorId: '',
    appointmentDate: '', // YYYY-MM-DD
    appointmentTime: '', // HH:MM
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Slot states
  const [availableDates, setAvailableDates] = useState<{ dateString: string; dayLabel: string; isSunday: boolean }[]>([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [slotStatus, setSlotStatus] = useState<{
    isBlockedDate: boolean;
    blockedReason?: string;
    bookedSlots: string[];
  } | null>(null);

  // Generate next 14 available calendar days for booking
  useEffect(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);

      // Format date key: YYYY-MM-DD
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;

      // Day label e.g., "Mon, Jun 29"
      const dayLabel = nextDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      const isSunday = nextDate.getDay() === 0;

      list.push({ dateString, dayLabel, isSunday });
    }
    setAvailableDates(list);
  }, []);

  // Check slots whenever selected doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.doctorId || !formData.appointmentDate) {
        setSlotStatus(null);
        return;
      }
      setCheckingSlots(true);
      setErrorMsg(null);
      try {
        const status = await api.checkSlots(formData.doctorId, formData.appointmentDate);
        setSlotStatus(status);
        // Clear selected time if it's no longer available
        if (status.isBlockedDate || status.bookedSlots.includes(formData.appointmentTime)) {
          setFormData(prev => ({ ...prev, appointmentTime: '' }));
        }
      } catch (err: any) {
        setErrorMsg('Failed to check slot availability. Please try again.');
      } finally {
        setCheckingSlots(false);
      }
    };
    fetchSlots();
  }, [formData.doctorId, formData.appointmentDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (dateStr: string) => {
    setFormData(prev => ({ ...prev, appointmentDate: dateStr, appointmentTime: '' }));
  };

  const handleTimeSelect = (timeStr: string) => {
    setFormData(prev => ({ ...prev, appointmentTime: timeStr }));
  };

  // Generate 30-min time slots based on day and hospital hours
  const generateSlots = () => {
    if (!formData.appointmentDate) return [];
    const selectedObj = availableDates.find(d => d.dateString === formData.appointmentDate);
    const isSunday = selectedObj ? selectedObj.isSunday : false;

    // Weekdays: 8:30 AM to 7:30 PM (last appointment slot is 7:00 PM)
    // Sunday: 8:30 AM to 12:30 PM (last appointment slot is 12:00 PM)
    const slots = [];
    const startHour = 8;
    const startMin = 30;
    const endHour = isSunday ? 12 : 19;
    const endMin = isSunday ? 0 : 30;

    let currHour = startHour;
    let currMin = startMin;

    while (currHour < endHour || (currHour === endHour && currMin <= endMin)) {
      const hh = String(currHour).padStart(2, '0');
      const mm = String(currMin).padStart(2, '0');
      const time24 = `${hh}:${mm}`;

      // Convert 24h to 12h label for user comfort
      const ampm = currHour >= 12 ? 'PM' : 'AM';
      const dispHour = currHour > 12 ? currHour - 12 : currHour;
      const displayLabel = `${dispHour}:${mm} ${ampm}`;

      slots.push({ value: time24, label: displayLabel });

      // Add 30 minutes
      currMin += 30;
      if (currMin >= 60) {
        currHour += 1;
        currMin = 0;
      }
    }
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (!formData.patientName || !formData.phone || !formData.serviceId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      setErrorMsg('Please complete all required fields (*)');
      setIsLoading(false);
      return;
    }

    // Basic Phone validation
    const phoneClean = formData.phone.replace(/[^0-9+]/g, '');
    if (phoneClean.length < 8) {
      setErrorMsg('Please enter a valid patient contact phone number');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined
      };
      const result = await api.bookAppointment(payload);
      setBookingSuccess(result.appointment);
      // Clear form
      setFormData({
        patientName: '',
        phone: '',
        email: '',
        age: '',
        gender: 'Male',
        serviceId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        message: ''
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while booking. Please try another slot.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format booking print card
  const handlePrint = () => {
    window.print();
  };

  // Generate WhatsApp CTA text
  const getWhatsAppLink = () => {
    if (!bookingSuccess) return '';
    const selectedDoc = doctors.find(d => d.id === bookingSuccess.doctorId);
    const selectedSrv = services.find(s => s.id === bookingSuccess.serviceId);

    const messageText = `Hello Mitra Eye Hospital! I have successfully booked an eye consultation checkup:
*Booking ID:* ${bookingSuccess.id}
*Patient Name:* ${bookingSuccess.patientName}
*Doctor:* ${selectedDoc?.name || 'Ophthalmologist'}
*Specialty:* ${selectedSrv?.title || 'Eye Care'}
*Date & Time:* ${bookingSuccess.appointmentDate} at ${bookingSuccess.appointmentTime}
Kindly confirm my booking! Thank you.`;

    const encodedText = encodeURIComponent(messageText);
    const whatsAppNum = settings?.whatsAppNumber || '+91 91780 05136';
    // Remove any + and non-numbers for api URL
    const cleanNum = whatsAppNum.replace(/[^0-9]/g, '');
    const finalNum = cleanNum === '9178005136' ? '919178005136' : cleanNum;
    return `https://wa.me/${finalNum}?text=${encodedText}`;
  };

  // If successfully booked
  if (bookingSuccess) {
    const matchedDoctor = doctors.find(d => d.id === bookingSuccess.doctorId);
    const matchedService = services.find(s => s.id === bookingSuccess.serviceId);

    return (
      <div className="w-full flex justify-center py-12 px-4 bg-slate-50" id="booking-success-screen">
        <div className="max-w-xl w-full bg-white border border-slate-150 p-6 sm:p-8 rounded-2xl shadow-lg text-left space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointment Scheduled!</h2>
            <p className="text-slate-500 text-sm">
              Your appointment request has been logged successfully and is currently <strong>Pending confirmation</strong>.
            </p>
          </div>

          {/* Printable Ticket */}
          <div id="booking-print-slip" className="border-2 border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50/50 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <span className="block font-bold text-slate-800 text-sm sm:text-base">MITRA EYE HOSPITAL</span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">Hospital Booking Card</span>
              </div>
              <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                ID: {bookingSuccess.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient Name</span>
                <span className="block font-semibold text-slate-800 mt-0.5">{bookingSuccess.patientName}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Phone</span>
                <span className="block font-semibold text-slate-800 mt-0.5">{bookingSuccess.phone}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ophthalmologist</span>
                <span className="block font-semibold text-slate-800 mt-0.5">{matchedDoctor?.name || 'Consultant Specialist'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Specialty / Service</span>
                <span className="block font-semibold text-slate-800 mt-0.5">{matchedService?.title || 'Eye Examination'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Schedule Date</span>
                <span className="block font-semibold text-slate-800 mt-0.5">{new Date(bookingSuccess.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Schedule Time</span>
                <span className="block font-semibold text-slate-800 mt-0.5">{bookingSuccess.appointmentTime}</span>
              </div>
            </div>

            <div className="h-px bg-slate-200 my-2"></div>
            <p className="text-[10px] text-slate-400 leading-normal text-center">
              Please carry this receipt to the front desk 15 minutes before your scheduled slot.<br />
              <strong>Mitra Eye Hospital:</strong> Govt. Medical Main Road, Paralakhemundi.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="flex-grow py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow"
            >
              <Share2 className="w-4 h-4" />
              Confirm via WhatsApp
            </a>
            <button
              onClick={handlePrint}
              className="py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Ticket
            </button>
            <button
              onClick={() => setBookingSuccess(null)}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col py-12 px-4 bg-slate-50" id="booking-form-screen">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">Scheduler Slot</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Schedule Eye Checkup
          </h1>
          <p className="text-slate-500 text-sm">
            Complete the form below to lock in an ophthalmologist consulting slot. Our scheduling engine checks conflicts dynamically.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl text-rose-800 text-left text-sm font-medium flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left" id="appointment-booking-main-form">
          {/* Left panel: Patient Details */}
          <div className="lg:col-span-7 bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-blue-500" />
              Patient Information
            </h3>

            <div>
              <label htmlFor="patient-name-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Patient Full Name *
              </label>
              <input
                type="text"
                id="patient-name-inp"
                name="patientName"
                required
                value={formData.patientName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                placeholder="Enter full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="patient-phone-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  id="patient-phone-inp"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                  placeholder="e.g. +91 91780 05136"
                />
              </div>
              <div>
                <label htmlFor="patient-email-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  id="patient-email-inp"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                  placeholder="e.g. name@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="patient-age-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Patient Age (Years) *
                </label>
                <input
                  type="number"
                  id="patient-age-inp"
                  name="age"
                  required
                  min="0"
                  max="125"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                  placeholder="Enter patient age"
                />
              </div>
              <div>
                <label htmlFor="patient-gender-sel" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Patient Gender *
                </label>
                <select
                  id="patient-gender-sel"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-service-sel" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Clinical Service *
                </label>
                <select
                  id="booking-service-sel"
                  name="serviceId"
                  required
                  value={formData.serviceId}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                >
                  <option value="">-- Choose Eye Specialty --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="booking-doctor-sel" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Ophthalmologist *
                </label>
                <select
                  id="booking-doctor-sel"
                  name="doctorId"
                  required
                  value={formData.doctorId}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none"
                >
                  <option value="">-- Choose Specialist Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="patient-message-inp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ocular Message / Symptoms (Optional)
              </label>
              <textarea
                id="patient-message-inp"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition-colors focus:outline-none resize-none"
                placeholder="Briefly explain any current symptoms, pain, or history"
              ></textarea>
            </div>
          </div>

          {/* Right panel: Calendar & Timings */}
          <div className="lg:col-span-5 bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                Select Slot Date & Time
              </h3>

              {!formData.doctorId && (
                <div className="py-8 text-center text-slate-400 text-xs sm:text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                  <Stethoscope className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  Please select an Ophthalmologist first to view their consulting calendar.
                </div>
              )}

              {formData.doctorId && (
                <div className="space-y-4">
                  {/* Visual Date Selection Strip */}
                  <div>
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      1. Consultation Date *
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {availableDates.map((d) => {
                        const isSelected = formData.appointmentDate === d.dateString;
                        return (
                          <button
                            key={d.dateString}
                            type="button"
                            onClick={() => handleDateSelect(d.dateString)}
                            className={`p-2.5 rounded-xl text-center border transition-all duration-150 flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">{d.dayLabel.split(',')[0]}</span>
                            <span className="text-sm font-bold mt-0.5">{d.dayLabel.split(',')[1]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checking status indicators */}
                  {checkingSlots && (
                    <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      Checking clinician availability...
                    </div>
                  )}

                  {/* Visual Time Slots Selection */}
                  {formData.appointmentDate && !checkingSlots && (
                    <div>
                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        2. Consulting Time Slot *
                      </span>

                      {slotStatus?.isBlockedDate ? (
                        <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs flex gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{slotStatus.blockedReason || 'Clinician is on leave. Please choose another date.'}</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                          {generateSlots().map((slot) => {
                            const isBooked = slotStatus?.bookedSlots.includes(slot.value);
                            const isSelected = formData.appointmentTime === slot.value;

                            return (
                              <button
                                key={slot.value}
                                type="button"
                                disabled={isBooked}
                                onClick={() => handleTimeSelect(slot.value)}
                                className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                                  isBooked
                                    ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isLoading || checkingSlots}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                id="booking-submit-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking Slot Conflicts...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Lock Booking Slot
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
