-- Seed initial data for MobiAzores Fleet Management

-- Insert default departments
INSERT INTO public.departments (id, name, description) VALUES
    (uuid_generate_v4(), 'MobiAzores', 'Departamento principal da MobiAzores'),
    (uuid_generate_v4(), 'Frota', 'Gestão de Frota'),
    (uuid_generate_v4(), 'Manutenção', 'Departamento de Manutenção'),
    (uuid_generate_v4(), 'Administração', 'Departamento Administrativo');

-- Insert vehicle categories
INSERT INTO public.vehicle_categories (name, description) VALUES
    ('Autocarro Urbano', 'Autocarros para transporte urbano'),
    ('Autocarro Interurbano', 'Autocarros para ligações interurbanas'),
    ('Minibus', 'Veículos de menor capacidade'),
    ('Veículo de Apoio', 'Veículos de apoio e manutenção'),
    ('Veículo Administrativo', 'Veículos para uso administrativo');

-- Insert maintenance categories
INSERT INTO public.maintenance_categories (name, description, default_interval_km, default_interval_months) VALUES
    ('Revisão Geral', 'Revisão completa do veículo', 15000, 6),
    ('Mudança de Óleo', 'Substituição do óleo do motor', 10000, 3),
    ('Inspeção Periódica', 'Inspeção obrigatória', NULL, 12),
    ('Manutenção de Travões', 'Verificação e manutenção do sistema de travagem', 20000, 6),
    ('Substituição de Pneus', 'Mudança de pneus', 40000, NULL),
    ('Manutenção do Sistema de Ar Condicionado', 'Verificação e manutenção do AC', NULL, 12),
    ('Verificação da Suspensão', 'Inspeção do sistema de suspensão', 30000, 12),
    ('Manutenção Elétrica', 'Verificação do sistema elétrico', NULL, 6);

-- Note: Users will be created through the authentication system
-- The trigger will automatically create entries in the users table when they sign up
