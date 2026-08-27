-- ============================================================================
-- PROJECT: KL2StU - DATABASE SCHEMA DESIGN WITH RBAC METHOD (PostgreSQL)
-- AUTHOR: Antigravity AI Coding Assistant
-- DATE: 2026-07-10
-- DESCRIPTION: Contains complete SQL DDL commands (tables, types, triggers,
--              indexes) and SQL DML commands (seeding initial mock data).
-- ============================================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CLEANUP EXISTING TABLES (FOR IDEMPOTENT RUNS)
-- ============================================================================
DROP TABLE IF EXISTS other_metadata CASCADE;
DROP TABLE IF EXISTS note_tags CASCADE;
DROP TABLE IF EXISTS note_metadata CASCADE;
DROP TABLE IF EXISTS zip_metadata CASCADE;
DROP TABLE IF EXISTS media_metadata CASCADE;
DROP TABLE IF EXISTS excel_metadata CASCADE;
DROP TABLE IF EXISTS word_metadata CASCADE;
DROP TABLE IF EXISTS pdf_metadata CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS meeting_participants CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 2. RBAC & USER MANAGEMENT TABLES
-- ============================================================================

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Stored hashed password (e.g. bcrypt)
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    avatar VARCHAR(10) DEFAULT 'U', -- Store initials or avatar path
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    join_date DATE DEFAULT CURRENT_DATE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL CHECK (name IN ('admin', 'manager', 'member')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_roles (Many-to-Many relationship)
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Table: permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'document:create', 'user:delete'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: role_permissions (Many-to-Many relationship)
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Table: user_settings (One-to-One relationship with users)
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    notif_email BOOLEAN DEFAULT TRUE,
    notif_push BOOLEAN DEFAULT TRUE,
    notif_upload BOOLEAN DEFAULT TRUE,
    notif_meeting BOOLEAN DEFAULT TRUE,
    notif_team BOOLEAN DEFAULT FALSE,
    dark_mode BOOLEAN DEFAULT FALSE,
    compact_view BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'vi',
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    auto_backup BOOLEAN DEFAULT TRUE,
    backup_freq VARCHAR(20) DEFAULT 'daily',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. TEAMS & COLLABORATION TABLES
-- ============================================================================

-- Table: teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    color VARCHAR(7) DEFAULT '#4f46e5', -- hex color code (e.g. #4f46e5)
    project_count INT DEFAULT 0,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: team_members (Many-to-Many relationship)
CREATE TABLE team_members (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

-- ============================================================================
-- 4. MEETINGS TABLES
-- ============================================================================

-- Table: meetings
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    duration VARCHAR(50), -- formatted duration, e.g., '1h30m', '15m'
    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    type VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video', 'inperson', 'hybrid')),
    room VARCHAR(100),
    link VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: meeting_participants (Many-to-Many relationship)
CREATE TABLE meeting_participants (
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (meeting_id, user_id)
);

-- ============================================================================
-- 5. DOCUMENTS & SPECIALIZED METADATA TABLES (Class Table Inheritance)
-- ============================================================================

-- Base Table: documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('pdf', 'word', 'excel', 'image', 'zip', 'note', 'other')),
    size_bytes BIGINT NOT NULL, -- file size in bytes
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sub-Table: pdf_metadata
CREATE TABLE pdf_metadata (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    pages INT NOT NULL CHECK (pages >= 0)
);

-- Sub-Table: word_metadata
CREATE TABLE word_metadata (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    word_count INT NOT NULL CHECK (word_count >= 0)
);

-- Sub-Table: excel_metadata
CREATE TABLE excel_metadata (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    sheets INT NOT NULL CHECK (sheets >= 0),
    rows INT NOT NULL CHECK (rows >= 0)
);

-- Sub-Table: media_metadata (images, videos, audio)
CREATE TABLE media_metadata (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video', 'audio')),
    resolution VARCHAR(30) -- resolution (e.g. '1920x1080' or '—' for audio)
);

-- Sub-Table: zip_metadata
CREATE TABLE zip_metadata (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    archive_type VARCHAR(10) NOT NULL CHECK (archive_type IN ('zip', 'rar', '7z', 'tar.gz')),
    file_count INT NOT NULL CHECK (file_count >= 0)
);

-- Sub-Table: note_metadata (text notes)
CREATE TABLE note_metadata (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT,
    color VARCHAR(7) DEFAULT '#ffffff', -- Background color for UI cards
    pinned BOOLEAN DEFAULT FALSE
);

-- Table: note_tags (to handle tag lists on notes)
CREATE TABLE note_tags (
    document_id UUID REFERENCES note_metadata(document_id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (document_id, tag)
);

-- Sub-Table: other_metadata (unclassified files e.g. pptx, yaml, md)
CREATE TABLE other_metadata (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    file_type VARCHAR(50), -- file extension with dot (e.g., '.pptx', '.yaml')
    category VARCHAR(20) NOT NULL CHECK (category IN ('presentation', 'code', 'text', 'other'))
);

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions (role_id);
CREATE INDEX idx_documents_author_id ON documents (author_id);
CREATE INDEX idx_documents_type ON documents (type);
CREATE INDEX idx_team_members_user_id ON team_members (user_id);
CREATE INDEX idx_meeting_participants_user_id ON meeting_participants (user_id);

-- ============================================================================
-- 7. TRIGGERS FOR DYNAMIC UPDATES ON updated_at COLUMNS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 8. DATA SEEDING (SQL DML)
-- ============================================================================

-- 8.1. Seed Roles
INSERT INTO roles (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'Administrator - Full control over the entire system'),
('22222222-2222-2222-2222-222222222222', 'manager', 'Manager - Access to management functions (teams, meetings, documents)'),
('33333333-3333-3333-3333-333333333333', 'member', 'Member - Access to standard features and collaborative spaces');

-- 8.2. Seed Permissions
INSERT INTO permissions (id, name, description) VALUES
-- User Permissions
(uuid_generate_v4(), 'user:create', 'Create new user accounts'),
(uuid_generate_v4(), 'user:read', 'View user accounts list and details'),
(uuid_generate_v4(), 'user:update', 'Update details of user accounts'),
(uuid_generate_v4(), 'user:delete', 'Delete user accounts'),
-- Team Permissions
(uuid_generate_v4(), 'team:create', 'Create a new work team'),
(uuid_generate_v4(), 'team:read', 'View details of work teams'),
(uuid_generate_v4(), 'team:update', 'Update work team info and members'),
(uuid_generate_v4(), 'team:delete', 'Delete a work team'),
-- Meeting Permissions
(uuid_generate_v4(), 'meeting:create', 'Create a meeting'),
(uuid_generate_v4(), 'meeting:read', 'View list of meetings and info'),
(uuid_generate_v4(), 'meeting:update', 'Update meeting schedule or info'),
(uuid_generate_v4(), 'meeting:delete', 'Cancel or delete meetings'),
-- Document Permissions
(uuid_generate_v4(), 'document:create', 'Upload or create new documents'),
(uuid_generate_v4(), 'document:read', 'Read or download documents'),
(uuid_generate_v4(), 'document:update', 'Edit document details or replace version'),
(uuid_generate_v4(), 'document:delete', 'Remove or delete documents');

-- 8.3. Assign Permissions to Roles
-- 'admin' gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111111', id FROM permissions;

-- 'manager' gets everything except user:create, user:delete, team:delete
INSERT INTO role_permissions (role_id, permission_id)
SELECT '22222222-2222-2222-2222-222222222222', id FROM permissions 
WHERE name NOT IN ('user:create', 'user:delete', 'team:delete');

-- 'member' gets basic read/write permission (cannot delete/update others' items, enforced by app logic)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '33333333-3333-3333-3333-333333333333', id FROM permissions 
WHERE name IN ('user:read', 'team:read', 'meeting:create', 'meeting:read', 'meeting:update', 'document:create', 'document:read', 'document:update');

-- 8.4. Seed Users (Matching frontend AccountItem lists)
-- Passwords are set to '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky' (mock bcrypt hash for 'password123')
INSERT INTO users (id, email, password_hash, full_name, department, avatar, status, join_date, last_active) VALUES
('fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', 'nguyenvana@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Nguyễn Văn A', 'Ban giám đốc', 'A', 'active', '2024-01-15', '2026-07-08 20:00:00+07'),
('cb68c347-19e4-4d8e-9762-b9cf6d22ef14', 'tranthib@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Trần Thị B', 'Phòng Marketing', 'B', 'active', '2024-03-20', '2026-07-08 19:45:00+07'),
('da365ef5-b6d8-4903-82b1-12c8b8243cd6', 'levanc@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Lê Văn C', 'Phòng Kỹ thuật', 'C', 'active', '2024-06-10', '2026-07-07 17:30:00+07'),
('edcb4fb7-770e-4099-a864-77a835b0eb8f', 'phamvand@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Phạm Văn D', 'Phòng Thiết kế', 'D', 'active', '2024-08-01', '2026-07-08 18:20:00+07'),
('bc8e16fd-4df7-4632-9cb8-ecf385c5b058', 'hoangvane@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Hoàng Văn E', 'Phòng Kinh doanh', 'E', 'inactive', '2024-09-15', '2026-06-30 16:15:00+07'),
('a312e5c8-1111-4444-9999-555555555555', 'dothif@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Đỗ Thị F', 'Phòng Nhân sự', 'F', 'active', '2025-01-10', '2026-07-06 14:00:00+07'),
('b777a888-2222-5555-aaaa-666666666666', 'vuminhg@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Vũ Minh G', 'Phòng Kỹ thuật', 'G', 'suspended', '2025-04-20', '2026-05-15 11:30:00+07'),
('c888b999-3333-6666-bbbb-777777777777', 'buithih@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Bùi Thị H', 'Phòng Kế toán', 'H', 'active', '2025-07-01', '2026-07-08 19:10:00+07'),
('d999caaa-4444-7777-cccc-888888888888', 'caovani@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Cao Văn I', 'Phòng Marketing', 'I', 'active', '2025-10-15', '2026-07-05 10:25:00+07'),
('e000dbbb-5555-8888-dddd-999999999999', 'dinhthik@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Đinh Thị K', 'Phòng Hành chính', 'K', 'inactive', '2026-02-01', '2026-06-20 15:40:00+07'),
('00000000-0000-0000-0000-000000000000', 'system@company.vn', '$2a$12$R.S91H30rF3l.yv.mUjD4OSqXQ.G1jX6iGk4i5oM6f1h0W496cRky', 'Hệ thống', 'Công nghệ thông tin', 'S', 'active', '2020-01-01', '2026-07-10 20:00:00+07');

-- 8.5. Assign Roles to Users
INSERT INTO user_roles (user_id, role_id) VALUES
('fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', '11111111-1111-1111-1111-111111111111'), -- Nguyễn Văn A (Admin)
('cb68c347-19e4-4d8e-9762-b9cf6d22ef14', '22222222-2222-2222-2222-222222222222'), -- Trần Thị B (Manager)
('da365ef5-b6d8-4903-82b1-12c8b8243cd6', '33333333-3333-3333-3333-333333333333'), -- Lê Văn C (Member)
('edcb4fb7-770e-4099-a864-77a835b0eb8f', '33333333-3333-3333-3333-333333333333'), -- Phạm Văn D (Member)
('bc8e16fd-4df7-4632-9cb8-ecf385c5b058', '22222222-2222-2222-2222-222222222222'), -- Hoàng Văn E (Manager)
('a312e5c8-1111-4444-9999-555555555555', '33333333-3333-3333-3333-333333333333'), -- Đỗ Thị F (Member)
('b777a888-2222-5555-aaaa-666666666666', '33333333-3333-3333-3333-333333333333'), -- Vũ Minh G (Member)
('c888b999-3333-6666-bbbb-777777777777', '33333333-3333-3333-3333-333333333333'), -- Bùi Thị H (Member)
('d999caaa-4444-7777-cccc-888888888888', '33333333-3333-3333-3333-333333333333'), -- Cao Văn I (Member)
('e000dbbb-5555-8888-dddd-999999999999', '33333333-3333-3333-3333-333333333333'), -- Đinh Thị K (Member)
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333'); -- Hệ thống (Member)

-- 8.6. Seed User Settings (Matching setting page UI values for Nguyễn Văn A)
INSERT INTO user_settings (user_id, phone, notif_email, notif_push, notif_upload, notif_meeting, notif_team, dark_mode, compact_view, language, timezone, auto_backup, backup_freq) VALUES
('fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', '0901234567', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, 'vi', 'Asia/Ho_Chi_Minh', TRUE, 'daily'),
('cb68c347-19e4-4d8e-9762-b9cf6d22ef14', '0907654321', TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, 'vi', 'Asia/Ho_Chi_Minh', FALSE, 'weekly'),
('da365ef5-b6d8-4903-82b1-12c8b8243cd6', '0912345678', TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, TRUE, 'en', 'Asia/Ho_Chi_Minh', TRUE, 'daily');

-- 8.7. Seed Teams (Matching TeamWork.tsx)
INSERT INTO teams (id, name, description, leader_id, status, color, project_count, created_date) VALUES
('f07e0cde-639a-4c28-98f9-543abf2b0f44', 'Frontend Team', 'Phát triển giao diện người dùng, React & TypeScript', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', 'active', '#4f46e5', 4, '2025-01-15'),
('b07e0cde-639a-4c28-98f9-543abf2b0f44', 'Backend Team', 'API, Database & Server infrastructure', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6', 'active', '#10b981', 3, '2025-01-15'),
('d07e0cde-639a-4c28-98f9-543abf2b0f44', 'Design Team', 'UI/UX Design, Branding & Creative', 'edcb4fb7-770e-4099-a864-77a835b0eb8f', 'active', '#8b5cf6', 5, '2025-03-01'),
('m07e0cde-639a-4c28-98f9-543abf2b0f44', 'Marketing Team', 'Chiến lược Marketing, SEO & Content', 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14', 'active', '#f59e0b', 2, '2025-04-10'),
('q07e0cde-639a-4c28-98f9-543abf2b0f44', 'QA Team', 'Kiểm thử chất lượng phần mềm', 'bc8e16fd-4df7-4632-9cb8-ecf385c5b058', 'active', '#06b6d4', 2, '2025-06-01'),
('h07e0cde-639a-4c28-98f9-543abf2b0f44', 'HR & Admin', 'Quản lý nhân sự và hành chính', 'a312e5c8-1111-4444-9999-555555555555', 'archived', '#ef4444', 1, '2025-08-15');

-- 8.8. Seed Team Members
-- Frontend members: A, C, D, G, H, I
INSERT INTO team_members (team_id, user_id) VALUES
('f07e0cde-639a-4c28-98f9-543abf2b0f44', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c'),
('f07e0cde-639a-4c28-98f9-543abf2b0f44', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6'),
('f07e0cde-639a-4c28-98f9-543abf2b0f44', 'edcb4fb7-770e-4099-a864-77a835b0eb8f'),
('f07e0cde-639a-4c28-98f9-543abf2b0f44', 'b777a888-2222-5555-aaaa-666666666666'),
('f07e0cde-639a-4c28-98f9-543abf2b0f44', 'c888b999-3333-6666-bbbb-777777777777'),
('f07e0cde-639a-4c28-98f9-543abf2b0f44', 'd999caaa-4444-7777-cccc-888888888888');

-- Backend members: C, A, E, F, I
INSERT INTO team_members (team_id, user_id) VALUES
('b07e0cde-639a-4c28-98f9-543abf2b0f44', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6'),
('b07e0cde-639a-4c28-98f9-543abf2b0f44', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c'),
('b07e0cde-639a-4c28-98f9-543abf2b0f44', 'bc8e16fd-4df7-4632-9cb8-ecf385c5b058'),
('b07e0cde-639a-4c28-98f9-543abf2b0f44', 'a312e5c8-1111-4444-9999-555555555555'),
('b07e0cde-639a-4c28-98f9-543abf2b0f44', 'd999caaa-4444-7777-cccc-888888888888');

-- Design members: D, B, H, K
INSERT INTO team_members (team_id, user_id) VALUES
('d07e0cde-639a-4c28-98f9-543abf2b0f44', 'edcb4fb7-770e-4099-a864-77a835b0eb8f'),
('d07e0cde-639a-4c28-98f9-543abf2b0f44', 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14'),
('d07e0cde-639a-4c28-98f9-543abf2b0f44', 'c888b999-3333-6666-bbbb-777777777777'),
('d07e0cde-639a-4c28-98f9-543abf2b0f44', 'e000dbbb-5555-8888-dddd-999999999999');

-- Marketing members: B, E, I, K
INSERT INTO team_members (team_id, user_id) VALUES
('m07e0cde-639a-4c28-98f9-543abf2b0f44', 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14'),
('m07e0cde-639a-4c28-98f9-543abf2b0f44', 'bc8e16fd-4df7-4632-9cb8-ecf385c5b058'),
('m07e0cde-639a-4c28-98f9-543abf2b0f44', 'd999caaa-4444-7777-cccc-888888888888'),
('m07e0cde-639a-4c28-98f9-543abf2b0f44', 'e000dbbb-5555-8888-dddd-999999999999');

-- QA members: E, F, G
INSERT INTO team_members (team_id, user_id) VALUES
('q07e0cde-639a-4c28-98f9-543abf2b0f44', 'bc8e16fd-4df7-4632-9cb8-ecf385c5b058'),
('q07e0cde-639a-4c28-98f9-543abf2b0f44', 'a312e5c8-1111-4444-9999-555555555555'),
('q07e0cde-639a-4c28-98f9-543abf2b0f44', 'b777a888-2222-5555-aaaa-666666666666');

-- HR & Admin members: F, K, H
INSERT INTO team_members (team_id, user_id) VALUES
('h07e0cde-639a-4c28-98f9-543abf2b0f44', 'a312e5c8-1111-4444-9999-555555555555'),
('h07e0cde-639a-4c28-98f9-543abf2b0f44', 'e000dbbb-5555-8888-dddd-999999999999'),
('h07e0cde-639a-4c28-98f9-543abf2b0f44', 'c888b999-3333-6666-bbbb-777777777777');

-- 8.9. Seed Meetings (Matching Meeting.tsx)
INSERT INTO meetings (id, title, description, meeting_date, meeting_time, duration, organizer_id, status, type, room, link) VALUES
('a001a001-a001-a001-a001-a001a001a001', 'Sprint Review - Sprint 24', 'Review kết quả Sprint 24, demo sản phẩm cho stakeholders', '2026-07-09', '09:00:00', '1h30m', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', 'upcoming', 'video', 'Google Meet', 'https://meet.google.com/abc-defg-hij'),
('a002a002-a002-a002-a002-a002a002a002', 'Họp ban giám đốc Q3', 'Thảo luận kế hoạch kinh doanh Q3-2026', '2026-07-10', '14:00:00', '2h', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', 'upcoming', 'inperson', 'Phòng họp A3', NULL),
('a003a003-a003-a003-a003-a003a003a003', 'Design Review UI/UX', 'Review thiết kế giao diện cho module quản lý tài liệu', '2026-07-08', '10:00:00', '1h', 'edcb4fb7-770e-4099-a864-77a835b0eb8f', 'completed', 'video', 'Zoom', 'https://zoom.us/j/9876543210'),
('a004a004-a004-a004-a004-a004a004a004', 'Daily Standup - Dev Team', 'Cập nhật tiến độ công việc hàng ngày', '2026-07-08', '08:30:00', '15m', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6', 'completed', 'video', 'Google Meet', 'https://meet.google.com/xyz-pdqr-lmn'),
('a005a005-a005-a005-a005-a005a005a005', 'Workshop: React Performance', 'Workshop chia sẻ kinh nghiệm tối ưu hiệu suất React', '2026-07-11', '15:00:00', '2h', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6', 'upcoming', 'hybrid', 'Phòng họp B1 + Zoom', 'https://zoom.us/j/1122334455'),
('a006a006-a006-a006-a006-a006a006a006', 'Phỏng vấn ứng viên Frontend', 'Phỏng vấn vòng 2 cho vị trí Frontend Developer', '2026-07-07', '14:00:00', '1h', 'a312e5c8-1111-4444-9999-555555555555', 'completed', 'inperson', 'Phòng họp A1', NULL),
('a007a007-a007-a007-a007-a007a007a007', 'Họp Marketing Campaign', 'Lên kế hoạch chiến dịch marketing tháng 8', '2026-07-12', '10:00:00', '1h30m', 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14', 'upcoming', 'video', 'Google Meet', 'https://meet.google.com/mkt-camp-2026'),
('a008a008-a008-a008-a008-a008a008a008', 'Retrospective Sprint 23', 'Đánh giá và cải tiến quy trình làm việc', '2026-07-06', '16:00:00', '1h', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', 'cancelled', 'video', 'Google Meet', 'https://meet.google.com/retro-s23');

-- 8.10. Seed Meeting Participants
-- Sprint Review - Sprint 24: A, C, D, B
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
('a001a001-a001-a001-a001-a001a001a001', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c'),
('a001a001-a001-a001-a001-a001a001a001', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6'),
('a001a001-a001-a001-a001-a001a001a001', 'edcb4fb7-770e-4099-a864-77a835b0eb8f'),
('a001a001-a001-a001-a001-a001a001a001', 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14');

-- Họp ban giám đốc Q3: A, B, E
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
('a002a002-a002-a002-a002-a002a002a002', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c'),
('a002a002-a002-a002-a002-a002a002a002', 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14'),
('a002a002-a002-a002-a002-a002a002a002', 'bc8e16fd-4df7-4632-9cb8-ecf385c5b058');

-- Design Review UI/UX: D, C, H
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
('a003a003-a003-a003-a003-a003a003a003', 'edcb4fb7-770e-4099-a864-77a835b0eb8f'),
('a003a003-a003-a003-a003-a003a003a003', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6'),
('a003a003-a003-a003-a003-a003a003a003', 'c888b999-3333-6666-bbbb-777777777777');

-- Daily Standup - Dev Team: C, D, G, I
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
('a004a004-a004-a004-a004-a004a004a004', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6'),
('a004a004-a004-a004-a004-a004a004a004', 'edcb4fb7-770e-4099-a864-77a835b0eb8f'),
('a004a004-a004-a004-a004-a004a004a004', 'b777a888-2222-5555-aaaa-666666666666'),
('a004a004-a004-a004-a004-a004a004a004', 'd999caaa-4444-7777-cccc-888888888888');

-- Workshop: React Performance: C, D, G, I, H, A
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
('a005a005-a005-a005-a005-a005a005a005', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6'),
('a005a005-a005-a005-a005-a005a005a005', 'edcb4fb7-770e-4099-a864-77a835b0eb8f'),
('a005a005-a005-a005-a005-a005a005a005', 'b777a888-2222-5555-aaaa-666666666666'),
('a005a005-a005-a005-a005-a005a005a005', 'd999caaa-4444-7777-cccc-888888888888'),
('a005a005-a005-a005-a005-a005a005a005', 'c888b999-3333-6666-bbbb-777777777777'),
('a005a005-a005-a005-a005-a005a005a005', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c');

-- Phỏng vấn ứng viên Frontend: F, C
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
('a006a006-a006-a006-a006-a006a006a006', 'a312e5c8-1111-4444-9999-555555555555'),
('a006a006-a006-a006-a006-a006a006a006', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6');

-- Họp Marketing Campaign: B, E, I
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
('a007a007-a007-a007-a007-a007a007a007', 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14'),
('a007a007-a007-a007-a007-a007a007a007', 'bc8e16fd-4df7-4632-9cb8-ecf385c5b058'),
('a007a007-a007-a007-a007-a007a007a007', 'd999caaa-4444-7777-cccc-888888888888');

-- Retrospective Sprint 23: A, C, D
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
('a008a008-a008-a008-a008-a008a008a008', 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c'),
('a008a008-a008-a008-a008-a008a008a008', 'da365ef5-b6d8-4903-82b1-12c8b8243cd6'),
('a008a008-a008-a008-a008-a008a008a008', 'edcb4fb7-770e-4099-a864-77a835b0eb8f');


-- 8.11. Seed Documents & Their Metadata

-- Document 1 (PDF) - Bao_cao_tai_chinh_Q2_2026.pdf
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d001d001-d001-d001-d001-d001d001d001', 'Bao_cao_tai_chinh_Q2_2026.pdf', 'pdf', 4404019, 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', '2026-07-08');
INSERT INTO pdf_metadata (document_id, pages) VALUES ('d001d001-d001-d001-d001-d001d001d001', 48);

-- Document 2 (Word) - Ke_hoach_marketing_san_pham.docx
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d002d002-d002-d002-d002-d002d002d002', 'Ke_hoach_marketing_san_pham.docx', 'word', 1887436, 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14', '2026-07-08');
INSERT INTO word_metadata (document_id, word_count) VALUES ('d002d002-d002-d002-d002-d002d002d002', 4500);

-- Document 3 (Excel) - Bang_tinh_cham_cong_thang_6.xlsx
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d003d003-d003-d003-d003-d003d003d003', 'Bang_tinh_cham_cong_thang_6.xlsx', 'excel', 768000, 'da365ef5-b6d8-4903-82b1-12c8b8243cd6', '2026-07-08');
INSERT INTO excel_metadata (document_id, sheets, rows) VALUES ('d003d003-d003-d003-d003-d003d003d003', 3, 1200);

-- Document 4 (Media - Image) - Banner_gioi_thieu_du_an_moi.png
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d004d004-d004-d004-d004-d004d004d004', 'Banner_gioi_thieu_du_an_moi.png', 'image', 5347737, 'edcb4fb7-770e-4099-a864-77a835b0eb8f', '2026-07-08');
INSERT INTO media_metadata (document_id, media_type, resolution) VALUES ('d004d004-d004-d004-d004-d004d004d004', 'image', '1920x1080');

-- Document 5 (Zip) - Backup_du_lieu_nguoi_dung.zip
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d005d005-d005-d005-d005-d005d005d005', 'Backup_du_lieu_nguoi_dung.zip', 'zip', 149422080, '00000000-0000-0000-0000-000000000000', '2026-07-08');
INSERT INTO zip_metadata (document_id, archive_type, file_count) VALUES ('d005d005-d005-d005-d005-d005d005d005', 'zip', 1240);

-- Document 6 (Other) - Slide_thuyet_trinh_dau_tu.pptx
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d006d006-d006-d006-d006-d006d006d006', 'Slide_thuyet_trinh_dau_tu.pptx', 'other', 12582912, 'bc8e16fd-4df7-4632-9cb8-ecf385c5b058', '2026-07-08');
INSERT INTO other_metadata (document_id, file_type, category) VALUES ('d006d006-d006-d006-d006-d006d006d006', '.pptx', 'presentation');

-- Document 7 (PDF) - Quy_trinh_lam_viec_nhom.pdf
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d007d007-d007-d007-d007-d007d007d007', 'Quy_trinh_lam_viec_nhom.pdf', 'pdf', 1153433, 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', '2026-07-07');
INSERT INTO pdf_metadata (document_id, pages) VALUES ('d007d007-d007-d007-d007-d007d007d007', 12);

-- Document 8 (Word) - Mau_hop_dong_cong_tac_vien.docx
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d008d008-d008-d008-d008-d008d008d008', 'Mau_hop_dong_cong_tac_vien.docx', 'word', 491520, 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14', '2026-07-07');
INSERT INTO word_metadata (document_id, word_count) VALUES ('d008d008-d008-d008-d008-d008d008d008', 2100);

-- Document 9 (Excel) - Danh_sach_lien_he_doi_tac.xlsx
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d009d009-d009-d009-d009-d009d009d009', 'Danh_sach_lien_he_doi_tac.xlsx', 'excel', 327680, 'da365ef5-b6d8-4903-82b1-12c8b8243cd6', '2026-07-07');
INSERT INTO excel_metadata (document_id, sheets, rows) VALUES ('d009d009-d009-d009-d009-d009d009d009', 2, 450);

-- Document 10 (Zip) - Logo_cong_ty_cac_phien_ban.zip
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d010d010-d010-d010-d010-d010d010d010', 'Logo_cong_ty_cac_phien_ban.zip', 'zip', 26004684, 'edcb4fb7-770e-4099-a864-77a835b0eb8f', '2026-07-07');
INSERT INTO zip_metadata (document_id, archive_type, file_count) VALUES ('d010d010-d010-d010-d010-d010d010d010', 'zip', 48);

-- Document 11 (Note) - Lịch họp tuần này
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d011d011-d011-d011-d011-d011d011d011', 'Lịch họp tuần này', 'note', 256, 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', '2026-07-08');
INSERT INTO note_metadata (document_id, content, color, pinned) VALUES
('d011d011-d011-d011-d011-d011d011d011', 'Thứ 2: Họp team dev 9h' || CHR(10) || 'Thứ 4: Review sprint 14h' || CHR(10) || 'Thứ 6: Họp tổng kết tuần 16h', '#fef3c7', TRUE);
INSERT INTO note_tags (document_id, tag) VALUES
('d011d011-d011-d011-d011-d011d011d011', 'Công việc'),
('d011d011-d011-d011-d011-d011d011d011', 'Quan trọng');

-- Document 12 (Note) - Ý tưởng tính năng mới
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d012d012-d012-d012-d012-d012d012d012', 'Ý tưởng tính năng mới', 'note', 180, 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14', '2026-07-07');
INSERT INTO note_metadata (document_id, content, color, pinned) VALUES
('d012d012-d012-d012-d012-d012d012d012', 'Thêm dark mode cho ứng dụng' || CHR(10) || 'Tích hợp thông báo realtime' || CHR(10) || 'Cải thiện UX trang dashboard', '#dbeafe', TRUE);
INSERT INTO note_tags (document_id, tag) VALUES
('d012d012-d012-d012-d012-d012d012d012', 'Ý tưởng');

-- Document 13 (Note) - Danh sách việc cần làm
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d013d013-d013-d013-d013-d013d013d013', 'Danh sách việc cần làm', 'note', 300, 'da365ef5-b6d8-4903-82b1-12c8b8243cd6', '2026-07-06');
INSERT INTO note_metadata (document_id, content, color, pinned) VALUES
('d013d013-d013-d013-d013-d013d013d013', 'Fix bug đăng nhập' || CHR(10) || 'Viết unit test cho API' || CHR(10) || 'Cập nhật tài liệu kỹ thuật' || CHR(10) || 'Deploy version 2.1', '#dcfce7', FALSE);
INSERT INTO note_tags (document_id, tag) VALUES
('d013d013-d013-d013-d013-d013d013d013', 'Todo'),
('d013d013-d013-d013-d013-d013d013d013', 'Dev');

-- Document 14 (Other) - Config_server_production.yaml
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d014d014-d014-d014-d014-d014d014d014', 'Config_server_production.yaml', 'other', 46080, 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c', '2026-07-07');
INSERT INTO other_metadata (document_id, file_type, category) VALUES ('d014d014-d014-d014-d014-d014d014d014', '.yaml', 'code');

-- Document 15 (Other) - Readme_huong_dan_cai_dat.md
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d015d015-d015-d015-d015-d015d015d015', 'Readme_huong_dan_cai_dat.md', 'other', 28672, 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14', '2026-07-06');
INSERT INTO other_metadata (document_id, file_type, category) VALUES ('d015d015-d015-d015-d015-d015d015d015', '.md', 'text');

-- Document 16 (Media - Video) - Video_gioi_thieu_san_pham.mp4
INSERT INTO documents (id, name, type, size_bytes, author_id, uploaded_date) VALUES
('d016d016-d016-d016-d016-d016d016d016', 'Video_gioi_thieu_san_pham.mp4', 'image', 50855936, 'cb68c347-19e4-4d8e-9762-b9cf6d22ef14', '2026-07-06');
INSERT INTO media_metadata (document_id, media_type, resolution) VALUES ('d016d016-d016-d016-d016-d016d016d016', 'video', '1920x1080');

-- ============================================================================
-- 9. USEFUL VERIFICATION QUERIES
-- ============================================================================
-- Query: List all users with their primary role
-- SELECT u.full_name, u.email, r.name AS role, u.department 
-- FROM users u
-- JOIN user_roles ur ON u.id = ur.user_id
-- JOIN roles r ON ur.role_id = r.id;

-- Query: List all permissions assigned to roles
-- SELECT r.name AS role, p.name AS permission
-- FROM roles r
-- JOIN role_permissions rp ON r.id = rp.role_id
-- JOIN permissions p ON rp.permission_id = p.id
-- ORDER BY r.name, p.name;
