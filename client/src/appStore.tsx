//@ts-nocheck
import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Color } from "@material-ui/lab";

const storageName = "userData";

const defaultNotificationState = {
  isOpen: false,
  message: "",
  severity: "info" as Color,
};

export const StoreContext = createContext({
  isReady: false,
  isModalOpen: false,
  notes: [],
  editNote: { _id: "", title: "", body: "" },
  token: "",
  userId: null,
  notification: defaultNotificationState,
  logIn: (jwtToken: string, id: string) => {},
  logOut: () => {},
  setEditNote: ({ _id, title, body }) => {},
  setIsModalOpen: (value: boolean) => {},
  setNotes: (value: []) => {},
  setNotification: (value: {
    isOpen: boolean;
    message: string;
    severity: Color;
  }) => {},
});

export const StoreProvider = ({ children }: any) => {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [notes, setNotes] = useState([]);
  const [editNote, setEditNote] = useState({ _id: "", title: "", body: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(defaultNotificationState);

  const logIn = useCallback((jwtToken, id) => {
    setToken(jwtToken);
    setUserId(id);
    localStorage.setItem(
      storageName,
      JSON.stringify({
        userId: id,
        token: jwtToken,
      })
    );
  }, []);

  const logOut = useCallback(() => {
    setUserId(null);
    setToken(null);
    localStorage.removeItem(storageName);
  }, []);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(storageName) as string);
    if (data?.token) {
      logIn(data.token, data.userId);
    }
    setIsReady(true);
  }, [logIn]);

  const store = {
    isReady,
    isModalOpen,
    token,
    userId,
    notes,
    editNote,
    notification,
    logIn,
    logOut,
    setNotification,
    setIsModalOpen,
    setEditNote,
    setNotes,
  };
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
