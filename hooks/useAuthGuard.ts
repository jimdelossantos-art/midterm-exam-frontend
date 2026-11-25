"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  redirectTo?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { requireAuth = true, redirectTo } = options;
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const authed = isAuthenticated();

    if (requireAuth && !authed) {
      router.replace(redirectTo || "/login");
    } else if (!requireAuth && authed) {
      router.replace(redirectTo || "/dashboard");
    } else {
      setIsChecking(false);
    }
  }, [requireAuth, redirectTo, router]);

  return { isChecking };
}