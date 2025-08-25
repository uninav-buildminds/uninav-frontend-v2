import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid university email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Password must contain uppercase, lowercase and a number"),
  agree: z.literal(true, { errorMap: () => ({ message: "You must agree to continue" }) }),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").min(2, "Enter your full name"),
  username: z.string().min(1, "Username is required").min(3, "Username too short").max(24, "Username too long"),
  university: z.string().optional(),
  faculty: z.string().optional(),
  department: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
