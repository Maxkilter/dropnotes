import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { chatRoles } from "./openai";

import "../styles/ChatNotePreviewStyles.scss";

const useStyles = makeStyles({
  body1: {
    lineHeight: 1.2,
  },
});

export const ChatNotePreview = ({ messages, title }) => {
  const classes = useStyles();
  return (
    <div className="chat-note-pveview-wrapper">
      <div className="chat-note-pveview-title">
        <Typography
          classes={{ body1: classes.body1 }}
          variant="body1"
          align="center"
        >
          {title}
        </Typography>
      </div>
      <div className="chat-note-preview-container">
        <div className="chat-note-preview-messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === chatRoles.USER
                  ? "chat-note-preview-message"
                  : "chat-note-preview-message bot-message"
              }
            >
              <div>{message.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
