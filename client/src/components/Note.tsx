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
  },
  content: {
    height: 330,
    overflowY: "scroll",
    marginBottom: 12,
  },
});

export interface NoteProps {
  _id: string;
  title?: string;
  body: string;
}

const Note = (props: NoteProps) => {
  const { title, body, _id } = props;
  const classes = useStyles();

  const { setIsModalOpen, setEditNote } = useContext(StoreContext);

  const editNote = () => {
    setEditNote({ _id, title, body });
    setIsModalOpen(true);
  };

  return (
    <div>
      <Card className={classes.root} onClick={editNote}>
        <CardActionArea>
          <CardContent className={classes.content}>
            {title && <Typography variant="body1">{title}</Typography>}
            <Typography variant="body2" color="primary" paragraph>
              {body}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
      <NoteMenu noteId={_id} />
    </div>
  );
};

export default Note;
