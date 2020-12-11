import React, { useContext } from "react";
import notesImage from "../images/notes.png";
import Typography from "@material-ui/core/Typography";
import { StoreContext } from "../appStore";

import "../styles/NoNotesPlaceholderStyles.scss";

const noNotesText = "Notes you add appear here";
const noNotesFoundText = "No matching results";

const NoNotesPlaceholder = () => {
  const { isNoMatching } = useContext(StoreContext);

  return (
    <div className="no-notes-placeholder">
      {!isNoMatching && (
        <img className="notes-image" src={notesImage} alt="background-notes" />
      )}
      <Typography
        className="no-notes-text"
        variant="body2"
        color="textSecondary"
      >
        {isNoMatching ? noNotesFoundText : noNotesText}
      </Typography>
    </div>
  );
};

export default NoNotesPlaceholder;
