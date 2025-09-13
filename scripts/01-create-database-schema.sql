-- MobiAzores Fleet Management Database Schema
-- This script creates all necessary tables for the fleet management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('fleet_manager', 'maintenance_tech', 'admin', 'driver');
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'inactive', 'retired');
CREATE TYPE maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    employee_number INTEGER UNIQUE,
    department TEXT NOT NULL DEFAULT 'MobiAzores',
    role user_role NOT NULL DEFAULT 'fleet_manager',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES public.users(id),
    budget DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle categories
CREATE TABLE public.vehicle_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    license_plate TEXT NOT NULL UNIQUE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    vin TEXT UNIQUE,
    category_id UUID REFERENCES public.vehicle_categories(id),
    department_id UUID REFERENCES public.departments(id),
    fuel_type fuel_type NOT NULL DEFAULT 'diesel',
    fuel_capacity DECIMAL(8,2),
    status vehicle_status NOT NULL DEFAULT 'active',
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    current_mileage INTEGER DEFAULT 0,
    insurance_policy TEXT,
    insurance_expiry DATE,
    inspection_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers table
CREATE TABLE public.drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL UNIQUE,
    license_expiry DATE NOT NULL,
    license_categories TEXT[], -- Array of license categories (B, C, D, etc.)
    medical_certificate_expiry DATE,
    department_id UUID REFERENCES public.departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle assignments (which driver is assigned to which vehicle)
CREATE TABLE public.vehicle_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES public.users(id),
    unassigned_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT
);

-- Refuel records
CREATE TABLE public.refuel_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id),
    refuel_date TIMESTAMP WITH TIME ZONE NOT NULL,
    mileage INTEGER NOT NULL,
    liters DECIMAL(8,2) NOT NULL,
    cost_per_liter DECIMAL(6,3) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    fuel_station TEXT,
    receipt_number TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance categories
CREATE TABLE public.maintenance_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    default_interval_km INTEGER, -- Default interval in kilometers
    default_interval_months INTEGER, -- Default interval in months
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance schedules
CREATE TABLE public.maintenance_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.maintenance_categories(id),
    scheduled_date DATE NOT NULL,
    scheduled_mileage INTEGER,
    status maintenance_status NOT NULL DEFAULT 'scheduled',
    priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
    estimated_cost DECIMAL(10,2),
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance interventions (actual work done)
CREATE TABLE public.maintenance_interventions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    schedule_id UUID REFERENCES public.maintenance_schedules(id),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    intervention_date TIMESTAMP WITH TIME ZONE NOT NULL,
    mileage INTEGER NOT NULL,
    description TEXT NOT NULL,
    work_performed TEXT,
    parts_used TEXT,
    labor_hours DECIMAL(5,2),
    parts_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    technician_id UUID REFERENCES public.users(id),
    supplier TEXT,
    invoice_number TEXT,
    warranty_until DATE,
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance policies
CREATE TABLE public.insurance_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    policy_number TEXT NOT NULL,
    insurance_company TEXT NOT NULL,
    policy_type TEXT, -- comprehensive, third_party, etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount DECIMAL(10,2),
    deductible DECIMAL(10,2),
    coverage_details JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance claims
CREATE TABLE public.insurance_claims (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES public.insurance_policies(id),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    claim_number TEXT NOT NULL UNIQUE,
    incident_date DATE NOT NULL,
    reported_date DATE NOT NULL,
    claim_type TEXT, -- accident, theft, vandalism, etc.
    description TEXT NOT NULL,
    damage_assessment TEXT,
    claim_amount DECIMAL(10,2),
    settlement_amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending', -- pending, approved, denied, settled
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document storage (for receipts, invoices, etc.)
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    document_type TEXT, -- receipt, invoice, insurance, maintenance, etc.
    related_table TEXT, -- which table this document relates to
    related_id UUID, -- ID of the related record
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for tracking changes
CREATE TABLE public.audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES public.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_vehicles_license_plate ON public.vehicles(license_plate);
CREATE INDEX idx_vehicles_department ON public.vehicles(department_id);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_refuel_records_vehicle ON public.refuel_records(vehicle_id);
CREATE INDEX idx_refuel_records_date ON public.refuel_records(refuel_date);
CREATE INDEX idx_maintenance_schedules_vehicle ON public.maintenance_schedules(vehicle_id);
CREATE INDEX idx_maintenance_schedules_date ON public.maintenance_schedules(scheduled_date);
CREATE INDEX idx_maintenance_interventions_vehicle ON public.maintenance_interventions(vehicle_id);
CREATE INDEX idx_users_employee_number ON public.users(employee_number);
CREATE INDEX idx_users_department ON public.users(department);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_refuel_records_updated_at BEFORE UPDATE ON public.refuel_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_schedules_updated_at BEFORE UPDATE ON public.maintenance_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_interventions_updated_at BEFORE UPDATE ON public.maintenance_interventions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON public.insurance_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
