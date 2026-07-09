import { create } from "zustand";

interface EditorStore {
  documentId: string | null;
  isEditing: boolean;
  setDocumentId: (id: string | null) => void;
  setIsEditing: (value: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  documentId: null,
  isEditing: false,
  setDocumentId: (id) => set({ documentId: id }),
  setIsEditing: (value) => set({ isEditing: value }),
}));
