import api from "./api";
import type { Evaluation } from "@/types";

/**
 * Evaluation service — mutual evaluation between students and recruiters.
 */
const evaluationService = {
  /** Submit an evaluation for a completed application. */
  create: async (payload: {
    applicationId: string;
    rating: number;
    comment: string;
  }): Promise<Evaluation> => {
    const { data } = await api.post("/evaluations", payload);
    return data;
  },

  /** Evaluations received by the current user. */
  getReceived: async (): Promise<Evaluation[]> => {
    const { data } = await api.get("/evaluations/received");
    return data;
  },

  /** All evaluations (admin). */
  getAll: async (): Promise<Evaluation[]> => {
    const { data } = await api.get("/admin/evaluations");
    return data;
  },

  /** Delete an evaluation (admin). */
  deleteEvaluation: async (id: string): Promise<void> => {
    await api.delete(`/admin/evaluations/${id}`);
  },
};

export default evaluationService;
