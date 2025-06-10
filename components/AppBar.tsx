"use client";
import { usePathname, useRouter } from "next/navigation";
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { ReactNode, useEffect, useRef, useState } from "react";

export const AppBar = () => {
  const pathName = usePathname();
  const isDashboard = pathName === "/dashboard";
  const [showPopup, setShowPopup] = useState(false);
  const name = localStorage.getItem("name") || "";
  const userEmail = localStorage.getItem("email") || "";
  const router = useRouter();
  return (
    <div className="flex border-b justify-between p-4">
      <div className="flex flex-col justify-center text-2xl font-extrabold">
        Zapier Clone
      </div>
      <div className="flex space-x-2">
        <div className=" border rounded-md cursor-none hover:bg-gray-100">
          <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
        </div>
        {isDashboard ? (
          <div className="px-2 py-2 rounded-md text-white text-md font-bold bg-[#695be8]">
            Upgrade
          </div>
        ) : (
          <div className="pr-4">
            <LinkButton
              onClick={() => {
                router.push("/login");
              }}
            >
              Login
            </LinkButton>
          </div>
        )}
        {isDashboard ? (
          <div className="relative">
            <button
              onClick={() => setShowPopup(true)}
              className="rounded-[50%] h-10 w-10  cursor-pointer border"
            >
              user
            </button>
            <Popup isOpen={showPopup} onClose={() => setShowPopup(false)}>
              <div className="flex flex-col ">
                <div className="p-0   text-center">{userEmail}</div>
                <div className="p-2   text-[#695be8]">{name}</div>
                <div className="m-1 h-[1px] bg-[#D7D3C9]"></div>
                <div className="hover:bg-[#fbf0e8] p-2">Settings</div>
                <button
                  className="cursor-pointer py-2 p-2 text-start hover:bg-[#fbf0e8]"
                  onClick={() => {
                    localStorage.clear();
                    if (!localStorage.getItem("token")) {
                      router.push("/login");
                    }
                  }}
                >
                  Log out
                </button>
              </div>
            </Popup>
          </div>
        ) : (
          <PrimaryButton
            onClick={() => {
              router.push("/signup");
            }}
          >
            Signup
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Popup({ isOpen, onClose, children }: PopupProps) {
  const modelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelRef.current &&
        event.target instanceof Node &&
        !modelRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-9 right-0 mt-2 z-50">
      <div
        ref={modelRef}
        className="border-[1px] border-[#cacaca] bg-[#fdf7f2] p-2 rounded-lg shadow-md w-64"
      >
        {children}
      </div>
    </div>
  );
}
