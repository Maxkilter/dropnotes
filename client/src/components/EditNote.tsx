import React, {
  ChangeEvent,
  forwardRef,
  ReactElement,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Slide, { SlideProps } from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import { StoreContext } from "../appStore";
import { defaultNoteState, handleChange, handleEnterPress } from "../utils";
import { useNoteAction } from "../hooks/useNoteAction";

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
  const [note, setNote] = useState(defaultNoteState);
  const { updateNote, fetchNotes } = useNoteAction();

  const { editNote, isModalOpen, setIsModalOpen } = useContext(StoreContext);

  useEffect(() => {
    setNote({
      title: editNote.title,
      body: editNote.body,
    });
  }, [editNote]);

  const shouldUpdateNote =
    note.title.trim() !== editNote.title.trim() ||
    note.body.trim() !== editNote.body.trim();

  const handleModalClose = useCallback(async () => {
    const { title, body } = note;
    if (shouldUpdateNote) {
      const updatedNote = await updateNote(editNote._id, title, body);
      // @ts-ignore
      if (updatedNote) {
        await fetchNotes();
      }
    }

    setIsModalOpen(false);
  }, [
    fetchNotes,
    note,
    editNote._id,
    setIsModalOpen,
    shouldUpdateNote,
    updateNote,
  ]);

  return (
    <Dialog
      open={isModalOpen}
      TransitionComponent={Transition}
      onClose={handleModalClose}
    >
      <div className="edit-note-wrapper">
        <div className="edit-note-box">
          <DialogContent>
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
        <div
          className="edit-note-button"
          role="button"
          onClick={handleModalClose}
        >
          {shouldUpdateNote ? "Update" : "Close"}
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default EditNote;
