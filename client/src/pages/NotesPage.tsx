import React, { useCallback, useContext, useEffect } from "react";
import NewNote from "../components/NewNote";
import Note, { NoteProps } from "../components/Note";
import EditNote from "../components/EditNote";
import Loader, { LoaderTypes } from "../components/Loader";
import { StoreContext } from "../appStore";
import { useNoteAction } from "../hooks";

import "../styles/NotesPageStyles.scss";

const NotesPage = () => {
  const { notes } = useContext(StoreContext);
  const { fetchNotes, isLoading } = useNoteAction();

  useEffect(() => {
    fetchNotes();
  }, []);

  const renderNotes = useCallback((notes: NoteProps[]) => {
    return notes.map((note: NoteProps) => <Note key={note._id} note={note} />);
  }, []);

  return (
    <>
      <NewNote />
      <div className="notes-container">{renderNotes(notes)}</div>
      <EditNote />
      {isLoading && <Loader type={LoaderTypes.dots} />}
    </>
  );
};

export default NotesPage;
