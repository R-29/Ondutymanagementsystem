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