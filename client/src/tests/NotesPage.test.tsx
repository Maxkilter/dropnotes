import { cleanup, render, waitFor, screen } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import NotesPage from "../pages/NotesPage";
import { mockNotes, mockStore } from "./mockups";
import { customRender } from "./tests-utils";

const server = setupServer(
  rest.get("/api/notes", (req, res, ctx) => {
    return res(ctx.status(200));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const providerProps = { ...mockStore, notes: mockNotes as any };

describe("Notes page tests", () => {
  afterEach(cleanup);

  it("show Loader", function () {
    render(<NotesPage />);
    expect(screen.getByText("Loading.")).toBeInTheDocument();
    const loader = screen.getByTestId("dots-loader");
    expect(loader).toBeInTheDocument();
  });

  it("show NoNotesPlaceholder", async function () {
    render(<NotesPage />);

    await waitFor(() => {
      expect(screen.getByText("Notes you add appear here")).toBeInTheDocument();
    });
  });

  it("render Note", async () => {
    customRender(<NotesPage />, { providerProps });

    const loader = screen.getByTestId("dots-loader");

    await waitFor(() => {
      expect(loader).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Birds & The Bees")).toBeInTheDocument();
    });
  });
});
