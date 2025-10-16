# Supabase Integration Guide for React Application

This guide shows how to integrate your On Duty Management System with Supabase database.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Environment Configuration](#environment-configuration)
3. [Supabase Client Setup](#supabase-client-setup)
4. [Authentication](#authentication)
5. [CRUD Operations](#crud-operations)
6. [Real-time Subscriptions](#real-time-subscriptions)
7. [File Upload](#file-upload)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)

---

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Click "Run" to execute

---

## 🔧 Environment Configuration

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from: Supabase Dashboard → Settings → API

---

## 🔌 Supabase Client Setup

### Create Supabase Client

Create `/utils/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);
```

### Database Types

Create `/types/database.ts` (auto-generated from Supabase):

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: "student" | "staff" | "hod";
          reg_no: string | null;
          staff_id: string | null;
          year: number | null;
          section: string | null;
          department: string | null;
          phone: string | null;
          profile_image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name: string;
          role: "student" | "staff" | "hod";
          reg_no?: string | null;
          staff_id?: string | null;
          year?: number | null;
          section?: string | null;
          department?: string | null;
          phone?: string | null;
          profile_image_url?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          phone?: string;
          profile_image_url?: string;
          last_login?: string;
        };
      };
      od_applications: {
        Row: {
          id: string;
          student_id: string;
          student_reg_no: string;
          student_name: string;
          year: number;
          section: string;
          department: string | null;
          od_type: "internal" | "external";
          club_id: string | null;
          club_name: string | null;
          college_name: string | null;
          role: string;
          event_name: string;
          event_description: string | null;
          event_start_date: string | null;
          event_end_date: string | null;
          duration: string;
          faculty_approved: boolean;
          faculty_approved_by: string | null;
          faculty_approved_at: string | null;
          faculty_remarks: string | null;
          hod_approved: boolean;
          hod_approved_by: string | null;
          hod_approved_at: string | null;
          hod_remarks: string | null;
          status:
            | "pending"
            | "approved"
            | "rejected"
            | "cancelled";
          supporting_document_url: string | null;
          submitted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          student_id: string;
          student_reg_no: string;
          student_name: string;
          year: number;
          section: string;
          department?: string | null;
          od_type: "internal" | "external";
          club_name?: string | null;
          college_name?: string | null;
          role: string;
          event_name: string;
          duration: string;
        };
        Update: {
          faculty_approved?: boolean;
          faculty_approved_by?: string;
          faculty_approved_at?: string;
          faculty_remarks?: string;
          hod_approved?: boolean;
          hod_approved_by?: string;
          hod_approved_at?: string;
          hod_remarks?: string;
          status?:
            | "pending"
            | "approved"
            | "rejected"
            | "cancelled";
        };
      };
      // Add other tables as needed
    };
    Views: {
      pending_faculty_approvals: {
        Row: {
          // Same as od_applications
        };
      };
      pending_hod_approvals: {
        Row: {
          // Same as od_applications
        };
      };
    };
    Functions: {
      approve_od_application: {
        Args: {
          application_id: string;
          approver_user_id: string;
          approver_type: string;
          approval_remarks?: string;
        };
        Returns: boolean;
      };
      reject_od_application: {
        Args: {
          application_id: string;
          approver_user_id: string;
          rejection_remarks: string;
        };
        Returns: boolean;
      };
      get_student_od_stats: {
        Args: {
          student_user_id: string;
        };
        Returns: {
          total_applications: number;
          approved_applications: number;
          pending_applications: number;
          rejected_applications: number;
        }[];
      };
    };
  };
}
```

---

## 🔐 Authentication

### Update AuthContext to Use Supabase

Update `/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase/client';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: UserRole, id: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (userData: SignupData) => Promise<boolean>;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  regNo?: string;
  staffId?: string;
  year?: number;
  section?: string;
  department?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          regNo: data.reg_no || undefined,
          staffId: data.staff_id || undefined,
          role: data.role as UserRole,
          department: data.department || undefined,
          year: data.year || undefined,
          section: data.section || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (role: UserRole, id: string, password: string): Promise<boolean> => {
    try {
      // First, get the user's email from the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, role')
        .or(`reg_no.eq.${id},staff_id.eq.${id}`)
        .eq('role', role)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        console.error('User not found');
        return false;
      }

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      await loadUserProfile(data.user.id);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError || !authData.user) {
        console.error('Signup error:', authError);
        return false;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          reg_no: userData.regNo,
          staff_id: userData.staffId,
          year: userData.year,
          section: userData.section,
          department: userData.department,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return false;
      }

      await loadUserProfile(authData.user.id);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## 📝 CRUD Operations

### OD Applications Service

Create `/services/odApplicationService.ts`:

```typescript
import { supabase } from "../utils/supabase/client";
import { ODApplication } from "../types";

export const odApplicationService = {
  // Create new OD application
  async createApplication(data: {
    studentId: string;
    studentRegNo: string;
    studentName: string;
    year: number;
    section: string;
    department?: string;
    odType: "internal" | "external";
    clubName?: string;
    collegeName?: string;
    role: string;
    eventName: string;
    duration: string;
    eventStartDate?: string;
    eventEndDate?: string;
    eventDescription?: string;
  }) {
    const { data: result, error } = await supabase
      .from("od_applications")
      .insert({
        student_id: data.studentId,
        student_reg_no: data.studentRegNo,
        student_name: data.studentName,
        year: data.year,
        section: data.section,
        department: data.department,
        od_type: data.odType,
        club_name: data.clubName,
        college_name: data.collegeName,
        role: data.role,
        event_name: data.eventName,
        duration: data.duration,
        event_start_date: data.eventStartDate,
        event_end_date: data.eventEndDate,
        event_description: data.eventDescription,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating application:", error);
      throw error;
    }

    return result;
  },

  // Get student's applications
  async getStudentApplications(studentId: string) {
    const { data, error } = await supabase
      .from("od_applications")
      .select("*")
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }

    return data;
  },

  // Get pending faculty approvals
  async getPendingFacultyApprovals() {
    const { data, error } = await supabase
      .from("pending_faculty_approvals")
      .select("*");

    if (error) {
      console.error("Error fetching pending approvals:", error);
      throw error;
    }

    return data;
  },

  // Get pending HOD approvals
  async getPendingHODApprovals() {
    const { data, error } = await supabase
      .from("pending_hod_approvals")
      .select("*");

    if (error) {
      console.error("Error fetching HOD approvals:", error);
      throw error;
    }

    return data;
  },

  // Approve application (using database function)
  async approveApplication(
    applicationId: string,
    approverId: string,
    approverType: "staff" | "hod",
    remarks?: string,
  ) {
    const { data, error } = await supabase.rpc(
      "approve_od_application",
      {
        application_id: applicationId,
        approver_user_id: approverId,
        approver_type: approverType,
        approval_remarks: remarks,
      },
    );

    if (error) {
      console.error("Error approving application:", error);
      throw error;
    }

    return data;
  },

  // Batch approve applications
  async batchApproveApplications(
    applicationIds: string[],
    approverId: string,
    approverType: "staff" | "hod",
  ) {
    const promises = applicationIds.map((id) =>
      this.approveApplication(id, approverId, approverType),
    );

    return Promise.all(promises);
  },

  // Reject application
  async rejectApplication(
    applicationId: string,
    approverId: string,
    remarks: string,
  ) {
    const { data, error } = await supabase.rpc(
      "reject_od_application",
      {
        application_id: applicationId,
        approver_user_id: approverId,
        rejection_remarks: remarks,
      },
    );

    if (error) {
      console.error("Error rejecting application:", error);
      throw error;
    }

    return data;
  },

  // Get application statistics
  async getStudentStats(studentId: string) {
    const { data, error } = await supabase.rpc(
      "get_student_od_stats",
      {
        student_user_id: studentId,
      },
    );

    if (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }

    return data[0];
  },

  // Cancel application
  async cancelApplication(applicationId: string) {
    const { data, error } = await supabase
      .from("od_applications")
      .update({ status: "cancelled" })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      console.error("Error cancelling application:", error);
      throw error;
    }

    return data;
  },
};
```

### Clubs Service

Create `/services/clubService.ts`:

```typescript
import { supabase } from "../utils/supabase/client";

export const clubService = {
  // Get all active clubs
  async getAllClubs() {
    const { data, error } = await supabase
      .from("clubs")
      .select(
        `
        *,
        coordinator:users(name, staff_id)
      `,
      )
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching clubs:", error);
      throw error;
    }

    return data;
  },

  // Get club by ID
  async getClubById(clubId: string) {
    const { data, error } = await supabase
      .from("clubs")
      .select(
        `
        *,
        coordinator:users(name, email, staff_id)
      `,
      )
      .eq("id", clubId)
      .single();

    if (error) {
      console.error("Error fetching club:", error);
      throw error;
    }

    return data;
  },

  // Create new club
  async createClub(data: {
    name: string;
    description?: string;
    department?: string;
    coordinatorStaffId?: string;
  }) {
    const { data: result, error } = await supabase
      .from("clubs")
      .insert({
        name: data.name,
        description: data.description,
        department: data.department,
        coordinator_staff_id: data.coordinatorStaffId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating club:", error);
      throw error;
    }

    return result;
  },
};
```

### Notifications Service

Create `/services/notificationService.ts`:

```typescript
import { supabase } from "../utils/supabase/client";

export const notificationService = {
  // Get user's notifications
  async getUserNotifications(
    userId: string,
    unreadOnly = false,
  ) {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }

    return data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error(
        "Error marking notification as read:",
        error,
      );
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }

    return count || 0;
  },
};
```

---

## 🔄 Real-time Subscriptions

### Subscribe to OD Application Changes

```typescript
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase/client";

export function useODApplications(studentId: string) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchApplications();

    // Subscribe to changes
    const channel = supabase
      .channel("od_applications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "od_applications",
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          console.log("Change received!", payload);

          if (payload.eventType === "INSERT") {
            setApplications((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setApplications((prev) =>
              prev.map((app) =>
                app.id === payload.new.id ? payload.new : app,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setApplications((prev) =>
              prev.filter((app) => app.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("od_applications")
        .select("*")
        .eq("student_id", studentId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  return { applications, loading };
}
```

### Subscribe to Notifications

```typescript
export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    setNotifications(data || []);
  };

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    setUnreadCount(count || 0);
  };

  return { notifications, unreadCount };
}
```

---

## 📤 File Upload

### Upload Supporting Documents

```typescript
export const fileUploadService = {
  async uploadDocument(file: File, applicationId: string) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${applicationId}-${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("od-documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("od-documents")
      .getPublicUrl(filePath);

    // Update application with document URL
    const { error: updateError } = await supabase
      .from("od_applications")
      .update({ supporting_document_url: publicUrl })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Error updating application:", updateError);
      throw updateError;
    }

    return publicUrl;
  },

  async deleteDocument(documentUrl: string) {
    // Extract file path from URL
    const urlParts = documentUrl.split("/");
    const filePath = `documents/${urlParts[urlParts.length - 1]}`;

    const { error } = await supabase.storage
      .from("od-documents")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },
};
```

---

## ⚠️ Error Handling

### Create Error Handler

```typescript
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export function handleSupabaseError(error: any): never {
  console.error("Supabase error:", error);

  if (error.code === "23505") {
    throw new DatabaseError(
      "This record already exists",
      error.code,
    );
  } else if (error.code === "23503") {
    throw new DatabaseError(
      "Referenced record not found",
      error.code,
    );
  } else if (error.message.includes("JWT")) {
    throw new DatabaseError(
      "Session expired. Please login again",
      "AUTH_ERROR",
    );
  } else {
    throw new DatabaseError(
      error.message || "Database operation failed",
      error.code,
    );
  }
}
```

### Usage in Components

```typescript
try {
  await odApplicationService.createApplication(data);
  toast.success("Application submitted successfully!");
} catch (error) {
  if (error instanceof DatabaseError) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected error occurred");
  }
}
```

---

## ✅ Best Practices

### 1. Use TypeScript Types

Always type your database queries for type safety:

```typescript
const { data } = await supabase
  .from("od_applications")
  .select("*")
  .returns<ODApplication[]>();
```

### 2. Handle Loading States

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const data =
        await odApplicationService.getStudentApplications(
          userId,
        );
      setApplications(data);
    } catch (err) {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, [userId]);
```

### 3. Optimize Queries

```typescript
// Bad: Multiple queries
const applications = await supabase
  .from("od_applications")
  .select("*");
const users = await supabase.from("users").select("*");

// Good: Single query with join
const { data } = await supabase.from("od_applications").select(`
    *,
    student:users(name, email)
  `);
```

### 4. Use Transactions for Multiple Operations

```typescript
// Use Postgres functions for complex operations
await supabase.rpc("approve_od_application", {
  /* args */
});
```

### 5. Implement Proper Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
    </div>
  );
}

// Wrap your app
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

### 6. Cache Data When Appropriate

```typescript
import { useQuery } from "@tanstack/react-query";

function useClubs() {
  return useQuery({
    queryKey: ["clubs"],
    queryFn: () => clubService.getAllClubs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 7. Secure Your RLS Policies

Test your RLS policies:

```typescript
// As student, should only see own applications
const { data } = await supabase
  .from("od_applications")
  .select("*"); // Should only return student's applications
```

---

## 🧪 Testing

### Mock Supabase for Tests

```typescript
// __mocks__/supabase.ts
export const supabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() =>
          Promise.resolve({ data: mockData, error: null }),
        ),
      })),
    })),
  })),
};
```

---

## 📊 Performance Monitoring

```typescript
// Add performance logging
const startTime = performance.now();
const data =
  await odApplicationService.getStudentApplications(userId);
const endTime = performance.now();
console.log(`Query took ${endTime - startTime}ms`);
```

---

## 🚀 Deployment Checklist

- [ ] Environment variables set in production
- [ ] RLS policies tested
- [ ] Database indexes verified
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Real-time subscriptions cleaned up
- [ ] File upload configured
- [ ] Backup strategy in place
- [ ] Performance optimized
- [ ] Security reviewed

---

**Last Updated:** October 13, 2025