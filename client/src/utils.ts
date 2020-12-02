import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  RefObject,
  SetStateAction,
} from "react";

export const defaultNoteState = {
  title: "",
  body: "",
};

export const setFocus = (element: RefObject<HTMLDivElement>) =>
  element?.current?.focus();

export const handleEnterPress = (
  event: KeyboardEvent<HTMLDivElement>,
  element: RefObject<HTMLDivElement>
) => {
  if (event.key === "Enter") {
    event.preventDefault();
    setFocus(element);
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
    [e.target.id.includes("body") ? "body" : "title"]: e.target.innerText,
  });
