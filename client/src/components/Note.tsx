import React, { useContext } from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import NoteMenu from "./NoteMenu";
import { makeStyles } from "@material-ui/core/styles";
import { StoreContext } from "../appStore";

const useStyles = makeStyles({
  root: {
    width: 250,
    margin: "0 16px 16px",
  },
  content: {
    height: 300,
    overflowY: "scroll",
  },
  noteBody: {
    whiteSpace: "pre-wrap",
  },
  noteBottom: {
    display: "flex",
    alignItems: "center",
    fontSize: 10,
  },
  dateWrapper: {
    flex: 2,
    textAlign: "center",
    color: "#757575",
  },
});

export interface NoteProps {
  _id: string;
  title?: string;
  body: string;
  date: string;
}

const Note = ({ note }: { note: NoteProps }) => {
  const { title, body, _id } = note;
  const classes = useStyles();

  const { setIsModalOpen, setEditNote } = useContext(StoreContext);

  const editNote = () => {
    setEditNote({ _id, title, body });
    setIsModalOpen(true);
  };

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardContent className={classes.content} onClick={editNote}>
          {title && <Typography variant="body1">{title}</Typography>}
          <Typography
            className={classes.noteBody}
            variant="body2"
            color="primary"
            paragraph
          >
            {body}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Typography className={classes.noteBottom}>
        <div className={classes.dateWrapper}>
          <span>Created: </span>
          <span>{new Date(note.date).toLocaleString()}</span>
        </div>
        <div>
          <NoteMenu note={note} />
        </div>
      </Typography>
    </Card>
  );
};

export default Note;
