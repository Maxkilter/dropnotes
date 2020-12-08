import React, {
  ChangeEvent,
  forwardRef,
  ReactElement,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Slide, { SlideProps } from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import Loader, { LoaderTypes } from "./Loader";
import { StoreContext } from "../appStore";
import {
  noteDefaultState,
  handleChange,
  handleEnterPress,
  setCursorToEnd,
} from "../utils";
import { useNoteAction } from "../hooks";

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

const EditNote = () => {
  const [note, setNote] = useState(noteDefaultState);
  const [forceUpdate, setForceUpdate] = useState(false);
  const editNoteTitleRef = useRef<HTMLDivElement>(null);
  const editNoteBodyRef = useRef<HTMLDivElement>(null);
  const { editNote, isModalOpen, setIsModalOpen } = useContext(StoreContext);
  const { updateNote, fetchNotes, isLoading } = useNoteAction();

  useEffect(() => {
    setCursorToEnd(editNoteTitleRef);
    return function cleanup() {
      setForceUpdate(false);
    };
  }, [forceUpdate]);

  useEffect(() => {
    setNote({
      title: editNote.title,
      body: editNote.body,
    });
    setForceUpdate(true);
  }, [editNote]);

  const shouldUpdateNote =
    note.title.trim() !== editNote.title.trim() ||
    note.body.trim() !== editNote.body.trim();

  const closeModal = useCallback(() => setIsModalOpen(false), [setIsModalOpen]);

  const modifyNote = useCallback(async () => {
    const { title, body } = note;
    closeModal();

    if (shouldUpdateNote) {
      const updatedNote = await updateNote(editNote._id, title, body);
      // @ts-ignore
      if (updatedNote) {
        await fetchNotes();
      }
    }
  }, [
    fetchNotes,
    note,
    editNote._id,
    closeModal,
    shouldUpdateNote,
    updateNote,
  ]);

  return (
    <>
      <Dialog
        open={isModalOpen}
        TransitionComponent={Transition}
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
                  handleChange(event, note, setNote)
                }
                onKeyDown={(event) => handleEnterPress(event, editNoteBodyRef)}
                suppressContentEditableWarning
              >
                {editNote.title}
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
                  handleChange(event, note, setNote)
                }
                suppressContentEditableWarning
              >
                {editNote.body}
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

export default EditNote;
