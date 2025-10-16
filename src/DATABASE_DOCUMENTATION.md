# On Duty Management System - Database Documentation

## Overview

This document provides comprehensive documentation for the On Duty Management System database schema. The database is designed for PostgreSQL (Supabase) and includes tables for users, OD applications, clubs, approval workflows, notifications, and audit logs.

---

## Table of Contents

1. [Database Schema Overview](#database-schema-overview)
2. [Table Definitions](#table-definitions)
3. [Relationships](#relationships)
4. [Views](#views)
5. [Functions](#functions)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Setup Instructions](#setup-instructions)
8. [Usage Examples](#usage-examples)
9. [Migration Guide](#migration-guide)

---

## Database Schema Overview

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     Users       │
│─────────────────│
│ id (PK)         │◄──────────┐
│ email           │           │
│ role            │           │
│ reg_no          │           │
│ staff_id        │           │
└─────────────────┘           │
        │                     │
        │                     │
        ▼                     │
┌─────────────────┐           │
│ OD Applications │           │
│─────────────────│           │
│ id (PK)         │           │
│ student_id (FK) ├───────────┘
│ club_id (FK)    ├───────────┐
│ faculty_appr... │           │
│ hod_approved    │           │
│ status          │           │
└─────────────────┘           │
        │                     │
        │                     │
        ▼                     │
┌─────────────────┐           │
│ Approval        │           │
│ Workflow        │           │
│─────────────────│           │
│ id (PK)         │           │
│ od_app_id (FK)  │           │
│ approver_id(FK) │           │
└─────────────────┘           │
                              │
                              │
                    ┌─────────▼──────┐
                    │     Clubs      │
                    │────────────────│
                    │ id (PK)        │
                    │ name           │
                    │ coordinator_id │
                    └────────────────┘
```

---

## Table Definitions

### 1. **users**

Stores all system users including students, staff, and HOD.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | VARCHAR(255) | User's email (unique) |
| `password_hash` | VARCHAR(255) | Hashed password |
| `name` | VARCHAR(255) | Full name |
| `role` | VARCHAR(20) | User role: 'student', 'staff', or 'hod' |
| `reg_no` | VARCHAR(50) | Student registration number (nullable) |
| `staff_id` | VARCHAR(50) | Staff ID (nullable) |
| `year` | INTEGER | Student year (1-4) |
| `section` | VARCHAR(10) | Student section |
| `department` | VARCHAR(100) | Department name |
| `phone` | VARCHAR(20) | Contact number |
| `profile_image_url` | TEXT | Profile picture URL |
| `is_active` | BOOLEAN | Account status |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |
| `last_login` | TIMESTAMP | Last login timestamp |

**Constraints:**
- Students must have `reg_no`
- Staff and HOD must have `staff_id`
- Email must be unique
- Year must be between 1 and 4

**Indexes:**
- `idx_users_role` on `role`
- `idx_users_reg_no` on `reg_no`
- `idx_users_staff_id` on `staff_id`
- `idx_users_department` on `department`
- `idx_users_email` on `email`

---

### 2. **clubs**

Stores information about college clubs for internal OD applications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Club name (unique) |
| `description` | TEXT | Club description |
| `department` | VARCHAR(100) | Associated department |
| `coordinator_staff_id` | UUID | Staff coordinator (FK to users) |
| `is_active` | BOOLEAN | Club status |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- `idx_clubs_name` on `name`
- `idx_clubs_coordinator` on `coordinator_staff_id`

---

### 3. **od_applications**

Stores all on-duty applications with approval status.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `student_id` | UUID | Student who applied (FK to users) |
| `student_reg_no` | VARCHAR(50) | Student registration number |
| `student_name` | VARCHAR(255) | Student name |
| `year` | INTEGER | Student year |
| `section` | VARCHAR(10) | Student section |
| `department` | VARCHAR(100) | Department |
| `od_type` | VARCHAR(20) | 'internal' or 'external' |
| `club_id` | UUID | Club ID for internal OD (FK to clubs) |
| `club_name` | VARCHAR(255) | Club name |
| `college_name` | VARCHAR(255) | College name for external OD |
| `role` | VARCHAR(100) | Student's role in event |
| `event_name` | VARCHAR(255) | Event name |
| `event_description` | TEXT | Event description |
| `event_start_date` | DATE | Event start date |
| `event_end_date` | DATE | Event end date |
| `duration` | VARCHAR(100) | Duration text (e.g., "2 days") |
| `faculty_approved` | BOOLEAN | Faculty approval status |
| `faculty_approved_by` | UUID | Faculty who approved (FK to users) |
| `faculty_approved_at` | TIMESTAMP | Faculty approval time |
| `faculty_remarks` | TEXT | Faculty comments |
| `hod_approved` | BOOLEAN | HOD approval status |
| `hod_approved_by` | UUID | HOD who approved (FK to users) |
| `hod_approved_at` | TIMESTAMP | HOD approval time |
| `hod_remarks` | TEXT | HOD comments |
| `status` | VARCHAR(20) | 'pending', 'approved', 'rejected', 'cancelled' |
| `supporting_document_url` | TEXT | Document URL |
| `submitted_at` | TIMESTAMP | Submission time |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Constraints:**
- Internal OD must have `club_name`
- External OD must have `college_name`
- Year must be between 1 and 4

**Indexes:**
- Multiple indexes on key fields for query performance

---

### 4. **approval_workflow**

Tracks the approval workflow history for audit purposes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `od_application_id` | UUID | OD application (FK) |
| `approver_id` | UUID | User who approved (FK to users) |
| `approver_role` | VARCHAR(20) | 'staff' or 'hod' |
| `action` | VARCHAR(20) | 'approved', 'rejected', 'pending' |
| `remarks` | TEXT | Approval/rejection comments |
| `created_at` | TIMESTAMP | Action timestamp |

---

### 5. **notifications**

Stores notifications for users about their OD applications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who receives notification (FK to users) |
| `title` | VARCHAR(255) | Notification title |
| `message` | TEXT | Notification message |
| `type` | VARCHAR(50) | Notification type |
| `related_od_application_id` | UUID | Related OD application (FK) |
| `is_read` | BOOLEAN | Read status |
| `created_at` | TIMESTAMP | Creation time |

---

### 6. **audit_logs**

Tracks all important system actions for security and auditing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who performed action |
| `user_role` | VARCHAR(20) | User's role |
| `action` | VARCHAR(100) | Action performed |
| `entity_type` | VARCHAR(50) | Type of entity affected |
| `entity_id` | UUID | ID of entity affected |
| `old_values` | JSONB | Previous values |
| `new_values` | JSONB | New values |
| `ip_address` | INET | User's IP address |
| `user_agent` | TEXT | User's browser/client |
| `created_at` | TIMESTAMP | Action timestamp |

---

### 7. **system_settings**

Stores system-wide configuration settings.

| Column | Type | Description |
|--------|------|-------------|
| `key` | VARCHAR(100) | Setting key (primary key) |
| `value` | TEXT | Setting value |
| `description` | TEXT | Setting description |
| `updated_at` | TIMESTAMP | Last update time |

---

## Relationships

### Primary Relationships

1. **Users → OD Applications** (One-to-Many)
   - A student can have multiple OD applications
   - FK: `od_applications.student_id` → `users.id`

2. **Users → Clubs** (One-to-Many)
   - A staff member can coordinate multiple clubs
   - FK: `clubs.coordinator_staff_id` → `users.id`

3. **Clubs → OD Applications** (One-to-Many)
   - A club can be associated with multiple OD applications
   - FK: `od_applications.club_id` → `clubs.id`

4. **OD Applications → Approval Workflow** (One-to-Many)
   - An OD application can have multiple approval records
   - FK: `approval_workflow.od_application_id` → `od_applications.id`

5. **Users → Approval Workflow** (One-to-Many)
   - A user (staff/HOD) can approve multiple applications
   - FK: `approval_workflow.approver_id` → `users.id`

6. **Users → Notifications** (One-to-Many)
   - A user can have multiple notifications
   - FK: `notifications.user_id` → `users.id`

---

## Views

### 1. **pending_faculty_approvals**

Shows all OD applications pending faculty approval.

```sql
SELECT * FROM pending_faculty_approvals;
```

### 2. **pending_hod_approvals**

Shows all OD applications pending HOD approval (already approved by faculty).

```sql
SELECT * FROM pending_hod_approvals;
```

### 3. **approved_applications**

Shows all fully approved OD applications.

```sql
SELECT * FROM approved_applications;
```

---

## Functions

### 1. **get_student_od_stats(student_user_id UUID)**

Returns statistics about a student's OD applications.

```sql
SELECT * FROM get_student_od_stats('student-uuid-here');
```

**Returns:**
- `total_applications`: Total number of applications
- `approved_applications`: Number of approved applications
- `pending_applications`: Number of pending applications
- `rejected_applications`: Number of rejected applications

### 2. **approve_od_application()**

Approves an OD application and handles workflow tracking.

```sql
SELECT approve_od_application(
  'application-uuid',
  'approver-uuid',
  'staff',
  'Approved for hackathon participation'
);
```

**Parameters:**
- `application_id`: UUID of the OD application
- `approver_user_id`: UUID of the approver
- `approver_type`: 'staff' or 'hod'
- `approval_remarks`: Optional comments

### 3. **reject_od_application()**

Rejects an OD application with reason.

```sql
SELECT reject_od_application(
  'application-uuid',
  'approver-uuid',
  'Insufficient documentation'
);
```

---

## Row Level Security (RLS)

RLS policies ensure users can only access data they're authorized to see.

### Key Policies

1. **Users can view their own data**
   - Students see only their own profile
   
2. **Staff and HOD can view all users**
   - Required for approval workflows

3. **Students can view and create their own applications**
   - Students can only see their OD applications
   - Students can submit new applications

4. **Staff can view and update faculty approvals**
   - Staff can see all applications
   - Staff can approve applications (faculty level)

5. **HOD can view and update HOD approvals**
   - HOD can see all applications
   - HOD can give final approval

6. **Users can view their own notifications**
   - Users only see notifications addressed to them

---

## Setup Instructions

### Step 1: Create Database in Supabase

1. Go to your Supabase project
2. Navigate to the SQL Editor
3. Copy the entire contents of `database-schema.sql`
4. Run the SQL script

### Step 2: Verify Tables

```sql
-- Check all tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Step 3: Insert Sample Data (Optional)

Sample data is included in the schema file for testing purposes.

### Step 4: Set Up Authentication

In Supabase Dashboard:
1. Go to Authentication → Settings
2. Enable Email authentication
3. Configure email templates as needed

---

## Usage Examples

### Example 1: Student Applies for OD

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
  duration
) VALUES (
  'student-uuid',
  'REG001',
  'Alice Johnson',
  3,
  'A',
  'Computer Science',
  'internal',
  'Coding Club',
  'Participant',
  'Hackathon 2025',
  '2 days'
);
```

### Example 2: Faculty Approves Application

```sql
SELECT approve_od_application(
  'od-application-uuid',
  'faculty-uuid',
  'staff',
  'Approved for participation'
);
```

### Example 3: HOD Gives Final Approval

```sql
SELECT approve_od_application(
  'od-application-uuid',
  'hod-uuid',
  'hod',
  'Final approval granted'
);
```

### Example 4: Get Student's Application History

```sql
SELECT * FROM od_applications
WHERE student_id = 'student-uuid'
ORDER BY submitted_at DESC;
```

### Example 5: Get Pending Approvals for Staff

```sql
SELECT * FROM pending_faculty_approvals
ORDER BY submitted_at ASC;
```

### Example 6: Get Student Statistics

```sql
SELECT * FROM get_student_od_stats('student-uuid');
```

---

## Migration Guide

### From Mock Data to Database

To migrate your existing React application to use the database:

#### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

#### 2. Update AuthContext to Use Supabase

```typescript
// Example authentication with Supabase
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});
```

#### 3. Update API Calls

Replace mock data with Supabase queries:

```typescript
// Example: Fetch OD applications
const { data, error } = await supabase
  .from('od_applications')
  .select('*')
  .eq('student_id', userId);
```

#### 4. Implement Real-time Updates (Optional)

```typescript
// Subscribe to changes in OD applications
supabase
  .channel('od_applications')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'od_applications' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe();
```

---

## Security Best Practices

1. **Never store plain text passwords**
   - Always hash passwords using bcrypt or similar

2. **Enable RLS on all tables**
   - Already configured in the schema

3. **Validate input on client and server**
   - Use constraints and triggers

4. **Use prepared statements**
   - Prevents SQL injection

5. **Audit important actions**
   - Log all critical operations to `audit_logs`

6. **Regular backups**
   - Configure Supabase backup policies

---

## API Integration Examples

### TypeScript Types (Already in /types/index.ts)

Your existing types align with the database schema:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'staff' | 'hod';
  regNo?: string;
  staffId?: string;
  department?: string;
  year?: number;
  section?: string;
}

interface ODApplication {
  id: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  year: number;
  section: string;
  odType: 'internal' | 'external';
  clubName?: string;
  collegeName?: string;
  role: string;
  eventName: string;
  duration: string;
  facultyApproved: boolean;
  hodApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}
```

---

## Troubleshooting

### Common Issues

**Issue 1: RLS denies access**
- Solution: Check if policies are correctly set for the user's role

**Issue 2: Foreign key constraint violation**
- Solution: Ensure referenced records exist before insertion

**Issue 3: Trigger not firing**
- Solution: Verify trigger is created and enabled

**Issue 4: View returns no data**
- Solution: Check if underlying query conditions are met

---

## Performance Optimization

1. **Indexes are already created** on frequently queried columns
2. **Use views** for complex queries instead of joining tables repeatedly
3. **Implement pagination** for large result sets:

```sql
SELECT * FROM od_applications
ORDER BY submitted_at DESC
LIMIT 20 OFFSET 0;
```

4. **Use connection pooling** in production
5. **Monitor query performance** using Supabase dashboard

---

## Backup and Recovery

### Manual Backup

```sql
-- Export specific table
pg_dump -h your-db-host -U postgres -t od_applications > od_backup.sql
```

### Automated Backups

Configure in Supabase Dashboard → Database → Backups

---

## Support and Maintenance

### Monitoring

- Monitor slow queries in Supabase Dashboard
- Set up alerts for failed queries
- Track table sizes and growth

### Regular Maintenance

```sql
-- Vacuum and analyze tables (run monthly)
VACUUM ANALYZE;

-- Update table statistics
ANALYZE;

-- Check for bloat
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Contact and Support

For issues or questions about the database schema:
- Review this documentation
- Check Supabase documentation: https://supabase.com/docs
- Review PostgreSQL documentation: https://www.postgresql.org/docs/

---

## Changelog

### Version 1.0 (October 13, 2025)
- Initial database schema
- All core tables implemented
- RLS policies configured
- Functions and views created
- Sample data included

---

## License

This database schema is part of the On Duty Management System project.

---

**Last Updated:** October 13, 2025
