import type { Document, User, Workspace } from "@prisma/client";

// Re-export Prisma types for convenience
export type { Document, User, Workspace };

// Extended types
export type DocumentWithChildren = Document & {
  children: Document[];
};

export type DocumentWithAuthor = Document & {
  author: Pick<User, "id" | "name" | "imageUrl">;
};

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Editor types
export interface EditorContent {
  type: string;
  content?: EditorContent[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  attrs?: Record<string, unknown>;
}
