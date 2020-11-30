import React from "react";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { LinearProgress } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff",
    },
    linear: {
      width: "100%",
      "& > * + *": {
        marginTop: theme.spacing(2),
      },
      margin: "7px 0",
    },
  })
);

interface Props {
  darken?: boolean;
}

const Loader = (props: Props) => {
  const { darken } = props;
  const classes = useStyles();

  return (
    <>
      {darken ? (
        <Backdrop className={classes.backdrop} open>
          <CircularProgress color="inherit" size={70} thickness={2} />
        </Backdrop>
      ) : (
        <div className={classes.linear}>
          <LinearProgress color="primary" />
        </div>
      )}
    </>
  );
};

export default Loader;
