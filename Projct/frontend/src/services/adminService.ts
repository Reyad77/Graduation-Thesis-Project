import api from "./api";
import type { User, Job, Banner, Announcement } from "@/types";

/**
 * Admin service — user management, job auditing, banner & announcement CRUD.
 */
const adminService = {
  // ── User management ──────────────────────────────────────────────
  getUsers: async (params?: Record<string, unknown>): Promise<User[]> => {
    const { data } = await api.get("/admin/users", { params });
    return data;
  },

  getUser: async (uid: string): Promise<User> => {
    const { data } = await api.get(`/admin/users/${uid}`);
    return data;
  },

  verifyStudent: async (uid: string): Promise<void> => {
    await api.post(`/admin/users/${uid}/verify-student`);
  },

  approveEnterprise: async (uid: string): Promise<void> => {
    await api.post(`/admin/users/${uid}/approve-enterprise`);
  },

  banUser: async (uid: string, reason?: string): Promise<void> => {
    await api.post(`/admin/users/${uid}/ban`, { reason });
  },

  unbanUser: async (uid: string): Promise<void> => {
    await api.post(`/admin/users/${uid}/unban`);
  },

  // ── Job auditing ─────────────────────────────────────────────────
  getPendingJobs: async (): Promise<Job[]> => {
    const { data } = await api.get("/admin/jobs/pending");
    return data;
  },

  getAllJobs: async (): Promise<Job[]> => {
    const { data } = await api.get("/admin/jobs");
    return data;
  },

  approveJob: async (jobId: string): Promise<void> => {
    await api.post(`/admin/jobs/${jobId}/approve`);
  },

  rejectJob: async (jobId: string, notes: string): Promise<void> => {
    await api.post(`/admin/jobs/${jobId}/reject`, { notes });
  },

  removeJob: async (jobId: string): Promise<void> => {
    await api.post(`/admin/jobs/${jobId}/remove`);
  },

  // ── Banners ──────────────────────────────────────────────────────
  getBanners: async (): Promise<Banner[]> => {
    const { data } = await api.get("/admin/banners");
    return data;
  },

  createBanner: async (formData: FormData): Promise<Banner> => {
    const { data } = await api.post("/admin/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  updateBanner: async (id: string, payload: Partial<Banner>): Promise<Banner> => {
    const { data } = await api.put(`/admin/banners/${id}`, payload);
    return data;
  },

  deleteBanner: async (id: string): Promise<void> => {
    await api.delete(`/admin/banners/${id}`);
  },

  // ── Announcements ────────────────────────────────────────────────
  getAnnouncements: async (): Promise<Announcement[]> => {
    const { data } = await api.get("/admin/announcements");
    return data;
  },

  createAnnouncement: async (
    payload: Partial<Announcement>,
  ): Promise<Announcement> => {
    const { data } = await api.post("/admin/announcements", payload);
    return data;
  },

  updateAnnouncement: async (
    id: string,
    payload: Partial<Announcement>,
  ): Promise<Announcement> => {
    const { data } = await api.put(`/admin/announcements/${id}`, payload);
    return data;
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    await api.delete(`/admin/announcements/${id}`);
  },
};

export default adminService;
