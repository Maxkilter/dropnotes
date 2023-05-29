// @ts-nocheck
import React from "react";
import { Typography } from "@material-ui/core";
import { ChatRoles } from "../types";

import "../styles/ChatNotePreviewStyles.scss";

export const isAssistent = (role) => role === ChatRoles.assistant;

export const ChatNotePreview = ({ messages, title }) => {
  title = "Very cheerfull title";
  return (
    <div className="chat-note-pveview-wrapper">
      <div className="chat-note-pveview-title">
        <Typography variant="body1" align="center">
          {title}
        </Typography>
      </div>
      <div className="chat-note-preview-container">
        <div className="chat-note-preview-messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-note-preview-message ${
                !isAssistent(message.role) ? "bot-message" : ""
              }`}
            >
              <div>{message.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
