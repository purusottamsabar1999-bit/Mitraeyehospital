/**
 * API client for Mitra Eye Hospital
 */

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

const API_BASE = '/api';

// Helper to get authorization header
function getAuthHeader() {
  const token = localStorage.getItem('admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Public Settings
  getSettings: async (): Promise<HospitalSettings> => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  // Public Services
  getServices: async (): Promise<Service[]> => {
    const res = await fetch(`${API_BASE}/services`);
    return res.json();
  },

  // Public Doctors
  getDoctors: async (): Promise<Doctor[]> => {
    const res = await fetch(`${API_BASE}/doctors`);
    return res.json();
  },

  // Public Gallery
  getGallery: async (): Promise<GalleryItem[]> => {
    const res = await fetch(`${API_BASE}/gallery`);
    return res.json();
  },

  // Submit Contact Form
  submitContact: async (data: {
    name: string;
    phone: string;
    email?: string;
    subject: string;
    message: string;
  }) => {
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
    const res = await fetch(`${API_BASE}/testimonials`);
    return res.json();
  },

  // Check Slot Availability
  checkSlots: async (doctorId: string, date: string): Promise<{
    isBlockedDate: boolean;
    blockedReason?: string;
    bookedSlots: string[];
  }> => {
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
  adminLogin: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
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

  changePassword: async (username: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ username, newPassword })
    });
    if (!res.ok) throw new Error('Failed to change password');
    return res.json();
  },

  updateSettings: async (settings: HospitalSettings) => {
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
    const res = await fetch(`${API_BASE}/admin/services`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Unauthorized or failed to fetch services');
    return res.json();
  },

  adminCreateService: async (data: Omit<Service, 'id'>) => {
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
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete service');
    return res.json();
  },

  adminGetDoctors: async (): Promise<Doctor[]> => {
    const res = await fetch(`${API_BASE}/admin/doctors`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Unauthorized or failed to fetch doctors');
    return res.json();
  },

  adminCreateDoctor: async (data: Omit<Doctor, 'id'>) => {
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
    const res = await fetch(`${API_BASE}/admin/doctors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete doctor');
    return res.json();
  },

  adminCreateGallery: async (data: { title: string; image: string; category: string }) => {
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
    const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete gallery item');
    return res.json();
  },

  adminGetContact: async (): Promise<ContactMessage[]> => {
    const res = await fetch(`${API_BASE}/admin/contact`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch contact messages');
    return res.json();
  },

  adminMarkContactRead: async (id: string, isRead: boolean) => {
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
    const res = await fetch(`${API_BASE}/admin/contact/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete contact message');
    return res.json();
  },

  adminGetTestimonials: async (): Promise<Testimonial[]> => {
    const res = await fetch(`${API_BASE}/admin/testimonials`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch testimonials');
    return res.json();
  },

  adminApproveTestimonial: async (id: string, isApproved: boolean) => {
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
    const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete testimonial');
    return res.json();
  },

  adminGetBlockedSlots: async (): Promise<BlockedSlot[]> => {
    const res = await fetch(`${API_BASE}/admin/blocked-slots`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch blocked slots');
    return res.json();
  },

  adminCreateBlockedSlot: async (data: { doctorId: string; blockedDate: string; reason: string }) => {
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
    const res = await fetch(`${API_BASE}/admin/blocked-slots/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete blocked slot');
    return res.json();
  },

  adminGetAppointments: async (): Promise<Appointment[]> => {
    const res = await fetch(`${API_BASE}/admin/appointments`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  adminUpdateStatus: async (id: string, status: AppointmentStatus) => {
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
    const res = await fetch(`${API_BASE}/admin/supabase-status`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch Supabase status');
    return res.json();
  }
};

