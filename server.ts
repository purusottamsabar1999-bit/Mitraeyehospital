import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getDb,
  getSettings,
  updateSettings,
  getServices,
  getAllServices,
  saveService,
  updateService,
  deleteService,
  getDoctors,
  getAllDoctors,
  saveDoctor,
  updateDoctor,
  deleteDoctor,
  getGallery,
  saveGalleryItem,
  deleteGalleryItem,
  getContactMessages,
  saveContactMessage,
  markMessageRead,
  deleteMessage,
  getTestimonials,
  saveTestimonial,
  approveTestimonial,
  deleteTestimonial,
  getBlockedSlots,
  saveBlockedSlot,
  deleteBlockedSlot,
  getAppointments,
  saveAppointment,
  updateAppointmentStatus,
  checkAdminLogin,
  updateAdminPassword,
  isSlotBooked
} from './src/db';

const app = express();
const PORT = 3000;

// Set up large JSON body limits to support persistent base64 image uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Simple Bearer token verification middleware for admin routes
const ADMIN_TOKEN = 'Bearer admin-token-secret-key-123';

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader === ADMIN_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Admin session is invalid or expired' });
  }
}

// ==========================================
// 1. PUBLIC API ROUTES
// ==========================================

// Get Hospital Settings
app.get('/api/settings', (req, res) => {
  res.json(getSettings());
});

// Get Active Services
app.get('/api/services', (req, res) => {
  res.json(getServices());
});

// Get Active Doctors
app.get('/api/doctors', (req, res) => {
  res.json(getDoctors());
});

// Get Gallery Items
app.get('/api/gallery', (req, res) => {
  res.json(getGallery());
});

// Helper to forward submissions to Formspree
async function forwardToFormspree(formType: string, data: any) {
  try {
    const fetchFn = (globalThis as any).fetch || (typeof fetch !== 'undefined' ? fetch : null);
    if (!fetchFn) {
      console.warn('Fetch is not available in this environment; skipping Formspree forwarding.');
      return;
    }
    const response = await fetchFn('https://formspree.io/f/xzdljzyy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `Mitra Eye Hospital - New ${formType} Submission`,
        formType: formType,
        ...data,
        submittedAt: new Date().toISOString()
      })
    });
    if (!response.ok) {
      console.error(`Formspree error for ${formType}: Received status ${response.status}`);
    } else {
      console.log(`Successfully forwarded ${formType} submission to Formspree.`);
    }
  } catch (err) {
    console.error(`Failed to forward ${formType} submission to Formspree:`, err);
  }
}

// Submit Contact Message
app.post('/api/contact', (req, res) => {
  const { name, phone, email, subject, message } = req.body;
  if (!name || !phone || !subject || !message) {
    return res.status(400).json({ error: 'Name, phone, subject, and message are required.' });
  }
  const newMsg = saveContactMessage({ name, phone, email, subject, message });
  
  // Forward to Formspree asynchronously
  forwardToFormspree('Contact Inquiry', {
    name,
    phone,
    email: email || 'Not provided',
    subject,
    message
  });

  res.json({ success: true, message: newMsg });
});

// Submit Testimonial
app.post('/api/testimonials', (req, res) => {
  const { patientName, rating, review } = req.body;
  if (!patientName || !rating || !review) {
    return res.status(400).json({ error: 'Patient name, rating, and review are required.' });
  }
  const newTest = saveTestimonial({ patientName, rating: Number(rating), review });
  res.json({ success: true, testimonial: newTest });
});

// Get Approved Testimonials
app.get('/api/testimonials', (req, res) => {
  const list = getTestimonials().filter(t => t.isApproved);
  res.json(list);
});

// Admin Login Route
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const user = checkAdminLogin(username, password);
  if (user) {
    res.json({
      success: true,
      token: 'admin-token-secret-key-123',
      admin: {
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Get Booked & Blocked slots for a doctor on a specific date
app.get('/api/appointments/check-slots', (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ error: 'doctorId and date parameters are required.' });
  }

  const reqDocId = String(doctorId);
  const reqDate = String(date);

  // Check if hospital-wide or doctor-specific leave exists
  const blocked = getBlockedSlots().some(
    b => (b.doctorId === 'all' || b.doctorId === reqDocId) && b.blockedDate === reqDate
  );

  if (blocked) {
    return res.json({ isBlockedDate: true, blockedReason: 'Doctor is on leave or it is a hospital holiday.', bookedSlots: [] });
  }

  // Get booked times for this doctor on this date
  const booked = getAppointments()
    .filter(a => a.doctorId === reqDocId && a.appointmentDate === reqDate && a.status !== 'Cancelled')
    .map(a => a.appointmentTime);

  res.json({ isBlockedDate: false, bookedSlots: booked });
});

// Patient Self Booking Route
app.post('/api/appointments/book', (req, res) => {
  const { patientName, phone, email, age, gender, serviceId, doctorId, appointmentDate, appointmentTime, message } = req.body;

  if (!patientName || !phone || !serviceId || !doctorId || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'Name, phone, service, doctor, date, and time are required.' });
  }

  // Double-booking check
  if (isSlotBooked(doctorId, appointmentDate, appointmentTime)) {
    return res.status(409).json({ error: 'This appointment slot is already booked. Please choose another time.' });
  }

  // Check blocked slot
  const isBlocked = getBlockedSlots().some(
    b => (b.doctorId === 'all' || b.doctorId === doctorId) && b.blockedDate === appointmentDate
  );
  if (isBlocked) {
    return res.status(409).json({ error: 'The doctor is not available on this date.' });
  }

  const appt = saveAppointment({
    patientName,
    phone,
    email,
    age: age ? Number(age) : undefined,
    gender,
    serviceId,
    doctorId,
    appointmentDate,
    appointmentTime,
    message
  });

  // Resolve doctor and service names for a richer Formspree notification email
  const doc = getDoctors().find(d => d.id === doctorId);
  const srv = getServices().find(s => s.id === serviceId);

  // Forward to Formspree asynchronously
  forwardToFormspree('Appointment Booking', {
    patientName,
    phone,
    email: email || 'Not provided',
    age: age || 'Not provided',
    gender: gender || 'Not provided',
    serviceName: srv ? srv.title : serviceId,
    doctorName: doc ? doc.name : doctorId,
    appointmentDate,
    appointmentTime,
    message: message || 'None'
  });

  res.json({ success: true, appointment: appt });
});

// ==========================================
// 2. PROTECTED ADMIN API ROUTES (require requireAdmin)
// ==========================================

// Change Admin Password
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username and new password are required' });
  }
  const ok = updateAdminPassword(username, newPassword);
  if (ok) {
    res.json({ success: true, message: 'Password updated successfully' });
  } else {
    res.status(404).json({ error: 'Admin user not found' });
  }
});

// Update Hospital Settings
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  updateSettings(req.body);
  res.json({ success: true, settings: getSettings() });
});

// Manage Services
app.get('/api/admin/services', requireAdmin, (req, res) => {
  res.json(getAllServices());
});

app.post('/api/admin/services', requireAdmin, (req, res) => {
  const newSrv = saveService(req.body);
  res.json({ success: true, service: newSrv });
});

app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
  const ok = updateService(req.params.id, req.body);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

app.delete('/api/admin/services/:id', requireAdmin, (req, res) => {
  const ok = deleteService(req.params.id);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

// Manage Doctors
app.get('/api/admin/doctors', requireAdmin, (req, res) => {
  res.json(getAllDoctors());
});

app.post('/api/admin/doctors', requireAdmin, (req, res) => {
  const newDoc = saveDoctor(req.body);
  res.json({ success: true, doctor: newDoc });
});

app.put('/api/admin/doctors/:id', requireAdmin, (req, res) => {
  const ok = updateDoctor(req.params.id, req.body);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

app.delete('/api/admin/doctors/:id', requireAdmin, (req, res) => {
  const ok = deleteDoctor(req.params.id);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

// Manage Gallery
app.post('/api/admin/gallery', requireAdmin, (req, res) => {
  const newItem = saveGalleryItem(req.body);
  res.json({ success: true, item: newItem });
});

app.delete('/api/admin/gallery/:id', requireAdmin, (req, res) => {
  const ok = deleteGalleryItem(req.params.id);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Gallery item not found' });
  }
});

// Manage Contact Messages
app.get('/api/admin/contact', requireAdmin, (req, res) => {
  res.json(getContactMessages());
});

app.put('/api/admin/contact/:id/read', requireAdmin, (req, res) => {
  const ok = markMessageRead(req.params.id, req.body.isRead);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

app.delete('/api/admin/contact/:id', requireAdmin, (req, res) => {
  const ok = deleteMessage(req.params.id);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

// Manage Testimonials
app.get('/api/admin/testimonials', requireAdmin, (req, res) => {
  res.json(getTestimonials());
});

app.put('/api/admin/testimonials/:id/approve', requireAdmin, (req, res) => {
  const ok = approveTestimonial(req.params.id, req.body.isApproved);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Testimonial not found' });
  }
});

app.delete('/api/admin/testimonials/:id', requireAdmin, (req, res) => {
  const ok = deleteTestimonial(req.params.id);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Testimonial not found' });
  }
});

// Manage Blocked Slots
app.get('/api/admin/blocked-slots', requireAdmin, (req, res) => {
  res.json(getBlockedSlots());
});

app.post('/api/admin/blocked-slots', requireAdmin, (req, res) => {
  const newSlot = saveBlockedSlot(req.body);
  res.json({ success: true, slot: newSlot });
});

app.delete('/api/admin/blocked-slots/:id', requireAdmin, (req, res) => {
  const ok = deleteBlockedSlot(req.params.id);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Blocked slot not found' });
  }
});

// Manage Appointments
app.get('/api/admin/appointments', requireAdmin, (req, res) => {
  res.json(getAppointments());
});

app.put('/api/admin/appointments/:id/status', requireAdmin, (req, res) => {
  const ok = updateAppointmentStatus(req.params.id, req.body.status);
  if (ok) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// Ensure database is initialized at start
getDb();

import { syncFromSupabase, supabaseStatus, supabaseErrorDetails } from './src/db';

// Sync with Supabase at startup
syncFromSupabase().then(() => {
  console.log('Initial sync with Supabase completed or evaluated.');
}).catch((err) => {
  console.error('Failed to run initial Supabase sync:', err);
});

// Admin-only route to check Supabase status and get instruction scripts
app.get('/api/admin/supabase-status', requireAdmin, (req, res) => {
  const sqlScript = `-- MITRAEYE Supabase Setup Table Script
-- Copy and run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/${process.env.SUPABASE_PROJECT_ID || 'admxrsxwydqvltlkfmne'}/sql):

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

  res.json({
    status: supabaseStatus,
    error: supabaseErrorDetails,
    sql: sqlScript,
    config: {
      projectId: process.env.SUPABASE_PROJECT_ID || 'admxrsxwydqvltlkfmne',
      url: process.env.SUPABASE_URL || 'https://admxrsxwydqvltlkfmne.supabase.co'
    }
  });
});

// ==========================================
// 3. VITE MIDDLEWARE & CLIENT SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mitra Eye Hospital full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
