// ── User types ─────────────────────────────────────────────────────────
export type UserRole = "student" | "enterprise" | "admin";

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  phone: string;
  preferredLanguage: string;
  isActive: boolean;
  createdAt?: string;
}

// ── Student types ──────────────────────────────────────────────────────
export interface Student {
  uid: string;
  studentId: string;
  major: string;
  grade: string;
  year: number;
  idCardPhoto?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  skills: string[];
  availability: string;
  createdAt?: string;
}

// ── Enterprise types ───────────────────────────────────────────────────
export interface Enterprise {
  uid: string;
  companyName: string;
  businessLicense?: string;
  storePhotos: string[];
  description: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  website: string;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  isBanned: boolean;
  banReason: string;
  createdAt?: string;
}

// ── Resume types ───────────────────────────────────────────────────────
export interface Resume {
  id: string;
  studentUid: string;
  major: string;
  grade: string;
  skills: string[];
  availableHours: string;
  experience: string;
  certificates: string[];
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ── Job types ──────────────────────────────────────────────────────────
export type JobStatus =
  | "pending"
  | "active"
  | "paused"
  | "expired"
  | "rejected";

export interface Job {
  id: string;
  enterpriseUid: string;
  title: string;
  responsibilities: string;
  salary: string;
  workingHours: string;
  quota: number;
  location: string;
  skillRequirements: string[];
  duration: string;
  status: JobStatus;
  views: number;
  applicationsCount: number;
  postedAt?: string;
  expiresAt?: string;
  updatedAt?: string;
  auditNotes: string;
  auditedBy?: string;
  auditAt?: string;
}

// ── Application types ──────────────────────────────────────────────────
export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "interview"
  | "hired"
  | "rejected"
  | "completed";

export interface InterviewSchedule {
  date?: string;
  location: string;
  notes: string;
  sentAt?: string;
}

export interface Application {
  id: string;
  jobId: string;
  studentUid: string;
  resumeId: string;
  status: ApplicationStatus;
  interviewSchedule?: InterviewSchedule;
  appliedAt?: string;
  updatedAt?: string;
  notes: string;
  hiredAt?: string;
  completedAt?: string;
}

// ── Announcement types ─────────────────────────────────────────────────
export type AnnouncementType = "announcement" | "article";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  bannerImage?: string;
  isActive: boolean;
  priority: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

// ── Banner types ───────────────────────────────────────────────────────
export interface Banner {
  id: string;
  imageUrl: string;
  link: string;
  title: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ── Notification types ─────────────────────────────────────────────────
export type NotificationType =
  | "application_status"
  | "interview_scheduled"
  | "job_approved"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, unknown>;
  createdAt?: string;
}

// ── API response types ─────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
