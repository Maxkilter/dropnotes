import React, { useCallback, useContext } from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { StoreContext } from "../appStore";

const useStyles = makeStyles({
  root: {
    width: 250,
    marginRight: 24,
    marginBottom: 24,
  },
  content: {
    height: 330,
    overflowY: "scroll",
    margin: "12px 0",
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

  const { token, request, fetchNotes } = useContext(StoreContext);

  const onClick = useCallback(async () => {
    try {
      const fetched = await request(`api/notes/${_id}`, "DELETE", null, {
        Authorization: `Bearer ${token}`,
      });
      // @ts-ignore
      if (fetched) {
        fetchNotes();
      }
    } catch (e) {}
  }, [_id, request, token, fetchNotes]);

  return (
    <Card className={classes.root} onClick={onClick}>
      <CardActionArea>
        <CardContent className={classes.content}>
          {title && <Typography variant="h6">{title}</Typography>}
          <Typography variant="body1" color="primary" paragraph>
            {body}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default Note;
