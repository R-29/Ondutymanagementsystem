# Database Quick Reference Guide

Quick reference for common database operations in the On Duty Management System.

---

## 🔑 Authentication Queries

### Create New User (Student)
```sql
INSERT INTO users (email, password_hash, name, role, reg_no, year, section, department)
VALUES (
  'student@college.edu',
  '$2a$10$hashed_password_here',
  'John Doe',
  'student',
  'REG123',
  2,
  'A',
  'Computer Science'
);
```

### Create New User (Staff)
```sql
INSERT INTO users (email, password_hash, name, role, staff_id, department)
VALUES (
  'staff@college.edu',
  '$2a$10$hashed_password_here',
  'Prof. Jane Smith',
  'staff',
  'STAFF123',
  'Computer Science'
);
```

### Login Query
```sql
SELECT id, email, name, role, reg_no, staff_id, department, year, section
FROM users
WHERE email = 'user@college.edu'
  AND is_active = true;
-- Then verify password_hash in application code
```

---

## 📝 OD Application Queries

### Submit New OD Application (Internal)
```sql
INSERT INTO od_applications (
  student_id,
  student_reg_no,
  student_name,
  year,
  section,
  department,
  od_type,
  club_name,
  role,
  event_name,
  duration,
  event_start_date,
  event_end_date
) VALUES (
  'user-uuid-here',
  'REG001',
  'Alice Johnson',
  3,
  'A',
  'Computer Science',
  'internal',
  'Coding Club',
  'participant',
  'Hackathon 2025',
  '2 days',
  '2025-11-01',
  '2025-11-02'
);
```

### Submit New OD Application (External)
```sql
INSERT INTO od_applications (
  student_id,
  student_reg_no,
  student_name,
  year,
  section,
  department,
  od_type,
  college_name,
  role,
  event_name,
  duration
) VALUES (
  'user-uuid-here',
  'REG001',
  'Alice Johnson',
  3,
  'A',
  'Computer Science',
  'external',
  'ABC College',
  'volunteer',
  'Tech Fest 2025',
  '3 days'
);
```

### Get Student's Applications
```sql
SELECT 
  id,
  od_type,
  club_name,
  college_name,
  event_name,
  duration,
  status,
  faculty_approved,
  hod_approved,
  submitted_at
FROM od_applications
WHERE student_id = 'user-uuid-here'
ORDER BY submitted_at DESC;
```

### Get Application Details
```sql
SELECT 
  od.*,
  faculty.name as faculty_approved_by_name,
  hod.name as hod_approved_by_name,
  club.name as club_full_name
FROM od_applications od
LEFT JOIN users faculty ON od.faculty_approved_by = faculty.id
LEFT JOIN users hod ON od.hod_approved_by = hod.id
LEFT JOIN clubs club ON od.club_id = club.id
WHERE od.id = 'application-uuid-here';
```

---

## ✅ Faculty Approval Queries

### Get Pending Applications for Faculty
```sql
SELECT * FROM pending_faculty_approvals;
```

Or with more details:
```sql
SELECT 
  id,
  student_reg_no,
  student_name,
  year,
  section,
  od_type,
  club_name,
  college_name,
  event_name,
  duration,
  submitted_at
FROM od_applications
WHERE faculty_approved = false
  AND status = 'pending'
ORDER BY submitted_at ASC;
```

### Approve Application (Faculty)
```sql
-- Using the function (recommended)
SELECT approve_od_application(
  'application-uuid',
  'faculty-user-uuid',
  'staff',
  'Approved for event participation'
);

-- Or manually
UPDATE od_applications
SET 
  faculty_approved = true,
  faculty_approved_by = 'faculty-user-uuid',
  faculty_approved_at = CURRENT_TIMESTAMP,
  faculty_remarks = 'Approved for event participation'
WHERE id = 'application-uuid';
```

### Batch Approve (Faculty)
```sql
UPDATE od_applications
SET 
  faculty_approved = true,
  faculty_approved_by = 'faculty-user-uuid',
  faculty_approved_at = CURRENT_TIMESTAMP
WHERE id IN ('uuid1', 'uuid2', 'uuid3');
```

---

## 👨‍💼 HOD Approval Queries

### Get Pending Applications for HOD
```sql
SELECT * FROM pending_hod_approvals;
```

Or:
```sql
SELECT 
  od.*,
  u.name as student_full_name,
  faculty.name as faculty_name
FROM od_applications od
JOIN users u ON od.student_id = u.id
LEFT JOIN users faculty ON od.faculty_approved_by = faculty.id
WHERE od.faculty_approved = true
  AND od.hod_approved = false
  AND od.status = 'pending'
ORDER BY od.submitted_at ASC;
```

### Approve Application (HOD)
```sql
-- Using the function (recommended)
SELECT approve_od_application(
  'application-uuid',
  'hod-user-uuid',
  'hod',
  'Final approval granted'
);

-- Or manually
UPDATE od_applications
SET 
  hod_approved = true,
  hod_approved_by = 'hod-user-uuid',
  hod_approved_at = CURRENT_TIMESTAMP,
  hod_remarks = 'Final approval granted',
  status = 'approved'
WHERE id = 'application-uuid';
```

### Batch Approve (HOD)
```sql
UPDATE od_applications
SET 
  hod_approved = true,
  hod_approved_by = 'hod-user-uuid',
  hod_approved_at = CURRENT_TIMESTAMP,
  status = 'approved'
WHERE id IN ('uuid1', 'uuid2', 'uuid3')
  AND faculty_approved = true;
```

---

## ❌ Rejection Queries

### Reject Application
```sql
-- Using the function (recommended)
SELECT reject_od_application(
  'application-uuid',
  'approver-user-uuid',
  'Insufficient documentation provided'
);

-- Or manually
UPDATE od_applications
SET 
  status = 'rejected'
WHERE id = 'application-uuid';
```

---

## 📊 Statistics and Reports

### Student Statistics
```sql
SELECT * FROM get_student_od_stats('student-user-uuid');
```

### Department Statistics
```sql
SELECT 
  department,
  COUNT(*) as total_applications,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected
FROM od_applications
GROUP BY department
ORDER BY total_applications DESC;
```

### Applications by OD Type
```sql
SELECT 
  od_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'approved') as approved
FROM od_applications
GROUP BY od_type;
```

### Applications by Date Range
```sql
SELECT 
  DATE(submitted_at) as date,
  COUNT(*) as applications
FROM od_applications
WHERE submitted_at >= '2025-10-01'
  AND submitted_at < '2025-11-01'
GROUP BY DATE(submitted_at)
ORDER BY date;
```

### Top Clubs by Applications
```sql
SELECT 
  club_name,
  COUNT(*) as application_count
FROM od_applications
WHERE od_type = 'internal'
  AND club_name IS NOT NULL
GROUP BY club_name
ORDER BY application_count DESC
LIMIT 10;
```

### Faculty Approval Performance
```sql
SELECT 
  faculty.name as faculty_name,
  COUNT(*) as approved_count,
  AVG(EXTRACT(EPOCH FROM (faculty_approved_at - submitted_at))/3600) as avg_hours_to_approve
FROM od_applications od
JOIN users faculty ON od.faculty_approved_by = faculty.id
WHERE faculty_approved = true
GROUP BY faculty.id, faculty.name
ORDER BY approved_count DESC;
```

---

## 🔔 Notification Queries

### Get User's Unread Notifications
```sql
SELECT 
  id,
  title,
  message,
  type,
  created_at
FROM notifications
WHERE user_id = 'user-uuid-here'
  AND is_read = false
ORDER BY created_at DESC;
```

### Mark Notification as Read
```sql
UPDATE notifications
SET is_read = true
WHERE id = 'notification-uuid';
```

### Mark All Notifications as Read
```sql
UPDATE notifications
SET is_read = true
WHERE user_id = 'user-uuid-here'
  AND is_read = false;
```

### Create Manual Notification
```sql
INSERT INTO notifications (user_id, title, message, type)
VALUES (
  'user-uuid-here',
  'System Maintenance',
  'System will be down for maintenance on Sunday',
  'system_announcement'
);
```

---

## 🏫 Club Management Queries

### Get All Active Clubs
```sql
SELECT 
  c.id,
  c.name,
  c.description,
  c.department,
  u.name as coordinator_name
FROM clubs c
LEFT JOIN users u ON c.coordinator_staff_id = u.id
WHERE c.is_active = true
ORDER BY c.name;
```

### Create New Club
```sql
INSERT INTO clubs (name, description, department, coordinator_staff_id)
VALUES (
  'Robotics Club',
  'Club for robotics and automation enthusiasts',
  'Computer Science',
  'coordinator-user-uuid'
);
```

### Update Club Coordinator
```sql
UPDATE clubs
SET coordinator_staff_id = 'new-coordinator-uuid'
WHERE id = 'club-uuid';
```

### Get Club Statistics
```sql
SELECT 
  c.name,
  COUNT(od.id) as total_applications,
  COUNT(od.id) FILTER (WHERE od.status = 'approved') as approved_applications
FROM clubs c
LEFT JOIN od_applications od ON c.id = od.club_id
GROUP BY c.id, c.name
ORDER BY total_applications DESC;
```

---

## 🔍 Search Queries

### Search Applications by Student Name
```sql
SELECT 
  id,
  student_name,
  student_reg_no,
  event_name,
  status,
  submitted_at
FROM od_applications
WHERE student_name ILIKE '%search_term%'
ORDER BY submitted_at DESC;
```

### Search Applications by Event
```sql
SELECT 
  id,
  student_name,
  event_name,
  od_type,
  status
FROM od_applications
WHERE event_name ILIKE '%hackathon%'
ORDER BY submitted_at DESC;
```

### Advanced Search
```sql
SELECT 
  od.*
FROM od_applications od
WHERE 
  (student_name ILIKE '%search%' OR student_reg_no ILIKE '%search%')
  AND year = 3
  AND status = 'pending'
  AND od_type = 'internal'
ORDER BY submitted_at DESC;
```

---

## 🔐 Admin Queries

### Get All Users by Role
```sql
SELECT 
  id,
  name,
  email,
  reg_no,
  staff_id,
  department,
  created_at
FROM users
WHERE role = 'student'
  AND is_active = true
ORDER BY name;
```

### Deactivate User
```sql
UPDATE users
SET is_active = false
WHERE id = 'user-uuid';
```

### Get Audit Log
```sql
SELECT 
  al.action,
  al.entity_type,
  al.created_at,
  u.name as user_name,
  u.role as user_role
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at >= NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC
LIMIT 100;
```

### System Settings
```sql
-- Get setting
SELECT value FROM system_settings WHERE key = 'max_od_duration_days';

-- Update setting
UPDATE system_settings
SET value = '10', updated_at = CURRENT_TIMESTAMP
WHERE key = 'max_od_duration_days';

-- Add new setting
INSERT INTO system_settings (key, value, description)
VALUES ('new_setting', 'value', 'Setting description');
```

---

## 🔄 Workflow Queries

### Get Application Approval History
```sql
SELECT 
  aw.action,
  aw.approver_role,
  aw.remarks,
  aw.created_at,
  u.name as approver_name
FROM approval_workflow aw
JOIN users u ON aw.approver_id = u.id
WHERE aw.od_application_id = 'application-uuid'
ORDER BY aw.created_at ASC;
```

### Get Pending Approvals Count
```sql
-- For Faculty
SELECT COUNT(*) as pending_count
FROM od_applications
WHERE faculty_approved = false
  AND status = 'pending';

-- For HOD
SELECT COUNT(*) as pending_count
FROM od_applications
WHERE faculty_approved = true
  AND hod_approved = false
  AND status = 'pending';
```

---

## 🗑️ Cleanup Queries

### Delete Old Notifications (older than 30 days)
```sql
DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '30 days'
  AND is_read = true;
```

### Archive Old Applications (move to archive table if needed)
```sql
-- First create archive table
CREATE TABLE od_applications_archive (LIKE od_applications INCLUDING ALL);

-- Then move old data
INSERT INTO od_applications_archive
SELECT * FROM od_applications
WHERE submitted_at < NOW() - INTERVAL '1 year';

-- Delete from main table
DELETE FROM od_applications
WHERE submitted_at < NOW() - INTERVAL '1 year';
```

---

## 🛠️ Maintenance Queries

### Check Database Size
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

### Vacuum and Analyze
```sql
VACUUM ANALYZE od_applications;
```

---

## 📱 Mobile App / API Queries

### Dashboard Data for Student
```sql
-- Single query to get dashboard data
SELECT 
  (SELECT COUNT(*) FROM od_applications WHERE student_id = 'user-uuid' AND status = 'pending') as pending_count,
  (SELECT COUNT(*) FROM od_applications WHERE student_id = 'user-uuid' AND status = 'approved') as approved_count,
  (SELECT COUNT(*) FROM notifications WHERE user_id = 'user-uuid' AND is_read = false) as unread_notifications;
```

### Dashboard Data for Staff
```sql
SELECT 
  (SELECT COUNT(*) FROM od_applications WHERE faculty_approved = false AND status = 'pending') as pending_approvals,
  (SELECT COUNT(*) FROM od_applications WHERE faculty_approved = true) as total_approved;
```

### Dashboard Data for HOD
```sql
SELECT 
  (SELECT COUNT(*) FROM od_applications WHERE faculty_approved = true AND hod_approved = false) as pending_approvals,
  (SELECT COUNT(*) FROM od_applications WHERE hod_approved = true) as total_approved;
```

---

## 💡 Pro Tips

1. **Use Prepared Statements**: Always use parameterized queries to prevent SQL injection
2. **Use Transactions**: Wrap multiple related operations in transactions
3. **Use Views**: The predefined views (`pending_faculty_approvals`, etc.) are optimized
4. **Index Usage**: The schema has indexes on key columns for better performance
5. **Batch Operations**: Use `IN` clause for batch operations instead of multiple queries
6. **RLS Policies**: Remember that Row Level Security is enabled - queries respect user permissions
7. **Use Functions**: The provided functions (`approve_od_application`, etc.) handle workflow logic automatically

---

## 🚀 Performance Tips

```sql
-- Use EXPLAIN to analyze query performance
EXPLAIN ANALYZE
SELECT * FROM od_applications
WHERE student_id = 'user-uuid';

-- Add indexes if needed
CREATE INDEX idx_custom ON od_applications(column_name);

-- Use LIMIT for pagination
SELECT * FROM od_applications
ORDER BY submitted_at DESC
LIMIT 20 OFFSET 0;
```

---

**Quick Reference Version 1.0**  
Last Updated: October 13, 2025
