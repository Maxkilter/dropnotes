import React, { useState, useRef, useCallback, memo, ChangeEvent } from "react";
import Loader, { LoaderTypes } from "./Loader";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { useNoteAction } from "../hooks/useNoteAction";
import { defaultNoteState, handleChange, handleEnterPress } from "../utils";

import "../styles/NewNoteStyles.scss";

const NewNote = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [note, setNote] = useState(defaultNoteState);

  const shouldCreateNote = note.body.trim() || note.title.trim();

  const ref = useRef(null);

  const { createNote, fetchNotes, isLoading } = useNoteAction();

  const activateNoteAdding = () => setIsAdding(true);

  const addingFinished = useCallback(async () => {
    const { title, body } = note;
    setNote(defaultNoteState);
    setIsAdding(false);

    if (shouldCreateNote) {
      const newNote = await createNote(title, body);
      if (newNote) {
        await fetchNotes();
      }
    }
  }, [fetchNotes, shouldCreateNote, note, createNote]);

  useOutsideClick(ref, () => addingFinished());

  return (
    <div className="new-note-wrapper">
      <div className="new-note-box" ref={ref}>
        {isAdding && !isLoading && (
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
            onClick={activateNoteAdding}
          />
        )}
        {isAdding && (
          <div className="button-wrapper">
            <div role="button" onClick={addingFinished}>
              {shouldCreateNote ? "Add" : "Close"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(NewNote);
