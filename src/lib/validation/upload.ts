import { z } from "zod";
import { VisibilityEnum, RestrictionEnum } from "@/lib/types/material.types";

export const uploadFileSchema = z.object({
  materialTitle: z.string().min(1, "Material title is required"),
  classification: z.string().optional(),
  description: z.string().optional(),
  visibility: z.nativeEnum(VisibilityEnum, {
    errorMap: () => ({ message: "Please select visibility" }),
  }),
  accessRestrictions: z.nativeEnum(RestrictionEnum, {
    errorMap: () => ({ message: "Please select access restrictions" }),
  }),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
});

export const uploadLinkSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  materialTitle: z.string().min(1, "Material title is required"),
  classification: z.string().optional(),
  description: z.string().optional(),
  visibility: z.nativeEnum(VisibilityEnum, {
    errorMap: () => ({ message: "Please select visibility" }),
  }),
  accessRestrictions: z.nativeEnum(RestrictionEnum, {
    errorMap: () => ({ message: "Please select access restrictions" }),
  }),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type UploadLinkInput = z.infer<typeof uploadLinkSchema>;
