import React, { useContext } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { StoreContext } from "../appStore";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      backgroundColor: theme.palette.background.default,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 3, 2),
    },
  })
);

const ModalDialog = ({
  children,
  onOutsideClick,
}: {
  children: any;
  onOutsideClick: () => {};
}) => {
  const classes = useStyles();
  const { isModalOpen, setIsModalOpen } = useContext(StoreContext);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={isModalOpen}
      onClose={handleClose}
      onBackdropClick={onOutsideClick}
      disableBackdropClick
      disableEscapeKeyDown
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      // disableRestoreFocus
      disablePortal
    >
      <Fade in={isModalOpen}>
        <div className={classes.paper}>{children}</div>
      </Fade>
    </Modal>
  );
};

export default ModalDialog;
