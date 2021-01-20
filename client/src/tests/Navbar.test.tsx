import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Navbar from "../components/Navbar";

describe("Navbar component tests", () => {
  afterEach(cleanup);
  it("render Navbar elements", () => {
    render(<Navbar isAuthenticated />);

    const title = document.getElementsByTagName("h5")[0];

    expect(screen.getByTestId("logo-img")).toBeInTheDocument();
    expect(title.innerHTML).toEqual("Drop notes");
    expect(screen.getByTestId("search")).toBeInTheDocument();
    expect(screen.getByTestId("profile-icon")).toBeInTheDocument();
  });

  it("don't render search field if not authenticated", () => {
    render(<Navbar isAuthenticated={false} />);

    expect(screen.queryByTestId("search")).not.toBeInTheDocument();
  });

  it("show correct menu options depend on the authorization status", () => {
    const { rerender } = render(<Navbar isAuthenticated={false} />);

    expect(screen.getByTestId("lock-icon")).toBeInTheDocument();

    rerender(<Navbar isAuthenticated />);

    fireEvent.click(screen.getByTestId("profile-icon"));

    expect(screen.getByText("Log out")).toBeInTheDocument();
    expect(screen.queryByTestId("lock-icon")).not.toBeInTheDocument();
  });
});
