import api from "./api";
import type { Recruiter, Job, Application } from "@/types";

/**
 * Recruiter service — profile, job posting CRUD, and applicant management.
 */
const recruiterService = {
  // ── Profile ──────────────────────────────────────────────────────
  getProfile: async (): Promise<Recruiter> => {
    const { data } = await api.get("/recruiter/profile");
    return data;
  },

  updateProfile: async (payload: Partial<Recruiter>): Promise<Recruiter> => {
    const { data } = await api.put("/recruiter/profile", payload);
    return data;
  },

  // ── Job management ───────────────────────────────────────────────
  getJobs: async (): Promise<Job[]> => {
    const { data } = await api.get("/recruiter/jobs");
    return data;
  },

  createJob: async (payload: Partial<Job>): Promise<Job> => {
    const { data } = await api.post("/recruiter/jobs", payload);
    return data;
  },

  updateJob: async (id: string, payload: Partial<Job>): Promise<Job> => {
    const { data } = await api.put(`/recruiter/jobs/${id}`, payload);
    return data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/recruiter/jobs/${id}`);
  },

  updateJobStatus: async (
    id: string,
    status: string,
  ): Promise<Job> => {
    const { data } = await api.patch(`/recruiter/jobs/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  // ── Applicants ───────────────────────────────────────────────────
  getApplications: async (jobId: string): Promise<Application[]> => {
    const { data } = await api.get(`/recruiter/jobs/${jobId}/applications`);
    return data;
  },

  getAllApplications: async (): Promise<Application[]> => {
    const { data } = await api.get("/recruiter/applications");
    return data;
  },

  updateApplicationStatus: async (
    id: string,
    status: string,
    notes?: string,
  ): Promise<Application> => {
    const { data } = await api.put(`/recruiter/applications/${id}/status`, {
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
      `/recruiter/applications/${id}/interview`,
      payload,
    );
    return data;
  },

  viewResume: async (applicationId: string): Promise<unknown> => {
    const { data } = await api.get(
      `/recruiter/applications/${applicationId}/resume`,
    );
    return data;
  },
};

export default recruiterService;
