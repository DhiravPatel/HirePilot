"use client";

import { create } from "zustand";
import type { User, Resume } from "@/types";
import { getMe, updateMe, listResumes, deleteResume, setDefaultResume, uploadResume } from "@/lib/api";

// ─── User Store ─────────────────────────────────────────────────────────────

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (token: string) => Promise<void>;
  updateUser: (data: Partial<User>, token: string) => Promise<void>;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const user = await getMe(token);
      set({ user, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch user";
      set({ error: message, loading: false });
    }
  },

  updateUser: async (data: Partial<User>, token: string) => {
    set({ loading: true, error: null });
    try {
      const user = await updateMe(data, token);
      set({ user, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user";
      set({ error: message, loading: false });
    }
  },

  setUser: (user: User) => set({ user }),
  clearUser: () => set({ user: null }),
}));

// ─── Resume Store ───────────────────────────────────────────────────────────

interface ResumeState {
  resumes: Resume[];
  loading: boolean;
  error: string | null;
  fetchResumes: (token: string) => Promise<void>;
  uploadResume: (formData: FormData, token: string) => Promise<Resume>;
  removeResume: (id: string, token: string) => Promise<void>;
  setDefault: (id: string, token: string) => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  loading: false,
  error: null,

  fetchResumes: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const resumes = await listResumes(token);
      set({ resumes: resumes || [], loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch resumes";
      set({ error: message, loading: false });
    }
  },

  uploadResume: async (formData: FormData, token: string) => {
    set({ loading: true, error: null });
    try {
      const resume = await uploadResume(formData, token);
      set({ resumes: [...get().resumes, resume], loading: false });
      return resume;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload resume";
      set({ error: message, loading: false });
      throw error;
    }
  },

  removeResume: async (id: string, token: string) => {
    try {
      await deleteResume(id, token);
      set({ resumes: get().resumes.filter((r) => r.id !== id) });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete resume";
      set({ error: message });
    }
  },

  setDefault: async (id: string, token: string) => {
    try {
      await setDefaultResume(id, token);
      set({
        resumes: get().resumes.map((r) => ({
          ...r,
          is_default: r.id === id,
        })),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to set default resume";
      set({ error: message });
    }
  },
}));
