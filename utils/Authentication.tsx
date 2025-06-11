"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Authentication() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
      }
    }
  }, [router]);

  return null; // No UI
}
