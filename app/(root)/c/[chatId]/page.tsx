"use client";

import React, { useEffect, useState } from 'react';
import { findChatById } from '@/server/actions/chat/chat.action';
import Home from '@/components/pages/Home';

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

const ChatPage: React.FC<ChatPageProps> = ({ params }) => {
  const { chatId } = params;
  const [chatExists, setChatExists] = useState<boolean>(false);

  useEffect(() => {
    const checkChatExists = async () => {
      const chat = await findChatById(chatId);
      if (chat) {
        setChatExists(true);
      } else {
        setChatExists(false);
      }
    };

    checkChatExists();
  }, [chatId]);

  if (!chatExists) {
    return <div>Chat not found</div>;
  }

  return <Home chatId={chatId} />;
};

export default ChatPage;
