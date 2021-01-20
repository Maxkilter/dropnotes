import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  RefObject,
  SetStateAction,
} from "react";
import { NoteProps, NoteState } from "./types";
import { Color } from "@material-ui/lab";

export const noteDefaultState = {
  title: "",
  body: "",
};

export const defaultNotificationState = {
  isOpen: false,
  message: "",
  severity: "info" as Color,
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

export const handleChange = (
  e: ChangeEvent<HTMLDivElement>,
  note: NoteState,
  setNote: Dispatch<SetStateAction<NoteState>>
) =>
  setNote({
    ...note,
    [e.target.id.includes("body") ? "body" : "title"]: e.target.innerText,
  });

export const setCursorToEnd = (el: RefObject<HTMLDivElement>) => {
  const currentEl = el.current;
  const range = document.createRange();
  const sel = window.getSelection();
  if (currentEl) {
    if (currentEl.innerText?.length !== 0) {
      range.setStart(currentEl, 1);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    setFocus(el);
  }
};

export const validate = (values: { email: string; password?: string }) => {
  const errors = { email: "", password: "" };
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }
  if (values.password!?.length < 6) {
    errors.password = "Password should contain six symbols at least";
  }
  return errors;
};

export const isNoFormErrors = (errors: { [key: string]: string }) => {
  for (const error in errors) if (!!errors[error]) return false;
  return true;
};

export const isNoNotes = (notes: NoteProps[]) => notes.length === 0;
