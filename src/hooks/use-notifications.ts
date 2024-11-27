import { NotificationStatusType } from "@/comps/Notifications";
import { eventsAtom } from "@/util/atoms";
import { useAtom } from "jotai";

export function useNotifications() {
  const [events, setEvents] = useAtom(eventsAtom);

  const notify = ({
    message,
    type,
    expire = 3000,
  }: {
    message: string;
    type: NotificationStatusType;
    expire?: number;
  }) => {
    const _events = [...events];
    const id = String(_events.length + 1);
    _events.push({
      id,
      type,
      title: message,
    });
    setEvents(_events);
    setTimeout(() => {
      const _events = [...events];
      _events.splice(
        _events.findIndex((e) => e.id === id),
        1,
      );
      setEvents(_events);
    }, expire);
  };

  return {
    notify,
  };
}
