import React, { memo, useContext, useState, useEffect, useRef } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import { DialogContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import MicIcon from "@material-ui/icons/Mic";
import { VolumeUp } from "@material-ui/icons";
import { VolumeOff } from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import Loader from "./Loader";
import isEqual from "lodash/isEqual";
import { TransitionComponent } from "./TransitionComponent";
import { chatRoles, openai } from "../openai.js";
import { useNoteAction } from "../hooks";
import { LoaderTypes } from "../types";
import { isEmpty } from "lodash";
import { StoreContext } from "../appStore";
import LanguageDetect from "languagedetect";
import MicRecorder from "mic-recorder-to-mp3";
import { textToSpeechConverter } from "../textToSpeechConverter.js";

import "../styles/ChatNoteStyles.scss";

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
  paper: {
    width: "100%",
  },
});

const defineLanguage = (message) => {
  const detectResults = lngDetector.detect(message, 1);
  return detectResults[0] ? detectResults[0][0] : "english";
};

const createChatTitleRequest = (message) =>
  `Create the title of this chat in ${defineLanguage(
    message
  )} language. The title should indicate what was discussed in the chat.`;

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
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayerDisplayed, setIsPlayerDisplayed] = useState(false);
  const [isMessageAutoPlay, setIsMessageAutoPlay] = useState(
    localStorage.getItem("isMessageAutoPlay") === "true"
  );
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    const isAutoPlay = localStorage.getItem("isMessageAutoPlay");
    if (isAutoPlay) {
      setIsMessageAutoPlay(isAutoPlay === "true");
    }
  }, []);

  const { createNote, updateNote, fetchNotes, isLoading } = useNoteAction();
  const { setNotification } = useContext(StoreContext);
  const classes = useStyles();
  const isNewChatNote = isEmpty(id);

  const createVoiceMessage = async (text) => {
    const voiceParameters = textToSpeechConverter.getVoiceParameters(
      defineLanguage(text)
    );
    if (voiceParameters) {
      const audio = await textToSpeechConverter.textToSpeech(
        text,
        voiceParameters
      );
      const blob = new Blob([audio], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      if (url) {
        setIsPlayerDisplayed(true);
        if (audioPlayerRef.current) audioPlayerRef.current.src = url;
        if (isMessageAutoPlay) audioPlayerRef.current.play();
      }
    }
  };

  const toggleMessageAutoPlay = () => {
    const updatedValue = !isMessageAutoPlay;
    setIsMessageAutoPlay(updatedValue);
    localStorage.setItem("isMessageAutoPlay", updatedValue.toString());
  };

  const handleSendRequest = async (shouldCreateTitle, voiceQuery) => {
    let response;
    let newMessage;

    if (shouldCreateTitle) {
      setIsChatRequestProcessing(true);
      response = await openai.chat([
        ...messages,
        {
          role: chatRoles.USER,
          content: createChatTitleRequest(
            messages[messages.length - 1].content
          ),
        },
      ]);
      !!response && setIsChatRequestProcessing(false);
    }

    if (!isEmpty(voiceQuery) || !isEmpty(query.trim())) {
      newMessage = {
        role: chatRoles.USER,
        content: voiceQuery ? voiceQuery : query,
      };
      setMessages([...messages, newMessage]);
      setQuery("");
      setIsChatRequestProcessing(true);
      response = await openai.chat([
        ...messages,
        {
          role: chatRoles.USER,
          content: newMessage.content,
        },
      ]);
      !!response && setIsChatRequestProcessing(false);
    }

    if (response) {
      return shouldCreateTitle
        ? response.content
        : (() => {
            setMessages([
              ...messages,
              newMessage,
              {
                role: chatRoles.ASSISTANT,
                content: response.content,
              },
            ]);
            createVoiceMessage(response.content);
          })();
    } else {
      setNotification({
        isOpen: true,
        message: "Something went wrong, please try again later. 🤔",
        severity: "error",
      });
      setIsChatNoteOpen(false);
    }
  };

  const startRecording = () => {
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "microphone" })
        .then(function (permissionStatus) {
          if (permissionStatus.state === "granted") {
            recorder.start();
            setIsRecording(true);
          } else if (permissionStatus.state === "prompt") {
            requestMicrophonePermission();
          } else {
            setNotification({
              isOpen: true,
              message: "Microphone access denied or unavailable.",
              severity: "error",
            });
          }

          permissionStatus.addEventListener("change", function () {
            console.log(
              "Microphone permission status changed to:",
              permissionStatus.state
            );

            if (permissionStatus.state === "granted") {
              recorder.start();
              setIsRecording(true);
            } else if (permissionStatus.state === "prompt") {
              requestMicrophonePermission();
            } else {
              setNotification({
                isOpen: true,
                message: "Microphone access denied or unavailable.",
                severity: "error",
              });
            }
          });
        })
        .catch(function (error) {
          console.error("Error checking microphone permission:", error);
        });
    } else {
      console.error("Permissions API is not supported in this browser.");
    }
  };

  const requestMicrophonePermission = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function () {
        startRecording();
      })
      .catch(function (error) {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      const [buffer, blob] = await recorder.stop().getMp3();
      const audioFile = new File(buffer, `${Date.now()}.mp3`, {
        type: blob.type,
        lastModified: Date.now(),
      });
      if (audioFile) {
        setIsChatRequestProcessing(true);
        const voiceQuery = await openai.transcription(audioFile);
        if (voiceQuery) {
          await handleSendRequest(false, voiceQuery);
          setIsChatRequestProcessing(false);
        }
      }
    } catch (e) {
      console.error("Error while recording: ", e.message);
    }
  };

  const shouldUpdateChatNote =
    !isEqual(chatTitle.trim(), originTitle) || !isEqual(messages, body);

  const onClose = async () => {
    const body = JSON.stringify(messages);

    if (shouldUpdateChatNote) {
      if (isNewChatNote) {
        const title = await handleSendRequest(true);
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
    <Dialog
      open={isOpen}
      TransitionComponent={TransitionComponent}
      classes={{ paper: classes.paper }}
    >
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
                  className={
                    message.role === chatRoles.USER
                      ? "message"
                      : "message bot-message"
                  }
                >
                  {message.content}
                </div>
              ))}
            </div>
            <div className="input-container">
              <TextField
                disabled={isLoading || isRecording || isChatRequestProcessing}
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
              <div className="send-query-btn-wrapper">
                {!isEmpty(query) && (
                  <IconButton onClick={() => handleSendRequest(false)}>
                    <SendIcon classes={{ root: classes.iconRoot }} />
                  </IconButton>
                )}
                {isEmpty(query) &&
                  (isRecording ? (
                    <IconButton onClick={stopRecording}>
                      <div className="stop-recording-btn" />
                    </IconButton>
                  ) : (
                    <IconButton onClick={startRecording}>
                      <MicIcon classes={{ root: classes.iconRoot }} />
                    </IconButton>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions classes={{ root: classes.actionsRoot }}>
        {isLoading || isChatRequestProcessing ? (
          <div className="loader-wrapper">
            <Loader type={LoaderTypes.linear} />
          </div>
        ) : (
          isPlayerDisplayed && (
            <div className="audio-player-wrapper">
              <Tooltip
                title={`Message Autoplay ${
                  isMessageAutoPlay ? "Enabled" : "Disabled"
                }`}
                placement="top-start"
                arrow
              >
                <IconButton onClick={toggleMessageAutoPlay} size="small">
                  {isMessageAutoPlay ? <VolumeUp /> : <VolumeOff />}
                </IconButton>
              </Tooltip>
              <audio
                style={{ width: "100%", height: "18px", marginLeft: "8px" }}
                controls
                src={null}
                ref={audioPlayerRef}
              />
            </div>
          )
        )}
        <button className="edit-note-button" onClick={onClose}>
          Close
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(ChatNote);
