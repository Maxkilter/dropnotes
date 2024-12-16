import React, { useCallback, useState, MouseEvent } from "react";
import { IconButton, Menu, MenuItem, makeStyles } from "@material-ui/core";
import {
  MoreVert as MoreVertIcon,
  DeleteForever as DeleteForeverIcon,
  FileCopy as FileCopyIcon,
} from "@material-ui/icons";
import { Loader } from "./Loader";
import { useNoteAction } from "../hooks";
import { NoteMenuProps, LoaderTypes } from "../types";

const ITEM_HEIGHT = 32;

const useStyles = makeStyles({
  root: {
    position: "relative",
  },
  copyIcon: {
    marginRight: 4,
    paddingLeft: 4,
  },
});

export const NoteMenu = ({ id, title, body }: NoteMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const classes = useStyles();

  const { fetchNotes, deleteNote, createNote, isLoading } = useNoteAction();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const removeNote = useCallback(async () => {
    handleClose();
    const data = await deleteNote(id);

    if (data) await fetchNotes();
  }, [id, fetchNotes, deleteNote]);

  const copyNote = useCallback(async () => {
    handleClose();
    const copiedNote = await createNote(title, body);

    if (copiedNote) await fetchNotes();
  }, [title, body, fetchNotes, createNote]);

  return (
    <div className={classes.root}>
      <IconButton
        data-testid="note-menu-icon"
        size="small"
        aria-label="more"
        aria-controls="menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      {isLoading && <Loader type={LoaderTypes.circular} />}
      <Menu
        id="menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "14ch",
          },
        }}
      >
        <MenuItem key="delete" onClick={removeNote}>
          <DeleteForeverIcon color="primary" />
          Delete note
        </MenuItem>
        <MenuItem key="copy" onClick={copyNote}>
          <FileCopyIcon
            className={classes.copyIcon}
            fontSize="small"
            color="primary"
          />
          Copy note
        </MenuItem>
      </Menu>
    </div>
  );
};
