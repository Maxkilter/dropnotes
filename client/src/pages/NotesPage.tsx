import React, { useCallback, memo, useContext } from "react";
import NewOrEditNote from "../components/NewOrEditNote";
import Note, { NoteProps } from "../components/Note";
import { StoreContext } from "../appStore";

import "../styles/NotesPageStyles.scss";

const NotesPage = () => {
  const { notes } = useContext(StoreContext);
  const renderNotes = useCallback((notes: NoteProps[]) => {
    return notes
      .reverse()
      .map((note: NoteProps) => (
        <Note
          key={note._id}
          title={note.title}
          body={note.body}
          _id={note._id}
        />
      ));
  }, []);

  return (
    <>
      <NewOrEditNote />
      <div className="notes-container">{renderNotes(notes)}</div>
    </>
  );
};

export default memo(NotesPage);
