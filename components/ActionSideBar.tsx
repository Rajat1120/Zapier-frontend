import Image from "next/image";
import { useEffect, useRef } from "react";

interface ActionSideBarProps {
  setShowSideBar: (show: boolean) => void;
  parentRef: React.RefObject<HTMLDivElement | null>; // new prop
}

export default function ActionSideBar({
  setShowSideBar,
  parentRef,
}: ActionSideBarProps) {
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = parentRef.current;

    if (!parent) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionRef.current &&
        event.target instanceof Node &&
        !actionRef.current.contains(event.target)
      ) {
        setShowSideBar(false);
      }
    };

    parent.addEventListener("click", handleClickOutside);
    return () => {
      parent.removeEventListener("click", handleClickOutside);
    };
  }, [parentRef, setShowSideBar]);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      ref={actionRef}
      className="py-1 hover:text-[#ff0000]   text-xs shadow-2xl fixed left-[245px] hover:bg-[#f9dddd] border rounded-xs border-[#cccccc]    justify-center flex items-center  top-[5px] px-4 bg-white  z-50 "
    >
      <span className="text-nowrap  font-medium flex justify-center items-center gap-x-1  text-[8px]">
        <Image
          height={10}
          width={10}
          alt="Delete icon"
          src={
            "https://img.icons8.com/?size=100&id=68138&format=png&color=000000"
          }
        ></Image>
        Delete
      </span>
    </div>
  );
}
