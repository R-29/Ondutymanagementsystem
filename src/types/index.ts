export type UserRole = 'student' | 'staff' | 'hod';

export interface User {
  id: string;
  name: string;
  regNo?: string;
  staffId?: string;
  role: UserRole;
  department?: string;
  year?: number;
  section?: string;
}

export interface Club {
  id: string;
  name: string;
  department: string;
  coordinatorStaffId: string;
}

export interface ODApplication {
  id: string;
  studentRegNo: string;
  studentName: string;
  year: number;
  section: string;
  odType: 'internal' | 'external';
  clubName?: string;
  collegeName?: string;
  role: string;
  eventName: string;
  startDate: Date;
  endDate: Date;
  duration?: string; // Optional: can be calculated from start and end dates
  facultyApproved: boolean;
  hodApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}