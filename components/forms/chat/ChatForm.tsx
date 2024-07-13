import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Message = {
  text?: string;
  type: "text" | "audio";
  audioUrl?: string;
};

const Chat: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              setAudioChunks(prev => [...prev, e.data]);
            }
          };
  
          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('Generated Blob URL:', audioUrl); // Log the Blob URL
            setMessages(prevMessages => [...prevMessages, { type: 'audio', audioUrl }]);
            setAudioChunks([]);
          };
        })
        .catch(err => console.error("Error accessing media devices.", err));
    }
  }, [audioChunks, messages]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    if (mediaRecorder) {
      mediaRecorder.start();
    }
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    alert("Audio uploaded successfully!");
    console.log(messages)
  };

  const handleLongPress = () => {
    recordingTimeoutRef.current = setTimeout(() => {
      startRecording();
    }, 1000); // Start recording after 3 seconds
  };

  const handleMouseUp = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    if (isRecording) {
      stopRecording();
    }
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
          <textarea
            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
            placeholder="Type your message..."
            value={inputText}
            onChange={handleTextChange}
          />
        ) : (
          <div className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg flex items-center justify-between">
            <span className="text-[#E0E0E0]">Recording... {recordingDuration}s</span>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
        <button
          className="absolute right-3 top-3 bg-blue-500 text-white p-2 rounded-full"
          onMouseDown={handleLongPress}
          onMouseUp={handleMouseUp}
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
            <Image
              src="/assets/icons/mic.svg"
              alt="microphone_icon"
              height={20}
              width={20}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default Chat;