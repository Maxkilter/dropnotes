import { ChangeEvent, Dispatch, KeyboardEvent, SetStateAction } from "react";

export const defaultNoteState = {
  title: "",
  body: "",
};

export const handleEnterPress = (e: KeyboardEvent<HTMLDivElement>) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("new-note-body")?.focus();
    document.getElementById("edit-note-body")?.focus();
  }
};

interface NoteState {
  title: string;
  body: string;
}

export const handleChange = (
  e: ChangeEvent<HTMLDivElement>,
  note: NoteState,
  setNote: Dispatch<SetStateAction<NoteState>>
) =>
  setNote({
    ...note,
    [e.target.id.includes("body") ? "body" : "title"]: e.target.textContent,
  });
