import React, { useCallback, useEffect, useState } from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import NoteMenu from "./NoteMenu";
import EditNote from "./EditNote";
import ChatNote from "./ChatNote";
import isEmpty from "lodash/isEmpty";
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
  const [isSimpleNoteOpen, setIsSimpleNoteOpen] = useState(false);
  const [isChatNoteOpen, setIsChatNoteOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    try {
      const messages = JSON.parse(body);
      return setChatMessages(messages);
    } catch (error) {}
  }, [body]);

  const isChat = !isEmpty(chatMessages);

  const openNote = useCallback(
    () => (isChat ? setIsChatNoteOpen(true) : setIsSimpleNoteOpen(true)),
    [isChat]
  );

  return (
    <>
      <Card className={classes.root}>
        <CardActionArea>
          <CardContent className={classes.content} onClick={openNote}>
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
      {isSimpleNoteOpen && (
        <EditNote
          isOpen={isSimpleNoteOpen}
          setIsSimpleNoteOpen={setIsSimpleNoteOpen}
          id={id}
          title={title}
          body={body}
        />
      )}
      {isChatNoteOpen && (
        <ChatNote
          isOpen={isChatNoteOpen}
          setIsChatNoteOpen={setIsChatNoteOpen}
          id={id}
          title={title}
          body={chatMessages}
        />
      )}
    </>
  );
};

export default Note;
