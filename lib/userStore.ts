"use client";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "signalroom:user";

export type SignalroomUser = {
  name: string;
  email: string;
  createdAt: number;
};

export function readUser(): SignalroomUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignalroomUser;
    if (!parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeUser(user: SignalroomUser): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function clearUser(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "SR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function useUser() {
  const [user, setUserState] = useState<SignalroomUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setUserState(readUser());
    setHydrated(true);
  }, []);
  const setUser = useCallback((u: SignalroomUser | null) => {
    if (u) writeUser(u);
    else clearUser();
    setUserState(u);
  }, []);
  return { user, setUser, hydrated };
}
