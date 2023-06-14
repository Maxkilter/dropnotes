import { useCallback, useContext, useEffect, useMemo } from "react";
import { StoreContext } from "../appStore";
import { useRequest } from "./useRequest";
import { isNoNotes } from "../utils";

export const useNoteAction = () => {
  const { token, setNotes, setNotification, setIsNoMatching } = useContext(
    StoreContext
  );
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

  const headers = useMemo(() => {
    return {
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  const fetchNotes = useCallback(async () => {
    try {
      const notes = await request("/api/notes", "GET", null, headers);
      if (notes) {
        setIsNoMatching(false);
        setNotes(notes);
      }
    } catch (e) {
      if (e instanceof Error)
        console.error("Error while fetching notes ", e.message);
    }
  }, [headers, request, setNotes, setIsNoMatching]);

  const searchNotes = useCallback(
    async (query: string) => {
      try {
        const notes = await request(
          `/api/notes/search/${query}`,
          "GET",
          null,
          headers
        );
        if (notes) {
          isNoNotes(notes) ? setIsNoMatching(true) : setIsNoMatching(false);
          setNotes(notes);
        }
      } catch (e) {
        if (e instanceof Error)
          console.error("Error while searching notes ", e.message);
      }
    },
    [headers, request, setNotes, setIsNoMatching]
  );

  const createNote = useCallback(
    async (title: string | undefined, body: string) => {
      try {
        return await request(
          "/api/notes/create",
          "POST",
          { title, body },
          headers
        );
      } catch (e) {
        if (e instanceof Error)
          console.error("Error while creating note ", e.message);
      }
    },
    [headers, request]
  );

  const updateNote = useCallback(
    async (id: string, title: string, body: string) => {
      try {
        return await request(
          `/api/notes/${id}`,
          "PUT",
          { title, body },
          headers
        );
      } catch (e) {
        if (e instanceof Error)
          console.error("Error while updating note ", e.message);
      }
    },
    [headers, request]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      try {
        return await request(`api/notes/${id}`, "DELETE", null, headers);
      } catch (e) {
        if (e instanceof Error)
          console.error("Error while deleting note ", e.message);
      }
    },
    [headers, request]
  );

  return {
    fetchNotes,
    searchNotes,
    createNote,
    updateNote,
    deleteNote,
    isLoading,
  };
};
