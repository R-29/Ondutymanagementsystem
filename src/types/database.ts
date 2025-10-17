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