import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ModalDialog from "./ModalDialog";
import { StoreContext } from "../appStore";
import { defaultNoteState, handleChange, handleEnterPress } from "../utils";
import { useOutsideClick } from "../hooks/useOutsideClick";

import "../styles/EditNoteStyles.scss";

const EditNote = () => {
  const [note, setNote] = useState(defaultNoteState);
  const ref = useRef(null);

  const { editNote, setIsModalOpen, request, token, fetchNotes } = useContext(
    StoreContext
  );

  useEffect(() => {
    setNote({
      title: editNote.title,
      body: editNote.body,
    });
  }, [editNote]);

  const setSelection = () => {
    const noteBody = document.getElementById("edit-note-body");
    // if (noteBody?.hasChildNodes()) {
    //   let s = window.getSelection();
    //   let r = document.createRange();
    //   let e = noteBody.childElementCount > 0 ? noteBody.lastChild : noteBody;
    //   // @ts-ignore
    //   r.setStart(e, 1);
    //   // @ts-ignore
    //   r.setEnd(e, 1);
    //   // @ts-ignore
    //   s.removeAllRanges();
    //   // @ts-ignore
    //   s.addRange(r);
    // }
    noteBody?.focus();
  };

  const noteBody = document.getElementById("edit-note-body");

  // function SetCaretAtEnd(elem: any) {
  //   const elemLen = elem.value.length;
  //   if (elem.selectionStart || elem.selectionStart == "0") {
  //     // Firefox/Chrome
  //     elem.selectionStart = elemLen;
  //     elem.selectionEnd = elemLen;
  //     elem.focus();
  //   }
  // }
  // SetCaretAtEnd(noteBody);

  // useEffect(() => {
  //   setSelection();
  // }, []);

  const shouldNoteUpdate =
    note.title.trim() !== editNote.title || note.body.trim() !== editNote.body;

  const handleClose = useCallback(async () => {
    if (shouldNoteUpdate) {
      try {
        const updatedNote = await request(
          `/api/notes/${editNote._id}`,
          "PUT",
          {
            title: note.title,
            body: note.body,
          },
          { Authorization: `Bearer ${token}` }
        );
        // @ts-ignore
        if (updatedNote) {
          fetchNotes();
        }
      } catch (e) {}
    }

    setIsModalOpen(false);
  }, [
    token,
    request,
    fetchNotes,
    note.title,
    note.body,
    editNote._id,
    setIsModalOpen,
    shouldNoteUpdate,
  ]);

  useOutsideClick(ref, () => () => handleClose());

  return (
    <ModalDialog>
      <div className="edit-note-wrapper">
        <div className="edit-note-box" ref={ref}>
          <div
            id="edit-note-title"
            className="note-title"
            contentEditable
            role="textbox"
            data-placeholder="Title"
            onInput={(event: ChangeEvent<HTMLDivElement>) =>
              handleChange(event, note, setNote)
            }
            onKeyDown={handleEnterPress}
            suppressContentEditableWarning
          >
            {editNote.title}
          </div>
          <div
            id="edit-note-body"
            className="note-body"
            contentEditable
            aria-multiline
            role="textbox"
            onInput={(event: ChangeEvent<HTMLDivElement>) =>
              handleChange(event, note, setNote)
            }
            suppressContentEditableWarning
          >
            {editNote.body}
          </div>
        </div>
      </div>
      <div className="button-wrapper">
        <div role="button" onClick={handleClose}>
          {shouldNoteUpdate ? "Update" : "Close"}
        </div>
      </div>
    </ModalDialog>
  );
};

export default EditNote;
