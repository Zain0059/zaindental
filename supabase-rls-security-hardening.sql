-- ==============================================================================
-- ZAIN DENTAL CLINIC (عيادة زين لطب الأسنان)
-- COMPREHENSIVE DATABASE SECURITY HARDENING & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Purpose:
-- 1. Enable Row Level Security (RLS) across all public tables.
-- 2. Revoke unrestricted access from the 'anon' role (public web visitors).
-- 3. Grant authorized access exclusively to 'authenticated' users (Supabase Auth JWT).
-- 4. Secure the 'staff' table and prevent unauthorized password harvesting.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Enable Row Level Security (RLS) on all Clinic Tables
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clinic_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.procedures_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- STEP 2: Revoke Unauthenticated (Anon) Direct Privileges
-- Prevents any visitor without a valid Supabase Auth session from reading or modifying data
-- ------------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ------------------------------------------------------------------------------
-- STEP 3: Drop any existing conflicting policies to allow clean re-application
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  p text;
BEGIN
  FOR t, p IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
  END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 4: Define Secure RLS Policies for Authenticated Staff
-- ------------------------------------------------------------------------------

-- 1. Patients Table: Authenticated staff can view, add, update and manage patients
CREATE POLICY "Allow authenticated staff to manage patients"
ON public.patients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Appointments Table: Authenticated staff can manage scheduling
CREATE POLICY "Allow authenticated staff to manage appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Invoices Table: Authenticated staff can manage billing
CREATE POLICY "Allow authenticated staff to manage invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Invoice Items Table: Authenticated staff can manage invoice line items
CREATE POLICY "Allow authenticated staff to manage invoice items"
ON public.invoice_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Treatments Table: Authenticated staff can manage clinical treatments
CREATE POLICY "Allow authenticated staff to manage treatments"
ON public.treatments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Clinic Expenses Table: Authenticated staff can manage clinic expenses
CREATE POLICY "Allow authenticated staff to manage clinic expenses"
ON public.clinic_expenses
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Procedures Catalog Table: Authenticated staff can view and manage catalog
CREATE POLICY "Allow authenticated staff to manage procedures catalog"
ON public.procedures_catalog
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Payments Table (if exists): Authenticated staff can manage payments
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    EXECUTE 'CREATE POLICY "Allow authenticated staff to manage payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- 9. Staff Table: Authenticated users can view staff profiles
CREATE POLICY "Allow authenticated staff to view staff profiles"
ON public.staff
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated staff to update staff profiles"
ON public.staff
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- STEP 5: Create or Verify Admin User in Supabase Auth (auth.users)
-- You can also create this directly in Supabase Dashboard > Authentication > Users
-- Email: admin@zaindental.clinic
-- ------------------------------------------------------------------------------
-- Enable pgcrypto extension for secure bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert default admin into auth.users if not already existing
-- Default initial password: AdminPassword123! (Change immediately upon first login)
DO $$
DECLARE
  v_user_id uuid := 'a0000000-0000-0000-0000-000000000001';
  v_email text := 'admin@zaindental.clinic';
  v_encrypted_pw text;
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    v_encrypted_pw := crypt('AdminPassword123!', gen_salt('bf'));

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_pw,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"د. عبد الله سامي زين","role":"admin","username":"admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Also insert default identity for Supabase Auth
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_user_id,
      format('{"sub":"%s","email":"%s"}', v_user_id, v_email)::jsonb,
      'email',
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Admin user admin@zaindental.clinic created successfully with initial password AdminPassword123!';
  ELSE
    RAISE NOTICE 'Admin user admin@zaindental.clinic already exists in auth.users';
  END IF;
END $$;

-- Verify RLS Status across all public tables
SELECT 
  tablename, 
  rowsecurity AS "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
