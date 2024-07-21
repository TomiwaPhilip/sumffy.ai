import React, { useEffect, useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import Image from "next/image";
import {
  MessageComponent,
  MessageComponentLoading,
  StatusMessage,
} from "@/components/shared/reusables";
import {
  fetchChatMessages,
  findPOIsForUser,
} from "@/server/actions/chat/chat.action"; // Import the server action
import {
  saveMessage,
  sendMessageToSumffy,
} from "@/server/actions/chat/chat.action";
import { upload } from "@vercel/blob/client";
import axios from "axios";

export type Message = {
  text?: string;
  type: "text" | "audio";
  audioUrl?: string;
  userType: "ai" | "user";
};

interface ChatProps {
  chatId?: string;
}

const Chat: React.FC<ChatProps> = ({ chatId }) => {
  const [inputText, setInputText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState(false);
  const [isError, setIsError] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId)
        .then((messages) => setMessages(messages))
        .catch((error) => {
          console.error("Failed to fetch chat messages:", error);
          // Handle the error here, e.g., show an error message to the user
          setIsError(true);
          setStatusMessage("Error fetching messages! Try again.");
        });
    }
  }, [chatId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const uploadAudio = async (blob: Blob) => {
    try {
      const newBlob = await upload("audiorecording.webm", blob, {
        access: "public",
        handleUploadUrl: "/api/avatar/upload",
        contentType: "webm",
      });

      if (newBlob.url) {
        return newBlob.url;
      } else {
        console.error("Upload failed");
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setIsError(true);
      setStatusMessage("Unable to upload audio");
      throw error; // Re-throw the error to handle it in the calling function
    }
  };

  const addAudioMessage = async (blob: Blob) => {
    setDisable(true);
    try {
      const audioUrl = await uploadAudio(blob);
      console.log("Generated Blob URL:", audioUrl);

      const ipResponse = await axios.get(
        "https://sumffy-ai.vercel.app/api/ip-address",
      );
      const userIp = ipResponse.data.ip;
      const userMetaData = await findPOIsForUser(userIp);

      if (userMetaData) {
        if (chatId) {
          const message = await saveMessage({
            chatId,
            text: "Audio message",
            type: "audio",
            audioUrl,
            userType: "user",
          });

          if (message) {
            setMessages((prevMessages) => [...prevMessages, message]);
            setMessageLoading(true);

            const reply = await sendMessageToSumffy({
              chatId,
              audioUrl: message?.audioUrl,
              type: "text",
              userType: "ai",
              userMetaData: userMetaData,
            });

            if (reply) {
              setMessageLoading(false);
              setMessages((prevMessages) => [...prevMessages, reply]);
            } else {
              setMessageLoading(false);
              setIsError(true);
              setStatusMessage("Failed to get Sumffy reply.");
              throw new Error("Failed to get Sumffy reply.");
            }
          } else {
            setIsError(true);
            setStatusMessage("Failed to save audio message.");
            throw new Error("Failed to save audio message.");
          }
        }
      }
    } catch (error) {
      console.error("Failed to handle audio message:", error);
      // Handle the error here, e.g., show an error message to the user
      setIsError(true);
      setStatusMessage("Failed to handle audio message.");
    } finally {
      setIsRecording(false);
      setDisable(false);
    }
  };

  const sendMessage = async () => {
    setDisable(true);
    if (inputText.trim() !== "") {
      try {
        const ipResponse = await axios.get(
          "https://sumffy-ai.vercel.app/api/ip-address",
        );
        const userIp = ipResponse.data.ip;
        const userMetaData = await findPOIsForUser(userIp);

        if (userMetaData) {
          if (chatId) {
            const message = await saveMessage({
              chatId,
              text: inputText,
              type: "text",
              userType: "user",
            });

            if (message) {
              setMessages((prevMessages) => [...prevMessages, message]);
              setInputText("");

              setMessageLoading(true);

              const reply = await sendMessageToSumffy({
                chatId,
                userMessage: message?.text,
                type: "text",
                userType: "ai",
                userMetaData: userMetaData,
              });

              if (reply) {
                setMessageLoading(false);
                setMessages((prevMessages) => [...prevMessages, reply]);
                setDisable(false);
              } else {
                setMessageLoading(false);
                setIsError(true);
                setDisable(true);
                setStatusMessage("Failed to get Sumffy reply.");
                throw new Error("Failed to get Sumffy reply.");
              }
            } else {
              setIsError(true);
              setDisable(true);
              setStatusMessage("Failed to save text message.");
              throw new Error("Failed to save text message.");
            }
          }
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        // Handle the error here, e.g., show an error message to the user
        setIsError(true);
        setStatusMessage("Failed to send message.");
      }
    }
  };

  return (
    <>
      <div className="flex flex-col gap-10">
        <div className="flex-1 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="mb-4">
              <MessageComponent
                message={msg.text || "Audio message"}
                userType={msg.userType}
                messageType={msg.type}
                audioUrl={msg.audioUrl}
              />
            </div>
          ))}
          {messageLoading && (
            <div className="mb-4">
              <MessageComponentLoading />
            </div>
          )}
        </div>
        <div className="relative">
          {!isRecording ? (
            <>
              <textarea
                className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                placeholder="Type your message..."
                value={inputText}
                onChange={handleTextChange}
              />
              <button
                className="absolute right-3 top-3 text-white p-2"
                onClick={inputText ? sendMessage : undefined}
                disabled={disable}
              >
                {inputText ? (
                  <Image
                    src="/assets/icons/sumffy.svg"
                    alt="send_icon"
                    height={40}
                    width={40}
                  />
                ) : (
                  <AudioRecorder
                    onRecordingComplete={addAudioMessage}
                    audioTrackConstraints={{
                      noiseSuppression: true,
                      echoCancellation: true,
                    }}
                    classes={{
                      AudioRecorderClass:
                        "bg-[#7F69FF] border-[#7F69FF] text-white",
                      AudioRecorderStartSaveClass:
                        "bg-[#7F69FF] text-white p-2 rounded-xl border-[#7F69FF]",
                      AudioRecorderPauseResumeClass:
                        "bg-[#7F69FF] text-white p-2 rounded-xl border-[#7F69FF]",
                      AudioRecorderTimerClass: "text-white",
                      AudioRecorderStatusClass: "text-white",
                      AudioRecorderDiscardClass: "text-white",
                    }}
                  />
                )}
              </button>
            </>
          ) : null}
        </div>
      </div>
      {notification === true && (
        <StatusMessage type="success" message={statusMessage} />
      )}
      {isError === true && (
        <StatusMessage type="error" message={statusMessage} />
      )}
    </>
  );
};

export default Chat;
