import { createContext } from "react";

export const AuthContext = createContext({
  token: null,
  userId: null,
  logIn: (jwtToken: string, id: string) => {},
  logOut: () => {},
  isAuthenticated: false,
});
