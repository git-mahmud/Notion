import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  parentId: z.string().optional(),
  workspaceId: z.string().min(1),
});

export const updateDocumentSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.any().optional(),
  icon: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isFullWidth: z.boolean().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
