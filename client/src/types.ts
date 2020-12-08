import { Dispatch, SetStateAction } from "react";
import { AlertProps } from "@material-ui/lab/Alert";

export interface NoteProps {
  _id: string;
  title?: string;
  body: string;
  date: string;
}

export interface NoteState {
  title: string;
  body: string;
}

export type NoteMenuProps = Omit<NoteProps, "date" | "_id"> & {
  id: string;
};

export type EditNoteProps = NoteMenuProps & {
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<any>>;
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

export interface NavbarProps {
  isAuthenticated: boolean;
}
