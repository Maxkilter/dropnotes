import { Dispatch, SetStateAction } from "react";
import { AlertProps } from "@material-ui/lab/Alert";

export interface NoteType {
  _id: string;
  title?: string;
  body: string;
  date: string;
}

export interface NoteState {
  title: string;
  body: string;
}

export interface ChatNoteProps {
  isOpen: boolean;
  setIsChatNoteOpen: (isOpen: boolean) => void;
  title?: string;
  body?: { role: string; content: string }[];
  id?: string;
}
export type NoteMenuProps = Omit<NoteType, "date" | "_id"> & {
  id: string;
};

export type EditNoteProps = NoteMenuProps & {
  isOpen: boolean;
  setIsSimpleNoteOpen: Dispatch<SetStateAction<any>>;
};

export interface NotificationProps {
  isOpen: boolean;
  message: string;
  severity?: AlertProps["color"];
  setIsOpen: Dispatch<SetStateAction<any>>;
}

export enum LoaderTypes {
  darken = "darken",
  circular = "circular",
  linear = "linear",
  dots = "dots",
}

export interface LoaderProps {
  type: LoaderTypes;
}
