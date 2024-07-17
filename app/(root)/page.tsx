"use client";

import Home from "@/components/pages/Home";
import { createChat } from "@/server/actions/chat/chat.action";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {

  const router = useRouter();

  useEffect(() => {
    const createNewChat = async () => {
      try {
        const response = await createChat();

        if (response.chatId) {
          router.replace(`/c/${response.chatId}`);
        }
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    };

    createNewChat();
  }, [router]);

  return (
    <main className="">
      <Home />
    </main>
  );
}
