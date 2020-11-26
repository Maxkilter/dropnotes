//@ts-nocheck
import React, {
  useState,
  useRef,
  useContext,
  useCallback,
  memo,
  ChangeEvent,
} from "react";
import Loader from "./Loader";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { StoreContext } from "../appStore";
import { defaultNoteState, handleChange, handleEnterPress } from "../utils";

import "../styles/NewNoteStyles.scss";

const NewNote = () => {
  const [isAddNoteExpanded, setIsAddNoteExpanded] = useState(false);
  const [note, setNote] = useState(defaultNoteState);

  const isNoteFilled = note.body.trim() || note.title.trim();

  const ref = useRef(null);

  const { token, request, isLoading, fetchNotes } = useContext(StoreContext);

  const addNoteExpand = () => setIsAddNoteExpanded(true);

  const addingFinished = useCallback(async () => {
    if (isNoteFilled) {
      try {
        const newNote = await request(
          "/api/notes/create",
          "POST",
          { title: note.title, body: note.body },
          {
            Authorization: `Bearer ${token}`,
          }
        );

        if (newNote) {
          fetchNotes();
        }
      } catch (e) {}
    }

    setNote(defaultNoteState);
    setIsAddNoteExpanded(false);
  }, [token, request, fetchNotes, isNoteFilled, note.title, note.body]);

  useOutsideClick(ref, () => addingFinished());

  return (
    <div className="new-note-wrapper">
      <div className="new-note-box" ref={ref}>
        {isAddNoteExpanded && !isLoading && (
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
          <Loader />
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
            onClick={addNoteExpand}
          />
        )}
        {isAddNoteExpanded && (
          <div className="button-wrapper">
            <div role="button" onClick={addingFinished}>
              {isNoteFilled ? "Add" : "Close"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(NewNote);
