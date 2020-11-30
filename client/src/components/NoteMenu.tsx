import React, { useCallback } from "react";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import { useNoteAction } from "../hooks/useNoteAction";
import { NoteProps } from "./Note";

const ITEM_HEIGHT = 32;

const useStyles = makeStyles({
  root: {
    position: "relative",
    left: 218,
  },
  copyIcon: {
    marginRight: 4,
    paddingLeft: 4,
  },
  loading: {
    position: "absolute",
    left: 0,
  },
});

const NoteMenu = ({ note }: { note: NoteProps }) => {
  const { _id, title, body } = note;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const classes = useStyles();

  const { fetchNotes, deleteNote, createNote, isLoading } = useNoteAction();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const removeNote = useCallback(async () => {
    handleClose();
    const deleted = await deleteNote(_id);
    if (deleted) {
      await fetchNotes();
    }
  }, [_id, fetchNotes, deleteNote]);

  const copyNote = useCallback(async () => {
    handleClose();
    const copiedNote = await createNote(title, body);
    if (copiedNote) {
      await fetchNotes();
    }
  }, [title, body, fetchNotes, createNote]);

  return (
    <div className={classes.root}>
      <IconButton
        size="small"
        aria-label="more"
        aria-controls="menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      {isLoading && (
        <CircularProgress
          size={28}
          className={classes.loading}
          color="secondary"
        />
      )}
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

export default NoteMenu;
