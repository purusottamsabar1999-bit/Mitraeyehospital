import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sliders,
  Calendar,
  Users,
  Eye,
  LogOut,
  Mail,
  Settings as SettingsIcon,
  MessageSquare,
  Lock,
  Plus,
  Trash,
  Edit,
  Check,
  X,
  Printer,
  ChevronRight,
  ChevronLeft,
  Loader2,
  TrendingUp,
  Image as ImageIcon,
  CheckSquare,
  XSquare,
  Info,
  CalendarDays,
  Camera,
  Search,
  Activity,
  UserCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  HospitalSettings,
  Service,
  Doctor,
  GalleryItem,
  ContactMessage,
  Testimonial,
  BlockedSlot,
  Appointment,
  AppointmentStatus,
  Gender
} from '../types';
import { api } from '../lib/api';

interface AdminPanelProps {
  settings: HospitalSettings | null;
  setSettings: (settings: HospitalSettings) => void;
  services: Service[];
  setServices: (services: Service[]) => void;
  doctors: Doctor[];
  setDoctors: (doctors: Doctor[]) => void;
  gallery: GalleryItem[];
  setGallery: (gallery: GalleryItem[]) => void;
  onLogout?: () => void;
}

type AdminSubTab = 'dashboard' | 'appointments' | 'patients' | 'doctors' | 'services' | 'gallery' | 'messages' | 'settings';

export default function AdminPanel({
  settings,
  setSettings,
  services,
  setServices,
  doctors,
  setDoctors,
  gallery,
  setGallery,
  onLogout
}: AdminPanelProps) {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Core Admin Active Tab
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('dashboard');

  // DB Data fetched from API
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Selected details / Editing modes states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<{ phone: string; name: string } | null>(null);

  // Doctors Form States
  const [docEditingId, setDocEditingId] = useState<string | null>(null);
  const [docFormData, setDocFormData] = useState({
    name: '',
    designation: '',
    specialty: '',
    qualification: '',
    experienceYears: 10,
    photo: '',
    bio: '',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableTimeStart: '08:30',
    availableTimeEnd: '19:30',
    isActive: true
  });

  // Services Form States
  const [srvEditingId, setSrvEditingId] = useState<string | null>(null);
  const [srvFormData, setSrvFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    iconClass: 'Eye',
    image: '',
    isFeatured: false,
    sortOrder: 0,
    isActive: true
  });

  // Gallery Form States
  const [galFormData, setGalFormData] = useState({
    title: '',
    image: '',
    category: 'hospital'
  });

  // Settings State
  const [settingsFormData, setSettingsFormData] = useState<HospitalSettings | null>(null);
  const [blockedSlotFormData, setBlockedSlotFormData] = useState({
    doctorId: 'all',
    blockedDate: '',
    reason: ''
  });
  const [passwordChangeData, setPasswordChangeData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Action status indicators
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Supabase Connection Status
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'not_configured' | 'error_missing_table' | 'loading'>('loading');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [supabaseSql, setSupabaseSql] = useState<string>('');
  const [supabaseConfig, setSupabaseConfig] = useState<{ projectId: string; url: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Check login on load
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoggedIn(true);
      fetchAdminData();
    }
  }, []);

  // Sync settings form once settings load
  useEffect(() => {
    if (settings) {
      setSettingsFormData(settings);
    }
  }, [settings]);

  // Fetch admin-related datasets from Express backend
  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const [appts, msgs, tests, blks, srvs, docs, sbStatus] = await Promise.all([
        api.adminGetAppointments(),
        api.adminGetContact(),
        api.adminGetTestimonials(),
        api.adminGetBlockedSlots(),
        api.adminGetServices(),
        api.adminGetDoctors(),
        api.adminGetSupabaseStatus().catch(err => {
          console.error('Error fetching Supabase status', err);
          return null;
        })
      ]);
      setAppointments(appts);
      setMessages(msgs);
      setTestimonials(tests);
      setBlockedSlots(blks);
      setServices(srvs);
      setDoctors(docs);
      
      if (sbStatus) {
        setSupabaseStatus(sbStatus.status);
        setSupabaseError(sbStatus.error);
        setSupabaseSql(sbStatus.sql);
        setSupabaseConfig(sbStatus.config);
      } else {
        setSupabaseStatus('not_configured');
      }
    } catch (err) {
      console.error('Failed to load admin panel details', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await api.adminLogin(username, password);
      setIsLoggedIn(true);
      fetchAdminData();
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    api.adminLogout();
    setIsLoggedIn(false);
    if (onLogout) {
      onLogout();
    }
  };

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const showError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 4000);
  };

  // Helper: file base64 reader for images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError('Image is too large! Maximum allowed size is 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // APPOINTMENT UPDATES
  // ==========================================
  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await api.adminUpdateStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      showSuccess(`Appointment status set to ${status}`);
    } catch (err: any) {
      showError('Failed to update status.');
    }
  };

  // ==========================================
  // DOCTORS CRUD
  // ==========================================
  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (docEditingId) {
        await api.adminUpdateDoctor(docEditingId, docFormData);
        showSuccess('Doctor settings updated successfully');
      } else {
        const result = await api.adminCreateDoctor(docFormData);
        showSuccess('New clinical specialist enrolled!');
      }
      // Reset
      setDocEditingId(null);
      setDocFormData({
        name: '',
        designation: '',
        specialty: '',
        qualification: '',
        experienceYears: 10,
        photo: '',
        bio: '',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        availableTimeStart: '08:30',
        availableTimeEnd: '19:30',
        isActive: true
      });
      fetchAdminData();
    } catch (err: any) {
      showError('Failed to save doctor.');
    }
  };

  const handleEditDoctorClick = (doc: Doctor) => {
    setDocEditingId(doc.id);
    setDocFormData({
      name: doc.name,
      designation: doc.designation,
      specialty: doc.specialty,
      qualification: doc.qualification,
      experienceYears: doc.experienceYears,
      photo: doc.photo,
      bio: doc.bio,
      availableDays: doc.availableDays,
      availableTimeStart: doc.availableTimeStart,
      availableTimeEnd: doc.availableTimeEnd,
      isActive: doc.isActive
    });
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this doctor profile?')) return;
    try {
      await api.adminDeleteDoctor(id);
      showSuccess('Doctor deactivated');
      fetchAdminData();
    } catch (err) {
      showError('Deactivation failed.');
    }
  };

  // ==========================================
  // SERVICES CRUD
  // ==========================================
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (srvEditingId) {
        await api.adminUpdateService(srvEditingId, srvFormData);
        showSuccess('Specialty details updated');
      } else {
        await api.adminCreateService(srvFormData);
        showSuccess('New clinical specialty enrolled!');
      }
      // Reset
      setSrvEditingId(null);
      setSrvFormData({
        title: '',
        shortDescription: '',
        fullDescription: '',
        iconClass: 'Eye',
        image: '',
        isFeatured: false,
        sortOrder: 0,
        isActive: true
      });
      fetchAdminData();
    } catch (err: any) {
      showError('Failed to save specialty.');
    }
  };

  const handleEditServiceClick = (srv: Service) => {
    setSrvEditingId(srv.id);
    setSrvFormData({
      title: srv.title,
      shortDescription: srv.shortDescription,
      fullDescription: srv.fullDescription,
      iconClass: srv.iconClass,
      image: srv.image || '',
      isFeatured: srv.isFeatured,
      sortOrder: srv.sortOrder,
      isActive: srv.isActive
    });
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this service?')) return;
    try {
      await api.adminDeleteService(id);
      showSuccess('Service archived');
      fetchAdminData();
    } catch (err) {
      showError('Archive failed.');
    }
  };

  // ==========================================
  // GALLERY MANAGEMENT
  // ==========================================
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galFormData.image) {
      showError('Please choose a photo to upload');
      return;
    }
    try {
      await api.adminCreateGallery(galFormData);
      showSuccess('Photo posted successfully');
      setGalFormData({ title: '', image: '', category: 'hospital' });
      fetchAdminData();
    } catch (err) {
      showError('Gallery post failed.');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Delete this photo from the public gallery?')) return;
    try {
      await api.adminDeleteGallery(id);
      showSuccess('Photo removed');
      fetchAdminData();
    } catch (err) {
      showError('Removal failed.');
    }
  };

  // ==========================================
  // CONTACT MESSAGES MANAGEMENT
  // ==========================================
  const handleToggleReadMessage = async (id: string, isRead: boolean) => {
    try {
      await api.adminMarkContactRead(id, isRead);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead } : m));
    } catch (err) {
      showError('Failed to update message.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this inquiry message permanent?')) return;
    try {
      await api.adminDeleteContact(id);
      showSuccess('Message deleted');
      fetchAdminData();
    } catch (err) {
      showError('Deletion failed.');
    }
  };

  // ==========================================
  // TESTIMONIAL APPROVALS
  // ==========================================
  const handleApproveTestimonial = async (id: string, isApproved: boolean) => {
    try {
      await api.adminApproveTestimonial(id, isApproved);
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isApproved } : t));
      showSuccess(isApproved ? 'Review approved for website' : 'Review suspended');
    } catch (err) {
      showError('Failed to approve.');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.adminDeleteTestimonial(id);
      showSuccess('Review deleted');
      fetchAdminData();
    } catch (err) {
      showError('Delete failed.');
    }
  };

  // ==========================================
  // BLOCKED TIME SLOTS
  // ==========================================
  const handleSaveBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockedSlotFormData.blockedDate || !blockedSlotFormData.reason) {
      showError('Date and reason are required to block calendars');
      return;
    }
    try {
      await api.adminCreateBlockedSlot(blockedSlotFormData);
      showSuccess('Consulting calendar blocked for date');
      setBlockedSlotFormData({ doctorId: 'all', blockedDate: '', reason: '' });
      fetchAdminData();
    } catch (err) {
      showError('Failed to block.');
    }
  };

  const handleDeleteBlockedSlot = async (id: string) => {
    try {
      await api.adminDeleteBlockedSlot(id);
      showSuccess('Date unblocked');
      fetchAdminData();
    } catch (err) {
      showError('Action failed.');
    }
  };

  // ==========================================
  // SETTINGS MANAGEMENT & PASSWORD
  // ==========================================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsFormData) return;
    try {
      await api.updateSettings(settingsFormData);
      setSettings(settingsFormData);
      showSuccess('Hospital parameters saved successfully!');
    } catch (err) {
      showError('Failed to save settings.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChangeData.newPassword) {
      showError('Please input a new password');
      return;
    }
    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    try {
      await api.changePassword('admin', passwordChangeData.newPassword);
      showSuccess('Administrative login credentials updated successfully!');
      setPasswordChangeData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      showError('Password update failed.');
    }
  };

  // Calculate stats values
  const todayStr = new Date().toISOString().split('T')[0];
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
  const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed').length;
  const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr).length;
  const unreadMessages = messages.filter(m => !m.isRead).length;

  // Recharts: Calculate last 7 days bookings count for chart
  const getWeeklyChartData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    appointments.forEach((a) => {
      try {
        const d = new Date(a.appointmentDate);
        const dayIdx = d.getDay();
        counts[dayIdx] += 1;
      } catch (e) {}
    });

    return days.map((day, idx) => ({
      day: day.substring(0, 3),
      bookings: counts[idx]
    }));
  };

  // Uniquified Patient list by phone
  const getUniquePatients = () => {
    const registry: { [phone: string]: { name: string; email?: string; gender?: string; age?: number; count: number } } = {};
    appointments.forEach((a) => {
      if (!registry[a.phone]) {
        registry[a.phone] = {
          name: a.patientName,
          email: a.email,
          gender: a.gender,
          age: a.age,
          count: 0
        };
      }
      registry[a.phone].count += 1;
    });

    return Object.keys(registry).map(phone => ({
      phone,
      ...registry[phone]
    }));
  };

  // Filtered Appointments
  const [apptFilterDoc, setApptFilterDoc] = useState('');
  const [apptFilterStatus, setApptFilterStatus] = useState('');
  const [apptSearchQuery, setApptSearchQuery] = useState('');

  const getFilteredAppointments = () => {
    return appointments.filter((a) => {
      const matchDoc = !apptFilterDoc || a.doctorId === apptFilterDoc;
      const matchStatus = !apptFilterStatus || a.status === apptFilterStatus;
      const matchSearch = !apptSearchQuery ||
        a.patientName.toLowerCase().includes(apptSearchQuery.toLowerCase()) ||
        a.phone.includes(apptSearchQuery);
      return matchDoc && matchStatus && matchSearch;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  };

  // Print single appointment slip
  const handlePrintAppointment = () => {
    window.print();
  };

  // If not logged in, render Secure Login Panel
  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4 bg-slate-100" id="admin-login-screen">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-xl space-y-6 text-left">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Administration Portal</h2>
            <p className="text-slate-500 text-xs">
              Secure clinician and front-desk database terminal.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-150 p-3 rounded-xl text-rose-800 text-xs font-semibold flex gap-2">
              <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Admin Username
              </label>
              <input
                type="text"
                id="login-username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="login-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none"
                placeholder="Enter password"
              />
            </div>

            <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-[10px] text-slate-500 font-medium">
              <strong>Testing note:</strong> Default login username is <code className="bg-white border border-slate-200 px-1 py-0.5 rounded font-bold font-mono">admin</code> and password is <code className="bg-white border border-slate-200 px-1 py-0.5 rounded font-bold font-mono">Admin@123</code>.
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying Security...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Enter Terminal
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col lg:flex-row text-left" id="admin-dashboard-container">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-850">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-base font-bold text-white tracking-tight">Mitra Admin</span>
              <span className="block text-[10px] text-slate-500 font-mono">STATION ONLINE</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Sliders className="w-4 h-4" /> },
              { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" />, badge: pendingAppointments > 0 ? pendingAppointments : undefined },
              { id: 'patients', label: 'Patients Records', icon: <Users className="w-4 h-4" /> },
              { id: 'doctors', label: 'Doctors Manager', icon: <Activity className="w-4 h-4" /> },
              { id: 'services', label: 'Services Manager', icon: <CheckSquare className="w-4 h-4" /> },
              { id: 'gallery', label: 'Gallery Photos', icon: <ImageIcon className="w-4 h-4" /> },
              { id: 'messages', label: 'Enquiries', icon: <Mail className="w-4 h-4" />, badge: unreadMessages > 0 ? unreadMessages : undefined },
              { id: 'settings', label: 'Scheduler Setup', icon: <SettingsIcon className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as AdminSubTab);
                  setSelectedAppointment(null);
                  setSelectedPatientHistory(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-4 py-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-bold font-mono">ROLE: SUPERADMIN</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-rose-950 hover:text-rose-200 text-slate-400 font-bold text-sm rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout Station
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKING SCREEN */}
      <main className="flex-grow p-6 lg:p-8 overflow-y-auto space-y-6">
        {/* Banner Alert indicators */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl text-emerald-800 text-sm font-semibold flex gap-2">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl text-rose-800 text-sm font-semibold flex gap-2">
            <Info className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* ==================================================
            SUB-TAB: DASHBOARD
           ================================================== */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Administrative Terminal</h1>
              <p className="text-sm text-slate-500 mt-1">Real-time stats monitor and daily schedule summaries.</p>
            </div>

            {/* Supabase Status Banner */}
            {supabaseStatus === 'connected' && (
              <div className="bg-emerald-50/70 border border-emerald-500/20 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      Cloud Persistence Activated
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider font-mono">Live</span>
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      Your website is successfully linked to your live Supabase database (<span className="font-mono text-slate-700 font-semibold">{supabaseConfig?.projectId || 'MITRAEYE'}</span>). All clinical logs and bookings are securely stored in the cloud.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs font-mono bg-emerald-150/50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Synced
                </div>
              </div>
            )}

            {supabaseStatus === 'error_missing_table' && (
              <div className="bg-amber-50/60 border border-amber-500/20 p-5 rounded-2xl space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      Supabase Setup Pending: Table Missing
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-extrabold bg-amber-100 text-amber-800 uppercase tracking-wider font-mono animate-pulse">Action Required</span>
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm">
                      We have successfully connected to your Supabase project (<span className="font-mono text-slate-700 font-semibold">{supabaseConfig?.projectId || 'MITRAEYE'}</span>), but the table <code className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 rounded text-amber-700">mitraeye_data</code> does not exist in your Supabase schema yet.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 overflow-hidden shadow-inner space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-mono font-medium">Supabase SQL Editor Query</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(supabaseSql);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2000);
                      }}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-1 px-3 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy SQL
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-slate-300 font-mono text-xxs sm:text-xs overflow-x-auto max-h-48 whitespace-pre p-1">
                    {supabaseSql}
                  </pre>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Waiting for table creation...
                  </span>
                  <a
                    href={`https://supabase.com/dashboard/project/${supabaseConfig?.projectId || 'admxrsxwydqvltlkfmne'}/sql`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-lg self-start sm:self-auto transition-colors cursor-pointer"
                  >
                    Open Supabase SQL Editor
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            )}

            {supabaseStatus === 'not_configured' && (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-slate-200 rounded-xl text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">Supabase Connection Configured</h4>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      Credentials are set up, but backend loading indicates not_configured. Ensure your environment variables are initialized on the backend.
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono bg-slate-200/60 text-slate-600 px-3 py-1 rounded-full border border-slate-300">
                  Off-line Mode
                </div>
              </div>
            )}

            {/* Live Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <span className="block text-2xl font-bold font-mono text-blue-600 tracking-tight">{todayAppointments}</span>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Appointments Today</span>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <span className="block text-2xl font-bold font-mono text-amber-500 tracking-tight">{pendingAppointments}</span>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Pending Review</span>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <span className="block text-2xl font-bold font-mono text-emerald-600 tracking-tight">{confirmedAppointments}</span>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Confirmed Slots</span>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <span className="block text-2xl font-bold font-mono text-slate-900 tracking-tight">{unreadMessages}</span>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Unread Enquiries</span>
              </div>
            </div>

            {/* Chart + Recent appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Recharts Week Frequency Map */}
              <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[340px]">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Weekly Appointments trends</h3>
                  <p className="text-slate-400 text-xs">Total scheduled bookings mapped across calendar days.</p>
                </div>
                <div className="h-48 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getWeeklyChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <span className="block text-xs text-slate-400 font-mono mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  Graph syncs dynamically with local patient logs.
                </span>
              </div>

              {/* Recent appointments table */}
              <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Recent bookings (Last 10)</h3>
                    <p className="text-slate-400 text-xs">Acknowledge or set consultation statuses.</p>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('appointments')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                        <th className="py-2">Patient</th>
                        <th className="py-2">Doctor</th>
                        <th className="py-2">Schedule</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      {appointments.slice(0, 10).map((appt) => {
                        const matchedDoc = doctors.find(d => d.id === appt.doctorId);
                        return (
                          <tr key={appt.id} className="hover:bg-slate-50">
                            <td className="py-3 font-bold text-slate-900">{appt.patientName}</td>
                            <td className="py-3">{matchedDoc?.name || 'Ophthalmologist'}</td>
                            <td className="py-3">{appt.appointmentDate} at {appt.appointmentTime}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-md font-bold ${
                                appt.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                                appt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                                appt.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                                'bg-rose-50 text-rose-700'
                              }`}>
                                {appt.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 italic">No appointments booked yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            SUB-TAB: APPOINTMENTS MANAGER
           ================================================== */}
        {activeSubTab === 'appointments' && !selectedAppointment && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Manage Appointments</h1>
              <p className="text-sm text-slate-500 mt-1">Review, authorize, schedule, or cancel patient checkup dates.</p>
            </div>

            {/* Filter controls row */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Patient name or phone..."
                  value={apptSearchQuery}
                  onChange={(e) => setApptSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 focus:bg-white focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <select
                  value={apptFilterDoc}
                  onChange={(e) => setApptFilterDoc(e.target.value)}
                  className="bg-slate-50 border border-slate-150 rounded-xl py-2 px-3 text-sm font-semibold focus:outline-none"
                >
                  <option value="">All Doctors</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>

                <select
                  value={apptFilterStatus}
                  onChange={(e) => setApptFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-150 rounded-xl py-2 px-3 text-sm font-semibold focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Appointments Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-xs">
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {getFilteredAppointments().map((appt) => {
                      const matchedDoc = doctors.find(d => d.id === appt.doctorId);
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-4 font-mono font-bold text-blue-600 text-xs">#{appt.id}</td>
                          <td className="py-4 px-4">
                            <span className="block font-bold text-slate-900">{appt.patientName}</span>
                            <span className="block text-xs text-slate-400">{appt.phone}</span>
                          </td>
                          <td className="py-4 px-4">{matchedDoc?.name || 'Ophthalmologist'}</td>
                          <td className="py-4 px-4">{appt.appointmentDate} at {appt.appointmentTime}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              appt.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              appt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              appt.status === 'Completed' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                              'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-1.5 shrink-0">
                            <button
                              onClick={() => setSelectedAppointment(appt)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
                            >
                              Details
                            </button>
                            {appt.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'Confirmed')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
                            {appt.status === 'Confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'Completed')}
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg cursor-pointer"
                              >
                                Complete
                              </button>
                            )}
                            {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'Cancelled')}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {getFilteredAppointments().length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 italic">No appointments matching filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENT DETAILED SCREEN */}
        {selectedAppointment && (
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm text-left space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back to List
                </button>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">Appointment Details</h2>
              </div>
              <span className="text-sm font-bold font-mono text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl">
                ID: {selectedAppointment.id}
              </span>
            </div>

            {/* Print Area */}
            <div id="booking-print-slip" className="space-y-4 border border-slate-150 p-5 rounded-2xl bg-slate-50/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Patient Name</span>
                  <span className="block font-semibold text-slate-800 mt-0.5">{selectedAppointment.patientName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Contact Phone</span>
                  <span className="block font-semibold text-slate-800 mt-0.5">{selectedAppointment.phone}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Age / Gender</span>
                  <span className="block font-semibold text-slate-800 mt-0.5">{selectedAppointment.age || 'N/A'} Years, {selectedAppointment.gender}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Patient Email</span>
                  <span className="block font-semibold text-slate-800 mt-0.5">{selectedAppointment.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Selected Service</span>
                  <span className="block font-semibold text-slate-800 mt-0.5">
                    {services.find(s => s.id === selectedAppointment.serviceId)?.title || 'Comprehensive Checkup'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Allocated Doctor</span>
                  <span className="block font-semibold text-slate-800 mt-0.5">
                    {doctors.find(d => d.id === selectedAppointment.doctorId)?.name || 'Eye Specialist'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Schedule Date</span>
                  <span className="block font-semibold text-slate-800 mt-0.5">{selectedAppointment.appointmentDate}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Schedule Time Slot</span>
                  <span className="block font-semibold text-slate-800 mt-0.5">{selectedAppointment.appointmentTime}</span>
                </div>
              </div>

              {selectedAppointment.message && (
                <div className="border-t border-slate-200 pt-3">
                  <span className="text-xs text-slate-400 font-bold uppercase">Message / Symptoms</span>
                  <p className="text-slate-700 text-xs leading-relaxed mt-1">
                    {selectedAppointment.message}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={handlePrintAppointment}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Slip
              </button>

              <div className="space-x-1.5">
                {selectedAppointment.status === 'Pending' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, 'Confirmed');
                      setSelectedAppointment(prev => prev ? { ...prev, status: 'Confirmed' } : null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg cursor-pointer"
                  >
                    Confirm Appointment
                  </button>
                )}
                {selectedAppointment.status === 'Confirmed' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, 'Completed');
                      setSelectedAppointment(prev => prev ? { ...prev, status: 'Completed' } : null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer"
                  >
                    Mark Completed
                  </button>
                )}
                {selectedAppointment.status !== 'Cancelled' && selectedAppointment.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, 'Cancelled');
                      setSelectedAppointment(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-lg cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            SUB-TAB: PATIENTS RECORDS
           ================================================== */}
        {activeSubTab === 'patients' && !selectedPatientHistory && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Patient Records</h1>
              <p className="text-sm text-slate-500 mt-1">Unique index registry of all patients who have scheduled consults.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-xs">
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Total Bookings</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {getUniquePatients().map((pat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4 font-bold text-slate-900">{pat.name}</td>
                        <td className="py-4 px-4 font-mono text-xs">{pat.phone}</td>
                        <td className="py-4 px-4">{pat.email || 'N/A'}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 font-mono font-bold px-2 py-0.5 rounded-full text-xs">
                            {pat.count}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedPatientHistory({ phone: pat.phone, name: pat.name })}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-end gap-1 w-full cursor-pointer"
                          >
                            View Histories <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {getUniquePatients().length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 italic">No patients registered in scheduler yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PATIENT HISTORIES SCREEN */}
        {selectedPatientHistory && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={() => setSelectedPatientHistory(null)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back to Registry
                </button>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Histories: {selectedPatientHistory.name}
                </h1>
                <p className="text-sm text-slate-500 mt-1">Consulting logs registered under phone: {selectedPatientHistory.phone}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-xs">
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Service Required</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {appointments
                      .filter(a => a.phone === selectedPatientHistory.phone)
                      .map((appt) => {
                        const matchedDoc = doctors.find(d => d.id === appt.doctorId);
                        const matchedSrv = services.find(s => s.id === appt.serviceId);
                        return (
                          <tr key={appt.id}>
                            <td className="py-4 px-4 font-mono font-bold text-blue-600 text-xs">#{appt.id}</td>
                            <td className="py-4 px-4">{matchedDoc?.name || 'Ophthalmologist'}</td>
                            <td className="py-4 px-4">{matchedSrv?.title || 'Eye Exam'}</td>
                            <td className="py-4 px-4">{appt.appointmentDate} at {appt.appointmentTime}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                appt.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                                appt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                                appt.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                                'bg-rose-50 text-rose-700'
                              }`}>
                                {appt.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            SUB-TAB: DOCTORS MANAGER
           ================================================== */}
        {activeSubTab === 'doctors' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left list */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Doctors Manager</h1>
                <p className="text-sm text-slate-500 mt-1">Enroll, edit profiles, or deactivate specialist records.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="p-4 flex gap-4 items-center sm:items-start text-left">
                      <img
                        src={doc.photo}
                        alt={doc.name}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-base">{doc.name}</h4>
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            doc.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {doc.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </div>
                        <span className="block text-xs font-semibold text-blue-600 uppercase tracking-wider">{doc.designation}</span>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{doc.bio}</p>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleEditDoctorClick(doc)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3 h-3" /> Edit Profile
                          </button>
                          {doc.isActive && (
                            <button
                              onClick={() => handleDeleteDoctor(doc.id)}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <XSquare className="w-3 h-3" /> Deactivate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right form panel */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5 text-left">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                {docEditingId ? 'Edit Surgeon Profile' : 'Enroll New Surgeon'}
              </h3>

              <form onSubmit={handleSaveDoctor} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={docFormData.name}
                    onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                    placeholder="e.g. Dr. Soumya Mitra"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Designation *</label>
                    <input
                      type="text"
                      required
                      value={docFormData.designation}
                      onChange={(e) => setDocFormData({ ...docFormData, designation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                      placeholder="e.g. Chief Eye Surgeon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Experience (Years) *</label>
                    <input
                      type="number"
                      required
                      value={docFormData.experienceYears}
                      onChange={(e) => setDocFormData({ ...docFormData, experienceYears: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Specialty *</label>
                  <input
                    type="text"
                    required
                    value={docFormData.specialty}
                    onChange={(e) => setDocFormData({ ...docFormData, specialty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                    placeholder="e.g. Cataract, LASIK & IOL Specialist"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Qualification *</label>
                  <input
                    type="text"
                    required
                    value={docFormData.qualification}
                    onChange={(e) => setDocFormData({ ...docFormData, qualification: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                    placeholder="e.g. MBBS, MS (Ophthalmology)"
                  />
                </div>

                {/* Photo base64 uploader */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Doctor Profile Photo *</label>
                  <div className="flex gap-4 items-center">
                    {docFormData.photo && (
                      <img
                        src={docFormData.photo}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <label className="flex-grow flex items-center justify-center border-2 border-dashed border-slate-250 py-2.5 px-4 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <Camera className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-xs font-bold text-slate-500">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (base64) => setDocFormData({ ...docFormData, photo: base64 }))}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Biography / Summary *</label>
                  <textarea
                    required
                    rows={3}
                    value={docFormData.bio}
                    onChange={(e) => setDocFormData({ ...docFormData, bio: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none resize-none"
                    placeholder="Brief bio about achievements and research..."
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    {docEditingId ? 'Apply Profile Edits' : 'Register Clinician'}
                  </button>
                  {docEditingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setDocEditingId(null);
                        setDocFormData({
                          name: '',
                          designation: '',
                          specialty: '',
                          qualification: '',
                          experienceYears: 10,
                          photo: '',
                          bio: '',
                          availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                          availableTimeStart: '08:30',
                          availableTimeEnd: '19:30',
                          isActive: true
                        });
                      }}
                      className="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================
            SUB-TAB: SERVICES MANAGER
           ================================================== */}
        {activeSubTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Services Manager</h1>
                <p className="text-sm text-slate-500 mt-1">Configure eye therapies, descriptions, sort ordering, and featured indicators.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {services.map((srv) => (
                    <div key={srv.id} className="p-4 flex gap-4 items-center sm:items-start text-left">
                      <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-base">{srv.title}</h4>
                          <div className="flex gap-1.5 items-center">
                            {srv.isFeatured && (
                              <span className="text-[9px] font-bold uppercase font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                Featured
                              </span>
                            )}
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              srv.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {srv.isActive ? 'Active' : 'Archived'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{srv.shortDescription}</p>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleEditServiceClick(srv)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3 h-3" /> Edit Details
                          </button>
                          {srv.isActive && (
                            <button
                              onClick={() => handleDeleteService(srv.id)}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <XSquare className="w-3 h-3" /> Archive
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right form panel */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5 text-left">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                {srvEditingId ? 'Edit Service Details' : 'Enroll New Specialty'}
              </h3>

              <form onSubmit={handleSaveService} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Specialty Title *</label>
                  <input
                    type="text"
                    required
                    value={srvFormData.title}
                    onChange={(e) => setSrvFormData({ ...srvFormData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                    placeholder="e.g. Sutureless Cataract Phaco"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lucide Icon Class *</label>
                    <select
                      value={srvFormData.iconClass}
                      onChange={(e) => setSrvFormData({ ...srvFormData, iconClass: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                    >
                      <option value="Eye">Eye</option>
                      <option value="Sparkles">Sparkles</option>
                      <option value="Zap">Zap</option>
                      <option value="HeartPulse">HeartPulse</option>
                      <option value="Activity">Activity</option>
                      <option value="Smile">Smile</option>
                      <option value="MapPin">MapPin</option>
                      <option value="Glasses">Glasses</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Display Order *</label>
                    <input
                      type="number"
                      required
                      value={srvFormData.sortOrder}
                      onChange={(e) => setSrvFormData({ ...srvFormData, sortOrder: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Base64 uploader */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Service Cover Image *</label>
                  <div className="flex gap-4 items-center">
                    {srvFormData.image && (
                      <img
                        src={srvFormData.image}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <label className="flex-grow flex items-center justify-center border-2 border-dashed border-slate-250 py-2.5 px-4 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <Camera className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-xs font-bold text-slate-500">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (base64) => setSrvFormData({ ...srvFormData, image: base64 }))}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-semibold">Featured Toggle</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="feat-chk"
                      checked={srvFormData.isFeatured}
                      onChange={(e) => setSrvFormData({ ...srvFormData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="feat-chk" className="text-xs sm:text-sm text-slate-600 font-semibold select-none">Show on Homepage specialties strip</label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Short summary description *</label>
                  <input
                    type="text"
                    required
                    value={srvFormData.shortDescription}
                    onChange={(e) => setSrvFormData({ ...srvFormData, shortDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                    placeholder="Short 2-sentence description for cards..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-semibold">Detailed Treatment Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={srvFormData.fullDescription}
                    onChange={(e) => setSrvFormData({ ...srvFormData, fullDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none resize-none"
                    placeholder="Full diagnosis mapping, FAQS, and expectations..."
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    {srvEditingId ? 'Save Specialty Edits' : 'Register Specialty'}
                  </button>
                  {srvEditingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSrvEditingId(null);
                        setSrvFormData({
                          title: '',
                          shortDescription: '',
                          fullDescription: '',
                          iconClass: 'Eye',
                          image: '',
                          isFeatured: false,
                          sortOrder: 0,
                          isActive: true
                        });
                      }}
                      className="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================
            SUB-TAB: GALLERY MANAGER
           ================================================== */}
        {activeSubTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Grid display */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Gallery Photos</h1>
                <p className="text-sm text-slate-500 mt-1">Manage public photos displayed in the campus gallery tour.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="admin-gallery-grid">
                {gallery.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 p-2.5 rounded-2xl relative shadow-xs group">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="aspect-square w-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="absolute top-4 right-4 p-1.5 bg-rose-600 text-white rounded-lg shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                    <span className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mt-2 px-1 text-left">
                      {item.category}
                    </span>
                    <span className="block text-xs font-bold text-slate-800 line-clamp-1 px-1 text-left mt-0.5">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form uploader panel */}
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5 text-left font-semibold text-slate-900">
              <h3 className="text-lg font-bold border-b border-slate-100 pb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                Upload Gallery Image
              </h3>

              <form onSubmit={handleAddGallery} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Photo Title *</label>
                  <input
                    type="text"
                    required
                    value={galFormData.title}
                    onChange={(e) => setGalFormData({ ...galFormData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                    placeholder="e.g. Comprehensive Diagnosis Suite"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category *</label>
                  <select
                    value={galFormData.category}
                    onChange={(e) => setGalFormData({ ...galFormData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                  >
                    <option value="hospital">Hospital Campus</option>
                    <option value="surgery">Surgeries</option>
                    <option value="team">Our Team</option>
                    <option value="camps">Outreach Camps</option>
                  </select>
                </div>

                {/* Base64 uploader */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Image *</label>
                  <div className="space-y-3">
                    {galFormData.image && (
                      <img
                        src={galFormData.image}
                        alt="Preview"
                        className="w-full aspect-video rounded-xl object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <label className="flex items-center justify-center border-2 border-dashed border-slate-250 py-3 px-4 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <Camera className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-xs text-slate-500">Upload Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (base64) => setGalFormData({ ...galFormData, image: base64 }))}
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer animate-none"
                >
                  Post Photo to Website
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================
            SUB-TAB: ENQUIRIES (MESSAGES)
           ================================================== */}
        {activeSubTab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Contact Enquiries</h1>
              <p className="text-sm text-slate-500 mt-1">Review feedback, booking queries, or patient symptoms reports.</p>
            </div>

            <div className="space-y-4" id="admin-messages-list">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`border rounded-2xl p-5 shadow-xs transition-all relative flex flex-col md:flex-row justify-between gap-4 items-start text-left ${
                    msg.isRead
                      ? 'bg-white border-slate-150 text-slate-600'
                      : 'bg-blue-50/20 border-blue-100 text-slate-800 font-medium shadow-sm'
                  }`}
                >
                  {/* Left Column information */}
                  <div className="space-y-2 flex-grow max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 text-base">{msg.name}</h4>
                      <span className="text-xs text-slate-400 font-mono">({msg.phone})</span>
                      {msg.email && <span className="text-xs text-slate-400 font-mono">| {msg.email}</span>}
                    </div>
                    <span className="block text-xs font-bold text-blue-600">SUBJECT: {msg.subject}</span>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100 mt-1">
                      {msg.message}
                    </p>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      Received: {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Right Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 justify-end w-full md:w-auto">
                    {!msg.isRead ? (
                      <button
                        onClick={() => handleToggleReadMessage(msg.id, true)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Read
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleReadMessage(msg.id, false)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Keep Unread
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" /> Delete permanently
                    </button>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="py-20 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No enquiry messages recorded.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            SUB-TAB: SETTINGS (SCHEDULER SETUP)
           ================================================== */}
        {activeSubTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Hospital Configuration</h1>
              <p className="text-sm text-slate-500 mt-1">Configure clinical information, consulting hours, holidays, or update passwords.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start text-left font-semibold text-slate-900">
              {/* General details Form */}
              {settingsFormData && (
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                  <h3 className="text-lg font-bold border-b border-slate-150 pb-3 flex items-center gap-2 text-slate-900">
                    <Info className="w-5 h-5 text-blue-500" />
                    Ocular Clinic Coordinates
                  </h3>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Hospital Name</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.hospitalName}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, hospitalName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Hospital Tagline</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.tagline}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, tagline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-semibold">Contact Line</label>
                        <input
                          type="text"
                          required
                          value={settingsFormData.phone}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-semibold">WhatsApp Line</label>
                        <input
                          type="text"
                          required
                          value={settingsFormData.whatsAppNumber}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, whatsAppNumber: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-semibold">Support Email</label>
                      <input
                        type="email"
                        required
                        value={settingsFormData.email}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Consultation Address Location</label>
                      <textarea
                        required
                        rows={3}
                        value={settingsFormData.address}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      Save Hospital Coordinates
                    </button>
                  </form>
                </div>
              )}

              {/* Blocked Dates (Holidays) panel */}
              <div className="space-y-6">
                {/* Blocked slot form */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                  <h3 className="text-lg font-bold border-b border-slate-150 pb-3 flex items-center gap-2 text-slate-900">
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                    Block Dates / Leave Calendar
                  </h3>

                  <form onSubmit={handleSaveBlockedSlot} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Block Scope *</label>
                        <select
                          value={blockedSlotFormData.doctorId}
                          onChange={(e) => setBlockedSlotFormData({ ...blockedSlotFormData, doctorId: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                        >
                          <option value="all">Entire Hospital</option>
                          {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date *</label>
                        <input
                          type="date"
                          required
                          value={blockedSlotFormData.blockedDate}
                          onChange={(e) => setBlockedSlotFormData({ ...blockedSlotFormData, blockedDate: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reason for deactivation *</label>
                      <input
                        type="text"
                        required
                        value={blockedSlotFormData.reason}
                        onChange={(e) => setBlockedSlotFormData({ ...blockedSlotFormData, reason: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none"
                        placeholder="e.g. Doctor attending ophthalmic conference"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      Apply Calendar Block
                    </button>
                  </form>
                </div>

                {/* Password update panel */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                  <h3 className="text-lg font-bold border-b border-slate-150 pb-3 flex items-center gap-2 text-slate-900">
                    <Lock className="w-5 h-5 text-blue-500" />
                    Change Admin Password
                  </h3>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New password *</label>
                      <input
                        type="password"
                        required
                        value={passwordChangeData.newPassword}
                        onChange={(e) => setPasswordChangeData({ ...passwordChangeData, newPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-semibold">Confirm password *</label>
                      <input
                        type="password"
                        required
                        value={passwordChangeData.confirmPassword}
                        onChange={(e) => setPasswordChangeData({ ...passwordChangeData, confirmPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      Update Terminal Password
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* List of blocked dates */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 text-left">
              <h3 className="text-lg font-extrabold text-slate-900">Calendar Blocks (Active holidays/leaves)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase">
                      <th className="py-2">Date Blocked</th>
                      <th className="py-2">Affected Clinician</th>
                      <th className="py-2">Reason</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {blockedSlots.map((slot) => {
                      const matchedDoc = doctors.find(d => d.id === slot.doctorId);
                      return (
                        <tr key={slot.id}>
                          <td className="py-3 font-bold text-slate-900">{slot.blockedDate}</td>
                          <td className="py-3">{slot.doctorId === 'all' ? 'Entire Clinic' : matchedDoc?.name}</td>
                          <td className="py-3">{slot.reason}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeleteBlockedSlot(slot.id)}
                              className="text-rose-600 font-bold hover:underline cursor-pointer"
                            >
                              Unblock Date
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {blockedSlots.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 italic">No blocked dates applied yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
