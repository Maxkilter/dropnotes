import React from "react";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      // color: "#fff",
      color: "#3f51b5",
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
        <Backdrop className={classes.backdrop} open invisible={darken}>
          <CircularProgress color="inherit" size={70} thickness={2} />
        </Backdrop>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      )}
    </>
  );
};

export default Loader;
