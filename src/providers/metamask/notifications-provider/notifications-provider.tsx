import { Alert, Snackbar } from "@mui/material";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type NotificationsContextValue = {
  showMessage: (message: Message) => void;
};

type Message = {
  type: "success" | "info" | "warning" | "error";
  text: string;
};

const NotificationsContext = createContext<NotificationsContextValue>(
  {} as NotificationsContextValue
);

export default function NotificationsProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = useCallback(
    (message: Message) => {
      setMessage(message);
    },
    [setMessage]
  );

  return (
    <NotificationsContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        <Alert severity={message?.type}>{message?.text}</Alert>
      </Snackbar>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }

  return context;
}
