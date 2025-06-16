import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function createZap({
  selectedTrigger,
  selectedActions,
  router,
}: {
  selectedTrigger: { id: string };
  selectedActions: Array<{ availableActionId: string; metadata: any }>;
  router: { push: (path: string) => void };
}): Promise<() => Promise<void>> {
  return async () => {
    if (!selectedTrigger?.id) {
      return;
    }

    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap`,
      {
        availableTriggerId: selectedTrigger.id,
        triggerMetadata: {},
        actions: selectedActions.map((a) => ({
          availableActionId: a.availableActionId,
          actionMetadata: a.metadata,
        })),
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );

    router.push("/dashboard");
  };
}
