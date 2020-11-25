import React, { useCallback, useContext } from "react";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { makeStyles } from "@material-ui/core/styles";
import { StoreContext } from "../appStore";

const ITEM_HEIGHT = 32;

const useStyles = makeStyles({
  root: {
    // position: "relative",
    // top: -75,
    // left: 200,
  },
  copyIcon: {
    marginRight: 4,
    paddingLeft: 4,
  },
});

interface Props {
  noteId: string;
}

const NoteMenu = ({ noteId }: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const classes = useStyles();

  const { token, fetchNotes, request } = useContext(StoreContext);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const deleteNote = useCallback(async () => {
    handleClose();
    try {
      const fetched = await request(`api/notes/${noteId}`, "DELETE", null, {
        Authorization: `Bearer ${token}`,
      });
      // @ts-ignore
      if (fetched) {
        fetchNotes();
      }
    } catch (e) {}
  }, [noteId, request, token, fetchNotes]);

  return (
    <div className={classes.root}>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
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
        <MenuItem key="delete" onClick={deleteNote}>
          <DeleteForeverIcon color="primary" />
          Delete note
        </MenuItem>
        <MenuItem key="copy" onClick={handleClose}>
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
