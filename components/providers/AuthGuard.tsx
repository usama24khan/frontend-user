"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { initializeAuth } from "../../store/slices/authSlice";

// Routes that don't require auth. Everything else redirects to /login if signed out.
const PUBLIC_PATHS = ["/login"];

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hydrated } = useSelector((s: RootState) => s.auth);

  // Hydrate from localStorage on first mount.
  useEffect(() => {
    if (!hydrated) dispatch(initializeAuth());
  }, [dispatch, hydrated]);

  // Once hydrated, redirect signed-out residents to /login (and signed-in away from /login).
  useEffect(() => {
    if (!hydrated) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
    } else if (isAuthenticated && pathname === "/login") {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated) {
    // Brief blank state while we read localStorage — avoids a flash of protected content.
    return null;
  }

  return <>{children}</>;
}
