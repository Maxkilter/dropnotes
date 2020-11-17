import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

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
  const { title, body } = props;
  const classes = useStyles();

  return (
    <Card className={classes.root}>
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
