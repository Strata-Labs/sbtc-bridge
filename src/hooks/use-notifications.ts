import { NotificationStatusType } from "@/comps/Notifications";
import { eventsAtom } from "@/util/atoms";
import { useSetAtom } from "jotai";
import { useCallback } from "react";

export function useNotifications() {
  const setEvents = useSetAtom(eventsAtom);

  const notify = useCallback(
    ({
      message,
      type,
      expire = 3000,
    }: {
      message: string;
      type: NotificationStatusType;
      expire?: number;
    }) => {
      setEvents((prev) => {
        const id = String(prev.length + 1);
        const newEvents = [
          ...prev,
          {
            id,
            type,
            title: message,
          },
        ];
        setTimeout(
          () => {
            setEvents((prev) => prev.filter((e) => e.id !== id));
          },
          type === NotificationStatusType.ERROR ? 30000 : expire,
        );
        return newEvents;
      });
    },
    [setEvents],
  );

  return {
    notify,
  };
}
