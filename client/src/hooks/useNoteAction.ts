import { useCallback, useContext } from "react";
import { StoreContext } from "../appStore";
import { useRequest } from "./useRequest";

export const useNoteAction = () => {
  const { setNotes, setIsNoMatching } = useContext(StoreContext);
  const { request, isLoading } = useRequest();

  const fetchNotes = useCallback(async () => {
    const notes = await request("/api/notes");
    if (notes) {
      setIsNoMatching(false);
      setNotes(notes);
      return notes;
    }
  }, [request, setNotes, setIsNoMatching]);

  const searchNotes = useCallback(
    async (query: string) => {
      const notes = await request(`/api/notes/search/${query}`);
      if (notes) {
        !notes.length ? setIsNoMatching(true) : setIsNoMatching(false);
        setNotes(notes);
      }
    },
    [request, setNotes, setIsNoMatching],
  );

  const createNote = useCallback(
    async (title: string | undefined, body: string) =>
      await request("/api/notes/create", {
        method: "POST",
        body: JSON.stringify({ title, body }),
      }),
    [request],
  );

  const chatRequest = useCallback(
    async (data) =>
      await request("/api/notes/chat", {
        method: "POST",
        body: JSON.stringify({ data }),
      }),
    [request],
  );

  const voiceToTextRequest = useCallback(
    async (data) =>
      await request("/api/notes/transcription", {
        method: "POST",
        headers: {
          "X-Csrf-Token": sessionStorage.getItem("csrfToken"),
        },
        body: data,
      }),
    [request],
  );

  const textToSpeechRequest = useCallback(
    async (data) =>
      await request("/api/notes/speech", {
        method: "POST",
        body: JSON.stringify({ data }),
      }),
    [request],
  );

  const updateNote = useCallback(
    async (id: string, title: string, body: string) =>
      await request(`/api/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, body }),
      }),
    [request],
  );

  const deleteNote = useCallback(
    async (id: string) =>
      await request(`api/notes/${id}`, { method: "DELETE" }),
    [request],
  );

  return {
    fetchNotes,
    searchNotes,
    createNote,
    updateNote,
    deleteNote,
    isLoading,
    chatRequest,
    voiceToTextRequest,
    textToSpeechRequest,
  };
};
