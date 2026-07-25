import api from "./api";
import type { Enterprise, Job, Application } from "@/types";

/**
 * Enterprise service — profile, job posting CRUD, and applicant management.
 */
const enterpriseService = {
  // ── Profile ──────────────────────────────────────────────────────
  getProfile: async (): Promise<Enterprise> => {
    const { data } = await api.get("/enterprise/profile");
    return data;
  },

  updateProfile: async (payload: Partial<Enterprise>): Promise<Enterprise> => {
    const { data } = await api.put("/enterprise/profile", payload);
    return data;
  },

  uploadBusinessLicense: async (file: File): Promise<{ businessLicense: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/enterprise/upload-license", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // ── Job management ───────────────────────────────────────────────
  getJobs: async (): Promise<Job[]> => {
    const { data } = await api.get("/enterprise/jobs");
    return data;
  },

  createJob: async (payload: Partial<Job>): Promise<Job> => {
    const { data } = await api.post("/enterprise/jobs", payload);
    return data;
  },

  updateJob: async (id: string, payload: Partial<Job>): Promise<Job> => {
    const { data } = await api.put(`/enterprise/jobs/${id}`, payload);
    return data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/enterprise/jobs/${id}`);
  },

  updateJobStatus: async (
    id: string,
    status: string,
  ): Promise<Job> => {
    const { data } = await api.patch(`/enterprise/jobs/${id}/status`, { status });
    return data;
  },

  // ── Applicants ───────────────────────────────────────────────────
  getApplications: async (jobId: string): Promise<Application[]> => {
    const { data } = await api.get(`/enterprise/jobs/${jobId}/applications`);
    return data;
  },

  getAllApplications: async (): Promise<Application[]> => {
    const { data } = await api.get("/enterprise/applications");
    return data;
  },

  updateApplicationStatus: async (
    id: string,
    status: string,
    notes?: string,
  ): Promise<Application> => {
    const { data } = await api.put(`/enterprise/applications/${id}/status`, {
      status,
      notes,
    });
    return data;
  },

  scheduleInterview: async (
    id: string,
    payload: { date: string; location: string; notes: string },
  ): Promise<Application> => {
    const { data } = await api.post(
      `/enterprise/applications/${id}/interview`,
      payload,
    );
    return data;
  },

  viewResume: async (applicationId: string): Promise<unknown> => {
    const { data } = await api.get(
      `/enterprise/applications/${applicationId}/resume`,
    );
    return data;
  },
};

export default enterpriseService;
