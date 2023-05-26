// @ts-nocheck
import React, { useState, memo } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import { DialogContent } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import MicIcon from "@material-ui/icons/Mic";
import Loader from "./Loader";
import chatGPTicon from "../images/chatGPT_logo.png";
import isEqual from "lodash/isEqual";
import { TransitionComponent } from "./TransitionComponent";
import { openai } from "./openai";
import { useNoteAction } from "../hooks";
import { LoaderTypes } from "../types";
import { isEmpty } from "lodash";

import "../styles/ChatNoteStyles.scss";

const ChatNote = ({
  isOpen,
  setIsChatNoteOpen,
  title: originTitle = "",
  body = [],
  id = "",
}) => {
  const [query, setQuery] = useState("");
  const [chatTitle, setChatTitle] = useState(originTitle);
  const [messages, setMessages] = useState(body);
  const { createNote, updateNote, fetchNotes, isLoading } = useNoteAction();

  const isNewChatNote = isEmpty(id);
  const isAudioQuery = !!query;
  const isAssistent = (role) => role === openai.roles.ASSISTANT;

  const handleSendMessage = async () => {
    if (query.trim() !== "") {
      const newMessage = {
        role: openai.roles.USER,
        content: query,
      };
      setMessages([...messages, newMessage]);
      setQuery("");
      const response = await openai.chat([
        ...messages,
        {
          role: openai.roles.USER,
          content: newMessage.content,
        },
      ]);
      setMessages([
        ...messages,
        newMessage,
        {
          role: openai.roles.ASSISTANT,
          content: response.content,
        },
      ]);
    }
  };

  const shouldUpdateChatNote =
    !isEqual(chatTitle.trim(), originTitle) || !isEqual(messages, body);

  const onClose = async () => {
    const body = JSON.stringify(messages);

    if (shouldUpdateChatNote) {
      if (isNewChatNote) {
        const newNote = await createNote(chatTitle, body);
        if (newNote) await fetchNotes();
      } else {
        const updatedNote = await updateNote(id, chatTitle, body);
        if (updatedNote) await fetchNotes();
      }
    }

    return !isLoading && setIsChatNoteOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} TransitionComponent={TransitionComponent}>
        <DialogContent dividers>
          <div className="chat-wrapper">
            <div className="chat-header">
              <img
                className="chat-gpt-icon"
                src={chatGPTicon}
                alt="chat GPT icon"
              />
              <div className="text-wrapper">
                ChatGPT may produce inaccurate information about people, places,
                or facts.
              </div>
            </div>
            <div className="chat-container">
              <div className="messages-container">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${
                      !isAssistent(message.role) ? "bot-message" : ""
                    }`}
                  >
                    <div>{message.content}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="input-container">
              <TextField
                autoFocus
                placeholder="Type your message here..."
                variant="outlined"
                multiline
                rowsMax={8}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
              />
              <div className="send-query-btn">
                <IconButton color="inherit" onClick={handleSendMessage}>
                  {isAudioQuery ? <SendIcon /> : <MicIcon />}
                </IconButton>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          {isLoading && (
            <div className="loader-wrapper">
              <Loader type={LoaderTypes.linear} />
            </div>
          )}
          <div className="edit-note-button" role="button" onClick={onClose}>
            Close
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(ChatNote);
