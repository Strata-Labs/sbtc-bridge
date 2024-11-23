import {
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { motion } from "framer-motion";

export enum NotificationStatusType {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  WARNING = "WARNING",
}

export type NotificationEventType = {
  id: string;
  title: string;
  type: NotificationStatusType;
};
export type NotificationType = NotificationEventType & {
  handleExitClick: (eventId: string) => void;
  index: number;
};

const COLOR_DATA = {
  [NotificationStatusType.SUCCESS]: {
    text: "#048848",
    background: "#EAF6ED",
  },
  [NotificationStatusType.ERROR]: {
    text: "#FD9D41",
    background: "rgba(253, 157, 65, 0.1)",
  },
  [NotificationStatusType.WARNING]: {
    text: "#FD9D41",
    background: "rgba(253, 157, 65, 0.1)",
  },
};

const AppNotification = ({
  id,
  title,
  index,
  type,
  handleExitClick,
}: NotificationType) => {
  const colors = COLOR_DATA[type];

  const renderIcon = () => {
    switch (type) {
      case NotificationStatusType.SUCCESS:
        return (
          <CheckCircleIcon
            style={{
              color: colors.text,
              width: 24,
              height: 24,
            }}
          />
        );

      default:
        return (
          <InformationCircleIcon
            style={{
              color: colors.text,
              width: 24,
              height: 24,
            }}
          />
        );
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4 transition-all absolute left-16  w-72 h-12 flex flex-row items-center justify-between rounded shadow-md "
      style={{
        backgroundColor: colors.background,
        top: index * 60 + 40,
      }}
      onClick={() => handleExitClick(id)}
    >
      <div className="w-full   h-10 rounded-lg flex flex-row items-center justify-start gap-2">
        {renderIcon()}
        <p
          style={{
            color: colors.text,
          }}
          className=" font-Matter font-semibold text-md"
        >
          {title}
        </p>
      </div>
    </motion.div>
  );
};

export default AppNotification;
