import { Color } from "@material-ui/lab";
import { defaultNotificationState } from "../utils";

export const mockNotes = [
  {
    _id: "5fd3ccaadaeab6e38cfd585f",
    title: "Birds & The Bees",
    body:
      "A father asked his 10 year old son if he knew about the birds and the bees...",
    date: "2020-12-11T19:46:50.032Z",
  },
];

export const mockStore = {
  isReady: false,
  isNoMatching: false,
  notes: [],
  token: null,
  userId: null,
  notification: defaultNotificationState,
  logIn: (jwtToken: string, id: string) => {},
  logOut: () => {},
  setNotes: (value: []) => {},
  setIsNoMatching: (value: boolean) => {},
  setNotification: (value: {
    isOpen: boolean;
    message: string;
    severity: Color;
  }) => {},
};
