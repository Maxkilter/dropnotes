import React, { useState, useRef, ChangeEvent } from "react";
import useOutsideClick from "../hooks/useOutsideClick";
import "../styles/NoteStyles.scss";

interface Props {
  isEditMode?: boolean;
}

const Note = () => {
  const [isNoteAdding, setIsNoteAdding] = useState(false);
  const [note, setNote] = useState({
    title: "",
    body: "",
  });
  const ref = useRef(null);

  const handleChange = (e: ChangeEvent<HTMLDivElement>) =>
    setNote({ ...note, [e.target.id]: e.target.textContent });

  const toggleToAdding = () => setIsNoteAdding(true);

  // typescript bug, it says: "'KeyboardEvent' is not generic",
  // but in other case it says: "Type 'KeyboardEvent<HTMLDivElement>' is missing
  // the following properties from type 'KeyboardEvent'"
  //@ts-ignore
  const handleEnterPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      document.getElementById("body")!.focus();
    }
  };

  const addingFinished = () => {
    if (note.title || note.body) {
      console.log("adding finished");
    }
    setIsNoteAdding(false);
  };

  useOutsideClick(ref, () => addingFinished());

  return (
    <div className="note-wrapper">
      <div className="note-box" ref={ref}>
        {isNoteAdding && (
          <div className="note-title-field">
            {!note.title && <div className="note-label-title">Title</div>}
            <div
              id="title"
              className="note-title"
              contentEditable
              aria-valuemax={5}
              role="textbox"
              tabIndex={1}
              onInput={handleChange}
              onKeyDown={handleEnterPress}
            />
          </div>
        )}
        <div className="note-body-field">
          {!note.body && <div className="note-label">Add a note...</div>}
          <div
            id="body"
            className="note-body"
            contentEditable
            aria-multiline
            role="textbox"
            tabIndex={0}
            onInput={handleChange}
            onClick={toggleToAdding}
          />
        </div>
      </div>
    </div>
  );
};

export default Note;
