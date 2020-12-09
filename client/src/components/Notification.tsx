import React, { memo } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { NotificationProps } from "../types";

const VERTICAL = "top";
const HORIZONTAL = "center";
const DURATION = 4000;

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={7} variant="standard" {...props} />;
};

const Notification = (props: NotificationProps) => {
  const { isOpen, setIsOpen, message, severity } = props;

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setIsOpen({ ...props, isOpen: false });
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: VERTICAL, horizontal: HORIZONTAL }}
      open={isOpen}
      onClose={handleClose}
      autoHideDuration={DURATION}
    >
      <Alert severity={severity} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default memo(Notification);
