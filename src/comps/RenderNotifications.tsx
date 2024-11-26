import { eventsAtom } from "@/util/atoms";
import { AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import AppNotification from "./Notifications";

const RenderNotifications = () => {
  const [events, setEvents] = useAtom(eventsAtom);

  return (
    <>
      <AnimatePresence>
        {events.map((event, index) => (
          <AppNotification
            key={event.id}
            index={index}
            {...event}
            handleExitClick={(eventId) => {
              setEvents((prev) => prev.filter((e) => e.id !== eventId));
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
};

export default RenderNotifications;
