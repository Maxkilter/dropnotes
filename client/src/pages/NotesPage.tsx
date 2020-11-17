import React, { useState, useCallback } from "react";
import NewOrEditNote from "../components/NewOrEditNote";
import Note, { NoteProps } from "../components/Note";

import "../styles/NotesPageStyles.scss";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

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
      <NewOrEditNote isEditMode={isEditMode} setNotes={setNotes} />
      <div className="notes-container">{renderNotes(notes)}</div>
    </>
  );
};

export default NotesPage;
