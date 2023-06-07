// @ts-nocheck
import React, { useState, memo, useContext } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import { DialogContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import MicIcon from "@material-ui/icons/Mic";
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
import MicRecorder from "mic-recorder-to-mp3";
import { ChatRoles } from "../types";

import axios from "axios";
import { createWriteStream } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import "../styles/ChatNoteStyles.scss";

// const myDirname = dirname(fileURLToPath(import.meta.url));

const defaultChatTitle = "New Chat Note";
const lngDetector = new LanguageDetect();
const recorder = new MicRecorder({
  bitRate: 128,
});

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

const create = async (url) => {
  console.log("FIRE");
  try {
    const oggPath = resolve(__dirname, "../voices", `${new Date()}.mp3`);
    const response = await axios({
      method: "get",
      url,
      responseType: "stream",
    });
    return new Promise((resolve) => {
      const stream = createWriteStream(oggPath);
      response.data.pipe(stream);
      stream.on("finish", () => resolve(oggPath));
    });
  } catch (e) {
    console.error("Error while creating ogg: ", e.message);
  }
};

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
  const [isRecording, setIsRecording] = useState(false);
  const [isChatRequestProcessing, setIsChatRequestProcessing] = useState(false);
  const { createNote, updateNote, fetchNotes, isLoading } = useNoteAction();
  const { setNotification } = useContext(StoreContext);

  const classes = useStyles();

  const isNewChatNote = isEmpty(id);
  const isAudioQuery = isEmpty(query);

  const handleSendMessage = async (shouldCreateTitle) => {
    let response;
    let newMessage;

    const transcription = async (file) => {
      try {
        const response = await openai.createTranscription(file, "whisper-1");
        return response.data.text;
      } catch (e) {
        console.error("Error while transcription: ", e.message);
      }
    };

    if (isAudioQuery) {
      if (isRecording) {
        recorder
          .stop()
          .getMp3()
          .then(async ([buffer, blob]) => {
            // do what ever you want with buffer and blob
            // Example: Create a mp3 file and play
            const file = new File(buffer, "cheerful day.mp3", {
              type: blob.type,
              lastModified: Date.now(),
            });
            console.log(file, "FILE");
            const player = new Audio(URL.createObjectURL(file));
            console.log(player, "PLAYER");
            // player.play();
            await create(player.src);
            // const reader = new FileReader();
            // reader.onload = async function () {
            //   const fileContent = reader.result;
            //   const transcriptionResult = await openai.transcription(
            //     fileContent
            //   );
            //   console.log(transcriptionResult, "TRANSCRIPTION RESULT");
            // };
            // reader.onerror = function (error) {
            //   console.error("Error while reading the file: ", error);
            // };
            //
            // reader.readAsArrayBuffer(file);

            response = await openai.transcription(player.src);
          })
          .catch((e) => {
            alert("We could not retrieve your message");
            console.log(e);
          });
        setIsRecording(false);
      } else {
        setIsRecording(true);
        recorder
          .start()
          .then(() => {
            // something else
          })
          .catch((e) => {
            console.error(e);
          });
      }
    }

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

    console.log(response, "RESPONSE");

    // if (response) {
    //   return shouldCreateTitle
    //     ? response.content
    //     : setMessages([
    //         ...messages,
    //         newMessage,
    //         {
    //           role: ChatRoles.assistant,
    //           content: response.content,
    //         },
    //       ]);
    // } else {
    //   setNotification({
    //     isOpen: true,
    //     message: "Something went wrong, please try again later. 🤔",
    //     severity: "error",
    //   });
    //   setIsChatNoteOpen(false);
    // }
  };

  const shouldUpdateChatNote =
    !isEqual(chatTitle.trim(), originTitle) || !isEqual(messages, body);

  const onClose = async () => {
    const body = JSON.stringify(messages);

    if (shouldUpdateChatNote) {
      if (isNewChatNote) {
        const title = await handleSendMessage(true);
        // AI generate title wrapped in quotes
        const formattedTitle = title.replace(/"/g, "");
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
    <>
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
                    onClick={() => handleSendMessage(false)}
                  >
                    {!isAudioQuery ? (
                      <SendIcon classes={{ root: classes.iconRoot }} />
                    ) : (
                      <MicIcon classes={{ root: classes.iconRoot }} />
                    )}
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
    </>
  );
};

export default memo(ChatNote);
