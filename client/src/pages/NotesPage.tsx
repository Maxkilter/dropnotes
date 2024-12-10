import React, { useCallback, useContext, useEffect } from "react";
import { NewNote } from "../components/NewNote";
import { Note } from "../components/Note";
import { Loader } from "../components/Loader";
import { NoNotesPlaceholder } from "../components/NoNotesPlaceholder";
import { StoreContext } from "../appStore";
import { useNoteAction } from "../hooks";
import { LoaderTypes, NoteType } from "../types";

import "../styles/NotesPageStyles.scss";

export const NotesPage = () => {
  const { notes, isNoMatching } = useContext(StoreContext);
  const { fetchNotes, isLoading } = useNoteAction();

  useEffect(() => {
    const loadNotes = async () => await fetchNotes();
    loadNotes();
  }, [fetchNotes]);

  const renderNotes = useCallback((notes: NoteType[] | null) => {
    return notes?.map((note: NoteType) => <Note key={note._id} note={note} />);
  }, []);

  return (
    <>
      <NewNote />
      {!isLoading && notes !== null && (!notes.length || isNoMatching) ? (
        <NoNotesPlaceholder />
      ) : (
        <div className="notes-container">{renderNotes(notes)}</div>
      )}
      {isLoading && <Loader type={LoaderTypes.darken} />}
    </>
  );
};
