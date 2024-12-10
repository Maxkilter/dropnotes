import React, { useEffect, useState } from "react";
import {
  Backdrop,
  CircularProgress,
  useMediaQuery,
  LinearProgress,
} from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { LoaderProps, LoaderTypes } from "../types";

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
    dots: {
      position: "fixed",
      top: 120,
      left: 34,
      color: "#757575",
      fontSize: 14,
    },
    mobileDots: {
      position: "fixed",
      top: 70,
      left: 10,
      color: "#757575",
      fontSize: 10,
    },
    circular: {
      position: "absolute",
      left: 1,
    },
  })
);

export const DotsProgress = ({ text }: { text: string }) => {
  const [dots, setDots] = useState(1);
  const classes = useStyles();
  const matches = useMediaQuery("(max-width:415px)");

  useEffect(() => {
    const interval = setInterval(() => {
      return setDots(dots === 3 ? 0 : dots + 1);
    }, 300);
    return function cleanup() {
      clearInterval(interval);
    };
  }, [dots, setDots]);

  const movingDots = dots === 0 ? "" : ".".repeat(dots);
  return (
    <span
      data-testid="dots-loader"
      className={matches ? classes.mobileDots : classes.dots}
    >{`${text}${movingDots}`}</span>
  );
};

export const Loader = ({ type }: LoaderProps) => {
  const classes = useStyles();

  if (type === LoaderTypes.darken) {
    return (
      <Backdrop className={classes.backdrop} open>
        <CircularProgress color="inherit" size={70} thickness={2} />
      </Backdrop>
    );
  }

  if (type === LoaderTypes.linear) {
    return (
      <div className={classes.linear}>
        <LinearProgress color="primary" />
      </div>
    );
  }

  if (type === LoaderTypes.circular) {
    return (
      <CircularProgress
        size={28}
        className={classes.circular}
        color="primary"
      />
    );
  }

  return <DotsProgress text="Loading" />;
};
