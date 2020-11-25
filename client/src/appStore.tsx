//@ts-nocheck
import React, {
  useState,
  useCallback,
  useEffect,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";
import { Color } from "@material-ui/lab";
import { useRequest } from "./hooks/useRequest";

const storageName = "userData";

const defaultNotificationState = {
  isOpen: false,
  message: "",
  severity: "info" as Color,
};

export const StoreContext = createContext({
  isReady: false,
  isLoading: false,
  isModalOpen: false,
  searchQuery: "",
  notes: [],
  editNote: { _id: "", title: "", body: "" },
  token: null,
  userId: null,
  notification: defaultNotificationState,
  logIn: (jwtToken: string, id: string) => {},
  logOut: () => {},
  request: (link, method, body, headers) => {},
  setSearchQuery: (e: string): Dispatch<SetStateAction<string>> => () => {},
  setEditNote: ({ _id, title, body }) => {},
  setIsModalOpen: (value: boolean) => {},
  setNotification: ({
    isOpen,
    message,
    severity,
  }: {
    isOpen: boolean;
    message: string;
    severity: any;
  }) => {},
  fetchNotes: () => {},
});

export const StoreProvider = ({ children }: any) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState([]);
  const [editNote, setEditNote] = useState({ _id: "", title: "", body: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(defaultNotificationState);

  const { request, isLoading, clearError, error } = useRequest();

  const fetchNotes = useCallback(async () => {
    try {
      const fetched = await request("/api/notes", "GET", null, {
        Authorization: `Bearer ${token}`,
      });
      setNotes(fetched.reverse());
    } catch (e) {}
  }, [token, request, setNotes]);

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [fetchNotes, token]);

  useEffect(() => {
    if (error) {
      setNotification({
        isOpen: true,
        message: error,
        severity: "error",
      });
      clearError();
    }
  }, [error, clearError]);

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
    isLoading,
    isModalOpen,
    token,
    userId,
    searchQuery,
    request,
    notes,
    editNote,
    notification,
    fetchNotes,
    logIn,
    logOut,
    setNotification,
    setSearchQuery,
    setIsModalOpen,
    setEditNote,
  };
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
