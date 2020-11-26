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

  const {
    editNote,
    isModalOpen,
    setIsModalOpen,
    request,
    token,
    fetchNotes,
  } = useContext(StoreContext);

  useEffect(() => {
    setNote({
      title: editNote.title,
      body: editNote.body,
    });
  }, [editNote]);

  const shouldNoteUpdate =
    note.title.trim() !== editNote.title.trim() ||
    note.body.trim() !== editNote.body.trim();

  const handleModalClose = useCallback(async () => {
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
          {shouldNoteUpdate ? "Update" : "Close"}
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default EditNote;
