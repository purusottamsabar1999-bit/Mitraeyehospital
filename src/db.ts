import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  Appointment,
  Doctor,
  Service,
  GalleryItem,
  ContactMessage,
  AdminUser,
  Testimonial,
  BlockedSlot,
  HospitalSettings,
  Gender,
  AppointmentStatus
} from './types';

const DB_FILE = path.join(process.cwd(), 'database.json');

export interface Database {
  appointments: Appointment[];
  doctors: Doctor[];
  services: Service[];
  gallery: GalleryItem[];
  contact_messages: ContactMessage[];
  admin_users: AdminUser[];
  testimonials: Testimonial[];
  blocked_slots: BlockedSlot[];
  settings: HospitalSettings;
}

// --- SUPABASE CLIENT INITIALIZATION ---
const rawSupabaseUrl = process.env.SUPABASE_URL || 'https://admxrsxwydqvltlkfmne.supabase.co';
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_3eAJ-ObILqdBfrCNPDW6DA_qWC6Re-r';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Status indicator for the admin portal
export let supabaseStatus: 'connected' | 'not_configured' | 'error_missing_table' = 'not_configured';
export let supabaseErrorDetails: string | null = null;

export async function syncFromSupabase() {
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    supabaseStatus = 'not_configured';
    return;
  }

  try {
    const { data, error } = await supabase
      .from('mitraeye_data')
      .select('*');

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        supabaseStatus = 'error_missing_table';
        supabaseErrorDetails = error.message;
        console.warn('Supabase table "mitraeye_data" does not exist yet. Please create it in your Supabase SQL Editor.');
        return;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('Supabase table "mitraeye_data" is empty. Seeding initial data...');
      const db = getDb();
      const keys = Object.keys(db) as Array<keyof Database>;
      for (const k of keys) {
        await supabase.from('mitraeye_data').upsert({ id: k, data: db[k] });
      }
      supabaseStatus = 'connected';
      console.log('Seeding to Supabase complete!');
    } else {
      const db = getDb();
      for (const row of data) {
        const k = row.id as keyof Database;
        if (db[k] !== undefined) {
          db[k] = row.data;
        }
      }
      saveDb(db);
      supabaseStatus = 'connected';
      console.log('Successfully loaded and synchronized data from Supabase!');
    }
  } catch (err: any) {
    console.error('Error syncing from Supabase:', err);
    supabaseStatus = 'error_missing_table';
    supabaseErrorDetails = err.message || String(err);
  }
}

export async function writeToSupabase<K extends keyof Database>(key: K, data: Database[K]) {
  if (supabaseStatus !== 'connected') {
    // If not connected, try to run a silent background sync again to check if the user created the table
    syncFromSupabase().catch(() => {});
    return;
  }

  try {
    const { error } = await supabase
      .from('mitraeye_data')
      .upsert({ id: key, data: data });

    if (error) {
      console.error(`Error saving key ${key} to Supabase:`, error);
    } else {
      console.log(`Successfully saved key ${key} to Supabase`);
    }
  } catch (err) {
    console.error(`Error saving key ${key} to Supabase:`, err);
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to write to JSON file
function saveDb(data: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}


// Helper to load and seed if needed
export function getDb(): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content) as Database;
    } catch (err) {
      console.error('Error reading database file, re-initializing...', err);
    }
  }

  // If we reach here, we need to create and seed the database
  const defaultDb: Database = {
    appointments: [],
    doctors: [
      {
        id: 'doc-001',
        name: 'Dr. Soumya Mitra',
        designation: 'Medical Director & Chief Eye Surgeon',
        specialty: 'Cataract, Refractive (LASIK) & IOL Specialist',
        qualification: 'MBBS, MS (Ophthalmology)',
        experienceYears: 16,
        photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
        bio: 'Dr. Soumya Mitra is a pioneer in advanced cataract surgery (Phacoemulsification) and specs removal (LASIK) in Southern Odisha. He has successfully performed over 10,000 laser eye procedures and phaco surgeries, bringing world-class ophthalmic care to Paralakhemundi.',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        availableTimeStart: '08:30',
        availableTimeEnd: '19:30',
        isActive: true
      },
      {
        id: 'doc-002',
        name: 'Dr. Amit Mitra',
        designation: 'Senior Consultant & Eye Specialist',
        specialty: 'Pediatric Ophthalmology, Squint & Glaucoma Specialist',
        qualification: 'MBBS, DNB (Ophthalmology), Fellow in Pediatric Ophthalmology',
        experienceYears: 11,
        photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop',
        bio: 'Dr. Amit Mitra is deeply dedicated to pediatric eye health and early vision disorders. He specializes in childhood squint treatment, pediatric cataract, and advanced laser/surgical management for glaucoma patients of all age groups.',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        availableTimeStart: '08:30',
        availableTimeEnd: '19:30', // Sunday stops earlier in application level
        isActive: true
      }
    ],
    services: [
      {
        id: 'srv-001',
        title: 'Comprehensive Eye Examination',
        shortDescription: 'Full diagnostic eye checkup using state-of-the-art computerised refraction and digital eye scanners.',
        fullDescription: 'Our comprehensive eye exam includes standard computerised vision testing, slit-lamp assessment, intraocular pressure checking for glaucoma, and detailed retinal evaluation. We recommend an annual checkup for everyone over 40 to monitor general eye health.',
        iconClass: 'Eye',
        image: '/src/assets/images/indian_eye_doctor_examination_1782808961021.jpg',
        isFeatured: true,
        sortOrder: 1,
        isActive: true
      },
      {
        id: 'srv-002',
        title: 'Cataract Surgery (Phacoemulsification)',
        shortDescription: 'Micro-incision, sutureless, painless cataract surgery with premium intraocular lens (IOL) implantation.',
        fullDescription: 'We perform advanced cold-phacoemulsification cataract surgery through a tiny, self-healing micro-incision. The clouded natural lens is dissolved and replaced with state-of-the-art Monofocal, Multifocal, or Toric Premium Foldable Lenses, allowing patients to resume normal activities within 24 hours.',
        iconClass: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=600&auto=format&fit=crop',
        isFeatured: true,
        sortOrder: 2,
        isActive: true
      },
      {
        id: 'srv-003',
        title: 'LASIK & Specs Removal Surgery',
        shortDescription: 'Advanced laser vision correction to permanently eliminate dependency on spectacles and contact lenses.',
        fullDescription: 'Regain natural crystal-clear vision with our highly precise LASIK laser procedures. By reshaping the cornea, we treat myopia (nearsightedness), hyperopia (farsightedness), and astigmatism safely and painlessly, with immediate visual recovery.',
        iconClass: 'Zap',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop',
        isFeatured: true,
        sortOrder: 3,
        isActive: true
      },
      {
        id: 'srv-004',
        title: 'Glaucoma Early Detection & Care',
        shortDescription: 'Digital tonometry, visual fields analysis, and specialized laser/surgical therapies to manage glaucoma.',
        fullDescription: 'Glaucoma is often called the "silent thief of sight." We offer advanced screening including Non-Contact Tonometry, Automated Perimetry (Visual Fields Study), and optical coherence tomography of the optic nerve to catch and treat glaucoma early before irreversible vision loss occurs.',
        iconClass: 'HeartPulse',
        image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=600&auto=format&fit=crop',
        isFeatured: true,
        sortOrder: 4,
        isActive: true
      },
      {
        id: 'srv-005',
        title: 'Retinal Disorders Treatment',
        shortDescription: 'Comprehensive management of Diabetic Retinopathy, Macular Degeneration, and retinal tears.',
        fullDescription: 'Our retina clinic manages sight-threatening conditions caused by diabetes, hypertension, and aging. We provide digital Fundus Photography, Retinal Laser Photocoagulation, and Intravitreal injections to preserve vision in patients with diabetic retinopathy and AMD.',
        iconClass: 'Activity',
        image: '/src/assets/images/retinal_treatment_india_1782809884470.jpg',
        isFeatured: false,
        sortOrder: 5,
        isActive: true
      },
      {
        id: 'srv-006',
        title: 'Pediatric Eye Care & Squint Clinic',
        shortDescription: 'Specialized eye checkups for children, management of lazy eye (amblyopia), and squint correction.',
        fullDescription: 'Children require specialized eye care as their vision systems are still developing. We diagnose and treat childhood refractive errors, lazy eyes, congenital cataracts, and provide modern non-surgical and surgical correction for squint and eye misalignment.',
        iconClass: 'Smile',
        image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop',
        isFeatured: false,
        sortOrder: 6,
        isActive: true
      },
      {
        id: 'srv-007',
        title: 'Community Eye Camps & Outreach',
        shortDescription: 'Free eye diagnostic and surgical camps across rural Gajapati district to combat preventable blindness.',
        fullDescription: 'As part of our social vision, Mitra Eye Hospital regularly conducts free eye checkup camps and distributes free medications in remote villages of Odisha. We also transport patients requiring cataract surgery to our base hospital for free or highly subsidized surgical procedures.',
        iconClass: 'MapPin',
        image: '/src/assets/images/rural_eye_camp_india_1782810264396.jpg',
        isFeatured: false,
        sortOrder: 7,
        isActive: true
      },
      {
        id: 'srv-008',
        title: 'Optics & Prescription Glasses',
        shortDescription: 'State-of-the-art optical dispensing unit with premium single-vision, bifocal, and progressive lenses.',
        fullDescription: 'Get perfectly fitted specs directly at our hospital. We feature an advanced in-house optical shop with premium anti-reflective, blue-cut, and progressive lenses, paired with lightweight, highly durable frames to suit all budgets.',
        iconClass: 'Glasses',
        image: '/src/assets/images/optical_dispensing_unit_1782810690453.jpg',
        isFeatured: false,
        sortOrder: 8,
        isActive: true
      }
    ],
    gallery: [
      {
        id: 'gal-001',
        title: 'Mitra Eye Hospital Front Entrance',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
        category: 'hospital',
        createdAt: new Date().toISOString()
      },
      {
        id: 'gal-002',
        title: 'Advanced Computerised Diagnosis Suite',
        image: '/src/assets/images/diagnostic_suite_1782811060432.jpg',
        category: 'hospital',
        createdAt: new Date().toISOString()
      },
      {
        id: 'gal-003',
        title: 'Sutureless Cataract Phaco Surgery in Action',
        image: '/src/assets/images/cataract_phaco_surgery_1782811419908.jpg',
        category: 'surgery',
        createdAt: new Date().toISOString()
      },
      {
        id: 'gal-004',
        title: 'Free Vision Screening Camp - Friends Colony Rural Outreach',
        image: '/src/assets/images/rural_eye_camp_outreach_1782811956304.jpg',
        category: 'camps',
        createdAt: new Date().toISOString()
      },
      {
        id: 'gal-005',
        title: 'Our Medical Team of Dedicated Specialists',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop',
        category: 'team',
        createdAt: new Date().toISOString()
      }
    ],
    contact_messages: [],
    admin_users: [
      {
        id: 'adm-001',
        username: 'admin',
        passwordHash: hashPassword('Admin@123'),
        fullName: 'Hospital Admin',
        role: 'superadmin'
      }
    ],
    testimonials: [
      {
        id: 'tst-001',
        patientName: 'Prashant Kumar Patra',
        rating: 5,
        review: 'Excellent service at Mitra Eye Hospital! My grandfather had painless cataract surgery here. He can see clearly now without any specs. Dr. Soumya Mitra is extremely polite and highly experienced. Best hospital in Paralakhemundi!',
        isApproved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'tst-002',
        patientName: 'Meenakshi Sabar',
        rating: 5,
        review: 'I visited for my daughter’s eye squint examination. Dr. Amit Mitra diagnosed it perfectly and prescribed visual exercises. Her eyes are showing great improvement. Very neat clinic, highly recommended for children.',
        isApproved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'tst-003',
        patientName: 'Santosh Jena',
        rating: 4,
        review: 'Very professional clinic. Best state-of-the-art instruments in Paralakhemundi. Staff is cooperative, and fees are affordable compared to big cities. Digital scanning was very thorough.',
        isApproved: true,
        createdAt: new Date().toISOString()
      }
    ],
    blocked_slots: [],
    settings: {
      hospitalName: 'Mitra Eye Hospital',
      tagline: 'Caring for Your Vision, Enriching Your Life',
      address: 'Government Medical Main Road, Opposite Catholic Church, Near Swaraj Tractor Showroom, Friends Colony, Paralakhemundi, Odisha – 761200',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.082987515286!2d84.0947889!3d18.7719411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3cf7e6f4c60abd%3A0x3f9b9001acedefe3!2sMITRA%20EYE%20HOSPITAL-%20PARALAKHEMUNDI!5e0!3m2!1sen!2sin!4v1719660000000!5m2!1sen!2sin',
      coordinates: {
        lat: 18.7719411,
        lng: 84.0947889
      },
      timingsWeekdays: 'Mon–Sat: 8:30 AM – 7:30 PM',
      timingsSunday: 'Sun: 8:30 AM – 12:30 PM',
      phone: '+91 91780 05136',
      email: 'purusottamsabar1999@gmail.com',
      whatsAppNumber: '+91 91780 05136'
    }
  };

  saveDb(defaultDb);
  return defaultDb;
}

// Global DB instance functions
export function getAppointments(): Appointment[] {
  return getDb().appointments;
}

export function saveAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment {
  const db = getDb();
  const nextId = 'MEH-' + Math.floor(10000 + Math.random() * 90000); // e.g. MEH-48312
  const newAppointment: Appointment = {
    ...appointment,
    id: nextId,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  db.appointments.push(newAppointment);
  saveDb(db);
  writeToSupabase('appointments', db.appointments);
  return newAppointment;
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus): boolean {
  const db = getDb();
  const index = db.appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    db.appointments[index].status = status;
    saveDb(db);
    writeToSupabase('appointments', db.appointments);
    return true;
  }
  return false;
}

export function getDoctors(): Doctor[] {
  return getDb().doctors.filter(d => d.isActive);
}

export function getAllDoctors(): Doctor[] {
  return getDb().doctors;
}

export function saveDoctor(doctor: Omit<Doctor, 'id'>): Doctor {
  const db = getDb();
  const nextId = 'doc-' + (db.doctors.length + 1).toString().padStart(3, '0');
  const newDoc: Doctor = { ...doctor, id: nextId };
  db.doctors.push(newDoc);
  saveDb(db);
  writeToSupabase('doctors', db.doctors);
  return newDoc;
}

export function updateDoctor(id: string, updated: Omit<Doctor, 'id'>): boolean {
  const db = getDb();
  const index = db.doctors.findIndex(d => d.id === id);
  if (index !== -1) {
    db.doctors[index] = { ...updated, id };
    saveDb(db);
    writeToSupabase('doctors', db.doctors);
    return true;
  }
  return false;
}

export function deleteDoctor(id: string): boolean {
  const db = getDb();
  const index = db.doctors.findIndex(d => d.id === id);
  if (index !== -1) {
    db.doctors[index].isActive = false; // Soft delete
    saveDb(db);
    writeToSupabase('doctors', db.doctors);
    return true;
  }
  return false;
}

export function getServices(): Service[] {
  return getDb().services.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getAllServices(): Service[] {
  return getDb().services.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function saveService(service: Omit<Service, 'id'>): Service {
  const db = getDb();
  const nextId = 'srv-' + (db.services.length + 1).toString().padStart(3, '0');
  const newSrv: Service = { ...service, id: nextId };
  db.services.push(newSrv);
  saveDb(db);
  writeToSupabase('services', db.services);
  return newSrv;
}

export function updateService(id: string, updated: Omit<Service, 'id'>): boolean {
  const db = getDb();
  const index = db.services.findIndex(s => s.id === id);
  if (index !== -1) {
    db.services[index] = { ...updated, id };
    saveDb(db);
    writeToSupabase('services', db.services);
    return true;
  }
  return false;
}

export function deleteService(id: string): boolean {
  const db = getDb();
  const index = db.services.findIndex(s => s.id === id);
  if (index !== -1) {
    db.services[index].isActive = false; // Soft delete
    saveDb(db);
    writeToSupabase('services', db.services);
    return true;
  }
  return false;
}

export function getGallery(): GalleryItem[] {
  return getDb().gallery;
}

export function saveGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt'>): GalleryItem {
  const db = getDb();
  const nextId = 'gal-' + (db.gallery.length + 1).toString().padStart(3, '0');
  const newItem: GalleryItem = {
    ...item,
    id: nextId,
    createdAt: new Date().toISOString()
  };
  db.gallery.push(newItem);
  saveDb(db);
  writeToSupabase('gallery', db.gallery);
  return newItem;
}

export function deleteGalleryItem(id: string): boolean {
  const db = getDb();
  const index = db.gallery.findIndex(g => g.id === id);
  if (index !== -1) {
    db.gallery.splice(index, 1);
    saveDb(db);
    writeToSupabase('gallery', db.gallery);
    return true;
  }
  return false;
}

export function getContactMessages(): ContactMessage[] {
  return getDb().contact_messages;
}

export function saveContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): ContactMessage {
  const db = getDb();
  const nextId = 'msg-' + Math.floor(1000 + Math.random() * 9000);
  const newMsg: ContactMessage = {
    ...msg,
    id: nextId,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  db.contact_messages.push(newMsg);
  saveDb(db);
  writeToSupabase('contact_messages', db.contact_messages);
  return newMsg;
}

export function markMessageRead(id: string, isRead: boolean): boolean {
  const db = getDb();
  const index = db.contact_messages.findIndex(m => m.id === id);
  if (index !== -1) {
    db.contact_messages[index].isRead = isRead;
    saveDb(db);
    writeToSupabase('contact_messages', db.contact_messages);
    return true;
  }
  return false;
}

export function deleteMessage(id: string): boolean {
  const db = getDb();
  const index = db.contact_messages.findIndex(m => m.id === id);
  if (index !== -1) {
    db.contact_messages.splice(index, 1);
    saveDb(db);
    writeToSupabase('contact_messages', db.contact_messages);
    return true;
  }
  return false;
}

export function getTestimonials(): Testimonial[] {
  return getDb().testimonials;
}

export function saveTestimonial(test: Omit<Testimonial, 'id' | 'createdAt' | 'isApproved'>): Testimonial {
  const db = getDb();
  const nextId = 'tst-' + Math.floor(1000 + Math.random() * 9000);
  const newTest: Testimonial = {
    ...test,
    id: nextId,
    isApproved: false, // require admin approval by default
    createdAt: new Date().toISOString()
  };
  db.testimonials.push(newTest);
  saveDb(db);
  writeToSupabase('testimonials', db.testimonials);
  return newTest;
}

export function approveTestimonial(id: string, isApproved: boolean): boolean {
  const db = getDb();
  const index = db.testimonials.findIndex(t => t.id === id);
  if (index !== -1) {
    db.testimonials[index].isApproved = isApproved;
    saveDb(db);
    writeToSupabase('testimonials', db.testimonials);
    return true;
  }
  return false;
}

export function deleteTestimonial(id: string): boolean {
  const db = getDb();
  const index = db.testimonials.findIndex(t => t.id === id);
  if (index !== -1) {
    db.testimonials.splice(index, 1);
    saveDb(db);
    writeToSupabase('testimonials', db.testimonials);
    return true;
  }
  return false;
}

export function getBlockedSlots(): BlockedSlot[] {
  return getDb().blocked_slots;
}

export function saveBlockedSlot(slot: Omit<BlockedSlot, 'id' | 'createdAt'>): BlockedSlot {
  const db = getDb();
  const nextId = 'blk-' + Math.floor(1000 + Math.random() * 9000);
  const newSlot: BlockedSlot = {
    ...slot,
    id: nextId,
    createdAt: new Date().toISOString()
  };
  db.blocked_slots.push(newSlot);
  saveDb(db);
  writeToSupabase('blocked_slots', db.blocked_slots);
  return newSlot;
}

export function deleteBlockedSlot(id: string): boolean {
  const db = getDb();
  const index = db.blocked_slots.findIndex(s => s.id === id);
  if (index !== -1) {
    db.blocked_slots.splice(index, 1);
    saveDb(db);
    writeToSupabase('blocked_slots', db.blocked_slots);
    return true;
  }
  return false;
}

export function getSettings(): HospitalSettings {
  return getDb().settings;
}

export function updateSettings(settings: HospitalSettings): void {
  const db = getDb();
  db.settings = settings;
  saveDb(db);
  writeToSupabase('settings', db.settings);
}

export function checkAdminLogin(username: string, passwordPlain: string): AdminUser | null {
  const db = getDb();
  const hashed = hashPassword(passwordPlain);
  const admin = db.admin_users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === hashed);
  if (admin) {
    // Update last login
    admin.lastLogin = new Date().toISOString();
    saveDb(db);
    writeToSupabase('admin_users', db.admin_users);
    return admin;
  }
  return null;
}

export function updateAdminPassword(username: string, newPasswordPlain: string): boolean {
  const db = getDb();
  const admin = db.admin_users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (admin) {
    admin.passwordHash = hashPassword(newPasswordPlain);
    saveDb(db);
    writeToSupabase('admin_users', db.admin_users);
    return true;
  }
  return false;
}

/**
 * Checks for double booking: returns true if slot is taken.
 * No double booking per doctor per slot (date + time).
 */
export function isSlotBooked(doctorId: string, date: string, time: string): boolean {
  const appointments = getAppointments();
  return appointments.some(
    a => a.doctorId === doctorId &&
         a.appointmentDate === date &&
         a.appointmentTime === time &&
         a.status !== 'Cancelled'
  );
}
