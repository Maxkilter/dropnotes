import { useContext, useEffect } from "react";
import { StoreContext } from "../appStore";
import { useRequest } from "./useRequest";

export const useNoteAction = () => {
  const { token, setNotes, setNotification } = useContext(StoreContext);
  const { request, isLoading, clearError, error } = useRequest();

  useEffect(() => {
    if (error) {
      setNotification({
        isOpen: true,
        message: error,
        severity: "error",
      });
      clearError();
    }
  }, [error, clearError, setNotification]);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotes = async () => {
    try {
      const notes = await request("/api/notes", "GET", null, headers);
      if (notes) setNotes(notes);
    } catch (e) {}
  };

  const searchNotes = async (query: string) => {
    try {
      const notes = await request(
        `/api/notes/search/${query}`,
        "GET",
        null,
        headers
      );
      if (notes) setNotes(notes);
    } catch (e) {}
  };

  const createNote = async (title: string | undefined, body: string) => {
    try {
      return await request(
        "/api/notes/create",
        "POST",
        { title, body },
        headers
      );
    } catch (e) {}
  };

  const updateNote = async (id: string, title: string, body: string) => {
    try {
      return await request(`/api/notes/${id}`, "PUT", { title, body }, headers);
    } catch (e) {}
  };

  const deleteNote = async (id: string) => {
    try {
      return await request(`api/notes/${id}`, "DELETE", null, headers);
    } catch (e) {}
  };

  return {
    fetchNotes,
    searchNotes,
    createNote,
    updateNote,
    deleteNote,
    isLoading,
  };
};
