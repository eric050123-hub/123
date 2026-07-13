export type ClassStatus =
  | "draft"
  | "recruiting"
  | "threshold_reached"
  | "confirmed"
  | "full"
  | "closed"
  | "completed"
  | "cancelled";

export type ProposalStatus = "pending" | "approved" | "merged" | "rejected" | "cancelled";
export type RegistrationStatus = "active" | "cancelled" | "confirmed" | "locked";

export type PublicClass = {
  id: string;
  course_type_id: string;
  course_name: string;
  title: string;
  description: string | null;
  weekday: number;
  start_time: string;
  end_time: string;
  period: "morning" | "afternoon" | "evening";
  location: string | null;
  coach_name: string | null;
  price: number | null;
  minimum_students: number;
  maximum_students: number;
  registration_deadline: string | null;
  status: ClassStatus;
  active_count: number;
  seats_left: number;
  created_at: string;
};

export type PublicRegistrationName = {
  id: string;
  masked_name: string;
  party_size: number;
  status: RegistrationStatus;
  created_at: string;
};

export type CourseType = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export type AdminClass = PublicClass & {
  is_public: boolean;
  admin_notes: string | null;
  created_from_proposal_id: string | null;
};

export type RegistrationRow = {
  id: string;
  class_id: string;
  full_name: string;
  line_name: string;
  phone: string;
  email: string | null;
  age_group: string | null;
  experience_level: string;
  needs_paddle: boolean;
  party_size: number;
  notes: string | null;
  status: RegistrationStatus;
  created_at: string;
  classes?: {
    title: string;
    weekday: number;
    start_time: string;
    end_time: string;
    course_types?: { name: string } | null;
  } | null;
};

export type ProposalRow = {
  id: string;
  course_type_id: string;
  requested_weekday: number;
  requested_start_time: string;
  requested_end_time: string;
  requested_period: "morning" | "afternoon" | "evening";
  alternative_slots: unknown;
  applicant_name: string;
  line_name: string;
  phone: string;
  email: string | null;
  experience_level: string;
  notes: string | null;
  status: ProposalStatus;
  admin_notes: string | null;
  approved_class_id: string | null;
  created_at: string;
  course_types?: { name: string } | null;
};
