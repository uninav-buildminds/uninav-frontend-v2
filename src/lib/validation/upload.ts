import { z } from "zod";

export const uploadFileSchema = z.object({
  materialTitle: z.string().min(1, "Material title is required"),
  classification: z.string().min(1, "Please select a classification"),
  type: z.string().min(1, "Please select a file type"),
  description: z.string().optional(),
  visibility: z.string().min(1, "Please select visibility"),
  accessRestrictions: z.string().min(1, "Please select access restrictions"),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
});

export const uploadLinkSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  materialTitle: z.string().min(1, "Material title is required"),
  classification: z.string().min(1, "Please select a classification"),
  description: z.string().optional(),
  visibility: z.string().min(1, "Please select visibility"),
  accessRestrictions: z.string().min(1, "Please select access restrictions"),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type UploadLinkInput = z.infer<typeof uploadLinkSchema>;
