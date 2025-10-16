-- ============================================
-- ON DUTY MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================
-- Database: PostgreSQL (Supabase)
-- Created: October 13, 2025
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Stores all users (Students, Staff, HOD)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'staff', 'hod')),
  
  -- Student-specific fields
  reg_no VARCHAR(50) UNIQUE,
  year INTEGER CHECK (year BETWEEN 1 AND 4),
  section VARCHAR(10),
  
  -- Staff-specific fields
  staff_id VARCHAR(50) UNIQUE,
  
  -- Common fields
  department VARCHAR(100),
  phone VARCHAR(20),
  profile_image_url TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT user_identity_check CHECK (
    (role = 'student' AND reg_no IS NOT NULL) OR
    (role IN ('staff', 'hod') AND staff_id IS NOT NULL)
  )
);

-- Indexes for users table
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_reg_no ON users(reg_no);
CREATE INDEX idx_users_staff_id ON users(staff_id);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. CLUBS TABLE
-- ============================================
-- Stores information about college clubs
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  department VARCHAR(100),
  coordinator_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for clubs table
CREATE INDEX idx_clubs_name ON clubs(name);
CREATE INDEX idx_clubs_coordinator ON clubs(coordinator_staff_id);

-- ============================================
-- 3. OD APPLICATIONS TABLE
-- ============================================
-- Stores all on-duty applications
CREATE TABLE od_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Student Information
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_reg_no VARCHAR(50) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
  section VARCHAR(10) NOT NULL,
  department VARCHAR(100),
  
  -- OD Details
  od_type VARCHAR(20) NOT NULL CHECK (od_type IN ('internal', 'external')),
  
  -- Internal OD fields
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  club_name VARCHAR(255),
  
  -- External OD fields
  college_name VARCHAR(255),
  
  -- Event Details
  role VARCHAR(100) NOT NULL, -- participant, coordinator, volunteer, organizer
  event_name VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_start_date DATE,
  event_end_date DATE,
  duration VARCHAR(100) NOT NULL, -- e.g., "2 days", "1 week"
  
  -- Approval Status
  faculty_approved BOOLEAN DEFAULT false,
  faculty_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  faculty_approved_at TIMESTAMP WITH TIME ZONE,
  faculty_remarks TEXT,
  
  hod_approved BOOLEAN DEFAULT false,
  hod_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  hod_approved_at TIMESTAMP WITH TIME ZONE,
  hod_remarks TEXT,
  
  -- Overall Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  
  -- Supporting Documents
  supporting_document_url TEXT,
  
  -- Metadata
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT od_type_check CHECK (
    (od_type = 'internal' AND club_name IS NOT NULL) OR
    (od_type = 'external' AND college_name IS NOT NULL)
  )
);

-- Indexes for od_applications table
CREATE INDEX idx_od_student_id ON od_applications(student_id);
CREATE INDEX idx_od_student_reg_no ON od_applications(student_reg_no);
CREATE INDEX idx_od_status ON od_applications(status);
CREATE INDEX idx_od_od_type ON od_applications(od_type);
CREATE INDEX idx_od_faculty_approved ON od_applications(faculty_approved);
CREATE INDEX idx_od_hod_approved ON od_applications(hod_approved);
CREATE INDEX idx_od_submitted_at ON od_applications(submitted_at);
CREATE INDEX idx_od_club_id ON od_applications(club_id);
CREATE INDEX idx_od_department ON od_applications(department);

-- ============================================
-- 4. APPROVAL WORKFLOW TABLE
-- ============================================
-- Tracks the approval workflow history
CREATE TABLE approval_workflow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  od_application_id UUID NOT NULL REFERENCES od_applications(id) ON DELETE CASCADE,
  
  -- Approval Details
  approver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approver_role VARCHAR(20) NOT NULL CHECK (approver_role IN ('staff', 'hod')),
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'pending')),
  remarks TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for approval_workflow table
CREATE INDEX idx_workflow_od_application ON approval_workflow(od_application_id);
CREATE INDEX idx_workflow_approver ON approval_workflow(approver_id);
CREATE INDEX idx_workflow_action ON approval_workflow(action);

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================
-- Stores notifications for users
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Details
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'od_submitted', 'od_approved', 'od_rejected', etc.
  
  -- Related Entity
  related_od_application_id UUID REFERENCES od_applications(id) ON DELETE CASCADE,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- 6. AUDIT LOGS TABLE
-- ============================================
-- Tracks all important actions in the system
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User Information
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_role VARCHAR(20),
  
  -- Action Details
  action VARCHAR(100) NOT NULL, -- 'login', 'od_application_submitted', 'od_approved', etc.
  entity_type VARCHAR(50), -- 'user', 'od_application', 'club', etc.
  entity_id UUID,
  
  -- Additional Details
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit_logs table
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);

-- ============================================
-- 7. SYSTEM SETTINGS TABLE
-- ============================================
-- Stores system-wide settings
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_od_applications_updated_at BEFORE UPDATE ON od_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE od_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Staff and HOD can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'hod')
    )
  );

-- OD Applications policies
CREATE POLICY "Students can view their own applications"
  ON od_applications FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create applications"
  ON od_applications FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Staff can view all applications"
  ON od_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'hod')
    )
  );

CREATE POLICY "Staff can update faculty approval"
  ON od_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'staff'
    )
  );

CREATE POLICY "HOD can update hod approval"
  ON od_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'hod'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- VIEWS
-- ============================================

-- View for pending faculty approvals
CREATE VIEW pending_faculty_approvals AS
SELECT 
  od.*,
  u.name as student_full_name,
  u.email as student_email
FROM od_applications od
JOIN users u ON od.student_id = u.id
WHERE od.faculty_approved = false
  AND od.status = 'pending'
ORDER BY od.submitted_at ASC;

-- View for pending HOD approvals
CREATE VIEW pending_hod_approvals AS
SELECT 
  od.*,
  u.name as student_full_name,
  u.email as student_email,
  faculty.name as faculty_approved_by_name
FROM od_applications od
JOIN users u ON od.student_id = u.id
LEFT JOIN users faculty ON od.faculty_approved_by = faculty.id
WHERE od.faculty_approved = true
  AND od.hod_approved = false
  AND od.status = 'pending'
ORDER BY od.submitted_at ASC;

-- View for approved applications
CREATE VIEW approved_applications AS
SELECT 
  od.*,
  u.name as student_full_name,
  u.email as student_email,
  faculty.name as faculty_approved_by_name,
  hod.name as hod_approved_by_name
FROM od_applications od
JOIN users u ON od.student_id = u.id
LEFT JOIN users faculty ON od.faculty_approved_by = faculty.id
LEFT JOIN users hod ON od.hod_approved_by = hod.id
WHERE od.status = 'approved'
ORDER BY od.submitted_at DESC;

-- ============================================
-- SAMPLE DATA (FOR TESTING)
-- ============================================

-- Insert sample users (passwords should be hashed in production)
INSERT INTO users (email, password_hash, name, role, staff_id, department) VALUES
  ('hod@college.edu', '$2a$10$example_hash_1', 'Dr. John Smith', 'hod', 'STAFF001', 'Computer Science'),
  ('faculty@college.edu', '$2a$10$example_hash_2', 'Prof. Jane Doe', 'staff', 'STAFF002', 'Computer Science');

INSERT INTO users (email, password_hash, name, role, reg_no, year, section, department) VALUES
  ('alice@student.edu', '$2a$10$example_hash_3', 'Alice Johnson', 'student', 'REG001', 3, 'A', 'Computer Science'),
  ('bob@student.edu', '$2a$10$example_hash_4', 'Bob Smith', 'student', 'REG002', 2, 'B', 'Computer Science'),
  ('carol@student.edu', '$2a$10$example_hash_5', 'Carol Davis', 'student', 'REG003', 4, 'A', 'Computer Science');

-- Insert sample clubs
INSERT INTO clubs (name, description, department, coordinator_staff_id) VALUES
  ('Coding Club', 'A club for programming enthusiasts', 'Computer Science', (SELECT id FROM users WHERE staff_id = 'STAFF002')),
  ('Music Club', 'College music and performing arts club', 'Arts', (SELECT id FROM users WHERE staff_id = 'STAFF002')),
  ('Sports Club', 'College sports activities club', 'Physical Education', (SELECT id FROM users WHERE staff_id = 'STAFF002'));

-- Insert sample system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('max_od_duration_days', '7', 'Maximum number of days allowed for OD'),
  ('require_documents', 'false', 'Whether supporting documents are required'),
  ('auto_approve_internal', 'false', 'Automatically approve internal OD applications');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get student OD statistics
CREATE OR REPLACE FUNCTION get_student_od_stats(student_user_id UUID)
RETURNS TABLE(
  total_applications BIGINT,
  approved_applications BIGINT,
  pending_applications BIGINT,
  rejected_applications BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications
  FROM od_applications
  WHERE student_id = student_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve OD application (with workflow tracking)
CREATE OR REPLACE FUNCTION approve_od_application(
  application_id UUID,
  approver_user_id UUID,
  approver_type VARCHAR,
  approval_remarks TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_approver_role VARCHAR;
BEGIN
  -- Get approver role
  SELECT role INTO v_approver_role FROM users WHERE id = approver_user_id;
  
  -- Update application based on approver role
  IF v_approver_role = 'staff' THEN
    UPDATE od_applications
    SET 
      faculty_approved = true,
      faculty_approved_by = approver_user_id,
      faculty_approved_at = CURRENT_TIMESTAMP,
      faculty_remarks = approval_remarks
    WHERE id = application_id;
  ELSIF v_approver_role = 'hod' THEN
    UPDATE od_applications
    SET 
      hod_approved = true,
      hod_approved_by = approver_user_id,
      hod_approved_at = CURRENT_TIMESTAMP,
      hod_remarks = approval_remarks,
      status = 'approved'
    WHERE id = application_id;
  END IF;
  
  -- Add to approval workflow
  INSERT INTO approval_workflow (od_application_id, approver_id, approver_role, action, remarks)
  VALUES (application_id, approver_user_id, v_approver_role, 'approved', approval_remarks);
  
  -- Create notification for student
  INSERT INTO notifications (user_id, title, message, type, related_od_application_id)
  SELECT 
    student_id,
    'OD Application Approved',
    CASE 
      WHEN v_approver_role = 'staff' THEN 'Your OD application has been approved by faculty'
      WHEN v_approver_role = 'hod' THEN 'Your OD application has been approved by HOD'
    END,
    'od_approved',
    application_id
  FROM od_applications
  WHERE id = application_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to reject OD application
CREATE OR REPLACE FUNCTION reject_od_application(
  application_id UUID,
  approver_user_id UUID,
  rejection_remarks TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_approver_role VARCHAR;
BEGIN
  -- Get approver role
  SELECT role INTO v_approver_role FROM users WHERE id = approver_user_id;
  
  -- Update application status to rejected
  UPDATE od_applications
  SET 
    status = 'rejected',
    updated_at = CURRENT_TIMESTAMP
  WHERE id = application_id;
  
  -- Add to approval workflow
  INSERT INTO approval_workflow (od_application_id, approver_id, approver_role, action, remarks)
  VALUES (application_id, approver_user_id, v_approver_role, 'rejected', rejection_remarks);
  
  -- Create notification for student
  INSERT INTO notifications (user_id, title, message, type, related_od_application_id)
  SELECT 
    student_id,
    'OD Application Rejected',
    'Your OD application has been rejected. Reason: ' || rejection_remarks,
    'od_rejected',
    application_id
  FROM od_applications
  WHERE id = application_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant appropriate permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Stores all system users including students, staff, and HOD';
COMMENT ON TABLE clubs IS 'Stores information about college clubs';
COMMENT ON TABLE od_applications IS 'Stores all on-duty applications with approval workflow';
COMMENT ON TABLE approval_workflow IS 'Tracks the history of approvals for OD applications';
COMMENT ON TABLE notifications IS 'Stores notifications for users';
COMMENT ON TABLE audit_logs IS 'Tracks all important system actions for audit purposes';
COMMENT ON TABLE system_settings IS 'Stores system-wide configuration settings';

-- ============================================
-- END OF SCHEMA
-- ============================================
