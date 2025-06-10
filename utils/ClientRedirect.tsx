"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/dashboard");
      }
    }
  }, [router]);

  return null; // No UI
}
