"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import axios from "axios";
import { useEffect } from "react";

export async function handleLogin(
  email: string,
  password: string,
  router: AppRouterInstance
) {
  // This check is good, ensures it runs only in browser
  if (typeof window === "undefined") return;

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/signin`,
      {
        username: email,
        password,
      }
    );

    // These lines are fine because handleLogin is called client-side
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.email);
    localStorage.setItem("name", res.data.name);
    router.push("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);
    // Handle login error appropriately
  }
}

export async function handleLogout() {
  // This check is also good
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("name");
}

export const useLogin = (
  email: string,
  password: string,
  router: AppRouterInstance
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleLogin(email, password, router);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, email, password]);
};
