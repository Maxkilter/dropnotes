// @ts-nocheck
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { Navbar } from "../components/Navbar";

describe("Navbar component tests", () => {
  afterEach(cleanup);
  it("render Navbar elements", () => {
    render(
      <Router>
        <Navbar isAuthenticated />
      </Router>
    );

    const title = document.getElementsByTagName("h5")[0];

    expect(screen.getByTestId("logo-img")).toBeInTheDocument();
    expect(title.innerHTML).toEqual("Drop notes");
    expect(screen.getByTestId("search")).toBeInTheDocument();
    expect(screen.getByTestId("profile-icon")).toBeInTheDocument();
  });

  it("don't render search field if not authenticated", () => {
    render(
      <Router>
        <Navbar isAuthenticated={false} />
      </Router>
    );

    expect(screen.queryByTestId("search")).not.toBeInTheDocument();
  });

  it("show correct menu options depend on the authorization status", () => {
    const { rerender } = render(
      <Router>
        <Navbar isAuthenticated={false} />
      </Router>
    );

    expect(screen.getByTestId("lock-icon")).toBeInTheDocument();

    rerender(
      <Router>
        <Navbar isAuthenticated />
      </Router>
    );

    fireEvent.click(screen.getByTestId("profile-icon"));

    expect(screen.getByText("Log out")).toBeInTheDocument();
    expect(screen.queryByTestId("lock-icon")).not.toBeInTheDocument();
  });
});
