"use client";

import axios from "axios";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { AppBar } from "../../../components/AppBar";
import { CheckFeature } from "../../../components/CheckFeature";
import { Input } from "../../../components/Input";
import { PrimaryButton } from "../../../components/buttons/PrimaryButton";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

async function handleLogin(
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
  router.push("/dashboard");
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

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

  return (
    <div>
      <AppBar />
      <div className="flex justify-center">
        <div className="flex pt-8 max-w-4xl">
          <div className="flex-1 pt-20 px-4">
            <div className="font-semibold text-3xl pb-4">
              Join millions worldwide who automate their work using Zapier.
            </div>
            <div className="pb-6 pt-4">
              <CheckFeature label={"Easy setup, no coding required"} />
            </div>
            <div className="pb-6">
              <CheckFeature label={"Free forever for core features"} />
            </div>
            <CheckFeature label={"14-day trial of premium features & apps"} />
          </div>
          <div className="flex-1 pt-6 pb-6 mt-12 px-4 border rounded">
            <Input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              label={"Email"}
              type="text"
              placeholder="Your Email"
            ></Input>
            <Input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              label={"Password"}
              type="password"
              placeholder="Password"
            ></Input>
            <div className="pt-4">
              <PrimaryButton
                onClick={() => handleLogin(email, password, router)}
                size="big"
              >
                Login
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
