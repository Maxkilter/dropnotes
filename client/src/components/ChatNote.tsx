import React, { memo, useContext, useState, useEffect, useRef } from "react";
import {
  TextField,
  makeStyles,
  DialogContent,
  DialogActions,
  Dialog,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import {
  Send as SendIcon,
  Mic as MicIcon,
  VolumeUp,
  VolumeOff,
} from "@material-ui/icons";
import { Loader } from "./Loader";
import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";
import { TransitionComponent } from "./TransitionComponent";
import { useNoteAction } from "../hooks";
import { LoaderTypes } from "../types";
import { StoreContext } from "../appStore";
import { Buffer } from "buffer";
import { ChatNoteProps } from "../types";
import LanguageDetect from "languagedetect";
import MicRecorder from "mic-recorder-to-mp3";

import "../styles/ChatNoteStyles.scss";

const defaultChatTitle = "New Chat Note";
const lngDetector = new LanguageDetect();
const recorder = new MicRecorder({
  bitRate: 128,
});

const isiOS = window.navigator.userAgent.match(/iOS/i);

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
    padding: "2px 16px",
  },
  paper: {
    width: "100%",
  },
});

export const chatRoles = {
  ASSISTANT: "assistant",
  USER: "user",
  SYSTEM: "system",
};

const defineLanguage = (message: string): string => {
  const detectResults = lngDetector.detect(message, 1);
  return detectResults[0] ? detectResults[0][0] : "english";
};

const createChatTitleRequest = (message: string) =>
  `Create the title of this chat in ${defineLanguage(
    message
  )} language. The title should indicate what was discussed in the chat.`;

export const ChatNote = memo(
  ({
    isOpen,
    setIsChatNoteOpen,
    title: originTitle = defaultChatTitle,
    body = [],
    id = "",
  }: ChatNoteProps) => {
    const [query, setQuery] = useState("");
    const [chatTitle, setChatTitle] = useState(originTitle);
    const [messages, setMessages] = useState<ChatNoteProps["body"]>(body);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlayerDisplayed, setIsPlayerDisplayed] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isMessageAutoPlay, setIsMessageAutoPlay] = useState(
      localStorage.getItem("isMessageAutoPlay") === "true"
    );
    const audioPlayer = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      const isAutoPlay = localStorage.getItem("isMessageAutoPlay");
      if (isAutoPlay) {
        setIsMessageAutoPlay(isAutoPlay === "true");
      }
    }, []);

    const {
      createNote,
      updateNote,
      fetchNotes,
      isLoading,
      chatRequest,
      voiceToTextRequest,
      textToSpeechRequest,
    } = useNoteAction();
    const { setNotification } = useContext(StoreContext);
    const classes = useStyles();
    const isNewChatNote = !id;

    const createVoiceMessage = async (text: string) => {
      const lang = defineLanguage(text);
      const response = await textToSpeechRequest({ text, lang });
      const audio = Buffer.from(response, "base64");
      const blob = new Blob([audio], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      if (url) {
        setAudioUrl(url);
        setIsPlayerDisplayed(true);
      }
    };

    const toggleMessageAutoPlay = () => {
      const updatedValue = !isMessageAutoPlay;
      setIsMessageAutoPlay(updatedValue);
      localStorage.setItem("isMessageAutoPlay", updatedValue.toString());
    };

    const handleSendRequest = async (
      shouldCreateTitle: boolean,
      voiceQuery?: string
    ): Promise<string | void> => {
      let response;
      let newMessage;

      if (shouldCreateTitle) {
        if (messages) {
          response = await chatRequest([
            ...messages,
            {
              role: chatRoles.USER,
              content: createChatTitleRequest(
                messages[messages.length - 1].content
              ),
            },
          ]);
        }
      }

      if (!isEmpty(voiceQuery) || !isEmpty(query.trim())) {
        newMessage = {
          role: chatRoles.USER,
          content: voiceQuery ? voiceQuery : query,
        };
        if (messages) {
          setMessages([...messages, newMessage]);
          setQuery("");

          response = await chatRequest([
            ...messages,
            {
              role: chatRoles.USER,
              content: newMessage.content,
            },
          ]);
        }
      }

      if (response) {
        return shouldCreateTitle
          ? response.content
          : (() => {
              if (messages) {
                setMessages([
                  ...messages,
                  newMessage,
                  {
                    role: chatRoles.ASSISTANT,
                    content: response.content,
                  },
                ] as ChatNoteProps["body"]);
                createVoiceMessage(response.content);
              }
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
      audioPlayer?.current?.pause();
      recorder.start();
      setAudioUrl(null);
      setIsRecording(true);
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
          const formData = new FormData();
          formData.append("audio", audioFile);
          const voiceQuery = await voiceToTextRequest(formData);
          if (voiceQuery) {
            await handleSendRequest(false, voiceQuery);
          }
        }
      } catch (error) {
        console.error("Error while recording: ", error);
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
                {messages?.map((message, index) => (
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
                  disabled={isLoading || isRecording}
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
                  {query && (
                    <IconButton
                      onClick={() => handleSendRequest(false)}
                      disabled={isLoading}
                    >
                      <SendIcon classes={{ root: classes.iconRoot }} />
                    </IconButton>
                  )}
                  {!query &&
                    (isRecording ? (
                      <IconButton onClick={stopRecording}>
                        <div className="stop-recording-btn" />
                      </IconButton>
                    ) : (
                      <IconButton onClick={startRecording} disabled={isLoading}>
                        <MicIcon classes={{ root: classes.iconRoot }} />
                      </IconButton>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions classes={{ root: classes.actionsRoot }}>
          {!isiOS && (
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
          )}
          {isLoading ? (
            <div className="chat-note-loader-wrapper">
              <Loader type={LoaderTypes.linear} />
            </div>
          ) : (
            <div
              className={`audio-player-wrapper ${
                isPlayerDisplayed && "active"
              }`}
            >
              <audio
                ref={audioPlayer}
                style={{ width: "100%", height: "18px" }}
                controls
                src={audioUrl as string}
                autoPlay={isMessageAutoPlay && !!audioUrl && !isiOS}
              />
            </div>
          )}
          <button
            className="edit-note-button"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
    );
  }
);