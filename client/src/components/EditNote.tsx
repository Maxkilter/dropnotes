import React, {
  ChangeEvent,
  forwardRef,
  ReactElement,
  Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
} from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Slide, { SlideProps } from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import Loader from "./Loader";
import {
  noteDefaultState,
  handleChange,
  handleEnterPress,
  setCursorToEnd,
} from "../utils";
import { useNoteAction } from "../hooks";
import { EditNoteProps, LoaderTypes } from "../types";

import "../styles/EditNoteStyles.scss";

const Transition = forwardRef(
  (
    props: TransitionProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
  ) => {
    const directions = ["up", "right", "down", "left"];
    const setDirection = () => {
      const random = Math.floor(Math.random() * directions.length);
      return directions[random] as SlideProps["direction"];
    };
    return <Slide direction={setDirection()} ref={ref} {...props} />;
  }
);

const EditNote = (props: EditNoteProps) => {
  const { id, title: originTitle, body: originBody, isEdit, setIsEdit } = props;

  const [editNote, setEditNote] = useState(noteDefaultState);
  const [forceUpdate, setForceUpdate] = useState(false);
  const editNoteTitleRef = useRef<HTMLDivElement>(null);
  const editNoteBodyRef = useRef<HTMLDivElement>(null);
  const { updateNote, fetchNotes, isLoading } = useNoteAction();

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
    editNote.title.trim() !== originTitle?.trim() ||
    editNote.body.trim() !== originBody.trim();

  const closeModal = useCallback(() => setIsEdit(false), [setIsEdit]);

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
    <>
      <Dialog
        open={isEdit}
        TransitionComponent={Transition}
        disableEscapeKeyDown
        onClose={modifyNote}
      >
        <div className="edit-note-wrapper">
          <div className="edit-note-box">
            <DialogContent>
              <div
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
          <div className="edit-note-button" role="button" onClick={closeModal}>
            Close
          </div>
          {shouldUpdateNote && (
            <div
              className="edit-note-button"
              role="button"
              onClick={modifyNote}
            >
              Update
            </div>
          )}
        </DialogActions>
      </Dialog>
      {isLoading && <Loader type={LoaderTypes.dots} />}
    </>
  );
};

export default memo(EditNote);
