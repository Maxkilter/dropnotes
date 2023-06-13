import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
} from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Loader from "./Loader";
import isEqual from "lodash/isEqual";
import { makeStyles } from "@material-ui/core/styles";
import { TransitionComponent } from "./TransitionComponent";
import {
  noteDefaultState,
  handleChange,
  handleEnterPress,
  setCursorToEnd,
} from "../utils";
import { useNoteAction } from "../hooks";
import { EditNoteProps, LoaderTypes } from "../types";

import "../styles/EditNoteStyles.scss";

const useStyles = makeStyles({
  paper: {
    width: "100%",
  },
});

const EditNote = (props: EditNoteProps) => {
  const {
    id,
    title: originTitle,
    body: originBody,
    isOpen,
    setIsSimpleNoteOpen,
  } = props;

  const [editNote, setEditNote] = useState(noteDefaultState);
  const [forceUpdate, setForceUpdate] = useState(false);
  const editNoteTitleRef = useRef<HTMLDivElement>(null);
  const editNoteBodyRef = useRef<HTMLDivElement>(null);
  const { updateNote, fetchNotes, isLoading } = useNoteAction();
  const classes = useStyles();

  useEffect(() => {
    setCursorToEnd(editNoteTitleRef);
    return function cleanup() {
      setForceUpdate(false);
    };
  }, [forceUpdate]);

  useEffect(() => {
    setEditNote({
      title: originTitle!,
      body: originBody,
    });
    setForceUpdate(true);
  }, [id, originTitle, originBody]);

  const shouldUpdateNote =
    !isEqual(editNote.title.trim(), originTitle) ||
    !isEqual(editNote.body.trim(), originBody);

  const closeModal = useCallback(() => setIsSimpleNoteOpen(false), [
    setIsSimpleNoteOpen,
  ]);

  const modifyNote = useCallback(async () => {
    const { title, body } = editNote;

    if (shouldUpdateNote) {
      const updatedNote = await updateNote(id, title, body);
      if (updatedNote) await fetchNotes();
    }
    if (!isLoading) closeModal();
  }, [
    fetchNotes,
    editNote,
    id,
    closeModal,
    shouldUpdateNote,
    updateNote,
    isLoading,
  ]);

  return (
    <Dialog
      classes={{ paper: classes.paper }}
      open={isOpen}
      TransitionComponent={TransitionComponent}
      disableEscapeKeyDown
      onClose={modifyNote}
    >
      <div className="edit-note-wrapper">
        <div className="edit-note-box">
          <DialogContent>
            <div
              title="note-title"
              ref={editNoteTitleRef}
              id="edit-note-title"
              className="note-title"
              contentEditable
              role="textbox"
              data-placeholder="Title"
              onInput={(event: ChangeEvent<HTMLDivElement>) =>
                handleChange(event, editNote, setEditNote)
              }
              onKeyDown={(event) => handleEnterPress(event, editNoteBodyRef)}
              suppressContentEditableWarning
            >
              {originTitle}
            </div>
            <div
              title="note-body"
              ref={editNoteBodyRef}
              id="edit-note-body"
              className="note-body"
              contentEditable
              aria-multiline
              role="textbox"
              data-placeholder="Note"
              onInput={(event: ChangeEvent<HTMLDivElement>) =>
                handleChange(event, editNote, setEditNote)
              }
              suppressContentEditableWarning
            >
              {originBody}
            </div>
          </DialogContent>
        </div>
      </div>
      <DialogActions>
        {isLoading && (
          <div className="loader-wrapper">
            <Loader type={LoaderTypes.linear} />
          </div>
        )}
        <button className="edit-note-button" onClick={closeModal}>
          Close
        </button>
        {shouldUpdateNote && !isLoading && (
          <button className="edit-note-button" onClick={modifyNote}>
            Update
          </button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default memo(EditNote);
