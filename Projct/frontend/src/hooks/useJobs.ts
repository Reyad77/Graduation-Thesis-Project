import { useQuery } from "@tanstack/react-query";
import studentService from "@/services/studentService";

/** Fetch active job listings with React Query caching (5 min stale time). */
export function useJobs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => studentService.getJobs(params),
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch a single job by ID. */
export function useJob(id: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => studentService.getJob(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
}

/** Fetch recommended jobs for a student. */
export function useRecommendedJobs(enabled = true) {
  return useQuery({
    queryKey: ["jobs", "recommended"],
    queryFn: async () => {
      const { data } = await (await import("@/services/api")).default.get("/jobs/recommended");
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
