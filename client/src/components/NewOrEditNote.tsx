//@ts-nocheck
import React, {
  useState,
  useRef,
  ChangeEvent,
  useContext,
  useCallback,
  memo,
} from "react";
import Loader from "./Loader";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { StoreContext } from "../appStore";

import "../styles/NewOrEditNoteStyles.scss";

const defaultNoteState = {
  title: "",
  body: "",
};

const NewOrEditNote = () => {
  const [isAddNoteExpanded, setIsAddNoteExpanded] = useState(false);
  const [note, setNote] = useState(defaultNoteState);

  const isNoteFilled = note.body || note.title;

  const ref = useRef(null);

  const { token, request, isLoading, fetchNotes } = useContext(StoreContext);

  const handleChange = (e: ChangeEvent<HTMLDivElement>) =>
    setNote({ ...note, [e.target.id]: e.target.textContent });

  const addNoteExpand = () => setIsAddNoteExpanded(true);

  // typescript bug, it says: "'KeyboardEvent' is not generic",
  // but in other case it says: "Type 'KeyboardEvent<HTMLDivElement>' is missing
  // the following properties from type 'KeyboardEvent'"
  // @ts-ignore
  const handleEnterPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("body")?.focus();
    }
  };

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
    <>
      <div className="new-or-edit-note-wrapper">
        <div className="new-or-edit-note-box" ref={ref}>
          {isAddNoteExpanded && !isLoading && (
            <div
              id="title"
              className="new-or-edit-note-title"
              contentEditable
              role="textbox"
              tabIndex={1}
              data-placeholder="Title"
              onInput={handleChange}
              onKeyDown={handleEnterPress}
            />
          )}
          {isLoading ? (
            <Loader />
          ) : (
            <div
              id="body"
              className="new-or-edit-note-body"
              contentEditable
              aria-multiline
              role="textbox"
              tabIndex={0}
              data-placeholder="Add a note..."
              onInput={handleChange}
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
    </>
  );
};

export default memo(NewOrEditNote);
