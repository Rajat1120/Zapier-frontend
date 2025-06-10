import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import axios from "axios";
import { useEffect } from "react";

export async function handleLogin(
  email: string,
  password: string,
  router: AppRouterInstance
) {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/signin`,
    {
      username: email,
      password,
    }
  );

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("email", res.data.email);
  localStorage.setItem("name", res.data.name);
  router.push("/dashboard");
}

export async function handleLogout() {
  localStorage.removeItem("token");
}

export const useLogin = (
  email: string,
  password: string,
  router: AppRouterInstance
) => {
  useEffect(() => {
    // Check if the user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect to dashboard if already logged in
      router.push("/dashboard");
    }

    window.addEventListener("keydown", (e) => {
      // Check for Ctrl+Enter or Cmd+Enter to submit the form
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleLogin(email, password, router);
      }
    });
    return () => {
      window.removeEventListener("keydown", (e) => {
        // Cleanup the event listener
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          handleLogin(email, password, router);
        }
      });
    };
  }, [router, email, password]);
};
