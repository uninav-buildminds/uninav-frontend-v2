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

export const signinSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type SigninInput = z.infer<typeof signinSchema>;

export const resetRequestSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type ResetRequestInput = z.infer<typeof resetRequestSchema>;

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;

export const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").min(2, "Enter your full name"),
  username: z.string().min(1, "Username is required").min(3, "Username too short").max(24, "Username too long"),
  university: z.string().optional(),
  faculty: z.string().optional(),
  department: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
