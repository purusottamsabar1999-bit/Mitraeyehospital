/**
 * API client for Mitra Eye Hospital
 */

import { createClient } from '@supabase/supabase-js';
import {
  HospitalSettings,
  Service,
  Doctor,
  GalleryItem,
  ContactMessage,
  Testimonial,
  BlockedSlot,
  Appointment,
  AppointmentStatus
} from '../types';
import fallbackDb from '../../database.json';

const API_BASE = '/api';

// --- BROWSER DIRECT SUPABASE CONFIGURATION ---
const clientSupabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL as string) || 'https://admxrsxwydqvltlkfmne.supabase.co';
const clientSupabaseKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_3eAJ-ObILqdBfrCNPDW6DA_qWC6Re-r';

export const supabaseClient = createClient(clientSupabaseUrl, clientSupabaseKey);

// State to track whether we should use browser-direct Supabase connection (e.g., when deployed on Netlify)
let useDirectSupabase = false;

// Helper to get authorization header
function getAuthHeader() {
  const token = localStorage.getItem('admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Local cache database stored in localStorage for static offline support
const LOCAL_STORAGE_DB_KEY = 'mitraeye_local_db';

function getLocalDbCache(): any {
  const cached = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return fallbackDb;
}

function saveLocalDbCache(db: any) {
  localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(db));
}

// Direct Supabase query helpers
async function fetchFromSupabaseDirect(key: string) {
  try {
    const { data, error } = await supabaseClient
      .from('mitraeye_data')
      .select('data')
      .eq('id', key)
      .single();
    if (error) throw error;
    return data?.data;
  } catch (err) {
    console.warn(`Direct Supabase fetch for ${key} failed:`, err);
    return null;
  }
}

async function saveToSupabaseDirect(key: string, data: any) {
  try {
    const { error } = await supabaseClient
      .from('mitraeye_data')
      .upsert({ id: key, data });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn(`Direct Supabase save for ${key} failed:`, err);
    return false;
  }
}

// Synchronize entire client cache with Supabase if in direct mode
async function syncFromSupabaseDirect() {
  try {
    const { data, error } = await supabaseClient
      .from('mitraeye_data')
      .select('*');
    if (error) throw error;

    if (data && data.length > 0) {
      const db = getLocalDbCache();
      for (const row of data) {
        db[row.id] = row.data;
      }
      saveLocalDbCache(db);
      console.log('Successfully synchronized client-side cache with Supabase!');
    }
  } catch (err) {
    console.warn('Failed to sync client-side cache from Supabase:', err);
  }
}

// Proactively detect static environments (like Netlify) where the server-side Express backend is absent
(async () => {
  // If we are on netlify or other static hosts, the API might not exist or return 404
  try {
    const res = await fetch(`${API_BASE}/settings`, { method: 'HEAD' }).catch(() => null);
    if (!res || res.status === 404 || res.status > 500) {
      useDirectSupabase = true;
      console.log('Static hosting environment detected (e.g. Netlify). Direct Supabase fallback enabled.');
      await syncFromSupabaseDirect();
    }
  } catch {
    useDirectSupabase = true;
    console.log('Express API unreachable. Direct Supabase fallback enabled.');
    await syncFromSupabaseDirect();
  }
})();

// Helper to hash password on client-side (using browser subtle crypto)
async function hashPasswordClient(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const api = {
  // Public Settings
  getSettings: async (): Promise<HospitalSettings> => {
    if (useDirectSupabase) {
      return getLocalDbCache().settings || fallbackDb.settings;
    }
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getSettings failed, using local fallback:', err);
      return getLocalDbCache().settings || fallbackDb.settings;
    }
  },

  // Public Services
  getServices: async (): Promise<Service[]> => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      return (db.services || fallbackDb.services).filter((s: Service) => s.isActive !== false);
    }
    try {
      const res = await fetch(`${API_BASE}/services`);
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getServices failed, using local fallback:', err);
      const db = getLocalDbCache();
      return (db.services || fallbackDb.services).filter((s: Service) => s.isActive !== false);
    }
  },

  // Public Doctors
  getDoctors: async (): Promise<Doctor[]> => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      return (db.doctors || fallbackDb.doctors).filter((d: Doctor) => d.isActive !== false);
    }
    try {
      const res = await fetch(`${API_BASE}/doctors`);
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getDoctors failed, using local fallback:', err);
      const db = getLocalDbCache();
      return (db.doctors || fallbackDb.doctors).filter((d: Doctor) => d.isActive !== false);
    }
  },

  // Public Gallery
  getGallery: async (): Promise<GalleryItem[]> => {
    if (useDirectSupabase) {
      return getLocalDbCache().gallery || fallbackDb.gallery || [];
    }
    try {
      const res = await fetch(`${API_BASE}/gallery`);
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getGallery failed, using local fallback:', err);
      return getLocalDbCache().gallery || fallbackDb.gallery || [];
    }
  },

  // Submit Contact Form
  submitContact: async (data: {
    name: string;
    phone: string;
    email?: string;
    subject: string;
    message: string;
  }) => {
    // Always forward contact forms to Formspree
    try {
      await fetch('https://formspree.io/f/xzdljzyy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Mitra Eye Hospital - New Contact Inquiry (Netlify Direct)`,
          formType: 'Contact Inquiry',
          ...data,
          submittedAt: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn('Direct Formspree forward failed:', e);
    }

    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const newMsg: ContactMessage = {
        id: 'msg-' + Math.floor(1000 + Math.random() * 9000),
        ...data,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      if (!db.contact_messages) db.contact_messages = [];
      db.contact_messages.push(newMsg);
      saveLocalDbCache(db);
      await saveToSupabaseDirect('contact_messages', db.contact_messages);
      return { success: true, message: newMsg };
    }

    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit contact message');
    }
    return res.json();
  },

  // Submit Testimonial
  submitTestimonial: async (data: {
    patientName: string;
    rating: number;
    review: string;
  }) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const newTest: Testimonial = {
        id: 'tst-' + Math.floor(1000 + Math.random() * 9000),
        ...data,
        isApproved: false,
        createdAt: new Date().toISOString()
      };
      if (!db.testimonials) db.testimonials = [];
      db.testimonials.push(newTest);
      saveLocalDbCache(db);
      await saveToSupabaseDirect('testimonials', db.testimonials);
      return { success: true, testimonial: newTest };
    }

    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json();
  },

  // Get Approved Testimonials
  getApprovedTestimonials: async (): Promise<Testimonial[]> => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      return (db.testimonials || fallbackDb.testimonials || []).filter((t: Testimonial) => t.isApproved);
    }
    try {
      const res = await fetch(`${API_BASE}/testimonials`);
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getApprovedTestimonials failed, using local fallback:', err);
      const db = getLocalDbCache();
      return (db.testimonials || fallbackDb.testimonials || []).filter((t: Testimonial) => t.isApproved);
    }
  },

  // Check Slot Availability
  checkSlots: async (doctorId: string, date: string): Promise<{
    isBlockedDate: boolean;
    blockedReason?: string;
    bookedSlots: string[];
  }> => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const blocked = (db.blocked_slots || []).find((s: BlockedSlot) => s.doctorId === doctorId && s.blockedDate === date);
      const booked = (db.appointments || [])
        .filter((a: Appointment) => a.doctorId === doctorId && a.appointmentDate === date && a.status !== 'Cancelled')
        .map((a: Appointment) => a.appointmentTime);
      return {
        isBlockedDate: !!blocked,
        blockedReason: blocked?.reason,
        bookedSlots: booked
      };
    }
    const res = await fetch(`${API_BASE}/appointments/check-slots?doctorId=${doctorId}&date=${date}`);
    return res.json();
  },

  // Book Appointment
  bookAppointment: async (data: {
    patientName: string;
    phone: string;
    email?: string;
    age?: number;
    gender?: string;
    serviceId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    message?: string;
  }) => {
    // Resolve helper names for Formspree
    const db = getLocalDbCache();
    const doc = (db.doctors || []).find((d: Doctor) => d.id === data.doctorId);
    const srv = (db.services || []).find((s: Service) => s.id === data.serviceId);

    // Always forward appointments to Formspree
    try {
      await fetch('https://formspree.io/f/xzdljzyy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Mitra Eye Hospital - New Appointment Booking (Netlify Direct)`,
          formType: 'Appointment Booking',
          ...data,
          serviceName: srv ? srv.title : data.serviceId,
          doctorName: doc ? doc.name : data.doctorId,
          submittedAt: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn('Direct Formspree forward failed:', e);
    }

    if (useDirectSupabase) {
      const newAppt: Appointment = {
        id: 'apt-' + Math.floor(10000 + Math.random() * 90000),
        ...data,
        age: data.age || undefined,
        gender: data.gender as any || undefined,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      if (!db.appointments) db.appointments = [];
      db.appointments.push(newAppt);
      saveLocalDbCache(db);
      await saveToSupabaseDirect('appointments', db.appointments);
      return { success: true, appointment: newAppt };
    }

    const res = await fetch(`${API_BASE}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to book appointment');
    }
    return res.json();
  },

  // Admin Login
  adminLogin: async (username: string, passwordPlain: string) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const hashed = await hashPasswordClient(passwordPlain);
      const admin = (db.admin_users || []).find(
        (u: any) => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === hashed
      );
      if (admin) {
        admin.lastLogin = new Date().toISOString();
        saveLocalDbCache(db);
        await saveToSupabaseDirect('admin_users', db.admin_users);

        const fakeToken = 'Bearer admin-token-secret-key-123';
        localStorage.setItem('admin_token', fakeToken);
        localStorage.setItem('admin_user', JSON.stringify(admin));
        return { success: true, token: fakeToken, admin };
      } else {
        throw new Error('Invalid credentials (client fallback)');
      }
    }

    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: passwordPlain })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid credentials');
    }
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
    }
    return data;
  },

  // Admin Logout
  adminLogout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  // ==========================================
  // PROTECTED ADMIN API CALLS
  // ==========================================

  changePassword: async (username: string, newPasswordPlain: string) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const admin = (db.admin_users || []).find((u: any) => u.username.toLowerCase() === username.toLowerCase());
      if (admin) {
        admin.passwordHash = await hashPasswordClient(newPasswordPlain);
        saveLocalDbCache(db);
        await saveToSupabaseDirect('admin_users', db.admin_users);
        return { success: true };
      }
      throw new Error('Admin user not found');
    }

    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ username, newPassword: newPasswordPlain })
    });
    if (!res.ok) throw new Error('Failed to change password');
    return res.json();
  },

  updateSettings: async (settings: HospitalSettings) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      db.settings = settings;
      saveLocalDbCache(db);
      await saveToSupabaseDirect('settings', settings);
      return { success: true };
    }

    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update hospital settings');
    return res.json();
  },

  adminGetServices: async (): Promise<Service[]> => {
    if (useDirectSupabase) {
      return getLocalDbCache().services || [];
    }

    const res = await fetch(`${API_BASE}/admin/services`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Unauthorized or failed to fetch services');
    return res.json();
  },

  adminCreateService: async (data: Omit<Service, 'id'>) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const newService: Service = {
        id: 'srv-' + Math.floor(1000 + Math.random() * 9000),
        ...data
      };
      if (!db.services) db.services = [];
      db.services.push(newService);
      saveLocalDbCache(db);
      await saveToSupabaseDirect('services', db.services);
      return newService;
    }

    const res = await fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create service');
    return res.json();
  },

  adminUpdateService: async (id: string, data: Omit<Service, 'id'>) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.services || []).findIndex((s: Service) => s.id === id);
      if (index !== -1) {
        db.services[index] = { id, ...data };
        saveLocalDbCache(db);
        await saveToSupabaseDirect('services', db.services);
        return db.services[index];
      }
      throw new Error('Service not found');
    }

    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update service');
    return res.json();
  },

  adminDeleteService: async (id: string) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.services || []).findIndex((s: Service) => s.id === id);
      if (index !== -1) {
        db.services.splice(index, 1);
        saveLocalDbCache(db);
        await saveToSupabaseDirect('services', db.services);
        return { success: true };
      }
      throw new Error('Service not found');
    }

    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete service');
    return res.json();
  },

  adminGetDoctors: async (): Promise<Doctor[]> => {
    if (useDirectSupabase) {
      return getLocalDbCache().doctors || [];
    }

    const res = await fetch(`${API_BASE}/admin/doctors`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Unauthorized or failed to fetch doctors');
    return res.json();
  },

  adminCreateDoctor: async (data: Omit<Doctor, 'id'>) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const newDoctor: Doctor = {
        id: 'doc-' + Math.floor(1000 + Math.random() * 9000),
        ...data
      };
      if (!db.doctors) db.doctors = [];
      db.doctors.push(newDoctor);
      saveLocalDbCache(db);
      await saveToSupabaseDirect('doctors', db.doctors);
      return newDoctor;
    }

    const res = await fetch(`${API_BASE}/admin/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create doctor');
    return res.json();
  },

  adminUpdateDoctor: async (id: string, data: Omit<Doctor, 'id'>) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.doctors || []).findIndex((d: Doctor) => d.id === id);
      if (index !== -1) {
        db.doctors[index] = { id, ...data };
        saveLocalDbCache(db);
        await saveToSupabaseDirect('doctors', db.doctors);
        return db.doctors[index];
      }
      throw new Error('Doctor not found');
    }

    const res = await fetch(`${API_BASE}/admin/doctors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update doctor');
    return res.json();
  },

  adminDeleteDoctor: async (id: string) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.doctors || []).findIndex((d: Doctor) => d.id === id);
      if (index !== -1) {
        db.doctors.splice(index, 1);
        saveLocalDbCache(db);
        await saveToSupabaseDirect('doctors', db.doctors);
        return { success: true };
      }
      throw new Error('Doctor not found');
    }

    const res = await fetch(`${API_BASE}/admin/doctors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete doctor');
    return res.json();
  },

  adminCreateGallery: async (data: { title: string; image: string; category: string }) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const newItem: GalleryItem = {
        id: 'gal-' + Math.floor(1000 + Math.random() * 9000),
        title: data.title,
        image: data.image,
        category: data.category as any,
        createdAt: new Date().toISOString()
      };
      if (!db.gallery) db.gallery = [];
      db.gallery.push(newItem);
      saveLocalDbCache(db);
      await saveToSupabaseDirect('gallery', db.gallery);
      return newItem;
    }

    const res = await fetch(`${API_BASE}/admin/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add gallery item');
    return res.json();
  },

  adminDeleteGallery: async (id: string) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.gallery || []).findIndex((g: GalleryItem) => g.id === id);
      if (index !== -1) {
        db.gallery.splice(index, 1);
        saveLocalDbCache(db);
        await saveToSupabaseDirect('gallery', db.gallery);
        return { success: true };
      }
      throw new Error('Gallery item not found');
    }

    const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete gallery item');
    return res.json();
  },

  adminGetContact: async (): Promise<ContactMessage[]> => {
    if (useDirectSupabase) {
      return getLocalDbCache().contact_messages || [];
    }

    const res = await fetch(`${API_BASE}/admin/contact`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch contact messages');
    return res.json();
  },

  adminMarkContactRead: async (id: string, isRead: boolean) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.contact_messages || []).findIndex((m: ContactMessage) => m.id === id);
      if (index !== -1) {
        db.contact_messages[index].isRead = isRead;
        saveLocalDbCache(db);
        await saveToSupabaseDirect('contact_messages', db.contact_messages);
        return { success: true };
      }
      throw new Error('Contact message not found');
    }

    const res = await fetch(`${API_BASE}/admin/contact/${id}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ isRead })
    });
    if (!res.ok) throw new Error('Failed to update read status');
    return res.json();
  },

  adminDeleteContact: async (id: string) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.contact_messages || []).findIndex((m: ContactMessage) => m.id === id);
      if (index !== -1) {
        db.contact_messages.splice(index, 1);
        saveLocalDbCache(db);
        await saveToSupabaseDirect('contact_messages', db.contact_messages);
        return { success: true };
      }
      throw new Error('Contact message not found');
    }

    const res = await fetch(`${API_BASE}/admin/contact/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete contact message');
    return res.json();
  },

  adminGetTestimonials: async (): Promise<Testimonial[]> => {
    if (useDirectSupabase) {
      return getLocalDbCache().testimonials || [];
    }

    const res = await fetch(`${API_BASE}/admin/testimonials`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch testimonials');
    return res.json();
  },

  adminApproveTestimonial: async (id: string, isApproved: boolean) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.testimonials || []).findIndex((t: Testimonial) => t.id === id);
      if (index !== -1) {
        db.testimonials[index].isApproved = isApproved;
        saveLocalDbCache(db);
        await saveToSupabaseDirect('testimonials', db.testimonials);
        return { success: true };
      }
      throw new Error('Testimonial not found');
    }

    const res = await fetch(`${API_BASE}/admin/testimonials/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ isApproved })
    });
    if (!res.ok) throw new Error('Failed to update testimonial status');
    return res.json();
  },

  adminDeleteTestimonial: async (id: string) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.testimonials || []).findIndex((t: Testimonial) => t.id === id);
      if (index !== -1) {
        db.testimonials.splice(index, 1);
        saveLocalDbCache(db);
        await saveToSupabaseDirect('testimonials', db.testimonials);
        return { success: true };
      }
      throw new Error('Testimonial not found');
    }

    const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete testimonial');
    return res.json();
  },

  adminGetBlockedSlots: async (): Promise<BlockedSlot[]> => {
    if (useDirectSupabase) {
      return getLocalDbCache().blocked_slots || [];
    }

    const res = await fetch(`${API_BASE}/admin/blocked-slots`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch blocked slots');
    return res.json();
  },

  adminCreateBlockedSlot: async (data: { doctorId: string; blockedDate: string; reason: string }) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const newSlot: BlockedSlot = {
        id: 'blk-' + Math.floor(1000 + Math.random() * 9000),
        ...data,
        createdAt: new Date().toISOString()
      };
      if (!db.blocked_slots) db.blocked_slots = [];
      db.blocked_slots.push(newSlot);
      saveLocalDbCache(db);
      await saveToSupabaseDirect('blocked_slots', db.blocked_slots);
      return newSlot;
    }

    const res = await fetch(`${API_BASE}/admin/blocked-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create blocked slot');
    return res.json();
  },

  adminDeleteBlockedSlot: async (id: string) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.blocked_slots || []).findIndex((s: BlockedSlot) => s.id === id);
      if (index !== -1) {
        db.blocked_slots.splice(index, 1);
        saveLocalDbCache(db);
        await saveToSupabaseDirect('blocked_slots', db.blocked_slots);
        return { success: true };
      }
      throw new Error('Blocked slot not found');
    }

    const res = await fetch(`${API_BASE}/admin/blocked-slots/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete blocked slot');
    return res.json();
  },

  adminGetAppointments: async (): Promise<Appointment[]> => {
    if (useDirectSupabase) {
      return getLocalDbCache().appointments || [];
    }

    const res = await fetch(`${API_BASE}/admin/appointments`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  adminUpdateStatus: async (id: string, status: AppointmentStatus) => {
    if (useDirectSupabase) {
      const db = getLocalDbCache();
      const index = (db.appointments || []).findIndex((a: Appointment) => a.id === id);
      if (index !== -1) {
        db.appointments[index].status = status;
        saveLocalDbCache(db);
        await saveToSupabaseDirect('appointments', db.appointments);
        return { success: true };
      }
      throw new Error('Appointment not found');
    }

    const res = await fetch(`${API_BASE}/admin/appointments/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update appointment status');
    return res.json();
  },

  adminGetSupabaseStatus: async (): Promise<{
    status: 'connected' | 'not_configured' | 'error_missing_table';
    error: string | null;
    sql: string;
    config: { projectId: string; url: string };
  }> => {
    if (useDirectSupabase) {
      let status: 'connected' | 'not_configured' | 'error_missing_table' = 'connected';
      let error: string | null = null;
      try {
        const { error: testErr } = await supabaseClient.from('mitraeye_data').select('id').limit(1);
        if (testErr) {
          status = 'error_missing_table';
          error = testErr.message;
        }
      } catch (err: any) {
        status = 'not_configured';
        error = err.message || String(err);
      }

      const sqlScript = `-- MITRAEYE Supabase Setup Table Script
-- Copy and run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/admxrsxwydqvltlkfmne/sql):

create table if not exists public.mitraeye_data (
  id text primary key,
  data jsonb not null
);

-- Enable Row Level Security (RLS)
alter table public.mitraeye_data enable row level security;

-- Create policy to allow all public read & write access
create policy "Allow public read and write access"
on public.mitraeye_data
for all
using (true)
with check (true);
`;

      return {
        status,
        error,
        sql: sqlScript,
        config: {
          projectId: 'admxrsxwydqvltlkfmne',
          url: clientSupabaseUrl
        }
      };
    }

    const res = await fetch(`${API_BASE}/admin/supabase-status`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch Supabase status');
    return res.json();
  }
};
