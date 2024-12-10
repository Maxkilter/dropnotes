import React, { createContext, useState } from "react";
import { Color } from "@material-ui/lab";
import { NoteType } from "./types";

type NotificationState = {
  isOpen: boolean;
  message: string;
  severity: Color;
};

type StoreContextType = {
  isNoMatching: boolean;
  notes: NoteType[] | null;
  notification: NotificationState;
  setNotes: (value: NoteType[] | null) => void;
  setIsNoMatching: (value: boolean) => void;
  setNotification: (value: NotificationState) => void;
};

const defaultNotificationState: NotificationState = {
  isOpen: false,
  message: "",
  severity: "info",
};

export const StoreContext = createContext<StoreContextType>({
  isNoMatching: false,
  notes: null,
  notification: defaultNotificationState,
  setNotes: () => {},
  setIsNoMatching: () => {},
  setNotification: () => {},
});

export const StoreProvider = ({ children }: any) => {
  const [notes, setNotes] = useState<NoteType[] | null>(null);
  const [isNoMatching, setIsNoMatching] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(
    defaultNotificationState
  );

  const store = {
    isNoMatching,
    notes,
    notification,
    setNotification,
    setNotes,
    setIsNoMatching,
  };
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
