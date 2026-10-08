import api from "./api";
import type { Student, Resume, Job, Application } from "@/types";

/**
 * Student service — profile, resume, and job browsing/application endpoints.
 */
const studentService = {
  // ── Profile ──────────────────────────────────────────────────────
  getProfile: async (): Promise<Student> => {
    const { data } = await api.get("/students/profile");
    return data;
  },

  updateProfile: async (payload: Partial<Student>): Promise<Student> => {
    const { data } = await api.put("/students/profile", payload);
    return data;
  },

  uploadStudentId: async (idCardPhotoUrl: string): Promise<{ idCardPhoto: string }> => {
    const { data } = await api.post("/students/verify-id", null, {
      params: { id_card_photo: idCardPhotoUrl },
    });
    return data;
  },

  // ── Resumes ──────────────────────────────────────────────────────
  getResumes: async (): Promise<Resume[]> => {
    const { data } = await api.get("/resumes");
    return data;
  },

  getResume: async (id: string): Promise<Resume> => {
    const { data } = await api.get(`/resumes/${id}`);
    return data;
  },

  createResume: async (payload: Partial<Resume>): Promise<Resume> => {
    const { data } = await api.post("/resumes", payload);
    return data;
  },

  updateResume: async (id: string, payload: Partial<Resume>): Promise<Resume> => {
    const { data } = await api.put(`/resumes/${id}`, payload);
    return data;
  },

  deleteResume: async (id: string): Promise<void> => {
    await api.delete(`/resumes/${id}`);
  },

  addCertificate: async (resumeId: string, certUrl: string): Promise<void> => {
    await api.post(`/resumes/${resumeId}/certificate`, null, {
      params: { cert_url: certUrl },
    });
  },

  removeCertificate: async (resumeId: string, certUrl: string): Promise<void> => {
    await api.delete(`/resumes/${resumeId}/certificate/${encodeURIComponent(certUrl)}`);
  },

  // ── Jobs & Applications ──────────────────────────────────────────
  getJobs: async (params?: Record<string, unknown>): Promise<Job[]> => {
    const { data } = await api.get("/jobs", { params });
    return data;
  },

  getJob: async (id: string): Promise<Job> => {
    const { data } = await api.get(`/jobs/${id}`);
    return data;
  },

  applyToJob: async (jobId: string, resumeId: string): Promise<Application> => {
    const { data } = await api.post(`/jobs/${jobId}/apply`, { resumeId });
    return data;
  },

  getApplications: async (): Promise<Application[]> => {
    const { data } = await api.get("/students/applications");
    return data;
  },

  saveJob: async (jobId: string): Promise<void> => {
    await api.post(`/jobs/${jobId}/save`);
  },

  unsaveJob: async (jobId: string): Promise<void> => {
    await api.delete(`/jobs/${jobId}/save`);
  },

  getSavedJobs: async (): Promise<Job[]> => {
    const { data } = await api.get("/jobs/saved");
    return data;
  },
};

export default studentService;
