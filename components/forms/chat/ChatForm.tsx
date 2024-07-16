import React, { useState } from "react";
import { AudioRecorder } from 'react-audio-voice-recorder';
import Image from "next/image";
import { upload } from "@vercel/blob/client";

type Message = {
  text?: string;
  type: "text" | "audio";
  audioUrl?: string;
};

const Chat: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const uploadAudio = async (blob: Blob) => {
    // Replace with your actual upload URL and fetch logic
    try {
      const newBlob = await upload("audiorecording.webm", blob, {
        access: 'public',
        handleUploadUrl: '/api/avatar/upload',
        contentType: 'webm',
      });

      if (newBlob.url) {
        return newBlob.url; // Assuming the response contains the uploaded file URL
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const addAudioMessage = async (blob: Blob) => {
    const audioUrl = await uploadAudio(blob);
    console.log('Generated Blob URL:', audioUrl); // Log the Blob URL
    setMessages(prevMessages => [...prevMessages, { type: 'audio', audioUrl }]);
    setIsRecording(false);
  };

  const sendMessage = () => {
    if (inputText.trim() !== "") {
      setMessages([...messages, { text: inputText, type: "text" }]);
      setInputText("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4">
            {msg.type === "text" ? (
              <div className="p-3 rounded-lg bg-blue-500 text-white">
                {msg.text}
              </div>
            ) : (
              <audio controls src={msg.audioUrl} className="w-full">
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ))}
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
              className="absolute right-3 top-3 bg-blue-500 text-white p-2 rounded-full"
              onClick={inputText ? sendMessage : undefined}
            >
              {inputText ? (
                <Image
                  src="/assets/icons/sumffy.svg"
                  alt="send_icon"
                  height={20}
                  width={20}
                />
              ) : (
                <AudioRecorder
                  onRecordingComplete={addAudioMessage}
                  audioTrackConstraints={{
                    noiseSuppression: true,
                    echoCancellation: true,
                  }}
                  classes={{
                    AudioRecorderStartSaveClass: "bg-blue-500 text-white p-2 rounded-full",
                    AudioRecorderPauseResumeClass: "bg-blue-500 text-white p-2 rounded-full",
                    AudioRecorderStatusClass: "text-white",
                  }}
                />
              )}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Chat;
