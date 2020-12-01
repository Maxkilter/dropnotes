import React, {
  useState,
  useRef,
  useCallback,
  memo,
  ChangeEvent,
  useEffect,
} from "react";
import Loader, { LoaderTypes } from "./Loader";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { useNoteAction } from "../hooks/useNoteAction";
import { defaultNoteState, handleChange, handleEnterPress } from "../utils";

import "../styles/NewNoteStyles.scss";

const NewNote = () => {
  const [isAddingFormExpanded, setIsAddingFormExpanded] = useState(false);
  const [note, setNote] = useState(defaultNoteState);

  const shouldCreateNote = note.body.trim() || note.title.trim();

  const ref = useRef(null);

  const { createNote, fetchNotes, isLoading } = useNoteAction();

  const newNoteBody = document.getElementById("new-note-body");

  useEffect(() => {
    newNoteBody?.focus();
  }, [newNoteBody]);

  const expandAddingForm = () => {
    newNoteBody?.scrollIntoView(false);
    setIsAddingFormExpanded(true);
  };

  const addNewNote = useCallback(async () => {
    const { title, body } = note;
    setNote(defaultNoteState);
    setIsAddingFormExpanded(false);

    if (shouldCreateNote) {
      const newNote = await createNote(title, body);
      if (newNote) {
        await fetchNotes();
      }
    }
  }, [fetchNotes, shouldCreateNote, note, createNote]);

  useOutsideClick(ref, () => addNewNote());

  return (
    <div className="new-note-wrapper">
      <div className="new-note-box" ref={ref}>
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
            onKeyDown={handleEnterPress}
          />
        )}
        {isLoading ? (
          <Loader type={LoaderTypes.linear} />
        ) : (
          <div
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

export default memo(NewNote);
