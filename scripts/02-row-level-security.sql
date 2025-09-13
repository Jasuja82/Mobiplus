-- Row Level Security (RLS) Policies for MobiAzores Fleet Management

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refuel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile and users in their department
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can see all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Department-based access for most tables
CREATE POLICY "Department access for vehicles" ON public.vehicles
    FOR ALL USING (
        department_id IN (
            SELECT d.id FROM public.departments d
            JOIN public.users u ON u.department = d.name
            WHERE u.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Department access for drivers" ON public.drivers
    FOR ALL USING (
        department_id IN (
            SELECT d.id FROM public.departments d
            JOIN public.users u ON u.department = d.name
            WHERE u.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Department access for refuel records" ON public.refuel_records
    FOR ALL USING (
        vehicle_id IN (
            SELECT v.id FROM public.vehicles v
            JOIN public.departments d ON v.department_id = d.id
            JOIN public.users u ON u.department = d.name
            WHERE u.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Department access for maintenance schedules" ON public.maintenance_schedules
    FOR ALL USING (
        vehicle_id IN (
            SELECT v.id FROM public.vehicles v
            JOIN public.departments d ON v.department_id = d.id
            JOIN public.users u ON u.department = d.name
            WHERE u.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Department access for maintenance interventions" ON public.maintenance_interventions
    FOR ALL USING (
        vehicle_id IN (
            SELECT v.id FROM public.vehicles v
            JOIN public.departments d ON v.department_id = d.id
            JOIN public.users u ON u.department = d.name
            WHERE u.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow read access to reference tables for all authenticated users
CREATE POLICY "All users can view departments" ON public.departments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All users can view vehicle categories" ON public.vehicle_categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All users can view maintenance categories" ON public.maintenance_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Vehicle assignments - users can see assignments for their department
CREATE POLICY "Department access for vehicle assignments" ON public.vehicle_assignments
    FOR ALL USING (
        vehicle_id IN (
            SELECT v.id FROM public.vehicles v
            JOIN public.departments d ON v.department_id = d.id
            JOIN public.users u ON u.department = d.name
            WHERE u.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insurance policies and claims - department access
CREATE POLICY "Department access for insurance policies" ON public.insurance_policies
    FOR ALL USING (
        vehicle_id IN (
            SELECT v.id FROM public.vehicles v
            JOIN public.departments d ON v.department_id = d.id
            JOIN public.users u ON u.department = d.name
            WHERE u.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Department access for insurance claims" ON public.insurance_claims
    FOR ALL USING (
        vehicle_id IN (
            SELECT v.id FROM public.vehicles v
            JOIN public.departments d ON v.department_id = d.id
            JOIN public.users u ON u.department = d.name
            WHERE u.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Documents - users can see documents related to their department's data
CREATE POLICY "Department access for documents" ON public.documents
    FOR ALL USING (
        uploaded_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Audit log - admins only
CREATE POLICY "Admins can view audit log" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
