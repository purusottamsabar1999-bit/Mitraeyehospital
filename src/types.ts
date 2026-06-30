/**
 * Types and Interfaces for Mitra Eye Hospital
 */

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type Gender = 'Male' | 'Female' | 'Other';
export type GalleryCategory = 'hospital' | 'surgery' | 'team' | 'camps';
export type AdminRole = 'superadmin' | 'staff';

export interface Appointment {
  id: string; // e.g., MEH-10023
  patientName: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: Gender;
  serviceId: string;
  doctorId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  message?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  designation: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  photo: string; // Image URL or base64 or placeholder
  bio: string;
  availableDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  availableTimeStart: string; // "08:30"
  availableTimeEnd: string; // "19:30"
  isActive: boolean;
}

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconClass: string; // Lucide icon name, e.g., "Eye", "Activity"
  image?: string;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: GalleryCategory;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string; // Hashed password
  fullName: string;
  role: AdminRole;
  lastLogin?: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  rating: number; // 1 to 5
  review: string;
  isApproved: boolean;
  createdAt: string;
}

export interface BlockedSlot {
  id: string;
  doctorId: string; // "all" for hospital holidays
  blockedDate: string; // YYYY-MM-DD
  reason: string;
  createdAt: string;
}

export interface HospitalSettings {
  hospitalName: string;
  tagline: string;
  address: string;
  mapsEmbedUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timingsWeekdays: string; // e.g., "Mon–Sat: 8:30 AM – 7:30 PM"
  timingsSunday: string; // e.g., "Sun: 8:30 AM – 12:30 PM"
  phone: string;
  email: string;
  whatsAppNumber: string;
}
