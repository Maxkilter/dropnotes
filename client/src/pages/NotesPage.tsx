import React, { useCallback, memo, useContext } from "react";
import NewNote from "../components/NewNote";
import Note, { NoteProps } from "../components/Note";
import EditNote from "../components/EditNote";
import { StoreContext } from "../appStore";

import "../styles/NotesPageStyles.scss";

const NotesPage = () => {
  const { notes } = useContext(StoreContext);

  const renderNotes = useCallback((notes: NoteProps[]) => {
    return notes.map((note: NoteProps) => (
      <Note key={note._id} _id={note._id} title={note.title} body={note.body} />
    ));
  }, []);

  return (
    <>
      <NewNote />
      <div className="notes-container">{renderNotes(notes)}</div>
      <EditNote />
    </>
  );
};

export default memo(NotesPage);
