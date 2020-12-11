import React, { useCallback, useContext, useEffect } from "react";
import NewNote from "../components/NewNote";
import Note from "../components/Note";
import Loader from "../components/Loader";
import NoNotesPlaceholder from "../components/NoNotesPlaceholder";
import { StoreContext } from "../appStore";
import { useNoteAction } from "../hooks";
import { LoaderTypes, NoteProps } from "../types";
import { isNoNotes } from "../utils";

import "../styles/NotesPageStyles.scss";

const NotesPage = () => {
  const { notes, isNoMatching } = useContext(StoreContext);
  const { fetchNotes, isLoading } = useNoteAction();

  useEffect(() => {
    const getNotes = async () => {
      await fetchNotes();
    };
    getNotes();
  }, [fetchNotes]);

  const renderNotes = useCallback((notes: NoteProps[]) => {
    return notes.map((note: NoteProps) => <Note key={note._id} note={note} />);
  }, []);

  return (
    <>
      <NewNote />
      {!isLoading && (isNoNotes(notes) || isNoMatching) ? (
        <NoNotesPlaceholder />
      ) : (
        <div className="notes-container">{renderNotes(notes)}</div>
      )}
      {isLoading && <Loader type={LoaderTypes.dots} />}
    </>
  );
};

export default NotesPage;
