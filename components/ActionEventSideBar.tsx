import { appActions, appTriggers } from "@/lib/constants/appTriggers";
import React, { useEffect, useRef } from "react";
import useStore from "../store";
import { useParams } from "next/navigation";
import { updateZap } from "../utils/HelperFunctions";
import { Action } from "@/lib/type";

interface ActionEventSideBarProps {
  name: string;
  curNodeIdx: number | null;
  setShowActionSideBar: (show: boolean) => void;
}

interface AppTrigger {
  heading: string;
  subheading: string;
}

const ActionEventSideBar: React.FC<ActionEventSideBarProps> = ({
  name,
  curNodeIdx,
  setShowActionSideBar,
}) => {
  const params = useParams();
  const eventSideBarRef = useRef<HTMLDivElement | null>(null);
  const setZapTriggerMeta = useStore((state) => state.setZapTriggerMeta);
  const setActions = useStore((state) => state.setActions);
  const actions = useStore((state) => state.actions);

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
          {(curNodeIdx === 0
            ? appTriggers[name]
            : (appActions[name] as AppTrigger[])
          ).map((val, i) => {
            return (
              <div
                onClick={() => {
                  if (curNodeIdx === 0) {
                    setZapTriggerMeta({
                      zapId: params.id,
                      triggerApp: name,
                      triggerEvent: val.heading,
                    });
                  } else {
                    const newAction = actions.find(
                      (action) => Number(action.index) === Number(curNodeIdx)
                    );
                    if (newAction) {
                      newAction.actionEvent = val.heading;
                    }

                    const newActions = actions.map((action) => {
                      if (Number(action.index) === Number(curNodeIdx)) {
                        return { ...newAction, actionEvent: val.heading, metadata: JSON.parse("{}") };
                      }
                      return action;
                    }) as Action[];

                    if (newActions.length) {
                      setActions(newActions);
                    }
                    const updatedActions = newActions.map((action) => {
                      return {
                        actionId: action.actionId,
                        index: action.index,
                        sortingOrder: action.sortingOrder,
                        actionEvent: action.actionEvent,
                        metadata: action.metadata,
                      };
                    });

                    updateZap(params.id, updatedActions);
                  }
                  setShowActionSideBar(false);
                }}
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
