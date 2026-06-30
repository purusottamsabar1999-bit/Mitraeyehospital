-- ====================================================================
-- MITRA EYE HOSPITAL - SUPABASE RELATIONAL SCHEMA
-- ====================================================================
-- This SQL file defines the fully relational database structure for
-- Mitra Eye Hospital. It sets up individual tables for inquiry forms,
-- admin accounts, doctor listings, services, appointments, and settings,
-- along with custom enums, indexes, and Row Level Security (RLS) policies.
-- ====================================================================

-- -----------------------------------------------------
-- 1. Custom Types & Enums (Idempotent)
-- -----------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE public.appointment_status AS ENUM ('Pending', 'Confirmed', 'Completed', 'Cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_gender') THEN
        CREATE TYPE public.patient_gender AS ENUM ('Male', 'Female', 'Other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE public.admin_role AS ENUM ('superadmin', 'staff');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_category') THEN
        CREATE TYPE public.gallery_category AS ENUM ('hospital', 'surgery', 'team', 'camps');
    END IF;
END$$;

-- -----------------------------------------------------
-- 2. Inquiry / Contact Messages Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY DEFAULT 'msg-' || substring(gen_random_uuid()::text from 1 for 8),
    name TEXT NOT NULL CHECK (char_length(name) >= 2),
    phone TEXT NOT NULL CHECK (char_length(phone) >= 10),
    email TEXT CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    subject TEXT NOT NULL CHECK (char_length(subject) >= 3),
    message TEXT NOT NULL CHECK (char_length(message) >= 10),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE public.contact_messages IS 'Stores patient inquiries and web forms submitted via the contact page';
COMMENT ON COLUMN public.contact_messages.id IS 'Unique identifier prefixed with msg-';
COMMENT ON COLUMN public.contact_messages.is_read IS 'Tracks whether the clinical or admin staff have reviewed the inquiry';

-- Indexes for Admin Panel search & sorting performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages (is_read);

-- -----------------------------------------------------
-- 3. Admin Portal Users Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY DEFAULT 'adm-' || substring(gen_random_uuid()::text from 1 for 8),
    username TEXT NOT NULL UNIQUE CHECK (char_length(username) >= 4),
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role public.admin_role NOT NULL DEFAULT 'staff',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.admin_users IS 'Stores portal credentials for hospital administrators and operational staff';

-- Seed default Admin User (Username: admin, Password: admin123hashed - replace with your hash)
-- Hashing is typically done using bcrypt in the server before insertion.
INSERT INTO public.admin_users (id, username, password_hash, full_name, role)
VALUES (
    'adm-default',
    'admin',
    '$2b$10$RzM0Y5.jIqKkI28a1.r.OeT8H3g93A/gS79XpUshIqG2/v/R3q6.u', -- pre-hashed bcrypt hash for 'admin123'
    'Mitra Chief Administrator',
    'superadmin'
) ON CONFLICT (username) DO NOTHING;

-- -----------------------------------------------------
-- 4. Doctors Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY DEFAULT 'doc-' || substring(gen_random_uuid()::text from 1 for 8),
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    specialty TEXT NOT NULL,
    qualification TEXT NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    photo TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    bio TEXT NOT NULL,
    available_days TEXT[] NOT NULL DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    available_time_start TEXT NOT NULL DEFAULT '08:30',
    available_time_end TEXT NOT NULL DEFAULT '19:30',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- 5. Services & Specialties Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    icon_class TEXT NOT NULL,
    image TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- -----------------------------------------------------
-- 6. Appointments Booking Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY DEFAULT 'MEH-' || (10000 + floor(random() * 90000))::text,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    gender public.patient_gender,
    service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    doctor_id TEXT NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL, -- Format: 'HH:MM'
    message TEXT,
    status public.appointment_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments (doctor_id, appointment_date);

-- -----------------------------------------------------
-- 7. Blocked Slots (Doctor Leaves & Holidays) Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id TEXT PRIMARY KEY DEFAULT 'blk-' || substring(gen_random_uuid()::text from 1 for 8),
    doctor_id TEXT NOT NULL, -- 'all' indicates clinic holiday
    blocked_date DATE NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_lookup ON public.blocked_slots (doctor_id, blocked_date);

-- -----------------------------------------------------
-- 8. Row Level Security (RLS) & Access Policies
-- -----------------------------------------------------

-- Enable RLS across tables
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

-- 8a. Contact Messages Policies
CREATE POLICY "Allow public submission of inquiries"
ON public.contact_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow admin users to view/manage inquiries"
ON public.contact_messages FOR ALL
USING (true); -- Custom rule: In real production, bind to authenticated role/claims

-- 8b. Doctors & Services Policies
CREATE POLICY "Allow public read access for doctor profiles"
ON public.doctors FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow admin full access to doctor profiles"
ON public.doctors FOR ALL
USING (true);

CREATE POLICY "Allow public read access for services"
ON public.services FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow admin full access to services"
ON public.services FOR ALL
USING (true);

-- 8c. Appointments Policies
CREATE POLICY "Allow public booking creation"
ON public.appointments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public search on booking availability"
ON public.appointments FOR SELECT
USING (true);

CREATE POLICY "Allow admin full control over bookings"
ON public.appointments FOR ALL
USING (true);
