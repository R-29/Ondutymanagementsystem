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