"use client";

import { useRouter } from "next/navigation";

import { AppBar } from "../../../components/AppBar";
import { CheckFeature } from "../../../components/CheckFeature";
import { Input } from "../../../components/Input";
import { PrimaryButton } from "../../../components/buttons/PrimaryButton";

import { handleLogin, useLogin } from "../../../utils/HelperFunctions";
import useStore from "../../../store";
import ClientRedirect from "../../../utils/ClientRedirect";

export default function Login() {
  const setEmail = useStore((state) => state.setEmail);
  const setPassword = useStore((state) => state.setPassword);
  const email = useStore((state) => state.email);
  const password = useStore((state) => state.password);

  const router = useRouter();

  useLogin(email, password, router);

  return (
    <div>
      <AppBar />
      <ClientRedirect></ClientRedirect>
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
