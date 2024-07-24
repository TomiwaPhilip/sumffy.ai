"use client";

import Image from "next/image";
import { useSession } from "../shared/session";
import { IntroCards } from "../shared/reusables";
import { CardData } from "@/constants/cards";
import Chat from "../forms/chat/ChatForm"; // Assuming ChatForm is where Chat component is defined

interface HomeProps {
  chatId?: string; // Define chatId as an optional prop
}

export default function Home({ chatId }: HomeProps) {
  const session = useSession();
  const firstName = session?.firstName;
  const lastName = session?.lastName;

  return (
    <div className="">
      <div className="flex flex-col items-start justify-center gap-4 sm:flex-row sm:gap-10 mt-10">
        <div className="">
          <h1 className="text-gradient text-[36px] font-extrabold">
            Hello, {firstName} {lastName}
          </h1>
          <p className="text-[24px] text-[#A1A3B0] font-semibold">
            How are you doing today?
          </p>
        </div>
        <div className="">
          <button className="bg-[#4B37BF] text-[24px] font-semibold flex items-center justify-center gap-3 p-2 rounded-xl">
            <Image
              src={"/assets/icons/menu_open.svg"}
              alt="menu"
              height={50}
              width={50}
            />
            Suggestions
          </button>
        </div>
      </div>
      <div className="flex flex-col items-start justify-center gap-4 sm:flex-row sm:gap-10 mt-10">
        {CardData.map((card, index) => (
          <IntroCards
            key={index}
            headingText={card.headingText}
            paragraph={card.paragraph}
          />
        ))}
      </div>
      <div className="mt-10">
        <Chat chatId={chatId} /> {/* Pass chatId as a prop to Chat component */}
      </div>
    </div>
  );
}
