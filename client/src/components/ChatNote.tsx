// @ts-nocheck
import React, { useState, memo, useContext } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import { DialogContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import Loader from "./Loader";
import isEqual from "lodash/isEqual";
import { TransitionComponent } from "./TransitionComponent";
import { openai } from "./openai";
import { useNoteAction } from "../hooks";
import { LoaderTypes } from "../types";
import { isEmpty } from "lodash";
import { isAssistant } from "./ChatNotePreview";
import { StoreContext } from "../appStore";
import LanguageDetect from "languagedetect";
import { ChatRoles } from "../types";

import "../styles/ChatNoteStyles.scss";

const defaultChatTitle = "New Chat Note";
const lngDetector = new LanguageDetect();

const useStyles = makeStyles({
  chatTitleInput: {
    fontWeight: 600,
  },
  iconRoot: {
    width: "0.8em",
    height: "0.8em",
    fontSize: "1.4rem",
    color: "white",
  },
  actionsRoot: {
    padding: "8px 16px",
  },
});

const createChatTitleRequest = (messages) =>
  `Create the title of this chat in ${
    lngDetector.detect(messages[messages.length - 1].content, 1)[0][0]
  } language. The title should indicate what was discussed in the chat.`;

const ChatNote = ({
  isOpen,
  setIsChatNoteOpen,
  title: originTitle = defaultChatTitle,
  body = [],
  id = "",
}) => {
  const [query, setQuery] = useState("");
  const [chatTitle, setChatTitle] = useState(originTitle);
  const [messages, setMessages] = useState(body);
  const [isChatRequestProcessing, setIsChatRequestProcessing] = useState(false);
  const { createNote, updateNote, fetchNotes, isLoading } = useNoteAction();
  const { setNotification } = useContext(StoreContext);

  const classes = useStyles();

  const isNewChatNote = isEmpty(id);

  const handleSendMessage = async (shouldCreateTitle) => {
    let response;
    let newMessage;

    if (shouldCreateTitle) {
      setIsChatRequestProcessing(true);
      response = await openai.chat([
        ...messages,
        {
          role: ChatRoles.user,
          content: createChatTitleRequest(messages),
        },
      ]);
      !!response && setIsChatRequestProcessing(false);
    }

    if (!isEmpty(query.trim())) {
      newMessage = {
        role: ChatRoles.user,
        content: query,
      };
      setMessages([...messages, newMessage]);
      setQuery("");
      setIsChatRequestProcessing(true);
      response = await openai.chat([
        ...messages,
        {
          role: ChatRoles.user,
          content: newMessage.content,
        },
      ]);
      !!response && setIsChatRequestProcessing(false);
    }

    if (response) {
      return shouldCreateTitle
        ? response.content
        : setMessages([
            ...messages,
            newMessage,
            {
              role: ChatRoles.assistant,
              content: response.content,
            },
          ]);
    } else {
      setNotification({
        isOpen: true,
        message: "Something went wrong, please try again later. 🤔",
        severity: "error",
      });
      setIsChatNoteOpen(false);
    }
  };

  const shouldUpdateChatNote =
    !isEqual(chatTitle.trim(), originTitle) || !isEqual(messages, body);

  const onClose = async () => {
    const body = JSON.stringify(messages);

    if (shouldUpdateChatNote) {
      if (isNewChatNote) {
        const title = await handleSendMessage(true);
        // AI generate title wrapped in quotes
        const formattedTitle = title?.replace(/"/g, "");
        const newNote = await createNote(formattedTitle, body);
        if (newNote) await fetchNotes();
      } else {
        const updatedNote = await updateNote(id, chatTitle, body);
        if (updatedNote) await fetchNotes();
      }
    }

    return !isLoading && setIsChatNoteOpen(false);
  };

  return (
    <Dialog open={isOpen} TransitionComponent={TransitionComponent}>
      <DialogContent dividers>
        <div className="chat-wrapper">
          <div className="chat-header">
            <div className="chat-note-title">
              <TextField
                fullWidth
                InputProps={{ classes: { input: classes.chatTitleInput } }}
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                disabled={isNewChatNote}
              />
            </div>
          </div>
          <div className="chat-body">
            <div className="messages-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    !isAssistant(message.role) ? "bot-message" : ""
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
            <div className="input-container">
              <TextField
                autoFocus
                placeholder="Type your message here..."
                variant="outlined"
                multiline
                maxRows={6}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
                size="small"
              />
              <div className="send-query-btn">
                <IconButton
                  color="inherit"
                  disabled={isEmpty(query)}
                  onClick={() => handleSendMessage(false)}
                >
                  <SendIcon classes={{ root: classes.iconRoot }} />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions classes={{ root: classes.actionsRoot }}>
        {(isLoading || isChatRequestProcessing) && (
          <div className="loader-wrapper">
            <Loader type={LoaderTypes.linear} />
          </div>
        )}
        <div className="edit-note-button" role="button" onClick={onClose}>
          Close
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default memo(ChatNote);
