import React, {
  useState,
  useRef,
  ChangeEvent,
  useContext,
  useCallback,
  useEffect,
  memo,
  SetStateAction,
} from "react";
import Loader from "./Loader";
import Notification from "./Notification";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { useRequest } from "../hooks/useRequest";
import { AuthContext } from "../context/AuthContext";
import { Color } from "@material-ui/lab";

import "../styles/NewOrEditNoteStyles.scss";

interface Props {
  isEditMode?: boolean;
  setNotes: SetStateAction<any>;
}

const defaultNoteState = {
  title: "",
  body: "",
};

const NewOrEditNote = (props: Props) => {
  const { setNotes } = props;
  const [isAddNoteExpanded, setIsAddNoteExpanded] = useState(false);
  const [note, setNote] = useState(defaultNoteState);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    severity: "info" as Color,
  });

  const isNoteFilled = note.body || note.title;

  const ref = useRef(null);
  const { request, error, clearError, isLoading } = useRequest();
  const auth = useContext(AuthContext);

  const fetchNotes = useCallback(async () => {
    try {
      const fetched = await request("/api/notes", "GET", null, {
        Authorization: `Bearer ${auth.token}`,
      });
      setNotes(fetched);
    } catch (e) {}
  }, [auth.token, request, setNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (error) {
      setNotification({
        isOpen: true,
        message: error,
        severity: "error",
      });
      clearError();
    }
  }, [error, clearError]);

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
            Authorization: `Bearer ${auth.token}`,
          }
        );

        if (newNote) {
          fetchNotes();
        }
      } catch (e) {}
    }

    setNote(defaultNoteState);
    setIsAddNoteExpanded(false);
  }, [auth.token, request, isNoteFilled, fetchNotes, note.title, note.body]);

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
      <Notification
        isOpen={notification.isOpen}
        setIsOpen={setNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </>
  );
};

export default memo(NewOrEditNote);
