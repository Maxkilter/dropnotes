import React, { useCallback, useState } from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import NoteMenu from "./NoteMenu";
import EditNote from "./EditNote";
import { makeStyles } from "@material-ui/core/styles";
import { NoteProps } from "../types";

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
    wordBreak: "break-word",
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

const Note = ({ note }: { note: NoteProps }) => {
  const { title, body, _id: id } = note;
  const classes = useStyles();
  const [isEdit, setIsEdit] = useState(false);

  const editNote = useCallback(() => setIsEdit(true), []);

  return (
    <>
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
        <div className={classes.noteBottom}>
          <div className={classes.dateWrapper}>
            <span>Created: </span>
            <span>{new Date(note.date).toLocaleString()}</span>
          </div>
          <div>
            <NoteMenu id={id} title={title} body={body} />
          </div>
        </div>
      </Card>
      {isEdit && (
        <EditNote
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          id={id}
          title={title}
          body={body}
        />
      )}
    </>
  );
};

export default Note;
