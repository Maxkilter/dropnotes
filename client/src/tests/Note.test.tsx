import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import Note from "../components/Note";
import { mockNotes } from "./moks";

describe("Note component tests", () => {
  afterEach(cleanup);

  it("render a note with title, body and date fields ", () => {
    render(<Note note={mockNotes[0]} />);
    const title = screen.getByText("Birds & The Bees");
    const body = screen.getByText("A father asked his 10 year old son", {
      exact: false,
    });
    const date = screen.getByText("12/11/2020, 9:46:50 PM");

    expect(title).toBeInTheDocument();
    expect(body).toBeInTheDocument();
    expect(date).toBeInTheDocument();
  });

  it("toggle note menu and render menu options", () => {
    render(<Note note={mockNotes[0]} />);
    const button = screen.getByTestId("note-menu-icon");
    const menu = document.getElementById("menu")!.childNodes[1] as HTMLElement;

    expect(menu.style.opacity).toEqual("0");

    fireEvent.click(button!);

    expect(menu.style.opacity).toEqual("1");

    expect(screen.getByText("Delete note")).toBeInTheDocument();
    expect(screen.getByText("Copy note")).toBeInTheDocument();
  });
});
