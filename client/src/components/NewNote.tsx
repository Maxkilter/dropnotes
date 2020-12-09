import React, {
  useState,
  useRef,
  useCallback,
  ChangeEvent,
  useEffect,
} from "react";
import Loader from "./Loader";
import { useNoteAction, useOutsideClick } from "../hooks";
import {
  noteDefaultState,
  handleChange,
  handleEnterPress,
  setFocus,
} from "../utils";
import { LoaderTypes } from "../types";

import "../styles/NewNoteStyles.scss";

const NewNote = () => {
  const [isAddingFormExpanded, setIsAddingFormExpanded] = useState(false);
  const [note, setNote] = useState(noteDefaultState);

  const shouldCreateNote = note.body.trim() || note.title.trim();

  const noteRef = useRef<HTMLDivElement>(null);
  const newNoteBodyRef = useRef<HTMLDivElement>(null);

  const { createNote, fetchNotes, isLoading } = useNoteAction();

  useEffect(() => setFocus(newNoteBodyRef), [newNoteBodyRef]);

  const expandAddingForm = () => {
    newNoteBodyRef?.current?.scrollIntoView(false);
    setIsAddingFormExpanded(true);
  };

  const addNewNote = useCallback(async () => {
    const { title, body } = note;
    setNote(noteDefaultState);
    setIsAddingFormExpanded(false);

    if (shouldCreateNote) {
      const newNote = await createNote(title, body);
      if (newNote) await fetchNotes();
    }
  }, [fetchNotes, shouldCreateNote, note, createNote]);

  useOutsideClick(noteRef, () => addNewNote());

  return (
    <div className="new-note-wrapper">
      <div className="new-note-box" ref={noteRef}>
        {isAddingFormExpanded && !isLoading && (
          <div
            id="new-note-title"
            className="note-title"
            contentEditable
            role="textbox"
            data-placeholder="Title"
            onInput={(event: ChangeEvent<HTMLDivElement>) =>
              handleChange(event, note, setNote)
            }
            onKeyDown={(e) => handleEnterPress(e, newNoteBodyRef)}
          />
        )}
        {isLoading ? (
          <Loader type={LoaderTypes.linear} />
        ) : (
          <div
            ref={newNoteBodyRef}
            id="new-note-body"
            className="note-body"
            contentEditable
            aria-multiline
            role="textbox"
            data-placeholder="Add a note..."
            onInput={(event: ChangeEvent<HTMLDivElement>) =>
              handleChange(event, note, setNote)
            }
            onClick={expandAddingForm}
            onKeyPress={expandAddingForm}
          />
        )}
        {isAddingFormExpanded && (
          <div className="button-wrapper">
            <div role="button" onClick={addNewNote}>
              {shouldCreateNote ? "Add" : "Close"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewNote;
