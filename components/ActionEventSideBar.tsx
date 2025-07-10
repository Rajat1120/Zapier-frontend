import { appTriggers } from "@/lib/constants/appTriggers";
import React, { useEffect, useRef } from "react";

interface ActionEventSideBarProps {
  name: string;

  setShowActionSideBar: (show: boolean) => void;
}

interface AppTrigger {
  heading: string;
  subheading: string;
}

const ActionEventSideBar: React.FC<ActionEventSideBarProps> = ({
  name,

  setShowActionSideBar,
}) => {
  const eventSideBarRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        eventSideBarRef.current &&
        event.target instanceof Node &&
        !eventSideBarRef.current.contains(event.target)
      ) {
        setShowActionSideBar(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [setShowActionSideBar]);
  return (
    <div
      ref={eventSideBarRef}
      className="fixed border  top-76 bg-white rounded-sm shadow-2xl right-100"
    >
      <div className="max-w-90 min-w-90 h-auto">
        <div className="py-2 w-full px-2">
          <input
            type="text"
            placeholder="Search events"
            className="py-2 px-3 w-full border-2 border-[#695be8] focus:border-[#695be8] focus:outline-none rounded-sm"
          />
        </div>

        <div className="px-2 py-4 max-h-70 overflow-scroll">
          {(appTriggers[name] as AppTrigger[]).map((val, i) => {
            return (
              <div
                key={i}
                className="flex cursor-pointer hover:bg-[#ecebf8] flex-col gap-y-1 p-2"
              >
                <span className="text-sm font-medium">{val.heading}</span>
                <span className="text-xs font-medium">{val.subheading}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionEventSideBar;
