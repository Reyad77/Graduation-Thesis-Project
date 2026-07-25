import { z } from "zod";

/** Login form validation schema. */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

/** Registration form validation schema. */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
  displayName: z.string().min(1, "Name is required").max(100),
  role: z.enum(["student", "enterprise"]),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

/** Job posting form validation schema. */
export const jobSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  responsibilities: z.string().min(1, "Required"),
  salary: z.string().min(1, "Required"),
  workingHours: z.string().min(1, "Required"),
  quota: z.number().min(1),
  location: z.string().min(1, "Required"),
  duration: z.string().min(1, "Required"),
  skillRequirements: z.array(z.string()).optional(),
});

/** Resume form validation schema. */
export const resumeSchema = z.object({
  major: z.string().optional(),
  grade: z.string().optional(),
  skills: z.array(z.string()).optional(),
  availableHours: z.string().optional(),
  experience: z.string().optional(),
});

/** Profile update schema. */
export const profileSchema = z.object({
  major: z.string().optional(),
  grade: z.string().optional(),
  year: z.number().min(1).max(5).optional(),
  skills: z.array(z.string()).optional(),
  availability: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type JobForm = z.infer<typeof jobSchema>;
